'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, X } from 'lucide-react'
import { resolveUserName } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

interface MenuItem {
  id: number
  name: string
  icon: string | null
  url: string
  order: number
  submenus: any[]
}

// HARDCODED: Exact response from https://cobawsapi.sabpaisa.in/get-menu-list/
// This matches Angular adminportalfrontend production menu structure
// All users have full access (no permission checks)
const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Transaction Summary",
    icon: null,
    url: "/dashboard",
    order: 1,
    submenus: []
  },
  {
    id: 2,
    name: "Transaction History",
    icon: null,
    url: "/transactions",
    order: 2,
    submenus: []
  },
  {
    id: 3,
    name: "Settlement Report",
    icon: null,
    url: "/reports/settlements",
    order: 3,
    submenus: []
  },
  {
    id: 4,
    name: "Refund Report",
    icon: null,
    url: "/reports/view-refunds",
    order: 4,
    submenus: []
  },
  {
    id: 5,
    name: "Chargeback Report",
    icon: null,
    url: "/reports/chargebacks",
    order: 5,
    submenus: []
  },
  {
    id: 501,
    name: "Chargeback Analytics",
    icon: null,
    url: "/chargebacks/analytics",
    order: 5,
    submenus: []
  },
  {
    id: 10,
    name: "Transaction Enquiry",
    icon: null,
    url: "/transactions/enquiry",
    order: 10,
    submenus: []
  },
  {
    id: 11,
    name: "Merchant Refund Requests ",
    icon: null,
    url: "/refunds",
    order: 11,
    submenus: []
  },
  {
    id: 1101,
    name: "Refund Analytics",
    icon: null,
    url: "/refunds/analytics",
    order: 11,
    submenus: []
  },
  {
    id: 13,
    name: "SBI Refund Requests",
    icon: null,
    url: "/refunds/sbi",
    order: 13,
    submenus: []
  },
  {
    id: 16,
    name: "Referral Report",
    icon: null,
    url: "/reports/reseller",
    order: 16,
    submenus: []
  },
  {
    id: 1601,
    name: "Analytics Dashboard",
    icon: null,
    url: "/reports/insights",
    order: 16,
    submenus: []
  },
  {
    id: 1602,
    name: "Endpoint Health",
    icon: null,
    url: "/reports/endpoint-health",
    order: 16,
    submenus: []
  },
  {
    id: 1603,
    name: "Zone Performance",
    icon: null,
    url: "/reports/zone-performance",
    order: 16,
    submenus: []
  },
  {
    id: 1604,
    name: "Referral Trends",
    icon: null,
    url: "/reports/referral-trends",
    order: 16,
    submenus: []
  },
  {
    id: 1605,
    name: "Client Leaderboard",
    icon: null,
    url: "/reports/client-leaderboard",
    order: 16,
    submenus: []
  },
  {
    id: 1606,
    name: "Settlement Aging",
    icon: null,
    url: "/reports/settlement-aging",
    order: 16,
    submenus: []
  },
  {
    id: 1607,
    name: "SBI Card Summary",
    icon: null,
    url: "/reports/sbi-card",
    order: 16,
    submenus: []
  },
  {
    id: 17,
    name: "View Rate Mapping",
    icon: null,
    url: "/config/rate-mapping/view",
    order: 17,
    submenus: []
  },
  {
    id: 18,
    name: "Manage Rate Mapping",
    icon: null,
    url: "/config/rate-mapping/manage",
    order: 18,
    submenus: []
  },
  {
    id: 20,
    name: "Add Rate for New Pay Mode",
    icon: null,
    url: "/config/rate-mapping/add-new",
    order: 20,
    submenus: []
  },
  {
    id: 21,
    name: "Aggregator Swap",
    icon: null,
    url: "/config/rate-mapping/swap",
    order: 21,
    submenus: []
  },
  {
    id: 22,
    name: "Fast Forward Rate Mapping",
    icon: null,
    url: "/config/rate-mapping/clone",
    order: 22,
    submenus: []
  },
  {
    id: 23,
    name: "Transaction Limit",
    icon: null,
    url: "/admin/transaction-limit",
    order: 23,
    submenus: []
  },
  {
    id: 60,
    name: "Exports",
    icon: null,
    url: "/exports",
    order: 25,
    submenus: []
  },
  {
    id: 61,
    name: "Templates",
    icon: null,
    url: "/reports/templates",
    order: 26,
    submenus: []
  },
  {
    id: 36,
    name: "Upload settlement Report",
    icon: null,
    url: "/settlements",
    order: 29,
    submenus: []
  },
  {
    id: 37,
    name: "Disbursement",
    icon: null,
    url: "/settlements/disbursement",
    order: 30,
    submenus: []
  },
  {
    id: 31,
    name: "Latest updates",
    icon: null,
    url: "/admin/latest-updates",
    order: 31,
    submenus: []
  },
  {
    id: 39,
    name: "Add product",
    icon: null,
    url: "/admin/product",
    order: 31,
    submenus: []
  },
  {
    id: 40,
    name: "POC",
    icon: null,
    url: "/admin/poc",
    order: 32,
    submenus: []
  },
  {
    id: 33,
    name: "Authorization",
    icon: null,
    url: "/admin/access-urm",
    order: 33,
    submenus: []
  },
  {
    id: 41,
    name: "New Enc Keys",
    icon: null,
    url: "/admin/generate-key",
    order: 33,
    submenus: []
  }
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const resolved = resolveUserName()
    setUserName(resolved || 'User')
  }, [])

  const handleLogout = async () => {
    try {
      const authService = (await import('@/services/api/AuthApiService')).default
      authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth data
      localStorage.clear()
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      router.push('/login')
    }
  }

  const normalize = (p: string) => (p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p)

  const isActive = (url: string) => {
    const current = normalize(pathname || '')
    const target = normalize(url)

    // Special case: treat "/" as dashboard
    if (target === '/dashboard') {
      return current === '/dashboard' || current === '/'
    }

    // Exact match
    if (current === target) return true

    // If this menu item is a prefix of another menu item's URL,
    // avoid prefix matching to prevent multiple items highlighting
    const hasChildInMenu = menuItems.some(
      (mi) => mi.url !== url && normalize(mi.url).startsWith(target + '/')
    )
    if (hasChildInMenu) return false

    // Otherwise, allow nested routes under this item to keep it highlighted
    return current.startsWith(target + '/')
  }

  // All users have full access - no permission checks
  const visibleMenuItems = menuItems

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] sm:w-[280px] md:w-64
          bg-white border-r border-gray-200/80
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          flex flex-col shadow-xl
        `}
      >
        {/* Logo Header - Glass Card with Dark Background */}
        <div className="m-4 mb-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4 border border-slate-700/50 shadow-lg">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/5 via-transparent to-[#5CBBF6]/5"></div>

            <div className="relative flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center space-x-3 flex-1">
                <img
                  src="/sabpaisa-logo.png"
                  alt="SabPaisa"
                  className="h-8 transition-transform duration-200 hover:scale-105"
                />
              </Link>
              <button
                onClick={onToggle}
                className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable with custom scrollbar */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          <div className="space-y-1">
            {/* Dashboard Section */}
            <div className="mb-5">
              <div className="px-3 mb-2.5 flex items-center gap-2">
                <div className="w-1 h-3 bg-gradient-to-b from-[#FF9933] to-[#FF6600] rounded-full"></div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.1em]">Dashboard</p>
              </div>
              {visibleMenuItems.slice(0, 2).map((item) => {
                const active = isActive(item.url)
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle()
                      }
                    }}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl mb-1
                      text-sm font-medium transition-all duration-300
                      relative overflow-hidden
                      ${
                        active
                          ? 'bg-gradient-to-r from-[#FF9933]/12 to-[#FF9933]/8 text-[#FF9933] shadow-sm'
                          : 'text-gray-700 hover:text-[#FF9933] hover:bg-gradient-to-r hover:from-[#FF9933]/5 hover:to-transparent'
                      }
                    `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#FF9933] to-[#FF6600] rounded-r-full shadow-lg shadow-[#FF9933]/30"></div>
                    )}
                    <span className={`flex-1 ml-1 ${active ? 'font-semibold' : ''}`}>{item.name}</span>
                    {active && (
                      <div className="w-2 h-2 bg-[#FF9933] rounded-full animate-pulse shadow-lg shadow-[#FF9933]/50"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Reports Section */}
            <div className="mb-5">
              <div className="px-3 mb-2.5 flex items-center gap-2">
                <div className="w-1 h-3 bg-gradient-to-b from-[#5CBBF6] to-[#4BA0D8] rounded-full"></div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.1em]">Reports</p>
              </div>
              {visibleMenuItems.slice(2, 6).map((item) => {
                const active = isActive(item.url)
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle()
                      }
                    }}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl mb-1
                      text-sm font-medium transition-all duration-300
                      relative overflow-hidden
                      ${
                        active
                          ? 'bg-gradient-to-r from-[#5CBBF6]/12 to-[#5CBBF6]/8 text-[#5CBBF6] shadow-sm'
                          : 'text-gray-700 hover:text-[#5CBBF6] hover:bg-gradient-to-r hover:from-[#5CBBF6]/5 hover:to-transparent'
                      }
                    `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#5CBBF6] to-[#4BA0D8] rounded-r-full shadow-lg shadow-[#5CBBF6]/30"></div>
                    )}
                    <span className={`flex-1 ml-1 ${active ? 'font-semibold' : ''}`}>{item.name}</span>
                    {active && (
                      <div className="w-2 h-2 bg-[#5CBBF6] rounded-full animate-pulse shadow-lg shadow-[#5CBBF6]/50"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Refunds Section */}
            <div className="mb-5">
              <div className="px-3 mb-2.5 flex items-center gap-2">
                <div className="w-1 h-3 bg-gradient-to-b from-[#FF9933] to-[#FF6600] rounded-full"></div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.1em]">Refunds</p>
              </div>
              {visibleMenuItems.slice(6, 9).map((item) => {
                const active = isActive(item.url)
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle()
                      }
                    }}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl mb-1
                      text-sm font-medium transition-all duration-300
                      relative overflow-hidden
                      ${
                        active
                          ? 'bg-gradient-to-r from-[#FF9933]/12 to-[#FF9933]/8 text-[#FF9933] shadow-sm'
                          : 'text-gray-700 hover:text-[#FF9933] hover:bg-gradient-to-r hover:from-[#FF9933]/5 hover:to-transparent'
                      }
                    `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#FF9933] to-[#FF6600] rounded-r-full shadow-lg shadow-[#FF9933]/30"></div>
                    )}
                    <span className={`flex-1 ml-1 ${active ? 'font-semibold' : ''}`}>{item.name}</span>
                    {active && (
                      <div className="w-2 h-2 bg-[#FF9933] rounded-full animate-pulse shadow-lg shadow-[#FF9933]/50"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Configuration Section */}
            <div className="mb-5">
              <div className="px-3 mb-2.5 flex items-center gap-2">
                <div className="w-1 h-3 bg-gradient-to-b from-[#5CBBF6] to-[#4BA0D8] rounded-full"></div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.1em]">Configuration</p>
              </div>
              {visibleMenuItems.slice(9, 15).map((item) => {
                const active = isActive(item.url)
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle()
                      }
                    }}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl mb-1
                      text-sm font-medium transition-all duration-300
                      relative overflow-hidden
                      ${
                        active
                          ? 'bg-gradient-to-r from-[#5CBBF6]/12 to-[#5CBBF6]/8 text-[#5CBBF6] shadow-sm'
                          : 'text-gray-700 hover:text-[#5CBBF6] hover:bg-gradient-to-r hover:from-[#5CBBF6]/5 hover:to-transparent'
                      }
                    `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#5CBBF6] to-[#4BA0D8] rounded-r-full shadow-lg shadow-[#5CBBF6]/30"></div>
                    )}
                    <span className={`flex-1 ml-1 ${active ? 'font-semibold' : ''}`}>{item.name}</span>
                    {active && (
                      <div className="w-2 h-2 bg-[#5CBBF6] rounded-full animate-pulse shadow-lg shadow-[#5CBBF6]/50"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Administration Section */}
            <div className="mb-5">
              <div className="px-3 mb-2.5 flex items-center gap-2">
                <div className="w-1 h-3 bg-gradient-to-b from-[#FF9933] to-[#FF6600] rounded-full"></div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.1em]">Administration</p>
              </div>
              {visibleMenuItems.slice(15).map((item) => {
                const active = isActive(item.url)
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle()
                      }
                    }}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl mb-1
                      text-sm font-medium transition-all duration-300
                      relative overflow-hidden
                      ${
                        active
                          ? 'bg-gradient-to-r from-[#FF9933]/12 to-[#FF9933]/8 text-[#FF9933] shadow-sm'
                          : 'text-gray-700 hover:text-[#FF9933] hover:bg-gradient-to-r hover:from-[#FF9933]/5 hover:to-transparent'
                      }
                    `}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#FF9933] to-[#FF6600] rounded-r-full shadow-lg shadow-[#FF9933]/30"></div>
                    )}
                    <span className={`flex-1 ml-1 ${active ? 'font-semibold' : ''}`}>{item.name}</span>
                    {active && (
                      <div className="w-2 h-2 bg-[#FF9933] rounded-full animate-pulse shadow-lg shadow-[#FF9933]/50"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User Section - Fixed at Bottom with Vibrant Design */}
        <div className="p-3 pb-safe-bottom border-t border-gray-200/80 bg-gradient-to-t from-slate-50 to-transparent backdrop-blur-sm">
          <div className="relative group">
            <div className="w-full flex items-center space-x-3 px-4 py-3.5 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Avatar with gradient */}
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-[#FF9933] via-[#FF7722] to-[#FF6600] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF9933]/30 ring-2 ring-white">
                  <User className="w-5 h-5 text-white" />
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{userName}</p>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Admin Portal</p>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 group/btn"
                title="Logout"
              >
                <LogOut className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
              </button>
            </div>

            {/* Subtle hover accent */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF9933] via-[#5CBBF6] to-[#FF9933] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
          </div>
        </div>
      </aside>
    </>
  )
}
