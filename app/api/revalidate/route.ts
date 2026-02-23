import { createClient } from "@/lib/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/revalidate
 *
 * On-demand revalidation endpoint for CMS editors.
 * Call after saving posts, pages, events, or documents so that
 * cached public pages reflect the latest content immediately.
 *
 * Body: { type: "posts" | "pages" | "events" | "documents" | "settings" | "navigation", path?: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { type, path } = body as { type?: string; path?: string }

  if (!type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 })
  }

  switch (type) {
    case "posts":
      revalidateTag("posts", "max")
      revalidatePath("/aktuelles")
      if (path) revalidatePath(path)
      break
    case "pages":
      revalidateTag("pages", "max")
      if (path) revalidatePath(path)
      break
    case "events":
      revalidateTag("events", "max")
      revalidatePath("/termine")
      if (path) revalidatePath(path)
      break
    case "documents":
      revalidateTag("documents", "max")
      revalidatePath("/downloads")
      if (path) revalidatePath(path)
      break
    case "settings":
      revalidateTag("settings", "max")
      revalidateTag("page-content", "max")
      revalidatePath("/", "layout")
      break
    case "navigation":
      revalidateTag("navigation", "max")
      revalidatePath("/", "layout")
      break
    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
  }

  return NextResponse.json({ revalidated: true, type, path: path || null })
}
