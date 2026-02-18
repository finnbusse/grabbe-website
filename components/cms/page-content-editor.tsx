"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, RotateCcw, Eye, Check, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import type { PageDefinition, ContentSectionDefinition } from "@/lib/page-content"

interface PageContentEditorProps {
  page: PageDefinition
}

export function PageContentEditor({ page }: PageContentEditorProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing content
  useEffect(() => {
    async function loadContent() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", `page_content:${page.id}`)
          .single()

        if (data?.value) {
          const stored = JSON.parse(data.value)
          // Merge defaults with stored values
          const merged: Record<string, string> = {}
          for (const [key, val] of Object.entries(page.defaults)) {
            merged[key] = (stored[key] as string) ?? (val as string)
          }
          setValues(merged)
        } else {
          // Use defaults
          const defaults: Record<string, string> = {}
          for (const [key, val] of Object.entries(page.defaults)) {
            defaults[key] = val as string
          }
          setValues(defaults)
        }
      } catch {
        // Use defaults on error
        const defaults: Record<string, string> = {}
        for (const [key, val] of Object.entries(page.defaults)) {
          defaults[key] = val as string
        }
        setValues(defaults)
      } finally {
        setLoading(false)
      }
    }
    loadContent()
  }, [page.id, page.defaults])

  const handleChange = (key: string, value: string) => {
    setSaved(false)
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = (key: string) => {
    const defaultValue = (page.defaults as Record<string, string>)[key]
    if (defaultValue !== undefined) {
      handleChange(key, defaultValue)
    }
  }

  const handleResetAll = () => {
    const defaults: Record<string, string> = {}
    for (const [key, val] of Object.entries(page.defaults)) {
      defaults[key] = val as string
    }
    setValues(defaults)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/page-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: page.id, content: values }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Fehler beim Speichern")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

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
            <Link href="/cms/seiten-editor"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">{page.title}</h1>
            <p className="text-sm text-muted-foreground">{page.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {page.route && (
            <Link href={page.route} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Vorschau
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handleResetAll}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Alles zuruecksetzen
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            {saving ? "Speichern..." : saved ? "Gespeichert!" : "Speichern"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {saved && (
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Aenderungen gespeichert! Die Seite wird beim naechsten Laden aktualisiert.
        </div>
      )}

      {/* Editor Sections */}
      <div className="mt-6 space-y-6">
        {page.sections.map((section) => (
          <SectionEditor
            key={section.id}
            section={section}
            values={values}
            defaults={page.defaults as Record<string, string>}
            onChange={handleChange}
            onReset={handleReset}
          />
        ))}
      </div>
    </div>
  )
}

function SectionEditor({
  section,
  values,
  defaults,
  onChange,
  onReset,
}: {
  section: ContentSectionDefinition
  values: Record<string, string>
  defaults: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset: (key: string) => void
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold">{section.title}</h3>
        {section.description && (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        )}
      </div>
      <div className="space-y-4">
        {section.fields.map((field) => {
          const value = values[field.key] ?? ""
          const defaultValue = defaults[field.key] ?? ""
          const isModified = value !== defaultValue

          return (
            <div key={field.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={`field-${field.key}`} className="text-sm">
                  {field.label}
                  {isModified && (
                    <span className="ml-2 text-xs text-amber-600">• geaendert</span>
                  )}
                </Label>
                {isModified && (
                  <button
                    onClick={() => onReset(field.key)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    title="Auf Standard zuruecksetzen"
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
                  className="min-h-[100px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : field.type === "image" ? (
                <ImageUploadField
                  id={`field-${field.key}`}
                  value={value}
                  onChange={(url) => onChange(field.key, url)}
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

// ─── Image upload field ──────────────────────────────────────────────────────

function ImageUploadField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setUploadError(err.error || "Upload fehlgeschlagen")
        return
      }
      const data = await res.json()
      onChange(data.url)
    } catch {
      setUploadError("Upload fehlgeschlagen")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2" id={id}>
      {uploadError && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}
      {value ? (
        <div className="relative w-full overflow-hidden rounded-xl border border-border">
          {/* Preview */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Hero-Bild Vorschau" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Bild entfernen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm font-medium text-muted-foreground">
            {uploading ? "Wird hochgeladen…" : "Bild hochladen"}
          </p>
          {!uploading && (
            <p className="text-xs text-muted-foreground/70">Klicken oder Datei hierher ziehen</p>
          )}
        </label>
      )}
      {/* Also allow entering a URL directly */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="oder Bild-URL direkt eingeben…"
        className="text-xs font-mono"
      />
    </div>
  )
}
