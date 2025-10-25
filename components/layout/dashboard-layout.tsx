"use client"

import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Sidebar } from './sidebar'
import { Header } from './header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Swipe gesture handlers - ONLY for mobile devices (< 768px)
  const swipeHandlers = useSwipeable({
    onSwipedRight: (eventData) => {
      // Only on mobile AND only from left edge (< 30px from left)
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        // Check if swipe started from left edge
        const startX = eventData.initial[0]
        if (startX < 30 && !sidebarOpen) {
          setSidebarOpen(true)
        }
      }
    },
    onSwipedLeft: () => {
      // Only on mobile AND only when sidebar is open
      if (typeof window !== 'undefined' && window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false)
      }
    },
    // Critical settings to avoid conflicts
    preventScrollOnSwipe: false, // Allow vertical scrolling and horizontal table scrolling
    trackMouse: false, // Disable on desktop mouse - touch only
    trackTouch: true, // Enable on mobile touch devices
    delta: 50, // Minimum swipe distance in pixels (prevents accidental triggers)
    swipeDuration: 500, // Maximum swipe duration in ms
    touchEventOptions: { passive: true }, // Better scroll performance
  })

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Professional Gradient Background - Inspired by login page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient - Subtle and professional */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"></div>

        {/* Refined grid pattern for texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(148 163 184) 1px, transparent 1px),
                             linear-gradient(to bottom, rgb(148 163 184) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        ></div>

        {/* Professional animated gradient orbs - More subtle */}
        <div className="absolute top-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-br from-[#5CBBF6]/8 to-[#4BA0D8]/5 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-gradient-to-br from-[#FF9933]/8 to-[#FF6600]/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-[24rem] h-[24rem] bg-gradient-to-br from-[#5CBBF6]/5 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        {/* Additional accent orbs for depth */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-br from-[#FF9933]/6 to-transparent rounded-full blur-3xl animate-blob-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-gradient-to-br from-[#5CBBF6]/6 to-transparent rounded-full blur-3xl animate-blob-slow animation-delay-3000"></div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area - Apply swipe handlers here */}
      <div
        {...swipeHandlers}
        className="relative md:ml-64 transition-all duration-300"
      >
        {/* Header - Fixed at top with highest z-index */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content below fixed 60px header */}
        <main className="relative min-h-screen mt-[60px] pt-6 px-4 md:px-6 lg:px-8 pb-8">
          <div className="w-full max-w-full mx-auto" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes blob-slow {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(-30px, 40px) scale(1.05);
          }
          66% {
            transform: translate(40px, -30px) scale(0.95);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        :global(.animate-blob) {
          animation: blob 7s infinite;
        }

        :global(.animate-blob-slow) {
          animation: blob-slow 10s infinite;
        }

        :global(.animation-delay-2000) {
          animation-delay: 2s;
        }

        :global(.animation-delay-3000) {
          animation-delay: 3s;
        }

        :global(.animation-delay-4000) {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
