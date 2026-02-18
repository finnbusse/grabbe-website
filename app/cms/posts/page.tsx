import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, CalendarDays, Eye, EyeOff, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeletePostButton } from "@/components/cms/delete-post-button"

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue:    { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200" },
  green:   { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  red:     { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200" },
  yellow:  { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200" },
  purple:  { bg: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200" },
  pink:    { bg: "bg-pink-100",    text: "text-pink-700",    border: "border-pink-200" },
  orange:  { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200" },
  teal:    { bg: "bg-teal-100",    text: "text-teal-700",    border: "border-teal-200" },
  gray:    { bg: "bg-gray-100",    text: "text-gray-700",    border: "border-gray-200" },
}

export default async function CmsPostsPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  // Load all tags and post-tag assignments
  const { data: allTags } = await supabase.from("tags").select("*")
  const { data: postTags } = await supabase.from("post_tags").select("*")

  const tagsMap = new Map((allTags || []).map((t) => [t.id, t]))
  const postTagsMap = new Map<string, typeof allTags>()
  ;(postTags || []).forEach((pt) => {
    const tag = tagsMap.get(pt.tag_id)
    if (!tag) return
    const existing = postTagsMap.get(pt.post_id) || []
    existing.push(tag)
    postTagsMap.set(pt.post_id, existing)
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Beitraege</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Erstellen und verwalten Sie Neuigkeiten und Aktuelles.
          </p>
        </div>
        <Button asChild>
          <Link href="/cms/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Beitrag
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/cms/posts/${post.id}`}
                    className="font-display text-sm font-semibold text-card-foreground hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  {post.published ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                      <Eye className="h-3 w-3" />
                      Veroeffentlicht
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <EyeOff className="h-3 w-3" />
                      Entwurf
                    </span>
                  )}
                  {(postTagsMap.get(post.id) || []).map((tag) => {
                    const c = TAG_COLORS[tag.color] || TAG_COLORS.blue
                    return (
                      <span key={tag.id} className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0 text-[10px] font-medium ${c.bg} ${c.text} ${c.border}`}>
                        <TagIcon className="h-2 w-2" />{tag.name}
                      </span>
                    )
                  })}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(post.event_date || post.created_at).toLocaleDateString("de-DE")}
                  </span>
                  {post.category && <span>{post.category}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/cms/posts/${post.id}`}>Bearbeiten</Link>
                </Button>
                <DeletePostButton postId={post.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">Noch keine Beitraege vorhanden.</p>
            <Button asChild className="mt-4">
              <Link href="/cms/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                Ersten Beitrag erstellen
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
