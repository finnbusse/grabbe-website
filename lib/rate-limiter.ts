import { createAdminClient } from "@/lib/supabase/admin"

// ---------------------------------------------------------------------------
// Thresholds & Configuration
// ---------------------------------------------------------------------------

/** Max failed attempts per IP within the sliding window before blocking */
const IP_MAX_ATTEMPTS = 10
/** Sliding window for IP-based rate limiting (15 minutes) */
const IP_WINDOW_MS = 15 * 60 * 1000
/** Block duration for IP after exceeding max attempts (15 minutes) */
const IP_BLOCK_DURATION_MS = 15 * 60 * 1000

/** Max failed attempts per account within the sliding window before locking */
const ACCOUNT_MAX_ATTEMPTS = 5
/** Sliding window for account-based rate limiting (15 minutes) */
const ACCOUNT_WINDOW_MS = 15 * 60 * 1000
/** Lock duration for account after exceeding max attempts (30 minutes) */
const ACCOUNT_LOCK_DURATION_MS = 30 * 60 * 1000

/** Maximum server-side delay in milliseconds (cap for exponential backoff) */
const MAX_DELAY_MS = 30_000
/** Base delay for exponential backoff in milliseconds */
const BASE_DELAY_MS = 1_000

// ---------------------------------------------------------------------------
// Hashing helpers (Web Crypto API — Edge-compatible)
// ---------------------------------------------------------------------------

function getSalt(): string | null {
  return process.env.IP_HASH_SALT || null
}

/** Hash a value with SHA-256 + server-side salt using Web Crypto API. */
async function hashValue(value: string): Promise<string | null> {
  const salt = getSalt()
  if (!salt) return null
  const data = new TextEncoder().encode(value.toLowerCase().trim() + salt)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  /** Whether the request is allowed to proceed */
  allowed: boolean
  /** Number of remaining attempts before block (only meaningful when allowed=true) */
  remainingAttempts: number
  /** Seconds until the block expires (0 when not blocked) */
  retryAfterSeconds: number
  /** Server-side artificial delay to apply in milliseconds */
  delayMs: number
  /** Human-readable reason if blocked */
  reason?: string
}

/**
 * Check whether a login attempt should be allowed.
 * Checks both IP-level and account-level limits.
 */
export async function checkRateLimit(
  ip: string,
  email: string
): Promise<RateLimitResult> {
  const ipHash = await hashValue(ip)
  const emailHash = await hashValue(email)

  // If hashing is unavailable (IP_HASH_SALT not set), skip rate limiting
  if (!ipHash || !emailHash) {
    return { allowed: true, remainingAttempts: ACCOUNT_MAX_ATTEMPTS, retryAfterSeconds: 0, delayMs: 0 }
  }

  const supabase = createAdminClient()

  const now = new Date()

  // ── IP-level check ──
  const ipWindowStart = new Date(now.getTime() - IP_WINDOW_MS).toISOString()

  const { data: ipAttempts } = await supabase
    .from("rate_limit_login_ip")
    .select("attempted_at")
    .eq("ip_hash", ipHash)
    .eq("success", false)
    .gte("attempted_at", ipWindowStart)
    .order("attempted_at", { ascending: false }) as { data: Array<{ attempted_at: string }> | null }

  const ipFailCount = ipAttempts?.length ?? 0

  if (ipFailCount >= IP_MAX_ATTEMPTS) {
    const oldestRelevant = ipAttempts![ipAttempts!.length - 1].attempted_at
    const blockedUntil = new Date(new Date(oldestRelevant).getTime() + IP_BLOCK_DURATION_MS)
    const retryAfterSeconds = Math.max(0, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000))

    if (retryAfterSeconds > 0) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        delayMs: 0,
        reason: "ip_blocked",
      }
    }
  }

  // ── Account-level check ──
  const accountWindowStart = new Date(now.getTime() - ACCOUNT_WINDOW_MS).toISOString()

  const { data: accountAttempts } = await supabase
    .from("rate_limit_login_account")
    .select("attempted_at")
    .eq("email_hash", emailHash)
    .eq("success", false)
    .gte("attempted_at", accountWindowStart)
    .order("attempted_at", { ascending: false }) as { data: Array<{ attempted_at: string }> | null }

  const accountFailCount = accountAttempts?.length ?? 0

  if (accountFailCount >= ACCOUNT_MAX_ATTEMPTS) {
    const oldestRelevant = accountAttempts![accountAttempts!.length - 1].attempted_at
    const blockedUntil = new Date(new Date(oldestRelevant).getTime() + ACCOUNT_LOCK_DURATION_MS)
    const retryAfterSeconds = Math.max(0, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000))

    if (retryAfterSeconds > 0) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        delayMs: 0,
        reason: "account_locked",
      }
    }
  }

  // ── Calculate progressive delay (exponential backoff) ──
  // Use whichever count is higher
  const totalFails = Math.max(ipFailCount, accountFailCount)
  const delayMs = totalFails > 0
    ? Math.min(BASE_DELAY_MS * Math.pow(2, totalFails - 1), MAX_DELAY_MS)
    : 0

  // Remaining attempts = minimum of both limits
  const ipRemaining = Math.max(0, IP_MAX_ATTEMPTS - ipFailCount)
  const accountRemaining = Math.max(0, ACCOUNT_MAX_ATTEMPTS - accountFailCount)
  const remainingAttempts = Math.min(ipRemaining, accountRemaining)

  return {
    allowed: true,
    remainingAttempts,
    retryAfterSeconds: 0,
    delayMs,
  }
}

