import { createClient } from "@/lib/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("category, key")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  if (Array.isArray(body)) {
    // Bulk update
    for (const item of body) {
      await supabase
        .from("site_settings")
        .update({ value: item.value, updated_at: new Date().toISOString() })
        .eq("key", item.key)
    }
    revalidateTag("settings", "max")
    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })
  }

  const { key, value } = body
  const { error } = await supabase
    .from("site_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag("settings", "max")
  revalidatePath("/", "layout")
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key, value, type, label, category } = await request.json()
  const { error } = await supabase.from("site_settings").insert({
    key,
    value: value ?? "",
    type: type ?? "text",
    label: label ?? key,
    category: category ?? "allgemein",
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag("settings", "max")
  revalidatePath("/", "layout")
  return NextResponse.json({ success: true })
}
