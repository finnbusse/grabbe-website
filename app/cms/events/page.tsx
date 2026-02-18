import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Plus, CalendarDays, MapPin, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteEventButton } from "@/components/cms/delete-event-button"

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

export default async function CmsEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })

  // Load all tags and event-tag assignments
  const { data: allTags } = await supabase.from("tags").select("*")
  const { data: eventTags } = await supabase.from("event_tags").select("*")

  const tagsMap = new Map((allTags || []).map((t) => [t.id, t]))
  const eventTagsMap = new Map<string, typeof allTags>()
  ;(eventTags || []).forEach((et) => {
    const tag = tagsMap.get(et.tag_id)
    if (!tag) return
    const existing = eventTagsMap.get(et.event_id) || []
    existing.push(tag)
    eventTagsMap.set(et.event_id, existing)
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Termine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verwalten Sie schulische Veranstaltungen und Termine.
          </p>
        </div>
        <Button asChild>
          <Link href="/cms/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Termin
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {events && events.length > 0 ? (
          events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="text-xs font-medium uppercase">
                    {new Date(event.event_date).toLocaleDateString("de-DE", { month: "short" })}
                  </span>
                  <span className="font-display text-lg font-bold leading-tight">
                    {new Date(event.event_date).getDate()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/cms/events/${event.id}`}
                      className="font-display text-sm font-semibold text-card-foreground hover:text-primary"
                    >
                      {event.title}
                    </Link>
                    {(eventTagsMap.get(event.id) || []).map((tag) => {
                      const c = TAG_COLORS[tag.color] || TAG_COLORS.blue
                      return (
                        <span key={tag.id} className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0 text-[10px] font-medium ${c.bg} ${c.text} ${c.border}`}>
                          <TagIcon className="h-2 w-2" />{tag.name}
                        </span>
                      )
                    })}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(event.event_date).toLocaleDateString("de-DE", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {event.event_time && `, ${event.event_time}`}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/cms/events/${event.id}`}>Bearbeiten</Link>
                </Button>
                <DeleteEventButton eventId={event.id} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">Noch keine Termine vorhanden.</p>
            <Button asChild className="mt-4">
              <Link href="/cms/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Ersten Termin erstellen
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
