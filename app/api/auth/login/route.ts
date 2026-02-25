import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, recordLoginAttempt, applyDelay } from "@/lib/rate-limiter"
import { NextResponse, type NextRequest } from "next/server"

/**
 * POST /api/auth/login
 *
 * Server-side login endpoint that wraps Supabase auth with rate limiting.
 * - Checks IP and account-level rate limits
 * - Applies progressive server-side delays
 * - Returns uniform 401 for all failures (no user enumeration)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich." },
        { status: 400 }
      )
    }

    // Get client IP from headers (standard for Vercel/proxied deployments)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    // ── Rate limit check ──
    const rateLimit = await checkRateLimit(ip, email)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Zu viele Anmeldeversuche. Bitte warten Sie.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    // ── Apply progressive server-side delay ──
    await applyDelay(rateLimit.delayMs)

    // ── Attempt authentication via Supabase Admin API ──
    const supabase = createAdminClient()

    // Use signInWithPassword via the admin client's auth API
    // We need a client-style auth call; admin client can verify credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      // Record the failed attempt
      await recordLoginAttempt(ip, email, false)

      // Return uniform 401 — never reveal whether the email exists
      return NextResponse.json(
        { error: "E-Mail oder Passwort ist falsch." },
        { status: 401 }
      )
    }

    // ── Successful login ──
    await recordLoginAttempt(ip, email, true)

    // Return session tokens so the client can establish the session
    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    )
  }
}
