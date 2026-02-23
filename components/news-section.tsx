"use client"

import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"
import { AnimateOnScroll } from "./animate-on-scroll"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  image_url: string | null
  author_name: string | null
  event_date?: string | null
  created_at: string
  author_profile?: {
    first_name?: string
    last_name?: string
    title?: string
    avatar_url?: string | null
  } | null
}

export function NewsSection({ posts, content }: { posts: Post[]; content?: Record<string, unknown> }) {
  const c = content || {}
  const sLabel = (c.label as string) || 'Aktuelles'
  const sHeadline = (c.headline as string) || 'Neuigkeiten vom Grabbe'
  const allLinkText = (c.all_link_text as string) || 'Alle Beiträge'
  const readMoreText = (c.read_more_text as string) || 'Weiterlesen'
  const allButtonText = (c.all_button_text as string) || 'Alle Beiträge ansehen'

  if (posts.length === 0) return null

  const featured = posts[0]
  const rest = posts.slice(1, 4)

  return (
    <section className="relative py-28 lg:py-36 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <AnimateOnScroll>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">{sLabel}</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-foreground">
                {sHeadline.includes('Grabbe') ? (
                  <>{sHeadline.split('Grabbe')[0]}<span className="italic text-primary">Grabbe</span>{sHeadline.split('Grabbe')[1]}</>
                ) : sHeadline}
              </h2>
            </div>
            <Link href="/aktuelles" className="hidden items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary hover:text-foreground transition-colors sm:flex group">
              {allLinkText}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          {/* Featured post */}
          <AnimateOnScroll animation="fade-in-up" delay={0.1} className="lg:col-span-3">
            <Link href={`/aktuelles/${featured.slug}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/[0.06] hover:border-primary/30 h-full">
              {featured.image_url ? (
                <div className="relative h-72 overflow-hidden">
                  <img src={featured.image_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                </div>
              ) : (
                <div className="h-72 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="font-display text-8xl italic text-primary/10">G</span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-8">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <time>{new Date(featured.event_date || featured.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</time>
                  {featured.category && (
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 font-sub text-[10px] uppercase tracking-wider text-primary">{featured.category}</span>
                  )}
                  {(featured.author_name || featured.author_profile) && (
                    <span className="flex items-center gap-1.5">
                      {featured.author_profile?.avatar_url ? (
                        <img src={featured.author_profile.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                          {featured.author_profile?.first_name?.charAt(0) || featured.author_name?.charAt(0) || ""}
                          {featured.author_profile?.last_name?.charAt(0) || ""}
                        </span>
                      )}
                      <span>{featured.author_name || [featured.author_profile?.title, featured.author_profile?.first_name, featured.author_profile?.last_name].filter(Boolean).join(" ")}</span>
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-2xl md:text-3xl text-card-foreground group-hover:text-primary transition-colors duration-300">{featured.title}</h3>
                {featured.excerpt && <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{featured.excerpt}</p>}
                <div className="mt-6 flex items-center gap-2 font-sub text-xs uppercase tracking-[0.15em] text-primary">
                  {readMoreText}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </AnimateOnScroll>

          {/* Other posts */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {rest.map((post, i) => (
              <AnimateOnScroll key={post.id} animation="slide-in-right" delay={0.15 + i * 0.1}>
                <Link
                  href={`/aktuelles/${post.slug}`}
                  className="group flex gap-5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 transition-all duration-500 hover:shadow-lg hover:shadow-primary/[0.06] hover:border-primary/30"
                >
                  {post.image_url ? (
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  ) : (
                    <div className="h-24 w-24 shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="font-display text-3xl italic text-primary/15">G</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <time>{new Date(post.event_date || post.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}</time>
                      {post.category && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-sub text-[10px] uppercase tracking-wider text-primary">{post.category}</span>}
                      {(post.author_name || post.author_profile) && (
                        <span className="flex items-center gap-1">
                          {post.author_profile?.avatar_url ? (
                            <img src={post.author_profile.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">
                              {post.author_profile?.first_name?.charAt(0) || post.author_name?.charAt(0) || ""}
                              {post.author_profile?.last_name?.charAt(0) || ""}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>}
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}

            <AnimateOnScroll animation="fade-in-up" delay={0.4}>
              <Link href="/aktuelles" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 p-5 font-sub text-xs uppercase tracking-[0.15em] text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 group">
                {allButtonText}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
    </section>
  )
}
