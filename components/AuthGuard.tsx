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
  const [isLoading, setIsLoading] = useState(true)

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/login/forgot']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    // For public routes, render immediately
    if (isPublicRoute) {
      setIsLoading(false)
      return
    }

    // For protected routes, check authentication
    const token = getAccessToken()

    if (!token) {
      // No token found - redirect to login (don't set loading to false, let redirect happen)
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
    setIsLoading(false)
  }, [pathname, router, isPublicRoute])

  // Show minimal loading indicator while checking auth (prevents flash)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
