import { createClient } from "@/lib/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * Document Placeholders API
 *
 * GET /api/document-placeholders
 * Returns ALL document placeholders from two sources:
 *   1. Static pages: *_document_slots JSON arrays stored in site_settings
 *      (e.g. Oberstufe page document slots)
 *   2. User-created pages: "document" block types in the pages table
 * Results are grouped by page for display in the Organisation > Dokumente tab.
 *
 * PATCH /api/document-placeholders
 * Updates a document slot.  Dispatches to the correct storage backend based on
 * the `source` field: "static" for site_settings, "block" for pages table.
 */

/** Well-known static pages that have document slots in their page_content */
const STATIC_PAGES_WITH_SLOTS: Array<{
  pageId: string
  pageTitle: string
  route: string
  /** Keys in page_content that end with _document_slots */
  slotKeys: string[]
}> = [
  {
    pageId: "oberstufe",
    pageTitle: "Oberstufe",
    route: "/unsere-schule/oberstufe",
    slotKeys: [
      "antraege_document_slots",
      "klausuren_document_slots",
      "fehlzeiten_document_slots",
      "laufbahn_document_slots",
      "facharbeit_document_slots",
    ],
  },
]

/** Default slot definitions — used when initialising slots for the first time */
const SLOT_DEFAULTS: Record<string, Array<Record<string, string>>> = {
  antraege_document_slots: [
    { id: "antraege_wlan", label: "Antrag WLAN", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "antraege_tablet_knigge", label: "Tablet-Knigge", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "antraege_webuntis", label: "Antrag WebUntis", fileUrl: "", fileTitle: "", fileType: "" },
  ],
  klausuren_document_slots: [
    { id: "klausuren_ef2", label: "Klausurplan EF_2", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "klausuren_q12", label: "Klausurplan Q1_2", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "klausuren_regelungen", label: "Klausurregelungen ab dem 2. Halbjahr 2025/26", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "klausuren_uebersicht", label: "Übersicht Anzahl und Länge der Klausuren", fileUrl: "", fileTitle: "", fileType: "" },
  ],
  fehlzeiten_document_slots: [
    { id: "fehlzeiten_entschuldigungsformular", label: "Entschuldigungsformular", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "fehlzeiten_beurlaubungsantrag", label: "Beurlaubungsantrag", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "fehlzeiten_hinweise_beurlaubung", label: "Hinweise zu Beurlaubungen", fileUrl: "", fileTitle: "", fileType: "" },
  ],
  laufbahn_document_slots: [
    { id: "laufbahn_lupo", label: "Anleitung zur Schülerversion von LuPO", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "laufbahn_broschuere", label: "Broschüre: Die gymnasiale Oberstufe", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "laufbahn_merkblaetter", label: "Merkblätter des Bildungsministeriums", fileUrl: "", fileTitle: "", fileType: "" },
  ],
  facharbeit_document_slots: [
    { id: "facharbeit_terminplan", label: "Terminplan Facharbeit", fileUrl: "", fileTitle: "", fileType: "" },
    { id: "facharbeit_handreichung", label: "Handreichung zur Facharbeit (2025)", fileUrl: "", fileTitle: "", fileType: "" },
  ],
}

interface DocumentPlaceholder {
  blockId: string
  label: string
  fileUrl: string
  fileTitle: string
  fileType: string
}

interface PageWithPlaceholders {
  pageId: string
  pageTitle: string
  pageSlug: string
  /** "static" = site_settings, "block" = pages table */
  source: "static" | "block"
  placeholders: DocumentPlaceholder[]
}

