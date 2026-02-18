/**
 * Server-side block content renderer for user-created pages.
 * Renders block-based content that was created in the CMS block editor.
 */

import { ChevronDown, CalendarDays, MapPin, Clock, Download, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

interface ContentBlock {
  id: string
  type: string
  data: Record<string, unknown>
}

export async function BlockContentRenderer({ content }: { content: string }) {
  let blocks: ContentBlock[] = []
  try {
    blocks = JSON.parse(content)
  } catch {
    return <p className="text-muted-foreground">Inhalt konnte nicht geladen werden.</p>
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null
  }

  return (
    <div>
      {blocks.map((block) => {
        if (block.type === 'tagged-events' || block.type === 'tagged-downloads' || block.type === 'tagged-posts') {
          return <TaggedBlockRenderer key={block.id} block={block} />
        }
        return <BlockRenderer key={block.id} block={block} />
      })}
    </div>
  )
}

async function TaggedBlockRenderer({ block }: { block: ContentBlock }) {
  const tagId = block.data.tagId as string
  const heading = block.data.heading as string
  const limit = (block.data.limit as number) || 10

  if (!tagId) {
    return (
      <div className="mb-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Kein Tag ausgewaehlt
      </div>
    )
  }

  const supabase = await createClient()

  // Get tag info for color
  const { data: tag } = await supabase.from("tags").select("*").eq("id", tagId).single()
  const tagColor = tag?.color || "blue"

  if (block.type === 'tagged-events') {
    const { data: eventTags } = await supabase.from("event_tags").select("event_id").eq("tag_id", tagId)
    if (!eventTags || eventTags.length === 0) {
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
          <p className="text-sm text-muted-foreground">Keine Termine mit diesem Tag vorhanden.</p>
        </div>
      )
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
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
          <p className="text-sm text-muted-foreground">Keine anstehenden Termine vorhanden.</p>
        </div>
      )
    }

    const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

    return (
      <div className="mb-8">
        {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
        <div className="space-y-3">
          {events.map((ev) => {
            const d = new Date(ev.event_date)
            return (
              <div key={ev.id} className="flex gap-4 rounded-xl border bg-card p-4">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="text-[10px] font-medium uppercase leading-none">{monthNamesShort[d.getMonth()]}</span>
                  <span className="text-lg font-bold leading-none mt-0.5">{d.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-semibold">{ev.title}</h3>
                  {ev.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{ev.description}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {ev.event_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.event_time}</span>}
                    {ev.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.location}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (block.type === 'tagged-downloads') {
    const { data: docTags } = await supabase.from("document_tags").select("document_id").eq("tag_id", tagId)
    if (!docTags || docTags.length === 0) {
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
          <p className="text-sm text-muted-foreground">Keine Downloads mit diesem Tag vorhanden.</p>
        </div>
      )
    }
    const { data: documents } = await supabase
      .from("documents").select("*")
      .in("id", docTags.map((dt) => dt.document_id))
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (!documents || documents.length === 0) {
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
          <p className="text-sm text-muted-foreground">Keine Downloads vorhanden.</p>
        </div>
      )
    }

    return (
      <div className="mb-8">
        {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
        <div className="space-y-2">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
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

  if (block.type === 'tagged-posts') {
    const { data: postTags } = await supabase.from("post_tags").select("post_id").eq("tag_id", tagId)
    if (!postTags || postTags.length === 0) {
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
          <p className="text-sm text-muted-foreground">Keine Beitraege mit diesem Tag vorhanden.</p>
        </div>
      )
    }
    const { data: posts } = await supabase
      .from("posts").select("*")
      .in("id", postTags.map((pt) => pt.post_id))
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (!posts || posts.length === 0) {
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
          <p className="text-sm text-muted-foreground">Keine Beitraege vorhanden.</p>
        </div>
      )
    }

    return (
      <div className="mb-8">
        {heading && <h2 className="font-display text-xl font-bold mb-4">{heading}</h2>}
        <div className="space-y-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href={`/aktuelles/${post.slug}`}
              className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <h3 className="font-display text-sm font-semibold">{post.title}</h3>
              {post.excerpt && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(post.event_date || post.created_at).toLocaleDateString("de-DE", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text': {
      const heading = block.data.heading as string
      const text = block.data.text as string
      return (
        <div className="mb-8">
          {heading && <h2 className="font-display text-xl font-bold mb-3">{heading}</h2>}
          {text && <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>}
        </div>
      )
    }
    case 'cards': {
      const cards = (block.data.cards as Array<{ title: string; text: string }>) || []
      return (
        <div className={`mb-8 grid gap-4 ${cards.length <= 2 ? 'sm:grid-cols-2' : cards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {cards.map((card, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold text-card-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      )
    }
    case 'faq': {
      const items = (block.data.items as Array<{ question: string; answer: string }>) || []
      return (
        <div className="mb-8 space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card">
              <summary className="cursor-pointer px-6 py-4 font-display text-sm font-semibold text-card-foreground list-none flex items-center justify-between">
                {item.question}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      )
    }
    case 'gallery': {
      const images = (block.data.images as Array<{ url: string; alt: string }>) || []
      const validImages = images.filter(img => img.url)
      return (
        <div className={`mb-8 grid gap-4 ${validImages.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {validImages.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border">
              <img src={img.url} alt={img.alt || ''} className="w-full h-auto object-cover" />
            </div>
          ))}
        </div>
      )
    }
    case 'list': {
      const heading = block.data.heading as string
      const items = (block.data.items as string[]) || []
      return (
        <div className="mb-8">
          {heading && <h3 className="font-display text-lg font-semibold mb-3">{heading}</h3>}
          <ul className="space-y-2">
            {items.filter(Boolean).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )
    }
    default:
      return null
  }
}
