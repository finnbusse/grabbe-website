"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePresentationWizard, clearPresentationWizardStorage } from "./presentation-wizard-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImagePicker } from "./image-picker"
import { TagBadge, type TagData } from "./tag-selector"
import { TeacherAuthorSelector } from "./teacher-author-selector"
import { PublishCelebration } from "./publish-celebration"
import { ArrowLeft, Loader2, Save, Rocket, Check } from "lucide-react"
import { toast } from "sonner"

// ============================================================================
// Step 3 — Einstellungen & Veröffentlichen
// ============================================================================

export function PresentationWizardStep3() {
  const { state, dispatch } = usePresentationWizard()
  const router = useRouter()
  const [publishState, setPublishState] = useState<"idle" | "saving" | "success">("idle")
  const [error, setError] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<TagData[]>([])
  const [celebrationUrl, setCelebrationUrl] = useState("")
  const [authorTeacherIds, setAuthorTeacherIds] = useState<string[]>([])

  // Load tags for display
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data)
      })
      .catch(() => {})
  }, [])

  // Load existing author teachers when editing
  useEffect(() => {
    if (!state.presentationId) return
    const supabase = createClient()
    supabase
      .from("presentation_authors")
      .select("teacher_id")
      .eq("presentation_id", state.presentationId)
      .then(({ data }) => {
        if (data) setAuthorTeacherIds(data.map((a: { teacher_id: string }) => a.teacher_id))
      })
      .catch(() => {})
  }, [state.presentationId])

  const selectedTags = allTags.filter((t) => state.tagIds.includes(t.id))
  const presentationUrl = `/p/${state.slug || "..."}`
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

      const isUpdate = !!state.presentationId

      // Ensure unique slug for new presentations
      let finalSlug = state.slug
      if (!isUpdate) {
        const { data: exactMatch } = await supabase
          .from("presentations")
          .select("slug")
          .eq("slug", state.slug)
        if (exactMatch && exactMatch.length > 0) {
          const { data: similarSlugs } = await supabase
            .from("presentations")
            .select("slug")
            .like("slug", `${state.slug}-%`)
          const slugSet = new Set([
            state.slug,
            ...((similarSlugs as Array<{ slug: string }> | null)?.map((p) => p.slug) ?? []),
          ])
          let counter = 2
          while (slugSet.has(`${state.slug}-${counter}`)) counter++
          finalSlug = `${state.slug}-${counter}`
          dispatch({ type: "SET_SLUG", payload: finalSlug })
        }
      }

      const payload: Record<string, unknown> = {
        title: state.title,
        slug: finalSlug,
        subtitle: state.subtitle || null,
        blocks: state.blocks,
        status: publish ? "published" : "draft",
        show_on_aktuelles: state.showOnAktuelles,
        tag_ids: state.tagIds,
        cover_image_url: state.coverImageUrl || null,
        meta_description: state.metaDescription || null,
        seo_og_image: state.seoOgImage || state.coverImageUrl || null,
        author_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (isUpdate) {
        const { error: saveError } = await supabase
          .from("presentations")
          .update(payload as never)
          .eq("id", state.presentationId!)
        if (saveError) throw saveError

        // Save author teachers
        await supabase.from("presentation_authors").delete().eq("presentation_id", state.presentationId!)
        if (authorTeacherIds.length > 0) {
          await supabase.from("presentation_authors").insert(
            authorTeacherIds.map((teacher_id) => ({ presentation_id: state.presentationId!, teacher_id })) as never
          )
        }
      } else {
        const { error: saveError } = await supabase
          .from("presentations")
          .insert(payload as never)
        if (saveError) throw saveError

        // Get the created ID for author teachers
        const { data: newPres } = await supabase
          .from("presentations")
          .select("id")
          .eq("slug", finalSlug)
          .order("created_at", { ascending: false })
          .limit(1)
        const presentations = newPres as Array<{ id: string }> | null
        if (presentations && presentations.length > 0 && authorTeacherIds.length > 0) {
          await supabase.from("presentation_authors").insert(
            authorTeacherIds.map((teacher_id) => ({ presentation_id: presentations[0].id, teacher_id })) as never
          )
        }
      }

      // Revalidate
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "presentations" }),
        })
      } catch {
        // non-critical
      }

      clearPresentationWizardStorage()

      if (publish) {
        setPublishState("success")
        setCelebrationUrl(presentationUrl)
      } else {
        toast.success("Entwurf gespeichert!")
        router.push("/cms/posts?tab=praesentationen")
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
      setPublishState("idle")
    } finally {
      dispatch({ type: "SET_SAVING", payload: false })
    }
  }

  const handleCelebrationClose = () => {
    setPublishState("idle")
    router.push("/cms/posts?tab=praesentationen")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column — Review Summary */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">Zusammenfassung</h3>

          <div className="rounded-2xl border bg-card p-5 space-y-4">
            {/* Cover Image */}
            {state.coverImageUrl && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Titelbild</p>
                <div className="overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={state.coverImageUrl} alt={`Titelbild für ${state.title}`} className="h-24 w-full object-cover" />
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <p className="text-xs text-muted-foreground">Titel</p>
              <p className="font-display font-semibold text-lg">{state.title}</p>
            </div>

            {/* Subtitle */}
            {state.subtitle && (
              <div>
                <p className="text-xs text-muted-foreground">Untertitel</p>
                <p className="text-sm">{state.subtitle}</p>
              </div>
            )}

            {/* Slug + URL */}
            <div>
              <p className="text-xs text-muted-foreground">URL</p>
              <p className="text-sm font-mono text-foreground">grabbe.site{presentationUrl}</p>
            </div>

            {/* Tags */}
            {selectedTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tags ({selectedTags.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} size="xs" />
                  ))}
                </div>
              </div>
            )}

            {/* Block Count */}
            <div>
              <p className="text-xs text-muted-foreground">Inhalt</p>
              <p className="text-sm">
                {blockCount} {blockCount === 1 ? "Block" : "Blöcke"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Settings */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">Einstellungen</h3>

          <div className="rounded-2xl border bg-card p-5 space-y-4">
            {/* Show on Aktuelles */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-on-aktuelles">Auf Aktuelles-Seite anzeigen</Label>
                <p className="text-[11px] text-muted-foreground">
                  Wird diese Präsentation auf der Aktuelles-Seite angezeigt?
                </p>
              </div>
              <Switch
                id="show-on-aktuelles"
                checked={state.showOnAktuelles}
                onCheckedChange={(v) => dispatch({ type: "SET_SHOW_ON_AKTUELLES", payload: v })}
              />
            </div>

            {/* Author Teachers */}
            <div className="grid gap-2 pt-2 border-t">
              <Label>Autor/innen (Lehrkräfte)</Label>
              <TeacherAuthorSelector
                selectedTeacherIds={authorTeacherIds}
                onChange={setAuthorTeacherIds}
              />
              <p className="text-[10px] text-muted-foreground">
                Tippen Sie @Kürzel ein, um Lehrkräfte als Autoren zuzuweisen.
              </p>
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <Label htmlFor="presentation-meta-desc">Meta-Beschreibung</Label>
              <textarea
                id="presentation-meta-desc"
                value={state.metaDescription}
                onChange={(e) => dispatch({ type: "SET_META_DESCRIPTION", payload: e.target.value })}
                placeholder="Beschreibung für Suchmaschinen (max. 160 Zeichen)…"
                maxLength={160}
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

            {/* SEO OG Image */}
            <div className="space-y-2">
              <Label>OG-Bild (optional)</Label>
              <p className="text-xs text-muted-foreground">
                {state.coverImageUrl
                  ? "Standardmäßig wird das Titelbild verwendet."
                  : "Vorschaubild für Social Media."}
              </p>
              <ImagePicker
                value={state.seoOgImage}
                onChange={(url) => dispatch({ type: "SET_SEO_OG_IMAGE", payload: url })}
                aspectRatio="16/9"
              />
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
            <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-600 pointer-events-none">
              <Check className="h-5 w-5" />
              Veröffentlicht!
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
              {publishState === "saving" ? "Wird veröffentlicht…" : "Jetzt veröffentlichen"}
            </Button>
          )}
        </div>
      </div>

      {/* Publish Celebration */}
      {publishState === "success" && (
        <PublishCelebration
          title={state.title}
          url={celebrationUrl}
          onClose={handleCelebrationClose}
        />
      )}
    </div>
  )
}
