import { createClient } from "@/lib/supabase/server"
import { Newspaper, FileText, CalendarDays, FolderOpen, Mail, GraduationCap, PenLine, FilePlus, CalendarPlus, Upload } from "lucide-react"
import Link from "next/link"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Guten Morgen"
  if (hour < 17) return "Guten Tag"
  return "Guten Abend"
}

export default async function CmsDashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const error = typeof params.error === "string" ? params.error : undefined
  const supabase = await createClient()

  // Get user profile for greeting
  const { data: { user } } = await supabase.auth.getUser()
  let firstName = ""
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("first_name")
      .eq("user_id", user.id)
      .single()
    firstName = profile?.first_name || ""
  }

  const [postsRes, pagesRes, eventsRes, docsRes, msgsRes, anmRes] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("pages").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("read", false),
    supabase.from("anmeldung_submissions").select("id", { count: "exact", head: true }),
  ])

  const greeting = getGreeting()

  const stats = [
    { icon: Newspaper, label: "Beiträge", count: postsRes.count ?? 0 },
    { icon: FileText, label: "Seiten", count: pagesRes.count ?? 0 },
    { icon: CalendarDays, label: "Termine", count: eventsRes.count ?? 0 },
    { icon: FolderOpen, label: "Dokumente", count: docsRes.count ?? 0 },
    { icon: Mail, label: "Gelesene Nachrichten", count: msgsRes.count ?? 0 },
    { icon: GraduationCap, label: "Anmeldungen", count: anmRes.count ?? 0 },
  ]

  const quickActions = [
    { icon: PenLine, title: "Neuer Beitrag", subtitle: "News-Artikel erstellen", href: "/cms/posts/new" },
    { icon: FilePlus, title: "Neue Seite", subtitle: "Website-Seite anlegen", href: "/cms/seiten/new" },
    { icon: CalendarPlus, title: "Neuer Termin", subtitle: "Veranstaltung eintragen", href: "/cms/events/new" },
    { icon: Upload, title: "Datei hochladen", subtitle: "Dokument hinzufügen", href: "/cms/documents" },
  ]

  return (
    <div>
      {error === "no_access" && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
        </div>
      )}

      {/* Greeting */}
      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
        {greeting},{" "}
        <span className="italic text-primary">{firstName || "Nutzer"}</span>!
      </h1>

      {/* Stat Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-6">
            <stat.icon className="h-5 w-5 text-muted-foreground" />
            <p className="mt-4 text-3xl font-bold text-foreground">{stat.count}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/50 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          >
            <action.icon className="h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium text-foreground">{action.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{action.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
