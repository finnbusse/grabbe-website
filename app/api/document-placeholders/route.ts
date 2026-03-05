import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

/**
 * Document Placeholders API
 *
 * GET /api/document-placeholders
 * Returns all document-type blocks from user-created pages (block-based content),
 * grouped by page. Used by the Organisation > Dokumente tab for centralized
 * document management.
 *
 * PATCH /api/document-placeholders
 * Updates the file attached to a specific document block on a specific page.
 * Body: { pageId: string, blockId: string, fileUrl: string, fileTitle: string, fileType: string }
 */

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
  placeholders: DocumentPlaceholder[]
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    // Fetch all pages that have block-based content
    const { data: pages, error } = await supabase
      .from("pages")
      .select("id, title, slug, content")
      .not("content", "is", null)
      .order("title", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results: PageWithPlaceholders[] = []

    for (const page of pages || []) {
      if (!page.content) continue

      let blocks: Array<{ id: string; type: string; data: Record<string, unknown> }>
      try {
        blocks = JSON.parse(page.content)
      } catch {
        continue
      }

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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    const body = await request.json()
    const { pageId, blockId, fileUrl, fileTitle, fileType } = body

    if (!pageId || !blockId) {
      return NextResponse.json(
        { error: "pageId und blockId sind erforderlich" },
        { status: 400 }
      )
    }

    // Load the page content
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

    // Find and update the target block
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

    // Save updated content
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
