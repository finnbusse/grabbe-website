import { createClient } from "@/lib/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { getUserRoleSlugs, isAdminOrSchulleitung } from "@/lib/permissions"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get("location")
  const supabase = await createClient()
  let query = supabase
    .from("navigation_items")
    .select("*")
    .order("sort_order")
  if (location) query = query.eq("location", location)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdminOrSchulleitung(roleSlugs)) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })

  const body = await request.json()
  const { data, error } = await supabase
    .from("navigation_items")
    .insert(body)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag("navigation", "max")
  revalidatePath("/", "layout")
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdminOrSchulleitung(roleSlugs)) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })

  const body = await request.json()
  const { id, ...updates } = body
  updates.updated_at = new Date().toISOString()
  const { error } = await supabase
    .from("navigation_items")
    .update(updates)
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag("navigation", "max")
  revalidatePath("/", "layout")
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const roleSlugs = await getUserRoleSlugs(user.id)
  if (!isAdminOrSchulleitung(roleSlugs)) return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })

  const { id } = await request.json()
  const { error } = await supabase
    .from("navigation_items")
    .delete()
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag("navigation", "max")
  revalidatePath("/", "layout")
  return NextResponse.json({ success: true })
}
