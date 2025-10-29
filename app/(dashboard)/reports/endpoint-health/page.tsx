/**
 * Endpoint Health Dashboard - Mobile-First Redesign
 * Monitor endpoint performance, transaction counts, and success rates
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react'
import AnalyticsApiService from '@/services/api/AnalyticsApiService'
import DateRangePicker from '@/components/reports/DateRangePicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import FilterPanel from '@/components/filters/FilterPanel'
import { Combobox } from '@/components/ui/combobox'
import ReportApiService from '@/services/api/ReportApiService'
import { resolveUserName } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
// Recharts is lazy-loaded at runtime to reduce initial bundle
import { Activity, TrendingUp, Building2, Calendar, Download, RefreshCw, BarChart3, CheckCircle } from 'lucide-react'

type DateRange = { from: string; to: string }

function last7(): DateRange {
  const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 6)
  const fmt = (d: Date) => d.toISOString().split('T')[0] || ''
  return { from: fmt(start), to: fmt(end) }
}

export default function EndpointHealthPage() {
  const [Rc, setRc] = useState<any>(null)
  useEffect(() => {
    let mounted = true
    import('recharts').then((mod) => mounted && setRc(mod))
    return () => { mounted = false }
  }, [])
  const [range, setRange] = useState<DateRange>(last7())
  const [clientCode, setClientCode] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [userName, setUserName] = useState<string>('')
  const [clients, setClients] = useState<any[]>([])
  const [clientsLoaded, setClientsLoaded] = useState(false)

  useEffect(() => { if (typeof window !== 'undefined') setUserName(resolveUserName()) }, [])

  const ensureClients = useCallback(async () => {
    if (clientsLoaded || !userName) return
    try {
      const list = await ReportApiService.getClientCodeListUSP_Cached(userName)
      setClients(Array.isArray(list) ? list : [])
      setClientsLoaded(true)
    } catch {
      setClients([])
    }
  }, [clientsLoaded, userName])

  const load = async () => {
    setLoading(true)
    try {
      const data = await AnalyticsApiService.endpointHealth({ clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to })
      setRows(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const chartData = rows.map(r => ({ name: r.ep_name || 'NA', txns: r.txn_count, success_rate: r.success_rate }))

  // Calculate summary stats
  const totalTxns = rows.reduce((sum, r) => sum + (r.txn_count || 0), 0)
  const avgSuccessRate = rows.length > 0 ? rows.reduce((sum, r) => sum + (r.success_rate || 0), 0) / rows.length : 0
  const totalEndpoints = rows.length
  const healthyEndpoints = rows.filter(r => (r.success_rate || 0) >= 95).length

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Endpoint Health
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
            Monitor endpoint performance, transactions, and success rates
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            onClick={load}
            disabled={loading}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
            onClick={() => AnalyticsApiService.downloadCsv('/analytics/endpoint_health/', { clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to }, `endpoint_health_${range.from}_${range.to}.csv`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 relative z-20">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-0.5 md:mb-1">Filter Options</h3>
          <p className="text-xs md:text-sm text-gray-600">Select client (optional) and date range</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" /> Client Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Combobox
                  value={clientCode}
                  onChange={(v) => setClientCode(v)}
                  options={[
                    { value: 'ALL', label: 'ALL - All Clients' },
                    ...((Array.isArray(clients) ? clients : []).map((c: any) => ({
                      value: c.client_code || c.clientCode,
                      label: `${c.client_code || c.clientCode} - ${c.client_name || c.clientName || ''}`
                    })))
                  ]}
                  placeholder="Select client (optional)"
                  searchPlaceholder="Search client..."
                  emptyMessage={clientsLoaded ? 'No clients' : 'Open to load clients'}
                  onOpenChange={(open) => { if (open) ensureClients() }}
                  className="min-h-[44px] touch-manipulation"
                />
              </div>
              <button
                type="button"
                onClick={() => setClientCode('ALL')}
                className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700 transition-colors"
              >
                ALL
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> Date Range
            </label>
            <DateRangePicker value={range} onChange={(r) => setRange(r)} variant="orange" helperText="Max 92 days" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 pt-3 border-t border-gray-200">
          <Button
            onClick={load}
            className="min-h-[44px] px-6 md:px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            Search
          </Button>
          <Button
            variant="ghost"
            className="min-h-[44px] px-4 md:px-6 text-gray-700 hover:bg-gray-100"
            onClick={() => { setClientCode('ALL'); setRange(last7()); }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16 md:py-20 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="relative w-14 h-14 md:w-16 md:h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm md:text-base font-semibold text-gray-900">Loading endpoint health...</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Transactions */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {totalTxns.toLocaleString()}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Across all endpoints
                </p>
              </CardContent>
            </Card>

            {/* Average Success Rate */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  Avg Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {avgSuccessRate.toFixed(2)}%
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Overall performance
                </p>
              </CardContent>
            </Card>

            {/* Total Endpoints */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  Total Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {totalEndpoints}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Monitored endpoints
                </p>
              </CardContent>
            </Card>

            {/* Healthy Endpoints */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  Healthy Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-emerald-600">
                  {healthyEndpoints}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Success rate &gt;= 95%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Transaction Count Chart */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Endpoint Transaction Count
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                    <Rc.ResponsiveContainer width="100%" height="100%">
                      <Rc.BarChart data={chartData}>
                        <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <Rc.XAxis
                          dataKey="name"
                          interval={0}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          angle={-35}
                          textAnchor="end"
                          height={70}
                        />
                        <Rc.YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Rc.Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Rc.Bar dataKey="txns" name="Transactions" fill="url(#colorOrange)" radius={[8, 8, 0, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 40} />
                        <defs>
                          <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#fb923c" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                      </Rc.BarChart>
                    </Rc.ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gray-100 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Success Rate Chart */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  Success Rate (%)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                    <Rc.ResponsiveContainer width="100%" height="100%">
                      <Rc.BarChart data={chartData}>
                        <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <Rc.XAxis
                          dataKey="name"
                          interval={0}
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          angle={-35}
                          textAnchor="end"
                          height={70}
                        />
                        <Rc.YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]} />
                        <Rc.Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Rc.Bar dataKey="success_rate" name="Success Rate (%)" fill="url(#colorGreen)" radius={[8, 8, 0, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 40} />
                        <defs>
                          <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#34d399" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                      </Rc.BarChart>
                    </Rc.ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gray-100 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Endpoint Details Table */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold text-gray-900">Endpoint Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {rows.map((row, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm">
                      {row.ep_name || 'N/A'}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-semibold text-gray-900 ml-2">{(row.txn_count || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className={`font-semibold ml-2 ${(row.success_rate || 0) >= 95 ? 'text-green-600' : (row.success_rate || 0) >= 80 ? 'text-orange-600' : 'text-red-600'}`}>
                          {(row.success_rate || 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Endpoint</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Transactions</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Success Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rows.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.ep_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{(row.txn_count || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`font-semibold ${(row.success_rate || 0) >= 95 ? 'text-green-600' : (row.success_rate || 0) >= 80 ? 'text-orange-600' : 'text-red-600'}`}>
                            {(row.success_rate || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${(row.success_rate || 0) >= 95 ? 'bg-green-100 text-green-700' : (row.success_rate || 0) >= 80 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                            {(row.success_rate || 0) >= 95 ? 'Healthy' : (row.success_rate || 0) >= 80 ? 'Warning' : 'Critical'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rows.length === 0 && (
                <div className="text-center py-8 md:py-12">
                  <p className="text-gray-600 text-sm md:text-base">No endpoint data available for the selected filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
