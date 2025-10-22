'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import ClientOnly from '@/components/providers/ClientOnly'
import { resolveUserName } from '@/lib/utils'

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'
  const refreshTimer = useRef<number | null>(null)

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
        const res = await fetch('https://stgcobapi.sabpaisa.in/auth-service/auth/refresh-token', {
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
    // DEV BYPASS: Skip login and inject token + username for all dashboard routes
    // Remove/disable this when enabling real login.
    // No dev bypass. Enforce real login via /login page.
    // Normalize and persist the current username using a single resolver
    try {
      if (typeof window !== 'undefined') {
        const resolved = resolveUserName()
        if (resolved && localStorage.getItem('userName') !== resolved) {
          localStorage.setItem('userName', resolved)
        }
      }
    } catch {}

    // Auth protection - Matching Angular's AuthGuard implementation
    // Angular checks: sessionStorage.getItem('RatingUser') in isLoggedIn()
    // Also uses localStorage for 'accessToken'

    const checkLogin = (): boolean => {
      // Check for accessToken in localStorage (matches Angular line 193-194)
      const accessToken = localStorage.getItem('accessToken')

      // Also check legacy token keys for backward compatibility
      const legacyAccessToken = localStorage.getItem('access_token')

      // Check sessionStorage for user bean (matches Angular sessionStorage usage)
      const bean = sessionStorage.getItem('bean')
      const loginedUser = sessionStorage.getItem('loginedUser')

      // User is logged in if they have either:
      // 1. accessToken in localStorage (primary check, matching Angular)
      // 2. User bean in sessionStorage (Angular stores this on login)
      return !!(accessToken || legacyAccessToken || bean || loginedUser)
    }

    const isLoggedIn = checkLogin()

    if (!isLoggedIn) {
      // No valid auth found, redirect to login with returnUrl
      // Matches Angular: this.router.navigate(['/login'], { queryParams: { returnUrl: url } })
      const returnUrl = encodeURIComponent(pathname)
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    // Proactive refresh cycle based on token exp instead of hard logout
    scheduleProactiveRefresh()

  }, [router, pathname])

  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        window.clearTimeout(refreshTimer.current)
      }
    }
  }, [])

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
