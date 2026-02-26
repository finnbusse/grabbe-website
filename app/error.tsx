"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    trackEvent("page_error", { path: window.location.pathname, message: error.message })
  }, [error.message])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-sub text-[11px] uppercase tracking-[0.3em] text-destructive">Fehler</p>
      <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
        Etwas ist schiefgelaufen
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
      >
        Erneut versuchen
      </button>
    </div>
  )
}
