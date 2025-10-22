'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Database, Search, Filter, CheckCircle, XCircle, X, Save } from 'lucide-react'

interface MasterData {
  id: string
  category: string
  code: string
  name: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

type MasterType = 'Aggregator' | 'Payment Mode' | 'Payment Status' | 'Category'

export default function MastersPage() {
  const [masters] = useState<MasterData[]>([
    { id: '1', category: 'Payment Status', code: 'SUCCESS', name: 'Payment Successful', isActive: true, order: 1, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '2', category: 'Payment Status', code: 'FAILED', name: 'Payment Failed', isActive: true, order: 2, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '3', category: 'Payment Status', code: 'PENDING', name: 'Payment Pending', isActive: true, order: 3, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '4', category: 'Payment Mode', code: 'UPI', name: 'UPI Payment', isActive: true, order: 1, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '5', category: 'Payment Mode', code: 'CARD', name: 'Card Payment', isActive: true, order: 2, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '6', category: 'Payment Mode', code: 'NETBANKING', name: 'Net Banking', isActive: true, order: 3, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '7', category: 'Aggregator', code: 'AGG1', name: 'Primary Aggregator', isActive: true, order: 1, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '8', category: 'Aggregator', code: 'AGG2', name: 'Secondary Aggregator', isActive: false, order: 2, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '9', category: 'Category', code: 'CAT1', name: 'E-Commerce', isActive: true, order: 1, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
    { id: '10', category: 'Category', code: 'CAT2', name: 'Government', isActive: true, order: 2, createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  ])

  const [selectedMasterType, setSelectedMasterType] = useState<MasterType>('Aggregator')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterData | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    isActive: true
  })

  const masterTypes: MasterType[] = ['Aggregator', 'Payment Mode', 'Payment Status', 'Category']

  const filteredMasters = masters.filter(master => {
    const matchesType = master.category === selectedMasterType
    const matchesSearch = searchTerm === '' ||
      master.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      master.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleOpenModal = (item?: MasterData) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        code: item.code,
        name: item.name,
        isActive: item.isActive
      })
    } else {
      setEditingItem(null)
      setFormData({
        code: '',
        name: '',
        isActive: true
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({ code: '', name: '', isActive: true })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Saving master:', { ...formData, type: selectedMasterType })
    handleCloseModal()
  }

  const stats = {
    total: masters.filter(m => m.category === selectedMasterType).length,
    active: masters.filter(m => m.category === selectedMasterType && m.isActive).length,
    inactive: masters.filter(m => m.category === selectedMasterType && !m.isActive).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Master Detail Management</h1>
            <p className="text-sm text-gray-400">Manage system master data configuration</p>
          </div>
        </div>

        {/* Master Type Selector */}
        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-300 min-w-fit">Master Type:</label>
            <select
              value={selectedMasterType}
              onChange={(e) => setSelectedMasterType(e.target.value as MasterType)}
              className="flex-1 px-4 py-2.5 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              {masterTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Inactive</p>
                <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
              </div>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{selectedMasterType} List</h2>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New</span>
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Is Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMasters.map((master) => (
                  <tr
                    key={master.id}
                    className="border-b border-gray-200/30 hover:bg-gray-100/20 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm">
                      <span className="font-mono text-gray-900 font-medium">{master.code}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{master.name}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        master.isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {master.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(master)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMasters.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-400 text-sm">No {selectedMasterType.toLowerCase()} records match your search</p>
            </div>
          )}
        </div>

        {/* CRUD Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200/50 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Edit' : 'Add New'} {selectedMasterType}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Enter code"
                    className="w-full px-3 py-2.5 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    className="w-full px-3 py-2.5 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50/40 rounded-lg border border-gray-200/50">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 bg-gray-50/60 text-orange-500 focus:ring-orange-500/50"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-300 cursor-pointer">
                    Is Active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 bg-gray-100/50 text-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
