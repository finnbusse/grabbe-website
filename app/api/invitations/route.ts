import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserRoleSlugs } from "@/lib/permissions"
import { isAdmin } from "@/lib/permissions-shared"
import { sendEmail } from "@/lib/email"
import { invitationEmailTemplate } from "@/lib/email-templates/invitation"
import { generateInvitationToken, guessFirstNameFromEmail } from "@/lib/invitation-tokens"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const CreateInvitationSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  roleId: z.string().uuid("Ungültige Rollen-ID"),
  personalMessage: z.string().max(200, "Persönliche Nachricht darf maximal 200 Zeichen lang sein").optional().nullable(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })

  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdmin(roleSlugs)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  // Use admin client for untyped invitations table
  const adminClient = createAdminClient()

  const { data: invitations, error } = await adminClient
    .from("invitations")
    .select("*, cms_roles(name)")
    .is("accepted_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch inviter profiles
  const inviterIds = [...new Set((invitations || []).map((inv: Record<string, unknown>) => inv.invited_by).filter(Boolean))] as string[]
  let inviterProfiles: Record<string, { first_name: string; last_name: string }> = {}

  if (inviterIds.length > 0) {
    const { data: profiles } = await adminClient
      .from("user_profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", inviterIds)

    if (profiles) {
      inviterProfiles = Object.fromEntries(
        (profiles as Array<{ user_id: string; first_name: string; last_name: string }>).map((p) => [p.user_id, p])
      )
    }
  }

  const enriched = (invitations || []).map((inv: Record<string, unknown>) => {
    const inviterProfile = inv.invited_by ? inviterProfiles[inv.invited_by as string] : null
    return {
      ...inv,
      inviter_name: inviterProfile
        ? `${inviterProfile.first_name} ${inviterProfile.last_name}`.trim()
        : null,
    }
  })

  return NextResponse.json({ invitations: enriched })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })

  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdmin(roleSlugs)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = CreateInvitationSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Ungültige Eingabe"
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { email, roleId, personalMessage } = parsed.data

  const adminClient = createAdminClient()

  // Check if email is already registered
  const { data: existingUsers } = await adminClient.auth.admin.listUsers()
  const alreadyRegistered = existingUsers?.users?.some(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )
  if (alreadyRegistered) {
    return NextResponse.json({ error: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits" }, { status: 409 })
  }

  // Check for existing pending invitation
  const { data: existing } = await adminClient
    .from("invitations")
    .select("id")
    .eq("email", email.toLowerCase())
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Es existiert bereits eine ausstehende Einladung für diese E-Mail-Adresse" }, { status: 409 })
  }

  // Fetch role name
  const { data: role } = await adminClient
    .from("cms_roles")
    .select("name")
    .eq("id", roleId)
    .single()

  if (!role) {
    return NextResponse.json({ error: "Rolle nicht gefunden" }, { status: 404 })
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

  // Generate token and expiry
  const token = generateInvitationToken()
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()

  // Store invitation
  const { data: invitation, error: insertError } = await adminClient
    .from("invitations")
    .insert({
      email: email.toLowerCase(),
      role_id: roleId,
      token,
      invited_by: user.id,
      personal_message: personalMessage || null,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Build onboarding URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabbe.site"
  const onboardingUrl = `${baseUrl}/onboarding?token=${token}`

  // Send invitation email
  const recipientFirstName = guessFirstNameFromEmail(email)
  const template = invitationEmailTemplate({
    recipientEmail: email,
    recipientFirstName,
    inviterName,
    roleName: (role as { name: string }).name,
    personalMessage: personalMessage || null,
    onboardingUrl,
  })

  const emailResult = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })

  if (!emailResult.success) {
    // Clean up invitation if email fails
    await adminClient.from("invitations").delete().eq("id", (invitation as { id: string }).id)
    return NextResponse.json({ error: `E-Mail konnte nicht gesendet werden: ${emailResult.error}` }, { status: 500 })
  }

  return NextResponse.json({ success: true, invitation })
}
