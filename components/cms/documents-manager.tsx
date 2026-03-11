"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FileUploader } from "./file-uploader"
import { TagSelector, TagBadge } from "./tag-selector"
import type { TagData } from "./tag-selector"
import {
  Trash2,
  ExternalLink,
  FileText,
  ImageIcon,
  Copy,
  Check,
  Settings2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Available document categories — kept in one place for easy maintenance. */
const CATEGORIES: { value: string; label: string }[] = [
  { value: "allgemein", label: "Allgemein" },
  { value: "elternbriefe", label: "Elternbriefe" },
  { value: "formulare", label: "Formulare" },
  { value: "lehrplaene", label: "Lehrpläne" },
  { value: "bilder", label: "Bilder" },
  { value: "praesentation", label: "Präsentationen" },
]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Doc {
  id: string
  title: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string | null
  category: string
  status: string
  /** Controls visibility on the public Downloads page. */
  show_in_downloads: boolean
  created_at: string
}

// ---------------------------------------------------------------------------
// DocSettingsDialog — per-document edit popup
// ---------------------------------------------------------------------------

interface DocSettingsDialogProps {
  /** The document being edited, or null when the dialog is closed. */
  doc: Doc | null
  /** Current tag objects for this document. */
  currentTags: TagData[]
  onClose: () => void
  /** Called when the document was updated successfully. */
  onUpdated: (updated: Doc, updatedTagIds: string[]) => void
  /** Called when the document was deleted. */
  onDeleted: (id: string) => void
}

/**
 * Settings dialog for a single document.
 * Allows editing: title, category, tags, and Downloads-page visibility.
 */
function DocSettingsDialog({
  doc,
  currentTags,
  onClose,
  onUpdated,
  onDeleted,
}: DocSettingsDialogProps) {
  const [editTitle, setEditTitle] = useState("")
  const [editCategory, setEditCategory] = useState("allgemein")
  const [editTagIds, setEditTagIds] = useState<string[]>([])
  const [editShowInDownloads, setEditShowInDownloads] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Sync form state whenever the active document changes
  useEffect(() => {
    if (!doc) return
    setEditTitle(doc.title)
    setEditCategory(doc.category)
    setEditTagIds(currentTags.map((t) => t.id))
    setEditShowInDownloads(doc.show_in_downloads)
  }, [doc, currentTags])

  async function handleSave() {
    if (!doc || !editTitle.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/upload/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          tagIds: editTagIds,
          show_in_downloads: editShowInDownloads,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Speichern fehlgeschlagen")
      }
      onUpdated(
        { ...doc, title: editTitle.trim(), category: editCategory, show_in_downloads: editShowInDownloads },
        editTagIds,
      )
      toast.success("Änderungen gespeichert")
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!doc) return
    if (!confirm(`Dokument „${doc.title}" wirklich löschen?`)) return
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from("documents").delete().eq("id", doc.id)
      try {
        await fetch("/api/upload/delete", {
          method: "DELETE",
          body: JSON.stringify({ url: doc.file_url }),
        })
      } catch {
        // Blob deletion is best-effort — do not abort on failure
      }
      onDeleted(doc.id)
      toast.success("Dokument gelöscht")
      onClose()
    } catch {
      toast.error("Löschen fehlgeschlagen")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={!!doc} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dokument bearbeiten</DialogTitle>
          <DialogDescription>
            Passen Sie Titel, Kategorie, Tags und die Sichtbarkeit auf der Download-Seite an.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="doc-edit-title">Titel</Label>
            <Input
              id="doc-edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="z.B. Elternbrief Dezember 2025"
            />
          </div>

          {/* Category */}
          <div className="grid gap-1.5">
            <Label htmlFor="doc-edit-category">Kategorie</Label>
            <select
              id="doc-edit-category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="grid gap-1.5">
            <Label>Tags</Label>
            <TagSelector selectedTagIds={editTagIds} onChange={setEditTagIds} />
          </div>

          {/* Downloads-page visibility */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="doc-edit-show-in-downloads" className="text-sm font-medium cursor-pointer">
                Auf Download-Seite anzeigen
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Wenn aktiv, erscheint dieses Dokument für Besucher auf der öffentlichen Download-Seite.
              </p>
            </div>
            <Switch
              id="doc-edit-show-in-downloads"
              checked={editShowInDownloads}
              onCheckedChange={setEditShowInDownloads}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={deleting || saving}
            title="Dokument löschen"
            aria-label="Dokument löschen"
          >
            {deleting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
            Löschen
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving || deleting}>
              Abbrechen
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || deleting || !editTitle.trim()}>
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// DocumentsManager
// ---------------------------------------------------------------------------

export function DocumentsManager({ initialDocuments }: { initialDocuments: Doc[] }) {
  const [docs, setDocs] = useState(initialDocuments)

  // ---- Upload form state ----
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("allgemein")
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [uploadedName, setUploadedName] = useState("")
  const [uploadedType, setUploadedType] = useState("")
  const [uploadedSize, setUploadedSize] = useState(0)
  const [saving, setSaving] = useState(false)
  const [newDocTagIds, setNewDocTagIds] = useState<string[]>([])

  // ---- Per-row state ----
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ---- Tag data ----
  const [docTags, setDocTags] = useState<Record<string, TagData[]>>({})
  const [allTags, setAllTags] = useState<TagData[]>([])

  // ---- Settings dialog ----
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null)

  // Load all tags and document-tag assignments on mount
  useEffect(() => {
    const supabase = createClient()
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllTags(data) })
      .catch(() => {})

    supabase.from("document_tags").select("document_id, tag_id").then(({ data }) => {
      if (!data) return
      const map: Record<string, string[]> = {}
      data.forEach((dt) => {
        if (!map[dt.document_id]) map[dt.document_id] = []
        map[dt.document_id].push(dt.tag_id)
      })
      setDocTags((prev) => {
        const result: Record<string, TagData[]> = {}
        // Carry forward any entries already in state, then overlay the fresh data
        Object.assign(result, prev)
        Object.entries(map).forEach(([docId, tIds]) => {
          result[docId] = tIds.map((tid) => ({ id: tid, name: "", color: "blue" }))
        })
        return result
      })
    }).catch(() => {})
  }, [])

  // Resolve tag display names once allTags is available
  useEffect(() => {
    if (allTags.length === 0) return
    setDocTags((prev) => {
      const result: Record<string, TagData[]> = {}
      Object.entries(prev).forEach(([docId, tags]) => {
        result[docId] = tags
          .map((t) => allTags.find((at) => at.id === t.id))
          .filter(Boolean) as TagData[]
      })
      return result
    })
  }, [allTags])

  // ---- Upload form: save new document ----
  async function handleSave() {
    if (!title || !uploadedUrl) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { data, error } = await supabase.from("documents").insert({
      title,
      file_url: uploadedUrl,
      file_name: uploadedName,
      file_size: uploadedSize,
      file_type: uploadedType,
      category,
      // Documents uploaded via the Downloads Manager are intentional downloads
      // and should appear on the public Downloads page immediately.
      show_in_downloads: true,
      status: "published",
      user_id: user.id,
    }).select().single()

    if (!error && data) {
      if (newDocTagIds.length > 0) {
        await supabase.from("document_tags").insert(
          newDocTagIds.map((tag_id) => ({ document_id: data.id, tag_id }))
        )
        setDocTags((prev) => ({
          ...prev,
          [data.id]: newDocTagIds
            .map((tid) => allTags.find((t) => t.id === tid))
            .filter(Boolean) as TagData[],
        }))
      }
      setDocs([data, ...docs])
      setTitle("")
      setUploadedUrl("")
      setUploadedName("")
      setNewDocTagIds([])
    }
    setSaving(false)
  }

  // ---- Settings dialog callbacks ----
  function handleDocUpdated(updated: Doc, updatedTagIds: string[]) {
    setDocs((prev) => prev.map((d) => d.id === updated.id ? updated : d))
    setDocTags((prev) => ({
      ...prev,
      [updated.id]: updatedTagIds
        .map((tid) => allTags.find((t) => t.id === tid))
        .filter(Boolean) as TagData[],
    }))
  }

  function handleDocDeleted(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  // ---- Utility ----
  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div>
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dokumente & Medien</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Laden Sie Dateien hoch und kopieren Sie die URL, um sie auf Seiten und Beiträgen einzubinden.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Upload form                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-6 rounded-2xl border bg-card p-6 space-y-4">
        <h3 className="font-display font-semibold">Neues Dokument hochladen</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Titel / Beschreibung</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Elternbrief Dezember 2025"
            />
          </div>
          <div className="space-y-2">
            <Label>Kategorie</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <TagSelector selectedTagIds={newDocTagIds} onChange={setNewDocTagIds} />
        </div>
        {uploadedUrl ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <span className="text-sm font-medium flex-1 truncate">{uploadedName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setUploadedUrl(""); setUploadedName("") }}
            >
              Andere Datei
            </Button>
          </div>
        ) : (
          <FileUploader
            label="Datei hochladen (PDF, Bild, etc.)"
            onUpload={(f) => {
              setUploadedUrl(f.url)
              setUploadedName(f.filename)
              setUploadedType(f.type)
              setUploadedSize(f.size)
            }}
          />
        )}
        <Button onClick={handleSave} disabled={saving || !title || !uploadedUrl}>
          {saving ? "Wird gespeichert..." : "Dokument speichern"}
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Document list                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-8">
        <h3 className="font-display font-semibold mb-4">Alle Dokumente ({docs.length})</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Noch keine Dokumente hochgeladen.
          </p>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                {/* File-type icon */}
                {doc.file_type?.startsWith("image/") ? (
                  <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                )}

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{doc.title}</p>
                    {doc.show_in_downloads && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Download-Seite
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {doc.file_name} &middot; {formatSize(doc.file_size)} &middot; {doc.category}
                  </p>
                  {docTags[doc.id] && docTags[doc.id].length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {docTags[doc.id].map((tag) => (
                        <TagBadge key={tag.id} tag={tag} size="xs" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Settings gear — opens the edit dialog */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingDoc(doc)}
                    title="Einstellungen"
                    aria-label="Dokument-Einstellungen öffnen"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>

                  {/* Copy URL */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyUrl(doc.id, doc.file_url)}
                    title="URL kopieren"
                    aria-label="URL kopieren"
                  >
                    {copiedId === doc.id
                      ? <Check className="h-3.5 w-3.5 text-green-600" />
                      : <Copy className="h-3.5 w-3.5" />
                    }
                  </Button>

                  {/* Open in new tab */}
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Öffnen"
                      aria-label="Datei öffnen"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Per-document settings dialog                                        */}
      {/* ------------------------------------------------------------------ */}
      <DocSettingsDialog
        doc={editingDoc}
        currentTags={editingDoc ? (docTags[editingDoc.id] ?? []) : []}
        onClose={() => setEditingDoc(null)}
        onUpdated={handleDocUpdated}
        onDeleted={handleDocDeleted}
      />
    </div>
  )
}
