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
 *
 * IMPORTANT: For static export, we start with isMounted=false to prevent
 * the loading spinner from being included in the static HTML
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/login/forgot']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    // Mark as mounted (now we're on client-side)
    setIsMounted(true)

    // For public routes, just allow rendering
    if (isPublicRoute) {
      return
    }

    // For protected routes, check authentication
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
  }, [pathname, router, isPublicRoute])

  // For static export: always render children immediately
  // Auth check happens in useEffect and redirects if needed
  // This prevents white screen in static HTML
  return <>{children}</>
}
