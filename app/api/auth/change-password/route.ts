import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Das Passwort muss mindestens 8 Zeichen lang sein."
  if (!/[A-Z]/.test(password)) return "Das Passwort muss mindestens einen Großbuchstaben enthalten."
  if (!/[a-z]/.test(password)) return "Das Passwort muss mindestens einen Kleinbuchstaben enthalten."
  if (!/\d/.test(password)) return "Das Passwort muss mindestens eine Zahl enthalten."
  if (!/[^A-Za-z0-9]/.test(password)) return "Das Passwort muss mindestens ein Sonderzeichen enthalten."
  return null
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert." },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => null)
    const { currentPassword, newPassword } = body || {}

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Bitte füllen Sie alle Felder aus." },
        { status: 400 }
      )
    }

    // Validate new password strength
    const pwError = validatePassword(newPassword)
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 })
    }

    // Verify current password by attempting to sign in
    const adminClient = createAdminClient()
    const { error: signInError } = await adminClient.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json(
        { error: "Das aktuelle Passwort ist falsch." },
        { status: 400 }
      )
    }

    // Update password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error("Password change error:", updateError)
      return NextResponse.json(
        { error: "Das Passwort konnte nicht geändert werden." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password API error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    )
  }
}
