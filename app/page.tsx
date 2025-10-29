'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

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

  // Show loading spinner while redirecting (prevents white screen)
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  )
}
