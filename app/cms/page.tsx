import { createClient } from "@/lib/supabase/server"
import { FileText, CalendarDays, BookOpen, Upload, Mail, GraduationCap } from "lucide-react"
import Link from "next/link"

export default async function CmsDashboardPage() {
  const supabase = await createClient()
  const [postsRes, pagesRes, eventsRes, docsRes, msgsRes, anmRes] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("pages").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("read", false),
    supabase.from("anmeldung_submissions").select("id", { count: "exact", head: true }),
  ])

  const stats = [
    { icon: FileText, label: "Beitraege", count: postsRes.count ?? 0, href: "/cms/posts", color: "bg-primary/10 text-primary" },
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
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Schnellstart</h2>
          <p className="mt-1 text-sm text-muted-foreground">Erstellen Sie neue Inhalte fuer die Website.</p>
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
          <h2 className="font-display text-lg font-semibold">Hilfe</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tipps fuer das CMS</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Beitraege verwenden Markdown: **fett**, *kursiv*, [Link](url)</li>
            <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Laden Sie Bilder/PDFs unter &quot;Dokumente&quot; hoch und kopieren Sie die URL</li>
            <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Setzen Sie &quot;Auf Startseite&quot; bei Beitraegen, die prominent angezeigt werden sollen</li>
            <li className="flex gap-2"><span className="text-primary font-bold">4.</span> Termine mit Kategorie &quot;Ferien&quot; erscheinen farbig im Jahreskalender</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
