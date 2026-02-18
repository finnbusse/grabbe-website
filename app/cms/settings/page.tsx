"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Settings, Plus, Search, Save, Loader2, Upload, X } from "lucide-react"

type Setting = {
  id: string
  key: string
  value: string
  type: string
  label: string | null
  category: string
}

const CATEGORIES: Record<string, { label: string; description: string }> = {
  allgemein: {
    label: "Allgemein",
    description: "Grundlegende Website-Einstellungen wie Name, Logo und allgemeine Texte.",
  },
  kontakt: {
    label: "Kontaktdaten",
    description: "E-Mail-Adressen, Telefonnummern und Anschrift fuer das Impressum und die Kontaktseite.",
  },
  seo: {
    label: "SEO & Open Graph",
    description: "Meta-Titel, Beschreibungen und Social-Media-Vorschaubilder fuer Suchmaschinen.",
  },
  homepage: {
    label: "Startseite",
    description: "Inhalte und Medien, die auf der Startseite angezeigt werden.",
  },
  statistiken: {
    label: "Statistiken",
    description: "Tracking-IDs, Analytics-Codes und Zaehler-Konfigurationen.",
  },
}

const SETTING_TYPES = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "image", label: "Bild" },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [initialValues, setInitialValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("allgemein")
  const [msg, setMsg] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set())

  // Inline add-variable form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [newType, setNewType] = useState("text")
  const [addingNew, setAddingNew] = useState(false)

  const hasLoadedRef = useRef(false)

  // Dirty tracking: compare current values against initial snapshot
  const dirtyKeys = settings.reduce<string[]>((acc, s) => {
    if (initialValues[s.key] !== undefined && initialValues[s.key] !== s.value) {
      acc.push(s.key)
    }
    return acc
  }, [])
  const isDirty = dirtyKeys.length > 0

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyKeys.length > 0) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirtyKeys.length])

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("site_settings").select("*").order("key")
      if (data) {
        setSettings(data)
        const snapshot: Record<string, string> = {}
        for (const s of data) snapshot[s.key] = s.value
        setInitialValues(snapshot)
      }
      setLoading(false)
    }
    load()
  }, [])

  const updateValue = useCallback((key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
  }, [])

  // Save ALL modified settings across ALL tabs
  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const modified = settings.filter(
      (s) => initialValues[s.key] !== undefined && initialValues[s.key] !== s.value
    )
    for (const s of modified) {
      await supabase
        .from("site_settings")
        .update({ value: s.value, updated_at: new Date().toISOString() })
        .eq("key", s.key)
    }
    // Update the initial snapshot so dirty state resets
    const snapshot: Record<string, string> = {}
    for (const s of settings) snapshot[s.key] = s.value
    setInitialValues(snapshot)
    setMsg("Einstellungen gespeichert!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  // Inline add-variable handler
  async function handleAddSetting() {
    if (!newKey.trim()) return
    setAddingNew(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("site_settings")
      .insert({
        key: newKey.trim(),
        value: "",
        type: newType,
        label: newLabel.trim() || newKey.trim(),
        category: activeTab,
      })
      .select()
      .single()
    if (data) {
      setSettings((prev) => [...prev, data])
      setInitialValues((prev) => ({ ...prev, [data.key]: data.value }))
    }
    setNewKey("")
    setNewLabel("")
    setNewType("text")
    setShowAddForm(false)
    setAddingNew(false)
  }

  async function handleDeleteSetting(id: string, key: string) {
    if (!confirm(`"${key}" wirklich loeschen?`)) return
    const supabase = createClient()
    await supabase.from("site_settings").delete().eq("id", id)
    setSettings((prev) => prev.filter((s) => s.id !== id))
    setInitialValues((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleImageUpload(key: string) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setUploadingKeys((prev) => new Set(prev).add(key))
      try {
        const form = new FormData()
        form.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: form })
        const data = await res.json()
        if (data.url) updateValue(key, data.url)
      } finally {
        setUploadingKeys((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      }
    }
    input.click()
  }

  const filtered = settings.filter((s) => {
    if (s.category !== activeTab) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      s.key.toLowerCase().includes(q) ||
      (s.label && s.label.toLowerCase().includes(q))
    )
  })

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Globale Variablen der Website bearbeiten</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          {isDirty && !msg && (
            <span className="text-sm text-amber-600">Ungespeicherte Aenderungen</span>
          )}
          <Button onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const tabDirtyCount = dirtyKeys.filter(
            (dk) => settings.find((s) => s.key === dk)?.category === key
          ).length
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
              {tabDirtyCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {tabDirtyCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Category description + search */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{CATEGORIES[activeTab].description}</p>
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suchen..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Settings list */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {searchQuery ? "Keine Ergebnisse gefunden." : "Keine Einstellungen in dieser Kategorie."}
          </p>
        )}
        {filtered.map((s) => (
          <div key={s.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex-1 grid gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-card-foreground">
                  {s.label || s.key}
                </Label>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {s.key}
                </span>
                {initialValues[s.key] !== undefined && initialValues[s.key] !== s.value && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                    geaendert
                  </span>
                )}
              </div>
              {s.type === "textarea" ? (
                <textarea
                  value={s.value}
                  onChange={(e) => updateValue(s.key, e.target.value)}
                  className="min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : s.type === "image" ? (
                <div className="flex items-center gap-3">
                  <Input
                    value={s.value}
                    onChange={(e) => updateValue(s.key, e.target.value)}
                    placeholder="URL oder hochladen..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImageUpload(s.key)}
                    disabled={uploadingKeys.has(s.key)}
                  >
                    {uploadingKeys.has(s.key) ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Upload className="mr-1 h-3 w-3" />
                    )}
                    Bild
                  </Button>
                  {s.value && (
                    <img src={s.value} alt="" className="h-10 w-10 rounded-lg border object-cover" />
                  )}
                </div>
              ) : (
                <Input value={s.value} onChange={(e) => updateValue(s.key, e.target.value)} />
              )}
            </div>
            <button
              onClick={() => handleDeleteSetting(s.id, s.key)}
              className="mt-1 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Inline add-variable form */}
      {showAddForm ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-4 space-y-4">
          <h3 className="font-display text-sm font-semibold text-card-foreground">
            Neue Variable hinzufuegen
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Schluessel</Label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="z.B. footer_text"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Anzeigename</Label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="z.B. Footer Text"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Typ</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SETTING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAddSetting} disabled={!newKey.trim() || addingNew} size="sm">
              {addingNew ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Hinzufuegen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false)
                setNewKey("")
                setNewLabel("")
                setNewType("text")
              }}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Variable hinzufuegen
        </Button>
      )}
    </div>
  )
}
