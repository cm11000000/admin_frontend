import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Server-side auth guard: redirect unauthenticated users to /login
export function middleware(req: NextRequest) {
  const { cookies, nextUrl } = req
  const access = cookies.get('access_token')?.value || ''
  const refresh = cookies.get('refresh_token')?.value || ''

  // Special handling for root: redirect to dashboard if logged in, else to login
  if (nextUrl.pathname === '/') {
    const url = nextUrl.clone()
    url.pathname = access ? '/dashboard' : '/login'
    if (!access) url.searchParams.set('returnUrl', '/')
    return NextResponse.redirect(url)
  }

  // Protected routes: require auth
  if (!access && !refresh) {
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