/**
 * Record a login attempt (success or failure).
 */
export async function recordLoginAttempt(
  ip: string,
  email: string,
  success: boolean
): Promise<void> {
  const ipHash = await hashValue(ip)
  const emailHash = await hashValue(email)

  // If hashing is unavailable (IP_HASH_SALT not set), skip recording
  if (!ipHash || !emailHash) return

  const supabase = createAdminClient()

  // Record in both tables
  await Promise.all([
    supabase
      .from("rate_limit_login_ip")
      .insert({ ip_hash: ipHash, success } as never),
    supabase
      .from("rate_limit_login_account")
      .insert({ email_hash: emailHash, success } as never),
  ])

  // On successful login, optionally clear failed attempts for this account
  // (so a legitimate user isn't penalized after logging in successfully)
  if (success) {
    await supabase
      .from("rate_limit_login_account")
      .delete()
      .eq("email_hash", emailHash)
      .eq("success", false)
  }
}

/**
 * Quick check if an IP is currently blocked (for use in middleware).
 * Returns retryAfterSeconds > 0 if blocked.
 */
export async function isIpBlocked(ip: string): Promise<{ blocked: boolean; retryAfterSeconds: number }> {
  try {
    const ipHash = await hashValue(ip)
    if (!ipHash) return { blocked: false, retryAfterSeconds: 0 }

    const supabase = createAdminClient()
    const now = new Date()
    const windowStart = new Date(now.getTime() - IP_WINDOW_MS).toISOString()

    const { data: ipAttempts } = await supabase
      .from("rate_limit_login_ip")
      .select("attempted_at")
      .eq("ip_hash", ipHash)
      .eq("success", false)
      .gte("attempted_at", windowStart)
      .order("attempted_at", { ascending: false }) as { data: Array<{ attempted_at: string }> | null }

    const failCount = ipAttempts?.length ?? 0

    if (failCount >= IP_MAX_ATTEMPTS) {
      const oldestRelevant = ipAttempts![ipAttempts!.length - 1].attempted_at
      const blockedUntil = new Date(new Date(oldestRelevant).getTime() + IP_BLOCK_DURATION_MS)
      const retryAfterSeconds = Math.max(0, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000))

      if (retryAfterSeconds > 0) {
        return { blocked: true, retryAfterSeconds }
      }
    }

    return { blocked: false, retryAfterSeconds: 0 }
  } catch {
    // If rate limiting fails (e.g. missing env var), allow the request through
    return { blocked: false, retryAfterSeconds: 0 }
  }
}

/**
 * Apply an artificial server-side delay.
 */
export function applyDelay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}
