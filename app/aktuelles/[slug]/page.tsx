import { SiteLayout } from "@/components/site-layout"
import { PageHero } from "@/components/page-hero"
import { MarkdownContent } from "@/components/markdown-content"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CalendarDays, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!post) notFound()

  // Fetch author profile if post has user_id
  let authorProfile: { first_name?: string; last_name?: string; title?: string; avatar_url?: string | null } | null = null
  if (post.user_id) {
    const { data, error: profileError } = await supabase
      .from("user_profiles")
      .select("first_name, last_name, title, avatar_url")
      .eq("user_id", post.user_id)
      .single()
    if (data) {
      authorProfile = data
    } else if (profileError?.message?.includes("avatar_url")) {
      // avatar_url column doesn't exist yet - query without it
      const { data: fallbackData } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, title")
        .eq("user_id", post.user_id)
        .single()
      if (fallbackData) {
        authorProfile = { ...fallbackData, avatar_url: null }
      }
    }
  }

  const authorDisplayName = post.author_name || (
    authorProfile
      ? [authorProfile.title, authorProfile.first_name, authorProfile.last_name].filter(Boolean).join(" ")
      : null
  )

  const authorInitials = authorProfile
    ? (authorProfile.first_name?.charAt(0) || "") + (authorProfile.last_name?.charAt(0) || "")
    : authorDisplayName?.charAt(0)?.toUpperCase() || ""

  return (
    <SiteLayout>
      <main>
        <PageHero
          title={post.title}
          label={post.category || "Aktuelles"}
          imageUrl={post.image_url || undefined}
        />

        <article className="mx-auto max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.event_date || post.created_at).toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {authorDisplayName && (
              <div className="flex items-center gap-2">
                {authorProfile?.avatar_url ? (
                  <img src={authorProfile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
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
            {post.category && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                {post.category}
              </span>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground font-medium border-l-4 border-primary pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="mt-10 max-w-none">
            <MarkdownContent content={post.content} />
          </div>

          <div className="mt-12 border-t pt-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/aktuelles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {"Zurueck zu Aktuelles"}
              </Link>
            </Button>
          </div>
        </article>
      </main>
    </SiteLayout>
  )
}
