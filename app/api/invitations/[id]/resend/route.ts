import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserRoleSlugs } from "@/lib/permissions"
import { isAdmin } from "@/lib/permissions-shared"
import { sendEmail } from "@/lib/email"
import { invitationEmailTemplate } from "@/lib/email-templates/invitation"
import { guessFirstNameFromEmail } from "@/lib/invitation-tokens"
import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })

  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdmin(roleSlugs)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  const adminClient = createAdminClient()

  // Fetch invitation
  const { data: invitation, error: fetchError } = await adminClient
    .from("invitations")
    .select("*, cms_roles(name)")
    .eq("id", id)
    .is("accepted_at", null)
    .single()

  if (fetchError || !invitation) {
    return NextResponse.json({ error: "Einladung nicht gefunden" }, { status: 404 })
  }

  const inv = invitation as Record<string, unknown>

  // Check if expired — if so, extend by 72 hours
  const isExpired = new Date(inv.expires_at as string) < new Date()
  if (isExpired) {
    const newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
    await adminClient
      .from("invitations")
      .update({ expires_at: newExpiry })
      .eq("id", id)
  }

  // Fetch inviter profile
  const { data: inviterProfile } = await adminClient
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .single()

  const inviterName = inviterProfile
    ? `${(inviterProfile as { first_name: string; last_name: string }).first_name} ${(inviterProfile as { first_name: string; last_name: string }).last_name}`.trim()
    : user.email || "Administrator"

  // Build onboarding URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabbe.site"
  const onboardingUrl = `${baseUrl}/onboarding?token=${inv.token as string}`

  const recipientFirstName = guessFirstNameFromEmail(inv.email as string)
  const roleName = (inv.cms_roles as { name: string } | null)?.name || "Mitglied"

  const template = invitationEmailTemplate({
    recipientEmail: inv.email as string,
    recipientFirstName,
    inviterName,
    roleName,
    personalMessage: (inv.personal_message as string | null) || null,
    onboardingUrl,
  })

  const emailResult = await sendEmail({
    to: inv.email as string,
    subject: template.subject,
    html: template.html,
  })

  if (!emailResult.success) {
    return NextResponse.json({ error: `E-Mail konnte nicht gesendet werden: ${emailResult.error}` }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
