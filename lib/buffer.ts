/**
 * Buffer API Client Library
 *
 * Provides a type-safe interface to the Buffer GraphQL API.
 * Used for social media publishing from the CMS.
 *
 * All GraphQL queries use inline values (not variables) to exactly match
 * the format from Buffer's official API documentation, avoiding any
 * potential type-mismatch issues with GraphQL variable declarations.
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

const BUFFER_GRAPHQL_ENDPOINT = "https://api.buffer.com"

/** Default timeout for external Buffer API calls (in ms) */
const API_TIMEOUT_MS = 15_000

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Escape a string value for safe inline use in a GraphQL query.
 * Handles quotes, backslashes, and newlines.
 */
function escapeGraphQLString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\b/g, "\\b")
    .replace(/\0/g, "")
}

/**
 * Execute a GraphQL query/mutation against Buffer's API.
 * Uses Bearer token authentication and enforces a timeout.
 */
async function bufferGraphQL<T>(
  accessToken: string,
  query: string,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

  try {
    const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query }),
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
// These functions build GraphQL queries with inline values, exactly matching
// the format shown in Buffer's official API documentation.
// @see https://developers.buffer.com/guides/getting-started.html
// ============================================================================

/**
 * Build the GetOrganizations query.
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
 * Build the GetChannels query with an inline organization ID.
 * Uses the exact format from the Buffer API docs.
 * @see https://developers.buffer.com/guides/getting-started.html
 */
function buildGetChannelsQuery(organizationId: string): string {
  const safeOrgId = escapeGraphQLString(organizationId)
  return `
    query GetChannels {
      channels(input: {
        organizationId: "${safeOrgId}"
      }) {
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
 * Build the CreatePost mutation with inline values.
 * Matches the exact format from the Buffer API docs.
 * @see https://developers.buffer.com/guides/getting-started.html
 */
function buildCreatePostMutation(params: {
  text: string
  channelId: string
  dueAt: string
  imageUrl?: string
}): string {
  const safeText = escapeGraphQLString(params.text)
  const safeChannelId = escapeGraphQLString(params.channelId)
  const safeDueAt = escapeGraphQLString(params.dueAt)

  const assetsBlock = params.imageUrl
    ? `
    assets: {
      images: [
        {
          url: "${escapeGraphQLString(params.imageUrl)}"
        }
      ]
    }`
    : ""

  return `
    mutation CreatePost {
      createPost(input: {
        text: "${safeText}",
        channelId: "${safeChannelId}",
        schedulingType: automatic,
        mode: customSchedule,
        dueAt: "${safeDueAt}"${assetsBlock}
      }) {
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
 */
export async function getBufferChannels(accessToken: string): Promise<BufferChannel[]> {
  // Step 1: Get all organizations
  const accountData = await bufferGraphQL<{ account: { organizations: BufferOrganization[] } }>(
    accessToken,
    buildGetOrganizationsQuery(),
  )

  const orgs = accountData.account?.organizations ?? []
  if (orgs.length === 0) {
    return []
  }

  // Step 2: Get channels for each organization
  const allChannels: BufferChannel[] = []
  for (const org of orgs) {
    try {
      const channelData = await bufferGraphQL<{ channels: BufferChannel[] }>(
        accessToken,
        buildGetChannelsQuery(org.id),
      )
      const channels = (channelData.channels ?? []).map((ch) => ({
        ...ch,
        organizationId: org.id,
      }))
      allChannels.push(...channels)
    } catch (err) {
      // Log but continue — one failing org shouldn't block all channels
      console.error(`[Buffer] Fehler beim Laden der Kanäle für Org ${org.id} (${org.name}):`, err)
    }
  }

  return allChannels
}

/**
 * Create a new post via Buffer's GraphQL API.
 * Posts are created per channel (one at a time).
 */
export async function createBufferPost(
  accessToken: string,
  params: BufferCreatePostParams
): Promise<BufferPostResult> {
  const mutation = buildCreatePostMutation({
    text: params.text,
    channelId: params.channelId,
    dueAt: params.dueAt || new Date().toISOString(),
    imageUrl: params.imageUrl?.trim() || undefined,
  })

  const data = await bufferGraphQL<{
    createPost: {
      post?: { id: string; text: string; assets?: Array<{ id: string; mimeType: string }> }
      message?: string
    }
  }>(accessToken, mutation)

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
