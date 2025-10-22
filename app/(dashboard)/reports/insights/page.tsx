/**
 * Analytics Insights Dashboard - Mobile-First Redesign
 * Comprehensive insights for trends, mix, funnel and failures
 */
'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import AnalyticsApiService from '@/services/api/AnalyticsApiService'
import DateRangePicker from '@/components/reports/DateRangePicker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { Download, RefreshCw, LineChart as LineChartIcon, PieChart as LucidePieChart, BarChart3, TrendingUp, AlertCircle } from 'lucide-react'
import FilterPanel from '@/components/filters/FilterPanel'
import ReportApiService from '@/services/api/ReportApiService'
import { resolveUserName } from '@/lib/utils'
import { Combobox } from '@/components/ui/combobox'
import { Building2 } from 'lucide-react'

type DateRange = { from: string; to: string }

const COLORS = ['#f97316', '#fb923c', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

function last7(): DateRange {
  const end = new Date()
  const start = new Date(); start.setDate(end.getDate() - 6)
  const fmt = (d: Date) => d.toISOString().split('T')[0] || ''
  return { from: fmt(start), to: fmt(end) }
}

export default function InsightsPage() {
  const [range, setRange] = useState<DateRange>(last7())
  const [clientCode, setClientCode] = useState<string>('ALL')
  const [groupBy, setGroupBy] = useState<'day'|'week'|'month'>('day')
  const [loading, setLoading] = useState(true)

  const [trends, setTrends] = useState<any>(null)
  const [modeMix, setModeMix] = useState<any[]>([])
  const [funnel, setFunnel] = useState<any>(null)
  const [failures, setFailures] = useState<any>({ breakdown: [], total_failed: 0 })

  // Client selector support (reuse client masters like Transaction History)
  const [userName, setUserName] = useState<string>('')
  const [clientCodeList, setClientCodeList] = useState<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setUserName(resolveUserName())
  }, [])

  const fetchClientCodeList = useCallback(async (loginBy: string) => {
    const normalized = loginBy?.trim()
    if (!normalized) return
    try {
      const data = await ReportApiService.getClientCodeListUSP_Cached(normalized)
      setClientCodeList(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load client list', e)
      toast.error('Failed to load client list')
    }
  }, [])

  const clientOptions = useMemo(() => {
    const mapped = (Array.isArray(clientCodeList) ? clientCodeList : []).map((c: any) => ({
      value: c.client_code || c.clientCode,
      label: `${c.client_code || c.clientCode} - ${c.client_name || c.clientName || ''}`
    }))
    return [{ value: 'ALL', label: 'ALL - All Clients' }, ...mapped]
  }, [clientCodeList])

  const load = async () => {
    setLoading(true)
    try {
      const [t, m, f, fr] = await Promise.all([
        AnalyticsApiService.successTrends({ clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to, groupBy }),
        AnalyticsApiService.modeMix({ clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to }),
        AnalyticsApiService.funnel({ clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to, by: 'mode' }),
        AnalyticsApiService.failureReasons({ clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to, groupBy: 'resp', top: 10 }),
      ])
      setTrends(t)
      setModeMix(m?.breakdown || [])
      setFunnel(f)
      setFailures(fr)
    } catch (e: any) {
      console.error(e)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const pieData = modeMix.map((d, i) => ({ name: d.mode || 'NA', value: d.txn_count, fill: COLORS[i % COLORS.length] }))
  const trendSeries = (trends?.timeseries || []).map((d: any) => ({ label: d.label, total: d.total, success: d.success, failed: d.failed }))
  const failureSeries = (failures.breakdown || []).map((d: any) => ({ key: d.key, count: d.count }))
  const funnelBreakdown = (funnel?.breakdown || []).map((d: any) => ({ key: d.key, initiated: d.initiated, success: d.success, failed: d.failed, not_complete: d.not_complete }))

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Analytics Insights
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
            Trends, mix, funnel and failure analytics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={load}
            disabled={loading}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 relative z-20">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-0.5 md:mb-1">Filter Analytics</h3>
          <p className="text-xs md:text-sm text-gray-600">Select optional client, grouping and date range</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
              Client Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Combobox
                  options={clientOptions}
                  value={clientCode}
                  onChange={(val) => setClientCode(val)}
                  placeholder="Select client..."
                  searchPlaceholder="Search clients..."
                  emptyMessage="No clients found"
                  onOpenChange={(open) => {
                    if (open && userName && clientCodeList.length === 0) {
                      fetchClientCodeList(userName)
                    }
                  }}
                  className="min-h-[44px]"
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
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Group By</label>
            <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
              <SelectTrigger className="min-h-[44px] w-full"><SelectValue placeholder="Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">Date Range</label>
            <DateRangePicker value={range} onChange={(r) => setRange(r)} variant="orange" helperText="Max 92 days" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 mb-4">
          <Button
            onClick={load}
            className="min-h-[44px] px-4 md:px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] px-4 md:px-6"
            onClick={() => AnalyticsApiService.downloadCsv('/analytics/success_trends/', { clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to, groupBy }, `success_trends_${range.from}_${range.to}.csv`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Trends
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] px-4 md:px-6"
            onClick={() => AnalyticsApiService.downloadCsv('/analytics/mode_mix/', { clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to }, `mode_mix_${range.from}_${range.to}.csv`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Mode Mix
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] px-4 md:px-6"
            onClick={() => AnalyticsApiService.downloadCsv('/analytics/funnel/', { clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to, by: 'mode' }, `funnel_${range.from}_${range.to}.csv`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Funnel
          </Button>
          <Button
            variant="outline"
            className="min-h-[44px] px-4 md:px-6"
            onClick={() => AnalyticsApiService.downloadCsv('/analytics/failure_reasons/', { clientCode: clientCode || 'ALL', fromDate: range.from, endDate: range.to, groupBy: 'resp', top: 50 }, `failures_${range.from}_${range.to}.csv`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Failures
          </Button>
          <Button
            variant="ghost"
            className="min-h-[44px] px-4 md:px-6"
            onClick={() => { setClientCode('ALL'); setGroupBy('day'); setRange(last7()) }}
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
            <p className="text-sm md:text-base font-semibold text-gray-900">Loading analytics...</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Row 1: Trends and Mode Mix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Success Trends */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <LineChartIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Success Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={trendSeries.length > 14 ? -20 : 0}
                        textAnchor={trendSeries.length > 14 ? "end" : "middle"}
                        height={trendSeries.length > 14 ? 60 : 30}
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
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#6b7280"
                        strokeWidth={3}
                        dot={{ fill: '#6b7280', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="success"
                        name="Success"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="failed"
                        name="Failed"
                        stroke="#EF4444"
                        strokeWidth={3}
                        dot={{ fill: '#EF4444', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Mode Mix Pie */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <LucidePieChart className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Mode Mix Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth < 640 ? 50 : 60}
                        outerRadius={window.innerWidth < 640 ? 90 : 110}
                        paddingAngle={3}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2: Funnel and Failures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Funnel by Mode */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Funnel by Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="key"
                        interval={0}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        angle={-35}
                        textAnchor="end"
                        height={70}
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
                        dataKey="success"
                        stackId="a"
                        fill="#10B981"
                        name="Success"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="failed"
                        stackId="a"
                        fill="#EF4444"
                        name="Failed"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        dataKey="not_complete"
                        stackId="a"
                        fill="#F59E0B"
                        name="Not Complete"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Failure Reasons */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Top Failure Reasons
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={failureSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="key"
                        interval={0}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        angle={-35}
                        textAnchor="end"
                        height={70}
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
                      <Bar
                        dataKey="count"
                        name="Count"
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
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
