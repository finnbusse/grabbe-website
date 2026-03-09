import { createServerClient } from "@supabase/ssr"
import { checkRateLimit, recordLoginAttempt, applyDelay } from "@/lib/rate-limiter"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/lib/types/database.types"

/**
 * POST /api/auth/login
 *
 * Server-side login endpoint that wraps Supabase auth with rate limiting.
 * - Checks IP and account-level rate limits
 * - Applies progressive server-side delays
 * - Returns uniform 401 for all failures (no user enumeration)
 * - Uses explicit request/response cookie handling (middleware-style)
 *   so session cookies are reliably set on every deployment environment.
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

    // ── Attempt authentication ──
    // Use explicit request/response cookie handling (same pattern as
    // the middleware) instead of cookies() from next/headers.  This
    // guarantees Set-Cookie headers are present in the response on
    // every deployment environment (preview AND production domains).

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      ""
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      ""

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables in login route")
      return NextResponse.json(
        { error: "Ein Fehler ist aufgetreten." },
        { status: 500 }
      )
    }

    // Collect cookies that Supabase sets during signInWithPassword so
    // we can apply them to the response explicitly.
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, string> }> = []

    const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies: Array<{ name: string; value: string; options: Record<string, string> }>) {
          cookies.forEach((cookie) => cookiesToSet.push(cookie))
        },
      },
    })

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

    // Build the response with session tokens (needed on the client for
    // setSession + MFA flow) and explicitly attach the auth cookies.
    const response = NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    })

    cookiesToSet.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options)
    )

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    )
  }
}
