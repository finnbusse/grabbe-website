/**
 * Buffer API Client Library
 *
 * Provides a type-safe interface to Buffer's APIs.
 * Used for social media publishing from the CMS.
 *
 * - Organization & Channel queries use the GraphQL API (api.buffer.com/graphql)
 *   with proper variables for custom scalar type coercion.
 * - Post creation uses the REST API (api.bufferapp.com/1/updates/create.json)
 *   which is well-documented and more reliable for write operations.
 *
 * @see https://developers.buffer.com/guides/getting-started.html
 */

// ============================================================================
// Types
// ============================================================================

export interface BufferOrganization {
  id: string
  name: string
  ownerEmail: string
}

export interface BufferChannel {
  id: string
  name: string
  displayName: string
  service: string
  avatar: string
  isQueuePaused: boolean
  organizationId?: string
}

export interface BufferCreatePostParams {
  text: string
  channelId: string
  imageUrl?: string
  dueAt?: string
}

export interface BufferPostResult {
  success: boolean
  message?: string
  post?: {
    id: string
    text: string
  }
}

export interface BufferAccountInfo {
  organizations: BufferOrganization[]
}

// ============================================================================
// Constants
// ============================================================================

const BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com/graphql"
const BUFFER_REST_ENDPOINT = "https://api.bufferapp.com/1"

/** Default timeout for external Buffer API calls (in ms) */
const API_TIMEOUT_MS = 15_000

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Execute a GraphQL query/mutation against Buffer's API.
 * Uses Bearer token authentication and enforces a timeout.
 */
async function bufferGraphQL<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const payload: Record<string, unknown> = { query }
    if (variables) {
      payload.variables = variables
    }

    const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Buffer API HTTP ${res.status}: ${body}`)
    }

    const json = await res.json() as { data?: T; errors?: Array<{ message: string }> }

    if (json.errors && json.errors.length > 0) {
      throw new Error(`Buffer GraphQL Fehler: ${json.errors.map((e) => e.message).join(", ")}`)
    }

    if (!json.data) {
      throw new Error("Buffer API: Keine Daten in der Antwort.")
    }

    return json.data
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Buffer API Timeout: Keine Antwort innerhalb von ${API_TIMEOUT_MS / 1000}s.`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ============================================================================
// GraphQL Query Builders
//
// Queries use proper GraphQL variables so that Buffer's custom scalar types
// (OrganizationId, ChannelId, DateTime, etc.) are correctly coerced.
// @see https://developers.buffer.com/guides/getting-started.html
// ============================================================================

/**
 * Build the GetOrganizations query.
 * No variables needed – just fetches the authenticated account's orgs.
 * @see https://developers.buffer.com/guides/getting-started.html
 */
function buildGetOrganizationsQuery(): string {
  return `
    query GetOrganizations {
      account {
        organizations {
          id
          name
          ownerEmail
        }
      }
    }
  `
}

/**
 * Build the GetChannels query using a GraphQL variable for the
 * organization ID.  Buffer's ChannelsInput expects an OrganizationId
 * scalar; passing it as a variable lets the server coerce the value
 * correctly (inline string literals fail with "Invalid OrganizationId
 * format").
 */
function buildGetChannelsQuery(): string {
  return `
    query GetChannels($input: ChannelsInput!) {
      channels(input: $input) {
        id
        name
        displayName
        service
        avatar
        isQueuePaused
      }
    }
  `
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Validate a Buffer access token by fetching the account's organizations.
 * Returns account info on success, throws on failure (invalid/expired token).
 */
export async function validateBufferToken(accessToken: string): Promise<BufferAccountInfo> {
  const data = await bufferGraphQL<{ account: { organizations: BufferOrganization[] } }>(
    accessToken,
    buildGetOrganizationsQuery(),
  )

  if (!data.account?.organizations) {
    throw new Error("Ungültiger Token: Keine Kontodaten erhalten.")
  }

  return { organizations: data.account.organizations }
}

/**
 * Fetch all connected channels (social media profiles) across all organizations.
 * Returns channels and any per-organization errors encountered.
 */
export async function getBufferChannels(accessToken: string): Promise<{
  channels: BufferChannel[]
  errors: Array<{ orgId: string; orgName: string; message: string }>
}> {
  // Step 1: Get all organizations
  const accountData = await bufferGraphQL<{ account: { organizations: BufferOrganization[] } }>(
    accessToken,
    buildGetOrganizationsQuery(),
  )

  const orgs = accountData.account?.organizations ?? []
  if (orgs.length === 0) {
    return { channels: [], errors: [] }
  }

  // Step 2: Get channels for each organization
  const allChannels: BufferChannel[] = []
  const orgErrors: Array<{ orgId: string; orgName: string; message: string }> = []

  for (const org of orgs) {
    try {
      const channelData = await bufferGraphQL<{ channels: BufferChannel[] }>(
        accessToken,
        buildGetChannelsQuery(),
        { input: { organizationId: org.id } },
      )
      const channels = (channelData.channels ?? []).map((ch) => ({
        ...ch,
        organizationId: org.id,
      }))
      allChannels.push(...channels)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler"
      console.error(`[Buffer] Fehler beim Laden der Kanäle für Org ${org.id} (${org.name}):`, err)
      orgErrors.push({ orgId: org.id, orgName: org.name, message })
    }
  }

  return { channels: allChannels, errors: orgErrors }
}

/**
 * Create a new post via Buffer's REST API.
 *
 * Uses the stable /1/updates/create.json endpoint instead of the GraphQL
 * mutation, which avoids unknown-type-name issues with the GraphQL schema.
 *
 * @see https://publish.buffer.com/developers/api/updates
 */
export async function createBufferPost(
  accessToken: string,
  params: BufferCreatePostParams
): Promise<BufferPostResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const formData = new URLSearchParams()
    formData.append("access_token", accessToken)
    formData.append("text", params.text)
    formData.append("profile_ids[]", params.channelId)

    if (params.dueAt) {
      formData.append("scheduled_at", params.dueAt)
    } else {
      formData.append("now", "true")
    }

    if (params.imageUrl?.trim()) {
      formData.append("media[photo]", params.imageUrl.trim())
    }

    const res = await fetch(`${BUFFER_REST_ENDPOINT}/updates/create.json`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      signal: controller.signal,
    })

    const json = await res.json() as {
      success?: boolean
      message?: string
      updates?: Array<{ id: string; text: string }>
    }

    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.message || `Buffer API HTTP ${res.status}`,
      }
    }

    const firstUpdate = json.updates?.[0]
    return {
      success: true,
      post: firstUpdate ? { id: firstUpdate.id, text: firstUpdate.text } : undefined,
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Buffer API Timeout: Keine Antwort innerhalb von ${API_TIMEOUT_MS / 1000}s.`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
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
