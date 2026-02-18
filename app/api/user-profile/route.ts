import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const userId = request.nextUrl.searchParams.get("userId") || user.id

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: profile || null })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const contentType = request.headers.get("content-type") || ""

  // Handle avatar upload (multipart form)
  if (contentType.includes("multipart/form-data")) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Blob Storage nicht konfiguriert" }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get("avatar") as File
    const targetUserId = (formData.get("userId") as string) || user.id

    if (!file) {
      return NextResponse.json({ error: "Keine Datei angegeben" }, { status: 400 })
    }

    // Compress image client-side before upload, but also limit server-side
    const maxSize = 5 * 1024 * 1024 // 5MB max upload
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Datei zu gross. Maximum: 5MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `profile-images/${targetUserId}.${ext}`

    const blob = await put(filename, file, { access: "public" })

    // Update or create profile with avatar URL
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", targetUserId)
      .single()

    if (existing) {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: blob.url } as never)
        .eq("user_id", targetUserId)
      if (updateError) {
        return NextResponse.json({ error: "Profil konnte nicht aktualisiert werden: " + updateError.message }, { status: 500 })
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({ user_id: targetUserId, avatar_url: blob.url } as never)
      if (insertError) {
        return NextResponse.json({ error: "Profil konnte nicht erstellt werden: " + insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ avatar_url: blob.url })
  }

  // Handle JSON profile update
  const body = await request.json()
  const { userId: targetUserId, first_name, last_name, title } = body
  const profileUserId = targetUserId || user.id

  const profileData = {
    first_name: first_name ?? "",
    last_name: last_name ?? "",
    title: title ?? "",
  }

  // Check if profile exists
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", profileUserId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("user_profiles")
      .update(profileData as never)
      .eq("user_id", profileUserId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from("user_profiles")
      .insert({ user_id: profileUserId, ...profileData } as never)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch updated profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", profileUserId)
    .single()

  return NextResponse.json({ profile })
}
