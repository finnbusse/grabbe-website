"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { TagSelector, TagBadge } from "./tag-selector"
import type { TagData } from "./tag-selector"
import Link from "next/link"

interface EventEditorProps {
  event?: {
    id: string
    title: string
    description: string | null
    event_date: string
    event_end_date?: string | null
    event_time: string | null
    location: string | null
    published: boolean
  }
}

export function EventEditor({ event }: EventEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(event?.title ?? "")
  const [description, setDescription] = useState(event?.description ?? "")
  const [eventDate, setEventDate] = useState(event?.event_date ?? "")
  const [eventEndDate, setEventEndDate] = useState(event?.event_end_date ?? "")
  const [eventTime, setEventTime] = useState(event?.event_time ?? "")
  const [location, setLocation] = useState(event?.location ?? "")
  const [category, setCategory] = useState((event as Record<string, unknown>)?.category as string ?? "termin")
  const [published, setPublished] = useState(event?.published ?? true)
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
        event_date: eventDate,
        event_time: eventTime || null,
        location: location || null,
        category,
        published,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      // Try with event_end_date first, fall back without it if column doesn't exist
      const payloadWithEndDate = { ...basePayload, event_end_date: eventEndDate || null }

      const saveWithPayload = async (payload: Record<string, unknown>) => {
        if (event) {
          const { error } = await supabase.from("events").update(payload as never).eq("id", event.id)
          return error
        } else {
          const { error } = await supabase.from("events").insert(payload as never)
          return error
        }
      }

      let saveError = await saveWithPayload(payloadWithEndDate)

      // If the error mentions event_end_date column, retry without it
      if (saveError && saveError.message?.includes("event_end_date")) {
        saveError = await saveWithPayload(basePayload)
      }

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
          .eq("event_date", eventDate)
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
              <div className="grid gap-2">
                <Label htmlFor="event_date">Startdatum</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event_end_date">Enddatum (optional)</Label>
                <Input
                  id="event_end_date"
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  min={eventDate || undefined}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event_time">Uhrzeit (optional)</Label>
                <Input
                  id="event_time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="z.B. 18:00 Uhr"
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
                  <option value="pruefung">Pruefung / Klausur</option>
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
              <span className="text-sm text-card-foreground">Termin veroeffentlichen</span>
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
