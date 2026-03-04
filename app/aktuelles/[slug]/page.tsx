import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MarkdownContent } from "@/components/markdown-content"
import { ShareButton } from "@/components/share-button"
import { createStaticClient as createClient } from "@/lib/supabase/static"
import { notFound } from "next/navigation"
import { CalendarDays, ArrowLeft, ArrowRight, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import type { ContentBlock } from "@/components/cms/block-editor"
import { teacherDisplayName } from "@/lib/teacher-utils"
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

export async function generateStaticParams() {
  const supabase = createClient()
  const [postsRes, lettersRes] = await Promise.all([
    supabase
      .from("posts")
      .select("slug")
      .eq("status", "published")
      .returns<Array<{ slug: string }>>(),
    supabase
      .from("parent_letters")
      .select("slug")
      .eq("status", "published")
      .returns<Array<{ slug: string }>>()
      .then((r) => r, () => ({ data: null })), // parent_letters table may not exist yet
  ])
  const postSlugs = (postsRes.data ?? []).map((p) => ({ slug: p.slug }))
  const letterSlugs = (lettersRes.data ?? []).map((l) => ({ slug: l.slug }))
  return [...postSlugs, ...letterSlugs]
}

async function getPost(slug: string) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  return post
}

async function getParentLetter(slug: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("parent_letters")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  return data
}

// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  // Try post first
  const post = await getPost(slug)
  if (post) {
    return generatePageMetadata({
      title: post.seo_title || post.title,
      seoTitleOverride: post.seo_title || undefined,
      description: post.meta_description || post.excerpt || undefined,
      ogImage: post.seo_og_image || post.image_url || undefined,
      path: `/aktuelles/${post.slug}`,
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      author: post.author_name || undefined,
      section: post.category || undefined,
      canonicalOverride: post.seo_canonical_override || undefined,
      noIndex: post.seo_no_index || false,
    })
  }

  // Try parent letter
  const letter = await getParentLetter(slug)
  if (letter) {
    return generatePageMetadata({
      title: `${letter.number}. Elterninfobrief – ${letter.title}`,
      description: `Elterninfobrief Nr. ${letter.number}: ${letter.title}`,
      path: `/aktuelles/${letter.slug}`,
      type: "article",
      publishedTime: letter.created_at,
      modifiedTime: letter.updated_at,
    })
  }

  return {}
}

// ============================================================================
// Parent letter block renderer
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
          {/* CMS-authored content from block editor — trusted admin input */}
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

export default async function PostOrLetterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()

  // Try post first
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (post) {
    return <PostView post={post} slug={slug} />
  }

  // Try parent letter
  const { data: letter } = await supabase
    .from("parent_letters")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (letter) {
    return <ParentLetterView letter={letter} slug={slug} />
  }

  notFound()
}

// ============================================================================
// Post view
// ============================================================================

