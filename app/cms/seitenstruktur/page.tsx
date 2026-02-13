"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FolderOpen, FileText, Plus, Trash2, Save, Loader2, ChevronRight, ChevronDown,
  Globe, Lock, GripVertical, Pencil, Check, X, FolderPlus, ExternalLink, MoveRight,
} from "lucide-react"
import Link from "next/link"

// ============================================================================
// Types
// ============================================================================

/** A site structure category (URL segment/folder) */
interface SiteCategory {
  id: string
  slug: string
  label: string
  sort_order: number
  children: SiteCategory[]
  pages: SitePage[]
}

/** A page reference within the structure */
interface SitePage {
  id: string
  title: string
  slug: string
  route_path: string | null
  published: boolean
  is_system: boolean
  sort_order: number
}

/** The full site structure stored in site_settings */
interface SiteStructure {
  categories: CategoryDef[]
}

interface CategoryDef {
  id: string
  slug: string
  label: string
  sort_order: number
  children: CategoryDef[]
}

// ============================================================================
// Static pages that are fixed in the codebase (cannot be moved/deleted)
// ============================================================================

const SYSTEM_ROUTES: { path: string; label: string; category?: string; subcategory?: string }[] = [
  { path: "/", label: "Startseite" },
  { path: "/aktuelles", label: "Aktuelles (Beitraege)" },
  { path: "/termine", label: "Termine" },
  { path: "/downloads", label: "Downloads" },
  { path: "/kontakt", label: "Kontakt" },
  { path: "/unsere-schule/erprobungsstufe", label: "Erprobungsstufe", category: "unsere-schule" },
  { path: "/unsere-schule/profilprojekte", label: "Profilprojekte", category: "unsere-schule" },
  { path: "/unsere-schule/oberstufe", label: "Oberstufe", category: "unsere-schule" },
  { path: "/unsere-schule/anmeldung", label: "Anmeldung", category: "unsere-schule" },
  { path: "/schulleben/faecher-ags", label: "Faecher & AGs", category: "schulleben" },
  { path: "/schulleben/nachmittag", label: "Nachmittags am Grabbe", category: "schulleben" },
  { path: "/schulleben/netzwerk", label: "Netzwerk & Partner", category: "schulleben" },
  { path: "/impressum", label: "Impressum" },
  { path: "/datenschutz", label: "Datenschutz" },
]

const DEFAULT_CATEGORIES: CategoryDef[] = [
  {
    id: "unsere-schule",
    slug: "unsere-schule",
    label: "Unsere Schule",
    sort_order: 0,
    children: [],
  },
  {
    id: "schulleben",
    slug: "schulleben",
    label: "Schulleben",
    sort_order: 1,
    children: [],
  },
]

// ============================================================================
// Main Component
// ============================================================================

