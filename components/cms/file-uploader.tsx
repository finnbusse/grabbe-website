"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
}

interface FileUploaderProps {
  onUpload: (file: UploadedFile) => void
  accept?: string
  label?: string
}

export function FileUploader({ onUpload, accept = "*/*", label = "Datei hochladen" }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Upload fehlgeschlagen' }))
        
        // Show specific error message
        let errorMsg = errorData.error || "Upload fehlgeschlagen"
        if (errorData.hint) {
          errorMsg += "\n\n" + errorData.hint
        }
        
        alert(errorMsg)
        throw new Error(errorMsg)
      }
      
      const data = await res.json()
      onUpload(data)
    } catch (error: any) {
      console.error("Upload error:", error)
      // Error already shown in alert above
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">Drag & Drop oder klicken</p>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Datei auswählen
          </Button>
        </div>
      )}
    </div>
  )
}

interface FileListItemProps {
  url: string
  name: string
  type?: string
  onRemove?: () => void
  onInsert?: () => void
}

export function FileListItem({ url, name, type, onRemove, onInsert }: FileListItemProps) {
  const isImage = type?.startsWith("image/")
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      {isImage ? <ImageIcon className="h-5 w-5 text-primary shrink-0" /> : <FileText className="h-5 w-5 text-primary shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{url}</a>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onInsert && (
          <Button type="button" variant="ghost" size="sm" onClick={onInsert} className="text-xs">
            Einfügen
          </Button>
        )}
        {onRemove && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7 text-destructive hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
