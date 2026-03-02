import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

type NormalizedAnalytics = {
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
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function normalizeAnalytics(raw: any, source: string, start: string, end: string): NormalizedAnalytics {
  const payload = raw?.data ?? raw?.results ?? raw
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.rows) ? payload.rows : []

  const totals = payload?.totals ?? payload?.summary ?? raw?.totals ?? raw?.summary ?? {}

  const timeseries = rows
    .map((row: any) => ({
      date: String(row.date ?? row.day ?? row.x ?? ""),
      pageviews: toNumber(row.pageviews ?? row.views ?? row.value),
      visitors: toNumber(row.visitors ?? row.unique_visitors ?? row.uniques),
    }))
    .filter((row: { date: string }) => Boolean(row.date))

  const topPagesSource = Array.isArray(raw?.pages)
    ? raw.pages
    : Array.isArray(payload?.pages)
      ? payload.pages
      : Array.isArray(raw?.topPages)
        ? raw.topPages
        : []

  const topPages = topPagesSource
    .map((page: any) => ({
      page: String(page.page ?? page.path ?? page.url ?? "/"),
      pageviews: toNumber(page.pageviews ?? page.views ?? page.value),
      visitors: toNumber(page.visitors ?? page.unique_visitors ?? page.uniques),
    }))
    .slice(0, 10)

  const sumPageviews = timeseries.reduce((acc: number, item: { pageviews: number }) => acc + item.pageviews, 0)
  const sumVisitors = timeseries.reduce((acc: number, item: { visitors: number }) => acc + item.visitors, 0)

  return {
    source,
    range: { start, end },
    summary: {
      visitors: toNumber(totals.visitors ?? totals.unique_visitors) || sumVisitors,
      pageviews: toNumber(totals.pageviews ?? totals.views) || sumPageviews,
      visits: toNumber(totals.visits ?? totals.sessions),
      bounceRate: totals.bounce_rate == null ? null : toNumber(totals.bounce_rate),
    },
    topPages,
    timeseries,
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
  }

  const userId = process.env.SIMPLE_ANALYTICS_USER_ID
  const apiKey = process.env.SIMPLE_ANALYTICS_API_KEY

  if (!userId || !apiKey) {
    return NextResponse.json(
      {
        error: "Simple Analytics nicht konfiguriert",
        details: "SIMPLE_ANALYTICS_USER_ID und SIMPLE_ANALYTICS_API_KEY müssen gesetzt sein.",
      },
      { status: 500 }
    )
  }

  const end = new Date().toISOString().slice(0, 10)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  const start = startDate.toISOString().slice(0, 10)

  const attempts = [
    {
      label: "v2/stats",
      url: `https://api.simpleanalytics.com/v2/${userId}/stats?start=${start}&end=${end}`,
    },
    {
      label: "v2/overview",
      url: `https://api.simpleanalytics.com/v2/${userId}/overview?start=${start}&end=${end}`,
    },
    {
      label: "legacy",
      url: `https://api.simpleanalytics.com/${userId}.json?start=${start}&end=${end}`,
    },
  ]

  const authHeaders = {
    Authorization: `Api-Key ${apiKey}`,
    "X-Api-Key": apiKey,
  }

  const errors: Array<{ source: string; status: number; body: string }> = []

  for (const attempt of attempts) {
    const response = await fetch(attempt.url, {
      headers: authHeaders,
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      errors.push({ source: attempt.label, status: response.status, body: await response.text() })
      continue
    }

    const raw = await response.json()
    const normalized = normalizeAnalytics(raw, attempt.label, start, end)
    return NextResponse.json(normalized)
  }

  return NextResponse.json(
    {
      error: "Simple Analytics API Anfrage fehlgeschlagen",
      attempts: errors,
    },
    { status: 502 }
  )
}
