import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { resolveBaseUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveBaseUrl()
  const supabase = await createClient()

  // Fetch all published posts
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })

  // Fetch all published custom pages
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, route_path, updated_at")
    .eq("published", true)

  const entries: MetadataRoute.Sitemap = []

  // Homepage
  entries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  })

  // Static pages
  const staticPages = [
    { path: "/aktuelles", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/termine", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/kontakt", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/downloads", changeFrequency: "weekly" as const, priority: 0.6 },
    { path: "/unsere-schule/erprobungsstufe", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/unsere-schule/oberstufe", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/unsere-schule/profilprojekte", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/unsere-schule/anmeldung", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/unsere-schule/wer-was-wo", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/schulleben/faecher-ags", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/schulleben/nachmittag", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/schulleben/netzwerk", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/impressum", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/datenschutz", changeFrequency: "yearly" as const, priority: 0.3 },
  ]

  for (const page of staticPages) {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // Dynamic posts
  if (posts) {
    for (const post of posts) {
      entries.push({
        url: `${baseUrl}/aktuelles/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  // Dynamic custom pages
  if (pages) {
    for (const page of pages) {
      const routePrefix = page.route_path || ""
      const fullPath = routePrefix
        ? `${routePrefix}/${page.slug}`
        : `/seiten/${page.slug}`
      entries.push({
        url: `${baseUrl}${fullPath}`,
        lastModified: new Date(page.updated_at),
        changeFrequency: "monthly",
        priority: 0.5,
      })
    }
  }

  return entries
}
