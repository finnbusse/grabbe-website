import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { getBufferChannels } from "@/lib/buffer"

// ============================================================================
// GET – Fetch connected Buffer channels (social media profiles)
// ============================================================================

export async function GET() {
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
      { error: "Forbidden – Nur Administratoren können auf Social-Media-Profile zugreifen." },
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
      { error: "Kein Buffer Access Token konfiguriert. Bitte zuerst einen API-Schlüssel hinterlegen." },
      { status: 400 }
    )
  }

  try {
    const result = await getBufferChannels(token)
    return NextResponse.json({
      channels: result.channels,
      errors: result.errors.length > 0 ? result.errors : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    console.error("[social-media/profiles] Fehler beim Abrufen der Kanäle:", err)
    return NextResponse.json(
      { error: `Fehler beim Abrufen der Kanäle: ${message}` },
      { status: 502 }
    )
  }
}
