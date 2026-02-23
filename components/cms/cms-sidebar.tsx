"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FileText, CalendarDays, Home, LogOut, LayoutDashboard, BookOpen, Upload, Mail, GraduationCap, Settings, Menu, Users, Activity, FileEdit, FolderTree, UserCircle, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const contentLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/cms" },
  { icon: FileEdit, label: "Seiten-Editor", href: "/cms/seiten-editor" },
  { icon: FileText, label: "Beiträge", href: "/cms/posts" },
  { icon: BookOpen, label: "Eigene Seiten", href: "/cms/pages" },
  { icon: CalendarDays, label: "Termine", href: "/cms/events" },
  { icon: Upload, label: "Dokumente", href: "/cms/documents" },
  { icon: Tag, label: "Tags", href: "/cms/tags" },
]

const inboxLinks = [
  { icon: Mail, label: "Nachrichten", href: "/cms/messages" },
  { icon: GraduationCap, label: "Anmeldungen", href: "/cms/anmeldungen" },
]

const adminLinks = [
  { icon: FolderTree, label: "Seitenstruktur", href: "/cms/seitenstruktur" },
  { icon: Menu, label: "Navigation", href: "/cms/navigation" },
  { icon: Settings, label: "Einstellungen", href: "/cms/settings" },
  { icon: Users, label: "Benutzer", href: "/cms/users" },
  { icon: Activity, label: "Diagnose", href: "/cms/diagnostic" },
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
    const parts = [profile.title, profile.first_name, profile.last_name].filter(Boolean)
    return parts.join(" ")
  }
  return email
}

export function CmsSidebar({ userEmail, userProfile, isOpen, onClose }: { userEmail: string; userProfile?: UserProfileData | null; isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    localStorage.removeItem("cms_remember_me")
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside className={`flex w-64 shrink-0 flex-col border-r border-border bg-card fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground font-display">G</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-card-foreground font-display">Grabbe CMS</p>
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

      <nav className="flex-1 px-3 py-4" aria-label="CMS Navigation">
        {[
          { title: "Inhalte", items: contentLinks },
          { title: "Eingänge", items: inboxLinks },
          { title: "Verwaltung", items: adminLinks },
        ].map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-5" : ""}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/cms" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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

        <div className="mt-5 border-t border-border pt-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Home className="h-4 w-4" />
            Zur Website
          </Link>
        </div>
      </nav>

      <div className="border-t border-border px-3 py-4">
        <Link href="/cms/profil" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-colors">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="font-display text-xs font-bold text-primary">{getInitials(userProfile || null, userEmail)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-card-foreground">{getDisplayName(userProfile || null, userEmail)}</p>
            {(userProfile?.first_name || userProfile?.last_name) && (
              <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </Link>
        <Button variant="ghost" size="sm" className="mt-1 w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </aside>
  )
}
