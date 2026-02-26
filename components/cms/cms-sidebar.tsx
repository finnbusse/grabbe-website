"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Gauge, Inbox, BarChart2, FileText, Newspaper, CalendarDays, FolderOpen,
  FolderTree, Globe, Users, Settings, HelpCircle, LogOut, X, UserCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePermissions } from "@/components/cms/permissions-context"
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
  { icon: FileText, label: "Seiten", href: "/cms/seiten", permCheck: (p) => checkPermission(p, "seitenEditor") || p.pages.edit },
  { icon: Newspaper, label: "News", href: "/cms/posts", permCheck: (p) => checkPermission(p, "posts") },
  { icon: CalendarDays, label: "Termine", href: "/cms/events", permCheck: (p) => checkPermission(p, "events") },
  { icon: FolderOpen, label: "Dateien", href: "/cms/dateien", permCheck: (p) => checkPermission(p, "documents") },
]

const adminLinks: SidebarLink[] = [
  { icon: FolderTree, label: "Seitenstruktur", href: "/cms/seitenstruktur", permCheck: (p) => checkPermission(p, "seitenstruktur") },
  { icon: Globe, label: "Website-Einstellungen", href: "/cms/settings/website", permCheck: (p) => checkPermission(p, "settings") },
]

const footerLinks: SidebarLink[] = [
  { icon: Users, label: "Benutzerverwaltung", href: "/cms/users", permCheck: (p) => checkPermission(p, "users") },
  { icon: Settings, label: "Einstellungen", href: "/cms/settings/system", permCheck: (p) => checkPermission(p, "settings") },
  { icon: HelpCircle, label: "Dokumentation", href: "/cms/dokumentation" },
]

interface UserProfileData {
  first_name?: string
  last_name?: string
  title?: string
  avatar_url?: string | null
}

function getInitials(profile: UserProfileData | null, email: string) {
  if (profile?.first_name || profile?.last_name) {
    return (
      (profile.first_name?.charAt(0)?.toUpperCase() || "") +
      (profile.last_name?.charAt(0)?.toUpperCase() || "")
    )
  }
  return email?.charAt(0)?.toUpperCase() || "?"
}

function getDisplayName(profile: UserProfileData | null, email: string) {
  if (profile?.first_name || profile?.last_name) {
    const parts = [profile.first_name, profile.last_name].filter(Boolean)
    return parts.join(" ")
  }
  return email
}

function filterLinks(links: SidebarLink[], permissions: CmsPermissions): SidebarLink[] {
  return links.filter((link) => !link.permCheck || link.permCheck(permissions))
}

export function CmsSidebar({ userEmail, userProfile, isOpen, onClose }: { userEmail: string; userProfile?: UserProfileData | null; isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { permissions, roleSlugs } = usePermissions()

  const handleLogout = async () => {
    const supabase = createClient()
    localStorage.removeItem("cms_remember_me")
    await supabase.auth.signOut()
    router.push("/")
  }

  const visibleHome = filterLinks(homeLinks, permissions)
  const visibleContent = filterLinks(contentLinks, permissions)
  const visibleAdmin = filterLinks(adminLinks, permissions)
  const visibleFooter = isAdminOrSchulleitung(roleSlugs)
    ? filterLinks(footerLinks, permissions)
    : filterLinks([footerLinks[2]], permissions) // Only Dokumentation for non-admins

  const sections = [
    { title: "Home", items: visibleHome },
    ...(visibleContent.length > 0 ? [{ title: "Inhalte", items: visibleContent }] : []),
    ...(visibleAdmin.length > 0 ? [{ title: "Verwaltung", items: visibleAdmin }] : []),
  ]

  return (
    <aside className={`flex w-64 shrink-0 flex-col border-r border-border bg-card fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <Image
          src="/images/grabbe-logo.svg"
          alt="Grabbe Logo"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-card-foreground font-display">Grabbe Gymnasium</p>
          <p className="text-xs text-muted-foreground">Content Management</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Menü schließen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="CMS Navigation">
        {sections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-5" : ""}>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/cms" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Links */}
      <div className="border-t border-border px-3 py-3">
        {visibleFooter.length > 0 && (
          <div className="space-y-1 mb-3">
            {visibleFooter.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/cms" && pathname.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* User Profile Block */}
        <div className="border-t border-border pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-bold text-primary">{getInitials(userProfile || null, userEmail)}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-foreground">{getDisplayName(userProfile || null, userEmail)}</p>
                  <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/cms/profil" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Account-Einstellungen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  )
}
