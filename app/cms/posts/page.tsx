import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, CalendarDays, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeletePostButton } from "@/components/cms/delete-post-button"

export default async function CmsPostsPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

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
                <div className="flex items-center gap-2">
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
