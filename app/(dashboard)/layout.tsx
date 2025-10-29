'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import ClientOnly from '@/components/providers/ClientOnly'
import { resolveUserName } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'
  const refreshTimer = useRef<number | null>(null)

  // Best Practice: Use loading state to prevent content flashing
  // Start with true to show loader, set to false after auth verification
  // Reference: https://theodorusclarence.com/blog/nextjs-redirect-no-flashing
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Safely decode JWT payload to read exp
  const decodeJwt = (token: string): any | null => {
    try {
      const parts = token.split('.')
      if (parts.length < 2) return null
      const payload = JSON.parse(atob(parts[1]))
      return payload
    } catch {
      return null
    }
  }

  // Note: we avoid extending cookie lifetime during refresh to honor the 1-day session window.

  const scheduleProactiveRefresh = () => {
    if (typeof window === 'undefined') return
    const access = localStorage.getItem('accessToken') || localStorage.getItem('access_token')
    const refresh = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token')
    if (!access || !refresh) return

    const payload = decodeJwt(access)
    if (!payload?.exp) return

    const now = Date.now()
    const expMs = payload.exp * 1000
    // Refresh 2 minutes before expiry (min clamp = 5 seconds)
    const bufferMs = 2 * 60 * 1000
    const delay = Math.max(expMs - now - bufferMs, 5000)

    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current)
    }
    refreshTimer.current = window.setTimeout(async () => {
      try {
        const cobBase = (process.env.NEXT_PUBLIC_COB_AWS_API_URL || process.env.NEXT_PUBLIC_COB_API_URL || 'https://cobawsapi.sabpaisa.in').replace(/\/$/, '')
        const res = await fetch(`${cobBase}/auth-service/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        })
        if (res.ok) {
          const data = await res.json()
          const newAccess = data.access || data.accessToken
          const newRefresh = data.refresh || data.refreshToken
          if (newAccess) {
            localStorage.setItem('accessToken', newAccess)
            localStorage.setItem('access_token', newAccess)
            // Do not touch cookie max-age here to avoid extending beyond 1 day
          }
          if (newRefresh) {
            localStorage.setItem('refreshToken', newRefresh)
            localStorage.setItem('refresh_token', newRefresh)
            // Do not touch cookie max-age here
          }
          // Schedule next cycle based on new token
          scheduleProactiveRefresh()
        } else {
          // Refresh failed; let subsequent requests trigger auth flow
          console.warn('[Auth] Proactive refresh failed with status', res.status)
        }
      } catch (e) {
        console.warn('[Auth] Proactive refresh error', e)
      }
    }, delay) as unknown as number
  }

  useEffect(() => {
    console.log('[Dashboard Layout] Auth check started', {
      pathname,
      isLoading,
      isAuthenticated,
      timestamp: new Date().toISOString()
    })

    // Normalize username
    try {
      if (typeof window !== 'undefined') {
        const resolved = resolveUserName()
        if (resolved && localStorage.getItem('userName') !== resolved) {
          localStorage.setItem('userName', resolved)
          console.log('[Dashboard Layout] Username normalized:', resolved)
        }
      }
    } catch (e) {
      console.error('[Dashboard Layout] Error normalizing username:', e)
    }

    // Check authentication - synchronous localStorage check
    const checkLogin = (): boolean => {
      const accessToken = localStorage.getItem('accessToken')
      const legacyAccessToken = localStorage.getItem('access_token')
      const bean = sessionStorage.getItem('bean')
      const loginedUser = sessionStorage.getItem('loginedUser')

      console.log('[Dashboard Layout] Auth tokens:', {
        hasAccessToken: !!accessToken,
        hasLegacyAccessToken: !!legacyAccessToken,
        hasBean: !!bean,
        hasLoginedUser: !!loginedUser
      })

      return !!(accessToken || legacyAccessToken || bean || loginedUser)
    }

    const authenticated = checkLogin()
    console.log('[Dashboard Layout] Authentication result:', authenticated)

    if (!authenticated) {
      // Not authenticated - redirect to login
      console.warn('[Dashboard Layout] NOT AUTHENTICATED - Redirecting')
      const returnUrl = encodeURIComponent(pathname)
      router.replace(`/login?returnUrl=${returnUrl}`)
      return
    }

    // Authenticated - stop loading and show content
    console.log('[Dashboard Layout] AUTHENTICATED - Showing dashboard')
    setIsAuthenticated(true)
    setIsLoading(false)

    // Schedule token refresh
    scheduleProactiveRefresh()

  }, [router, pathname])

  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current)
      }
    }
  }, [])

  // Show loader while checking auth - prevents content flashing
  // Best practice: https://theodorusclarence.com/blog/nextjs-redirect-no-flashing
  if (isLoading || !isAuthenticated) {
    console.log('[Dashboard Layout] RENDERING: Loading spinner', { isLoading, isAuthenticated })
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Auth passed - render dashboard
  console.log('[Dashboard Layout] RENDERING: Dashboard content')
  return (
    <DashboardLayout>
      {isStaticExport ? (
        <ClientOnly fallback={<div />}>{children}</ClientOnly>
      ) : (
        children
      )}
    </DashboardLayout>
  )
}
