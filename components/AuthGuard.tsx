'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAccessToken, isTokenExpired } from '@/lib/auth'

/**
 * Client-side authentication guard for static export
 * Redirects to /login if user is not authenticated
 *
 * This replaces middleware.ts for static exports since middleware
 * doesn't have access to cookies/localStorage in client-only builds
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication - always render immediately
  const publicRoutes = ['/login', '/login/forgot']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // For public routes, always render children immediately (no auth check needed)
  if (isPublicRoute) {
    return <>{children}</>
  }

  // For protected routes, check auth
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check authentication
    const token = getAccessToken()

    if (!token) {
      // No token found - redirect to login
      console.log('[AuthGuard] No token found, redirecting to login')
      const returnUrl = pathname !== '/' ? pathname : ''
      const loginUrl = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'
      router.replace(loginUrl)
      return
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('[AuthGuard] Token expired, redirecting to login')
      // Clear expired token
      localStorage.removeItem('access_token')
      localStorage.removeItem('accessToken')
      router.replace('/login?returnUrl=' + encodeURIComponent(pathname))
      return
    }

    // Token exists and is valid - allow access
    console.log('[AuthGuard] Token found and valid, allowing access')
    setIsReady(true)
  }, [pathname, router])

  // For protected routes, show nothing until auth check completes
  if (!isReady) {
    return null
  }

  return <>{children}</>
}
