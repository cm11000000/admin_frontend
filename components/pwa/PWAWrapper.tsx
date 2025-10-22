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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <OfflineIndicator />
    </>
  )
}
