import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tagId = searchParams.get("tagId")
  const type = searchParams.get("type")
  const limit = parseInt(searchParams.get("limit") || "10")

  if (!tagId || !type) {
    return NextResponse.json({ error: "tagId und type sind erforderlich" }, { status: 400 })
  }

  const supabase = await createClient()

  if (type === "events") {
    // Get event IDs for this tag
    const { data: eventTags } = await supabase
      .from("event_tags")
      .select("event_id")
      .eq("tag_id", tagId)

    if (!eventTags || eventTags.length === 0) {
      return NextResponse.json([])
    }

    const eventIds = eventTags.map((et) => et.event_id)
    const today = new Date().toISOString().split("T")[0]

    const { data: events } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds)
      .eq("published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(limit)

    return NextResponse.json(events || [])
  }

  if (type === "documents") {
    const { data: docTags } = await supabase
      .from("document_tags")
      .select("document_id")
      .eq("tag_id", tagId)

    if (!docTags || docTags.length === 0) {
      return NextResponse.json([])
    }

    const docIds = docTags.map((dt) => dt.document_id)

    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .in("id", docIds)
      .eq("published", true)
      .order("created_at", { ascending: false })

    return NextResponse.json(documents || [])
  }

  if (type === "posts") {
    const { data: postTags } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", tagId)

    if (!postTags || postTags.length === 0) {
      return NextResponse.json([])
    }

    const postIds = postTags.map((pt) => pt.post_id)

    const { data: posts } = await supabase
      .from("posts")
      .select("*")
      .in("id", postIds)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    return NextResponse.json(posts || [])
  }

  return NextResponse.json({ error: "Ungueltiger Typ" }, { status: 400 })
}
