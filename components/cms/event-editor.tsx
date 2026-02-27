"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { TagSelector } from "./tag-selector"
import { DateRangePicker } from "./date-range-picker"
import Link from "next/link"

interface EventEditorProps {
  event?: {
    id: string
    title: string
    description: string | null
    starts_at: string
    ends_at?: string | null
    is_all_day?: boolean | null
    timezone?: string
    location: string | null
    status: string
  }
}

export function EventEditor({ event }: EventEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(event?.title ?? "")
  const [description, setDescription] = useState(event?.description ?? "")
  const [eventDate, setEventDate] = useState(() => {
    if (!event?.starts_at) return ""
    return new Date(event.starts_at).toISOString().split("T")[0]
  })
  const [eventEndDate, setEventEndDate] = useState(() => {
    if (!event?.ends_at) return ""
    return new Date(event.ends_at).toISOString().split("T")[0]
  })
  const [eventTime, setEventTime] = useState(() => {
    if (!event?.starts_at || event?.is_all_day) return ""
    const d = new Date(event.starts_at)
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  })
  const [isAllDay, setIsAllDay] = useState(event?.is_all_day ?? false)
  const [location, setLocation] = useState(event?.location ?? "")
  const [category, setCategory] = useState((event as Record<string, unknown>)?.category as string ?? "termin")
  const [published, setPublished] = useState(event?.status ? event.status === 'published' : true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagIds, setTagIds] = useState<string[]>([])

  // Load existing tags for this event
  useEffect(() => {
    if (!event) return
    const supabase = createClient()
    supabase
      .from("event_tags")
      .select("tag_id")
      .eq("event_id", event.id)
      .then(({ data }) => {
        if (data) setTagIds(data.map((t) => t.tag_id))
      })
      .catch(() => {})
  }, [event])

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const basePayload: Record<string, unknown> = {
        title,
        description: description || null,
        starts_at: eventTime && !isAllDay
          ? `${eventDate}T${eventTime}:00`
          : `${eventDate}T00:00:00`,
        ends_at: isAllDay && eventEndDate
          ? `${eventEndDate}T23:59:59`
          : null,
        is_all_day: isAllDay,
        timezone: event?.timezone ?? 'Europe/Berlin',
        location: location || null,
        category,
        status: published ? 'published' : 'draft',
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      const saveWithPayload = async (payload: Record<string, unknown>) => {
        if (event) {
          const { error } = await supabase.from("events").update(payload as never).eq("id", event.id)
          return error
        } else {
          const { error } = await supabase.from("events").insert(payload as never)
          return error
        }
      }

      let saveError = await saveWithPayload(basePayload)

      if (saveError) throw saveError

      // Save tags
      const savedEventId = event?.id
      if (savedEventId) {
        // Delete old tag assignments and insert new ones
        await supabase.from("event_tags").delete().eq("event_id", savedEventId)
        if (tagIds.length > 0) {
          await supabase.from("event_tags").insert(
            tagIds.map((tag_id) => ({ event_id: savedEventId, tag_id }))
          )
        }
      } else {
        // For new events, get the created ID and assign tags
        const { data: newEvents } = await supabase
          .from("events")
          .select("id")
          .eq("title", title)
          .eq("starts_at", basePayload.starts_at as string)
          .order("created_at", { ascending: false })
          .limit(1)
        if (newEvents && newEvents.length > 0 && tagIds.length > 0) {
          await supabase.from("event_tags").insert(
            tagIds.map((tag_id) => ({ event_id: newEvents[0].id, tag_id }))
          )
        }
      }

      router.push("/cms/events")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cms/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {event ? "Termin bearbeiten" : "Neuer Termin"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving || !title || !eventDate}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {saving ? "Speichern..." : "Speichern"}
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 max-w-2xl space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Elternabend Klasse 5"
                className="font-display"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="col-span-full lg:col-span-3">
                <DateRangePicker
                  date={eventDate}
                  endDate={eventEndDate}
                  time={eventTime}
                  isAllDay={isAllDay}
                  onDateChange={setEventDate}
                  onEndDateChange={setEventEndDate}
                  onTimeChange={setEventTime}
                  onIsAllDayChange={setIsAllDay}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategorie</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="termin">Schultermin</option>
                  <option value="ferien">Ferien</option>
                  <option value="pruefung">Prüfung / Klausur</option>
                  <option value="veranstaltung">Veranstaltung</option>
                  <option value="elternabend">Elternabend</option>
                  <option value="projekttag">Projekttag</option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Ort (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. Aula, Mensa, Sporthalle"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung (optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Weitere Informationen zum Termin..."
                className="min-h-[120px] w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm text-card-foreground">Termin veröffentlichen</span>
            </label>
            <div className="grid gap-2 pt-2 border-t">
              <Label>Tags</Label>
              <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
