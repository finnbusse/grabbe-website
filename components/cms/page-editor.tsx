"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, EyeOff, Loader2, Blocks, FileText, ImageIcon, X, Monitor } from "lucide-react"
import { FileUploader, FileListItem } from "./file-uploader"
import { BlockEditor, renderBlocks, type ContentBlock } from "./block-editor"
import Link from "next/link"

interface PageEditorProps {
  page?: {
    id: string
    title: string
    slug: string
    content: string
    section: string | null
    sort_order: number
    published: boolean
    route_path?: string | null
    hero_image_url?: string | null
    meta_description?: string | null
    seo_og_image?: string | null
  }
}

interface AttachedFile {
  url: string
  name: string
  type: string
}

type EditorMode = 'markdown' | 'blocks'

function parseBlocks(content: string): ContentBlock[] | null {
  try {
    if (content.startsWith('[{') || content.startsWith('[{"')) {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type && parsed[0].id) {
        return parsed
      }
    }
  } catch { /* not blocks */ }
  return null
}

export function PageEditor({ page }: PageEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(page?.title ?? "")
  const [slug, setSlug] = useState(page?.slug ?? "")
  const [content, setContent] = useState(page?.content ?? "")
  const [section, setSection] = useState(page?.section ?? "allgemein")
  const [routePath, setRoutePath] = useState(page?.route_path ?? "")
  const [sortOrder, setSortOrder] = useState(page?.sort_order ?? 0)
  const [published, setPublished] = useState(page?.published ?? true)
  const [heroImageUrl, setHeroImageUrl] = useState(page?.hero_image_url ?? "")
  const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? "")
  const [seoOgImage, setSeoOgImage] = useState(page?.seo_og_image ?? "")
  const [heroUploading, setHeroUploading] = useState(false)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // Determine editor mode based on content format
  const existingBlocks = parseBlocks(content)
  const [editorMode, setEditorMode] = useState<EditorMode>(existingBlocks ? 'blocks' : 'markdown')
  const [blocks, setBlocks] = useState<ContentBlock[]>(existingBlocks || [])

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!page) setSlug(generateSlug(value))
  }

  const insertIntoContent = (text: string) => setContent((prev) => prev + "\n" + text)

  const handleModeChange = (mode: EditorMode) => {
    if (mode === 'blocks' && editorMode === 'markdown') {
      // Switch to blocks - blocks start fresh (markdown content not auto-converted)
      if (content.trim() && blocks.length === 0) {
        setBlocks([{ id: `block_${Date.now()}`, type: 'text', data: { heading: '', text: content } }])
      }
    } else if (mode === 'markdown' && editorMode === 'blocks') {
      // Switch to markdown - serialize blocks to content
      if (blocks.length > 0) {
        setContent(JSON.stringify(blocks))
      }
    }
    setEditorMode(mode)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      // If in blocks mode, serialize blocks to content
      const finalContent = editorMode === 'blocks' ? JSON.stringify(blocks) : content

      const payload = {
        title, slug, content: finalContent, section,
        sort_order: sortOrder, published,
        route_path: routePath || null,
        hero_image_url: heroImageUrl || null,
        meta_description: metaDescription || null,
        seo_og_image: seoOgImage || null,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      let saveError: unknown = null
      if (page) {
        const { error: err } = await supabase.from("pages").update(payload).eq("id", page.id)
        saveError = err
        // Resilient: if hero_image_url column doesn't exist yet, retry without it
        if (err && (err as { message?: string }).message?.includes("hero_image_url")) {
          const { hero_image_url: _dropped, ...payloadWithout } = payload
          const { error: err2 } = await supabase.from("pages").update(payloadWithout).eq("id", page.id)
          saveError = err2
        }
      } else {
        const { error: err } = await supabase.from("pages").insert(payload)
        saveError = err
        if (err && (err as { message?: string }).message?.includes("hero_image_url")) {
          const { hero_image_url: _dropped, ...payloadWithout } = payload
          const { error: err2 } = await supabase.from("pages").insert(payloadWithout)
          saveError = err2
        }
      }
      if (saveError) throw saveError
      router.push("/cms/pages")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cms/pages"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="font-display text-2xl font-bold">{page ? "Seite bearbeiten" : "Neue Seite"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Monitor className="mr-1.5 h-3.5 w-3.5" />}
            {showPreview ? "Editor" : "Vorschau"}
          </Button>
          {page && published && slug && (
            <Link href={routePath ? `${routePath}/${slug}` : `/seiten/${slug}`} target="_blank">
              <Button variant="outline" size="sm"><Eye className="mr-1.5 h-3.5 w-3.5" />Live ansehen</Button>
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving || !title || !slug}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Seitentitel</Label>
              <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Seitentitel eingeben..." className="font-display text-lg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL-Pfad</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">{routePath || "/seiten"}/</span>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-pfad" className="font-mono text-sm" />
              </div>
              <p className="text-xs text-muted-foreground">
                Vollständige URL: {routePath ? `${routePath}/${slug}` : `/seiten/${slug}`}
              </p>
            </div>
          </div>

          {showPreview ? (
            /* Live Preview Panel */
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-semibold text-sm">Vorschau</h3>
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                  {published ? "Veröffentlicht" : "Entwurf – nicht veröffentlicht"}
                </span>
              </div>
              {/* Preview content area */}
              <div className="prose prose-sm max-w-none">
                {heroImageUrl && (
                  <div className="mb-6 overflow-hidden rounded-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={heroImageUrl} alt="Hero" className="h-48 w-full object-cover" />
                  </div>
                )}
                {title && <h1 className="font-display text-2xl font-bold mb-4">{title}</h1>}
                {editorMode === 'blocks' && blocks.length > 0 ? (
                  <div>{renderBlocks(blocks)}</div>
                ) : content ? (
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{content}</div>
                ) : (
                  <p className="text-muted-foreground italic">Noch kein Inhalt vorhanden.</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Editor Mode Toggle */}
              <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3">
                <span className="text-sm text-muted-foreground mr-2">Bearbeitungsmodus:</span>
                <Button
                  variant={editorMode === 'markdown' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('markdown')}
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Markdown
                </Button>
                <Button
                  variant={editorMode === 'blocks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange('blocks')}
                >
                  <Blocks className="mr-1.5 h-3.5 w-3.5" />
                  Bausteine
                </Button>
              </div>

              {editorMode === 'markdown' ? (
                <>
                  <div className="rounded-2xl border bg-card p-6 space-y-3">
                    <Label htmlFor="content">Inhalt (Markdown)</Label>
                    <p className="text-xs text-muted-foreground">**fett**, *kursiv*, ## Überschrift, [Link](url), ![Bild](url)</p>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Seiteninhalt hier eingeben..."
                      className="min-h-[400px] w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="rounded-2xl border bg-card p-6 space-y-4">
                    <h3 className="font-display font-semibold">Dateien & Medien</h3>
                    <FileUploader
                      label="Bild oder Dokument hochladen"
                      onUpload={(file) => setAttachedFiles((prev) => [...prev, { url: file.url, name: file.filename, type: file.type }])}
                    />
                    {attachedFiles.length > 0 && (
                      <div className="space-y-2">
                        {attachedFiles.map((file, i) => (
                          <FileListItem
                            key={i} url={file.url} name={file.name} type={file.type}
                            onInsert={() => insertIntoContent(file.type.startsWith("image/") ? `![${file.name}](${file.url})` : `[${file.name} herunterladen](${file.url})`)}
                            onRemove={() => setAttachedFiles((prev) => prev.filter((_, j) => j !== i))}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border bg-card p-6 space-y-4">
                  <div>
                    <h3 className="font-display font-semibold">Seiteninhalt</h3>
                    <p className="text-xs text-muted-foreground">Fuegen Sie Bausteine hinzu und bearbeiten Sie den Inhalt der Seite.</p>
                  </div>
                  <BlockEditor blocks={blocks} onChange={setBlocks} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          {/* Hero image panel */}
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <h3 className="font-display text-sm font-semibold">Hero-Bild</h3>
            <p className="text-xs text-muted-foreground">Wird rechts oben im Seitenkopf angezeigt.</p>
            {heroImageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImageUrl} alt="Hero-Vorschau" className="h-32 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setHeroImageUrl("")}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    setHeroUploading(true)
                    try {
                      const fd = new FormData(); fd.append("file", f)
                      const res = await fetch("/api/upload", { method: "POST", body: fd })
                      const data = await res.json()
                      if (res.ok) setHeroImageUrl(data.url)
                      else setError(data.error || "Upload fehlgeschlagen")
                    } finally { setHeroUploading(false) }
                  }}
                />
                {heroUploading
                  ? <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  : <ImageIcon className="h-7 w-7 text-muted-foreground" />}
                <span className="text-xs font-medium text-muted-foreground">
                  {heroUploading ? "Wird hochgeladen…" : "Bild hochladen"}
                </span>
              </label>
            )}
            <Input
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="oder Bild-URL eingeben…"
              className="text-xs font-mono"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">Einstellungen</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="pub">Veröffentlicht</Label>
              <Switch id="pub" checked={published} onCheckedChange={setPublished} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Bereich</Label>
              <select id="section" value={section} onChange={(e) => setSection(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="allgemein">Allgemein</option>
                <option value="unsere-schule">Unsere Schule</option>
                <option value="schulleben">Schulleben</option>
                <option value="informationen">Informationen</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="routePath">Kategorie / Pfad</Label>
              <Input
                id="routePath"
                value={routePath}
                onChange={(e) => setRoutePath(e.target.value)}
                placeholder="/seiten (Standard)"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                z.B. /unsere-schule oder /schulleben. Leer lassen für /seiten/.
                Pfad kann in der Seitenstruktur verwaltet werden.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sort">Sortierung</Label>
              <Input id="sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
            </div>
          </div>

          {editorMode === 'blocks' && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h3 className="font-display text-sm font-semibold">Verfuegbare Bausteine</h3>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li>• <strong>Textabschnitt:</strong> Überschrift + Absatz</li>
                <li>• <strong>Karten:</strong> 2-4 Info-Karten nebeneinander</li>
                <li>• <strong>FAQ:</strong> Aufklappbare Fragen & Antworten</li>
                <li>• <strong>Galerie:</strong> Bilder-Raster</li>
                <li>• <strong>Aufzählung:</strong> Punkteliste</li>
                <li>• <strong>Hero / Banner:</strong> Großer Banner mit Bild</li>
                <li>• <strong>Zitat:</strong> Zitat mit Autor</li>
                <li>• <strong>Trennlinie:</strong> Visueller Trenner</li>
                <li>• <strong>Video:</strong> YouTube/Vimeo einbetten</li>
                <li>• <strong>Call-to-Action:</strong> Handlungsaufruf mit Button</li>
                <li>• <strong>Zwei Spalten:</strong> Zweispaltiges Layout</li>
                <li>• <strong>Abstand:</strong> Vertikaler Abstand</li>
                <li>• <strong>Akkordeon:</strong> Aufklappbare Abschnitte</li>
                <li>• <strong>Tabelle:</strong> Zeilen und Spalten</li>
              </ul>
            </div>
          )}

          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">SEO (optional)</h3>
            <p className="text-[10px] text-muted-foreground">Falls leer, wird der Seitentitel automatisch für Suchmaschinen verwendet.</p>
            <div className="grid gap-2">
              <Label htmlFor="metaDesc">Meta-Beschreibung</Label>
              <textarea
                id="metaDesc"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Eigene Beschreibung für Suchmaschinen (empfohlen: max. 160 Zeichen)..."
                maxLength={320}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {metaDescription && (
                <span className={`text-[10px] ${metaDescription.length > 160 ? "text-amber-600" : "text-muted-foreground"}`}>
                  {metaDescription.length}/160 Zeichen
                </span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seoOgImg">Social-Media Bild</Label>
              <Input
                id="seoOgImg"
                value={seoOgImage}
                onChange={(e) => setSeoOgImage(e.target.value)}
                placeholder="URL zum OG-Bild (optional)"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Eigenes Vorschaubild für Social Media. Falls leer, wird das Standard-OG-Bild verwendet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
