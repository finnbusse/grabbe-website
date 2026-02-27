import { createClient } from "@/lib/supabase/server"
import { formatEventTime } from "@/lib/db-helpers"
import Link from "next/link"
import { Plus, CalendarDays, MapPin, Tag as TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
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
    .order("starts_at", { ascending: true })

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
          <h1 className="font-display text-2xl font-bold text-foreground">Termine</h1>
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

      <div className="mt-6">
        {events && events.length > 0 ? (
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Titel</TableHead>
                  <TableHead className="hidden sm:table-cell">Ort</TableHead>
                  <TableHead className="hidden md:table-cell">Tags</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {new Date(event.starts_at).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        {!event.is_all_day && (() => {
                          const time = formatEventTime(event.starts_at)
                          return time ? <span className="text-muted-foreground">{time}</span> : null
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/cms/events/${event.id}`}
                        className="text-sm font-medium text-card-foreground hover:text-primary"
                      >
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {event.location && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(eventTagsMap.get(event.id) || []).map((tag) => {
                          const c = TAG_COLORS[tag.color] || TAG_COLORS.blue
                          return (
                            <Badge key={tag.id} className={`${c.bg} ${c.text} ${c.border} text-[10px] font-medium hover:opacity-90`}>
                              <TagIcon className="mr-0.5 h-2 w-2" />{tag.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/cms/events/${event.id}`}>Bearbeiten</Link>
                        </Button>
                        <DeleteEventButton eventId={event.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
