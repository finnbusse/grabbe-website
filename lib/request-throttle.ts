const buckets = new Map<string, number[]>()

function prune(ts: number[], windowMs: number, now: number): number[] {
  const min = now - windowMs
  return ts.filter((t) => t >= min)
}

export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const current = prune(buckets.get(key) || [], windowMs, now)
  if (current.length >= maxRequests) {
    buckets.set(key, current)
    return true
  }
  current.push(now)
  buckets.set(key, current)
  return false
}

export function getRequestIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}
