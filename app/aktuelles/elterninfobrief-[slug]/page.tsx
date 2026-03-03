import { SiteLayout } from "@/components/site-layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { createStaticClient as createClient } from "@/lib/supabase/static"
import { notFound } from "next/navigation"
import { CalendarDays, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import type { ContentBlock } from "@/components/cms/block-editor"
import {
  generatePageMetadata,
  getSEOSettings,
  generateArticleJsonLd,
  generateWebPageJsonLd,
  JsonLd,
} from "@/lib/seo"

export const revalidate = 300

// ============================================================================
// Data helpers
// ============================================================================

async function getLetter(slug: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("parent_letters")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  return data
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase
    .from("parent_letters")
    .select("slug")
    .eq("status", "published")
    .returns<Array<{ slug: string }>>()
  return (data ?? []).map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const letter = await getLetter(slug)
  if (!letter) return {}

  return generatePageMetadata({
    title: `${letter.number}. Elterninfobrief – ${letter.title}`,
    description: `Elterninfobrief Nr. ${letter.number}: ${letter.title}`,
    path: `/aktuelles/elterninfobrief-${letter.slug}`,
    type: "article",
    publishedTime: letter.created_at,
    modifiedTime: letter.updated_at,
  })
}

// ============================================================================
// Block renderer
// ============================================================================

function renderBlock(block: ContentBlock) {
  const { type, data, id } = block

  switch (type) {
    case "text": {
      const heading = data.heading as string | undefined
      const text = data.text as string | undefined
      return (
        <div key={id} className="space-y-2">
          {heading && (
            <h2 className="font-display text-xl font-semibold text-foreground">
              {heading}
            </h2>
          )}
          {text && (
            <div
              className="prose prose-neutral max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          )}
        </div>
      )
    }
    case "hero": {
      const heading = data.heading as string | undefined
      const subheading = data.subheading as string | undefined
      return (
        <div key={id} className="rounded-lg bg-primary/5 p-6">
          {heading && (
            <h2 className="font-display text-2xl font-bold text-foreground">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="mt-2 text-muted-foreground">{subheading}</p>
          )}
        </div>
      )
    }
    case "quote": {
      const quote = data.quote as string | undefined
      const author = data.author as string | undefined
      return (
        <blockquote
          key={id}
          className="border-l-4 border-primary pl-4 italic text-muted-foreground"
        >
          {quote && <p>{quote}</p>}
          {author && (
            <footer className="mt-1 text-sm font-medium not-italic text-foreground">
              — {author}
            </footer>
          )}
        </blockquote>
      )
    }
    case "divider":
      return <hr key={id} className="my-6 border-border" />
    case "gallery": {
      const images = (data.images as Array<{ url: string; alt?: string }>) ?? []
      return (
        <div key={id} className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.alt || ""}
              className="rounded-lg object-cover"
            />
          ))}
        </div>
      )
    }
    case "video": {
      const url = data.url as string | undefined
      const caption = data.caption as string | undefined
      return (
        <figure key={id}>
          {url && (
            <div className="aspect-video overflow-hidden rounded-lg">
              <iframe
                src={url}
                className="h-full w-full"
                allowFullScreen
                title={caption || "Video"}
              />
            </div>
          )}
          {caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }
    case "list": {
      const heading = data.heading as string | undefined
      const items = (data.items as string[]) ?? []
      return (
        <div key={id} className="space-y-2">
          {heading && (
            <h3 className="font-display font-semibold text-foreground">
              {heading}
            </h3>
          )}
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )
    }
    case "cards": {
      const cards =
        (data.cards as Array<{ title: string; text: string }>) ?? []
      return (
        <div key={id} className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, i) => (
            <div key={i} className="rounded-lg border border-border p-4">
              <h3 className="font-semibold text-foreground">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      )
    }
    case "cta": {
      const heading = data.heading as string | undefined
      const text = data.text as string | undefined
      const buttonText = data.buttonText as string | undefined
      const buttonUrl = data.buttonUrl as string | undefined
      return (
        <div key={id} className="rounded-lg bg-primary/5 p-6 text-center">
          {heading && (
            <h3 className="font-display text-lg font-semibold">{heading}</h3>
          )}
          {text && <p className="mt-1 text-muted-foreground">{text}</p>}
          {buttonText && buttonUrl && (
            <Link
              href={buttonUrl}
              className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              {buttonText}
            </Link>
          )}
        </div>
      )
    }
    default:
      return null
  }
}

// ============================================================================
// Date formatter
// ============================================================================

function formatGermanDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// ============================================================================
// Page
// ============================================================================

export default async function ElterninfobriefPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createClient()

  const { data: letter } = await supabase
    .from("parent_letters")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!letter) notFound()

  const blocks = (letter.content ?? []) as unknown as ContentBlock[]

  // JSON-LD
  const seo = await getSEOSettings()
  const pageUrl = `${seo.siteUrl}/aktuelles/elterninfobrief-${slug}`

  const articleJsonLd = generateArticleJsonLd({
    seo,
    title: `${letter.number}. Elterninfobrief – ${letter.title}`,
    description: `Elterninfobrief Nr. ${letter.number}: ${letter.title}`,
    url: pageUrl,
    publishedTime: letter.created_at,
    modifiedTime: letter.updated_at,
  })

  const webPageJsonLd = generateWebPageJsonLd({
    seo,
    title: `${letter.number}. Elterninfobrief – ${letter.title}`,
    description: `Elterninfobrief Nr. ${letter.number}: ${letter.title}`,
    url: pageUrl,
    breadcrumbs: [
      { name: "Aktuelles", href: "/aktuelles" },
      {
        name: `${letter.number}. Elterninfobrief`,
        href: `/aktuelles/elterninfobrief-${slug}`,
      },
    ],
  })

  // Fetch related events & posts if period is set
  let events: Array<{
    id: string
    title: string
    starts_at: string
    location: string | null
  }> = []
  let posts: Array<{
    id: string
    title: string
    slug: string
    event_date: string | null
    created_at: string
  }> = []

  if (letter.date_from && letter.date_to) {
    const [eventsResult, postsResult] = await Promise.all([
      supabase
        .from("events")
        .select("id, title, starts_at, location")
        .eq("status", "published")
        .gte("starts_at", letter.date_from)
        .lte("starts_at", letter.date_to)
        .order("starts_at", { ascending: true })
        .returns<
          Array<{
            id: string
            title: string
            starts_at: string
            location: string | null
          }>
        >(),
      supabase
        .from("posts")
        .select("id, title, slug, event_date, created_at")
        .eq("status", "published")
        .or(
          `and(event_date.gte.${letter.date_from},event_date.lte.${letter.date_to}),and(event_date.is.null,created_at.gte.${letter.date_from},created_at.lte.${letter.date_to})`
        )
        .order("created_at", { ascending: false })
        .returns<
          Array<{
            id: string
            title: string
            slug: string
            event_date: string | null
            created_at: string
          }>
        >(),
    ])
    events = eventsResult.data ?? []
    posts = postsResult.data ?? []
  }

  return (
    <SiteLayout>
      <main>
        <JsonLd data={articleJsonLd} />
        <JsonLd data={webPageJsonLd} />

        <Breadcrumbs
          items={[
            { name: "Aktuelles", href: "/aktuelles" },
            {
              name: `${letter.number}. Elterninfobrief`,
              href: `/aktuelles/elterninfobrief-${slug}`,
            },
          ]}
        />

        {/* Header */}
        <header className="mx-auto max-w-3xl px-4 pt-10 lg:px-8">
          <p className="text-xs font-sub uppercase tracking-[0.22em] text-primary">
            Elterninfobrief
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {letter.number}. Elterninfobrief – {letter.title}
          </h1>
          {letter.date_from && letter.date_to && (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatGermanDate(letter.date_from)} –{" "}
              {formatGermanDate(letter.date_to)}
            </span>
          )}
        </header>

        {/* Content blocks */}
        <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 lg:px-8">
          {blocks.map((block) => renderBlock(block))}
        </article>

        {/* Related events & posts */}
        {letter.date_from && letter.date_to && (events.length > 0 || posts.length > 0) && (
          <section className="mx-auto max-w-3xl border-t border-border px-4 py-12 lg:px-8">
            {events.length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Termine in diesem Zeitraum
                </h2>
                <ul className="mt-4 divide-y divide-border">
                  {events.map((evt) => (
                    <li
                      key={evt.id}
                      className="flex items-baseline justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {evt.title}
                        </p>
                        {evt.location && (
                          <p className="text-sm text-muted-foreground">
                            {evt.location}
                          </p>
                        )}
                      </div>
                      <time className="shrink-0 text-sm text-muted-foreground">
                        {formatGermanDate(evt.starts_at)}
                      </time>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {posts.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  News in diesem Zeitraum
                </h2>
                <ul className="mt-4 divide-y divide-border">
                  {posts.map((post) => (
                    <li key={post.id} className="py-3">
                      <Link
                        href={`/aktuelles/${post.slug}`}
                        className="group flex items-center justify-between gap-4"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {post.title}
                        </span>
                        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                          <time>
                            {formatGermanDate(
                              post.event_date || post.created_at
                            )}
                          </time>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </SiteLayout>
  )
}
