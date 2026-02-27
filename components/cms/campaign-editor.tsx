"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { Campaign, CampaignButton } from "@/lib/types/database.types"

interface CampaignEditorProps {
  campaign?: Campaign
}

const OVERLAY_OPTIONS = [
  { value: "blur", label: "Blur" },
  { value: "dark", label: "Dunkel" },
  { value: "light", label: "Hell" },
] as const

const BUTTON_STYLE_OPTIONS = [
  { value: "primary", label: "Primär" },
  { value: "secondary", label: "Sekundär" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
] as const

export function CampaignEditor({ campaign }: CampaignEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(campaign?.title ?? "")
  const [headline, setHeadline] = useState(campaign?.headline ?? "")
  const [message, setMessage] = useState(campaign?.message ?? "")
  const [isActive, setIsActive] = useState(campaign?.is_active ?? false)
  const [startsAt, setStartsAt] = useState(campaign?.starts_at?.slice(0, 16) ?? "")
  const [endsAt, setEndsAt] = useState(campaign?.ends_at?.slice(0, 16) ?? "")
  const [showOnce, setShowOnce] = useState(campaign?.show_once ?? true)
  const [overlayStyle, setOverlayStyle] = useState<Campaign["overlay_style"]>(campaign?.overlay_style ?? "blur")
  const [accentColor, setAccentColor] = useState(campaign?.accent_color ?? "#2563eb")
  const [buttons, setButtons] = useState<CampaignButton[]>(campaign?.buttons ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addButton = () => {
    setButtons([
      ...buttons,
      {
        id: crypto.randomUUID(),
        label: "",
        url: "",
        style: "primary",
        target: "_self",
      },
    ])
  }

  const updateButton = (id: string, field: keyof CampaignButton, value: string) => {
    setButtons(buttons.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const removeButton = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const payload = {
        title,
        headline,
        message,
        is_active: isActive,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        show_once: showOnce,
        overlay_style: overlayStyle,
        accent_color: accentColor,
        buttons: buttons.filter((b) => b.label && b.url),
        user_id: user.id,
      }

      if (campaign) {
        const { error } = await supabase.from("campaigns").update(payload as never).eq("id", campaign.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("campaigns").insert(payload as never)
        if (error) throw error
      }

      toast.success(campaign ? "Kampagne aktualisiert" : "Kampagne erstellt")
      router.push("/cms/campaigns")
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fehler beim Speichern"
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cms/campaigns">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {campaign ? "Kampagne bearbeiten" : "Neue Kampagne"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving || !title || !headline || !message}>
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
        {/* Basic info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Interner Titel (nur CMS)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Tag der offenen Tür 2026"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="headline">Überschrift (wird im Popup angezeigt)</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="z.B. Willkommen zum Tag der offenen Tür!"
                className="font-display"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Nachricht</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Beschreibungstext für das Popup..."
                className="min-h-[120px] w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Settings */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Zeitplanung &amp; Einstellungen</p>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="starts_at">Startzeit (optional)</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ends_at">Endzeit (optional)</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Aktiv</Label>
                <p className="text-xs text-muted-foreground">Kampagne wird auf der Website angezeigt</p>
              </div>
              <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show_once">Nur einmal anzeigen</Label>
                <p className="text-xs text-muted-foreground">Besucher sehen das Popup nur beim ersten Besuch</p>
              </div>
              <Switch id="show_once" checked={showOnce} onCheckedChange={setShowOnce} />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Darstellung</p>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="overlay_style">Overlay-Stil</Label>
                <select
                  id="overlay_style"
                  value={overlayStyle}
                  onChange={(e) => setOverlayStyle(e.target.value as Campaign["overlay_style"])}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {OVERLAY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accent_color">Akzentfarbe</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="accent_color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-input"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#2563eb"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Buttons</p>
            <Button variant="outline" size="sm" onClick={addButton}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Button hinzufügen
            </Button>
          </div>
          {buttons.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Buttons. Klicken Sie oben, um einen hinzuzufügen.</p>
          ) : (
            <div className="space-y-3">
              {buttons.map((btn) => (
                <div key={btn.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        value={btn.label}
                        onChange={(e) => updateButton(btn.id, "label", e.target.value)}
                        placeholder="Button-Text"
                      />
                      <Input
                        value={btn.url}
                        onChange={(e) => updateButton(btn.id, "url", e.target.value)}
                        placeholder="URL z.B. /anmeldung"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <select
                        value={btn.style}
                        onChange={(e) => updateButton(btn.id, "style", e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {BUTTON_STYLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <select
                        value={btn.target}
                        onChange={(e) => updateButton(btn.id, "target", e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="_self">Gleicher Tab</option>
                        <option value="_blank">Neuer Tab</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => removeButton(btn.id)}
                    className="mt-2.5 rounded-lg p-1 text-muted-foreground hover:text-destructive"
                    aria-label="Button entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
