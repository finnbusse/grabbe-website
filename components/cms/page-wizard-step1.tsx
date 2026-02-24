"use client"

import { useState, useEffect } from "react"
import { usePageWizard, generateSlug, buildFullUrl } from "./page-wizard-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TagSelector } from "./tag-selector"
import { ArrowRight, FolderOpen, Check, Loader2 } from "lucide-react"
import { ImagePicker } from "./image-picker"
import { createClient } from "@/lib/supabase/client"

// ============================================================================
// Types
// ============================================================================

interface CategoryDef {
  id: string
  slug: string
  label: string
  sort_order: number
  children: CategoryDef[]
}

// ============================================================================
// Step 1 — Page Setup
// ============================================================================

export function PageWizardStep1() {
  const { state, dispatch } = usePageWizard()
  const [categories, setCategories] = useState<CategoryDef[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [errors, setErrors] = useState<{ title?: string; routePath?: string }>({})

  // Fetch categories from site_structure setting
  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClient()
        const { data: structData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "site_structure")
          .single()

        if ((structData as unknown as { value?: string })?.value) {
          try {
            const row = structData as unknown as { value: string }
            const parsed = JSON.parse(row.value)
            if (parsed.categories?.length > 0) {
              setCategories(parsed.categories)
            }
          } catch {
            // use defaults
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  const handleTitleChange = (value: string) => {
    dispatch({ type: "SET_TITLE", payload: value })
    dispatch({ type: "SET_SLUG", payload: generateSlug(value) })
    if (value.trim()) setErrors((prev) => ({ ...prev, title: undefined }))
  }

  const handleSlugChange = (value: string) => {
    dispatch({ type: "SET_SLUG", payload: value })
  }

  const handleRouteSelect = (path: string) => {
    dispatch({ type: "SET_ROUTE_PATH", payload: path })
    if (path) setErrors((prev) => ({ ...prev, routePath: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: { title?: string; routePath?: string } = {}
    if (!state.title.trim()) newErrors.title = "Bitte einen Seitentitel eingeben."
    if (!state.routePath) newErrors.routePath = "Bitte eine Kategorie auswählen."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      dispatch({ type: "SET_STEP", payload: 2 })
    }
  }

  const fullUrl = buildFullUrl(state.routePath, state.slug)

  const canProceed = state.title.trim() && state.routePath

  // Build flat list of all categories (top-level + children)
  const allCategoryOptions: { path: string; label: string; depth: number }[] = []
  allCategoryOptions.push({ path: "/seiten", label: "/seiten/ (Standard)", depth: 0 })
  for (const cat of categories) {
    allCategoryOptions.push({ path: `/${cat.slug}`, label: `/${cat.slug}/`, depth: 0 })
    for (const child of cat.children || []) {
      allCategoryOptions.push({ path: `/${cat.slug}/${child.slug}`, label: `/${cat.slug}/${child.slug}/`, depth: 1 })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      {/* Title Field */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wizard-title" className="text-base font-semibold">
            Seitentitel *
          </Label>
          <Input
            id="wizard-title"
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="z.B. Unsere AGs"
            className="font-display text-xl h-14 px-4"
            autoFocus
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Slug preview */}
        <div className="space-y-1">
          <Label htmlFor="wizard-slug" className="text-sm text-muted-foreground">
            URL-Slug
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground shrink-0">
              {state.routePath || "/seiten"}/
            </span>
            <Input
              id="wizard-slug"
              value={state.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-slug"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Hero Subtitle */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label htmlFor="wizard-subtitle" className="text-base font-semibold">Hero-Untertitel (optional)</Label>
        <p className="text-xs text-muted-foreground">Wird als beschreibender Text unter dem Seitentitel angezeigt.</p>
        <Input
          id="wizard-subtitle"
          value={state.heroSubtitle}
          onChange={(e) => dispatch({ type: "SET_HERO_SUBTITLE", payload: e.target.value })}
          placeholder="z.B. Alles rund um unsere Arbeitsgemeinschaften"
          maxLength={200}
        />
        {state.heroSubtitle && (
          <span className={`text-[10px] ${state.heroSubtitle.length > 180 ? "text-amber-600" : "text-muted-foreground"}`}>
            {state.heroSubtitle.length}/200
          </span>
        )}
      </div>

      {/* Hero Image */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Label className="text-base font-semibold">Hero-Bild (optional)</Label>
        <p className="text-xs text-muted-foreground">Wird oben auf der Seite als großes Titelbild angezeigt.</p>
        <ImagePicker
          value={state.heroImageUrl || null}
          onChange={(url) => dispatch({ type: "SET_HERO_IMAGE", payload: url })}
          aspectRatio="16/9"
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

      {/* Category / Route Path Picker */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <Label className="text-base font-semibold">URL-Pfad / Kategorie *</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Wähle aus, unter welcher Kategorie die Seite erscheinen soll.
          </p>
        </div>

        {loadingCategories ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Kategorien laden...</span>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {allCategoryOptions.map((opt) => {
              const isSelected = state.routePath === opt.path
              return (
                <button
                  key={opt.path}
                  type="button"
                  onClick={() => handleRouteSelect(opt.path)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  } ${opt.depth > 0 ? "ml-4" : ""}`}
                >
                  <FolderOpen className={`h-5 w-5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {opt.label}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {errors.routePath && (
          <p className="text-sm text-destructive">{errors.routePath}</p>
        )}

        {/* Live URL preview */}
        <div className="rounded-lg bg-muted/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">Vorschau der URL:</p>
          <p className="text-sm font-mono font-medium text-foreground mt-0.5">{fullUrl}</p>
        </div>
      </div>

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
