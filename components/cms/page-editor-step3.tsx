"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePageWizard, clearWizardStorage, buildFullUrl } from "./page-wizard-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TagBadge, type TagData } from "./tag-selector"
import { ArrowLeft, Loader2, Save, Rocket, Check, X } from "lucide-react"
import { toast } from "sonner"

// ============================================================================
// Step 3 — SEO & Publish
// ============================================================================

export function PageEditorStep3() {
  const { state, dispatch } = usePageWizard()
  const router = useRouter()
  const [publishState, setPublishState] = useState<"idle" | "saving" | "success">("idle")
  const [error, setError] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<TagData[]>([])

  // Load tags for display
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data)
      })
      .catch(() => {})
  }, [])

  const selectedTags = allTags.filter((t) => state.tagIds.includes(t.id))

  const fullUrl = buildFullUrl(state.routePath, state.slug)

  const wordCount =
    state.contentMode === "markdown"
      ? state.markdownContent.split(/\s+/).filter(Boolean).length
      : 0

  const blockCount = state.blocks.length

  const handleBack = () => {
    dispatch({ type: "SET_STEP", payload: 2 })
  }

  const handleSave = async (publish: boolean) => {
    setPublishState("saving")
    dispatch({ type: "SET_SAVING", payload: true })
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const finalContent =
        state.contentMode === "blocks"
          ? JSON.stringify(state.blocks)
          : state.markdownContent

      const payload = {
        title: state.title,
        slug: state.slug,
        content: finalContent,
        section: state.section || "allgemein",
        sort_order: state.sortOrder || 0,
        status: publish ? 'published' as const : 'draft' as const,
        route_path: state.routePath || null,
        hero_image_url: state.heroImageUrl || null,
        hero_subtitle: state.heroSubtitle || null,
        meta_description: state.metaDescription || null,
        seo_og_image: state.ogImageUrl || state.heroImageUrl || null,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      let saveError: unknown = null

      if (state.pageId) {
        // Update existing page
        const { error: err } = await supabase.from("pages").update(payload as never).eq("id", state.pageId)
        saveError = err
        if (err && ((err as { message?: string }).message?.includes("hero_image_url") || (err as { message?: string }).message?.includes("hero_subtitle"))) {
          const { hero_image_url: _a, hero_subtitle: _b, ...payloadWithout } = payload
          const { error: err2 } = await supabase.from("pages").update(payloadWithout as never).eq("id", state.pageId)
          saveError = err2
        }
      } else {
        // Insert new page
        const { error: err } = await supabase.from("pages").insert(payload as never)
        saveError = err
        if (err && ((err as { message?: string }).message?.includes("hero_image_url") || (err as { message?: string }).message?.includes("hero_subtitle"))) {
          const { hero_image_url: _a, hero_subtitle: _b, ...payloadWithout } = payload
          const { error: err2 } = await supabase.from("pages").insert(payloadWithout as never)
          saveError = err2
        }
      }

      if (saveError) throw saveError

      // Revalidate
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "pages" }),
        })
      } catch {
        // non-critical
      }

      clearWizardStorage()

      if (publish) {
        setPublishState("success")
        // Wait for celebration animation, then redirect
        setTimeout(() => {
          toast.success(state.pageId ? "Seite erfolgreich aktualisiert!" : "Seite erfolgreich veröffentlicht!")
          router.push("/cms/pages")
          router.refresh()
        }, 1500)
      } else {
        toast.success(state.pageId ? "Änderungen gespeichert!" : "Entwurf gespeichert!")
        router.push("/cms/pages")
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
      setPublishState("idle")
    } finally {
      dispatch({ type: "SET_SAVING", payload: false })
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column — Review Summary */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">Zusammenfassung</h3>

          <div className="rounded-2xl border bg-card p-5 space-y-4">
            {/* Title + URL */}
            <div>
              <p className="text-xs text-muted-foreground">Seitentitel</p>
              <p className="font-display font-semibold text-lg">{state.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">URL</p>
              <p className="text-sm font-mono text-foreground">{fullUrl}</p>
            </div>

            {/* Hero Image */}
            {state.heroImageUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Hero-Bild</p>
                <div className="overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={state.heroImageUrl} alt="Hero" className="h-24 w-full object-cover" />
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} size="xs" />
                  ))}
                </div>
              </div>
            )}

            {/* Content Info */}
            <div>
              <p className="text-xs text-muted-foreground">Inhaltstyp</p>
              <p className="text-sm">
                {state.contentMode === "blocks" ? (
                  <span>{blockCount} {blockCount === 1 ? "Baustein" : "Bausteine"}</span>
                ) : (
                  <span>Markdown · {wordCount} {wordCount === 1 ? "Wort" : "Wörter"}</span>
                )}
              </p>
            </div>

            {/* Date */}
            <div>
              <p className="text-xs text-muted-foreground">Erstellt am</p>
              <p className="text-sm">
                {new Date().toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — SEO Fields */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">SEO & Social Media</h3>

          <div className="rounded-2xl border bg-card p-5 space-y-4">
            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="meta-desc">Meta-Beschreibung</Label>
              <textarea
                id="meta-desc"
                value={state.metaDescription}
                onChange={(e) => dispatch({ type: "SET_META_DESCRIPTION", payload: e.target.value })}
                placeholder="Beschreibung für Suchmaschinen (max. 160 Zeichen)…"
                maxLength={200}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex justify-end">
                <span
                  className={`text-xs ${
                    state.metaDescription.length > 140
                      ? state.metaDescription.length > 160
                        ? "text-destructive font-medium"
                        : "text-amber-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {state.metaDescription.length}/160
                </span>
              </div>
            </div>

            {/* SEO Title */}
            <div className="space-y-2">
              <Label htmlFor="seo-title">SEO-Titel (optional)</Label>
              <Input
                id="seo-title"
                value={state.seoTitle}
                onChange={(e) => dispatch({ type: "SET_SEO_TITLE", payload: e.target.value })}
                placeholder={state.title || "Wird vom Seitentitel übernommen"}
              />
            </div>

            {/* OG Image */}
            <div className="space-y-2">
              <Label>OG-Bild (optional)</Label>
              <p className="text-xs text-muted-foreground">
                {state.heroImageUrl
                  ? "Standardmäßig wird das Hero-Bild verwendet."
                  : "Vorschaubild für Social Media."}
              </p>
              {state.ogImageUrl && (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={state.ogImageUrl} alt="OG" className="h-20 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_OG_IMAGE", payload: null })}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Google Preview */}
          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Google-Vorschau</p>
            <div className="space-y-0.5">
              <p className="text-base text-[#1a0dab] font-medium truncate">
                {state.seoTitle || state.title || "Seitentitel"}
              </p>
              <p className="text-xs text-[#006621] font-mono truncate">
                {fullUrl}
              </p>
              <p className="text-xs text-[#545454] line-clamp-2">
                {state.metaDescription || "Keine Meta-Beschreibung angegeben. Google wird automatisch einen Ausschnitt aus dem Seiteninhalt verwenden."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={publishState !== "idle"}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Als Entwurf speichern
          </Button>

          {publishState === "success" ? (
            <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-600 pointer-events-none publish-success-btn">
              <Check className="h-5 w-5" />
              {state.pageId ? "Gespeichert!" : "Veröffentlicht!"}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => handleSave(true)}
              disabled={publishState === "saving"}
              className="gap-2"
            >
              {publishState === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {publishState === "saving"
                ? (state.pageId ? "Wird gespeichert…" : "Wird veröffentlicht…")
                : (state.pageId ? "Speichern & Veröffentlichen" : "Jetzt veröffentlichen")}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
