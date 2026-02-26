"use client"

import { useState, useEffect } from "react"
import { usePostWizard, generateSlugWithDate } from "./post-wizard-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TagSelector } from "./tag-selector"
import { ImagePicker } from "./image-picker"
import { ArrowRight } from "lucide-react"

// ============================================================================
// Step 1 — Post Metadata
// ============================================================================

export function PostWizardStep1() {
  const { state, dispatch } = usePostWizard()
  const [categories, setCategories] = useState<string[]>([])

  // Fetch existing categories for datalist suggestions
  useEffect(() => {
    fetch("/api/posts/categories")
      .then((r) => r.json())
      .then((data: { categories?: string[] }) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories)
        }
      })
      .catch(() => {})
  }, [])

  const handleTitleChange = (value: string) => {
    dispatch({ type: "SET_TITLE", payload: value })
    if (!state.postId) {
      dispatch({ type: "SET_SLUG", payload: generateSlugWithDate(value, state.publishDate) })
    }
  }

  const handleDateChange = (value: string) => {
    dispatch({ type: "SET_PUBLISH_DATE", payload: value })
    if (!state.postId && state.title) {
      dispatch({ type: "SET_SLUG", payload: generateSlugWithDate(state.title, value) })
    }
  }

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 2 })
  }

  const canProceed = state.title.trim().length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      {/* Title + Slug */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-title" className="text-base font-semibold">
            Titel *
          </Label>
          <Input
            id="post-title"
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="z.B. Tag der offenen Tür 2025"
            className="font-display text-xl h-14 px-4"
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="post-slug" className="text-sm text-muted-foreground">
            URL-Slug
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">/aktuelles/</span>
            <Input
              id="post-slug"
              value={state.slug}
              onChange={(e) => dispatch({ type: "SET_SLUG", payload: e.target.value })}
              placeholder="url-slug"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label htmlFor="post-category" className="text-base font-semibold">
          Kategorie
        </Label>
        <Input
          id="post-category"
          list="category-suggestions"
          value={state.category}
          onChange={(e) => dispatch({ type: "SET_CATEGORY", payload: e.target.value })}
          placeholder="z.B. Aktuelles, Schulleben, Veranstaltungen"
        />
        <datalist id="category-suggestions">
          {categories.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>

      {/* Excerpt */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label htmlFor="post-excerpt" className="text-base font-semibold">
          Kurztext / Excerpt
        </Label>
        <p className="text-xs text-muted-foreground">
          Wird in der Übersicht und als Vorschautext angezeigt.
        </p>
        <textarea
          id="post-excerpt"
          value={state.excerpt}
          onChange={(e) => dispatch({ type: "SET_EXCERPT", payload: e.target.value })}
          placeholder="Kurze Zusammenfassung des Beitrags…"
          maxLength={300}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <div className="flex justify-end">
          <span
            className={`text-xs ${
              state.excerpt.length > 260
                ? state.excerpt.length > 300
                  ? "text-destructive font-medium"
                  : "text-amber-600"
                : "text-muted-foreground"
            }`}
          >
            {state.excerpt.length}/300
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label className="text-base font-semibold">Titelbild</Label>
        <p className="text-xs text-muted-foreground">
          Wird als großes Bild über dem Beitrag und in der Übersicht angezeigt.
        </p>
        <ImagePicker
          value={state.coverImageUrl}
          onChange={(url) => dispatch({ type: "SET_COVER_IMAGE", payload: url })}
          aspectRatio="16/9"
        />
      </div>

      {/* Date */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label htmlFor="post-date" className="text-base font-semibold">
          Datum
        </Label>
        <p className="text-xs text-muted-foreground">
          Wird als Beitragsdatum angezeigt. Standard: heute.
        </p>
        <Input
          id="post-date"
          type="date"
          value={state.publishDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label className="text-base font-semibold">Tags (optional)</Label>
        <TagSelector
          selectedTagIds={state.tagIds}
          onChange={(ids) => dispatch({ type: "SET_TAG_IDS", payload: ids })}
        />
      </div>

      {/* Auto-save indicator */}
      {state.lastAutoSaved && (
        <p className="text-center text-xs text-muted-foreground">
          Automatisch gespeichert um {state.lastAutoSaved}
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed} size="lg" className="gap-2">
          Weiter
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
