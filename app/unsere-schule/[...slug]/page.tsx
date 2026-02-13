import { resolveCustomPage } from "@/lib/resolve-page"
import { SiteLayout } from "@/components/site-layout"
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
  const routePath = "/unsere-schule" + (slug.length > 1 ? "/" + slug.slice(0, -1).join("/") : "")
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

export default async function UnsereSchuleDynamicPage({ params }: Props) {
  const { slug } = await params
  const pageSlug = slug[slug.length - 1]
  const routePath = "/unsere-schule" + (slug.length > 1 ? "/" + slug.slice(0, -1).join("/") : "")
  const page = await resolveCustomPage(pageSlug, routePath)

  if (!page) notFound()

  const useBlocks = isBlockContent(page.content)

  return (
    <SiteLayout>
      <main>
        <section className="bg-primary/5 py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {page.section && (
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">{page.section}</p>
            )}
            <h1 className="font-display text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {page.title}
            </h1>
          </div>
        </section>

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
