"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FileText, Upload, Link as LinkIcon, X, Check, Loader2, Search, AlertTriangle,
} from "lucide-react"
import { TagSelector } from "./tag-selector"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocumentPickerProps {
  value: { url: string; title: string } | null
  onChange: (doc: { url: string; title: string; fileType: string } | null) => void
  label?: string
  hint?: string
  allowedTypes?: string[]
}

interface DocItem {
  id?: string
  url: string
  pathname: string
  title: string
  size: number
  fileType: string | null
  uploadedAt: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentPicker({
  value,
  onChange,
  label,
  hint,
}: DocumentPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}

      <div className="flex items-center gap-3">
        {value ? (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[200px]">{value.title}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5"
        >
          <FileText className="h-3.5 w-3.5" />
          {value ? "Datei ändern" : "Datei auswählen"}
        </Button>
      </div>

      {open && (
        <DocumentPickerModal
          onSelect={(doc) => {
            onChange(doc)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function DocumentPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (doc: { url: string; title: string; fileType: string }) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<"bibliothek" | "hochladen" | "url">("bibliothek")
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<DocItem | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [urlTitle, setUrlTitle] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadTagIds, setUploadTagIds] = useState<string[]>([])
  const [uploadedDoc, setUploadedDoc] = useState<{ id: string; url: string; filename: string; size: number; type: string } | null>(null)
  const [duplicate, setDuplicate] = useState<{ id: string; url: string; title: string; filename: string } | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDocs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/upload?limit=100")
      const data = await res.json()
      // Filter out images — only show non-image documents
      const allDocs = (data.blobs || []) as Array<{
        id?: string; url: string; pathname: string; size: number; uploadedAt: string
      }>
      // We can't filter by file_type from the blobs response, so show all
      setDocs(allDocs.map((d) => ({
        ...d,
        title: d.pathname.split("/").pop() || d.pathname,
        fileType: null,
      })))
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocs()
  }, [loadDocs])

  const filteredDocs = search
    ? docs.filter((d) => d.pathname.toLowerCase().includes(search.toLowerCase()) || d.title.toLowerCase().includes(search.toLowerCase()))
    : docs

  const handleUpload = async (file: File) => {
    // Check for duplicates
    try {
      const params = new URLSearchParams({ filename: file.name, size: String(file.size) })
      const res = await fetch(`/api/upload?${params.toString()}`)
      const data = await res.json()
      if (data.duplicates && data.duplicates.length > 0) {
        setDuplicate(data.duplicates[0])
        setPendingFile(file)
        return
      }
    } catch { /* ignore */ }
    await performUpload(file)
  }

  const performUpload = async (file: File) => {
    setUploading(true)
    setDuplicate(null)
    setPendingFile(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        setUploadedDoc({
          id: data.documentId || "",
          url: data.url,
          filename: data.filename || file.name,
          size: data.size || file.size,
          type: data.type || file.type,
        })
        setUploadTitle(file.name.replace(/\.[^.]+$/, ""))
      }
    } catch { /* ignore */ } finally {
      setUploading(false)
    }
  }

  const handleSaveAndUse = async () => {
    if (!uploadedDoc) return
    if (uploadedDoc.id && uploadTitle) {
      try {
        await fetch(`/api/upload/${uploadedDoc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: uploadTitle, tagIds: uploadTagIds }),
        })
      } catch { /* ignore */ }
    }
    onSelect({
      url: uploadedDoc.url,
      title: uploadTitle || uploadedDoc.filename,
      fileType: uploadedDoc.type,
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Datei auswählen</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {[
            { key: "bibliothek" as const, label: "Dateibibliothek", icon: FileText },
            { key: "hochladen" as const, label: "Hochladen", icon: Upload },
            { key: "url" as const, label: "URL", icon: LinkIcon },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "bibliothek" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Dateien suchen..."
                  className="pl-9 h-9"
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Keine Dateien gefunden</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setTab("hochladen")}>
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Datei hochladen
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredDocs.map((doc) => {
                    const isSelected = selected?.url === doc.url
                    const filename = doc.pathname.split("/").pop() || doc.pathname
                    return (
                      <button
                        key={doc.url}
                        type="button"
                        onClick={() => setSelected(doc)}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                          isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/50"
                        }`}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{filename}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatFileSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "hochladen" && (
            <>
              {duplicate && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4 mb-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Eine Datei mit diesem Namen existiert bereits.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      onSelect({ url: duplicate.url, title: duplicate.title, fileType: "" })
                    }}>
                      Vorhandene verwenden
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { if (pendingFile) performUpload(pendingFile) }}>
                      Trotzdem hochladen
                    </Button>
                  </div>
                </div>
              )}

              {uploadedDoc ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 p-4">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Datei hochgeladen</p>
                      <p className="text-xs text-muted-foreground">{uploadedDoc.filename} · {formatFileSize(uploadedDoc.size)}</p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Titel</Label>
                      <Input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Dateititel" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-sm">Tags</Label>
                      <TagSelector selectedTagIds={uploadTagIds} onChange={setUploadTagIds} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      onSelect({ url: uploadedDoc.url, title: uploadedDoc.filename, fileType: uploadedDoc.type })
                    }}>
                      Überspringen
                    </Button>
                    <Button size="sm" onClick={handleSaveAndUse}>
                      Speichern &amp; verwenden
                    </Button>
                  </div>
                </div>
              ) : !duplicate && (
                <div
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) handleUpload(file)
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleUpload(f)
                    }}
                  />
                  {uploading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                  ) : (
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                  )}
                  <p className="text-sm font-medium text-muted-foreground">
                    {uploading ? "Wird hochgeladen..." : "Datei hier ablegen oder klicken"}
                  </p>
                  {!uploading && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                      Datei auswählen
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {tab === "url" && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Titel</Label>
                <Input
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Titel der Datei"
                />
              </div>
              <div className="grid gap-2">
                <Label>URL</Label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/datei.pdf"
                  className="font-mono text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (urlInput.trim()) onSelect({
                    url: urlInput.trim(),
                    title: urlTitle || urlInput.split("/").pop() || "Datei",
                    fileType: "",
                  })
                }}
                disabled={!urlInput.trim()}
              >
                URL verwenden
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === "bibliothek" && (
          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (selected) onSelect({
                  url: selected.url,
                  title: selected.title,
                  fileType: selected.fileType || "",
                })
              }}
              disabled={!selected}
            >
              Auswählen
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
