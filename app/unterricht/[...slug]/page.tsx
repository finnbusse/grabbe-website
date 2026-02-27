import { resolveCustomPage } from "@/lib/resolve-page"
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
    .eq("status", "published")
    .like("route_path", "/unterricht%")
    .returns<Array<{ slug: string; route_path: string | null }>>()
  return (data ?? []).map((page) => {
    const segments = page.route_path
      ? page.route_path.replace(/^\/unterricht\/?/, '').split('/').filter(Boolean)
      : []
    return { slug: [...segments, page.slug] }
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pageSlug = slug[slug.length - 1]
  const routePath = "/unterricht" + (slug.length > 1 ? "/" + slug.slice(0, -1).join("/") : "")
  const page = await resolveCustomPage(pageSlug, routePath)
  if (!page) return {}
  return generatePageMetadata({
    title: page.title,
    description: page.meta_description || undefined,
    ogImage: page.seo_og_image || undefined,
    path: `/unterricht/${slug.join("/")}`,
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

export default async function UnterrichtDynamicPage({ params }: Props) {
  const { slug } = await params
  const pageSlug = slug[slug.length - 1]
  const routePath = "/unterricht" + (slug.length > 1 ? "/" + slug.slice(0, -1).join("/") : "")
  const page = await resolveCustomPage(pageSlug, routePath)

  if (!page) notFound()

  const useBlocks = isBlockContent(page.content)

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={page.title}
          label={page.section || undefined}
          subtitle={page.hero_subtitle || undefined}
          imageUrl={page.hero_image_url || undefined}
        />
        <Breadcrumbs items={[
          { name: "Unterricht", href: "/unterricht" },
          { name: page.title, href: `/unterricht/${slug.join("/")}` },
        ]} />

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
