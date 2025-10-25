'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Database,
  CreditCard,
  Shield,
  Route,
  FileText,
  ChevronRight,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function ConfigPage() {
  const router = useRouter()

  const configCategories = [
    {
      title: 'Gateways',
      description: 'Payment gateway configuration and monitoring',
      icon: Database,
      gradient: 'from-blue-500 to-blue-600',
      href: '/config/gateways',
      stats: '5 Active',
      status: 'healthy'
    },
    {
      title: 'Payment Methods',
      description: 'Configure payment method settings and priorities',
      icon: CreditCard,
      gradient: 'from-purple-500 to-purple-600',
      href: '/config/payment-methods',
      stats: '12 Methods',
      status: 'healthy'
    },
    {
      title: 'Fees',
      description: 'Fee structures, tiers, and rate mappings',
      icon: Shield,
      gradient: 'from-green-500 to-green-600',
      href: '/config/fees',
      stats: '8 Structures',
      status: 'healthy'
    },
    {
      title: 'Routing',
      description: 'Smart routing rules and load balancing',
      icon: Route,
      gradient: 'from-orange-500 to-orange-600',
      href: '/config/routing',
      stats: '15 Rules',
      status: 'healthy'
    },
    {
      title: 'Templates',
      description: 'Email, SMS, and notification templates',
      icon: FileText,
      gradient: 'from-pink-500 to-pink-600',
      href: '/config/templates',
      stats: '24 Templates',
      status: 'warning'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default:
        return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            Configuration Center
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Manage system settings, policies, and integrations
          </p>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {configCategories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.title}
              onClick={() => router.push(category.href)}
              className="group bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 md:p-5 hover:shadow-2xl transition-all duration-300 text-left min-h-[44px] touch-manipulation"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr ${category.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(category.status)}
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 transition-colors" />
                </div>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-400 transition-colors">
                {category.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{category.stats}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  category.status === 'healthy'
                    ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'
                }`}>
                  {category.status}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all min-h-[44px] touch-manipulation">
            <Database className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs md:text-sm font-medium">Add Gateway</div>
              <div className="text-[10px] md:text-xs text-gray-500">Configure new payment gateway</div>
            </div>
          </button>
          <button className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all min-h-[44px] touch-manipulation">
            <Shield className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs md:text-sm font-medium">Create Fee Structure</div>
              <div className="text-[10px] md:text-xs text-gray-500">Set up new fee tiers</div>
            </div>
          </button>
          <button className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all min-h-[44px] touch-manipulation">
            <Route className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <div className="text-left">
              <div className="text-xs md:text-sm font-medium">Add Routing Rule</div>
              <div className="text-[10px] md:text-xs text-gray-500">Configure smart routing</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
