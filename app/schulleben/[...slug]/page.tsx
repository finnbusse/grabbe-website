import { resolveCustomPage } from "@/lib/resolve-page"
import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { MarkdownContent } from "@/components/markdown-content"
import { BlockContentRenderer } from "@/components/block-content-renderer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pageSlug = slug[slug.length - 1]
  const routePath = "/schulleben" + (slug.length > 1 ? "/" + slug.slice(0, -1).join("/") : "")
  const page = await resolveCustomPage(pageSlug, routePath)
  if (!page) return {}
  return { title: `${page.title} - Grabbe-Gymnasium` }
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

export default async function SchullebenDynamicPage({ params }: Props) {
  const { slug } = await params
  const pageSlug = slug[slug.length - 1]
  const routePath = "/schulleben" + (slug.length > 1 ? "/" + slug.slice(0, -1).join("/") : "")
  const page = await resolveCustomPage(pageSlug, routePath)

  if (!page) notFound()

  const useBlocks = isBlockContent(page.content)

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={page.title}
          label={page.section || undefined}
          imageUrl={page.hero_image_url || undefined}
        />

        <section className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
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
