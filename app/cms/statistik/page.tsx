"use client"

import { useEffect, useMemo, useState } from "react"
import { BarChart2, RefreshCw, Users, Eye, MousePointerClick } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type AnalyticsResponse = {
  source: string
  range: { start: string; end: string }
  summary: {
    visitors: number
    pageviews: number
    visits: number
    bounceRate: number | null
  }
  topPages: Array<{ page: string; pageviews: number; visitors: number }>
  timeseries: Array<{ date: string; pageviews: number; visitors: number }>
  error?: string
  details?: string
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("de-DE").format(value)
}

export default function StatistikPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/simple-analytics", { cache: "no-store" })
      const json = await response.json()

      if (!response.ok) {
        setError(json.error || "Statistiken konnten nicht geladen werden.")
        setData(null)
      } else {
        setData(json)
      }
    } catch {
      setError("Fehler beim Laden der Statistikdaten.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const maxPageviews = useMemo(() => {
    if (!data?.timeseries?.length) return 1
    return Math.max(...data.timeseries.map((item) => item.pageviews), 1)
  }, [data?.timeseries])

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Statistik</h1>
          <p className="mt-1 text-sm text-muted-foreground">Simple Analytics Daten der letzten 30 Tage</p>
        </div>
        <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {error && (
        <Card className="mt-6 border-destructive/40 p-4">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Prüfe in Vercel die Variablen SIMPLE_ANALYTICS_USER_ID und SIMPLE_ANALYTICS_API_KEY.
          </p>
        </Card>
      )}

      {!error && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Besucher</p>
              </div>
              <p className="mt-3 text-2xl font-semibold">{loading ? "…" : formatNumber(data?.summary.visitors || 0)}</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Seitenaufrufe</p>
              </div>
              <p className="mt-3 text-2xl font-semibold">{loading ? "…" : formatNumber(data?.summary.pageviews || 0)}</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <MousePointerClick className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Besuche</p>
              </div>
              <p className="mt-3 text-2xl font-semibold">{loading ? "…" : formatNumber(data?.summary.visits || 0)}</p>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-semibold">Top Seiten</h2>
              {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Lade Daten…</p>
              ) : data?.topPages?.length ? (
                <ul className="mt-4 space-y-3">
                  {data.topPages.slice(0, 8).map((page) => (
                    <li key={page.page} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-foreground">{page.page}</span>
                      <span className="text-muted-foreground">{formatNumber(page.pageviews)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Keine Seitendaten verfügbar.</p>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold">Trend Seitenaufrufe</h2>
              {loading ? (
                <p className="mt-4 text-sm text-muted-foreground">Lade Daten…</p>
              ) : data?.timeseries?.length ? (
                <div className="mt-4 flex h-40 items-end gap-1">
                  {data.timeseries.slice(-30).map((point) => {
                    const height = Math.max((point.pageviews / maxPageviews) * 100, 4)
                    return (
                      <div key={point.date} className="group relative flex-1">
                        <div className="w-full rounded-sm bg-primary/70" style={{ height: `${height}%` }} />
                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                          {point.date}: {formatNumber(point.pageviews)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Keine Zeitreihendaten verfügbar.</p>
              )}
            </Card>
          </div>

          {data?.source && (
            <p className="mt-4 text-xs text-muted-foreground">
              Quelle: {data.source} · Zeitraum: {data.range.start} bis {data.range.end}
            </p>
          )}
        </>
      )}

      {!loading && !data && !error && (
        <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <BarChart2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-foreground">Keine Statistikdaten</h2>
        </div>
      )}
    </div>
  )
}
