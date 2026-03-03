"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ImageIcon, Upload, Link as LinkIcon, X, Check, Loader2, Search, AlertTriangle,
} from "lucide-react"
import { TagSelector } from "./tag-selector"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImagePickerProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  hint?: string
  aspectRatio?: "16/9" | "1/1" | "free"
}

interface BlobItem {
  id?: string
  url: string
  pathname: string
  size: number
  uploadedAt: string
}

interface DuplicateInfo {
  id: string
  url: string
  title: string
  filename: string
  size: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImagePicker({
  value,
  onChange,
  label,
  hint,
  aspectRatio = "free",
}: ImagePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}

      {/* Preview / Trigger */}
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Ausgewähltes Bild"
              className={`object-cover ${
                aspectRatio === "16/9" ? "h-32 w-56" : aspectRatio === "1/1" ? "h-32 w-32" : "h-32 w-auto max-w-[14rem]"
              }`}
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-3 w-3" />
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
          <ImageIcon className="h-3.5 w-3.5" />
          {value ? "Bild ändern" : "Bild auswählen"}
        </Button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Bild entfernen
          </button>
        )}
      </div>

      {/* Modal */}
      {open && (
        <ImagePickerModal
          currentValue={value}
          aspectRatio={aspectRatio}
          onSelect={(url) => {
            onChange(url)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Post-upload metadata panel
// ---------------------------------------------------------------------------

interface MetadataFormState {
  documentId: string
  url: string
  filename: string
  size: number
  title: string
  altText: string
  tagIds: string[]
}

function PostUploadMetadata({
  data,
  onSaveAndUse,
  onSkip,
}: {
  data: MetadataFormState
  onSaveAndUse: (url: string) => void
  onSkip: (url: string) => void
}) {
  const [title, setTitle] = useState(data.title)
  const [altText, setAltText] = useState(data.altText)
  const [tagIds, setTagIds] = useState<string[]>(data.tagIds)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (data.documentId) {
        const res = await fetch(`/api/upload/${data.documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, alt_text: altText, tagIds }),
        })
        if (!res.ok) throw new Error("Speichern fehlgeschlagen")
      }
      onSaveAndUse(data.url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler")
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 p-4">
        <div className="overflow-hidden rounded-lg border w-24 h-24 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.url} alt={data.filename} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Bild hochgeladen
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">Dateiname: {data.filename}</p>
          <p className="text-xs text-muted-foreground">Größe: {formatFileSize(data.size)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid gap-1.5">
          <Label htmlFor="upload-title" className="text-sm">Titel *</Label>
          <Input
            id="upload-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Schulfest 2024"
            autoFocus
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="upload-alt" className="text-sm">Alt-Text (für Barrierefreiheit)</Label>
          <Input
            id="upload-alt"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="z.B. Schüler beim Schulfest auf dem Hof"
          />
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            ℹ️ Alt-Texte helfen blinden Nutzern, Bilder zu verstehen
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-sm">Tags</Label>
          <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={() => onSkip(data.url)}>
          Überspringen
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
          Speichern &amp; verwenden
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function ImagePickerModal({
  currentValue,
  aspectRatio,
  onSelect,
  onClose,
}: {
  currentValue: string | null
  aspectRatio: string
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<"mediathek" | "hochladen" | "url">("mediathek")
  const [blobs, setBlobs] = useState<BlobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(false)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(currentValue)
  const [urlInput, setUrlInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [metadataForm, setMetadataForm] = useState<MetadataFormState | null>(null)
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadBlobs = useCallback(async (cursorParam?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cursorParam) params.set("cursor", cursorParam)
      params.set("limit", "50")
      params.set("type", "image")
      const res = await fetch(`/api/upload?${params.toString()}`)
      const data = await res.json()
      if (cursorParam) {
        setBlobs((prev) => [...prev, ...(data.blobs || [])])
      } else {
        setBlobs(data.blobs || [])
      }
      setCursor(data.cursor)
      setHasMore(data.hasMore || false)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBlobs()
  }, [loadBlobs])

  const filteredBlobs = search
    ? blobs.filter((b) => b.pathname.toLowerCase().includes(search.toLowerCase()))
    : blobs

  const checkDuplicate = async (file: File): Promise<DuplicateInfo | null> => {
    try {
      const params = new URLSearchParams({ filename: file.name, size: String(file.size) })
      const res = await fetch(`/api/upload?${params.toString()}`)
      const data = await res.json()
      if (data.duplicates && data.duplicates.length > 0) {
        return data.duplicates[0]
      }
    } catch { /* ignore */ }
    return null
  }

  const handleUpload = async (file: File) => {
    const dupe = await checkDuplicate(file)
    if (dupe) {
      setDuplicate(dupe)
      setPendingFile(file)
      return
    }
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
        setMetadataForm({
          documentId: data.documentId || "",
          url: data.url,
          filename: data.filename || file.name,
          size: data.size || file.size,
          title: file.name.replace(/\.[^.]+$/, ""),
          altText: "",
          tagIds: [],
        })
        setBlobs((prev) => [
          { id: data.documentId, url: data.url, pathname: data.filename, size: data.size, uploadedAt: new Date().toISOString() },
          ...prev,
        ])
      }
    } catch {
      // Silent fail
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleUpload(file)
    }
  }

  const handleMetadataDone = (url: string) => {
    setMetadataForm(null)
    setSelected(url)
    setTab("mediathek")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Bild auswählen</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {[
            { key: "mediathek" as const, label: "Mediathek", icon: ImageIcon },
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
          {tab === "mediathek" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Bilder suchen..."
                  className="pl-9 h-9"
                />
              </div>
              {loading && blobs.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredBlobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Keine Bilder gefunden</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setTab("hochladen")}
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Bild hochladen
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {filteredBlobs.map((blob) => {
                      const isSelected = selected === blob.url
                      const filename = blob.pathname.split("/").pop() || blob.pathname
                      return (
                        <button
                          key={blob.url}
                          type="button"
                          onClick={() => setSelected(blob.url)}
                          className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                            isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={blob.url}
                            alt={filename}
                            className={`w-full object-cover ${aspectRatio === "1/1" ? "aspect-square" : aspectRatio === "free" ? "aspect-auto max-h-40" : "aspect-video"}`}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="truncate text-[10px] text-white">{filename}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadBlobs(cursor)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                        Mehr laden
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "hochladen" && (
            <>
              {/* Duplicate warning */}
              {duplicate && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4 mb-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Eine Datei mit diesem Namen existiert bereits in der Mediathek.
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        {duplicate.filename} ({duplicate.title})
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onSelect(duplicate.url)}>
                      Vorhandene Datei verwenden
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { if (pendingFile) performUpload(pendingFile) }}>
                      Trotzdem hochladen
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setDuplicate(null); setPendingFile(null) }}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}

              {/* Post-upload metadata form */}
              {metadataForm ? (
                <PostUploadMetadata
                  data={metadataForm}
                  onSaveAndUse={handleMetadataDone}
                  onSkip={handleMetadataDone}
                />
              ) : !duplicate && (
                <div
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
                    {uploading ? "Wird hochgeladen..." : "Bild hier ablegen oder klicken"}
                  </p>
                  {!uploading && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Datei auswählen
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {tab === "url" && (
            <div className="space-y-4">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/bild.jpg"
                className="font-mono text-sm"
              />
              {urlInput && (
                <div className="overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlInput}
                    alt="Vorschau"
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
              <Button
                size="sm"
                onClick={() => {
                  if (urlInput.trim()) onSelect(urlInput.trim())
                }}
                disabled={!urlInput.trim()}
              >
                URL verwenden
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {tab === "mediathek" && (
          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (selected) onSelect(selected)
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
