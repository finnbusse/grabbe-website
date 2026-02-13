"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, FileText, ImageIcon, ExternalLink } from "lucide-react"

interface DocItem {
  id: string
  title: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string | null
  category: string | null
}

const catLabels: Record<string, string> = {
  allgemein: "Allgemein",
  elternbriefe: "Elternbriefe",
  formulare: "Formulare",
  lehrplaene: "Lehrplaene",
  bilder: "Bilder & Medien",
  praesentation: "Praesentationen",
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function DownloadCategories({ grouped }: { grouped: Record<string, DocItem[]> }) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())

  const toggle = (cat: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([cat, docItems]) => {
        const isOpen = openCategories.has(cat)
        return (
          <div key={cat} className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => toggle(cat)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <h2 className="font-display text-lg font-bold">{catLabels[cat] || cat}</h2>
                <span className="text-xs text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                  {docItems.length}
                </span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t px-5 pb-4 pt-2 space-y-2">
                {docItems.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-lg border bg-background p-4 transition-all hover:shadow-md hover:border-primary/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {doc.file_type?.startsWith("image/") ? (
                        <ImageIcon className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.file_name} &middot; {formatSize(doc.file_size)}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
