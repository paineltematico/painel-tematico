import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Intercepts any URL ending in /edit (except /admin and /api) and:
 *   1. Checks the admin_token cookie (lightweight — no crypto needed)
 *   2. Sets the edit_mode cookie
 *   3. Redirects to the same page without /edit
 *
 * Examples:
 *   /projetos/edit   →  sets edit_mode cookie  →  /projetos  (edit bar appears)
 *   /sobre/edit      →  sets edit_mode cookie  →  /sobre
 *   /edit            →  handled by src/app/edit/route.ts (same logic, with full auth)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Guard: skip internal/admin/api paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/edit/exit')
  ) {
    return NextResponse.next()
  }

  // Match any path ending in /edit
  if (pathname.endsWith('/edit')) {
    const basePath = pathname.slice(0, -5) || '/' // strip '/edit'

    // Lightweight auth check — presence of admin_token cookie
    // (actual JWT verification happens in API routes; this is UI-only)
    const hasAdminToken = !!request.cookies.get('admin_token')?.value

    if (!hasAdminToken) {
      // Not logged in → send to admin login, then come back here to activate
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('return', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Activate edit mode + redirect to the actual page
    const dest = new URL(basePath, request.url)
    const response = NextResponse.redirect(dest)
    response.cookies.set('edit_mode', '1', {
      path: '/',
      httpOnly: false, // must be readable client-side for EditModeContext
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  // Match all paths that end in /edit (at least one segment before it)
  matcher: ['/:path+/edit'],
}
