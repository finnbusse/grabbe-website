import { createClient } from "@/lib/supabase/server"
import { FileText, CalendarDays, BookOpen, Upload, Mail, GraduationCap, FileEdit, FolderTree, Clock } from "lucide-react"
import Link from "next/link"

export default async function CmsDashboardPage() {
  const supabase = await createClient()
  const [postsRes, pagesRes, eventsRes, docsRes, msgsRes, anmRes, recentPostsRes, recentPagesRes, recentEventsRes] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("pages").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("read", false),
    supabase.from("anmeldung_submissions").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("*").order("updated_at", { ascending: false }).limit(5),
    supabase.from("pages").select("*").order("updated_at", { ascending: false }).limit(5),
    supabase.from("events").select("*").order("updated_at", { ascending: false }).limit(5),
  ])

  type ActivityItem = {
    id: string
    title: string
    type: "post" | "page" | "event"
    published: boolean
    date: string
    href: string
  }

  const recentActivity: ActivityItem[] = [
    ...(recentPostsRes.data ?? []).map((p) => ({
      id: p.id,
      title: p.title ?? "Ohne Titel",
      type: "post" as const,
      published: p.published ?? false,
      date: p.updated_at ?? p.created_at ?? "",
      href: `/cms/posts/${p.id}`,
    })),
    ...(recentPagesRes.data ?? []).map((p) => ({
      id: p.id,
      title: p.title ?? "Ohne Titel",
      type: "page" as const,
      published: p.published ?? false,
      date: p.updated_at ?? p.created_at ?? "",
      href: `/cms/pages/${p.id}`,
    })),
    ...(recentEventsRes.data ?? []).map((e) => ({
      id: e.id,
      title: e.title ?? "Ohne Titel",
      type: "event" as const,
      published: e.published ?? false,
      date: e.updated_at ?? e.created_at ?? "",
      href: `/cms/events/${e.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15)

  const typeLabels: Record<ActivityItem["type"], { label: string; color: string }> = {
    post: { label: "Beitrag", color: "bg-primary/10 text-primary" },
    page: { label: "Seite", color: "bg-emerald-500/10 text-emerald-600" },
    event: { label: "Termin", color: "bg-sky-500/10 text-sky-600" },
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const stats = [
    { icon: FileText, label: "Beiträge", count: postsRes.count ?? 0, href: "/cms/posts", color: "bg-primary/10 text-primary" },
    { icon: BookOpen, label: "Seiten", count: pagesRes.count ?? 0, href: "/cms/pages", color: "bg-emerald-500/10 text-emerald-600" },
    { icon: CalendarDays, label: "Termine", count: eventsRes.count ?? 0, href: "/cms/events", color: "bg-sky-500/10 text-sky-600" },
    { icon: Upload, label: "Dokumente", count: docsRes.count ?? 0, href: "/cms/documents", color: "bg-violet-500/10 text-violet-600" },
    { icon: Mail, label: "Ungelesene Nachrichten", count: msgsRes.count ?? 0, href: "/cms/messages", color: "bg-rose-500/10 text-rose-600" },
    { icon: GraduationCap, label: "Anmeldungen", count: anmRes.count ?? 0, href: "/cms/anmeldungen", color: "bg-amber-500/10 text-amber-600" },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Willkommen im Content-Management-System des Grabbe-Gymnasiums.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group rounded-2xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{stat.count}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Seiten-Editor</h2>
              <p className="text-sm text-muted-foreground">Texte und Inhalte aller Seiten bearbeiten</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Bearbeiten Sie die Texte der Startseite und aller Unterseiten. Design und Layout bleiben dabei erhalten.
          </p>
          <Link href="/cms/seiten-editor" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Seiten bearbeiten
          </Link>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Schnellstart</h2>
          <p className="mt-1 text-sm text-muted-foreground">Erstellen Sie neue Inhalte für die Website.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/cms/posts/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Neuer Beitrag
            </Link>
            <Link href="/cms/events/new" className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Neuer Termin
            </Link>
            <Link href="/cms/pages/new" className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Neue Seite
            </Link>
            <Link href="/cms/documents" className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Dokument hochladen
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Verwaltung</h2>
          <p className="mt-1 text-sm text-muted-foreground">Website-Administration</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/cms/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="font-bold text-primary">{">"}</span> Einstellungen (Schulname, Logo, SEO, Variablen)
            </Link>
            <Link href="/cms/navigation" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="font-bold text-primary">{">"}</span> Navigation bearbeiten (Header, Footer, Links)
            </Link>
            <Link href="/cms/seitenstruktur" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="font-bold text-primary">{">"}</span> Seitenstruktur (Kategorien, Hierarchie, Pfade)
            </Link>
            <Link href="/cms/users" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span className="font-bold text-primary">{">"}</span> Benutzerverwaltung (Lehrer-Accounts)
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Letzte Aktivitaeten</h2>
            <p className="text-sm text-muted-foreground">Zuletzt erstellte oder bearbeitete Inhalte</p>
          </div>
        </div>
        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Noch keine Inhalte vorhanden.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {recentActivity.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted">
                  <span className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${typeLabels[item.type].color}`}>
                    {typeLabels[item.type].label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(item.date)}</span>
                  <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.published ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {item.published ? "Publiziert" : "Entwurf"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Tipps</h2>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="flex gap-2"><span className="font-bold text-primary">1.</span> Beiträge verwenden Markdown: **fett**, *kursiv*, [Link](url)</li>
          <li className="flex gap-2"><span className="font-bold text-primary">2.</span> Bilder/PDFs unter &quot;Dokumente&quot; hochladen, URL kopieren und einbinden</li>
          <li className="flex gap-2"><span className="font-bold text-primary">3.</span> &quot;Auf Startseite&quot; bei Beiträgen für prominente Anzeige aktivieren</li>
          <li className="flex gap-2"><span className="font-bold text-primary">4.</span> Unter &quot;Einstellungen&quot; alle Texte, Namen und SEO-Daten ändern</li>
        </ul>
      </div>
    </div>
  )
}
