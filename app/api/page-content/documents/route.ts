import { createClient } from "@/lib/supabase/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Ensure the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    // Fetch all page contents
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value, label")
      .like("key", "page_content:%")

    if (error || !data) {
      return NextResponse.json({ placements: [] })
    }

    const placements: any[] = []

    for (const row of data) {
      const pageId = row.key.replace("page_content:", "")
      const pageLabel = row.label || pageId

      let parsedValue
      try {
        parsedValue = JSON.parse(row.value)
      } catch {
        continue
      }

      // Check if the content has blocks
      if (parsedValue && Array.isArray(parsedValue.blocks)) {
        for (const block of parsedValue.blocks) {
          if (block.type === "document") {
            placements.push({
              pageId,
              pageLabel,
              blockId: block.id,
              label: block.data?.label || "Dokument",
              url: block.data?.url || "",
              fileType: block.data?.fileType || "",
            })
          }
        }
      }
    }

    return NextResponse.json({ placements })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler beim Laden der Dokumenten-Platzhalter"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    const body = await request.json()
    const { pageId, blockId, url, fileType } = body

    if (!pageId || !blockId) {
      return NextResponse.json({ error: "pageId and blockId are required" }, { status: 400 })
    }

    const key = `page_content:${pageId}`

    const { data: row, error: fetchError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single()

    if (fetchError || !row) {
      return NextResponse.json({ error: "Seite nicht gefunden" }, { status: 404 })
    }

    let parsedValue
    try {
      parsedValue = JSON.parse(row.value)
    } catch {
      return NextResponse.json({ error: "Ungültiges Inhaltsformat" }, { status: 500 })
    }

    if (!parsedValue || !Array.isArray(parsedValue.blocks)) {
      return NextResponse.json({ error: "Keine Blöcke gefunden" }, { status: 404 })
    }

    let found = false
    for (const block of parsedValue.blocks) {
      if (block.id === blockId && block.type === "document") {
        if (url !== undefined) block.data.url = url
        if (fileType !== undefined) block.data.fileType = fileType
        found = true
        break
      }
    }

    if (!found) {
      return NextResponse.json({ error: "Dokument-Block nicht gefunden" }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ value: JSON.stringify(parsedValue) })
      .eq("key", key)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    revalidateTag("page-content")
    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })

  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler beim Speichern"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
