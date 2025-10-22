'use client'

import React, { useState } from 'react'
import { Users, Menu, Save, Search, CheckSquare, Square } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface MenuAssignment {
  userId: string
  menuIds: string[]
}

export default function DynamicMenuPage() {
  const [users] = useState<User[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Manager' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer' }
  ])

  const [menuItems] = useState([
    { id: '1', name: 'Dashboard', icon: 'Home' },
    { id: '2', name: 'Transactions', icon: 'CreditCard' },
    { id: '3', name: 'Reports', icon: 'BarChart' },
    { id: '4', name: 'Settings', icon: 'Settings' },
    { id: '5', name: 'Users', icon: 'Users' }
  ])

  const [selectedUser, setSelectedUser] = useState<string>('')
  const [assignedMenus, setAssignedMenus] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId)
    // In real implementation, fetch assigned menus for this user
    setAssignedMenus(['1', '2']) // Example
  }

  const toggleMenu = (menuId: string) => {
    setAssignedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const handleSave = () => {
    console.log('Saving menu assignment:', { userId: selectedUser, menuIds: assignedMenus })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Dynamic Menu Assignment</h1>
            <p className="text-sm text-gray-400">Assign menu items to specific users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="space-y-4">
            <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 overflow-hidden">
              <div className="p-4 border-b border-gray-200/50">
                <h2 className="text-lg font-semibold text-gray-900">Select User</h2>
              </div>
              <div className="divide-y divide-gray-200/50 max-h-[500px] overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedUser === user.id
                        ? 'bg-orange-500/20 border-l-4 border-orange-500'
                        : 'hover:bg-gray-100/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-tr from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{user.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{user.email}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{user.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Assignment */}
          <div className="space-y-4">
            <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 overflow-hidden">
              <div className="p-4 border-b border-gray-200/50">
                <h2 className="text-lg font-semibold text-gray-900">Assign Menu Items</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedUser ? `Configuring menus for selected user` : 'Select a user to configure menus'}
                </p>
              </div>
              <div className="p-4 space-y-3">
                {!selectedUser ? (
                  <div className="text-center py-12 text-gray-400">
                    <Menu className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Please select a user from the list</p>
                  </div>
                ) : (
                  <>
                    {menuItems.map((menu) => (
                      <div
                        key={menu.id}
                        onClick={() => toggleMenu(menu.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          assignedMenus.includes(menu.id)
                            ? 'bg-orange-500/10 border-orange-500/50 hover:bg-orange-500/20'
                            : 'bg-gray-50/40 border-gray-300 hover:bg-gray-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {assignedMenus.includes(menu.id) ? (
                            <CheckSquare className="w-5 h-5 text-orange-400" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">{menu.name}</h3>
                            <p className="text-xs text-gray-400">Menu Item</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4">
                      <button
                        onClick={handleSave}
                        disabled={!selectedUser}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        Save Menu Assignment
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
