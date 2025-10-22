'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Route, ArrowRight, MoveUp, MoveDown } from 'lucide-react'
import StatusToggle from '@/components/config/StatusToggle'

interface RoutingRule {
  id: string
  name: string
  priority: number
  conditions: string[]
  target_gateway: string
  fallback_gateway?: string
  enabled: boolean
  success_rate: number
}

export default function RoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>([
    {
      id: '1',
      name: 'High Value UPI',
      priority: 1,
      conditions: ['payment_method = UPI', 'amount > 10000'],
      target_gateway: 'Razorpay',
      fallback_gateway: 'Paytm',
      enabled: true,
      success_rate: 98.5
    },
    {
      id: '2',
      name: 'Card Payments',
      priority: 2,
      conditions: ['payment_method = Card'],
      target_gateway: 'HDFC',
      fallback_gateway: 'Razorpay',
      enabled: true,
      success_rate: 97.2
    },
    {
      id: '3',
      name: 'Low Value Transactions',
      priority: 3,
      conditions: ['amount < 500'],
      target_gateway: 'Paytm',
      enabled: false,
      success_rate: 95.8
    }
  ])

  const handleToggle = (id: string, enabled: boolean) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Routing Rules</h1>
            <p className="text-sm text-gray-400">Configure smart routing and load balancing</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Rule</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-6 hover:bg-white/70 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-gray-900 font-bold">{rule.priority}</span>
                  </div>
                  <Route className="w-5 h-5 text-orange-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.enabled
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-300/20 text-gray-400 border border-gray-400/30'
                    }`}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium">
                      {rule.success_rate}% Success
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div>
                      <span className="text-xs text-gray-500">Conditions:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {rule.conditions.map((condition, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100/50 rounded text-xs text-gray-300"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Route to:</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-medium">
                        {rule.target_gateway}
                      </span>
                      {rule.fallback_gateway && (
                        <>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400">Fallback:</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs font-medium">
                            {rule.fallback_gateway}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center gap-2">
                  <button
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === rules.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors disabled:opacity-30"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <StatusToggle
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => handleToggle(rule.id, enabled)}
                    size="sm"
                    variant="success"
                  />
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
