import { BarChart2 } from "lucide-react"

export default function StatistikPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistik</h1>
        <p className="text-sm text-muted-foreground mt-1">Website-Statistiken und Analysen</p>
      </div>

      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <BarChart2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-foreground">Statistiken kommen bald</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Hier werden zukünftig Besucherzahlen, Seitenaufrufe und weitere Analysen angezeigt.
        </p>
      </div>
    </div>
  )
}
