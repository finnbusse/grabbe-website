import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { isIpBlocked } from '@/lib/rate-limiter'

// Known filesystem routes that should NOT be rewritten
const KNOWN_ROUTES = new Set([
  '', 'aktuelles', 'termine', 'downloads', 'kontakt', 'impressum', 'datenschutz',
  'unsere-schule', 'schulleben', 'seiten', 'cms', 'auth', 'api', 'protected', 'onboarding',
])

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── Early block check for login API route ──
  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const { blocked, retryAfterSeconds } = await isIpBlocked(ip)

    if (blocked) {
      return NextResponse.json(
        {
          error: 'Zu viele Anmeldeversuche. Bitte warten Sie.',
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSeconds) },
        }
      )
    }
  }

  const sessionResponse = await updateSession(request)

  // If session handling already redirected (e.g., to login), return that
  if (sessionResponse.status === 307 || sessionResponse.status === 308) {
    return sessionResponse
  }
  const segments = pathname.split('/').filter(Boolean)

  // ── 301 Redirects for deprecated CMS routes ──
  if (pathname.startsWith('/cms/seiten-editor')) {
    const rest = pathname.replace('/cms/seiten-editor', '')
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = rest ? `/cms/seiten${rest}/bearbeiten` : '/cms/seiten'
    return NextResponse.redirect(redirectUrl, 301)
  }
  if (pathname === '/cms/pages/new') {
    // Keep new page wizard at its current URL
  } else if (pathname.startsWith('/cms/pages/') && pathname !== '/cms/pages') {
    const pageId = pathname.replace('/cms/pages/', '')
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = `/cms/seiten/${pageId}/bearbeiten`
    return NextResponse.redirect(redirectUrl, 301)
  } else if (pathname === '/cms/pages') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/cms/seiten'
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Redirect /cms/documents → /cms/dateien
  if (pathname === '/cms/documents') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/cms/dateien'
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Only consider paths with 1-3 segments that don't match known filesystem routes
  if (segments.length >= 1 && segments.length <= 3) {
    const firstSegment = segments[0]

    // If the first segment is NOT a known route, this might be a custom category page
    // Rewrite to /seiten/[...slug] which handles DB lookup
    if (!KNOWN_ROUTES.has(firstSegment) && !firstSegment.startsWith('_')) {
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = `/seiten/${segments.join('/')}`

      const rewriteResponse = NextResponse.rewrite(rewriteUrl, { request })
      // Copy auth cookies from session response
      sessionResponse.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie.name, cookie.value)
      })
      return rewriteResponse
    }
  }

  return sessionResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
