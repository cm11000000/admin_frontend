import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Server-side auth guard: redirect unauthenticated users to /login
export function middleware(req: NextRequest) {
  const { cookies, nextUrl } = req
  const access = cookies.get('access_token')?.value || ''
  const refresh = cookies.get('refresh_token')?.value || ''

  // Debug logging for auth state (disable in production by removing this block)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Middleware] Path: ${nextUrl.pathname}`)
    console.log(`[Middleware] Has access_token: ${!!access}`)
    console.log(`[Middleware] Has refresh_token: ${!!refresh}`)
    console.log(`[Middleware] All cookies:`, req.cookies.getAll().map(c => c.name))
  }

  // Special handling for root: redirect to dashboard if logged in, else to login
  if (nextUrl.pathname === '/') {
    const url = nextUrl.clone()
    url.pathname = access ? '/dashboard' : '/login'
    if (!access) url.searchParams.set('returnUrl', '/')
    return NextResponse.redirect(url)
  }

  // Protected routes: require auth (either access OR refresh token present)
  if (!access && !refresh) {
    console.warn(`[Middleware] No auth tokens found, redirecting to login from ${nextUrl.pathname}`)
    const url = nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('returnUrl', nextUrl.pathname + (nextUrl.search || ''))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Apply to all dashboard routes
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/transactions/:path*',
    '/reports/:path*',
    '/config/:path*',
    '/admin/:path*',
    '/settlements/:path*',
    '/refunds/:path*',
  ],
}
