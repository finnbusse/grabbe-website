import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserRoleSlugs, isAdminOrSchulleitung, setUserPagePermissions } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const roleSlugs = await getUserRoleSlugs(user.id)
  const canManagePermissions = isAdminOrSchulleitung(roleSlugs)

  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId erforderlich" }, { status: 400 })
  }

  if (!canManagePermissions && userId !== user.id) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("user_page_permissions")
    .select("*")
    .eq("user_id", userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ permissions: data || [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdminOrSchulleitung(roleSlugs)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { userId, pages } = body as {
      userId: string
      pages: Array<{ page_type: "editable" | "cms"; page_id: string }>
    }

    if (!userId || !Array.isArray(pages)) {
      return NextResponse.json({ error: "userId und pages erforderlich" }, { status: 400 })
    }

    const result = await setUserPagePermissions(userId, pages)
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    revalidatePath("/cms", "layout")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Ungültiger Request" }, { status: 400 })
  }
}
