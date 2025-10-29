'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'

/**
 * Root page - redirects to /dashboard if authenticated, /login otherwise
 * For static export, this is purely client-side navigation
 */
export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  // Show nothing while redirecting
  return null
}
