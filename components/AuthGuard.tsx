'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'

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

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/login/forgot']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (isPublicRoute) {
      setIsChecking(false)
      return
    }

    // Check authentication
    const token = getAccessToken()

    if (!token) {
      // No token found - redirect to login
      const returnUrl = pathname !== '/' ? pathname : ''
      const loginUrl = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login'
      router.replace(loginUrl)
    } else {
      // Token exists - allow access
      setIsChecking(false)
    }
  }, [pathname, router])

  // Show nothing while checking auth (prevents flash of protected content)
  if (isChecking) {
    return null
  }

  return <>{children}</>
}
