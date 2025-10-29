'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import PWA components with no SSR
// NOTE: InstallPrompt is disabled to prevent full-screen backdrop blocking dashboard interactions.
// If needed, enable it only on non-dashboard routes.
const OfflineIndicator = dynamic(
  () => import('./OfflineIndicator').then((mod) => ({ default: mod.OfflineIndicator })),
  { ssr: false }
)

export function PWAWrapper() {
  const [isMounted, setIsMounted] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Enable immediately if offline at mount
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setEnabled(true)
      }
    } catch {}

    // Enable when going offline later
    const goOffline = () => setEnabled(true)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (!isMounted || !enabled) return null

  return <OfflineIndicator />
}
