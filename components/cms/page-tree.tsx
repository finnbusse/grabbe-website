"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home, ChevronRight, ChevronDown, Settings, FileEdit,
  Lock, Plus, FileText, FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageTreeItem {
  id: string
  title: string
  route: string
  type: "static" | "custom"
  published?: boolean
}

interface TreeFolder {
  label: string
  items: PageTreeItem[]
}

interface PageTreeProps {
  staticPages: PageTreeItem[]
  customPages: PageTreeItem[]
}

// ---------------------------------------------------------------------------
// Group pages into tree structure
// ---------------------------------------------------------------------------

function buildTree(staticPages: PageTreeItem[], customPages: PageTreeItem[]) {
  const homepage = staticPages.filter((p) => p.route === "/")
  const unsereSchule = staticPages.filter((p) => p.route.startsWith("/unsere-schule"))
  const schulleben = staticPages.filter((p) => p.route.startsWith("/schulleben"))
  const other = staticPages.filter(
    (p) =>
      p.route !== "/" &&
      !p.route.startsWith("/unsere-schule") &&
      !p.route.startsWith("/schulleben")
  )

  const folders: TreeFolder[] = []

  if (unsereSchule.length > 0) {
    folders.push({ label: "Unsere Schule", items: unsereSchule })
  }
  if (schulleben.length > 0) {
    folders.push({ label: "Schulleben", items: schulleben })
  }

  return { homepage, folders, otherStatic: other, customPages }
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatusBadge({ published }: { published?: boolean }) {
  if (published === false) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
        Entwurf
      </span>
    )
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
      Veröffentlicht
    </span>
  )
}

function PageRow({ item }: { item: PageTreeItem }) {
  const isStatic = item.type === "static"

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-card-foreground truncate">{item.title}</span>
          {isStatic && <Lock className="h-3 w-3 text-muted-foreground/50" />}
          <StatusBadge published={item.published} />
        </div>
        <p className="text-[11px] text-muted-foreground font-mono truncate">{item.route}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
          <Link href={`/cms/seiten/${item.id}/einstellungen`}>
            <Settings className="h-3 w-3" />
            Einstellungen
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
          <Link href={`/cms/seiten/${item.id}/bearbeiten`}>
            <FileEdit className="h-3 w-3" />
            Bearbeiten
          </Link>
        </Button>
      </div>
    </div>
  )
}

function FolderSection({ folder }: { folder: TreeFolder }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-card-foreground hover:bg-muted/50 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <FolderOpen className="h-4 w-4 text-primary/70" />
        {folder.label}
        <span className="ml-auto text-[10px] font-normal text-muted-foreground">{folder.items.length} Seiten</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-4 border-l border-border pl-2">
          {folder.items.map((item) => (
            <PageRow key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function PageTree({ staticPages, customPages }: PageTreeProps) {
  const { homepage, folders, otherStatic, customPages: custom } = buildTree(staticPages, customPages)

  return (
    <div className="rounded-2xl border bg-card">
      {/* Homepage rows (pinned top) */}
      {homepage.length > 0 && (
        <div className="border-b border-border px-2 py-2">
          {homepage.map((item) => (
            <div key={item.id} className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50">
              <Home className="h-4 w-4 shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-card-foreground truncate">{item.title}</span>
                  <Lock className="h-3 w-3 text-muted-foreground/50" />
                  <StatusBadge published={item.published} />
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">/</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
                  <Link href={`/cms/seiten/${item.id}/einstellungen`}>
                    <Settings className="h-3 w-3" />
                    Einstellungen
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild>
                  <Link href={`/cms/seiten/${item.id}/bearbeiten`}>
                    <FileEdit className="h-3 w-3" />
                    Bearbeiten
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Folder sections */}
      <div className="px-2 py-2">
        {folders.map((folder) => (
          <FolderSection key={folder.label} folder={folder} />
        ))}
      </div>

      {/* Custom pages */}
      <div className="border-t border-border px-2 py-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <FolderOpen className="h-4 w-4 text-violet-500" />
          <span className="text-sm font-semibold text-card-foreground">Eigene Seiten</span>
          <span className="ml-auto text-[10px] text-muted-foreground">{custom.length} Seiten</span>
        </div>
        <div className="ml-4 border-l border-border pl-2">
          {custom.map((item) => (
            <PageRow key={item.id} item={item} />
          ))}
          <Link
            href="/cms/pages/new"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neue Seite erstellen
          </Link>
        </div>
      </div>

      {/* Other static pages (impressum, datenschutz, kontakt, etc.) */}
      {otherStatic.length > 0 && (
        <div className="border-t border-border px-2 py-2">
          {otherStatic.map((item) => (
            <PageRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
