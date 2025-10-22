'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Users, UserCheck, UserX, RefreshCw, Search, Mail, Shield } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  active: boolean
  last_login: string
}

export default function UsersPage() {
  const [users] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', role: 'Admin', department: 'IT', active: true, last_login: '2024-03-15 10:30' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211', role: 'Manager', department: 'Operations', active: true, last_login: '2024-03-14 15:45' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+91 9876543212', role: 'Viewer', department: 'Finance', active: false, last_login: '2024-03-10 09:00' }
  ])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    inactive: users.filter(u => !u.active).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">User Management</h1>
            <p className="text-sm text-gray-600">Manage system users, roles and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-red-500/10">
                <UserX className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.inactive}</div>
            <div className="text-xs text-gray-600">Inactive</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{user.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>{user.role}</span>
                        </div>
                        <span>•</span>
                        <span>{user.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.active
                        ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                        : 'bg-red-500/20 text-red-600 border border-red-500/30'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
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
