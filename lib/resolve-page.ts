import { createClient } from "@/lib/supabase/server"

/**
 * Resolves a custom (user-created) page from the database by slug and optional route_path.
 * Used by dynamic route handlers across the site to serve CMS-created pages.
 * 
 * @param slug - The page slug (last segment of the URL)
 * @param routePath - Optional route path prefix (e.g., "/unsere-schule")
 * @returns The page data or null if not found
 */
export async function resolveCustomPage(slug: string, routePath?: string) {
  const supabase = await createClient()

  if (routePath) {
    // Try exact route_path + slug match first
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("route_path", routePath)
      .eq("published", true)
      .single()

    if (data) return data
  }

  // Fallback: try slug-only lookup
  const { data: fallback } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  return fallback
}
