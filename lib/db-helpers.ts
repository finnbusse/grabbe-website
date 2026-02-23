/**
 * Database Query Helpers
 * 
 * Common database queries and utilities for the School CMS
 * These helpers provide type-safe, reusable database operations
 */

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { unstable_cache } from 'next/cache'
import type {
  Page,
  Post,
  PostListItem,
  Event,
  Document,
  NavigationItem,
  NavigationItemWithChildren,
  SiteSetting,
  ContactSubmission,
  AnmeldungSubmission,
} from '@/lib/types/database.types'

// ============================================================================
// Column selections for list views (avoid fetching unused large text fields)
// ============================================================================

const POST_LIST_COLUMNS = 'id, title, slug, excerpt, category, published, featured, image_url, author_name, user_id, event_date, meta_description, seo_og_image, created_at, updated_at' as const
const EVENT_LIST_COLUMNS = 'id, title, description, event_date, event_end_date, event_time, location, category, published, user_id, created_at, updated_at' as const
const DOCUMENT_LIST_COLUMNS = 'id, title, file_url, file_name, file_size, file_type, category, published, user_id, created_at, updated_at' as const
const NAV_LIST_COLUMNS = 'id, label, href, parent_id, sort_order, visible, location, created_at, updated_at' as const

// ============================================================================
// Pages Queries
// ============================================================================

/**
 * Get all published pages
 */
export const getPublishedPages = unstable_cache(
  async () => {
    const supabase = createStaticClient()
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data as Page[]
  },
  ['published-pages'],
  { revalidate: 300, tags: ['pages'] }
)

/**
 * Get a page by slug
 */
export async function getPageBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) throw error
      return data as Page
    },
    ['page-by-slug', slug],
    { revalidate: 300, tags: ['pages'] }
  )()
}

/**
 * Get pages by section
 */
export async function getPagesBySection(section: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('section', section)
        .eq('published', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data as Page[]
    },
    ['pages-by-section', section],
    { revalidate: 300, tags: ['pages'] }
  )()
}

// ============================================================================
// Posts Queries
// ============================================================================

/**
 * Get all published posts
 */
export async function getPublishedPosts(limit?: number) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      let query = supabase
        .from('posts')
        .select(POST_LIST_COLUMNS)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as PostListItem[]
    },
    ['published-posts', String(limit ?? 'all')],
    { revalidate: 300, tags: ['posts'] }
  )()
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(limit: number = 3) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('posts')
        .select(POST_LIST_COLUMNS)
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as PostListItem[]
    },
    ['featured-posts', String(limit)],
    { revalidate: 300, tags: ['posts'] }
  )()
}

/**
 * Get a post by slug
 */
export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

      if (error) throw error
      return data as Post
    },
    ['post-by-slug', slug],
    { revalidate: 300, tags: ['posts'] }
  )()
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(category: string, limit?: number) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      let query = supabase
        .from('posts')
        .select(POST_LIST_COLUMNS)
        .eq('category', category)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as PostListItem[]
    },
    ['posts-by-category', category, String(limit ?? 'all')],
    { revalidate: 300, tags: ['posts'] }
  )()
}

// ============================================================================
// Events Queries
// ============================================================================

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(limit?: number) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('events')
        .select(EVENT_LIST_COLUMNS)
        .eq('published', true)
        .gte('event_date', today)
        .order('event_date', { ascending: true })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Event[]
    },
    ['upcoming-events', String(limit ?? 'all')],
    { revalidate: 300, tags: ['events'] }
  )()
}

/**
 * Get past events
 */
export async function getPastEvents(limit?: number) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const today = new Date().toISOString().split('T')[0]

      let query = supabase
        .from('events')
        .select(EVENT_LIST_COLUMNS)
        .eq('published', true)
        .lt('event_date', today)
        .order('event_date', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Event[]
    },
    ['past-events', String(limit ?? 'all')],
    { revalidate: 300, tags: ['events'] }
  )()
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('events')
        .select(EVENT_LIST_COLUMNS)
        .eq('category', category)
        .eq('published', true)
        .order('event_date', { ascending: true })

      if (error) throw error
      return data as Event[]
    },
    ['events-by-category', category],
    { revalidate: 300, tags: ['events'] }
  )()
}

// ============================================================================
// Documents Queries
// ============================================================================

