import { createClient } from "@/lib/supabase/server"
import { getUserRoleSlugs } from "@/lib/permissions"
import { isAdmin } from "@/lib/permissions-shared"
import { sendEmail } from "@/lib/email"
import { testEmailTemplate } from "@/lib/email-templates/test"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const SendEmailSchema = z.object({
  type: z.literal("test"),
  to: z.string().email("Ungültige E-Mail-Adresse"),
})

export async function POST(request: NextRequest) {
  // Authenticate user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
  }

  // Check admin role
  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdmin(roleSlugs)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  // Validate input
  const body = await request.json().catch(() => null)
  const parsed = SendEmailSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Ungültige Eingabe"
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { type, to } = parsed.data

  // Generate email based on type
  if (type === "test") {
    const template = testEmailTemplate()
    const result = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  }

  return NextResponse.json({ error: "Unbekannter E-Mail-Typ" }, { status: 400 })
}
