"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUploader } from "./file-uploader"
import { TagSelector, TagBadge } from "./tag-selector"
import type { TagData } from "./tag-selector"
import { Trash2, ExternalLink, FileText, ImageIcon, Copy, Check } from "lucide-react"

interface Doc {
  id: string
  title: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string | null
  category: string
  published: boolean
  created_at: string
}

export function DocumentsManager({ initialDocuments }: { initialDocuments: Doc[] }) {
  const [docs, setDocs] = useState(initialDocuments)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("allgemein")
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [uploadedName, setUploadedName] = useState("")
  const [uploadedType, setUploadedType] = useState("")
  const [uploadedSize, setUploadedSize] = useState(0)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newDocTagIds, setNewDocTagIds] = useState<string[]>([])
  const [docTags, setDocTags] = useState<Record<string, TagData[]>>({})
  const [allTags, setAllTags] = useState<TagData[]>([])

  // Load all tags and document-tag assignments
  useEffect(() => {
    const supabase = createClient()
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllTags(data) })
      .catch(() => {})
    // Load document_tags for all documents
    supabase.from("document_tags").select("document_id, tag_id").then(({ data }) => {
      if (!data) return
      const map: Record<string, string[]> = {}
      data.forEach((dt) => {
        if (!map[dt.document_id]) map[dt.document_id] = []
        map[dt.document_id].push(dt.tag_id)
      })
      // We'll resolve tag objects once allTags loads
      setDocTags((prev) => {
        const result: Record<string, TagData[]> = {}
        // Will be resolved via allTags effect
        Object.entries(map).forEach(([docId, tIds]) => {
          result[docId] = tIds.map((tid) => ({ id: tid, name: "", color: "blue" }))
        })
        return result
      })
    }).catch(() => {})
  }, [])

  // Resolve tag names once allTags is loaded
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
      published: true,
      user_id: user.id,
    }).select().single()

    if (!error && data) {
      // Save tags for the new document
      if (newDocTagIds.length > 0) {
        await supabase.from("document_tags").insert(
          newDocTagIds.map((tag_id) => ({ document_id: data.id, tag_id }))
        )
        setDocTags((prev) => ({
          ...prev,
          [data.id]: newDocTagIds.map((tid) => allTags.find((t) => t.id === tid)).filter(Boolean) as TagData[],
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

  async function handleDelete(id: string, fileUrl: string) {
    if (!confirm("Dokument wirklich loeschen?")) return
    const supabase = createClient()
    await supabase.from("documents").delete().eq("id", id)
    try { await fetch("/api/upload/delete", { method: "DELETE", body: JSON.stringify({ url: fileUrl }) }) } catch {}
    setDocs(docs.filter((d) => d.id !== id))
  }

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
      <h1 className="font-display text-2xl font-bold">Dokumente & Medien</h1>
      <p className="mt-1 text-sm text-muted-foreground">Laden Sie Dateien hoch und kopieren Sie die URL, um sie auf Seiten und Beitraegen einzubinden.</p>

      <div className="mt-6 rounded-2xl border bg-card p-6 space-y-4">
        <h3 className="font-display font-semibold">Neues Dokument hochladen</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Titel / Beschreibung</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Elternbrief Dezember 2025" />
          </div>
          <div className="space-y-2">
            <Label>Kategorie</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="allgemein">Allgemein</option>
              <option value="elternbriefe">Elternbriefe</option>
              <option value="formulare">Formulare</option>
              <option value="lehrplaene">Lehrplaene</option>
              <option value="bilder">Bilder</option>
              <option value="praesentation">Praesentationen</option>
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
            <Button variant="outline" size="sm" onClick={() => { setUploadedUrl(""); setUploadedName("") }}>Andere Datei</Button>
          </div>
        ) : (
          <FileUploader label="Datei hochladen (PDF, Bild, etc.)" onUpload={(f) => { setUploadedUrl(f.url); setUploadedName(f.filename); setUploadedType(f.type); setUploadedSize(f.size) }} />
        )}
        <Button onClick={handleSave} disabled={saving || !title || !uploadedUrl}>
          {saving ? "Wird gespeichert..." : "Dokument speichern"}
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="font-display font-semibold mb-4">Alle Dokumente ({docs.length})</h3>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Noch keine Dokumente hochgeladen.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30">
                {doc.file_type?.startsWith("image/") ? (
                  <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.file_name} &middot; {formatSize(doc.file_size)} &middot; {doc.category}</p>
                  {docTags[doc.id] && docTags[doc.id].length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {docTags[doc.id].map((tag) => (
                        <TagBadge key={tag.id} tag={tag} size="xs" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyUrl(doc.id, doc.file_url)} title="URL kopieren">
                    {copiedId === doc.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Oeffnen">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(doc.id, doc.file_url)} title="Loeschen">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
