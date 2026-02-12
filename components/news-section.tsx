import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  image_url: string | null
  author_name: string | null
  created_at: string
}

export function NewsSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null

  const featured = posts[0]
  const rest = posts.slice(1, 4)

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Aktuelles</p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
            Neuigkeiten vom Grabbe
          </h2>
        </div>
        <Link href="/aktuelles" className="hidden items-center gap-1.5 text-sm font-medium text-primary hover:underline sm:flex">
          Alle Beitraege <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Featured post */}
        <Link href={`/aktuelles/${featured.slug}`} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl">
          {featured.image_url ? (
            <div className="relative h-64 overflow-hidden">
              <img src={featured.image_url} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
          ) : (
            <div className="h-64 bg-primary/10 flex items-center justify-center">
              <span className="font-display text-6xl font-bold text-primary/20">G</span>
            </div>
          )}
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <time>{new Date(featured.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</time>
              {featured.category && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{featured.category}</span>}
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold group-hover:text-primary transition-colors">{featured.title}</h3>
            {featured.excerpt && <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{featured.excerpt}</p>}
            <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
              Weiterlesen <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        {/* Other posts */}
        <div className="flex flex-col gap-4">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={`/aktuelles/${post.slug}`}
              className="group flex gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md"
            >
              {post.image_url ? (
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                  <img src={post.image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              ) : (
                <div className="h-24 w-24 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-primary/20">G</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time>{new Date(post.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}</time>
                  {post.category && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{post.category}</span>}
                </div>
                <h3 className="mt-1 font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                {post.excerpt && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}

          <Link href="/aktuelles" className="flex items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            Alle Beitraege ansehen <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
