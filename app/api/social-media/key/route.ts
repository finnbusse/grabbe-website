import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse, type NextRequest } from "next/server"
import { validateBufferToken } from "@/lib/buffer"

// ============================================================================
// Helpers
// ============================================================================

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized", status: 401 }

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
    return { error: "Forbidden – Nur Administratoren können diese Einstellung ändern.", status: 403 }
  }

  return { user, adminSupabase }
}

// ============================================================================
// GET – Fetch current Buffer API key status (masked)
// ============================================================================

export async function GET() {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { adminSupabase } = auth
  const { data } = await adminSupabase
    .from("site_settings")
    .select("value")
    .eq("key", "buffer_access_token")
    .single()

  const token = (data as { value: string } | null)?.value ?? ""
  const isConfigured = token.length > 0

  return NextResponse.json({
    configured: isConfigured,
    masked_key: isConfigured ? "••••••••" + token.slice(-4) : "",
  })
}

// ============================================================================
// PUT – Save or update the Buffer API key
// ============================================================================

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { adminSupabase } = auth
  const body = await request.json()
  const { access_token } = body as { access_token?: string }

  if (typeof access_token !== "string" || access_token.trim().length === 0) {
    return NextResponse.json(
      { error: "Ein gültiger Access Token wird benötigt." },
      { status: 400 }
    )
  }

  // 1. Validate the token with Buffer's GraphQL API FIRST.
  //    Only save if the token is actually valid – prevents garbage tokens.
  let accountInfo: { organizations: Array<{ id: string; name: string }> }
  try {
    accountInfo = await validateBufferToken(access_token.trim())
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Validierungsfehler"
    return NextResponse.json(
      { error: `Token ungültig: ${message}` },
      { status: 400 }
    )
  }

  // 2. Token is valid → save to database
  const { error: dbError } = await adminSupabase
    .from("site_settings")
    .upsert(
      {
        key: "buffer_access_token",
        value: access_token.trim(),
        type: "secret",
        label: "Buffer Access Token",
        category: "social_media",
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "key" }
    )

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  const orgName = accountInfo.organizations[0]?.name ?? "Unbekannt"
  return NextResponse.json({
    success: true,
    buffer_account: {
      organization_name: orgName,
      organization_count: accountInfo.organizations.length,
    },
  })
}

// ============================================================================
// DELETE – Remove the Buffer API key
// ============================================================================

export async function DELETE() {
  const auth = await requireAdmin()
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { adminSupabase } = auth
  const { error } = await adminSupabase
    .from("site_settings")
    .delete()
    .eq("key", "buffer_access_token")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
