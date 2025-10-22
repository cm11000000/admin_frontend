'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Settings,
  Activity,
  CheckCircle,
  RefreshCw,
  Search,
  Database,
  Globe,
  TestTube,
  Timer,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts'
import ConfigCard from '@/components/config/ConfigCard'

interface Gateway {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'maintenance'
  environment: 'production' | 'sandbox'
  healthStatus: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
  }
  metrics: {
    successRate: number
    dailyVolume: number
    transactionCount: number
  }
}

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCharts, setShowCharts] = useState(true)

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    setLoading(true)
    // Mock data
    setTimeout(() => {
      setGateways([
        {
          id: '1',
          name: 'Razorpay',
          type: 'UPI',
          status: 'active',
          environment: 'production',
          healthStatus: { status: 'healthy', responseTime: 250 },
          metrics: { successRate: 98.5, dailyVolume: 5000000, transactionCount: 1250 }
        },
        {
          id: '2',
          name: 'Paytm',
          type: 'Wallet',
          status: 'active',
          environment: 'production',
          healthStatus: { status: 'healthy', responseTime: 180 },
          metrics: { successRate: 97.2, dailyVolume: 3000000, transactionCount: 800 }
        },
        {
          id: '3',
          name: 'HDFC Bank',
          type: 'Net Banking',
          status: 'maintenance',
          environment: 'production',
          healthStatus: { status: 'degraded', responseTime: 450 },
          metrics: { successRate: 92.0, dailyVolume: 2000000, transactionCount: 350 }
        }
      ])
      setLoading(false)
    }, 1000)
  }

  // Generate mock chart data
  const generatePerformanceData = () => {
    return gateways.map(gw => ({
      name: gw.name,
      successRate: gw.metrics.successRate,
      responseTime: gw.healthStatus.responseTime,
      transactions: gw.metrics.transactionCount
    }))
  }

  const generateTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return months.map(month => ({
      month,
      volume: Math.floor(Math.random() * 10000000) + 5000000,
      transactions: Math.floor(Math.random() * 2000) + 1000,
      successRate: Math.floor(Math.random() * 10) + 90
    }))
  }

  const filteredGateways = gateways.filter(gw =>
    gw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gw.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
      case 'down':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'maintenance':
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-300/20 text-gray-400 border-gray-400/30'
    }
  }

  const stats = {
    total: gateways.length,
    active: gateways.filter(g => g.status === 'active').length,
    healthy: gateways.filter(g => g.healthStatus.status === 'healthy').length,
    avgResponse: Math.round(gateways.reduce((sum, g) => sum + g.healthStatus.responseTime, 0) / (gateways.length || 1))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Gateway Settings
            </h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
              Manage payment gateways and monitor health status
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{showCharts ? 'Hide' : 'Show'} Charts</span>
            </button>
            <button
              onClick={fetchGateways}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gateway</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-700">Total Gateways</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-[10px] md:text-xs text-gray-600 mt-1">Configured gateways</p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-700">Active</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.active}</div>
            <p className="text-[10px] md:text-xs text-gray-600 mt-1">Currently active</p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-700">Healthy</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.healthy}</div>
            <p className="text-[10px] md:text-xs text-gray-600 mt-1">Health status</p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-xs md:text-sm font-medium text-gray-700">Avg Response</div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-purple-600">{stats.avgResponse}ms</div>
            <p className="text-[10px] md:text-xs text-gray-600 mt-1">Response time</p>
          </div>
        </div>

        {/* Charts Section */}
        {showCharts && !loading && gateways.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Gateway Performance Chart */}
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="p-4 md:p-6 pb-3 border-b border-gray-200">
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Gateway Performance
                </h3>
                <p className="text-xs text-gray-600 mt-1">Success rates and response times</p>
              </div>
              <div className="p-4 md:p-6 pt-4">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generatePerformanceData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar
                        dataKey="successRate"
                        name="Success Rate %"
                        fill="url(#colorOrange)"
                        radius={[8, 8, 0, 0]}
                        barSize={window.innerWidth < 640 ? 30 : 40}
                      />
                      <defs>
                        <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#fb923c" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Transaction Volume Trend */}
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="p-4 md:p-6 pb-3 border-b border-gray-200">
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Volume Trend
                </h3>
                <p className="text-xs text-gray-600 mt-1">Transaction volume over time</p>
              </div>
              <div className="p-4 md:p-6 pt-4">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => {
                          if (typeof value === 'number' && value > 1000) {
                            return `₹${(value / 1000000).toFixed(2)}M`
                          }
                          return value
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        name="Volume"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ fill: '#f97316', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="transactions"
                        name="Transactions"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-3 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search gateways by name or type..."
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-gray-50/60 border border-gray-300 rounded-lg text-sm md:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Gateways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 animate-pulse shadow-lg">
                <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : filteredGateways.length === 0 ? (
            <div className="col-span-full bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl p-8 md:p-12 text-center shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No Gateways Found</h3>
              <p className="text-sm md:text-base text-gray-600">Try adjusting your search or add a new gateway</p>
            </div>
          ) : filteredGateways.map((gateway) => (
            <div
              key={gateway.id}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all group shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center relative ${
                    gateway.environment === 'production'
                      ? 'bg-gradient-to-tr from-orange-500 to-orange-600'
                      : 'bg-gradient-to-tr from-purple-500 to-purple-600'
                  } shadow-md`}>
                    {gateway.environment === 'production' ? (
                      <Globe className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : (
                      <TestTube className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    )}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      gateway.healthStatus.status === 'healthy' ? 'bg-green-500' :
                      gateway.healthStatus.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    } shadow-sm`} />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                      {gateway.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">{gateway.type}</p>
                  </div>
                </div>
                <span className={`text-[10px] md:text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(gateway.status)}`}>
                  {gateway.status}
                </span>
              </div>

              <div className="space-y-2.5 md:space-y-3 mb-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                    Success Rate
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-green-600">{gateway.metrics.successRate}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs md:text-sm text-gray-600 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    Response Time
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-blue-600">{gateway.healthStatus.responseTime}ms</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-xs md:text-sm text-gray-600">Daily Volume</span>
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{formatCurrency(gateway.metrics.dailyVolume)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs md:text-sm text-gray-600">Transactions</span>
                  <span className="text-xs md:text-sm font-semibold text-gray-900">{gateway.metrics.transactionCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-xs md:text-sm font-medium transition-all shadow-md hover:shadow-lg">
                  <TestTube className="w-4 h-4" />
                  <span>Test</span>
                </button>
                <button className="min-h-[44px] px-3 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-lg transition-all shadow-sm">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="min-h-[44px] px-3 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-lg transition-all shadow-sm">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
