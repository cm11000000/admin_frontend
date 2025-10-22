'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Menu, Eye, EyeOff, Save, X, Search } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  url: string
  icon: string
  parent_id: string | null
  order: number
  active: boolean
  roles: string[]
}

export default function MenuSettingsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Dashboard', url: '/dashboard', icon: 'Home', parent_id: null, order: 1, active: true, roles: ['Admin', 'Manager'] },
    { id: '2', name: 'Transactions', url: '/transactions', icon: 'CreditCard', parent_id: null, order: 2, active: true, roles: ['Admin', 'Manager', 'Viewer'] },
    { id: '3', name: 'Reports', url: '/reports', icon: 'BarChart', parent_id: null, order: 3, active: true, roles: ['Admin', 'Manager'] },
    { id: '4', name: 'Settings', url: '/settings', icon: 'Settings', parent_id: null, order: 4, active: false, roles: ['Admin'] }
  ])
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: '',
    parent_id: '',
    order: '',
    roles: [] as string[]
  })

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Menu item saved:', formData)
    setShowForm(false)
    setFormData({ name: '', url: '', icon: '', parent_id: '', order: '', roles: [] })
  }

  const toggleStatus = (id: string) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Menu Settings</h1>
            <p className="text-sm text-gray-400">Configure menu items and navigation structure</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? 'Cancel' : 'Add Menu Item'}</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Menu Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Menu Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dashboard"
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL Path</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/dashboard"
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Icon Name</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Home"
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Parent Menu (Optional)</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="">None (Top Level)</option>
                    {menuItems.filter(item => !item.parent_id).map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Allowed Roles</label>
                  <div className="flex gap-3 pt-2">
                    {['Admin', 'Manager', 'Viewer'].map(role => (
                      <label key={role} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, roles: [...formData.roles, role] })
                            } else {
                              setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) })
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 bg-gray-50/60 text-orange-500 focus:ring-orange-500/50"
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-100/50 text-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search menu items..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 overflow-hidden">
          <div className="divide-y divide-gray-200/50">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-100/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                      <Menu className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span>{item.url}</span>
                        <span>•</span>
                        <span>Order: {item.order}</span>
                        <span>•</span>
                        <span>{item.roles.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        item.active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      }`}
                    >
                      {item.active ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                      {item.active ? 'Active' : 'Inactive'}
                    </button>
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
    </div>
  )
}
