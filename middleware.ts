import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

// Known filesystem routes that should NOT be rewritten
const KNOWN_ROUTES = new Set([
  '', 'aktuelles', 'termine', 'downloads', 'kontakt', 'impressum', 'datenschutz',
  'unsere-schule', 'schulleben', 'seiten', 'cms', 'auth', 'api', 'protected',
])

export async function middleware(request: NextRequest) {
  const sessionResponse = await updateSession(request)

  // If session handling already redirected (e.g., to login), return that
  if (sessionResponse.status === 307 || sessionResponse.status === 308) {
    return sessionResponse
  }

  const pathname = request.nextUrl.pathname
  const segments = pathname.split('/').filter(Boolean)

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
