import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email"
import { passwordResetEmailTemplate } from "@/lib/email-templates/password-reset"
import { generateInvitationToken } from "@/lib/invitation-tokens"
import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// In-memory rate limiting for password reset requests (per IP)
// Note: In serverless/multi-instance deployments this is per-instance only.
// For stronger protection, consider a shared store (DB/Redis).
const resetAttempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_ATTEMPTS = 3
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function checkResetRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const entry = resetAttempts.get(ip)

  if (entry) {
    // Clean up old entries
    if (now - entry.firstAttempt > WINDOW_MS) {
      resetAttempts.delete(ip)
    } else if (entry.count >= MAX_ATTEMPTS) {
      const elapsed = now - entry.firstAttempt
      const remaining = Math.ceil((WINDOW_MS - elapsed) / 1000)
      return { allowed: false, retryAfterSeconds: remaining }
    }
  }

  return { allowed: true }
}

function recordResetAttempt(ip: string): void {
  const now = Date.now()
  const entry = resetAttempts.get(ip)

  if (entry && now - entry.firstAttempt < WINDOW_MS) {
    entry.count++
  } else {
    resetAttempts.set(ip, { count: 1, firstAttempt: now })
  }
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://grabbe.site"
}

/**
 * Find a user by email, paginating through all users.
 */
async function findUserByEmail(adminClient: ReturnType<typeof createAdminClient>, email: string) {
  const searchEmail = email.toLowerCase()
  let page = 1
  const perPage = 1000
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage })
    if (error || !data?.users?.length) return null
    const found = data.users.find((u) => u.email?.toLowerCase() === searchEmail)
    if (found) return found
    if (data.users.length < perPage) return null
    page++
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request)

    // Rate limit check
    const rateLimit = checkResetRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Zu viele Anfragen. Bitte warten Sie.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const body = await request.json().catch(() => null)
    const email = body?.email?.trim()?.toLowerCase()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." },
        { status: 400 }
      )
    }

    // Record the attempt regardless of whether the email exists
    recordResetAttempt(ip)

    // Always return success to prevent email enumeration.
    // Behind the scenes, only send if the user exists.
    const adminClient = createAdminClient()

    // Check if user exists (paginated lookup)
    const user = await findUserByEmail(adminClient, email)

    if (user) {
      // Generate a secure reset token (uses shared guarded HMAC secret)
      const token = generateInvitationToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour

      // Store reset token in a simple way using user metadata
      // We store it as app_metadata so it's not visible to the client
      await adminClient.auth.admin.updateUserById(user.id, {
        app_metadata: {
          ...user.app_metadata,
          password_reset_token: token,
          password_reset_expires: expiresAt,
        },
      })

      // Build reset URL
      const resetUrl = `${getBaseUrl()}/auth/passwort-zuruecksetzen?token=${token}&uid=${user.id}`

      // Send email
      const template = passwordResetEmailTemplate({ resetUrl })
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
      })
    }

    // Always return success (anti-enumeration)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset API error:", error)
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    )
  }
}
