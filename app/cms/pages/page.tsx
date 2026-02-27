"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Plus, Eye, EyeOff, Search, FileText, Blocks, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Page } from "@/lib/types/database.types"

const SECTION_LABELS: Record<string, string> = {
  allgemein: "Allgemein",
  "unsere-schule": "Unsere Schule",
  schulleben: "Schulleben",
  informationen: "Informationen",
}

function isBlockContent(content: string): boolean {
  try {
    if (content.startsWith("[{")) {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) && parsed.length > 0 && parsed[0].type && parsed[0].id
    }
  } catch { /* not blocks */ }
  return false
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function CmsPagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sectionFilter, setSectionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("pages")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setPages(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch =
        !search ||
        page.title.toLowerCase().includes(search.toLowerCase()) ||
        page.slug.toLowerCase().includes(search.toLowerCase())
      const matchesSection = sectionFilter === "all" || page.section === sectionFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && page.status === 'published') ||
        (statusFilter === "draft" && page.status === 'draft')
      return matchesSearch && matchesSection && matchesStatus
    })
  }, [pages, search, sectionFilter, statusFilter])

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Seiten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Statische Seiten der Website verwalten.
            {!loading && (
              <span className="ml-1 font-medium text-foreground">
                {filtered.length} {filtered.length === 1 ? "Seite" : "Seiten"}
              </span>
            )}
          </p>
        </div>
        <Button asChild>
          <Link href="/cms/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Seite
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Seiten durchsuchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Bereich" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Bereiche</SelectItem>
            {Object.entries(SECTION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="published">Veröffentlicht</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Page grid */}
      {loading ? (
        <div className="mt-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((page) => {
            const blocks = isBlockContent(page.content)
            return (
              <Link
                key={page.id}
                href={`/cms/pages/${page.id}`}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-sm font-semibold text-card-foreground group-hover:text-primary">
                    {page.title}
                  </h2>
                  {page.is_system && (
                    <span title="Systemseite">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {page.route_path ? `${page.route_path}/${page.slug}` : `/seiten/${page.slug}`}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {page.status === 'published' ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600">
                      <Eye className="h-3 w-3" />
                      Aktiv
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      <EyeOff className="h-3 w-3" />
                      Entwurf
                    </span>
                  )}
                  <Badge variant="secondary" className="text-xs font-normal">
                    {SECTION_LABELS[page.section] ?? page.section}
                  </Badge>
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {blocks ? (
                      <>
                        <Blocks className="h-3 w-3" />
                        Blöcke
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3" />
                        Markdown
                      </>
                    )}
                  </span>
                </div>

                {page.updated_at && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Aktualisiert: {formatDate(page.updated_at)}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border py-16 text-center">
          {pages.length > 0 ? (
            <p className="text-muted-foreground">Keine Seiten gefunden.</p>
          ) : (
            <>
              <p className="text-muted-foreground">Noch keine Seiten vorhanden.</p>
              <Button asChild className="mt-4">
                <Link href="/cms/pages/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Erste Seite erstellen
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
