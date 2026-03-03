import { createStaticClient as createClient } from "@/lib/supabase/static"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import type { PresentationBlock } from "@/lib/types/presentation-blocks"
import {
  generatePageMetadata,
  getSEOSettings,
  generateWebPageJsonLd,
  JsonLd,
} from "@/lib/seo"
import { AnimateOnScroll } from "./animate-on-scroll"

export const revalidate = 300

// ============================================================================
// Data helpers
// ============================================================================

async function getPresentation(slug: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("presentations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  return data
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase
    .from("presentations")
    .select("slug")
    .eq("status", "published")
    .returns<Array<{ slug: string }>>()
  return (data ?? []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pres = await getPresentation(slug)
  if (!pres) return {}

  return generatePageMetadata({
    title: pres.title,
    description: pres.meta_description || pres.subtitle || undefined,
    ogImage: pres.seo_og_image || pres.cover_image_url || undefined,
    path: `/p/${pres.slug}`,
    type: "article",
    publishedTime: pres.created_at,
    modifiedTime: pres.updated_at,
  })
}

// ============================================================================
// Video URL helpers
// ============================================================================

function extractEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}

// ============================================================================
// Block renderer
// ============================================================================

function PresentationBlockRenderer({ block }: { block: PresentationBlock }) {
  switch (block.type) {
    case "hero":
      return (
        <section
          className="relative flex min-h-screen items-center justify-center overflow-hidden"
          style={{
            backgroundImage: block.backgroundImageUrl
              ? `url(${block.backgroundImageUrl})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
            <AnimateOnScroll>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                {block.heading}
              </h1>
              {block.subtitle && (
                <p className="mt-4 text-lg text-white/80 md:text-xl">
                  {block.subtitle}
                </p>
              )}
              {block.ctaLabel && block.ctaUrl && (
                <Link
                  href={block.ctaUrl}
                  className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
                >
                  {block.ctaLabel}
                </Link>
              )}
            </AnimateOnScroll>
          </div>
        </section>
      )

    case "text": {
      const alignClass =
        block.alignment === "center" ? "text-center mx-auto" : ""
      const Tag =
        block.size === "h1"
          ? "h1"
          : block.size === "h2"
            ? "h2"
            : block.size === "h3"
              ? "h3"
              : "p"
      const sizeClass =
        block.size === "h1"
          ? "font-display text-3xl font-bold md:text-5xl"
          : block.size === "h2"
            ? "font-display text-2xl font-semibold md:text-4xl"
            : block.size === "h3"
              ? "font-display text-xl font-semibold md:text-2xl"
              : block.isLead
                ? "text-lg leading-relaxed text-muted-foreground md:text-xl"
                : "text-base leading-relaxed text-muted-foreground"

      return (
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <AnimateOnScroll>
            <Tag className={`${sizeClass} ${alignClass}`}>
              {block.content}
            </Tag>
          </AnimateOnScroll>
        </section>
      )
    }

    case "image_full":
      return (
        <section className="w-full">
          <AnimateOnScroll>
            <figure>
              <img
                src={block.imageUrl}
                alt={block.alt}
                className="h-auto w-full object-cover"
              />
              {block.caption && (
                <figcaption className="mx-auto max-w-4xl px-6 py-3 text-sm text-muted-foreground">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          </AnimateOnScroll>
        </section>
      )

    case "gallery": {
      const colsClass =
        block.columns === 4
          ? "grid-cols-2 md:grid-cols-4"
          : block.columns === 3
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2"
      return (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className={`grid gap-4 ${colsClass}`}>
            {block.images.map((img, i) => (
              <AnimateOnScroll
                key={i}
                className={`delay-${Math.min(i * 100, 500)}`}
              >
                <figure>
                  <img
                    src={img.imageUrl}
                    alt={img.alt}
                    className="h-auto w-full rounded-lg object-cover"
                  />
                  {img.caption && (
                    <figcaption className="mt-2 text-sm text-muted-foreground">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              </AnimateOnScroll>
            ))}
          </div>
        </section>
      )
    }

    case "quote":
      return (
        <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <AnimateOnScroll>
            <blockquote className="text-center">
              <p
                className="font-display text-2xl font-medium italic leading-relaxed md:text-3xl"
                style={
                  block.accentColor
                    ? { color: block.accentColor }
                    : undefined
                }
              >
                &ldquo;{block.text}&rdquo;
              </p>
              {block.attribution && (
                <footer className="mt-6 text-sm font-medium text-muted-foreground">
                  — {block.attribution}
                </footer>
              )}
            </blockquote>
          </AnimateOnScroll>
        </section>
      )

    case "video": {
      const embedUrl = extractEmbedUrl(block.url)
      if (!embedUrl) return null
      return (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <AnimateOnScroll>
            <div className="aspect-video overflow-hidden rounded-xl">
              <iframe
                src={embedUrl}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={block.caption || "Video"}
              />
            </div>
            {block.caption && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {block.caption}
              </p>
            )}
          </AnimateOnScroll>
        </section>
      )
    }

    case "feature_cards":
      return (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <AnimateOnScroll>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {block.cards.map((card, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-card-foreground">
                    {card.heading}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </section>
      )

    case "divider": {
      const styleClass =
        block.style === "dots"
          ? "border-none text-center before:content-['···'] before:text-2xl before:tracking-[0.5em] before:text-muted-foreground"
          : block.style === "wave"
            ? "border-none h-px bg-gradient-to-r from-transparent via-border to-transparent"
            : "border-border"
      return (
        <div className="mx-auto max-w-4xl px-6 py-8">
          <hr className={styleClass} />
        </div>
      )
    }

    case "stats":
      return (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <AnimateOnScroll>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {block.items.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="font-display text-4xl font-bold text-primary md:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </section>
      )

    case "two_column": {
      const splitClass =
        block.split === "60/40"
          ? "lg:grid-cols-[3fr_2fr]"
          : block.split === "40/60"
            ? "lg:grid-cols-[2fr_3fr]"
            : "lg:grid-cols-2"
      const textEl = (
        <div
          className="prose prose-neutral max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: block.textContent }}
        />
      )
      const imageEl = (
        <img
          src={block.imageUrl}
          alt={block.imageAlt}
          className="h-auto w-full rounded-lg object-cover"
        />
      )
      return (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <AnimateOnScroll>
            <div className={`grid items-center gap-8 ${splitClass}`}>
              {block.imagePosition === "left" ? (
                <>
                  {imageEl}
                  {textEl}
                </>
              ) : (
                <>
                  {textEl}
                  {imageEl}
                </>
              )}
            </div>
          </AnimateOnScroll>
        </section>
      )
    }

    default:
      return null
  }
}

// ============================================================================
// Page
// ============================================================================

export default async function PresentationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createClient()

  const { data: pres } = await supabase
    .from("presentations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!pres) notFound()

  const blocks = (pres.blocks ?? []) as unknown as PresentationBlock[]

  // JSON-LD
  const seo = await getSEOSettings()
  const pageUrl = `${seo.siteUrl}/p/${slug}`

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pres.title,
    description: pres.meta_description || pres.subtitle || "",
    url: pageUrl,
    ...(pres.cover_image_url ? { image: pres.cover_image_url } : {}),
    datePublished: pres.created_at,
    dateModified: pres.updated_at,
    inLanguage: "de-DE",
    publisher: {
      "@type": seo.schemaType || "EducationalOrganization",
      name: seo.orgName,
    },
  }

  const webPageJsonLd = generateWebPageJsonLd({
    seo,
    title: pres.title,
    description: pres.meta_description || pres.subtitle || seo.defaultDescription,
    url: pageUrl,
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={creativeWorkJsonLd} />
      <JsonLd data={webPageJsonLd} />

      {/* Minimal fixed top bar */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur-sm md:px-6">
        <Link
          href="/aktuelles"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← Zurück zu Aktuelles
        </Link>
        <span className="hidden text-sm text-muted-foreground sm:block">
          {seo.siteName}
        </span>
      </nav>

      {/* Blocks */}
      <main>
        {blocks.map((block) => (
          <PresentationBlockRenderer key={block.id} block={block} />
        ))}
      </main>
    </div>
  )
}
