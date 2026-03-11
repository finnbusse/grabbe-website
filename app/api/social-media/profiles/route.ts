import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { getBufferProfiles } from "@/lib/buffer"

// ============================================================================
// GET – Fetch connected Buffer profiles/channels
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
    const profiles = await getBufferProfiles(token)
    return NextResponse.json({ profiles })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    return NextResponse.json(
      { error: `Fehler beim Abrufen der Profile: ${message}` },
      { status: 502 }
    )
  }
}
