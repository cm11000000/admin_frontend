'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Link2, Search, Filter, ArrowRight, CheckCircle, Copy } from 'lucide-react'

interface FieldMapping {
  id: string
  name: string
  source_system: string
  target_system: string
  source_field: string
  target_field: string
  transformation?: string
  data_type: string
  mandatory: boolean
  default_value?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function MappersPage() {
  const [mappings] = useState<FieldMapping[]>([
    { id: '1', name: 'Payment Gateway - Success Response', source_system: 'Gateway A', target_system: 'Core System', source_field: 'txn_status', target_field: 'transaction_status', transformation: 'uppercase', data_type: 'string', mandatory: true, active: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '2', name: 'Payment Gateway - Amount', source_system: 'Gateway A', target_system: 'Core System', source_field: 'amount', target_field: 'transaction_amount', transformation: 'divide_100', data_type: 'decimal', mandatory: true, active: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '3', name: 'Payment Gateway - Customer ID', source_system: 'Gateway A', target_system: 'Core System', source_field: 'cust_id', target_field: 'customer_reference', data_type: 'string', mandatory: true, active: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '4', name: 'Settlement - Merchant Code', source_system: 'Core System', target_system: 'Settlement Engine', source_field: 'merchant_id', target_field: 'merchant_code', data_type: 'string', mandatory: true, active: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '5', name: 'Settlement - Net Amount', source_system: 'Core System', target_system: 'Settlement Engine', source_field: 'net_amount', target_field: 'settlement_amount', data_type: 'decimal', mandatory: true, active: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '6', name: 'Refund - Original Transaction', source_system: 'Refund System', target_system: 'Core System', source_field: 'orig_txn_id', target_field: 'parent_transaction_id', data_type: 'string', mandatory: true, active: true, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '7', name: 'Analytics - Revenue', source_system: 'Core System', target_system: 'Analytics', source_field: 'total_revenue', target_field: 'revenue_amount', transformation: 'round_2', data_type: 'decimal', mandatory: false, default_value: '0.00', active: false, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  ])

  const [selectedSourceSystem, setSelectedSourceSystem] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const sourceSystems = ['ALL', ...Array.from(new Set(mappings.map(m => m.source_system)))]

  const filteredMappings = mappings.filter(mapping => {
    const matchesSystem = selectedSourceSystem === 'ALL' || mapping.source_system === selectedSourceSystem
    const matchesSearch = searchTerm === '' ||
      mapping.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.source_field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.target_field.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSystem && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Field Mappers</h1>
            <p className="text-sm text-gray-400">Configure field mappings between systems and data transformations</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/60 border border-gray-300 rounded-lg text-sm text-gray-300 hover:text-gray-900 transition-all">
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add Mapping</span>
            </button>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Mappings</p>
                  <p className="text-2xl font-bold text-gray-900">{mappings.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active</p>
                  <p className="text-2xl font-bold text-green-400">{mappings.filter(m => m.active).length}</p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Source Systems</p>
                  <p className="text-2xl font-bold text-gray-900">{sourceSystems.length - 1}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Mandatory</p>
                  <p className="text-2xl font-bold text-orange-400">{mappings.filter(m => m.mandatory).length}</p>
                </div>
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or field..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {sourceSystems.map(system => (
                <button
                  key={system}
                  onClick={() => setSelectedSourceSystem(system)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSourceSystem === system
                      ? 'bg-orange-500 text-gray-900'
                      : 'bg-gray-50/50 text-gray-300 border border-gray-200/50 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {system}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredMappings.map((mapping) => (
              <div
                key={mapping.id}
                className="bg-gray-50/50 rounded-xl border border-gray-200/50 p-4 md:p-6 hover:bg-gray-50/70 hover:border-gray-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{mapping.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            mapping.active
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-300/20 text-gray-400 border border-gray-400/30'
                          }`}>
                            {mapping.active ? 'Active' : 'Inactive'}
                          </span>
                          {mapping.mandatory && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-medium">
                              Mandatory
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                            {mapping.data_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/50 rounded-lg p-3 border border-gray-200/30">
                        <p className="text-xs text-gray-400 mb-1">Source System</p>
                        <p className="text-sm font-medium text-gray-900 mb-2">{mapping.source_system}</p>
                        <p className="text-xs text-gray-500 mb-1">Field</p>
                        <code className="text-xs text-green-400 bg-gray-50/50 px-2 py-1 rounded">
                          {mapping.source_field}
                        </code>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <ArrowRight className="w-5 h-5 text-orange-400" />
                          {mapping.transformation && (
                            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-1">
                              <p className="text-xs text-orange-400 font-medium">{mapping.transformation}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/50 rounded-lg p-3 border border-gray-200/30">
                        <p className="text-xs text-gray-400 mb-1">Target System</p>
                        <p className="text-sm font-medium text-gray-900 mb-2">{mapping.target_system}</p>
                        <p className="text-xs text-gray-500 mb-1">Field</p>
                        <code className="text-xs text-blue-400 bg-gray-50/50 px-2 py-1 rounded">
                          {mapping.target_field}
                        </code>
                      </div>
                    </div>

                    {mapping.default_value && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Default Value:</span>
                        <code className="text-xs text-gray-300 bg-white/50 px-2 py-1 rounded">
                          {mapping.default_value}
                        </code>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors">
                      <Copy className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMappings.length === 0 && (
            <div className="text-center py-12">
              <Link2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mappings found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set(mappings.map(m => m.source_system))).map((sourceSystem) => {
              const systemMappings = mappings.filter(m => m.source_system === sourceSystem)
              const targetSystems = Array.from(new Set(systemMappings.map(m => m.target_system)))
              const activeMappings = systemMappings.filter(m => m.active).length

              return (
                <div key={sourceSystem} className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{sourceSystem}</h3>
                      <p className="text-xs text-gray-400">{systemMappings.length} mappings</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Active</span>
                      <span className="text-green-400 font-medium">{activeMappings}/{systemMappings.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Target Systems</span>
                      <span className="text-gray-900 font-medium">{targetSystems.length}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200/50">
                      <p className="text-xs text-gray-500 mb-1">Targets:</p>
                      <div className="flex flex-wrap gap-1">
                        {targetSystems.map(target => (
                          <span key={target} className="px-2 py-0.5 bg-gray-100/50 text-gray-300 rounded text-xs">
                            {target}
                          </span>
                        ))}
                      </div>
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
