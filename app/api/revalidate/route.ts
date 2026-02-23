import { createClient } from "@/lib/supabase/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/** Allowed path prefixes for revalidation */
const ALLOWED_PATH_PREFIXES = [
  "/aktuelles/",
  "/termine",
  "/downloads",
  "/kontakt",
  "/impressum",
  "/datenschutz",
  "/unsere-schule/",
  "/schulleben/",
  "/seiten/",
  "/",
]

function isValidRevalidationPath(path: string): boolean {
  if (!path.startsWith("/")) return false
  if (path.includes("?") || path.includes("#") || path.includes("..")) return false
  return ALLOWED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix))
}

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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { type, path } = body as { type?: string; path?: string }

  if (!type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 })
  }

  // Validate path if provided
  if (path && !isValidRevalidationPath(path)) {
    return NextResponse.json(
      { error: "Invalid path. Must start with / and be a known public route." },
      { status: 400 }
    )
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
