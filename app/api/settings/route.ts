import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

function revalidateSettingsPages() {
  revalidateTag("settings", "max")
  revalidatePath("/", "layout")
  revalidatePath("/kontakt")
  revalidatePath("/impressum")
}

function isValidSettingItem(item: { key?: unknown; value?: unknown }) {
  return typeof item?.key === "string" &&
    item.key.trim().length > 0 &&
    (item.value === undefined || typeof item.value === "string")
}

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
  const adminSupabase = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  if (Array.isArray(body)) {
    if (body.some((item) => !isValidSettingItem(item))) {
      return NextResponse.json({ error: "Invalid payload: each item requires a non-empty key" }, { status: 400 })
    }
    const rows = body.map((item) => ({
      key: item.key,
      value: item.value ?? "",
      type: "text",
      label: item.key,
      category: "allgemein",
      updated_at: new Date().toISOString(),
    }))
    const { error } = await adminSupabase
      .from("site_settings")
      .upsert(rows as never, { onConflict: "key" })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidateSettingsPages()
    revalidateTag("settings", "max")
    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })
  }

  const { key, value } = body
  if (typeof key !== "string" || key.trim().length === 0) {
    return NextResponse.json({ error: "Invalid payload: key is required" }, { status: 400 })
  }
  if (value !== undefined && typeof value !== "string") {
    return NextResponse.json({ error: "Invalid payload: value must be a string" }, { status: 400 })
  }
  const { error } = await adminSupabase
    .from("site_settings")
    .upsert({
      key,
      value: typeof value === "string" ? value : "",
      type: "text",
      label: key,
      category: "allgemein",
      updated_at: new Date().toISOString(),
    } as never, { onConflict: "key" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateSettingsPages()
  revalidateTag("settings", "max")
  revalidatePath("/", "layout")
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { key, value, type, label, category } = await request.json()
  if (typeof key !== "string" || key.trim().length === 0) {
    return NextResponse.json({ error: "Invalid payload: key is required" }, { status: 400 })
  }
  if (value !== undefined && typeof value !== "string") {
    return NextResponse.json({ error: "Invalid payload: value must be a string" }, { status: 400 })
  }
  const { error } = await adminSupabase.from("site_settings").insert({
    key,
    value: typeof value === "string" ? value : "",
    type: type ?? "text",
    label: label ?? key,
    category: category ?? "allgemein",
  } as never)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateSettingsPages()
  revalidateTag("settings", "max")
  revalidatePath("/", "layout")
  return NextResponse.json({ success: true })
}
