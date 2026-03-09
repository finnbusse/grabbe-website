import { createAdminClient } from "@/lib/supabase/admin"
import { validateTokenSignature } from "@/lib/invitation-tokens"
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
    const body = await request.json().catch(() => null)
    const { token, uid, password } = body || {}

    if (!token || !uid || !password) {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 400 }
      )
    }

    // Validate token structure
    if (!validateTokenSignature(token)) {
      return NextResponse.json(
        { error: "Der Link zum Zurücksetzen des Passworts ist ungültig." },
        { status: 400 }
      )
    }

    // Validate password strength
    const pwError = validatePassword(password)
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Fetch user and verify token
    const { data: userData, error: fetchError } = await adminClient.auth.admin.getUserById(uid)

    if (fetchError || !userData?.user) {
      return NextResponse.json(
        { error: "Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen." },
        { status: 400 }
      )
    }

    const user = userData.user
    const storedToken = user.app_metadata?.password_reset_token
    const storedExpiry = user.app_metadata?.password_reset_expires

    // Verify token matches
    if (!storedToken || storedToken !== token) {
      return NextResponse.json(
        { error: "Der Link zum Zurücksetzen des Passworts ist ungültig oder wurde bereits verwendet." },
        { status: 400 }
      )
    }

    // Verify token is not expired
    if (storedExpiry && new Date(storedExpiry) < new Date()) {
      // Clean up expired token
      await adminClient.auth.admin.updateUserById(uid, {
        app_metadata: {
          ...user.app_metadata,
          password_reset_token: null,
          password_reset_expires: null,
        },
      })
      return NextResponse.json(
        { error: "Der Link zum Zurücksetzen des Passworts ist abgelaufen. Bitte fordern Sie einen neuen an." },
        { status: 400 }
      )
    }

    // Update password and clear the reset token
    const { error: updateError } = await adminClient.auth.admin.updateUserById(uid, {
      password,
      app_metadata: {
        ...user.app_metadata,
        password_reset_token: null,
        password_reset_expires: null,
      },
    })

    if (updateError) {
      console.error("Password reset error:", updateError)
      return NextResponse.json(
        { error: "Das Passwort konnte nicht geändert werden." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset API error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    )
  }
}
