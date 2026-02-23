import { NextResponse, type NextRequest } from "next/server"
import { getSEOSettings } from "@/lib/seo"
import { createClient } from "@/lib/supabase/server"

/**
 * SEO QA Check – GET /api/seo-check?url=/aktuelles
 *
 * Returns a JSON report with resolved metadata for the given path:
 * - site settings (siteUrl, title template, etc.)
 * - whether the URL is in the sitemap
 * - structured data hints
 * - environment flags (isPreview)
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("url") || "/"
  const seo = await getSEOSettings()
  const supabase = await createClient()

  // Check if path is a published post
  let postMatch = null
  const postSlugMatch = path.match(/^\/aktuelles\/(.+)$/)
  if (postSlugMatch) {
    const { data } = await supabase
      .from("posts")
      .select("slug, title, excerpt, meta_description, image_url, seo_og_image, published, updated_at")
      .eq("slug", postSlugMatch[1])
      .maybeSingle()
    postMatch = data
  }

  // Check if path is a published custom page
  let pageMatch = null
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, title, route_path, published, meta_description, seo_og_image, updated_at")
    .eq("published", true)
  if (pages) {
    pageMatch = pages.find((p) => {
      const prefix = p.route_path || ""
      const full = prefix ? `${prefix}/${p.slug}` : `/seiten/${p.slug}`
      return full === path
    })
  }

  // Build expected metadata
  const titleTemplate = `%s${seo.titleSeparator}${seo.titleSuffix}`
  const canonicalUrl = `${seo.siteUrl}${path}`

  const report = {
    checkedPath: path,
    environment: {
      isPreview: seo.isPreview,
      siteUrl: seo.siteUrl,
      vercelEnv: process.env.VERCEL_ENV || "local",
    },
    titlePolicy: {
      template: titleTemplate,
      defaultTitle: seo.siteName,
    },
    resolvedCanonical: canonicalUrl,
    robotsHint: seo.isPreview ? "noindex, nofollow (preview)" : "index, follow",
    defaultOgImage: seo.ogImage || "(nicht gesetzt)",
    defaultDescription: seo.defaultDescription,
    matchedContent: postMatch
      ? {
          type: "post",
          title: postMatch.title,
          published: postMatch.published,
          hasDescription: !!(postMatch.meta_description || postMatch.excerpt),
          hasOgImage: !!(postMatch.seo_og_image || postMatch.image_url),
        }
      : pageMatch
        ? {
            type: "page",
            title: pageMatch.title,
            published: pageMatch.published,
            hasDescription: !!pageMatch.meta_description,
            hasOgImage: !!pageMatch.seo_og_image,
          }
        : null,
    jsonLdTypes: getExpectedJsonLdTypes(path),
    tips: generateTips(seo, postMatch, pageMatch ?? null, path),
  }

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  })
}

function getExpectedJsonLdTypes(path: string): string[] {
  const types = ["Organization", "WebSite"] // always present
  if (path === "/") return types
  types.push("BreadcrumbList")
  if (path.startsWith("/aktuelles/") && path !== "/aktuelles") {
    types.push("NewsArticle")
  } else {
    types.push("WebPage")
  }
  return types
}

function generateTips(
  seo: { ogImage: string; siteUrl: string; orgLogo: string; isPreview: boolean },
  post: { published?: boolean; meta_description?: string | null; excerpt?: string | null; seo_og_image?: string | null; image_url?: string | null } | null,
  page: { published?: boolean; meta_description?: string | null; seo_og_image?: string | null } | null,
  path: string,
): string[] {
  const tips: string[] = []
  if (!seo.ogImage) tips.push("Kein Standard-OG-Bild gesetzt – empfohlen unter Einstellungen > SEO.")
  if (!seo.orgLogo) tips.push("Kein Organisations-Logo gesetzt – wird für Schema.org benötigt.")
  if (seo.isPreview) tips.push("Preview-Environment erkannt – Seite wird mit noindex ausgeliefert.")
  if (post && !post.published) tips.push("Beitrag ist nicht veröffentlicht und wird nicht in der Sitemap erscheinen.")
  if (post && !post.meta_description && !post.excerpt) tips.push("Beitrag hat weder Meta-Beschreibung noch Kurztext – Fallback wird verwendet.")
  if (page && !page.published) tips.push("Seite ist nicht veröffentlicht.")
  if (!post && !page && path !== "/" && !path.startsWith("/cms") && !path.startsWith("/auth")) {
    tips.push("Kein dynamischer Inhalt für diesen Pfad gefunden – möglicherweise eine statische Seite.")
  }
  return tips
}
