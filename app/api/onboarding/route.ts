import { createAdminClient } from "@/lib/supabase/admin"
import { validateTokenSignature } from "@/lib/invitation-tokens"
import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token erforderlich" }, { status: 400 })
  }

  // Validate token signature
  if (!validateTokenSignature(token)) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data: invitation, error } = await adminClient
    .from("invitations")
    .select("id, email, role_id, personal_message, expires_at, accepted_at, created_at, cms_roles(id, name)")
    .eq("token", token)
    .single()

  if (error || !invitation) {
    return NextResponse.json({ error: "Einladung nicht gefunden" }, { status: 404 })
  }

  const inv = invitation as Record<string, unknown>

  // Check if already accepted
  if (inv.accepted_at) {
    return NextResponse.json({ error: "Diese Einladung wurde bereits angenommen" }, { status: 410 })
  }

  // Check if expired
  if (new Date(inv.expires_at as string) < new Date()) {
    return NextResponse.json({ error: "Diese Einladung ist abgelaufen" }, { status: 410 })
  }

  // Fetch inviter name
  let inviterName: string | null = null
  const { data: invitationFull } = await adminClient
    .from("invitations")
    .select("invited_by")
    .eq("token", token)
    .single()

  if (invitationFull && (invitationFull as { invited_by: string | null }).invited_by) {
    const { data: profile } = await adminClient
      .from("user_profiles")
      .select("first_name, last_name")
      .eq("user_id", (invitationFull as { invited_by: string }).invited_by)
      .single()

    if (profile) {
      inviterName = `${(profile as { first_name: string; last_name: string }).first_name} ${(profile as { first_name: string; last_name: string }).last_name}`.trim() || null
    }
  }

  return NextResponse.json({
    invitation: {
      id: inv.id,
      email: inv.email,
      role: inv.cms_roles,
      personalMessage: inv.personal_message,
      inviterName,
      expiresAt: inv.expires_at,
    },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 })
  }

  const { token, firstName, lastName, displayName, password } = body as {
    token: string
    firstName: string
    lastName: string
    displayName: string
    password: string
  }

  if (!token || !firstName || !lastName || !password) {
    return NextResponse.json({ error: "Alle Pflichtfelder müssen ausgefüllt sein" }, { status: 400 })
  }

  // Validate token signature
  if (!validateTokenSignature(token)) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 400 })
  }

  // Validate password requirements
  if (password.length < 8) {
    return NextResponse.json({ error: "Passwort muss mindestens 8 Zeichen lang sein" }, { status: 400 })
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return NextResponse.json({ error: "Passwort muss Groß- und Kleinbuchstaben enthalten" }, { status: 400 })
  }
  if (!/[0-9]/.test(password)) {
    return NextResponse.json({ error: "Passwort muss mindestens eine Zahl enthalten" }, { status: 400 })
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return NextResponse.json({ error: "Passwort muss mindestens ein Sonderzeichen enthalten" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Re-validate invitation
  const { data: invitation, error: fetchError } = await adminClient
    .from("invitations")
    .select("id, email, role_id, accepted_at, expires_at")
    .eq("token", token)
    .single()

  if (fetchError || !invitation) {
    return NextResponse.json({ error: "Einladung nicht gefunden" }, { status: 404 })
  }

  const inv = invitation as { id: string; email: string; role_id: string | null; accepted_at: string | null; expires_at: string }

  if (inv.accepted_at) {
    return NextResponse.json({ error: "Diese Einladung wurde bereits angenommen" }, { status: 410 })
  }

  if (new Date(inv.expires_at) < new Date()) {
    return NextResponse.json({ error: "Diese Einladung ist abgelaufen" }, { status: 410 })
  }

  // Create auth user via Supabase Admin
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: inv.email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Benutzer konnte nicht erstellt werden" }, { status: 500 })
  }

  const userId = authData.user.id

  // Create user profile
  await adminClient.from("user_profiles").insert({
    user_id: userId,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName || `${firstName} ${lastName}`,
    title: "",
  })

  // Assign role
  if (inv.role_id) {
    await adminClient.from("user_roles").insert({
      user_id: userId,
      role_id: inv.role_id,
    })
  }

  // Mark invitation as accepted
  await adminClient
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", inv.id)

  return NextResponse.json({ success: true, userId })
}