/**
 * Get all published documents
 */
export const getPublishedDocuments = unstable_cache(
  async () => {
    const supabase = createStaticClient()
    const { data, error } = await supabase
      .from('documents')
      .select(DOCUMENT_LIST_COLUMNS)
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Document[]
  },
  ['published-documents'],
  { revalidate: 300, tags: ['documents'] }
)

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(category: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('documents')
        .select(DOCUMENT_LIST_COLUMNS)
        .eq('category', category)
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Document[]
    },
    ['documents-by-category', category],
    { revalidate: 300, tags: ['documents'] }
  )()
}

// ============================================================================
// Navigation Queries
// ============================================================================

/**
 * Get navigation items for a specific location (header/footer)
 * Returns a hierarchical structure with nested children
 */
export async function getNavigationItems(
  location: 'header' | 'footer' = 'header'
): Promise<NavigationItemWithChildren[]> {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('navigation_items')
        .select(NAV_LIST_COLUMNS)
        .eq('location', location)
        .eq('visible', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      // Build hierarchical structure
      const items = data as NavigationItem[]
      const itemMap = new Map<string, NavigationItemWithChildren>()
      const rootItems: NavigationItemWithChildren[] = []

      // First pass: create map of all items
      items.forEach((item) => {
        itemMap.set(item.id, { ...item, children: [] })
      })

      // Second pass: build hierarchy
      items.forEach((item) => {
        const navItem = itemMap.get(item.id)!
        if (item.parent_id && itemMap.has(item.parent_id)) {
          const parent = itemMap.get(item.parent_id)!
          parent.children = parent.children || []
          parent.children.push(navItem)
        } else {
          rootItems.push(navItem)
        }
      })

      return rootItems
    },
    ['navigation-items', location],
    { revalidate: 3600, tags: ['navigation'] }
  )()
}

// ============================================================================
// Site Settings Queries
// ============================================================================

/**
 * Get all site settings as full rows (cached).
 * Used internally by getSiteSetting() and getSiteSettingValue().
 */
const getAllSiteSettingsRows = unstable_cache(
  async (): Promise<SiteSetting[]> => {
    const supabase = createStaticClient()
    const { data, error } = await supabase.from('site_settings').select('*')

    if (error) throw error
    return data as SiteSetting[]
  },
  ['all-site-settings-rows'],
  { revalidate: 3600, tags: ['settings'] }
)

/**
 * Get all site settings as a key-value map (cached)
 */
export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const rows = await getAllSiteSettingsRows()
  const settings: Record<string, string> = {}
  rows.forEach((row) => {
    settings[row.key] = row.value
  })
  return settings
}

/**
 * Get a site setting by key (uses the cached batch query, returns real SiteSetting)
 */
export async function getSiteSetting(key: string): Promise<SiteSetting | null> {
  try {
    const rows = await getAllSiteSettingsRows()
    return rows.find((row) => row.key === key) ?? null
  } catch {
    return null
  }
}

/**
 * Get site setting value by key (returns just the value string)
 */
export async function getSiteSettingValue(key: string): Promise<string | null> {
  try {
    const rows = await getAllSiteSettingsRows()
    const row = rows.find((r) => r.key === key)
    return row?.value ?? null
  } catch {
    return null
  }
}

/**
 * Get all site settings by category
 */
export async function getSiteSettingsByCategory(category: string) {
  return unstable_cache(
    async () => {
      const supabase = createStaticClient()
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('category', category)

      if (error) throw error
      return data as SiteSetting[]
    },
    ['site-settings-by-category', category],
    { revalidate: 3600, tags: ['settings'] }
  )()
}

// ============================================================================
// Form Submissions (Server-side only)
// ============================================================================

/**
 * Create a contact submission
 */
export async function createContactSubmission(
  submission: Omit<ContactSubmission, 'id' | 'created_at' | 'read'>
) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(submission)
    .select()
    .single()

  if (error) throw error
  return data as ContactSubmission
}

/**
 * Create an anmeldung (enrollment) submission
 */
export async function createAnmeldungSubmission(
  submission: Omit<AnmeldungSubmission, 'id' | 'created_at'>
) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('anmeldung_submissions')
    .insert(submission)
    .select()
    .single()

  if (error) throw error
  return data as AnmeldungSubmission
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format date in German locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format datetime in German locale
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
