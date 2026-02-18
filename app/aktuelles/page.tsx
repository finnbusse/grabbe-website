import { SiteLayout } from "@/components/site-layout"
import { createClient } from "@/lib/supabase/server"
import { CalendarDays, ArrowRight, UserCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
  title: "Aktuelles - Grabbe-Gymnasium Detmold",
  description: "Neuigkeiten und aktuelle Meldungen vom Grabbe-Gymnasium Detmold.",
}

export default async function AktuellesPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      user_profiles (
        first_name,
        last_name,
        title,
        profile_image_url
      )
    `)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(20)

  // Helper function to get author display name
  const getAuthorName = (post: any) => {
    if (post.user_profiles) {
      const { first_name, last_name, title } = post.user_profiles
      if (first_name || last_name) {
        return `${title ? title + ' ' : ''}${first_name || ''} ${last_name || ''}`.trim()
      }
    }
    return post.author_name || 'Redaktion'
  }

  return (
    <SiteLayout>
      <main>
        {/* Header */}
        <section className="border-b border-border bg-muted">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 lg:px-8 lg:pb-16 lg:pt-24">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Neuigkeiten
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Aktuelles
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Bleiben Sie informiert ueber Veranstaltungen, Projekte und Neuigkeiten am Grabbe-Gymnasium.
            </p>
          </div>
        </section>

        {/* Posts */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          {posts && posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/aktuelles/${post.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  {post.category && (
                    <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {post.category}
                    </span>
                  )}
                  <h2 className="font-display text-lg font-semibold text-card-foreground group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(post.created_at).toLocaleDateString("de-DE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-4 w-4 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                          {post.user_profiles?.profile_image_url ? (
                            <Image
                              src={post.user_profiles.profile_image_url}
                              alt={getAuthorName(post)}
                              width={16}
                              height={16}
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserCircle className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{getAuthorName(post)}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
                Noch keine Beitraege
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Neue Beitraege werden hier angezeigt, sobald sie im CMS veroeffentlicht werden.
              </p>
            </div>
          )}
        </section>
      </main>
    </SiteLayout>
  )
}
