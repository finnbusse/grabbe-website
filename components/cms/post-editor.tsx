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

interface PostEditorProps {
  post?: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    category: string | null
    published: boolean
    featured: boolean
    image_url: string | null
    author_name: string | null
    event_date?: string | null
  }
}

interface AttachedFile {
  url: string
  name: string
  type: string
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "")
  const [category, setCategory] = useState(post?.category ?? "aktuelles")
  const [published, setPublished] = useState(post?.published ?? false)
  const [featured, setFeatured] = useState(post?.featured ?? false)
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? "")
  const [authorName, setAuthorName] = useState(post?.author_name ?? "")
  const [eventDate, setEventDate] = useState(post?.event_date ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!post) setSlug(generateSlug(value))
  }

  const insertIntoContent = (text: string) => {
    setContent((prev) => prev + "\n" + text)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const basePayload: Record<string, unknown> = {
        title, slug, content,
        excerpt: excerpt || null,
        category, published, featured,
        image_url: imageUrl || null,
        author_name: authorName || user.email?.split("@")[0] || "Redaktion",
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }

      const payloadWithDate = { ...basePayload, event_date: eventDate || null }

      const saveWithPayload = async (payload: Record<string, unknown>) => {
        if (post) {
          const { error } = await supabase.from("posts").update(payload as never).eq("id", post.id)
          return error
        } else {
          const { error } = await supabase.from("posts").insert(payload as never)
          return error
        }
      }

      let saveError = await saveWithPayload(payloadWithDate)

      // If the error mentions event_date column, retry without it
      if (saveError && saveError.message?.includes("event_date")) {
        saveError = await saveWithPayload(basePayload)
      }

      if (saveError) throw saveError

      router.push("/cms/posts")
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
            <Link href="/cms/posts"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="font-display text-2xl font-bold">{post ? "Beitrag bearbeiten" : "Neuer Beitrag"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {post && published && slug && (
            <Link href={`/aktuelles/${slug}`} target="_blank">
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
              <Label htmlFor="title">Titel</Label>
              <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Beitragstitel eingeben..." className="font-display text-lg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">URL-Pfad</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">/aktuelles/</span>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-pfad" className="font-mono text-sm" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Kurztext (Vorschau)</Label>
              <Input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Kurze Zusammenfassung fuer die Uebersicht..." />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <Label htmlFor="content">Inhalt (Markdown)</Label>
            <p className="text-xs text-muted-foreground">**fett**, *kursiv*, ## Ueberschrift, [Linktext](url), ![Bild](url) &mdash; Dateien unten hochladen und per Klick einfuegen.</p>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"Beitragsinhalt hier eingeben...\n\nAbsaetze mit Leerzeilen trennen.\nBilder und Dokumente unten hochladen und einfuegen."}
              className="min-h-[400px] w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm leading-relaxed font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display font-semibold">Dateien & Medien</h3>
            <p className="text-xs text-muted-foreground">Laden Sie Bilder oder PDFs hoch. Klicken Sie &quot;Einfuegen&quot;, um einen Link im Beitragsinhalt zu platzieren.</p>
            <FileUploader
              label="Bild oder Dokument hochladen"
              onUpload={(file) => setAttachedFiles((prev) => [...prev, { url: file.url, name: file.filename, type: file.type }])}
            />
            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                {attachedFiles.map((file, i) => (
                  <FileListItem
                    key={i}
                    url={file.url}
                    name={file.name}
                    type={file.type}
                    onInsert={() => {
                      if (file.type.startsWith("image/")) {
                        insertIntoContent(`![${file.name}](${file.url})`)
                      } else {
                        insertIntoContent(`[${file.name} herunterladen](${file.url})`)
                      }
                    }}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="feat">Auf Startseite</Label>
              <Switch id="feat" checked={featured} onCheckedChange={setFeatured} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategorie</Label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="aktuelles">Aktuelles</option>
                <option value="schulleben">Schulleben</option>
                <option value="veranstaltungen">Veranstaltungen</option>
                <option value="projekte">Projekte</option>
                <option value="wettbewerbe">Wettbewerbe</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Autor</Label>
              <Input id="author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Name des Autors" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventDate">Datum (optional)</Label>
              <Input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Eigenes Datum fuer den Beitrag. Wird statt dem Erstellungsdatum angezeigt.</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold">Beitragsbild</h3>
            {imageUrl ? (
              <div className="space-y-2">
                <img src={imageUrl} alt="Beitragsbild" className="w-full rounded-lg object-cover aspect-video" />
                <Button variant="outline" size="sm" className="w-full" onClick={() => setImageUrl("")}>Bild entfernen</Button>
              </div>
            ) : (
              <FileUploader accept="image/*" label="Beitragsbild hochladen" onUpload={(file) => setImageUrl(file.url)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