export default function SeitenstrukturPage() {
  const [categories, setCategories] = useState<CategoryDef[]>(DEFAULT_CATEGORIES)
  const [pages, setPages] = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["unsere-schule", "schulleben"]))
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryParent, setNewCategoryParent] = useState<string | null>(null)
  const [newCategorySlug, setNewCategorySlug] = useState("")
  const [newCategoryLabel, setNewCategoryLabel] = useState("")
  const [movingPage, setMovingPage] = useState<string | null>(null)
  const [moveTarget, setMoveTarget] = useState("")

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Load structure from site_settings
      const { data: structData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_structure")
        .single()

      if (structData?.value) {
        try {
          const parsed: SiteStructure = JSON.parse(structData.value)
          if (parsed.categories && parsed.categories.length > 0) {
            setCategories(parsed.categories)
          }
        } catch { /* use defaults */ }
      }

      // Load all custom pages
      const { data: pagesData } = await supabase
        .from("pages")
        .select("id, title, slug, route_path, published, is_system, sort_order")
        .order("sort_order")

      if (pagesData) {
        setPages(pagesData as SitePage[])
      }
    } catch (err) {
      console.error("Failed to load site structure:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Save structure
  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Nicht angemeldet")

      const structure: SiteStructure = { categories }

      // Save structure
      const { error: settingsErr } = await supabase
        .from("site_settings")
        .upsert(
          {
            key: "site_structure",
            value: JSON.stringify(structure),
            type: "json",
            label: "Seitenstruktur",
            category: "structure",
            protected: false,
          },
          { onConflict: "key" }
        )

      if (settingsErr) throw settingsErr

      setMessage({ type: "success", text: "✓ Struktur gespeichert" })
    } catch (err) {
      setMessage({ type: "error", text: `✗ ${err instanceof Error ? err.message : "Fehler beim Speichern"}` })
    } finally {
      setSaving(false)
    }
  }

  // Move a page to a new route path
  const handleMovePage = async (pageId: string, newRoutePath: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("pages")
        .update({ route_path: newRoutePath || null })
        .eq("id", pageId)

      if (error) throw error

      setPages(prev => prev.map(p =>
        p.id === pageId ? { ...p, route_path: newRoutePath || null } : p
      ))
      setMovingPage(null)
      setMoveTarget("")
      setMessage({ type: "success", text: "✓ Seite verschoben" })
    } catch (err) {
      setMessage({ type: "error", text: `✗ ${err instanceof Error ? err.message : "Fehler"}` })
    }
  }

  // Category management
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addCategory = (parentId: string | null) => {
    if (!newCategorySlug.trim() || !newCategoryLabel.trim()) return

    const slug = newCategorySlug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const newCat: CategoryDef = {
      id: parentId ? `${parentId}/${slug}` : slug,
      slug,
      label: newCategoryLabel,
      sort_order: 0,
      children: [],
    }

    if (parentId) {
      setCategories(prev => prev.map(cat =>
        cat.id === parentId
          ? { ...cat, children: [...cat.children, newCat] }
          : cat
      ))
      setExpandedCategories(prev => new Set([...prev, parentId]))
    } else {
      setCategories(prev => [...prev, newCat])
    }

    setNewCategoryParent(null)
    setNewCategorySlug("")
    setNewCategoryLabel("")
  }

  const deleteCategory = (id: string, parentId: string | null) => {
    // Check if any pages are in this category
    const catPath = `/${id}`
    const pagesInCategory = pages.filter(p => p.route_path?.startsWith(catPath))
    if (pagesInCategory.length > 0) {
      setMessage({ type: "error", text: "✗ Kategorie enthaelt noch Seiten. Bitte verschieben Sie diese zuerst." })
      return
    }

    if (parentId) {
      setCategories(prev => prev.map(cat =>
        cat.id === parentId
          ? { ...cat, children: cat.children.filter(c => c.id !== id) }
          : cat
      ))
    } else {
      setCategories(prev => prev.filter(cat => cat.id !== id))
    }
  }

  const updateCategoryLabel = (id: string, label: string, parentId: string | null) => {
    if (parentId) {
      setCategories(prev => prev.map(cat =>
        cat.id === parentId
          ? { ...cat, children: cat.children.map(c => c.id === id ? { ...c, label } : c) }
          : cat
      ))
    } else {
      setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, label } : cat))
    }
    setEditingCategory(null)
  }

  // Get pages for a specific route prefix
  const getPagesForCategory = (categoryId: string): SitePage[] => {
    return pages.filter(p => {
      const routePath = p.route_path || ""
      return routePath === `/${categoryId}` ||
        routePath.startsWith(`/${categoryId}/`)
    })
  }

  // Get unassigned pages (no route_path or under /seiten/)
  const getUnassignedPages = (): SitePage[] => {
    return pages.filter(p => {
      if (!p.route_path) return true
      // Check if it belongs to a known category
      return !categories.some(cat =>
        p.route_path === `/${cat.id}` ||
        p.route_path?.startsWith(`/${cat.id}/`) ||
        cat.children.some(sub =>
          p.route_path === `/${sub.id}` ||
          p.route_path?.startsWith(`/${sub.id}/`)
        )
      )
    })
  }

  // Get system pages for a category
  const getSystemPagesForCategory = (categorySlug: string): typeof SYSTEM_ROUTES => {
    return SYSTEM_ROUTES.filter(r => r.category === categorySlug)
  }

  // Get top-level system pages
  const getTopLevelSystemPages = (): typeof SYSTEM_ROUTES => {
    return SYSTEM_ROUTES.filter(r => !r.category)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Seitenstruktur</h1>
          <p className="mt-2 text-muted-foreground">
            Verwalten Sie die Struktur und Hierarchie aller Seiten der Website.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
          {saving ? "Speichern..." : "Struktur speichern"}
        </Button>
      </div>

      {message && (
        <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
          message.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "border-destructive/30 bg-destructive/10 text-destructive"
        }`}>
          {message.text}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex gap-3">
          <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">So funktioniert die Seitenstruktur</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Erstellen Sie Kategorien (z.B. &quot;unsere-schule&quot;), um Ihre Seiten zu organisieren.
              Kategorien werden zu URL-Pfaden: hostname.de/kategorie/seitenname.
              Feste Systemseiten (<Lock className="inline h-3 w-3" />) koennen nicht verschoben werden.
              Eigene Seiten koennen Sie frei in Kategorien einordnen.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {/* Top-level system pages */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Hauptebene</h2>
            <span className="text-xs text-muted-foreground">hostname.de/</span>
          </div>
          <div className="space-y-1">
            {getTopLevelSystemPages().map((route) => (
              <div key={route.path} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50">
                <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
                <span className="text-sm font-medium text-foreground">{route.label}</span>
                <span className="text-xs text-muted-foreground font-mono ml-auto">{route.path}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            parentId={null}
            level={0}
            expanded={expandedCategories}
            toggleCategory={toggleCategory}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            updateCategoryLabel={updateCategoryLabel}
            deleteCategory={deleteCategory}
            systemPages={getSystemPagesForCategory(category.slug)}
            customPages={getPagesForCategory(category.id)}
            movingPage={movingPage}
            setMovingPage={setMovingPage}
            moveTarget={moveTarget}
            setMoveTarget={setMoveTarget}
            handleMovePage={handleMovePage}
            newCategoryParent={newCategoryParent}
            setNewCategoryParent={setNewCategoryParent}
            newCategorySlug={newCategorySlug}
            setNewCategorySlug={setNewCategorySlug}
            newCategoryLabel={newCategoryLabel}
            setNewCategoryLabel={setNewCategoryLabel}
            addCategory={addCategory}
            categories={categories}
            pages={pages}
          />
        ))}

        {/* Add top-level category */}
        {newCategoryParent === "__root__" ? (
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Neue Hauptkategorie</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Name (wird angezeigt)</Label>
                <Input
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  placeholder="z.B. Service"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">URL-Pfad (Slug)</Label>
                <Input
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="z.B. service"
                  className="mt-1 font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => addCategory(null)} disabled={!newCategorySlug || !newCategoryLabel}>
                <Check className="mr-1 h-3.5 w-3.5" />
                Erstellen
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setNewCategoryParent(null); setNewCategorySlug(""); setNewCategoryLabel("") }}>
                <X className="mr-1 h-3.5 w-3.5" />
                Abbrechen
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setNewCategoryParent("__root__")}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Neue Hauptkategorie erstellen
          </Button>
        )}

        {/* Unassigned pages */}
        {getUnassignedPages().length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-amber-600" />
              <h2 className="font-display text-lg font-semibold text-amber-900 dark:text-amber-200">
                Nicht zugeordnete Seiten
              </h2>
              <span className="text-xs text-amber-600">/seiten/slug</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Diese Seiten sind keiner Kategorie zugeordnet und erreichbar unter /seiten/slug.
              Verschieben Sie sie in eine Kategorie, um sie besser zu organisieren.
            </p>
            <div className="space-y-1">
              {getUnassignedPages().map((page) => (
                <PageItem
                  key={page.id}
                  page={page}
                  moving={movingPage === page.id}
                  onStartMove={() => setMovingPage(page.id)}
                  onCancelMove={() => { setMovingPage(null); setMoveTarget("") }}
                  moveTarget={moveTarget}
                  setMoveTarget={setMoveTarget}
                  onMove={(path) => handleMovePage(page.id, path)}
                  categories={categories}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Category Node Component
// ============================================================================

function CategoryNode({
  category,
  parentId,
  level,
  expanded,
  toggleCategory,
  editingCategory,
  setEditingCategory,
  updateCategoryLabel,
  deleteCategory,
  systemPages,
  customPages,
  movingPage,
  setMovingPage,
  moveTarget,
  setMoveTarget,
  handleMovePage,
  newCategoryParent,
  setNewCategoryParent,
  newCategorySlug,
  setNewCategorySlug,
  newCategoryLabel,
  setNewCategoryLabel,
  addCategory,
  categories,
  pages,
}: {
  category: CategoryDef
  parentId: string | null
  level: number
  expanded: Set<string>
  toggleCategory: (id: string) => void
  editingCategory: string | null
  setEditingCategory: (id: string | null) => void
  updateCategoryLabel: (id: string, label: string, parentId: string | null) => void
  deleteCategory: (id: string, parentId: string | null) => void
  systemPages: typeof SYSTEM_ROUTES
  customPages: SitePage[]
  movingPage: string | null
  setMovingPage: (id: string | null) => void
  moveTarget: string
  setMoveTarget: (target: string) => void
  handleMovePage: (pageId: string, newRoutePath: string) => void
  newCategoryParent: string | null
  setNewCategoryParent: (id: string | null) => void
  newCategorySlug: string
  setNewCategorySlug: (slug: string) => void
  newCategoryLabel: string
  setNewCategoryLabel: (label: string) => void
  addCategory: (parentId: string | null) => void
  categories: CategoryDef[]
  pages: SitePage[]
}) {
  const isExpanded = expanded.has(category.id)
  const [editLabel, setEditLabel] = useState(category.label)
  const isEditing = editingCategory === category.id

  const isSystemCategory = category.id === "unsere-schule" || category.id === "schulleben"
  const hasContent = systemPages.length > 0 || customPages.length > 0 || category.children.length > 0

  return (
    <div className={`rounded-2xl border bg-card ${level > 0 ? "ml-6 border-border/60" : ""}`}>
      {/* Category Header */}
      <div className="flex items-center gap-2 px-5 py-3">
        <button onClick={() => toggleCategory(category.id)} className="shrink-0">
          {isExpanded
            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
        </button>
        <FolderOpen className="h-4 w-4 text-primary shrink-0" />

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") updateCategoryLabel(category.id, editLabel, parentId)
                if (e.key === "Escape") setEditingCategory(null)
              }}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateCategoryLabel(category.id, editLabel, parentId)}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingCategory(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <>
            <span className="text-sm font-semibold text-foreground">{category.label}</span>
            <span className="text-xs text-muted-foreground font-mono">/{category.id}/</span>
            {isSystemCategory && <span title="Systemkategorie"><Lock className="h-3 w-3 text-muted-foreground/60" /></span>}
          </>
        )}

        <div className="ml-auto flex items-center gap-1">
          {!isEditing && (
            <>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditLabel(category.label); setEditingCategory(category.id) }} title="Umbenennen">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {level === 0 && (
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setNewCategoryParent(category.id)} title="Unterkategorie erstellen">
                  <FolderPlus className="h-3.5 w-3.5" />
                </Button>
              )}
              {!isSystemCategory && !hasContent && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategory(category.id, parentId)} title="Loeschen">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t px-5 py-3 space-y-2">
          {/* System pages in this category */}
          {systemPages.map((route) => (
            <div key={route.path} className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/50">
              <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-sm text-foreground">{route.label}</span>
              <span className="text-xs text-muted-foreground font-mono ml-auto">{route.path}</span>
            </div>
          ))}

          {/* Custom pages */}
          {customPages.map((page) => (
            <PageItem
              key={page.id}
              page={page}
              moving={movingPage === page.id}
              onStartMove={() => setMovingPage(page.id)}
              onCancelMove={() => { setMovingPage(null); setMoveTarget("") }}
              moveTarget={moveTarget}
              setMoveTarget={setMoveTarget}
              onMove={(path) => handleMovePage(page.id, path)}
              categories={categories}
            />
          ))}

          {/* Subcategories */}
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              parentId={category.id}
              level={level + 1}
              expanded={expanded}
              toggleCategory={toggleCategory}
              editingCategory={editingCategory}
              setEditingCategory={setEditingCategory}
              updateCategoryLabel={updateCategoryLabel}
              deleteCategory={deleteCategory}
              systemPages={[]}
              customPages={pages.filter(p => p.route_path?.startsWith(`/${child.id}/`) || p.route_path === `/${child.id}`)}
              movingPage={movingPage}
              setMovingPage={setMovingPage}
              moveTarget={moveTarget}
              setMoveTarget={setMoveTarget}
              handleMovePage={handleMovePage}
              newCategoryParent={newCategoryParent}
              setNewCategoryParent={setNewCategoryParent}
              newCategorySlug={newCategorySlug}
              setNewCategorySlug={setNewCategorySlug}
              newCategoryLabel={newCategoryLabel}
              setNewCategoryLabel={setNewCategoryLabel}
              addCategory={addCategory}
              categories={categories}
              pages={pages}
            />
          ))}

          {/* Add subcategory form */}
          {newCategoryParent === category.id && (
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3 ml-6">
              <h4 className="text-xs font-semibold text-foreground">Neue Unterkategorie in /{category.id}/</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newCategoryLabel}
                    onChange={(e) => setNewCategoryLabel(e.target.value)}
                    placeholder="z.B. Projekte"
                    className="mt-1 h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">URL-Slug</Label>
                  <Input
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="z.B. projekte"
                    className="mt-1 h-8 text-sm font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7" onClick={() => addCategory(category.id)} disabled={!newCategorySlug || !newCategoryLabel}>
                  <Check className="mr-1 h-3 w-3" /> Erstellen
                </Button>
                <Button size="sm" variant="ghost" className="h-7" onClick={() => { setNewCategoryParent(null); setNewCategorySlug(""); setNewCategoryLabel("") }}>
                  Abbrechen
                </Button>
              </div>
            </div>
          )}

          {systemPages.length === 0 && customPages.length === 0 && category.children.length === 0 && (
            <p className="text-xs text-muted-foreground py-2 px-3 italic">Keine Seiten in dieser Kategorie</p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Page Item Component
// ============================================================================

function PageItem({
  page,
  moving,
  onStartMove,
  onCancelMove,
  moveTarget,
  setMoveTarget,
  onMove,
  categories,
}: {
  page: SitePage
  moving: boolean
  onStartMove: () => void
  onCancelMove: () => void
  moveTarget: string
  setMoveTarget: (target: string) => void
  onMove: (path: string) => void
  categories: CategoryDef[]
}) {
  const currentPath = page.route_path ? `${page.route_path}/${page.slug}` : `/seiten/${page.slug}`

  // Build flat list of all category paths for the dropdown
  const categoryOptions: { value: string; label: string }[] = [
    { value: "", label: "/seiten/ (Standard)" },
  ]
  for (const cat of categories) {
    categoryOptions.push({ value: `/${cat.id}`, label: `/${cat.id}/` })
    for (const sub of cat.children) {
      categoryOptions.push({ value: `/${sub.id}`, label: `/${sub.id}/` })
    }
  }

  if (moving) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <MoveRight className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium">{page.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs shrink-0">Verschieben nach:</Label>
          <select
            value={moveTarget}
            onChange={(e) => setMoveTarget(e.target.value)}
            className="flex h-8 flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button size="sm" className="h-7" onClick={() => onMove(moveTarget)}>
            <Check className="mr-1 h-3 w-3" /> OK
          </Button>
          <Button size="sm" variant="ghost" className="h-7" onClick={onCancelMove}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 group transition-colors">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm text-foreground flex-1">{page.title}</span>
      {!page.published && (
        <span className="text-[10px] rounded-full border px-2 py-0.5 text-muted-foreground">Entwurf</span>
      )}
      <span className="text-xs text-muted-foreground font-mono">{currentPath}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onStartMove} title="Verschieben">
          <MoveRight className="h-3 w-3" />
        </Button>
        <Link href={`/cms/pages/${page.id}`}>
          <Button size="icon" variant="ghost" className="h-6 w-6" title="Bearbeiten">
            <Pencil className="h-3 w-3" />
          </Button>
        </Link>
        <Link href={currentPath} target="_blank">
          <Button size="icon" variant="ghost" className="h-6 w-6" title="Ansehen">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
