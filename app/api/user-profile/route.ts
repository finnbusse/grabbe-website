import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const userId = request.nextUrl.searchParams.get("userId") || user.id

  // Try with all columns first, fall back to without avatar_url if column doesn't exist
  let profile = null
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, user_id, first_name, last_name, title, avatar_url, created_at, updated_at")
    .eq("user_id", userId)
    .single()

  if (error && error.message?.includes("avatar_url")) {
    // avatar_url column doesn't exist yet - query without it
    const { data: fallbackData } = await supabase
      .from("user_profiles")
      .select("id, user_id, first_name, last_name, title, created_at, updated_at")
      .eq("user_id", userId)
      .single()
    profile = fallbackData ? { ...fallbackData, avatar_url: null } : null
  } else if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    profile = data
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
        // If avatar_url column doesn't exist, the upload still succeeded in blob storage
        // Return the URL so the client can display it, but warn about the DB issue
        if (updateError.message?.includes("avatar_url")) {
          return NextResponse.json({ 
            avatar_url: blob.url, 
            warning: "Bitte fuehren Sie die Migration 'migration_add_avatar_url_column.sql' in Supabase aus und laden Sie den Schema-Cache neu." 
          })
        }
        return NextResponse.json({ error: `Profil konnte nicht aktualisiert werden: ${updateError.message}` }, { status: 500 })
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({ user_id: targetUserId, avatar_url: blob.url } as never)
      if (insertError) {
        if (insertError.message?.includes("avatar_url")) {
          // Try inserting without avatar_url
          const { error: fallbackInsertError } = await supabase
            .from("user_profiles")
            .insert({ user_id: targetUserId } as never)
          if (fallbackInsertError) {
            return NextResponse.json({ error: `Profil konnte nicht erstellt werden: ${fallbackInsertError.message}` }, { status: 500 })
          }
          return NextResponse.json({ 
            avatar_url: blob.url, 
            warning: "Bitte fuehren Sie die Migration 'migration_add_avatar_url_column.sql' in Supabase aus und laden Sie den Schema-Cache neu." 
          })
        }
        return NextResponse.json({ error: `Profil konnte nicht erstellt werden: ${insertError.message}` }, { status: 500 })
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
