"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home, ChevronRight, ChevronDown, Settings, FileEdit,
  Lock, Plus, FileText, FolderOpen, AlertCircle,
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
  status?: string
  routePath?: string | null
  isIndex?: boolean
}

export interface CategoryDef {
  id: string
  slug: string
  label: string
  sort_order: number
  children: CategoryDef[]
}

interface PageTreeProps {
  staticPages: PageTreeItem[]
  customPages: PageTreeItem[]
  categories: CategoryDef[]
}

// ---------------------------------------------------------------------------
// Helpers — assign pages to categories by route_path
// ---------------------------------------------------------------------------

interface TreeFolder {
  label: string
  slug: string
  items: PageTreeItem[]
  children: TreeFolder[]
}

function buildTree(
  staticPages: PageTreeItem[],
  customPages: PageTreeItem[],
  categories: CategoryDef[],
) {
  const homepage = staticPages.filter((p) => p.route === "/")

  // Build category folders from Seitenstruktur
  const folders: TreeFolder[] = categories.map((cat) => buildFolder(cat, staticPages, customPages))

  // Static pages not in any category and not homepage
  const assignedIds = new Set<string>()
  for (const p of homepage) assignedIds.add(p.id)
  for (const folder of folders) collectAllIds(folder, assignedIds)
  const otherStatic = staticPages.filter(
    (p) => p.route !== "/" && !assignedIds.has(p.id),
  )

  // Custom pages not in any category
  const customAssigned = new Set<string>()
  for (const folder of folders) collectCustomIds(folder, customAssigned)
  const unassigned = customPages.filter((p) => !customAssigned.has(p.id))

  return { homepage, folders, otherStatic, unassigned }
}

function buildFolder(
  cat: CategoryDef,
  staticPages: PageTreeItem[],
  customPages: PageTreeItem[],
): TreeFolder {
  const catPath = `/${cat.id}`
  // Static pages whose route starts with this category
  const staticInCat = staticPages.filter(
    (p) => p.route !== "/" && (p.route === catPath || p.route.startsWith(`${catPath}/`)),
  )
  // Custom pages whose route_path matches this category
  const customInCat = customPages.filter((p) => {
    const rp = p.routePath || ""
    return rp === catPath || rp.startsWith(`${catPath}/`)
  })

  // Filter out pages that belong to a child category
  const childPrefixes = cat.children.map((c) => `/${c.id}`)
  const directStatic = staticInCat.filter(
    (p) => !childPrefixes.some((prefix) => p.route.startsWith(`${prefix}/`) || p.route === prefix),
  )
  const directCustom = customInCat.filter((p) => {
    const rp = p.routePath || ""
    return !childPrefixes.some((prefix) => rp.startsWith(`${prefix}/`) || rp === prefix)
  })

  const children = cat.children.map((child) => buildFolder(child, staticPages, customPages))

  return {
    label: cat.label,
    slug: cat.slug,
    items: [...directStatic, ...directCustom],
    children,
  }
}

function collectAllIds(folder: TreeFolder, set: Set<string>) {
  for (const item of folder.items) set.add(item.id)
  for (const child of folder.children) collectAllIds(child, set)
}

function collectCustomIds(folder: TreeFolder, set: Set<string>) {
  for (const item of folder.items) {
    if (item.type === "custom") set.add(item.id)
  }
  for (const child of folder.children) collectCustomIds(child, set)
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status?: string }) {
  if (status === 'draft') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
        Entwurf
      </span>
    )
  }
  if (status === 'archived') {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 border border-gray-200">
        Archiviert
      </span>
    )
  }
  if (status === 'scheduled') {
    return (
      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
        Geplant
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
      {item.isIndex ? (
        <Home className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium text-card-foreground truncate ${item.isIndex ? "font-semibold" : ""}`}>
            {item.isIndex ? "Hauptseite" : item.title}
          </span>
          {isStatic && <Lock className="h-3 w-3 text-muted-foreground/50" />}
          <StatusBadge status={item.status} />
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

function FolderSection({ folder, level = 0 }: { folder: TreeFolder; level?: number }) {
  const [open, setOpen] = useState(true)
  const totalCount = countItems(folder)

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
        <span className="ml-auto text-[10px] font-normal text-muted-foreground">{totalCount} Seiten</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-4 border-l border-border pl-2">
          {folder.items.map((item) => (
            <PageRow key={item.id} item={item} />
          ))}
          {folder.children.map((child) => (
            <FolderSection key={child.slug} folder={child} level={level + 1} />
          ))}
          {folder.items.length === 0 && folder.children.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground italic">
              Keine Seiten in dieser Kategorie
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function countItems(folder: TreeFolder): number {
  let count = folder.items.length
  for (const child of folder.children) count += countItems(child)
  return count
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function PageTree({ staticPages, customPages, categories }: PageTreeProps) {
  const { homepage, folders, otherStatic, unassigned } = buildTree(staticPages, customPages, categories)

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
                  <StatusBadge status={item.status} />
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

      {/* Category folder sections from Seitenstruktur */}
      <div className="px-2 py-2">
        {folders.map((folder) => (
          <FolderSection key={folder.slug} folder={folder} />
        ))}
      </div>

      {/* New page button */}
      <div className="border-t border-border px-2 py-2">
        <Link
          href="/cms/pages/new"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Neue Seite erstellen
        </Link>
      </div>

      {/* Other static pages (impressum, datenschutz, kontakt, etc.) */}
      {otherStatic.length > 0 && (
        <div className="border-t border-border px-2 py-2">
          {otherStatic.map((item) => (
            <PageRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Unassigned custom pages */}
      {unassigned.length > 0 && (
        <div className="border-t border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 px-2 py-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">Nicht zugeordnet</span>
            <span className="ml-auto text-[10px] text-amber-600">{unassigned.length} Seiten</span>
          </div>
          <p className="px-3 pb-2 text-xs text-amber-700 dark:text-amber-300">
            Diese Seiten haben keinen Kategoriepfad. Gehe zur{" "}
            <Link href="/cms/seitenstruktur" className="underline hover:no-underline">
              Seitenstruktur
            </Link>
            , um sie zuzuordnen.
          </p>
          <div className="ml-4 border-l border-amber-200 dark:border-amber-800 pl-2">
            {unassigned.map((item) => (
              <PageRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
