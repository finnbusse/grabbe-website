"use client"

import { useEffect } from "react"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics"

export default function NotFound() {
  useEffect(() => {
    trackEvent("page_not_found", { path: window.location.pathname })
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-primary">404</p>
      <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Seite nicht gefunden
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Die gesuchte Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
      >
        Zur Startseite
      </Link>
    </div>
  )
}
