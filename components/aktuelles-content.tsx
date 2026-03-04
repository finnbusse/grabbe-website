"use client"

import { useSearchParams } from "next/navigation"
import { useCallback } from "react"
import Link from "next/link"
import { CalendarDays, ArrowRight } from "lucide-react"

export type ContentItemType = "news" | "presentation" | "parent_letter"

export type TabKey = "alle" | "news" | "praesentationen" | "elternbriefe"

export interface ContentItem {
  type: ContentItemType
  id: string
  title: string
  slug: string
  href: string
  date: string
  excerpt?: string | null
  category?: string | null
  authorName?: string | null
  authorAvatar?: string | null
  authorInitials?: string
  coverImageUrl?: string | null
  subtitle?: string | null
  number?: number
  datePeriod?: string | null
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "news", label: "News" },
  { key: "praesentationen", label: "Präsentationen" },
  { key: "elternbriefe", label: "Elternbriefe" },
]

const TAB_TYPE_MAP: Record<TabKey, ContentItemType[] | null> = {
  alle: null,
  news: ["news"],
  praesentationen: ["presentation"],
  elternbriefe: ["parent_letter"],
}

export function AktuellesContent({ items }: { items: ContentItem[] }) {
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get("tab") as TabKey) || "alle"

  const setTab = useCallback((tab: TabKey) => {
    const url = new URL(window.location.href)
    if (tab === "alle") {
      url.searchParams.delete("tab")
    } else {
      url.searchParams.set("tab", tab)
    }
    window.history.replaceState(null, "", url.toString())
    // Force re-render by dispatching popstate
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, [])

  const allowedTypes = TAB_TYPE_MAP[activeTab]
  const filtered = allowedTypes
    ? items.filter((item) => allowedTypes.includes(item.type))
    : items

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Tab filter bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content feed */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
            Keine Beiträge
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            In dieser Kategorie gibt es derzeit keine Beiträge.
          </p>
        </div>
      )}
    </section>
  )
}

function ContentCard({ item }: { item: ContentItem }) {
  if (item.type === "presentation") return <PresentationCard item={item} />
  if (item.type === "parent_letter") return <ParentLetterCard item={item} />
  return <NewsCard item={item} />
}

function NewsCard({ item }: { item: ContentItem }) {
  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
    >
      {item.category && (
        <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {item.category}
        </span>
      )}
      <h2 className="font-display text-lg font-semibold text-card-foreground group-hover:text-primary">
        {item.title}
      </h2>
      {item.excerpt && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.excerpt}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(item.date)}
          </div>
          {item.authorName && (
            <div className="flex items-center gap-1.5">
              {item.authorAvatar ? (
                <img src={item.authorAvatar} alt={item.authorName || "Autor"} className="h-4 w-4 rounded-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">
                  {item.authorInitials || item.authorName.charAt(0)}
                </span>
              )}
              <span>{item.authorName}</span>
            </div>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}

function PresentationCard({ item }: { item: ContentItem }) {
  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-2xl border bg-violet-500/8 border-violet-200/60 dark:bg-violet-500/15 dark:border-violet-400/20 p-6 transition-all hover:border-violet-400/60 hover:shadow-lg"
    >
      <span className="mb-3 w-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
        Präsentation
      </span>
      {item.coverImageUrl && (
        <div className="mb-3 overflow-hidden rounded-lg">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="h-36 w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <h2 className="font-display text-lg font-semibold text-card-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">
        {item.title}
      </h2>
      {item.subtitle && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.subtitle}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(item.date)}
        </div>
        <ArrowRight className="h-4 w-4 text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-violet-400" />
      </div>
    </Link>
  )
}

function ParentLetterCard({ item }: { item: ContentItem }) {
  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-2xl border bg-amber-500/8 border-amber-200/60 dark:bg-amber-500/15 dark:border-amber-400/20 p-6 transition-all hover:border-amber-400/60 hover:shadow-lg"
    >
      <span className="mb-3 w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
        Elterninfobrief
      </span>
      <h2 className="font-display text-lg font-semibold text-card-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300">
        {item.number != null ? `${item.number}. Elterninfobrief` : ""}{item.number != null && item.title ? " – " : ""}{item.title}
      </h2>
      {item.datePeriod && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {item.datePeriod}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(item.date)}
        </div>
        <ArrowRight className="h-4 w-4 text-amber-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-amber-400" />
      </div>
    </Link>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
