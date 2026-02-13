"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FileText, CalendarDays, Home, LogOut, LayoutDashboard, BookOpen, Upload, Mail, GraduationCap, Settings, Menu, Users, Activity, FileEdit, FolderTree } from "lucide-react"
import { Button } from "@/components/ui/button"

const contentLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/cms" },
  { icon: FileEdit, label: "Seiten-Editor", href: "/cms/seiten-editor" },
  { icon: FileText, label: "Beitraege", href: "/cms/posts" },
  { icon: BookOpen, label: "Eigene Seiten", href: "/cms/pages" },
  { icon: CalendarDays, label: "Termine", href: "/cms/events" },
  { icon: Upload, label: "Dokumente", href: "/cms/documents" },
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

export function CmsSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground font-display">G</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground font-display">Grabbe CMS</p>
          <p className="text-xs text-muted-foreground">Content Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4" aria-label="CMS Navigation">
        {[
          { title: "Inhalte", items: contentLinks },
          { title: "Eingaenge", items: inboxLinks },
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
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <Home className="h-4 w-4" />
            Zur Website
          </Link>
        </div>
      </nav>

      <div className="border-t border-border px-3 py-4">
        <p className="mb-2 truncate px-3 text-xs text-muted-foreground">{userEmail}</p>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </aside>
  )
}
