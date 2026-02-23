/**
 * Reusable server component for rendering tagged content sections.
 * Used on static pages (e.g. Oberstufe) to display events, downloads, or posts
 * filtered by a CMS-configurable tag ID.
 */

import { createClient } from "@/lib/supabase/server"
import { CalendarDays, Clock, MapPin, Download, FileText, ChevronRight } from "lucide-react"

interface TaggedSectionProps {
  type: "events" | "downloads" | "posts"
  tagId: string
  heading?: string
  limit?: number
}

export async function TaggedSection({ type, tagId, heading, limit = 10 }: TaggedSectionProps) {
  if (!tagId) return null

  const supabase = await createClient()

  if (type === "events") {
    const { data: eventTags } = await supabase.from("event_tags").select("event_id").eq("tag_id", tagId)
    if (!eventTags || eventTags.length === 0) {
      return heading ? (
        <div>
          <h3 className="font-display text-sm font-semibold mb-2">{heading}</h3>
          <p className="text-xs text-muted-foreground">Keine Termine vorhanden.</p>
        </div>
      ) : null
    }
    const today = new Date().toISOString().split("T")[0]
    const { data: events } = await supabase
      .from("events").select("*")
      .in("id", eventTags.map((et) => et.event_id))
      .eq("published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(limit)

    if (!events || events.length === 0) {
      return heading ? (
        <div>
          <h3 className="font-display text-sm font-semibold mb-2">{heading}</h3>
          <p className="text-xs text-muted-foreground">Keine anstehenden Termine.</p>
        </div>
      ) : null
    }

    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

    return (
      <div>
        {heading && <h3 className="font-display text-sm font-semibold mb-3">{heading}</h3>}
        <div className="space-y-2.5">
          {events.map((ev) => {
            const d = new Date(ev.event_date)
            return (
              <div key={ev.id} className="flex gap-3 rounded-xl border bg-background p-3">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[9px] font-medium uppercase leading-none">{monthNamesShort[d.getMonth()]}</span>
                  <span className="text-base font-bold leading-none mt-0.5">{d.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-xs font-semibold">{ev.title}</h4>
                  {ev.description && <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{ev.description}</p>}
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground">
                    {ev.event_time && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ev.event_time}</span>}
                    {ev.location && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{ev.location}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (type === "downloads") {
    const { data: docTags } = await supabase.from("document_tags").select("document_id").eq("tag_id", tagId)
    if (!docTags || docTags.length === 0) {
      return heading ? (
        <div>
          <h3 className="font-display text-sm font-semibold mb-2">{heading}</h3>
          <p className="text-xs text-muted-foreground">Keine Downloads vorhanden.</p>
        </div>
      ) : null
    }
    const { data: documents } = await supabase
      .from("documents").select("*")
      .in("id", docTags.map((dt) => dt.document_id))
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (!documents || documents.length === 0) {
      return heading ? (
        <div>
          <h3 className="font-display text-sm font-semibold mb-2">{heading}</h3>
          <p className="text-xs text-muted-foreground">Keine Downloads vorhanden.</p>
        </div>
      ) : null
    }

    return (
      <div>
        {heading && <h3 className="font-display text-sm font-semibold mb-3">{heading}</h3>}
        <div className="space-y-2">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{doc.title}</p>
                <p className="text-xs text-muted-foreground">{doc.file_name}</p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground shrink-0" />
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (type === "posts") {
    const { data: postTags } = await supabase.from("post_tags").select("post_id").eq("tag_id", tagId)
    if (!postTags || postTags.length === 0) {
      return heading ? (
        <div>
          <h3 className="font-display text-sm font-semibold mb-2">{heading}</h3>
          <p className="text-xs text-muted-foreground">Keine Beiträge vorhanden.</p>
        </div>
      ) : null
    }
    const { data: posts } = await supabase
      .from("posts").select("*")
      .in("id", postTags.map((pt) => pt.post_id))
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (!posts || posts.length === 0) {
      return heading ? (
        <div>
          <h3 className="font-display text-sm font-semibold mb-2">{heading}</h3>
          <p className="text-xs text-muted-foreground">Keine Beiträge vorhanden.</p>
        </div>
      ) : null
    }

    return (
      <div>
        {heading && <h3 className="font-display text-sm font-semibold mb-3">{heading}</h3>}
        <div className="space-y-2.5">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/aktuelles/${post.slug}`}
              className="block rounded-xl border bg-background p-3 transition-colors hover:bg-muted/50"
            >
              <h4 className="font-display text-xs font-semibold">{post.title}</h4>
              {post.excerpt && <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">{post.excerpt}</p>}
              <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
                <span>Weiterlesen</span>
                <ChevronRight className="h-2.5 w-2.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return null
}
