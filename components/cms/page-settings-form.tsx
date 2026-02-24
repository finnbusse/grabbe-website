"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, Trash2, ChevronDown, Lock } from "lucide-react"
import { TagSelector } from "@/components/cms/tag-selector"
import { ImagePicker } from "@/components/cms/image-picker"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageSettingsData {
  id: string
  title: string
  slug: string
  route: string
  heroImageUrl: string
  metaDescription: string
  seoTitle: string
  seoOgImage: string
  published: boolean
  createdAt: string | null
  updatedAt: string | null
  tagIds: string[]
}

interface PageSettingsFormProps {
  page: PageSettingsData
  isStatic: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PageSettingsForm({ page, isStatic }: PageSettingsFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(page.title)
  const [heroImageUrl, setHeroImageUrl] = useState(page.heroImageUrl)
  const [metaDescription, setMetaDescription] = useState(page.metaDescription)
  const [seoTitle, setSeoTitle] = useState(page.seoTitle)
  const [seoOgImage, setSeoOgImage] = useState(page.seoOgImage)
  const [published, setPublished] = useState(page.published)
  const [tagIds, setTagIds] = useState<string[]>(page.tagIds)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showDanger, setShowDanger] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      if (isStatic) {
        // For static pages, save hero image via page-content API
        const res = await fetch("/api/page-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: page.id,
            content: { hero_image: heroImageUrl },
          }),
        })
        if (!res.ok) throw new Error("Speichern fehlgeschlagen")
      } else {
        // For custom pages, update the pages table
        const supabase = createClient()
        const payload: Record<string, unknown> = {
          title,
          hero_image_url: heroImageUrl || null,
          meta_description: metaDescription || null,
          seo_og_image: seoOgImage || null,
          published,
          updated_at: new Date().toISOString(),
        }
        const { error: err } = await supabase.from("pages").update(payload as never).eq("id", page.id)
        if (err) {
          // Retry without hero_image_url if column doesn't exist
          if ((err as { message?: string }).message?.includes("hero_image_url")) {
            const { hero_image_url: _dropped, ...payloadWithout } = payload
            const { error: err2 } = await supabase.from("pages").update(payloadWithout as never).eq("id", page.id)
            if (err2) throw err2
          } else {
            throw err
          }
        }
      }

      // Revalidate
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: page.route }),
      }).catch(() => {})

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (isStatic) return
    if (!confirm("Seite wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from("pages").delete().eq("id", page.id)
      if (err) throw err
      router.push("/cms/seiten")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen")
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cms/seiten"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Einstellungen</h1>
            <p className="text-sm text-muted-foreground">{page.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/cms/seiten/${page.id}/bearbeiten`}>
              Bearbeiten
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Einstellungen gespeichert!
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Title */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Seitentitel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Seitentitel"
                className="font-display text-lg"
                disabled={isStatic}
              />
              {isStatic && (
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" /> Titel geschützter Seiten kann nicht geändert werden
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>URL / Pfad</Label>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                <span className="text-sm font-mono text-muted-foreground">{page.route}</span>
              </div>
              {!isStatic && (
                <p className="text-[11px] text-muted-foreground">Pfad kann in der Seitenstruktur geändert werden</p>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">Hero-Bild</h3>
            <ImagePicker
              value={heroImageUrl || null}
              onChange={(url) => setHeroImageUrl(url || "")}
              label="Hero-Bild auswählen"
              aspectRatio="16/9"
            />
          </div>

          {/* Tags */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">Tags</h3>
            <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status */}
          {!isStatic && (
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="font-display text-sm font-semibold">Status</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pub">Veröffentlicht</Label>
                  <p className="text-[11px] text-muted-foreground">Seite ist für Besucher sichtbar</p>
                </div>
                <Switch id="pub" checked={published} onCheckedChange={setPublished} />
              </div>
            </div>
          )}

          {/* SEO */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">SEO</h3>
            <div className="grid gap-2">
              <Label htmlFor="seoTitle">SEO-Titel (optional)</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Eigener Titel für Suchmaschinen"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metaDesc">Meta-Beschreibung</Label>
              <textarea
                id="metaDesc"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Kurze Beschreibung für Suchmaschinen (max. 160 Zeichen)"
                maxLength={320}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <span className={`text-[10px] ${metaDescription.length > 160 ? "text-amber-600" : "text-muted-foreground"}`}>
                {metaDescription.length}/160 Zeichen
              </span>
            </div>
            <div className="grid gap-2">
              <Label>Social-Media Bild</Label>
              <ImagePicker
                value={seoOgImage || null}
                onChange={(url) => setSeoOgImage(url || "")}
                label="OG-Bild"
                aspectRatio="16/9"
              />
            </div>
          </div>

          {/* Timestamps */}
          {(page.createdAt || page.updatedAt) && (
            <div className="rounded-2xl border bg-card p-6 space-y-2">
              <h3 className="font-display text-sm font-semibold">Zeitstempel</h3>
              {page.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Erstellt am: {new Date(page.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              {page.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Zuletzt bearbeitet: {new Date(page.updatedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          )}

          {/* Danger zone */}
          {!isStatic && (
            <div className="rounded-2xl border border-destructive/30 bg-card">
              <button
                type="button"
                onClick={() => setShowDanger(!showDanger)}
                className="flex w-full items-center justify-between px-6 py-4 text-sm font-semibold text-destructive"
              >
                Gefährliche Zone
                <ChevronDown className={`h-4 w-4 transition-transform ${showDanger ? "rotate-180" : ""}`} />
              </button>
              {showDanger && (
                <div className="border-t border-destructive/20 px-6 py-4">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Das Löschen einer Seite kann nicht rückgängig gemacht werden. Alle Inhalte gehen verloren.
                  </p>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
                    Seite löschen
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
