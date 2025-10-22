'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, DollarSign, Calculator } from 'lucide-react'

interface FeeStructure {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'tiered'
  value: number
  min_fee?: number
  max_fee?: number
  applicable_to: string[]
  active: boolean
}

export default function FeesPage() {
  const [fees] = useState<FeeStructure[]>([
    { id: '1', name: 'Credit Card Fee', type: 'percentage', value: 2.0, min_fee: 10, max_fee: 1000, applicable_to: ['credit_card'], active: true },
    { id: '2', name: 'UPI Fee', type: 'fixed', value: 5, applicable_to: ['upi'], active: true },
    { id: '3', name: 'Net Banking Fee', type: 'percentage', value: 1.5, min_fee: 5, applicable_to: ['netbanking'], active: true },
    { id: '4', name: 'Wallet Fee', type: 'percentage', value: 1.0, max_fee: 500, applicable_to: ['wallet'], active: false }
  ])

  const formatFeeValue = (fee: FeeStructure) => {
    if (fee.type === 'percentage') {
      return `${fee.value}%`
    }
    return `₹${fee.value}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Fee Configuration</h1>
            <p className="text-sm text-gray-400">Manage fee structures, tiers, and rate mappings</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/60 border border-gray-300 rounded-lg text-sm text-gray-300 hover:text-gray-900 transition-all">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Fee</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-6 hover:bg-white/70 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    fee.active ? 'bg-gradient-to-tr from-green-500 to-green-600' : 'bg-gray-100'
                  }`}>
                    <DollarSign className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{fee.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fee.active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-gray-300/20 text-gray-400 border border-gray-400/30'
                      }`}>
                        {fee.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100/50 rounded text-xs text-gray-300">
                        {fee.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Value:</span>
                        <span className="text-gray-900 ml-2 font-medium">{formatFeeValue(fee)}</span>
                      </div>
                      {fee.min_fee && (
                        <div>
                          <span className="text-gray-400">Min:</span>
                          <span className="text-gray-900 ml-2">₹{fee.min_fee}</span>
                        </div>
                      )}
                      {fee.max_fee && (
                        <div>
                          <span className="text-gray-400">Max:</span>
                          <span className="text-gray-900 ml-2">₹{fee.max_fee}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Applies to:</span>
                        <span className="text-gray-900 ml-2">{fee.applicable_to.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
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
