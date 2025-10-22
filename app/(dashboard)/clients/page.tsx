'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Users,
  Building2,
  DollarSign,
  Upload,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Client {
  id: string
  client_code: string
  client_name: string
  client_email: string
  client_contact: string
  client_address?: string
  client_type: string
  risk_category: number
  active: boolean
  creation_date: string
  total_volume: number
  transaction_count: number
  kyc_status: 'VERIFIED' | 'PENDING' | 'UNDER_REVIEW' | 'REJECTED'
  contact_person?: string
  website?: string
}

interface ClientStats {
  total_clients: number
  active_clients: number
  inactive_clients: number
  total_volume: number
}

export default function ClientsPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [stats, setStats] = useState<ClientStats | null>(null)

  useEffect(() => {
    fetchClients()
    fetchStats()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    // Mock data - replace with actual API call
    setTimeout(() => {
      setClients([
        {
          id: '1',
          client_code: 'CLT001',
          client_name: 'Acme Corporation',
          client_email: 'contact@acme.com',
          client_contact: '+91 9876543210',
          client_type: 'E-commerce',
          risk_category: 2,
          active: true,
          creation_date: '2024-01-15',
          total_volume: 5000000,
          transaction_count: 1250,
          kyc_status: 'VERIFIED',
          contact_person: 'John Doe',
          website: 'https://acme.com'
        },
        {
          id: '2',
          client_code: 'CLT002',
          client_name: 'Bright Education',
          client_email: 'info@brightedu.com',
          client_contact: '+91 9876543211',
          client_type: 'Education',
          risk_category: 1,
          active: true,
          creation_date: '2024-02-20',
          total_volume: 3000000,
          transaction_count: 800,
          kyc_status: 'VERIFIED'
        },
        {
          id: '3',
          client_code: 'CLT003',
          client_name: 'Metro Services',
          client_email: 'admin@metro.com',
          client_contact: '+91 9876543212',
          client_type: 'Utilities',
          risk_category: 3,
          active: false,
          creation_date: '2024-03-10',
          total_volume: 1500000,
          transaction_count: 350,
          kyc_status: 'PENDING'
        }
      ])
      setLoading(false)
    }, 1000)
  }

  const fetchStats = async () => {
    // Mock stats - replace with actual API call
    setStats({
      total_clients: 45,
      active_clients: 38,
      inactive_clients: 7,
      total_volume: 125000000
    })
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.client_email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || client.client_type === filterType
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && client.active) ||
      (filterStatus === 'inactive' && !client.active)

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'UNDER_REVIEW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 2) return 'text-green-400 bg-green-500/20 border-green-500/30'
    if (risk <= 3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    return 'text-red-400 bg-red-500/20 border-red-500/30'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Clients</h1>
            <p className="text-sm text-gray-600">Manage merchant clients and configurations</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-all">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={fetchClients}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total_clients}</div>
              <div className="text-xs text-gray-600">Total Clients</div>
            </div>

            <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.active_clients}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>

            <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.inactive_clients}</div>
              <div className="text-xs text-gray-600">Inactive</div>
            </div>

            <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ₹{(stats.total_volume / 10000000).toFixed(1)}Cr
              </div>
              <div className="text-xs text-gray-600">Total Volume</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 p-3 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, code, email..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="all">All Types</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Education">Education</option>
                <option value="Business">Business</option>
                <option value="Utilities">Utilities</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Cards / Desktop Table */}
        <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KYC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Volume</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-400 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-400 rounded w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 bg-gray-400 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 bg-gray-400 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-400 rounded w-20"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 bg-gray-400 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <div className="w-8 h-8 bg-gray-400 rounded"></div>
                          <div className="w-8 h-8 bg-gray-400 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-200 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.client_name}</div>
                          <div className="text-xs text-gray-500">{client.client_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{client.client_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.kyc_status)}`}>
                        {client.kyc_status === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                        {client.kyc_status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {client.kyc_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getRiskColor(client.risk_category)}`}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {client.risk_category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{formatCurrency(client.total_volume)}</div>
                      <div className="text-xs text-gray-500">{client.transaction_count} txns</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {client.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/clients/${client.id}`)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse space-y-3">
                  <div className="h-5 bg-gray-400 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-400 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-400 rounded w-20"></div>
                    <div className="h-6 bg-gray-400 rounded w-20"></div>
                  </div>
                </div>
              ))
            ) : filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => router.push(`/clients/${client.id}`)}
                className="p-4 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{client.client_name}</h3>
                      <p className="text-sm text-gray-600">{client.client_code}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    client.active
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {client.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type</span>
                    <span className="text-gray-900">{client.client_type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Volume</span>
                    <span className="text-gray-900">{formatCurrency(client.total_volume)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.kyc_status)}`}>
                      {client.kyc_status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getRiskColor(client.risk_category)}`}>
                      Risk: {client.risk_category}
                    </span>
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
