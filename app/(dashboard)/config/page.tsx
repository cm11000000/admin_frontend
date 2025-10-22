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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Configuration Center</h1>
          <p className="text-sm text-gray-400">Manage system settings, policies, and integrations</p>
        </div>

        {/* Configuration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {configCategories.map((category) => {
            const Icon = category.icon
            return (
              <button
                key={category.title}
                onClick={() => router.push(category.href)}
                className="group bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 hover:bg-white/70 transition-all duration-300 hover:border-gray-300/50 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-tr ${category.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(category.status)}
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-400 transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{category.stats}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.status === 'healthy'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {category.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-300 hover:text-gray-900 hover:border-gray-300/50 transition-all">
              <Database className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-medium">Add Gateway</div>
                <div className="text-xs text-gray-500">Configure new payment gateway</div>
              </div>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-300 hover:text-gray-900 hover:border-gray-300/50 transition-all">
              <Shield className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-medium">Create Fee Structure</div>
                <div className="text-xs text-gray-500">Set up new fee tiers</div>
              </div>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-xl text-gray-300 hover:text-gray-900 hover:border-gray-300/50 transition-all">
              <Route className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-medium">Add Routing Rule</div>
                <div className="text-xs text-gray-500">Configure smart routing</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
