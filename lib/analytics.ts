declare global {
  interface Window {
    sa_event?: (name: string, meta?: Record<string, string | number | boolean>) => void
  }
}

type EventMeta = Record<string, string | number | boolean>

export function trackEvent(name: string, meta?: EventMeta): void {
  if (typeof window !== "undefined" && typeof window.sa_event === "function") {
    window.sa_event(name, meta)
  }
}
