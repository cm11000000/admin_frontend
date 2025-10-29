/**
 * Referral Trends Dashboard - Mobile-First Redesign
 * Volume and amount analytics for referral codes
 */
'use client'

import React, { useEffect, useState } from 'react'
import AnalyticsApiService from '@/services/api/AnalyticsApiService'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// Recharts is lazy-loaded at runtime to reduce initial bundle
import { RefreshCw, Download, TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type DateRange = { from: string; to: string }

function last7(): DateRange { const e=new Date(); const s=new Date(); s.setDate(e.getDate()-6); const f=(d:Date)=>d.toISOString().split('T')[0]||''; return {from:f(s),to:f(e)} }

export default function ReferralTrendsPage() {
  const [Rc, setRc] = useState<any>(null)
  useEffect(() => {
    let mounted = true
    import('recharts').then((mod) => mounted && setRc(mod))
    return () => { mounted = false }
  }, [])
  const [range, setRange] = useState<DateRange>(last7())
  const [referralCode, setReferralCode] = useState('001996')
  const [groupBy, setGroupBy] = useState<'day'|'month'>('day')
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<any[]>([])
  const [top, setTop] = useState<any[]>([])
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d'>('7d')

  const deriveRange = (rangeType: '7d' | '30d' | '90d') => {
    const now = new Date()
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const to = fmt(now)
    const start = new Date(now)
    if (rangeType === '7d') start.setDate(start.getDate() - 6)
    else if (rangeType === '30d') start.setDate(start.getDate() - 29)
    else if (rangeType === '90d') start.setDate(start.getDate() - 89)
    const from = fmt(start)
    return { from, to }
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await AnalyticsApiService.referralTrends({ referral_code: referralCode, fromDate: range.from, endDate: range.to, groupBy })
      setSeries(data?.timeseries || [])
      setTop(data?.topClients || [])
    } finally { setLoading(false) }
  }

  const handleRangeChange = (rangeType: '7d' | '30d' | '90d') => {
    setSelectedRange(rangeType)
    const newRange = deriveRange(rangeType)
    setRange(newRange)
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Referral Trends
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
            Volume and amount analytics for referral codes
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
            onClick={() => AnalyticsApiService.downloadCsv('/analytics/referral_trends/', { referral_code: referralCode, fromDate: range.from, endDate: range.to, groupBy }, `referral_trends_${range.from}_${range.to}.csv`)}
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
          <p className="text-xs md:text-sm text-gray-600">Enter referral code and date range to view analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Users className="inline-block w-4 h-4 mr-1 text-gray-600" /> Referral Code
            </label>
            <Input
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full min-h-[44px]"
            />
          </div>

          {/* From Date */}
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> From
            </label>
            <DatePicker value={range.from} onChange={(v) => setRange({ ...range, from: v })} placeholder="From date" />
          </div>

          {/* To Date */}
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> To
            </label>
            <DatePicker value={range.to} onChange={(v) => setRange({ ...range, to: v })} placeholder="To date" />
          </div>
        </div>

        {/* Range Selector Buttons */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
          <Button
            variant={selectedRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRangeChange('7d')}
            className={`min-h-[44px] ${selectedRange === '7d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            7 Days
          </Button>
          <Button
            variant={selectedRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRangeChange('30d')}
            className={`min-h-[44px] ${selectedRange === '30d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            30 Days
          </Button>
          <Button
            variant={selectedRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRangeChange('90d')}
            className={`min-h-[44px] ${selectedRange === '90d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            90 Days
          </Button>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <Button
            onClick={load}
            className="min-h-[44px] px-6 md:px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            Apply Filters
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
            <p className="text-sm md:text-base font-semibold text-gray-900">Loading analytics...</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Total Transactions */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {series.reduce((sum, item) => sum + (item.txn_count || 0), 0).toLocaleString()}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Total transaction count
                </p>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {formatCurrency(series.reduce((sum, item) => sum + (item.paid_amount || 0), 0))}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Total paid amount
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeseries Chart */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Transaction Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                {Rc ? (
                  <Rc.ResponsiveContainer width="100%" height="100%">
                    <Rc.LineChart data={series}>
                      <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <Rc.XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-20} textAnchor="end" height={60} />
                      <Rc.YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Rc.Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                      <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Rc.Line type="monotone" dataKey="txn_count" name="Transactions" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
                      <Rc.Line type="monotone" dataKey="paid_amount" name="Amount" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                    </Rc.LineChart>
                  </Rc.ResponsiveContainer>
                ) : (
                  <div className="w-full h-full rounded-lg bg-gray-100 animate-pulse" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Clients Table */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Top Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {top.map((r: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm">
                      {r.client_name}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-semibold text-gray-900 ml-2">{r.txn_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-green-600 ml-2">{formatCurrency(r.paid_amount || 0)}</span>
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
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Client Name</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Transactions</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {top.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.client_name}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{r.txn_count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatCurrency(r.paid_amount || 0)}</td>
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
