"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Settings, Save, Loader2, Upload, Globe, Building2, Mail, Phone,
  MapPin, Share2, Search as SearchIcon, Image as ImageIcon, FileText,
  Shield, Hash,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type Values = Record<string, string>

function field(
  values: Values,
  key: string,
  onChange: (k: string, v: string) => void,
  opts?: { placeholder?: string; multiline?: boolean },
) {
  if (opts?.multiline) {
    return (
      <textarea
        value={values[key] ?? ""}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={opts?.placeholder}
        rows={3}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[72px]"
      />
    )
  }
  return (
    <Input
      value={values[key] ?? ""}
      onChange={(e) => onChange(key, e.target.value)}
      placeholder={opts?.placeholder}
    />
  )
}

// ---------------------------------------------------------------------------
// Section component
// ---------------------------------------------------------------------------
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-card-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 px-6 py-5">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Field row
// ---------------------------------------------------------------------------
function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Image field with upload
// ---------------------------------------------------------------------------
function ImageField({
  label,
  hint,
  value,
  onChange,
  uploading,
  onUpload,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  uploading: boolean
  onUpload: () => void
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... oder hochladen"
          className="flex-1"
        />
        <Button variant="outline" size="sm" onClick={onUpload} disabled={uploading}>
          {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
          Bild
        </Button>
        {value && (
          <img src={value} alt="" className="h-10 w-10 rounded-lg border object-cover" />
        )}
      </div>
    </Field>
  )
}

// ===========================================================================
// Page
// ===========================================================================
export default function SettingsPage() {
  const [values, setValues] = useState<Values>({})
  const [initial, setInitial] = useState<Values>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const loadedRef = useRef(false)

  // Derive dirty state
  const isDirty = Object.keys(values).some((k) => values[k] !== initial[k])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault() }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  // Load all settings
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase.from("site_settings").select("key, value")
      const map: Values = {}
      ;(data as { key: string; value: string }[] | null)?.forEach((s) => { map[s.key] = s.value ?? "" })
      setValues(map)
      setInitial(map)
      setLoading(false)
    })()
  }, [])

  const set = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Ensure a setting key exists (upsert)
  const ensureKey = async (supabase: ReturnType<typeof createClient>, key: string, value: string) => {
    const { data } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle()
    if (data) {
      await supabase.from("site_settings").update({ value, updated_at: new Date().toISOString() } as never).eq("key", key)
    } else {
      await supabase.from("site_settings").insert({
        key, value, type: "text", label: key, category: "seo",
      } as never)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const keys = Object.keys(values).filter((k) => values[k] !== initial[k])
    for (const key of keys) {
      await ensureKey(supabase, key, values[key])
    }
    setInitial({ ...values })
    setMsg("Gespeichert!")
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  const handleImageUpload = (key: string) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setUploadingKey(key)
      try {
        const form = new FormData()
        form.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: form })
        const data = await res.json()
        if (data.url) set(key, data.url)
      } finally {
        setUploadingKey(null)
      }
    }
    input.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Einstellungen</h1>
            <p className="text-sm text-muted-foreground">
              Alle zentralen Einstellungen der Website an einem Ort.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-sm font-medium text-green-600">{msg}</span>}
          {isDirty && !msg && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              Ungespeicherte Änderungen
            </span>
          )}
          <Button onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Speichern
          </Button>
        </div>
      </div>

      {/* ====================== GENERAL ====================== */}
      <Section
        icon={Building2}
        title="Allgemein"
        description="Name, Logo und grundlegende Informationen der Schule."
      >
        <Field label="Schulname" hint="Wird als Seitenname und in den Meta-Tags verwendet.">
          {field(values, "school_name", set, { placeholder: "Grabbe-Gymnasium Detmold" })}
        </Field>
        <ImageField
          label="Logo"
          hint="Quadratisch, mind. 512 x 512 px. Wird im Schema.org und ggf. in Suchergebnissen angezeigt."
          value={values.seo_org_logo ?? ""}
          onChange={(v) => set("seo_org_logo", v)}
          uploading={uploadingKey === "seo_org_logo"}
          onUpload={() => handleImageUpload("seo_org_logo")}
        />
      </Section>

      {/* ====================== CONTACT ====================== */}
      <Section
        icon={Mail}
        title="Kontakt & Adresse"
        description="Adresse, Telefon und E-Mail. Wird im Impressum, auf der Kontaktseite und in strukturierten Daten (Schema.org) ausgegeben."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-Mail">
            {field(values, "seo_org_email", set, { placeholder: "info@grabbe-gymnasium.de" })}
          </Field>
          <Field label="Telefon">
            {field(values, "seo_org_phone", set, { placeholder: "+49 5231 ..." })}
          </Field>
        </div>
        <Field label="Strasse">
          {field(values, "seo_org_address_street", set, { placeholder: "Küsterstr. 2" })}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="PLZ">
            {field(values, "seo_org_address_zip", set, { placeholder: "32756" })}
          </Field>
          <Field label="Stadt">
            {field(values, "seo_org_address_city", set, { placeholder: "Detmold" })}
          </Field>
          <Field label="Land (ISO)">
            {field(values, "seo_org_address_country", set, { placeholder: "DE" })}
          </Field>
        </div>
      </Section>

      {/* ====================== SEO ====================== */}
      <Section
        icon={SearchIcon}
        title="Suchmaschinen (SEO)"
        description="Meta-Informationen, die Suchmaschinen und Social-Media-Plattformen angezeigt bekommen."
      >
        <Field label="Website-URL" hint="Kanonische URL der Produktionsseite (z.B. https://grabbe.site). Wird auch aus Umgebungsvariablen gelesen.">
          {field(values, "seo_site_url", set, { placeholder: "https://grabbe.site" })}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Startseiten-Präfix" hint="Erster Teil des Startseitentitels, z.B. 'Start'">
            {field(values, "seo_homepage_title_prefix", set, { placeholder: "Start" })}
          </Field>
          <Field label="Titel-Trennzeichen" hint="Zeichen zwischen Seitenname und Schulname, z.B. ' / '">
            {field(values, "seo_title_separator", set, { placeholder: " / " })}
          </Field>
          <Field label="Titel-Suffix" hint="Erscheint hinter dem Trennzeichen auf jeder Seite.">
            {field(values, "seo_title_suffix", set, { placeholder: "Grabbe-Gymnasium" })}
          </Field>
        </div>
        <Field label="Startseiten-Beschreibung" hint="Meta-Beschreibung speziell für die Startseite (max. 160 Zeichen empfohlen). Falls leer, wird die Standard-Beschreibung verwendet.">
          {field(values, "seo_homepage_description", set, {
            multiline: true,
            placeholder: "Willkommen am Grabbe-Gymnasium Detmold ...",
          })}
        </Field>
        <Field label="Standard Meta-Beschreibung" hint="Wird für Unterseiten verwendet, wenn keine eigene Beschreibung vorhanden ist (max. 160 Zeichen empfohlen).">
          {field(values, "seo_default_description", set, {
            multiline: true,
            placeholder: "Das Christian-Dietrich-Grabbe-Gymnasium in Detmold ...",
          })}
        </Field>
        <ImageField
          label="Standard OG-Bild"
          hint="Vorschaubild für Social-Media, wenn kein seitenspezifisches Bild vorhanden ist (1200 x 630 px empfohlen)."
          value={values.seo_og_image ?? ""}
          onChange={(v) => set("seo_og_image", v)}
          uploading={uploadingKey === "seo_og_image"}
          onUpload={() => handleImageUpload("seo_og_image")}
        />
      </Section>

      {/* ====================== SOCIAL ====================== */}
      <Section
        icon={Share2}
        title="Social Media"
        description="Links zu den Social-Media-Profilen der Schule. Werden in den strukturierten Daten (sameAs) ausgegeben."
      >
        <Field label="Instagram">
          {field(values, "seo_social_instagram", set, { placeholder: "https://instagram.com/..." })}
        </Field>
        <Field label="Facebook">
          {field(values, "seo_social_facebook", set, { placeholder: "https://facebook.com/..." })}
        </Field>
        <Field label="YouTube">
          {field(values, "seo_social_youtube", set, { placeholder: "https://youtube.com/..." })}
        </Field>
      </Section>

      {/* ====================== ADVANCED ====================== */}
      <Section
        icon={Shield}
        title="Erweitert"
        description="Erweiterte technische SEO-Einstellungen."
      >
        <Field label="Organisationsname (Schema.org)" hint="Falls abweichend vom Schulnamen.">
          {field(values, "seo_org_name", set, { placeholder: "Grabbe-Gymnasium Detmold" })}
        </Field>

        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium text-card-foreground">Automatisch generiert</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/sitemap.xml</code> – Alle veröffentlichten Seiten &amp; Beiträge</li>
            <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/robots.txt</code> – CMS, Auth und API werden blockiert</li>
            <li className="flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> JSON-LD Organisation &amp; WebSite auf jeder Seite</li>
            <li className="flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5" /> Preview-Deployments werden automatisch auf <code className="rounded bg-muted px-1.5 py-0.5 text-xs">noindex</code> gesetzt</li>
          </ul>
        </div>
      </Section>
    </div>
  )
}
