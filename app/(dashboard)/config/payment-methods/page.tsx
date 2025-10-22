'use client'

import React, { useState } from 'react'
import { CreditCard, Smartphone, Building2, Wallet, Plus, Settings, RefreshCw } from 'lucide-react'
import StatusToggle from '@/components/config/StatusToggle'

interface PaymentMethod {
  id: string
  name: string
  type: string
  icon: any
  enabled: boolean
  priority: number
  fee_percentage: number
  min_amount?: number
  max_amount?: number
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Credit Card', type: 'card', icon: CreditCard, enabled: true, priority: 1, fee_percentage: 2.0, min_amount: 100, max_amount: 100000 },
    { id: '2', name: 'Debit Card', type: 'card', icon: CreditCard, enabled: true, priority: 2, fee_percentage: 1.5, min_amount: 100, max_amount: 100000 },
    { id: '3', name: 'UPI', type: 'upi', icon: Smartphone, enabled: true, priority: 3, fee_percentage: 0.5, min_amount: 10, max_amount: 100000 },
    { id: '4', name: 'Net Banking', type: 'netbanking', icon: Building2, enabled: true, priority: 4, fee_percentage: 1.0, min_amount: 500, max_amount: 500000 },
    { id: '5', name: 'Wallet', type: 'wallet', icon: Wallet, enabled: false, priority: 5, fee_percentage: 1.5, min_amount: 10, max_amount: 50000 }
  ])

  const handleToggle = (id: string, enabled: boolean) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled } : m))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Payment Methods</h1>
            <p className="text-sm text-gray-400">Configure payment method settings and priorities</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/60 border border-gray-300 rounded-lg text-sm text-gray-300 hover:text-gray-900 transition-all">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Method</span>
            </button>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 overflow-hidden">
          <div className="divide-y divide-gray-200/50">
            {methods.map((method) => {
              const Icon = method.icon
              return (
                <div key={method.id} className="p-6 hover:bg-gray-100/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-900" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{method.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          <span>Priority: {method.priority}</span>
                          <span>•</span>
                          <span>Fee: {method.fee_percentage}%</span>
                          {method.min_amount && (
                            <>
                              <span>•</span>
                              <span>Min: ₹{method.min_amount}</span>
                            </>
                          )}
                          {method.max_amount && (
                            <>
                              <span>•</span>
                              <span>Max: ₹{method.max_amount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusToggle
                        checked={method.enabled}
                        onCheckedChange={(enabled) => handleToggle(method.id, enabled)}
                        confirmationMessage={`Are you sure you want to ${method.enabled ? 'disable' : 'enable'} ${method.name}?`}
                        variant="success"
                      />
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
