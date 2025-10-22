'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Key,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Copy
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  kyc_status: string
  contact_person?: string
  website?: string
  configuration?: {
    webhook_url?: string
    success_url?: string
    failure_url?: string
    settlement_cycle?: string
  }
}

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchClientDetails()
  }, [params.id])

  const fetchClientDetails = async () => {
    setLoading(true)
    // Mock data - replace with actual API call
    setTimeout(() => {
      setClient({
        id: params.id as string,
        client_code: 'CLT001',
        client_name: 'Acme Corporation',
        client_email: 'contact@acme.com',
        client_contact: '+91 9876543210',
        client_address: '123 Business Park, Mumbai, Maharashtra 400001',
        client_type: 'E-commerce',
        risk_category: 2,
        active: true,
        creation_date: '2024-01-15',
        total_volume: 5000000,
        transaction_count: 1250,
        kyc_status: 'VERIFIED',
        contact_person: 'John Doe',
        website: 'https://acme.com',
        configuration: {
          webhook_url: 'https://acme.com/webhooks/payment',
          success_url: 'https://acme.com/payment/success',
          failure_url: 'https://acme.com/payment/failure',
          settlement_cycle: 'T+1'
        }
      })
      setLoading(false)
    }, 800)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading || !client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 bg-slate-700/50 rounded w-1/3"></div>
          <div className="h-40 bg-slate-700/50 rounded"></div>
          <div className="h-96 bg-slate-700/50 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 bg-slate-800/60 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{client.client_name}</h1>
              <p className="text-sm text-slate-400">{client.client_code}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-600 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-500 transition-all">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${
                client.active ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {client.active ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
            <div className="text-sm font-medium text-white mb-1">
              {client.active ? 'Active' : 'Inactive'}
            </div>
            <div className="text-xs text-slate-400">Status</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="text-sm font-medium text-white mb-1">{client.kyc_status}</div>
            <div className="text-xs text-slate-400">KYC Status</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="text-sm font-medium text-white mb-1">
              {formatCurrency(client.total_volume)}
            </div>
            <div className="text-xs text-slate-400">Total Volume</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <div className="text-sm font-medium text-white mb-1">
              {client.transaction_count.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Transactions</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-700/50 px-4">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-4 overflow-x-auto">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="configuration"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3"
                >
                  Configuration
                </TabsTrigger>
                <TabsTrigger
                  value="fees"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3"
                >
                  Fees
                </TabsTrigger>
                <TabsTrigger
                  value="api-keys"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3"
                >
                  API Keys
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3"
                >
                  Logs
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">Email:</span>
                        <span className="text-white">{client.client_email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-white">{client.client_contact}</span>
                      </div>
                      {client.website && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-400">Website:</span>
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                            {client.website}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">Created:</span>
                        <span className="text-white">{formatDate(client.creation_date)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">Type:</span>
                        <span className="text-white">{client.client_type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <AlertTriangle className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-400">Risk Category:</span>
                        <span className="text-white">Level {client.risk_category}</span>
                      </div>
                    </div>
                  </div>
                  {client.client_address && (
                    <div className="mt-4">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                        <div>
                          <span className="text-slate-400">Address:</span>
                          <p className="text-white mt-1">{client.client_address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transaction Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Transaction Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-xs text-slate-400 mb-1">Total Volume</div>
                      <div className="text-xl font-semibold text-white">{formatCurrency(client.total_volume)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-xs text-slate-400 mb-1">Transactions</div>
                      <div className="text-xl font-semibold text-white">{client.transaction_count.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-xs text-slate-400 mb-1">Avg Transaction</div>
                      <div className="text-xl font-semibold text-white">
                        {formatCurrency(client.total_volume / client.transaction_count)}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="configuration" className="mt-0 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Integration Settings</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-sm text-slate-400 mb-2">Webhook URL</div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm text-white font-mono truncate flex-1">
                          {client.configuration?.webhook_url || 'Not configured'}
                        </code>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-sm text-slate-400 mb-2">Success URL</div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm text-white font-mono truncate flex-1">
                          {client.configuration?.success_url || 'Not configured'}
                        </code>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-sm text-slate-400 mb-2">Failure URL</div>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm text-white font-mono truncate flex-1">
                          {client.configuration?.failure_url || 'Not configured'}
                        </code>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="text-sm text-slate-400 mb-2">Settlement Cycle</div>
                      <div className="text-sm text-white">
                        {client.configuration?.settlement_cycle || 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fees" className="mt-0">
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-2">Fee configuration for this client</div>
                  <p className="text-sm text-slate-500">Configure custom fee structures and rates</p>
                </div>
              </TabsContent>

              <TabsContent value="api-keys" className="mt-0">
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-2">API keys and credentials</div>
                  <button className="mt-4 flex items-center gap-2 px-4 py-2 mx-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
                    <Key className="w-4 h-4" />
                    <span>Generate New API Key</span>
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-0">
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-2">Activity logs and audit trail</div>
                  <p className="text-sm text-slate-500">View all client activities and changes</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

