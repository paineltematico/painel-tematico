import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Protect /admin routes ──────────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token  = request.cookies.get('admin_token')?.value
    const legacy = request.cookies.get('admin_session')?.value

    const hasToken  = !!token  && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
    const hasLegacy = legacy === 'authenticated'

    if (!hasToken && !hasLegacy) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 2. Inline edit mode — any URL ending in /edit ─────────────────────────
  // e.g. /sobre/edit → sets edit_mode cookie → redirects to /sobre
  //      /projetos/edit → sets edit_mode cookie → redirects to /projetos
  if (
    pathname.endsWith('/edit') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    pathname !== '/edit'   // standalone /edit is handled by app/edit/route.ts
  ) {
    const basePath = pathname.slice(0, -5) || '/' // strip '/edit'

    // Lightweight auth: just check cookie presence
    // (full JWT verification happens in API save routes)
    const hasAdminToken = !!request.cookies.get('admin_token')?.value

    if (!hasAdminToken) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('return', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const dest = new URL(basePath, request.url)
    const response = NextResponse.redirect(dest)
    response.cookies.set('edit_mode', '1', {
      path: '/',
      httpOnly: false,  // must be readable by EditModeContext (client-side)
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/:path+/edit',
  ],
}
