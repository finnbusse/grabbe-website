"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePicker } from "@/components/cms/image-picker"
import {
  ArrowLeft, Save, Loader2, RotateCcw, Eye, Check,
  ChevronDown, ChevronRight,
} from "lucide-react"
import Link from "next/link"
import type { PageDefinition, ContentSectionDefinition } from "@/lib/page-content"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HomepageEditorProps {
  sections: PageDefinition[]
}

interface SectionState {
  values: Record<string, string>
  dirty: boolean
  saving: boolean
  saved: boolean
  error: string | null
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function HomepageEditor({ sections }: HomepageEditorProps) {
  const [loading, setLoading] = useState(true)
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({})
  const [savingAll, setSavingAll] = useState(false)
  const [savedAll, setSavedAll] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((s) => s.id)),
  )

  // Load content for all sections
  useEffect(() => {
    async function loadAll() {
      const supabase = createClient()
      const states: Record<string, SectionState> = {}

      for (const section of sections) {
        try {
          const { data } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", `page_content:${section.id}`)
            .single()

          const stored = data?.value ? JSON.parse(data.value) : {}
          const merged: Record<string, string> = {}
          for (const [key, val] of Object.entries(section.defaults)) {
            merged[key] = (stored[key] as string) ?? (val as string)
          }
          states[section.id] = { values: merged, dirty: false, saving: false, saved: false, error: null }
        } catch {
          const defaults: Record<string, string> = {}
          for (const [key, val] of Object.entries(section.defaults)) {
            defaults[key] = val as string
          }
          states[section.id] = { values: defaults, dirty: false, saving: false, saved: false, error: null }
        }
      }

      setSectionStates(states)
      setLoading(false)
    }
    loadAll()
  }, [sections])

  const handleChange = (sectionId: string, key: string, value: string) => {
    setSavedAll(false)
    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        values: { ...prev[sectionId].values, [key]: value },
        dirty: true,
        saved: false,
      },
    }))
  }

  const handleReset = (sectionId: string, key: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return
    const defaultValue = (section.defaults as Record<string, string>)[key]
    if (defaultValue !== undefined) {
      handleChange(sectionId, key, defaultValue)
    }
  }

  const saveSection = useCallback(async (sectionId: string): Promise<boolean> => {
    const state = sectionStates[sectionId]
    if (!state) return false

    setSectionStates((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], saving: true, error: null },
    }))

    try {
      const res = await fetch("/api/page-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: sectionId, content: state.values }),
      })
      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || "Fehler beim Speichern")
      }
      setSectionStates((prev) => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], saving: false, saved: true, dirty: false },
      }))
      return true
    } catch (err: unknown) {
      setSectionStates((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          saving: false,
          error: err instanceof Error ? err.message : "Fehler beim Speichern",
        },
      }))
      return false
    }
  }, [sectionStates])

  const handleSaveAll = async () => {
    setSavingAll(true)
    setSavedAll(false)
    const dirtySections = sections.filter((s) => sectionStates[s.id]?.dirty)
    const toSave = dirtySections.length > 0 ? dirtySections : sections

    let allOk = true
    for (const section of toSave) {
      const ok = await saveSection(section.id)
      if (!ok) allOk = false
    }
    setSavingAll(false)
    if (allOk) {
      setSavedAll(true)
      setTimeout(() => setSavedAll(false), 3000)
    }
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const stateValues = Object.values(sectionStates) as SectionState[]
  const dirtyCount = stateValues.filter((s) => s.dirty).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cms/seiten"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Startseite bearbeiten</h1>
            <p className="text-sm text-muted-foreground">
              {sections.length} Bereiche — bearbeite die Inhalte der Startseite
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Vorschau
            </Button>
          </Link>
          <Button onClick={handleSaveAll} disabled={savingAll}>
            {savingAll ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : savedAll ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            {savingAll ? "Speichern..." : savedAll ? "Gespeichert!" : dirtyCount > 0 ? `${dirtyCount} Bereiche speichern` : "Alle speichern"}
          </Button>
        </div>
      </div>

      {savedAll && (
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Alle Änderungen gespeichert! Die Startseite wird beim nächsten Laden aktualisiert.
        </div>
      )}

      {/* Section editors as collapsible cards */}
      <div className="mt-6 space-y-4">
        {sections.map((section) => {
          const state = sectionStates[section.id]
          if (!state) return null
          const isExpanded = expandedSections.has(section.id)

          // Friendly section name (strip "Startseite: " prefix)
          const displayTitle = section.title.replace(/^Startseite:\s*/i, "")

          return (
            <div key={section.id} className="rounded-2xl border bg-card overflow-hidden">
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold">{displayTitle}</h3>
                  {section.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {state.dirty && (
                    <span className="text-[10px] text-amber-600 font-medium">Ungespeichert</span>
                  )}
                  {state.saved && (
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Gespeichert</span>
                  )}
                  {state.error && (
                    <span className="text-[10px] text-destructive font-medium">✗ Fehler</span>
                  )}
                </div>
              </button>

              {/* Section content */}
              {isExpanded && (
                <div className="border-t px-6 py-5 space-y-5">
                  {state.error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {state.error}
                    </div>
                  )}
                  {section.sections.map((subsection) => (
                    <SubsectionEditor
                      key={subsection.id}
                      subsection={subsection}
                      values={state.values}
                      defaults={section.defaults as Record<string, string>}
                      onChange={(key, val) => handleChange(section.id, key, val)}
                      onReset={(key) => handleReset(section.id, key)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Subsection Editor
// ---------------------------------------------------------------------------

function SubsectionEditor({
  subsection,
  values,
  defaults,
  onChange,
  onReset,
}: {
  subsection: ContentSectionDefinition
  values: Record<string, string>
  defaults: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-card-foreground">{subsection.title}</h4>
      {subsection.description && (
        <p className="text-xs text-muted-foreground">{subsection.description}</p>
      )}
      <div className="space-y-3">
        {subsection.fields.map((field) => {
          const value = values[field.key] ?? ""
          const defaultValue = defaults[field.key] ?? ""
          const isModified = value !== defaultValue

          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`field-${field.key}`} className="text-sm">
                  {field.label}
                  {isModified && (
                    <span className="ml-2 text-xs text-amber-600">• geändert</span>
                  )}
                </Label>
                {isModified && (
                  <button
                    onClick={() => onReset(field.key)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Auf Standard zurücksetzen"
                  >
                    <RotateCcw className="h-3 w-3 inline mr-1" />
                    Standard
                  </button>
                )}
              </div>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              {field.type === "textarea" || field.type === "richtext" ? (
                <textarea
                  id={`field-${field.key}`}
                  value={value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-[80px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : field.type === "image" ? (
                <ImagePicker
                  value={value || null}
                  onChange={(url) => onChange(field.key, url || "")}
                  aspectRatio="16/9"
                />
              ) : (
                <Input
                  id={`field-${field.key}`}
                  value={value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="text-sm"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