// ---------------------------------------------------------------------------
// GET — collect all document placeholders
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    const results: PageWithPlaceholders[] = []

    // ─── 1. Static pages (site_settings) ─────────────────────────────
    for (const staticPage of STATIC_PAGES_WITH_SLOTS) {
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", `page_content:${staticPage.pageId}`)
        .single()

      // Merge stored content with defaults
      let content: Record<string, unknown> = {}
      if (row?.value) {
        try { content = JSON.parse(row.value) } catch { /* use empty */ }
      }

      const placeholders: DocumentPlaceholder[] = []

      for (const slotKey of staticPage.slotKeys) {
        let raw = content[slotKey] as string | undefined
        // Fall back to defaults if slot key not yet in saved content
        if (!raw && SLOT_DEFAULTS[slotKey]) {
          raw = JSON.stringify(SLOT_DEFAULTS[slotKey])
        }
        if (!raw) continue
        try {
          const slots = JSON.parse(raw)
          if (Array.isArray(slots)) {
            for (const slot of slots) {
              placeholders.push({
                blockId: `${slotKey}::${slot.id}`,
                label: slot.label || "",
                fileUrl: slot.fileUrl || "",
                fileTitle: slot.fileTitle || "",
                fileType: slot.fileType || "",
              })
            }
          }
        } catch { /* skip malformed */ }
      }

      if (placeholders.length > 0) {
        results.push({
          pageId: staticPage.pageId,
          pageTitle: staticPage.pageTitle,
          pageSlug: staticPage.route,
          source: "static",
          placeholders,
        })
      }
    }

    // ─── 2. User-created pages (pages table) ─────────────────────────
    const { data: pages, error } = await supabase
      .from("pages")
      .select("id, title, slug, content")
      .not("content", "is", null)
      .order("title", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    for (const page of pages || []) {
      if (!page.content) continue

      let blocks: Array<{ id: string; type: string; data: Record<string, unknown> }>
      try {
        blocks = JSON.parse(page.content)
      } catch { continue }

      if (!Array.isArray(blocks)) continue

      const placeholders: DocumentPlaceholder[] = blocks
        .filter((b) => b.type === "document")
        .map((b) => ({
          blockId: b.id,
          label: (b.data.label as string) || "",
          fileUrl: (b.data.fileUrl as string) || "",
          fileTitle: (b.data.fileTitle as string) || "",
          fileType: (b.data.fileType as string) || "",
        }))

      if (placeholders.length > 0) {
        results.push({
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          source: "block",
          placeholders,
        })
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH — update a single document slot
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    const body = await request.json()
    const { pageId, blockId, fileUrl, fileTitle, fileType, source } = body

    if (!pageId || !blockId) {
      return NextResponse.json(
        { error: "pageId und blockId sind erforderlich" },
        { status: 400 }
      )
    }

    // ─── Static page slot (site_settings) ────────────────────────────
    if (source === "static") {
      // blockId format: "slotKey::slotId"
      const [slotKey, slotId] = blockId.split("::")
      if (!slotKey || !slotId) {
        return NextResponse.json(
          { error: "Ungültige Block-ID" },
          { status: 400 }
        )
      }

      const settingsKey = `page_content:${pageId}`
      const { data: row } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", settingsKey)
        .single()

      let content: Record<string, unknown> = {}
      if (row?.value) {
        try { content = JSON.parse(row.value) } catch { /* empty */ }
      }

      // Parse existing slots or initialize from well-known defaults
      let slots: Array<Record<string, string>> = []
      const rawSlots = content[slotKey] as string | undefined
      if (rawSlots) {
        try { slots = JSON.parse(rawSlots) } catch { /* empty */ }
      }

      // If no slots found and this is a known slot key, initialise from defaults
      if (slots.length === 0) {
        const defaults = SLOT_DEFAULTS[slotKey]
        if (defaults) {
          slots = defaults.map((d) => ({ ...d }))
        }
      }

      // Find and update the target slot
      const slotIndex = slots.findIndex((s) => s.id === slotId)
      if (slotIndex === -1) {
        return NextResponse.json(
          { error: "Dokument-Slot nicht gefunden" },
          { status: 404 }
        )
      }

      slots[slotIndex] = {
        ...slots[slotIndex],
        fileUrl: fileUrl || "",
        fileTitle: fileTitle || "",
        fileType: fileType || "",
      }

      content[slotKey] = JSON.stringify(slots)

      // Upsert the settings
      const { error: updateError } = await supabase
        .from("site_settings")
        .upsert(
          {
            key: settingsKey,
            value: JSON.stringify(content),
            type: "json",
            label: `Seiteninhalt: ${pageId}`,
            category: "page_content",
            protected: false,
          },
          { onConflict: "key" }
        )

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      revalidateTag("page-content")
      revalidateTag("settings")
      revalidatePath("/", "layout")

      return NextResponse.json({ success: true })
    }

    // ─── Block-based page (pages table) ──────────────────────────────
    const { data: page, error: fetchError } = await supabase
      .from("pages")
      .select("content")
      .eq("id", pageId)
      .single()

    if (fetchError || !page?.content) {
      return NextResponse.json(
        { error: "Seite nicht gefunden" },
        { status: 404 }
      )
    }

    let blocks: Array<{ id: string; type: string; data: Record<string, unknown> }>
    try {
      blocks = JSON.parse(page.content)
    } catch {
      return NextResponse.json(
        { error: "Seiteninhalt konnte nicht gelesen werden" },
        { status: 500 }
      )
    }

    const blockIndex = blocks.findIndex(
      (b) => b.id === blockId && b.type === "document"
    )
    if (blockIndex === -1) {
      return NextResponse.json(
        { error: "Dokumenten-Block nicht gefunden" },
        { status: 404 }
      )
    }

    blocks[blockIndex].data = {
      ...blocks[blockIndex].data,
      fileUrl: fileUrl || "",
      fileTitle: fileTitle || "",
      fileType: fileType || "",
    }

    const { error: updateError } = await supabase
      .from("pages")
      .update({ content: JSON.stringify(blocks) })
      .eq("id", pageId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
