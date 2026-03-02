"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectSeparator, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImagePicker } from "@/components/cms/image-picker"
import {
  Save, Loader2, Upload, Globe, Building2, Mail,
  Share2, Search as SearchIcon, Image as ImageIcon, FileText,
  Shield, Hash, Quote, Paintbrush, Check, RotateCcw,
  Code2, MapPin, ShieldCheck, Zap, ExternalLink,
} from "lucide-react"
import type { DesignSettings } from "@/lib/design-settings"
import {
  DESIGN_DEFAULTS, TAILWIND_COLORS, TAILWIND_COLOR_FAMILIES,
  TAILWIND_COLOR_SHADES, tailwindToHex,
} from "@/lib/design-settings"

// ---------------------------------------------------------------------------
// Curated Google Fonts list
// ---------------------------------------------------------------------------
const GOOGLE_FONTS: string[] = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
  "Raleway", "Nunito", "Source Sans 3", "PT Sans",
  "Merriweather", "Playfair Display", "Lora", "Libre Baskerville",
  "Crimson Text", "EB Garamond", "Cormorant Garamond", "Bitter",
  "Spectral", "Noto Serif",
  "Oswald", "Bebas Neue", "Archivo Black", "Anton", "Barlow Condensed",
  "Work Sans", "DM Sans", "Cabin", "Karla",
  "Rubik", "Quicksand", "Comfortaa", "Outfit", "Manrope",
  "Space Grotesk", "Plus Jakarta Sans", "Sora", "Figtree", "Lexend",
  "IBM Plex Sans", "IBM Plex Serif", "Fira Sans", "Mukta", "Noto Sans",
  "PT Serif",
]

const STANDARD_FONTS = [
  { value: "default", label: "Standard (unverändert)" },
  { value: "Instrument Serif", label: "Instrument Serif (Standard Überschrift)" },
  { value: "Geist", label: "Geist Sans (Standard Fließtext)" },
  { value: "Josefin Sans", label: "Josefin Sans (Standard Akzent)" },
  { value: "Futura LT", label: "Futura LT" },
]

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
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 px-6 py-5">{children}</div>
    </div>
  )
}

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

function ImagePickerField({
  value,
  onChange,
  aspectRatio = "free",
}: {
  value: string
  onChange: (v: string) => void
  aspectRatio?: "16/9" | "1/1" | "free"
}) {
  return (
    <ImagePicker
      value={value || null}
      onChange={(url) => onChange(url || "")}
      aspectRatio={aspectRatio}
    />
  )
}

