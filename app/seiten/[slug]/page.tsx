import { createClient } from "@/lib/supabase/server"
import { SiteLayout } from "@/components/site-layout"
import { MarkdownContent } from "@/components/markdown-content"
import { BlockContentRenderer } from "@/components/block-content-renderer"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: page } = await supabase
    .from("pages")
    .select("title")
    .eq("slug", slug)
    .eq("published", true)
    .single()

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
  const supabase = await createClient()
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single()

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
