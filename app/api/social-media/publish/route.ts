import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse, type NextRequest } from "next/server"
import { createBufferPost, type BufferCreatePostParams } from "@/lib/buffer"

// ============================================================================
// POST – Publish a post via Buffer (REST API)
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
  const { text, channel_ids, image_url, now, scheduled_at } = body as {
    text?: string
    channel_ids?: string[]
    image_url?: string
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

  if (!channel_ids || channel_ids.length === 0) {
    return NextResponse.json(
      { error: "Mindestens ein Kanal muss ausgewählt werden." },
      { status: 400 }
    )
  }

  // Determine schedule time – only set dueAt for scheduled posts, not for "now"
  const dueAt = scheduled_at
    ? scheduled_at
    : now !== false
      ? undefined   // REST API uses now=true instead of a dueAt timestamp
      : undefined

  // Create post for each selected channel — in parallel to avoid
  // serverless function timeouts when there are multiple channels.
  const promises = channel_ids.map(async (channelId) => {
    try {
      const params: BufferCreatePostParams = {
        text: text.trim(),
        channelId,
        dueAt,
        imageUrl: image_url,
      }

      const result = await createBufferPost(token, params)
      return {
        channelId,
        success: result.success,
        postId: result.post?.id,
        error: result.message,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler"
      return { channelId, success: false, error: message }
    }
  })

  const results = await Promise.all(promises)

  const successCount = results.filter((r) => r.success).length
  const allSucceeded = successCount === results.length

  return NextResponse.json({
    success: allSucceeded,
    results,
    message: allSucceeded
      ? `${successCount} Post${successCount !== 1 ? "s" : ""} erfolgreich erstellt.`
      : `${successCount}/${results.length} Posts erstellt. Einige sind fehlgeschlagen.`,
  })
}
