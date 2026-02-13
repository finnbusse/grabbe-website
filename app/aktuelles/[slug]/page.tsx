import { SiteLayout } from "@/components/site-layout"
import { MarkdownContent } from "@/components/markdown-content"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CalendarDays, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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

  return (
    <SiteLayout>
      <main>
        <article className="mx-auto max-w-3xl px-4 py-16 lg:px-8 lg:py-24">
          <h1 className="text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.event_date || post.created_at).toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {post.author_name && (
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author_name}
              </div>
            )}
            {post.category && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                {post.category}
              </span>
            )}
          </div>

          {post.image_url && (
            <div className="mt-8 overflow-hidden rounded-xl">
              <Image
                src={post.image_url}
                alt={post.title}
                width={800}
                height={400}
                className="w-full object-cover"
              />
            </div>
          )}

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
