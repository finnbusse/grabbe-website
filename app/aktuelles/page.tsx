import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { createClient } from "@/lib/supabase/server"
import { getPageContent, PAGE_DEFAULTS } from "@/lib/page-content"
import { CalendarDays, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Aktuelles - Grabbe-Gymnasium Detmold",
  description: "Neuigkeiten und aktuelle Meldungen vom Grabbe-Gymnasium Detmold.",
}

export default async function AktuellesPage() {
  const [heroContent, supabase] = await Promise.all([
    getPageContent('aktuelles', PAGE_DEFAULTS['aktuelles']),
    createClient(),
  ])
  const heroImageUrl = (heroContent.hero_image_url as string) || undefined
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(20)

  // Fetch author profiles
  const userIds = [...new Set((posts || []).map(p => p.user_id).filter(Boolean))]
  let authorProfiles: Record<string, { first_name?: string; last_name?: string; title?: string; avatar_url?: string | null }> = {}
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("user_id, first_name, last_name, title, avatar_url")
      .in("user_id", userIds)
    if (profiles) {
      authorProfiles = Object.fromEntries(profiles.map(p => [p.user_id, p]))
    } else if (profilesError?.message?.includes("avatar_url")) {
      // avatar_url column doesn't exist yet - query without it
      const { data: fallbackProfiles } = await supabase
        .from("user_profiles")
        .select("user_id, first_name, last_name, title")
        .in("user_id", userIds)
      if (fallbackProfiles) {
        authorProfiles = Object.fromEntries(fallbackProfiles.map(p => [p.user_id, { ...p, avatar_url: null }]))
      }
    }
  }

  return (
    <SiteLayout>
      <main>
        <PageHero
          title="Aktuelles"
          label="Neuigkeiten"
          subtitle="Bleiben Sie informiert ueber Veranstaltungen, Projekte und Neuigkeiten am Grabbe-Gymnasium."
          imageUrl={heroImageUrl}
        />

        {/* Posts */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          {posts && posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const profile = post.user_id ? authorProfiles[post.user_id] : null
                const authorName = post.author_name || (profile ? [profile.title, profile.first_name, profile.last_name].filter(Boolean).join(" ") : null)
                return (
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
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(post.event_date || post.created_at).toLocaleDateString("de-DE", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      {authorName && (
                        <div className="flex items-center gap-1.5">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">
                              {profile?.first_name?.charAt(0) || authorName?.charAt(0) || ""}
                              {profile?.last_name?.charAt(0) || ""}
                            </span>
                          )}
                          <span>{authorName}</span>
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
                )
              })}
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
