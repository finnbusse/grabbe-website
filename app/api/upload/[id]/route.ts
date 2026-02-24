import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (typeof body.title === "string") updates.title = body.title
    if (typeof body.alt_text === "string") updates.alt_text = body.alt_text
    if (typeof body.description === "string") updates.description = body.description
    if (typeof body.category === "string") updates.category = body.category

    if (Object.keys(updates).length === 0 && !Array.isArray(body.tagIds)) {
      return NextResponse.json({ error: "Keine Änderungen angegeben" }, { status: 400 })
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("documents")
        .update(updates as never)
        .eq("id", id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    // Handle tag updates if provided
    if (Array.isArray(body.tagIds)) {
      await supabase.from("document_tags").delete().eq("document_id", id)
      if (body.tagIds.length > 0) {
        await supabase.from("document_tags").insert(
          body.tagIds.map((tag_id: string) => ({ document_id: id, tag_id })) as never,
        )
      }
    }

    revalidateTag("documents", "max")

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Document update error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Aktualisierung fehlgeschlagen" },
      { status: 500 },
    )
  }
}
