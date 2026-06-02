import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token  = request.cookies.get('admin_token')?.value
    const legacy = request.cookies.get('admin_session')?.value

    // Accept new JWT token (format: base64url.base64url) or legacy cookie
    const hasToken  = !!token  && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
    const hasLegacy = legacy === 'authenticated'

    if (!hasToken && !hasLegacy) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
