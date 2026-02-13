import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/page-content?pageId=homepage-hero
 * Fetch page content for a specific page.
 */
export async function GET(request: NextRequest) {
  const pageId = request.nextUrl.searchParams.get("pageId")
  if (!pageId) {
    return NextResponse.json({ error: "pageId is required" }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", `page_content:${pageId}`)
      .single()

    if (error || !data) {
      return NextResponse.json({ content: null })
    }

    return NextResponse.json({ content: JSON.parse(data.value) })
  } catch {
    return NextResponse.json({ content: null })
  }
}

/**
 * POST /api/page-content
 * Save page content. Body: { pageId: string, content: Record<string, unknown> }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    const body = await request.json()
    const { pageId, content } = body

    if (!pageId || !content) {
      return NextResponse.json({ error: "pageId and content are required" }, { status: 400 })
    }

    const key = `page_content:${pageId}`
    const value = JSON.stringify(content)

    // Upsert: insert or update
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key,
          value,
          type: "json",
          label: `Seiteninhalt: ${pageId}`,
          category: "page_content",
          protected: false,
        },
        { onConflict: "key" }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fehler beim Speichern"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
