import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse, type NextRequest } from "next/server"
import { createBufferPost, type BufferCreatePostParams } from "@/lib/buffer"

// ============================================================================
// POST – Publish a post via Buffer
// ============================================================================

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check admin role
  const adminSupabase = createAdminClient()
  const { data: roles } = await adminSupabase
    .from("user_roles")
    .select("role_id, cms_roles(slug)")
    .eq("user_id", user.id)

  const roleSlugs = (roles ?? []).map((r: Record<string, unknown>) => {
    const role = r.cms_roles as { slug: string } | null
    return role?.slug ?? ""
  })

  if (!roleSlugs.includes("administrator")) {
    return NextResponse.json(
      { error: "Forbidden – Nur Administratoren können Social-Media-Posts erstellen." },
      { status: 403 }
    )
  }

  // Get the stored Buffer token
  const { data: tokenRow } = await adminSupabase
    .from("site_settings")
    .select("value")
    .eq("key", "buffer_access_token")
    .single()

  const token = (tokenRow as { value: string } | null)?.value ?? ""
  if (!token) {
    return NextResponse.json(
      { error: "Kein Buffer Access Token konfiguriert." },
      { status: 400 }
    )
  }

  // Parse request body
  const body = await request.json()
  const { text, profile_ids, media, now, scheduled_at } = body as {
    text?: string
    profile_ids?: string[]
    media?: { link?: string; description?: string; picture?: string }
    now?: boolean
    scheduled_at?: string
  }

  // Validation
  if (!text || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Post-Text darf nicht leer sein." },
      { status: 400 }
    )
  }

  if (!profile_ids || profile_ids.length === 0) {
    return NextResponse.json(
      { error: "Mindestens ein Profil muss ausgewählt werden." },
      { status: 400 }
    )
  }

  // Build post params
  const params: BufferCreatePostParams = {
    text: text.trim(),
    profile_ids,
    now: now ?? true,
    shorten: true,
  }

  if (media && (media.link || media.picture || media.description)) {
    params.media = {}
    if (media.link) params.media.link = media.link
    if (media.picture) params.media.picture = media.picture
    if (media.description) params.media.description = media.description
  }

  if (scheduled_at) {
    params.now = false
    params.scheduled_at = scheduled_at
  }

  try {
    const result = await createBufferPost(token, params)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    return NextResponse.json(
      { error: `Fehler beim Veröffentlichen: ${message}` },
      { status: 502 }
    )
  }
}
