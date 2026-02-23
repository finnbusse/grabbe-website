import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  try {
    const adminClient = createAdminClient()
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) throw listError

    // Fetch profiles for all users
    const { data: profiles } = await supabase.from("user_profiles").select("*")
    const profileMap = new Map(
      (profiles || []).map((p: { user_id: string }) => [p.user_id, p])
    )

    const usersWithProfiles = (listData.users || []).map((u) => ({
      id: u.id,
      email: u.email || "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
      role: u.role || null,
      profile: profileMap.get(u.id) || null,
    }))

    return NextResponse.json({ users: usersWithProfiles })
  } catch (err) {
    // Fallback - return current user only
    console.error("Failed to list users via admin API:", err)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({
      users: [{
        id: user.id,
        email: user.email || "",
        created_at: user.created_at || new Date().toISOString(),
        last_sign_in_at: user.last_sign_in_at || null,
        role: null,
        profile: profile || null,
      }]
    })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const body = await request.json()
  const { email, password, first_name, last_name, title: userTitle } = body

  if (!email || !password) {
    return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 })
  }

  // Use the Supabase admin client to create users without email confirmation
  const adminClient = createAdminClient()
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Create profile for the new user if name data provided
  if (data.user && (first_name || last_name)) {
    await supabase.from("user_profiles").insert({
      user_id: data.user.id,
      first_name: first_name || "",
      last_name: last_name || "",
      title: userTitle || "",
    } as never)
  }

  return NextResponse.json({ user: data.user })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const body = await request.json()
  const { userId } = body

  if (!userId) {
    return NextResponse.json({ error: "Benutzer-ID erforderlich" }, { status: 400 })
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "Der eigene Account kann nicht gelöscht werden" }, { status: 400 })
  }

  try {
    const adminClient = createAdminClient()

    // Delete profile first
    await adminClient.from("user_profiles").delete().eq("user_id", userId)

    // Delete user from auth
    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler beim Löschen"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
