/**
 * Buffer API Client Library
 *
 * Provides a type-safe interface to the Buffer Publish API (v1).
 * Used for social media publishing from the CMS.
 *
 * @see https://buffer.com/developers/api
 */

// ============================================================================
// Types
// ============================================================================

export interface BufferProfile {
  id: string
  service: string
  service_username: string
  service_type: string
  avatar: string
  formatted_service: string
  default: boolean
  disabled: boolean | null
}

export interface BufferPostMedia {
  link?: string
  description?: string
  picture?: string
}

export interface BufferCreatePostParams {
  text: string
  profile_ids: string[]
  media?: BufferPostMedia
  now?: boolean
  scheduled_at?: string
  shorten?: boolean
}

export interface BufferUpdateResponse {
  success: boolean
  message: string
  updates?: Array<{
    id: string
    created_at: number
    status: string
    text: string
    profile_id: string
    due_at?: number
  }>
}

export interface BufferUserResponse {
  id: string
  name: string
  plan: string
}

// ============================================================================
// Constants
// ============================================================================

const BUFFER_API_BASE = "https://api.bufferapp.com/1"

/** Default timeout for external Buffer API calls (in ms) */
const API_TIMEOUT_MS = 10_000

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Fetch wrapper that enforces a timeout via AbortController.
 * Prevents indefinite hangs when Buffer's API is slow or unreachable.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Buffer API Timeout: Keine Antwort innerhalb von ${timeoutMs / 1000}s.`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Validate a Buffer access token by fetching the user profile.
 * Returns the user data on success, throws on failure.
 */
export async function validateBufferToken(accessToken: string): Promise<BufferUserResponse> {
  const res = await fetchWithTimeout(
    `${BUFFER_API_BASE}/user.json?access_token=${encodeURIComponent(accessToken)}`,
    { method: "GET", headers: { "Accept": "application/json" } }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Buffer API error (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Fetch all connected profiles (social media channels) for the authenticated user.
 */
export async function getBufferProfiles(accessToken: string): Promise<BufferProfile[]> {
  const res = await fetchWithTimeout(
    `${BUFFER_API_BASE}/profiles.json?access_token=${encodeURIComponent(accessToken)}`,
    { method: "GET", headers: { "Accept": "application/json" } }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Buffer API error (${res.status}): ${body}`)
  }

  return res.json()
}

/**
 * Create a new post/update via Buffer.
 * Posts will be added to the selected profiles' queues or published immediately.
 */
export async function createBufferPost(
  accessToken: string,
  params: BufferCreatePostParams
): Promise<BufferUpdateResponse> {
  const formData = new URLSearchParams()
  formData.append("access_token", accessToken)
  formData.append("text", params.text)

  for (const profileId of params.profile_ids) {
    formData.append("profile_ids[]", profileId)
  }

  if (params.media?.link) {
    formData.append("media[link]", params.media.link)
  }
  if (params.media?.description) {
    formData.append("media[description]", params.media.description)
  }
  if (params.media?.picture) {
    formData.append("media[picture]", params.media.picture)
  }

  if (params.now) {
    formData.append("now", "true")
  }

  if (params.scheduled_at) {
    formData.append("scheduled_at", params.scheduled_at)
  }

  if (params.shorten !== undefined) {
    formData.append("shorten", params.shorten ? "true" : "false")
  }

  const res = await fetchWithTimeout(`${BUFFER_API_BASE}/updates/create.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: formData.toString(),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Buffer API error (${res.status}): ${body}`)
  }

  return res.json()
}

// ============================================================================
// Helpers
// ============================================================================

/** Map Buffer service names to human-readable display names */
export function getServiceDisplayName(service: string): string {
  const map: Record<string, string> = {
    facebook: "Facebook",
    twitter: "X (Twitter)",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    threads: "Threads",
    pinterest: "Pinterest",
    googlebusiness: "Google Business",
    mastodon: "Mastodon",
    tiktok: "TikTok",
    youtube: "YouTube",
    shopify: "Shopify",
    bluesky: "Bluesky",
  }
  return map[service.toLowerCase()] ?? service
}

/** Mask an API token for display (show only last 4 characters) */
export function maskToken(token: string): string {
  if (token.length <= 4) return "••••"
  return "••••••••" + token.slice(-4)
}
