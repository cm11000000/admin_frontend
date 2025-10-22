'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { resolveUserName } from '@/lib/utils'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [userName, setUserName] = useState('User') // Default to 'User' to prevent layout shift

  useEffect(() => {
    const resolved = resolveUserName()
    setUserName(resolved || 'User')
  }, [])

  return (
    <header className="h-[60px] pt-safe-top bg-white/98 backdrop-blur-xl border-b border-gray-200/80 fixed top-0 left-0 right-0 z-[100] shadow-sm md:left-64 transition-all duration-300">
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5CBBF6] via-[#FF9933] to-[#5CBBF6] opacity-40"></div>

      <div className="h-full flex items-center px-4 md:px-6">
        {/* Mobile Menu Button - Enhanced Vibrant Design */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden group relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-white via-white to-blue-50/30 hover:from-[#FF9933]/8 hover:to-[#5CBBF6]/8 border border-gray-200 hover:border-[#5CBBF6]/40 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700 group-hover:text-[#5CBBF6] transition-colors duration-300" />
        </button>

        {/* Empty Middle Section - Spacer */}
        <div className="flex-1"></div>

        {/* User Section - Professional Vibrant Design */}
        <div className="flex items-center">
          <div className="group relative flex items-center gap-3 px-4 py-2.5 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-md hover:shadow-lg transition-all duration-300 min-w-[160px] hover:border-[#5CBBF6]/40">
            {/* Status Indicator with Enhanced Glow */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full shadow-lg shadow-emerald-500/60 ring-2 ring-white"></div>
            </div>

            {/* User Name with Professional Typography */}
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] leading-none mb-1">
                Admin
              </span>
              <h4 className="text-sm font-bold text-gray-900 truncate leading-none group-hover:text-[#5CBBF6] transition-colors duration-300 tracking-tight">
                {userName}
              </h4>
            </div>

            {/* Vibrant Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#5CBBF6] via-[#FF9933] to-[#5CBBF6] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
          </div>
        </div>
      </div>
    </header>
  )
}
