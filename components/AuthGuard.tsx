'use client'

import { useEffect, useState, useCallback } from 'react'
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
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuth = useCallback(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/login/forgot']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (isPublicRoute) {
      setIsChecking(false)
      setIsAuthenticated(true)
      return
    }

    // Check authentication
    const token = getAccessToken()

    if (!token) {
      // No token found - redirect to login
      console.log('[AuthGuard] No token found, redirecting to login')
      setIsAuthenticated(false)
      setIsChecking(false)
      const returnUrl = pathname !== '/' ? pathname : ''
      const loginUrl = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'
      router.replace(loginUrl)
      return
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('[AuthGuard] Token expired, redirecting to login')
      setIsAuthenticated(false)
      setIsChecking(false)
      // Clear expired token
      localStorage.removeItem('access_token')
      localStorage.removeItem('accessToken')
      router.replace('/login?returnUrl=' + encodeURIComponent(pathname))
      return
    }

    // Token exists and is valid - allow access
    console.log('[AuthGuard] Token found and valid, allowing access')
    setIsAuthenticated(true)
    setIsChecking(false)
  }, [pathname, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show nothing while checking auth (prevents flash of protected content)
  if (isChecking) {
    return null
  }

  // Only render children if authenticated or on public route
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