// ===========================================================================
// Font picker
// ===========================================================================
function FontPicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
}) {
  const isCustom = value !== "default" && !STANDARD_FONTS.some((f) => f.value === value)
  const previewStyle: React.CSSProperties =
    value !== "default" ? { fontFamily: `'${value}', sans-serif` } : {}

  return (
    <Field label={label} hint={hint}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Schriftart wählen…" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Standard</SelectLabel>
            {STANDARD_FONTS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Google Fonts</SelectLabel>
            {GOOGLE_FONTS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {value !== "default" && (
        <>
          {isCustom && (
            // eslint-disable-next-line @next/next/no-page-custom-font
            <link
              rel="stylesheet"
              href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(value)}:wght@400;700&display=swap`}
            />
          )}
          <div
            className="mt-2 rounded-lg border border-border bg-muted/30 px-4 py-3"
            style={previewStyle}
          >
            <p className="text-lg font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">
              Das Grabbe-Gymnasium Detmold – ABCDEFG abcdefg 0123456789
            </p>
          </div>
        </>
      )}
    </Field>
  )
}

// ===========================================================================
// Tailwind color picker
// ===========================================================================
function TailwindColorPicker({
  label,
  hint,
  value,
  defaultValue,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  defaultValue: string
  onChange: (v: string) => void
}) {
  const hex = tailwindToHex(value)
  const isDefault = value === defaultValue

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <div
                className="h-5 w-5 rounded border border-border"
                style={{ backgroundColor: hex }}
              />
              <span className="font-mono text-xs text-muted-foreground">{value}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="grid gap-1">
              {TAILWIND_COLOR_FAMILIES.map((family) => (
                <div key={family} className="flex gap-0.5">
                  {TAILWIND_COLOR_SHADES.map((shade) => {
                    const key = `${family}-${shade}`
                    const swatchHex = TAILWIND_COLORS[key]
                    if (!swatchHex) return null
                    const isSelected = value === key
                    return (
                      <button
                        key={key}
                        type="button"
                        title={key}
                        onClick={() => onChange(key)}
                        className="relative h-6 w-6 rounded-sm border border-transparent transition-transform hover:scale-125 hover:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring"
                        style={{ backgroundColor: swatchHex }}
                      >
                        {isSelected && (
                          <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {!isDefault && (
          <Button variant="ghost" size="sm" onClick={() => onChange(defaultValue)}>
            <RotateCcw className="mr-1 h-3 w-3" />
            Zurücksetzen
          </Button>
        )}
      </div>
    </Field>
  )
}

// ===========================================================================
// Page
// ===========================================================================
export default function WebsiteSettingsPage() {
  const [values, setValues] = useState<Values>({})
  const [initial, setInitial] = useState<Values>({})
  const [design, setDesign] = useState<DesignSettings>(DESIGN_DEFAULTS)
  const [initialDesign, setInitialDesign] = useState<DesignSettings>(DESIGN_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [msgType, setMsgType] = useState<"success" | "error" | "">("")
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const loadedRef = useRef(false)
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const designJson = JSON.stringify(design)
  const initialDesignJson = JSON.stringify(initialDesign)
  const isGeneralDirty = Object.keys(values).some((k) => values[k] !== initial[k])
  const isDesignDirty = designJson !== initialDesignJson
  const isDirty = isGeneralDirty || isDesignDirty

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault() }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  useEffect(() => {
    return () => {
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current)
    }
  }, [])

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

      if (map.design_settings) {
        try {
          const parsed = JSON.parse(map.design_settings) as Partial<DesignSettings>
          const ds: DesignSettings = {
            fonts: { ...DESIGN_DEFAULTS.fonts, ...parsed.fonts },
            colors: { ...DESIGN_DEFAULTS.colors, ...parsed.colors },
          }
          setDesign(ds)
          setInitialDesign(ds)
        } catch { /* keep defaults */ }
      }

      setLoading(false)
    })()
  }, [])

  const set = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setFont = useCallback((role: keyof DesignSettings["fonts"], value: string) => {
    setDesign((prev) => ({ ...prev, fonts: { ...prev.fonts, [role]: value } }))
  }, [])

  const setColor = useCallback((key: keyof DesignSettings["colors"], value: string) => {
    setDesign((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMsg("")
    setMsgType("")
    try {
      const keys = Object.keys(values).filter((k) => k !== "design_settings" && values[k] !== initial[k])
      const payload: { key: string; value: string }[] = keys.map((key) => ({ key, value: values[key] ?? "" }))

      if (isDesignDirty) {
        payload.push({ key: "design_settings", value: JSON.stringify(design) })
      }

      if (payload.length === 0) return

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Speichern fehlgeschlagen")
      }
      setInitial((prev) => {
        const next = { ...prev }
        payload.forEach((p) => { next[p.key] = p.value })
        return next
      })
      setInitialDesign(design)
      setMsg("Gespeichert! Änderungen sind sofort live.")
      setMsgType("success")
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Speichern fehlgeschlagen")
      setMsgType("error")
    } finally {
      setSaving(false)
      if (msgTimerRef.current) clearTimeout(msgTimerRef.current)
      msgTimerRef.current = setTimeout(() => {
        setMsg("")
        setMsgType("")
      }, 4000)
    }
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Website-Einstellungen</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Einstellungen, die die öffentliche Website betreffen.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`text-sm font-medium ${
              msgType === "success" ? "text-green-600" : "text-red-600"
            }`}>
              {msg}
            </span>
          )}
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

      {/* Tabs */}
      <Tabs defaultValue="general" className="mt-6">
        <TabsList>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="seo">
            <SearchIcon className="mr-1.5 h-3.5 w-3.5" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="design">
            <Paintbrush className="mr-1.5 h-3.5 w-3.5" />
            Design
          </TabsTrigger>
        </TabsList>

        {/* ==================== GENERAL TAB ==================== */}
        <TabsContent value="general" className="mt-6 space-y-6 pb-12">

      <Section
        icon={Building2}
        title="Allgemein"
        description="Name, Logo und grundlegende Informationen der Schule."
      >
        <Field label="Schulname" hint="Wird als Seitenname und in den Meta-Tags verwendet.">
          {field(values, "school_name", set, { placeholder: "Grabbe-Gymnasium Detmold" })}
        </Field>
        <Field label="Vollständiger Schulname" hint="Wird im Footer und in rechtlichen Bereichen verwendet.">
          {field(values, "school_name_full", set, { placeholder: "Christian-Dietrich-Grabbe-Gymnasium Detmold" })}
        </Field>
        <Field label="Schulstadt" hint="Wird als Ortsangabe in Header/Footer und Fallback für strukturierte Daten genutzt.">
          {field(values, "school_city", set, { placeholder: "Detmold" })}
        </Field>
        <Field label="Kurzbeschreibung" hint="Kurzer Text über die Schule (z. B. im Footer).">
          {field(values, "school_description", set, {
            multiline: true,
            placeholder: "Wir fördern Deine Talente und stärken Deine Persönlichkeit.",
          })}
        </Field>
        <Field label="Logo" hint="Quadratisch, mind. 512 x 512 px. Wird im Schema.org und ggf. in Suchergebnissen angezeigt.">
          <ImagePickerField value={values.seo_org_logo ?? ""} onChange={(v) => set("seo_org_logo", v)} aspectRatio="1/1" />
        </Field>
      </Section>

      <Section
        icon={Mail}
        title="Kontakt & Adresse"
        description="Zentrale Kontaktdaten der Website."
      >
        <Field label="Adresse (eine Zeile)" hint="Wird in Kontaktseite, Impressum und Footer ausgegeben.">
          {field(values, "school_address", set, { placeholder: "Küster-Meyer-Platz 2, 32756 Detmold" })}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-Mail">
            {field(values, "school_email", set, { placeholder: "sekretariat@grabbe.nrw.schule" })}
          </Field>
          <Field label="Telefon">
            {field(values, "school_phone", set, { placeholder: "05231 - 99260" })}
          </Field>
        </div>
        <Field label="Fax">
          {field(values, "school_fax", set, { placeholder: "05231 - 992616" })}
        </Field>
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium text-card-foreground">Schema.org-Overrides (optional)</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Falls diese Felder leer sind, werden automatisch die obigen Website-Kontaktdaten verwendet.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Schema-E-Mail">
              {field(values, "seo_org_email", set, { placeholder: "info@grabbe-gymnasium.de" })}
            </Field>
            <Field label="Schema-Telefon">
              {field(values, "seo_org_phone", set, { placeholder: "+49 5231 ..." })}
            </Field>
          </div>
          <Field label="Schema-Strasse">
            {field(values, "seo_org_address_street", set, { placeholder: "Küsterstr. 2" })}
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Schema-PLZ">
              {field(values, "seo_org_address_zip", set, { placeholder: "32756" })}
            </Field>
            <Field label="Schema-Stadt">
              {field(values, "seo_org_address_city", set, { placeholder: "Detmold" })}
            </Field>
            <Field label="Schema-Land (ISO)">
              {field(values, "seo_org_address_country", set, { placeholder: "DE" })}
            </Field>
          </div>
        </div>
      </Section>

      <Section
        icon={Quote}
        title="Footer"
        description="Inhalte des Website-Footers."
      >
        <Field label="Motto">
          {field(values, "school_motto", set, {
            placeholder: "\"Deine Talente. Deine Bühne. Dein Grabbe.\"",
          })}
        </Field>
      </Section>

      <Section
        icon={SearchIcon}
        title="Suchmaschinen (SEO)"
        description="Meta-Informationen, die Suchmaschinen und Social-Media-Plattformen angezeigt bekommen."
      >
        <Field label="Website-URL" hint="Kanonische URL der Produktionsseite.">
          {field(values, "seo_site_url", set, { placeholder: "https://grabbe.site" })}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Startseiten-Präfix" hint="Erster Teil des Startseitentitels">
            {field(values, "seo_homepage_title_prefix", set, { placeholder: "Start" })}
          </Field>
          <Field label="Titel-Trennzeichen" hint="Zeichen zwischen Seitenname und Schulname">
            {field(values, "seo_title_separator", set, { placeholder: " / " })}
          </Field>
          <Field label="Titel-Suffix" hint="Erscheint hinter dem Trennzeichen auf jeder Seite.">
            {field(values, "seo_title_suffix", set, { placeholder: "Grabbe-Gymnasium" })}
          </Field>
        </div>
        <Field label="Startseiten-Beschreibung" hint="Meta-Beschreibung speziell für die Startseite (max. 160 Zeichen empfohlen).">
          {field(values, "seo_homepage_description", set, {
            multiline: true,
            placeholder: "Willkommen am Grabbe-Gymnasium Detmold ...",
          })}
        </Field>
        <Field label="Standard Meta-Beschreibung" hint="Wird für Unterseiten verwendet, wenn keine eigene Beschreibung vorhanden ist.">
          {field(values, "seo_default_description", set, {
            multiline: true,
            placeholder: "Das Christian-Dietrich-Grabbe-Gymnasium in Detmold ...",
          })}
        </Field>
      </Section>

        </TabsContent>

        {/* ==================== SEO TAB ==================== */}
        <TabsContent value="seo" className="mt-6 space-y-6 pb-12">

      {/* Section A — Open Graph & Social */}
      <Section
        icon={Share2}
        title="Open Graph & Social"
        description="Social-Media-Vorschaubilder und Profile."
      >
        <Field label="Standard OG-Bild" hint="Vorschaubild für Social-Media (1200 x 630 px empfohlen).">
          <ImagePickerField value={values.seo_og_image ?? ""} onChange={(v) => set("seo_og_image", v)} aspectRatio="16/9" />
        </Field>
        <Field label="Twitter/X-Handle" hint="z. B. @grabbe_gym">
          {field(values, "seo_twitter_handle", set, { placeholder: "@handle" })}
        </Field>
        <Field label="Locale" hint="Open-Graph-Locale (z. B. de_DE)">
          {field(values, "seo_locale", set, { placeholder: "de_DE" })}
        </Field>
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

      {/* Section B — Schema.org */}
      <Section
        icon={Code2}
        title="Schema.org / Strukturierte Daten"
        description="Strukturierte Daten für Google Knowledge Panel und Rich Results."
      >
        <Field label="Organisationsname (Schema.org)" hint="Falls abweichend vom Schulnamen.">
          {field(values, "seo_org_name", set, { placeholder: "Grabbe-Gymnasium Detmold" })}
        </Field>
        <Field label="Organisations-Logo (Schema.org)" hint="Quadratisch, mind. 512 x 512 px.">
          <ImagePickerField value={values.seo_org_logo ?? ""} onChange={(v) => set("seo_org_logo", v)} aspectRatio="1/1" />
        </Field>
        <Field label="Organisationstyp" hint="Schema.org @type für die Organisation.">
          <Select value={values.seo_schema_type || "HighSchool"} onValueChange={(v) => set("seo_schema_type", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Typ wählen…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HighSchool">HighSchool</SelectItem>
              <SelectItem value="SecondarySchool">SecondarySchool</SelectItem>
              <SelectItem value="EducationalOrganization">EducationalOrganization</SelectItem>
              <SelectItem value="School">School</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Offizieller Name (legalName)" hint="Vollständiger juristischer Name.">
          {field(values, "seo_org_legal_name", set, { placeholder: "" })}
        </Field>
        <Field label="Gründungsjahr" hint="z. B. 1847">
          {field(values, "seo_org_founding_year", set, { placeholder: "" })}
        </Field>
        <Field label="Wikidata-URL" hint="z. B. https://www.wikidata.org/wiki/Q...">
          {field(values, "seo_org_wikidata", set, { placeholder: "" })}
        </Field>
        <Field label="Öffnungszeiten" hint="Schema.org Format, z. B. Mo-Fr 07:30-16:00">
          {field(values, "seo_org_opening_hours", set, { placeholder: "Mo-Fr 07:30-16:00" })}
        </Field>
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium text-card-foreground">Kontakt & Adresse</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Kontaktdaten werden in <strong>Allgemein</strong> verwaltet.
          </p>
          <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
            {values.school_email && <p>E-Mail: {values.seo_org_email || values.school_email}</p>}
            {values.school_phone && <p>Telefon: {values.seo_org_phone || values.school_phone}</p>}
            {values.school_address && <p>Adresse: {values.school_address}</p>}
          </div>
        </div>
      </Section>

      {/* Section C — Lokale SEO */}
      <Section
        icon={MapPin}
        title="Lokale SEO"
        description="Geo-Metadaten für lokale Suchergebnisse."
      >
        <Field label="Geo-Region" hint="ISO 3166 (z. B. DE-NW)">
          {field(values, "seo_geo_region", set, { placeholder: "DE-NW" })}
        </Field>
        <Field label="Geo-Ortsname">
          {field(values, "seo_geo_placename", set, { placeholder: "Detmold" })}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Breitengrad (Lat)">
            {field(values, "seo_geo_lat", set, { placeholder: "51.9318" })}
          </Field>
          <Field label="Längengrad (Lng)">
            {field(values, "seo_geo_lng", set, { placeholder: "8.8800" })}
          </Field>
        </div>
      </Section>

      {/* Section D — Suchmaschinen-Verifikation */}
      <Section
        icon={ShieldCheck}
        title="Suchmaschinen-Verifikation"
        description="Bestätigungscodes für Google Search Console und Bing Webmaster Tools."
      >
        <Field label="Google Site Verification" hint="Nur den Wert des content-Attributs einfügen.">
          {field(values, "seo_google_verification", set, { placeholder: "" })}
        </Field>
        {values.seo_google_verification && (
          <code className="block rounded bg-muted px-3 py-2 text-xs font-mono text-muted-foreground break-all">
            {`<meta name="google-site-verification" content="${values.seo_google_verification}" />`}
          </code>
        )}
        <Field label="Bing Site Verification" hint="Nur den Wert des content-Attributs einfügen.">
          {field(values, "seo_bing_verification", set, { placeholder: "" })}
        </Field>
        {values.seo_bing_verification && (
          <code className="block rounded bg-muted px-3 py-2 text-xs font-mono text-muted-foreground break-all">
            {`<meta name="msvalidate.01" content="${values.seo_bing_verification}" />`}
          </code>
        )}
      </Section>

      {/* Section E — robots.txt */}
      <Section
        icon={FileText}
        title="robots.txt"
        description="Steuerung der Webcrawler-Zugriffe."
      >
        <Field label="robots.txt Inhalt" hint="Wird unter /robots.txt ausgeliefert. Sitemap wird automatisch ergänzt.">
          <textarea
            value={values.seo_robots_txt ?? ""}
            onChange={(e) => set("seo_robots_txt", e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[200px]"
          />
        </Field>
        <Button variant="outline" size="sm" asChild>
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            robots.txt öffnen
          </a>
        </Button>
      </Section>

      {/* Section F — Automatisch generiert */}
      <Section
        icon={Zap}
        title="Automatisch generiert"
        description="Diese Funktionen werden vom System automatisch bereitgestellt."
      >
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 shrink-0" /> <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/sitemap.xml</code> – Alle veröffentlichten Seiten &amp; Beiträge</li>
            <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 shrink-0" /> <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/robots.txt</code> – Dynamisch aus Datenbank</li>
            <li className="flex items-center gap-2"><Hash className="h-3.5 w-3.5 shrink-0" /> JSON-LD: Organization, WebSite, BreadcrumbList, NewsArticle, WebPage</li>
            <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /> Geo-Meta-Tags (wenn Koordinaten gesetzt)</li>
            <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 shrink-0" /> Kanonische URLs auf allen Seiten</li>
            <li className="flex items-center gap-2"><ImageIcon className="h-3.5 w-3.5 shrink-0" /> Preview-Deployments automatisch <code className="rounded bg-muted px-1.5 py-0.5 text-xs">noindex</code></li>
            <li className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 shrink-0" /> <code className="rounded bg-muted px-1.5 py-0.5 text-xs">hreflang=&quot;de&quot;</code> auf allen Seiten</li>
          </ul>
        </div>
      </Section>

        </TabsContent>

        {/* ==================== DESIGN TAB ==================== */}
        <TabsContent value="design" className="mt-6 space-y-6 pb-12">

          <Section
            icon={Paintbrush}
            title="Schriftarten"
            description="Wähle für jede Rolle eine Schriftart aus."
          >
            <FontPicker
              label="Überschriften-Schrift"
              hint="Wird für alle h1–h6 und Display-Texte verwendet. Standard: Instrument Serif."
              value={design.fonts.heading}
              onChange={(v) => setFont("heading", v)}
            />
            <FontPicker
              label="Fließtext-Schrift"
              hint="Standard-Body-Schrift für Absätze, Listen, UI. Standard: Geist Sans."
              value={design.fonts.body}
              onChange={(v) => setFont("body", v)}
            />
            <FontPicker
              label="Akzent-Schrift"
              hint="Für Labels, Tags und besondere Hervorhebungen. Standard: Josefin Sans."
              value={design.fonts.accent}
              onChange={(v) => setFont("accent", v)}
            />
          </Section>

          <Section
            icon={Paintbrush}
            title="Farbpalette"
            description="Primärfarbe und Akzentfarben der vier Profilprojekte."
          >
            <TailwindColorPicker
              label="Primärfarbe"
              hint="Hauptfarbe für Buttons, Links und Akzente. Standard: blue-600."
              value={design.colors.primary}
              defaultValue={DESIGN_DEFAULTS.colors.primary}
              onChange={(v) => setColor("primary", v)}
            />

            <div className="mt-2 rounded-xl border border-border bg-muted/30 px-4 py-4">
              <p className="mb-4 text-sm font-medium text-card-foreground">Profilprojekt-Farben</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <TailwindColorPicker
                  label="NaWi-Projekt"
                  value={design.colors.subjectNaturwissenschaften}
                  defaultValue={DESIGN_DEFAULTS.colors.subjectNaturwissenschaften}
                  onChange={(v) => setColor("subjectNaturwissenschaften", v)}
                />
                <TailwindColorPicker
                  label="Musikprojekt"
                  value={design.colors.subjectMusik}
                  defaultValue={DESIGN_DEFAULTS.colors.subjectMusik}
                  onChange={(v) => setColor("subjectMusik", v)}
                />
                <TailwindColorPicker
                  label="Kunstprojekt"
                  value={design.colors.subjectKunst}
                  defaultValue={DESIGN_DEFAULTS.colors.subjectKunst}
                  onChange={(v) => setColor("subjectKunst", v)}
                />
                <TailwindColorPicker
                  label="Sportprojekt"
                  value={design.colors.subjectSport}
                  defaultValue={DESIGN_DEFAULTS.colors.subjectSport}
                  onChange={(v) => setColor("subjectSport", v)}
                />
              </div>
            </div>

            <div className="mt-2">
              <p className="mb-2 text-sm font-medium text-card-foreground">Vorschau</p>
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-12 w-12 rounded-lg border border-border" style={{ backgroundColor: tailwindToHex(design.colors.primary) }} />
                  <span className="text-[10px] text-muted-foreground">Primär</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-12 w-12 rounded-lg border border-border" style={{ backgroundColor: tailwindToHex(design.colors.subjectNaturwissenschaften) }} />
                  <span className="text-[10px] text-muted-foreground">NaWi</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-12 w-12 rounded-lg border border-border" style={{ backgroundColor: tailwindToHex(design.colors.subjectMusik) }} />
                  <span className="text-[10px] text-muted-foreground">Musik</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-12 w-12 rounded-lg border border-border" style={{ backgroundColor: tailwindToHex(design.colors.subjectKunst) }} />
                  <span className="text-[10px] text-muted-foreground">Kunst</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-12 w-12 rounded-lg border border-border" style={{ backgroundColor: tailwindToHex(design.colors.subjectSport) }} />
                  <span className="text-[10px] text-muted-foreground">Sport</span>
                </div>
              </div>
            </div>
          </Section>

        </TabsContent>
      </Tabs>
    </div>
  )
}
