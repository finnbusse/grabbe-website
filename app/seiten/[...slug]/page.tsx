import { createClient } from "@/lib/supabase/server"
import { createStaticClient } from "@/lib/supabase/static"
import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MarkdownContent } from "@/components/markdown-content"
import { BlockContentRenderer } from "@/components/block-content-renderer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { generatePageMetadata } from "@/lib/seo"

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from("pages")
    .select("slug, route_path")
    .eq("published", true)
    .returns<Array<{ slug: string; route_path: string | null }>>()

  // Exclude pages served by known filesystem routes (unsere-schule, schulleben)
  const knownPrefixes = ["/unsere-schule", "/schulleben"]
  return (data ?? [])
    .filter((page) => !knownPrefixes.some((p) => page.route_path?.startsWith(p)))
    .map((page) => {
      const prefix = page.route_path ? page.route_path.replace(/^\//, '').split('/') : []
      return { slug: [...prefix, page.slug] }
    })
}

/**
 * Resolves a page from the URL segments.
 * Supports:
 *   /seiten/my-page          -> slug = "my-page", no route_path
 *   /seiten/category/my-page -> slug = "my-page", route_path = "/category"
 *   (also handles middleware rewrites from /category/my-page)
 */
async function resolvePage(segments: string[]) {
  const supabase = await createClient()

  if (segments.length === 1) {
    // Simple slug lookup: /seiten/my-page
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", segments[0])
      .eq("published", true)
      .single()
    return data
  }

  if (segments.length >= 2) {
    // Hierarchical lookup: /seiten/category/subcategory/my-page
    const pageSlug = segments[segments.length - 1]
    const routePath = "/" + segments.slice(0, -1).join("/")

    // Try route_path + slug match
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", pageSlug)
      .eq("route_path", routePath)
      .eq("published", true)
      .single()

    if (data) return data

    // Fallback: try slug-only lookup (page may have been moved)
    const { data: fallback } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", pageSlug)
      .eq("published", true)
      .single()
    return fallback
  }

  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await resolvePage(slug)
  if (!page) return {}
  const routePrefix = page.route_path || ""
  const canonicalPath = routePrefix
    ? `${routePrefix}/${page.slug}`
    : `/seiten/${page.slug}`
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description || undefined,
    ogImage: page.seo_og_image || undefined,
    path: canonicalPath,
  })
}

function isBlockContent(content: string): boolean {
  try {
    if (content.startsWith('[{') || content.startsWith('[{"')) {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) && parsed.length > 0 && parsed[0].type && parsed[0].id
    }
  } catch { /* not blocks */ }
  return false
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await resolvePage(slug)

  if (!page) notFound()

  const useBlocks = isBlockContent(page.content)
  const routePrefix = page.route_path || ""
  const fullPath = routePrefix ? `${routePrefix}/${page.slug}` : `/seiten/${page.slug}`

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={page.title}
          label={page.section || undefined}
          imageUrl={page.hero_image_url || undefined}
        />
        <Breadcrumbs items={[{ name: page.title, href: fullPath }]} />

        <section className="mx-auto max-w-6xl px-4 py-28 lg:py-36 lg:px-8">
          {useBlocks ? (
            <BlockContentRenderer content={page.content} />
          ) : (
            <MarkdownContent content={page.content} />
          )}
        </section>
      </main>
    </SiteLayout>
  )
}
