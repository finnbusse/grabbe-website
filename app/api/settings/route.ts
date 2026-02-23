import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
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
    const rows = body.map((item) => ({
      key: item.key,
      value: item.value ?? "",
      type: item.type ?? "text",
      label: item.label ?? item.key,
      category: item.category ?? "allgemein",
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from("site_settings")
      .upsert(rows, { onConflict: "key" })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidatePath("/", "layout")
    revalidatePath("/kontakt")
    revalidatePath("/impressum")
    return NextResponse.json({ success: true })
  }

  const { key, value, type, label, category } = body
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      key,
      value: value ?? "",
      type: type ?? "text",
      label: label ?? key,
      category: category ?? "allgemein",
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath("/", "layout")
  revalidatePath("/kontakt")
  revalidatePath("/impressum")
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

  revalidatePath("/", "layout")
  revalidatePath("/kontakt")
  revalidatePath("/impressum")
  return NextResponse.json({ success: true })
}
