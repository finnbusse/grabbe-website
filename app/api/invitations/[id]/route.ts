import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getUserRoleSlugs } from "@/lib/permissions"
import { isAdmin } from "@/lib/permissions-shared"
import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })

  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdmin(roleSlugs)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("invitations")
    .delete()
    .eq("id", id)
    .is("accepted_at", null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
