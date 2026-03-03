"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FileUploader } from "./file-uploader"
import { TagSelector, TagBadge } from "./tag-selector"
import type { TagData } from "./tag-selector"
import { Trash2, ExternalLink, FileText, ImageIcon, Copy, Check, Folder, ChevronRight, ChevronDown, Plus, Edit2, Globe, Lock } from "lucide-react"
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import { useDroppable } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"

interface Doc {
  id: string
  title: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string | null
  category: string
  folder_id: string | null
  is_public: boolean
  status: string
  created_at: string
}

interface DocFolder {
  id: string
  name: string
  parent_id: string | null
  slug: string
}

// ---------------------------------------------------------------------------
// Draggable Document Item
// ---------------------------------------------------------------------------

function DraggableDocItem({
  doc,
  tags,
  copiedId,
  onCopyUrl,
  onDelete,
}: {
  doc: Doc
  tags?: TagData[]
  copiedId: string | null
  onCopyUrl: (id: string, url: string) => void
  onDelete: (id: string, fileUrl: string) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: doc.id,
    data: { type: "document", doc },
  })

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30 ${
        isDragging ? "opacity-50" : ""
      }`}
      {...attributes}
    >
      <div className="flex-1 min-w-0 flex items-center gap-4 cursor-grab active:cursor-grabbing" {...listeners}>
        {doc.file_type?.startsWith("image/") ? (
          <ImageIcon className="h-5 w-5 text-primary shrink-0" />
        ) : (
          <FileText className="h-5 w-5 text-primary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{doc.title}</p>
            {doc.is_public !== false ? (
               <Globe className="h-3 w-3 text-muted-foreground" title="Öffentlich sichtbar" />
            ) : (
               <Lock className="h-3 w-3 text-amber-500" title="Privat (nur im CMS sichtbar)" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {doc.file_name} &middot; {formatSize(doc.file_size)} &middot; {doc.category}
          </p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} size="xs" />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopyUrl(doc.id, doc.file_url)} title="URL kopieren">
          {copiedId === doc.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Öffnen">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(doc.id, doc.file_url)} title="Löschen">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Droppable Folder Tree Item
// ---------------------------------------------------------------------------

function FolderTreeItem({
  folder,
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateSubfolder,
  onRenameFolder,
  onDeleteFolder,
  level = 0,
}: {
  folder: DocFolder
  folders: DocFolder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onCreateSubfolder: (parentId: string) => void
  onRenameFolder: (id: string, currentName: string) => void
  onDeleteFolder: (id: string, hasChildren: boolean) => void
  level?: number
}) {
  const [expanded, setExpanded] = useState(true)
  const childFolders = folders.filter((f) => f.parent_id === folder.id)

  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: "folder", folderId: folder.id },
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const submitEdit = () => {
    setIsEditing(false)
    if (editName.trim() !== "" && editName.trim() !== folder.name) {
      onRenameFolder(folder.id, editName.trim())
    } else {
      setEditName(folder.name)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitEdit()
    } else if (e.key === "Escape") {
      setEditName(folder.name)
      setIsEditing(false)
    }
  }

  return (
    <div>
      <div
        ref={setNodeRef}
        className={`group flex items-center gap-1 py-1 px-2 rounded-md transition-colors ${
          selectedFolderId === folder.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
        } ${isOver ? "bg-primary/20 ring-1 ring-primary" : ""}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          className="p-1 text-muted-foreground hover:text-foreground invisible group-hover:visible cursor-pointer"
          style={{ visibility: childFolders.length > 0 ? "visible" : undefined }}
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {childFolders.length > 0 ? (
            expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <div className="w-3.5 h-3.5" />
          )}
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={() => !isEditing && onSelectFolder(folder.id)}>
          <Folder className="h-4 w-4 shrink-0" />
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={submitEdit}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-background border rounded px-1 text-sm outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm truncate select-none">{folder.name}</span>
          )}
        </div>

        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onCreateSubfolder(folder.id) }}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id, childFolders.length > 0) }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {expanded && childFolders.length > 0 && (
        <div>
          {childFolders.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onCreateSubfolder={onCreateSubfolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DocumentsManager({ initialDocuments, initialFolders }: { initialDocuments: Doc[], initialFolders: DocFolder[] }) {
  const [docs, setDocs] = useState<Doc[]>(initialDocuments)
  const [folders, setFolders] = useState<DocFolder[]>(initialFolders)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("allgemein")
  const [isPublic, setIsPublic] = useState(true)
  const [uploadedUrl, setUploadedUrl] = useState("")
  const [uploadedName, setUploadedName] = useState("")
  const [uploadedType, setUploadedType] = useState("")
  const [uploadedSize, setUploadedSize] = useState(0)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [newDocTagIds, setNewDocTagIds] = useState<string[]>([])
  const [docTags, setDocTags] = useState<Record<string, TagData[]>>({})
  const [allTags, setAllTags] = useState<TagData[]>([])

  const [activeDragDoc, setActiveDragDoc] = useState<Doc | null>(null)

  const [creatingFolderParentId, setCreatingFolderParentId] = useState<string | null | undefined>(undefined)
  const [newFolderName, setNewFolderName] = useState("")
  const newFolderInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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
        Object.entries(map).forEach(([docId, tIds]) => {
          result[docId] = tIds.map((tid) => ({ id: tid, name: "", color: "blue" }))
        })
        return result
      })
    }).catch(() => {})
  }, [])

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

  useEffect(() => {
    if (creatingFolderParentId !== undefined && newFolderInputRef.current) {
      newFolderInputRef.current.focus()
    }
  }, [creatingFolderParentId])

  async function handleSaveDoc() {
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
      folder_id: selectedFolderId,
      is_public: isPublic,
      status: 'published',
      user_id: user.id,
    }).select().single()

    if (!error && data) {
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
      setIsPublic(true)
    }
    setSaving(false)
  }

  async function handleDeleteDoc(id: string, fileUrl: string) {
    if (!confirm("Dokument wirklich löschen?")) return
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

  function initiateCreateFolder(parentId: string | null = null) {
    setCreatingFolderParentId(parentId)
    setNewFolderName("")
  }

  async function submitCreateFolder() {
    if (creatingFolderParentId === undefined) return
    const name = newFolderName.trim()
    if (!name) {
      setCreatingFolderParentId(undefined)
      return
    }

    const parentId = creatingFolderParentId
    setCreatingFolderParentId(undefined)

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    const supabase = createClient()
    const { data, error } = await supabase.from("document_folders").insert({
      name: name,
      parent_id: parentId,
      slug: slug || "folder",
      is_public: true,
    }).select().single()

    if (!error && data) {
      setFolders([...folders, data])
    }
  }

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitCreateFolder()
    } else if (e.key === "Escape") {
      setCreatingFolderParentId(undefined)
    }
  }

  async function handleRenameFolder(id: string, newName: string) {
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    const supabase = createClient()
    const { error } = await supabase.from("document_folders").update({ name: newName, slug: slug || "folder" }).eq("id", id)
    if (!error) {
      setFolders(folders.map(f => f.id === id ? { ...f, name: newName, slug: slug || "folder" } : f))
    }
  }

  async function handleDeleteFolder(id: string, hasChildren: boolean) {
    const supabase = createClient()
    const folderDocs = docs.filter(d => d.folder_id === id)

    if (hasChildren || folderDocs.length > 0) {
      const deleteConfirm = confirm(`Möchten Sie den Ordner und ALLE darin enthaltenen Dateien/Unterordner komplett löschen?\n\n[OK] = Komplett löschen\n[Abbrechen] = Weiter zur Option "Verschieben" oder Abbrechen`)
      if (!deleteConfirm) {
        const moveConfirm = confirm(`Möchten Sie stattdessen den Inhalt in den übergeordneten Ordner verschieben und nur diesen Ordner löschen?\n\n[OK] = Inhalt verschieben und Ordner löschen\n[Abbrechen] = Vorgang komplett abbrechen`)
        if (!moveConfirm) {
          return // Abort completely
        }

        const folder = folders.find(f => f.id === id)
        const parentId = folder ? folder.parent_id : null

        await supabase.from("documents").update({ folder_id: parentId }).eq("folder_id", id)
        await supabase.from("document_folders").update({ parent_id: parentId }).eq("parent_id", id)
        await supabase.from("document_folders").delete().eq("id", id)

        setDocs(docs.map(d => d.folder_id === id ? { ...d, folder_id: parentId } : d))
        setFolders(folders.filter(f => f.id !== id).map(f => f.parent_id === id ? { ...f, parent_id: parentId } : f))
        if (selectedFolderId === id) setSelectedFolderId(parentId)
        return
      }
    } else {
        const simpleConfirm = confirm("Diesen leeren Ordner wirklich löschen?")
        if (!simpleConfirm) return
    }

    if (folderDocs.length > 0) {
        setDocs(docs.filter(d => d.folder_id !== id))
        for (const doc of folderDocs) {
            await supabase.from("documents").delete().eq("id", doc.id)
            try { await fetch("/api/upload/delete", { method: "DELETE", body: JSON.stringify({ url: doc.file_url }) }) } catch {}
        }
    }

    await supabase.from("document_folders").delete().eq("id", id)
    setFolders(folders.filter(f => f.id !== id))

    if (selectedFolderId === id) setSelectedFolderId(null)
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    if (active.data.current?.type === "document") {
      setActiveDragDoc(active.data.current.doc as Doc)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragDoc(null)
    const { active, over } = event

    if (!over) return

    const docId = active.id
    const isRootDrop = over.id === "root-folder"
    const targetFolderId = isRootDrop ? null : over.data.current?.folderId

    const draggedDoc = docs.find(d => d.id === docId)
    if (!draggedDoc || draggedDoc.folder_id === targetFolderId) return

    setDocs(docs.map(d => d.id === docId ? { ...d, folder_id: targetFolderId } : d))

    const supabase = createClient()
    await supabase.from("documents").update({ folder_id: targetFolderId }).eq("id", docId)
  }

  const rootFolders = folders.filter(f => !f.parent_id)
  const displayedDocs = selectedFolderId === null
    ? docs
    : docs.filter(d => d.folder_id === selectedFolderId)

  const { setNodeRef: setRootDropRef, isOver: isRootOver } = useDroppable({
    id: "root-folder",
    data: { type: "folder", folderId: null },
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dokumente & Medien</h1>
            <p className="mt-1 text-sm text-muted-foreground">Laden Sie Dateien hoch und organisieren Sie diese in Ordnern.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-6">

          <div className="w-full md:w-64 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Ordner</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => initiateCreateFolder(null)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-xl border bg-card p-2 space-y-1 max-h-[600px] overflow-y-auto">
              <div
                ref={setRootDropRef}
                className={`flex items-center gap-2 py-1.5 px-3 rounded-md transition-colors cursor-pointer ${
                  selectedFolderId === null ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                } ${isRootOver ? "bg-primary/20 ring-1 ring-primary" : ""}`}
                onClick={() => setSelectedFolderId(null)}
              >
                <Folder className="h-4 w-4 shrink-0" />
                <span className="text-sm">Alle Dateien</span>
              </div>

              <div className="pt-2 border-t border-border/50 mt-2 space-y-0.5">
                {creatingFolderParentId === null && (
                   <div className="flex items-center gap-2 py-1 px-2 pl-8 rounded-md bg-muted/50">
                     <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                     <input
                        ref={newFolderInputRef}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onBlur={submitCreateFolder}
                        onKeyDown={handleCreateKeyDown}
                        className="flex-1 bg-background border rounded px-1 text-sm outline-none"
                        placeholder="Neuer Ordner..."
                     />
                   </div>
                )}
                {rootFolders.map(folder => (
                  <div key={folder.id}>
                    <FolderTreeItem
                      folder={folder}
                      folders={folders}
                      selectedFolderId={selectedFolderId}
                      onSelectFolder={setSelectedFolderId}
                      onCreateSubfolder={initiateCreateFolder}
                      onRenameFolder={handleRenameFolder}
                      onDeleteFolder={handleDeleteFolder}
                    />
                    {creatingFolderParentId === folder.id && (
                        <div className="flex items-center gap-2 py-1 px-2 pl-12 rounded-md bg-muted/50">
                          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <input
                              ref={newFolderInputRef}
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              onBlur={submitCreateFolder}
                              onKeyDown={handleCreateKeyDown}
                              className="flex-1 bg-background border rounded px-1 text-sm outline-none"
                              placeholder="Neuer Ordner..."
                          />
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">

            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <h3 className="font-display font-semibold">
                Neues Dokument {selectedFolderId ? "in diesen Ordner " : ""}hochladen
              </h3>

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
                    <option value="lehrplaene">Lehrpläne</option>
                    <option value="bilder">Bilder</option>
                    <option value="praesentation">Präsentationen</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagSelector selectedTagIds={newDocTagIds} onChange={setNewDocTagIds} />
                </div>
                <div className="space-y-2">
                  <Label>Sichtbarkeit</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label htmlFor="is-public" className="cursor-pointer font-normal text-sm">
                      {isPublic ? "Öffentlich (Auf Downloads-Seite sichtbar)" : "Privat (Nur intern im CMS)"}
                    </Label>
                  </div>
                </div>
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
              <Button onClick={handleSaveDoc} disabled={saving || !title || !uploadedUrl}>
                {saving ? "Wird gespeichert..." : "Dokument speichern"}
              </Button>
            </div>

            <div>
              <h3 className="font-display font-semibold mb-4">
                {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name || "Ordner" : "Alle Dokumente"} ({displayedDocs.length})
              </h3>
              {displayedDocs.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/20">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Keine Dokumente in diesem Bereich.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedDocs.map((doc) => (
                    <DraggableDocItem
                      key={doc.id}
                      doc={doc}
                      tags={docTags[doc.id]}
                      copiedId={copiedId}
                      onCopyUrl={copyUrl}
                      onDelete={handleDeleteDoc}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDragDoc ? (
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-xl opacity-90 w-96 cursor-grabbing">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{activeDragDoc.title}</p>
              <p className="text-xs text-muted-foreground">{activeDragDoc.file_name}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
