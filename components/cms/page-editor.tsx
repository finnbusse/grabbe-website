"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react"
import { FileUploader, FileListItem } from "./file-uploader"
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
  }
}

interface AttachedFile {
  url: string
  name: string
  type: string
}

export function PageEditor({ page }: PageEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(page?.title ?? "")
  const [slug, setSlug] = useState(page?.slug ?? "")
  const [content, setContent] = useState(page?.content ?? "")
  const [section, setSection] = useState(page?.section ?? "allgemein")
  const [sortOrder, setSortOrder] = useState(page?.sort_order ?? 0)
  const [published, setPublished] = useState(page?.published ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!page) setSlug(generateSlug(value))
  }

  const insertIntoContent = (text: string) => setContent((prev) => prev + "\n" + text)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const payload = {
        title, slug, content, section,
        sort_order: sortOrder, published,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      if (page) {
        const { error: err } = await supabase.from("pages").update(payload).eq("id", page.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from("pages").insert(payload)
        if (err) throw err
      }
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
          {page && published && slug && (
            <Link href={`/seiten/${slug}`} target="_blank">
              <Button variant="outline" size="sm"><Eye className="mr-1.5 h-3.5 w-3.5" />Vorschau</Button>
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
                <span className="text-sm text-muted-foreground shrink-0">/seiten/</span>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-pfad" className="font-mono text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <Label htmlFor="content">Inhalt (Markdown)</Label>
            <p className="text-xs text-muted-foreground">**fett**, *kursiv*, ## Ueberschrift, [Link](url), ![Bild](url)</p>
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
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">Einstellungen</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="pub">Veroeffentlicht</Label>
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
              <Label htmlFor="sort">Sortierung</Label>
              <Input id="sort" type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
