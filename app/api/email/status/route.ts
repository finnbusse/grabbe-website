import { createClient } from "@/lib/supabase/server"
import { getUserRoleSlugs } from "@/lib/permissions"
import { isAdmin } from "@/lib/permissions-shared"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  // Authenticate user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
  }

  // Check admin role
  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdmin(roleSlugs)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  return NextResponse.json({
    configured: !!process.env.RESEND_API_KEY,
    domain: "push.grabbe.site",
    from: "Grabbe-Gymnasium Detmold <noreply@push.grabbe.site>",
  })
}