async function PostView({ post, slug }: { post: Record<string, unknown>; slug: string }) {
  const supabase = createClient()

  // Fetch teacher authors from junction table
  let teacherAuthors: Array<{
    first_name: string
    last_name: string
    gender: string
    abbreviation: string
    image_url: string | null
  }> = []
  try {
    const { data: authorLinks } = await supabase
      .from("post_authors")
      .select("teacher_id")
      .eq("post_id", post.id as string)
    if (authorLinks && authorLinks.length > 0) {
      const teacherIds = authorLinks.map((a: { teacher_id: string }) => a.teacher_id)
      const { data: teachers } = await supabase
        .from("teachers")
        .select("first_name, last_name, gender, abbreviation, image_url")
        .in("id", teacherIds)
        .eq("is_active", true)
      if (teachers) {
        teacherAuthors = teachers as typeof teacherAuthors
      }
    }
  } catch {
    // Table may not exist yet
  }

  // Build display name: prefer teacher authors, then author_name from post, then user profile
  let authorDisplayName: string | null = null
  let authorAvatar: string | null = null
  let authorInitials = ""

  if (teacherAuthors.length > 0) {
    // Build from teacher records
    authorDisplayName = teacherAuthors.map((t) => teacherDisplayName(t)).join(", ")
    // Use first teacher's avatar (additional authors shown via name)
    authorAvatar = teacherAuthors[0].image_url
    authorInitials = (teacherAuthors[0].first_name?.charAt(0) || "") + (teacherAuthors[0].last_name?.charAt(0) || "")
  } else if (post.author_name) {
    // Use the stored author_name (set during save from teacher selection or user profile)
    authorDisplayName = post.author_name as string
    authorInitials = authorDisplayName.charAt(0)?.toUpperCase() || ""
  }

  // Fallback: fetch author profile from user_profiles if no teacher authors and no author_name
  if (!authorDisplayName && post.user_id) {
    const { data, error: profileError } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, title, avatar_url")
      .eq("user_id", post.user_id as string)
      .single()
    if (data) {
      authorDisplayName = [data.title, data.first_name, data.last_name].filter(Boolean).join(" ") || null
      authorAvatar = data.avatar_url || null
      authorInitials = (data.first_name?.charAt(0) || "") + (data.last_name?.charAt(0) || "")
    } else if (profileError?.message?.includes("avatar_url")) {
      const { data: fallbackData } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, title")
        .eq("user_id", post.user_id as string)
        .single()
      if (fallbackData) {
        const fd = fallbackData as { first_name?: string; last_name?: string; title?: string }
        authorDisplayName = [fd.title, fd.first_name, fd.last_name].filter(Boolean).join(" ") || null
        authorInitials = (fd.first_name?.charAt(0) || "") + (fd.last_name?.charAt(0) || "")
      }
    }
  }

  // JSON-LD structured data
  const seo = await getSEOSettings()
  const postUrl = `${seo.siteUrl}/aktuelles/${slug}`
  const articleJsonLd = generateArticleJsonLd({
    seo,
    title: post.title as string,
    description: (post.meta_description || post.excerpt || "") as string,
    url: postUrl,
    imageUrl: (post.seo_og_image || post.image_url || undefined) as string | undefined,
    publishedTime: post.created_at as string,
    modifiedTime: post.updated_at as string,
    authorName: authorDisplayName || undefined,
    section: (post.category || undefined) as string | undefined,
  })

  const webPageJsonLd = generateWebPageJsonLd({
    seo,
    title: (post.seo_title || post.title) as string,
    description: (post.meta_description || post.excerpt || seo.defaultDescription) as string,
    url: postUrl,
    breadcrumbs: [
      { name: "Aktuelles", href: "/aktuelles" },
      { name: post.title as string, href: `/aktuelles/${slug}` },
    ],
  })

  return (
    <SiteLayout>
      <main>
        <JsonLd data={articleJsonLd} />
        <JsonLd data={webPageJsonLd} />
        <PageHero
          title={post.title as string}
          label={(post.category as string) || "Aktuelles"}
          subtitle={(post.excerpt as string) || undefined}
          imageUrl={(post.image_url as string) || undefined}
        />
        <Breadcrumbs items={[
          { name: "Aktuelles", href: "/aktuelles" },
          { name: post.title as string, href: `/aktuelles/${slug}` },
        ]} />

        <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {new Date((post.event_date || post.created_at) as string).toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {authorDisplayName && (
              <div className="flex items-center gap-2">
                {authorAvatar ? (
                  <img src={authorAvatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : authorInitials ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-[10px] font-bold text-primary">{authorInitials}</span>
                  </div>
                ) : (
                  <User className="h-4 w-4" />
                )}
                {authorDisplayName}
              </div>
            )}
            {typeof post.category === "string" && post.category && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                {post.category}
              </span>
            )}
          </div>

          <div className="mt-10 max-w-none">
            <MarkdownContent content={post.content as string} />
          </div>

          <div className="mt-12 flex items-center justify-between border-t pt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/aktuelles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {"Zurück zu Aktuelles"}
              </Link>
            </Button>
            <ShareButton title={post.title as string} text={(post.excerpt as string) || undefined} />
          </div>
        </article>
      </main>
    </SiteLayout>
  )
}

// ============================================================================
// Parent letter view
// ============================================================================

async function ParentLetterView({ letter, slug }: { letter: Record<string, unknown>; slug: string }) {
  const supabase = createClient()
  const blocks = (letter.content ?? []) as unknown as ContentBlock[]
  const letterNumber = letter.number as number
  const letterTitle = letter.title as string
  const letterDateFrom = letter.date_from as string | null
  const letterDateTo = letter.date_to as string | null

  // JSON-LD
  const seo = await getSEOSettings()
  const pageUrl = `${seo.siteUrl}/aktuelles/${slug}`

  const articleJsonLd = generateArticleJsonLd({
    seo,
    title: `${letterNumber}. Elterninfobrief – ${letterTitle}`,
    description: `Elterninfobrief Nr. ${letterNumber}: ${letterTitle}`,
    url: pageUrl,
    publishedTime: letter.created_at as string,
    modifiedTime: letter.updated_at as string,
  })

  const webPageJsonLd = generateWebPageJsonLd({
    seo,
    title: `${letterNumber}. Elterninfobrief – ${letterTitle}`,
    description: `Elterninfobrief Nr. ${letterNumber}: ${letterTitle}`,
    url: pageUrl,
    breadcrumbs: [
      { name: "Aktuelles", href: "/aktuelles" },
      {
        name: `${letterNumber}. Elterninfobrief`,
        href: `/aktuelles/${slug}`,
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

  if (letterDateFrom && letterDateTo) {
    const [eventsResult, postsResult] = await Promise.all([
      supabase
        .from("events")
        .select("id, title, starts_at, location")
        .eq("status", "published")
        .gte("starts_at", letterDateFrom)
        .lte("starts_at", letterDateTo)
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
          `and(event_date.gte.${letterDateFrom},event_date.lte.${letterDateTo}),and(event_date.is.null,created_at.gte.${letterDateFrom},created_at.lte.${letterDateTo})`
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

        <PageHero
          title={`${letterNumber}. Elterninfobrief – ${letterTitle}`}
          label="Elterninfobrief"
        />

        <Breadcrumbs
          items={[
            { name: "Aktuelles", href: "/aktuelles" },
            {
              name: `${letterNumber}. Elterninfobrief`,
              href: `/aktuelles/${slug}`,
            },
          ]}
        />

        {/* Date range badge */}
        {letterDateFrom && letterDateTo && (
          <div className="mx-auto max-w-3xl px-4 pt-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatGermanDate(letterDateFrom)} –{" "}
              {formatGermanDate(letterDateTo)}
            </span>
          </div>
        )}

        {/* Content blocks */}
        <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 lg:px-8">
          {blocks.map((block) => renderBlock(block))}
        </article>

        {/* Related events & posts */}
        {letterDateFrom && letterDateTo && (events.length > 0 || posts.length > 0) && (
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
                  {posts.map((p) => (
                    <li key={p.id} className="py-3">
                      <Link
                        href={`/aktuelles/${p.slug}`}
                        className="group flex items-center justify-between gap-4"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary">
                          {p.title}
                        </span>
                        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                          <time>
                            {formatGermanDate(
                              p.event_date || p.created_at
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

        {/* Footer actions */}
        <div className="mx-auto max-w-3xl border-t border-border px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" asChild>
              <Link href="/aktuelles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {"Zurück zu Aktuelles"}
              </Link>
            </Button>
            <ShareButton title={`${letterNumber}. Elterninfobrief – ${letterTitle}`} />
          </div>
        </div>
      </main>
    </SiteLayout>
  )
}
