import { createHmac, randomUUID } from "crypto"

const HMAC_SECRET = process.env.INVITATION_HMAC_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ""

function getHmacSecret(): string {
  if (!HMAC_SECRET) {
    throw new Error("Missing INVITATION_HMAC_SECRET or SUPABASE_SERVICE_ROLE_KEY environment variable")
  }
  return HMAC_SECRET
}

/**
 * Generate a secure, single-use invitation token.
 * Combines a random UUID with an HMAC signature for tamper resistance.
 */
export function generateInvitationToken(): string {
  const id = randomUUID()
  const signature = createHmac("sha256", getHmacSecret())
    .update(id)
    .digest("hex")
    .slice(0, 16)
  return `${id}-${signature}`
}

/**
 * Validate the structure of an invitation token.
 * Checks that the HMAC signature matches the UUID portion.
 */
export function validateTokenSignature(token: string): boolean {
  const parts = token.split("-")
  // UUID has 5 parts (8-4-4-4-12), signature is the 6th part
  if (parts.length !== 6) return false

  const id = parts.slice(0, 5).join("-")
  const providedSignature = parts[5]

  const expectedSignature = createHmac("sha256", getHmacSecret())
    .update(id)
    .digest("hex")
    .slice(0, 16)

  return providedSignature === expectedSignature
}

/**
 * Derive a best-guess first name from an email address.
 * Returns null if no reasonable name can be determined.
 */
export function guessFirstNameFromEmail(email: string): string | null {
  const local = email.split("@")[0]
  if (!local) return null

  // Try common patterns: firstname.lastname, firstname_lastname, firstname-lastname
  const separators = [".", "_", "-"]
  for (const sep of separators) {
    if (local.includes(sep)) {
      const firstName = local.split(sep)[0]
      if (firstName && firstName.length > 1 && /^[a-zA-ZäöüÄÖÜß]+$/.test(firstName)) {
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
      }
    }
  }

  // If the local part looks like a name (only letters, reasonable length)
  if (/^[a-zA-ZäöüÄÖÜß]+$/.test(local) && local.length >= 2 && local.length <= 20) {
    return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase()
  }

  return null
}

/**
 * Get the base URL for onboarding links.
 */
export function getOnboardingBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://grabbe.site"
}

/**
 * Build the full onboarding URL for a given token.
 */
export function buildOnboardingUrl(token: string): string {
  return `${getOnboardingBaseUrl()}/onboarding?token=${token}`
}
