import { HelpCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function DokumentationPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dokumentation</h1>
        <p className="text-sm text-muted-foreground mt-1">Hilfe und Anleitungen für das CMS</p>
      </div>

      <div className="mt-8 space-y-4">
        <Link
          href="/docs/SCHNELLE_HILFE_DE.md"
          target="_blank"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Schnelle Hilfe</p>
            <p className="text-xs text-muted-foreground mt-0.5">Kurzanleitung für häufige Aufgaben im CMS</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
        <Link
          href="/docs/CMS_DOKUMENTATION.md"
          target="_blank"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">CMS Dokumentation</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ausführliche Dokumentation aller CMS-Funktionen</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
        <Link
          href="/docs/CMS_TROUBLESHOOTING.md"
          target="_blank"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
        >
          <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Fehlerbehebung</p>
            <p className="text-xs text-muted-foreground mt-0.5">Hilfe bei häufigen Problemen und Fehlern</p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
      </div>
    </div>
  )
}
