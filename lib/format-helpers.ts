/**
 * Pure formatting utility functions.
 *
 * These helpers are safe to import from both server and client components
 * because they have no dependency on server-only modules (e.g. next/headers).
 */

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

/**
 * Extract HH:MM time string from a timestamptz value.
 * Returns null for all-day events or invalid dates.
 */
export function formatEventTime(startsAt: string, isAllDay?: boolean): string | null {
  if (isAllDay) return null
  const d = new Date(startsAt)
  if (isNaN(d.getTime())) return null
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * Check if a content string is block-based JSON (used by page/post editors).
 */
export function isBlockContent(content: string): boolean {
  try {
    if (content.startsWith("[{")) {
      const parsed = JSON.parse(content)
      return Array.isArray(parsed) && parsed.length > 0 && parsed[0].type && parsed[0].id
    }
  } catch {
    // not block content
  }
  return false
}
