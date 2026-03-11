/**
 * Buffer API Client Library
 *
 * Provides a type-safe interface to the Buffer GraphQL API.
 * Used for social media publishing from the CMS.
 *
 * All queries use proper GraphQL variables so that Buffer's custom scalar
 * types (OrganizationId, ChannelId, etc.) are correctly coerced by the
 * server-side type system.
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

/**
 * Build the CreatePost mutation using GraphQL variables.
 * This ensures ChannelId, DateTime, and other custom scalars are
 * properly coerced by the server.
 */
function buildCreatePostMutation(): string {
  return `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            text
            assets {
              id
              mimeType
            }
          }
        }
        ... on MutationError {
          message
        }
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
 * Create a new post via Buffer's GraphQL API.
 * Posts are created per channel (one at a time).
 */
export async function createBufferPost(
  accessToken: string,
  params: BufferCreatePostParams
): Promise<BufferPostResult> {
  const dueAt = params.dueAt || new Date().toISOString()
  const imageUrl = params.imageUrl?.trim() || undefined

  const input: Record<string, unknown> = {
    text: params.text,
    channelId: params.channelId,
    schedulingType: "automatic",
    mode: "customSchedule",
    dueAt,
  }

  if (imageUrl) {
    input.assets = {
      images: [{ url: imageUrl }],
    }
  }

  const data = await bufferGraphQL<{
    createPost: {
      post?: { id: string; text: string; assets?: Array<{ id: string; mimeType: string }> }
      message?: string
    }
  }>(accessToken, buildCreatePostMutation(), { input })

  if (data.createPost.message) {
    // MutationError
    return { success: false, message: data.createPost.message }
  }

  return {
    success: true,
    post: data.createPost.post ?? undefined,
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
