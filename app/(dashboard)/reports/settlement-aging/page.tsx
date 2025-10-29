/**
 * Settlement Aging Report - Mobile-First Redesign
 * Enhanced charts with improved mobile responsiveness and visual design
 */
"use client"

import React, { useEffect, useState } from 'react'
import AnalyticsApiService from '@/services/api/AnalyticsApiService'
import ReportApiService from '@/services/api/ReportApiService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
// Recharts is lazy-loaded at runtime to reduce initial bundle
import { Combobox } from '@/components/ui/combobox'
import SingleDateFilterPanel from '@/components/filters/SingleDateFilterPanel'
import { Building2, Calendar, Search, Download, Loader2, BarChart3 } from 'lucide-react'
import { resolveUserName } from '@/lib/utils'

function todayStr() { return new Date().toISOString().split('T')[0] || '' }

export default function SettlementAgingPage() {
  const [Rc, setRc] = useState<any>(null)
  useEffect(() => {
    let mounted = true
    import('recharts').then((mod) => mounted && setRc(mod))
    return () => { mounted = false }
  }, [])
  const [asOfDate, setAsOfDate] = useState<string>(todayStr())
  const [clientCode, setClientCode] = useState<string>('All')
  const [clientList, setClientList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>({ summary: {}, buckets: [], byClient: [] })
  const [userName, setUserName] = useState<string>('')
  const [clientsLoaded, setClientsLoaded] = useState(false)

  // Initialize user info
  useEffect(() => {
    if (typeof window === 'undefined') return
    setUserName(resolveUserName())
  }, [])

  // Lazy load client list when dropdown is opened
  const ensureClients = async () => {
    if (clientsLoaded) return
    if (!userName) return
    try {
      const clients = await ReportApiService.getClientCodeListUSP_Cached(userName)
      setClientList(Array.isArray(clients) ? clients : [])
      setClientsLoaded(true)
    } catch (error) {
      console.error('Failed to fetch client list:', error)
      setClientList([])
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await AnalyticsApiService.settlementAging({ clientCode, asOfDate })
      setData(res || { summary: {}, buckets: [], byClient: [] })
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="pb-3 md:pb-4 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Settlement Aging
        </h1>
        <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
          Unsettled transactions by aging bucket
        </p>
      </div>

      {/* Filters Section */}
      <SingleDateFilterPanel
        title="Filter Options"
        description="Select client (optional) and as-of date"
        dateLabel="As Of Date"
        date={asOfDate}
        onDateChange={setAsOfDate}
        actions={
          <>
            <Button
              onClick={load}
              disabled={loading}
              className="flex-1 sm:flex-none min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden xs:inline">Loading...</span>
                  <span className="xs:hidden">Load</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span className="hidden xs:inline">Load Report</span>
                  <span className="xs:hidden">Load</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => AnalyticsApiService.downloadCsv('/analytics/settlement_aging/', { clientCode, asOfDate }, `settlement_aging_${asOfDate}.csv`)}
              className="flex-1 sm:flex-none min-h-[44px] px-4 md:px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden xs:inline">Export CSV</span>
              <span className="xs:hidden">Export</span>
            </Button>
            <Button
              variant="ghost"
              className="min-h-[44px]"
              onClick={() => { setClientCode('All'); setAsOfDate(todayStr()) }}
            >
              Clear Filters
            </Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
            Client Code
          </label>
          <Combobox
            options={[
              { value: 'All', label: 'All Clients' },
              ...(Array.isArray(clientList) ? clientList.map((client: any) => ({
                value: client.client_code || client.clientCode,
                label: `${client.client_code || client.clientCode} - ${client.client_name || client.clientName}`
              })) : [])
            ]}
            value={clientCode}
            onChange={(value) => setClientCode(value)}
            placeholder="Select Client"
            searchPlaceholder="Search by code or name..."
            onOpenChange={async (open) => {
              if (open && !clientsLoaded) {
                await ensureClients()
              }
            }}
            className="min-h-[44px] touch-manipulation"
          />
        </div>
      </SingleDateFilterPanel>

      {loading ? (
        <div className="flex items-center justify-center py-16 md:py-20 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="relative w-14 h-14 md:w-16 md:h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm md:text-base font-semibold text-gray-900">Loading report...</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      ) : (
        <>
          {/* Aging Buckets Chart */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Settlement Aging Buckets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                {Rc ? (
                  <Rc.ResponsiveContainer width="100%" height="100%">
                    <Rc.BarChart data={data.buckets}>
                      <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <Rc.XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
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
                      <Rc.Bar
                        dataKey="count"
                        name="Transaction Count"
                        fill="url(#colorOrange)"
                        radius={[8, 8, 0, 0]}
                        barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 40}
                      />
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

          {/* By Client Table */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <Building2 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Settlement by Client
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {Array.isArray(data.byClient) && data.byClient.map((r: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm">
                      {r.client_name || r.client_code}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Count:</span>
                        <span className="font-semibold text-gray-900 ml-2">{r.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-gray-900 ml-2">₹{Number(r.amount || 0).toLocaleString()}</span>
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
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Client</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Count</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(data.byClient) && data.byClient.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.client_name || r.client_code}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{r.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">₹{Number(r.amount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
