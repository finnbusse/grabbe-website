import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export type NormalizedAnalytics = {
  source: string
  range: { start: string; end: string }
  summary: {
    visitors: number
    pageviews: number
    visits: number
    bounceRate: number | null
    secondsOnPage: number | null
  }
  topPages: Array<{ page: string; pageviews: number; visitors: number; secondsOnPage: number | null }>
  timeseries: Array<{ date: string; pageviews: number; visitors: number }>
  referrers: Array<{ name: string; pageviews: number; visitors: number }>
  countries: Array<{ name: string; pageviews: number; visitors: number }>
  browsers: Array<{ name: string; pageviews: number; visitors: number }>
  devices: Array<{ name: string; pageviews: number; visitors: number }>
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function normalizeAnalytics(raw: any, source: string): NormalizedAnalytics {
  const histogramSource = Array.isArray(raw?.histogram) ? raw.histogram : []
  const pagesSource = Array.isArray(raw?.pages) ? raw.pages : []
  const referrersSource = Array.isArray(raw?.referrers) ? raw.referrers : []
  const countriesSource = Array.isArray(raw?.countries) ? raw.countries : []
  const browsersSource = Array.isArray(raw?.browser_names) ? raw.browser_names : []
  const devicesSource = Array.isArray(raw?.device_types) ? raw.device_types : []

  const timeseries = histogramSource
    .map((row: any) => ({
      date: String(row.date ?? row.value ?? row.day ?? ""),
      pageviews: toNumber(row.pageviews ?? row.views ?? row.count ?? row.value),
      visitors: toNumber(row.visitors ?? row.unique_visitors ?? row.uniques),
    }))
    .filter((row: { date: string }) => Boolean(row.date))

  const topPages = pagesSource
    .map((page: any) => ({
      page: String(page.value ?? page.page ?? page.path ?? "/"),
      pageviews: toNumber(page.pageviews ?? page.views),
      visitors: toNumber(page.visitors ?? page.unique_visitors ?? page.uniques),
      secondsOnPage: page.seconds_on_page == null ? null : toNumber(page.seconds_on_page),
    }))
    .sort((a: { pageviews: number }, b: { pageviews: number }) => b.pageviews - a.pageviews)
    .slice(0, 10)

  const mapSource = (sourceArr: any[], nameKey: string = "value") =>
    sourceArr
      .map((item: any) => ({
        name: String(item[nameKey] ?? item.name ?? "Unbekannt"),
        pageviews: toNumber(item.pageviews ?? item.views),
        visitors: toNumber(item.visitors ?? item.unique_visitors ?? item.uniques),
      }))
      .sort((a: { pageviews: number }, b: { pageviews: number }) => b.pageviews - a.pageviews)
      .slice(0, 10)

  const referrers = mapSource(referrersSource)
  const countries = mapSource(countriesSource)
  const browsers = mapSource(browsersSource)
  const devices = mapSource(devicesSource)

  const pageviewsFromSeries = timeseries.reduce((acc: number, item: { pageviews: number }) => acc + item.pageviews, 0)
  const visitorsFromSeries = timeseries.reduce((acc: number, item: { visitors: number }) => acc + item.visitors, 0)

  return {
    source,
    range: {
      start: String(raw?.start ?? ""),
      end: String(raw?.end ?? ""),
    },
    summary: {
      visitors: toNumber(raw?.visitors) || visitorsFromSeries,
      pageviews: toNumber(raw?.pageviews) || pageviewsFromSeries,
      visits: toNumber(raw?.visits),
      bounceRate: raw?.bounce_rate == null ? null : toNumber(raw?.bounce_rate),
      secondsOnPage: raw?.seconds_on_page == null ? null : toNumber(raw?.seconds_on_page),
    },
    topPages,
    timeseries,
    referrers,
    countries,
    browsers,
    devices,
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const startParam = searchParams.get("start") || "today-30d"
  const endParam = searchParams.get("end") || "today"

  const domain = process.env.SIMPLE_ANALYTICS_DOMAIN || "grabbe.site"
  const query = new URLSearchParams({
    version: "6",
    fields: "histogram,pages,seconds_on_page,referrers,countries,browser_names,device_types",
    start: startParam,
    end: endParam,
    timezone: "Europe/Berlin",
  })

  const url = `https://simpleanalytics.com/${domain}.json?${query.toString()}`

  const response = await fetch(url, {
    cache: "no-store", // Do not cache for live data
  })

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Simple Analytics API Anfrage fehlgeschlagen",
        status: response.status,
        details: await response.text(),
        source: url,
      },
      { status: 502 }
    )
  }

  const raw = await response.json()
  return NextResponse.json(normalizeAnalytics(raw, `simpleanalytics.com/${domain}.json`))
}
