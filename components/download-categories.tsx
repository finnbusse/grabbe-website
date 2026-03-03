"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, FileText, ImageIcon, ExternalLink, Folder } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

interface DocItem {
  id: string
  title: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string | null
  category: string | null
  folder_id?: string | null
}

interface DocFolder {
  id: string
  name: string
  parent_id: string | null
}

const catLabels: Record<string, string> = {
  allgemein: "Allgemein",
  elternbriefe: "Elternbriefe",
  formulare: "Formulare",
  lehrplaene: "Lehrpläne",
  bilder: "Bilder & Medien",
  praesentation: "Präsentationen",
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function DownloadCategories({
  groupedLoose,
  folderDocs,
  folders
}: {
  groupedLoose: Record<string, DocItem[]>,
  folderDocs: DocItem[],
  folders: DocFolder[]
}) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set())

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
        trackEvent("download_category_toggle", { category: cat, open: false })
      } else {
        next.add(cat)
        trackEvent("download_category_toggle", { category: cat, open: true })
      }
      return next
    })
  }

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        trackEvent("download_category_toggle", { category: id, open: false })
      } else {
        next.add(id)
        trackEvent("download_category_toggle", { category: id, open: true })
      }
      return next
    })
  }

  // Recursive folder rendering
  const renderFolder = (folder: DocFolder, level: number = 0) => {
    const isOpen = openFolders.has(folder.id)
    const subfolders = folders.filter(f => f.parent_id === folder.id)
    const docsInFolder = folderDocs.filter(d => d.folder_id === folder.id)

    // Ensure we only show folders that actually contain something eventually
    const containsItems = (f: DocFolder): boolean => {
      const hasDocs = folderDocs.some(d => d.folder_id === f.id)
      const hasValidSubfolders = folders.filter(sub => sub.parent_id === f.id).some(containsItems)
      return hasDocs || hasValidSubfolders
    }

    if (!containsItems(folder)) return null

    return (
      <div key={folder.id} className={`rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 ${level > 0 ? 'ml-6 mt-4 border-l-4 border-l-primary/20' : ''}`}>
        <button
          onClick={() => toggleFolder(folder.id)}
          className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
            <Folder className="h-5 w-5 text-muted-foreground mr-1" />
            <h2 className="font-display text-xl text-foreground">{folder.name}</h2>
          </div>
        </button>
        {isOpen && (
          <div className="border-t border-border/60 px-6 pb-5 pt-3 space-y-4">
            {subfolders.map(sub => renderFolder(sub, level + 1))}

            <div className="space-y-2">
              {docsInFolder.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("download_file_click", { title: doc.title, category: folder.name })}
                  className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                    {doc.file_type?.startsWith("image/") ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground text-left group-hover:text-primary transition-colors">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.file_name} &middot; {formatSize(doc.file_size)}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const rootFolders = folders.filter(f => !f.parent_id)
  const hasLooseDocs = Object.keys(groupedLoose).length > 0

  return (
    <div className="space-y-8">
      {/* Folder Section */}
      {rootFolders.length > 0 && (
        <div className="space-y-4">
          {rootFolders.map(f => renderFolder(f, 0))}
        </div>
      )}

      {/* Legacy Category Section (Loose Documents) */}
      {hasLooseDocs && (
        <div className="space-y-4">
          {Object.entries(groupedLoose).map(([cat, docItems]) => {
            const isOpen = openCategories.has(cat)
            return (
              <div key={cat} className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    <h2 className="font-display text-xl text-foreground">{catLabels[cat] || cat}</h2>
                    <span className="text-xs text-muted-foreground rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">
                      {docItems.length}
                    </span>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-border/60 px-6 pb-5 pt-3 space-y-2">
                    {docItems.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("download_file_click", { title: doc.title, category: cat || "allgemein" })}
                        className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/[0.06]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                          {doc.file_type?.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-card-foreground text-left group-hover:text-primary transition-colors">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.file_name} &middot; {formatSize(doc.file_size)}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
