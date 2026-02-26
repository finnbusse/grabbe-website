"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePostWizard, clearPostWizardStorage } from "./post-wizard-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePicker } from "./image-picker"
import { SeoPreview } from "./seo-preview"
import { TagBadge, type TagData } from "./tag-selector"
import { PublishCelebration } from "./publish-celebration"
import { ArrowLeft, Loader2, Save, Rocket, Check } from "lucide-react"
import { toast } from "sonner"

// ============================================================================
// Step 3 — SEO & Publish
// ============================================================================

export function PostWizardStep3() {
  const { state, dispatch } = usePostWizard()
  const router = useRouter()
  const [publishState, setPublishState] = useState<"idle" | "saving" | "success">("idle")
  const [error, setError] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<TagData[]>([])
  const [authorName, setAuthorName] = useState("")
  const [seoSeparator, setSeoSeparator] = useState(" / ")
  const [seoSuffix, setSeoSuffix] = useState("Grabbe-Gymnasium")
  const [celebrationUrl, setCelebrationUrl] = useState("")

  // Load tags for display
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data)
      })
      .catch(() => {})
  }, [])

  // Load author name from user profile
  useEffect(() => {
    fetch("/api/user-profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { profile?: { title?: string; first_name?: string; last_name?: string } } | null) => {
        if (data?.profile) {
          const parts = [data.profile.title, data.profile.first_name, data.profile.last_name].filter(Boolean)
          if (parts.length > 0) setAuthorName(parts.join(" "))
        }
      })
      .catch(() => {})
  }, [])

  // Load SEO settings
  useEffect(() => {
    async function loadSeoSettings() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["seo_title_separator", "seo_title_suffix"])
        if (data) {
          for (const row of data as Array<{ key: string; value: string }>) {
            if (row.key === "seo_title_separator" && row.value) setSeoSeparator(row.value)
            if (row.key === "seo_title_suffix" && row.value) setSeoSuffix(row.value)
          }
        }
      } catch {
        // use defaults
      }
    }
    loadSeoSettings()
  }, [])

  const selectedTags = allTags.filter((t) => state.tagIds.includes(t.id))
  const postUrl = `/aktuelles/${state.slug || "..."}`
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

      const isUpdate = !!state.postId

      // Ensure unique slug for new posts
      let finalSlug = state.slug
      if (!isUpdate) {
        const { data: existingSlugs } = await supabase
          .from("posts")
          .select("slug")
          .like("slug", `${state.slug}%`)
        const slugSet = new Set((existingSlugs as Array<{ slug: string }> | null)?.map((p) => p.slug) ?? [])
        if (slugSet.has(finalSlug)) {
          let counter = 2
          while (slugSet.has(`${state.slug}-${counter}`)) counter++
          finalSlug = `${state.slug}-${counter}`
          dispatch({ type: "SET_SLUG", payload: finalSlug })
        }
      }

      const basePayload: Record<string, unknown> = {
        title: state.title,
        slug: finalSlug,
        content: finalContent,
        excerpt: state.excerpt || null,
        category: state.category || null,
        published: publish,
        featured: false,
        image_url: state.coverImageUrl || null,
        author_name: authorName || user.email?.split("@")[0] || "Redaktion",
        user_id: user.id,
        updated_at: new Date().toISOString(),
        meta_description: state.metaDescription || null,
        seo_og_image: state.ogImageUrl || state.coverImageUrl || null,
      }

      const payloadWithDate = { ...basePayload, event_date: state.publishDate || null }

      const saveWithPayload = async (payload: Record<string, unknown>) => {
        if (isUpdate) {
          const { error } = await supabase.from("posts").update(payload as never).eq("id", state.postId!)
          return error
        } else {
          const { error } = await supabase.from("posts").insert(payload as never)
          return error
        }
      }

      let saveError = await saveWithPayload(payloadWithDate)

      // If the error mentions event_date column, retry without it
      if (saveError && (saveError as { message?: string }).message?.includes("event_date")) {
        saveError = await saveWithPayload(basePayload)
      }

      if (saveError) throw saveError

      // Save tags
      if (isUpdate && state.postId) {
        await supabase.from("post_tags").delete().eq("post_id", state.postId)
        if (state.tagIds.length > 0) {
          await supabase.from("post_tags").insert(
            state.tagIds.map((tag_id) => ({ post_id: state.postId!, tag_id })) as never
          )
        }
      } else {
        // For new posts, get the created ID and assign tags
        const { data: newPosts } = await supabase
          .from("posts")
          .select("id")
          .eq("slug", finalSlug)
          .order("created_at", { ascending: false })
          .limit(1)

        const posts = newPosts as Array<{ id: string }> | null
        if (posts && posts.length > 0) {
          const newPostId = posts[0].id
          dispatch({ type: "SET_POST_ID", payload: newPostId })

          if (state.tagIds.length > 0) {
            await supabase.from("post_tags").insert(
              state.tagIds.map((tag_id) => ({ post_id: newPostId, tag_id })) as never
            )
          }
        }
      }

      // Revalidate
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "posts" }),
        })
      } catch {
        // non-critical
      }

      clearPostWizardStorage()

      if (publish) {
        setPublishState("success")
        setCelebrationUrl(postUrl)
      } else {
        toast.success("Entwurf gespeichert!")
        router.push("/cms/posts")
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
    router.push("/cms/posts")
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
                  <img src={state.coverImageUrl} alt="Cover" className="h-24 w-full object-cover" />
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <p className="text-xs text-muted-foreground">Titel</p>
              <p className="font-display font-semibold text-lg">{state.title}</p>
            </div>

            {/* Slug + URL */}
            <div>
              <p className="text-xs text-muted-foreground">URL</p>
              <p className="text-sm font-mono text-foreground">grabbe.site{postUrl}</p>
            </div>

            {/* Category */}
            {state.category && (
              <div>
                <p className="text-xs text-muted-foreground">Kategorie</p>
                <p className="text-sm">{state.category}</p>
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

            {/* Excerpt */}
            {state.excerpt && (
              <div>
                <p className="text-xs text-muted-foreground">Kurztext</p>
                <p className="text-sm line-clamp-3">{state.excerpt}</p>
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

            {/* Author */}
            {authorName && (
              <div>
                <p className="text-xs text-muted-foreground">Autor</p>
                <p className="text-sm">{authorName}</p>
              </div>
            )}

            {/* Date */}
            <div>
              <p className="text-xs text-muted-foreground">Datum</p>
              <p className="text-sm">
                {state.publishDate
                  ? new Date(state.publishDate + "T00:00:00").toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : new Date().toLocaleDateString("de-DE", {
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
              <Label htmlFor="post-meta-desc">Meta-Beschreibung</Label>
              <textarea
                id="post-meta-desc"
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
              <Label htmlFor="post-seo-title">SEO-Titel (optional)</Label>
              <Input
                id="post-seo-title"
                value={state.seoTitle}
                onChange={(e) => dispatch({ type: "SET_SEO_TITLE", payload: e.target.value })}
                placeholder={state.title || "Wird vom Beitragstitel übernommen"}
              />
            </div>

            {/* OG Image */}
            <div className="space-y-2">
              <Label>OG-Bild (optional)</Label>
              <p className="text-xs text-muted-foreground">
                {state.coverImageUrl
                  ? "Standardmäßig wird das Titelbild verwendet."
                  : "Vorschaubild für Social Media."}
              </p>
              <ImagePicker
                value={state.ogImageUrl}
                onChange={(url) => dispatch({ type: "SET_OG_IMAGE", payload: url })}
                aspectRatio="16/9"
              />
            </div>
          </div>

          {/* Google Preview */}
          <SeoPreview
            title={state.seoTitle || state.title}
            description={state.metaDescription || state.excerpt || ""}
            url={postUrl}
            titleSeparator={seoSeparator}
            titleSuffix={seoSuffix}
          />
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
