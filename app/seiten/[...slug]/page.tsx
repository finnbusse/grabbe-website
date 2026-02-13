import { createClient } from "@/lib/supabase/server"
import { SiteLayout } from "@/components/site-layout"
import { MarkdownContent } from "@/components/markdown-content"
import { BlockContentRenderer } from "@/components/block-content-renderer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string[] }>
}

/**
 * Resolves a page from the URL segments.
 * Supports:
 *   /seiten/my-page          -> slug = "my-page", no route_path filter
 *   /seiten/category/my-page -> slug = "my-page", route_path = "/category"
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

    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("slug", pageSlug)
      .eq("route_path", routePath)
      .eq("published", true)
      .single()

    if (data) return data

    // Fallback: try slug-only lookup
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
  return { title: page.title }
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

  return (
    <SiteLayout>
      <main>
        <section className="bg-primary/5 py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h1 className="font-display text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {page.title}
            </h1>
            {page.section && (
              <p className="mt-3 text-sm font-medium uppercase tracking-wider text-primary">{page.section}</p>
            )}
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
