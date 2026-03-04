"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  FileText,
  Newspaper,
  CalendarDays,
  FolderOpen,
  FolderTree,
  Globe,
  Users,
  HelpCircle,
  Inbox,
  BarChart2,
  Gauge,
  Plus,
  Building2
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

import { usePermissions } from "@/components/cms/permissions-context"
import { useCommandPalette } from "@/components/cms/command-palette-context"
import { checkPermission, isAdminOrSchulleitung } from "@/lib/permissions-shared"
import type { CmsPermissions } from "@/lib/permissions-shared"
import type { LucideIcon } from "lucide-react"

interface SidebarLink {
  icon: LucideIcon
  label: string
  href: string
  permCheck?: (p: CmsPermissions) => boolean
}

const homeLinks: SidebarLink[] = [
  { icon: Gauge, label: "Dashboard", href: "/cms" },
  { icon: Inbox, label: "Nachrichten", href: "/cms/nachrichten", permCheck: (p) => checkPermission(p, "messages") || checkPermission(p, "anmeldungen") },
  { icon: BarChart2, label: "Statistik", href: "/cms/statistik" },
]

const contentLinks: SidebarLink[] = [
  { icon: FileText, label: "Seiten", href: "/cms/seiten", permCheck: (p) => checkPermission(p, "seitenEditor") || p.pages?.edit },
  { icon: Newspaper, label: "Beiträge", href: "/cms/posts", permCheck: (p) => checkPermission(p, "posts") },
  { icon: CalendarDays, label: "Termine", href: "/cms/events", permCheck: (p) => checkPermission(p, "events") },
  { icon: FolderOpen, label: "Dateien", href: "/cms/dateien", permCheck: (p) => checkPermission(p, "documents") },
]

const adminLinks: SidebarLink[] = [
  { icon: Building2, label: "Organisation", href: "/cms/organisation", permCheck: (p) => checkPermission(p, "organisation") },
  { icon: FolderTree, label: "Seitenstruktur", href: "/cms/seitenstruktur", permCheck: (p) => checkPermission(p, "seitenstruktur") },
  { icon: Globe, label: "Website-Einstellungen", href: "/cms/settings/website", permCheck: (p) => checkPermission(p, "settings") },
]

const footerLinks: SidebarLink[] = [
  { icon: Users, label: "Benutzerverwaltung", href: "/cms/users", permCheck: (p) => checkPermission(p, "users") },
  { icon: Settings, label: "Einstellungen", href: "/cms/settings/system", permCheck: (p) => checkPermission(p, "settings") },
  { icon: HelpCircle, label: "Dokumentation", href: "/cms/dokumentation" },
]

function filterLinks(links: SidebarLink[], permissions: CmsPermissions): SidebarLink[] {
  return links.filter((link) => !link.permCheck || link.permCheck(permissions))
}

export function CommandPalette() {
  const router = useRouter()
  const { open, setOpen } = useCommandPalette()
  const { permissions, roleSlugs } = usePermissions()

  const [recentPosts, setRecentPosts] = React.useState<{ id: string; title: string }[]>([])
  const [recentPages, setRecentPages] = React.useState<{ id: string; title: string }[]>([])
  const [recentEvents, setRecentEvents] = React.useState<{ id: string; title: string }[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    if (!open) return

    const fetchRecent = async () => {
      const supabase = createClient()

      const [postsRes, pagesRes, eventsRes] = await Promise.all([
        checkPermission(permissions, "posts")
          ? supabase.from("posts").select("id, title").order("updated_at", { ascending: false }).limit(5)
          : Promise.resolve({ data: [] }),
        checkPermission(permissions, "seitenEditor") || permissions.pages?.edit
          ? supabase.from("pages").select("id, title").order("updated_at", { ascending: false }).limit(5)
          : Promise.resolve({ data: [] }),
        checkPermission(permissions, "events")
          ? supabase.from("events").select("id, title").order("updated_at", { ascending: false }).limit(5)
          : Promise.resolve({ data: [] })
      ])

      if (postsRes.data) setRecentPosts(postsRes.data)
      if (pagesRes.data) setRecentPages(pagesRes.data)
      if (eventsRes.data) setRecentEvents(eventsRes.data)
    }

    fetchRecent()
  }, [open, permissions])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setOpen])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

  const visibleHome = filterLinks(homeLinks, permissions)
  const visibleContent = filterLinks(contentLinks, permissions)
  const visibleAdmin = filterLinks(adminLinks, permissions)
  const visibleFooter = isAdminOrSchulleitung(roleSlugs)
    ? filterLinks(footerLinks, permissions)
    : filterLinks([footerLinks[2]], permissions)

  // One-line note confirming RBAC filtering is applied to static links (and dynamic fetches)
  const allNavigationLinks = [...visibleHome, ...visibleContent, ...visibleAdmin, ...visibleFooter]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Suche..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>Keine Ergebnisse für '{searchQuery}'</CommandEmpty>

        <CommandGroup heading="Navigation">
          {allNavigationLinks.map((link) => (
            <CommandItem
              key={link.href}
              value={link.label}
              onSelect={() => runCommand(() => router.push(link.href))}
            >
              <link.icon className="mr-2 h-4 w-4" />
              <span>{link.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Zuletzt bearbeitet">
          {recentPosts.map(post => (
            <CommandItem
              key={`post-${post.id}`}
              value={`Beitrag bearbeiten: ${post.title}`}
              onSelect={() => runCommand(() => router.push(`/cms/posts/${post.id}`))}
            >
              <Newspaper className="mr-2 h-4 w-4" />
              <span>Beitrag bearbeiten: {post.title}</span>
            </CommandItem>
          ))}
          {recentPages.map(page => (
            <CommandItem
              key={`page-${page.id}`}
              value={`Seite bearbeiten: ${page.title}`}
              onSelect={() => runCommand(() => router.push(`/cms/seiten-editor/${page.id}`))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Seite bearbeiten: {page.title}</span>
            </CommandItem>
          ))}
          {recentEvents.map(event => (
            <CommandItem
              key={`event-${event.id}`}
              value={`Event bearbeiten: ${event.title}`}
              onSelect={() => runCommand(() => router.push(`/cms/events/${event.id}`))}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Event bearbeiten: {event.title}</span>
            </CommandItem>
          ))}
          {recentPosts.length === 0 && recentPages.length === 0 && recentEvents.length === 0 && (
            <CommandItem disabled>Keine kürzlichen Einträge</CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Schnellaktionen">
          {checkPermission(permissions, "posts.create") && (
            <CommandItem onSelect={() => runCommand(() => router.push("/cms/posts/new"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Neuen Beitrag erstellen</span>
            </CommandItem>
          )}
          {(checkPermission(permissions, "seitenEditor") || permissions.pages?.edit) && (
             <CommandItem onSelect={() => runCommand(() => router.push("/cms/seiten/new"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Neue Seite erstellen</span>
            </CommandItem>
          )}
          {checkPermission(permissions, "events.create") && (
            <CommandItem onSelect={() => runCommand(() => router.push("/cms/events/new"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Neues Event erstellen</span>
            </CommandItem>
          )}
          {checkPermission(permissions, "documents.upload") && (
             <CommandItem onSelect={() => runCommand(() => router.push("/cms/dateien"))}>
             <FolderOpen className="mr-2 h-4 w-4" />
             <span>Dateien hochladen</span>
           </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
