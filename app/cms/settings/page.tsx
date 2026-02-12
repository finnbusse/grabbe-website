"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Upload, X } from "lucide-react"

type Setting = {
  id: string
  key: string
  value: string
  type: string
  label: string | null
  category: string
}

const CATEGORIES: Record<string, string> = {
  allgemein: "Allgemein",
  kontakt: "Kontaktdaten",
  seo: "SEO & Open Graph",
  homepage: "Startseite",
  statistiken: "Statistiken",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("allgemein")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("site_settings").select("*").order("key")
      if (data) setSettings(data)
      setLoading(false)
    }
    load()
  }, [])

  function updateValue(key: string, value: string) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const filtered = settings.filter((s) => s.category === activeTab)
    for (const s of filtered) {
      await supabase.from("site_settings").update({ value: s.value, updated_at: new Date().toISOString() }).eq("key", s.key)
    }
    setMsg("Einstellungen gespeichert!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  async function handleAddSetting() {
    const supabase = createClient()
    const key = prompt("Schluessel (z.B. footer_text):")
    if (!key) return
    const label = prompt("Anzeigename:") || key
    const { data } = await supabase
      .from("site_settings")
      .insert({ key, value: "", type: "text", label, category: activeTab })
      .select()
      .single()
    if (data) setSettings((prev) => [...prev, data])
  }

  async function handleDeleteSetting(id: string, key: string) {
    if (!confirm(`"${key}" wirklich loeschen?`)) return
    const supabase = createClient()
    await supabase.from("site_settings").delete().eq("id", id)
    setSettings((prev) => prev.filter((s) => s.id !== id))
  }

  async function handleImageUpload(key: string) {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      if (data.url) updateValue(key, data.url)
    }
    input.click()
  }

  const filtered = settings.filter((s) => s.category === activeTab)

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Einstellungen</h1>
          <p className="text-sm text-muted-foreground">Globale Variablen der Website bearbeiten</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Speichern
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex-1 grid gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-card-foreground">
                  {s.label || s.key}
                </Label>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{s.key}</span>
              </div>
              {s.type === "textarea" ? (
                <textarea
                  value={s.value}
                  onChange={(e) => updateValue(s.key, e.target.value)}
                  className="min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : s.type === "image" ? (
                <div className="flex items-center gap-3">
                  <Input value={s.value} onChange={(e) => updateValue(s.key, e.target.value)} placeholder="URL oder hochladen..." className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => handleImageUpload(s.key)}>
                    <Upload className="mr-1 h-3 w-3" /> Bild
                  </Button>
                  {s.value && (
                    <img src={s.value} alt="" className="h-10 w-10 rounded-lg border object-cover" />
                  )}
                </div>
              ) : (
                <Input value={s.value} onChange={(e) => updateValue(s.key, e.target.value)} />
              )}
            </div>
            <button onClick={() => handleDeleteSetting(s.id, s.key)} className="mt-1 rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAddSetting}>
        Neue Variable hinzufuegen
      </Button>
    </div>
  )
}
