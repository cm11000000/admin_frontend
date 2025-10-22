/**
 * Reports Analytics Dashboard - Mobile-First Redesign
 * Comprehensive analytics and insights for reports
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useReportStore } from '@/stores/reportStore';
import ReportApiService from '@/services/api/ReportApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { formatCurrency, resolveUserName } from '@/lib/utils';
import { RefreshCw, Download, TrendingUp, TrendingDown, DollarSign, PieChart as LucidePieChart, Activity, Calendar, BarChart3, LineChart as LineChartIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart as RPieChart, Pie, Cell, Legend, Area, AreaChart } from 'recharts';

export default function ReportsAnalyticsPage() {
  const {
    analyticsFilters,
    setAnalyticsReport,
    setAnalyticsLoading,
    setDateRange,
  } = useReportStore();

  // Filters
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const deriveRange = useCallback((range: '7d' | '30d' | '90d' | '1y') => {
    const now = new Date();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const to = fmt(now);
    const start = new Date(now);
    if (range === '7d') start.setDate(start.getDate() - 6);
    else if (range === '30d') start.setDate(start.getDate() - 29);
    else if (range === '90d') start.setDate(start.getDate() - 89);
    else if (range === '1y') start.setFullYear(start.getFullYear() - 1);
    const from = fmt(start);
    return { from, to };
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (from: string, to: string) => {
    if (!from || !to) return;
    setIsLoading(true);
    setAnalyticsLoading(true);
    try {
      const data = await ReportApiService.fetchAnalytics({ dateRange: { from, to } });
      setReport(data);
      setAnalyticsReport(data);
      toast.success('Analytics loaded successfully');
    } catch (e) {
      toast.error('Failed to load analytics');
      setReport(null);
    } finally {
      setIsLoading(false);
      setAnalyticsLoading(false);
    }
  }, [setAnalyticsReport, setAnalyticsLoading]);

  // Initialize user and default range
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUserName(resolveUserName());
    const { from, to } = deriveRange(selectedRange);
    setDateFrom(from);
    setDateTo(to);
    fetchAnalytics(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update when range changes
  useEffect(() => {
    const { from, to } = deriveRange(selectedRange);
    setDateFrom(from);
    setDateTo(to);
    fetchAnalytics(from, to);
  }, [selectedRange, deriveRange, fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics(dateFrom, dateTo);
  };

  const handleExport = async () => {
    try {
      const response = await ReportApiService.exportReport({
        report_type: 'analytics',
        format: 'csv',
        filters: { dateRange: { from: dateFrom, to: dateTo } },
        include_summary: true,
      });

      const blob = await ReportApiService.downloadExportedFile(response.file_url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.file_name || `analytics_report_${dateFrom}_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report exported successfully');
    } catch (e) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Reports Analytics
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
            Comprehensive insights and analytics for reports
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/reports">
            <Button
              variant="outline"
              className="min-h-[44px] px-4 md:px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md transition-all w-full"
            >
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 relative z-20">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-0.5 md:mb-1">Filter Analytics</h3>
          <p className="text-xs md:text-sm text-gray-600">Select date range to view analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
          {/* From Date */}
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> From
            </label>
            <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v)} placeholder="From date" />
          </div>

          {/* To Date */}
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> To
            </label>
            <DatePicker value={dateTo} onChange={(v) => setDateTo(v)} placeholder="To date" />
          </div>
        </div>

        {/* Range Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-4">
          <Button
            variant={selectedRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('7d')}
            className={`min-h-[44px] ${selectedRange === '7d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            7 Days
          </Button>
          <Button
            variant={selectedRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('30d')}
            className={`min-h-[44px] ${selectedRange === '30d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            30 Days
          </Button>
          <Button
            variant={selectedRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('90d')}
            className={`min-h-[44px] ${selectedRange === '90d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            90 Days
          </Button>
          <Button
            variant={selectedRange === '1y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('1y')}
            className={`min-h-[44px] ${selectedRange === '1y' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            1 Year
          </Button>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <Button
            onClick={handleRefresh}
            className="min-h-[44px] px-6 md:px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
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
      ) : report ? (
        <>
          {/* Key Metrics */}
          {report?.overview?.key_metrics && report.overview.key_metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {report.overview.key_metrics.map((metric: any, index: number) => {
                const isPositive = metric.trend === 'up';
                const TrendIcon = isPositive ? TrendingUp : TrendingDown;
                const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
                const bgColor = index === 0 ? 'bg-orange-100' : index === 1 ? 'bg-green-100' : index === 2 ? 'bg-blue-100' : 'bg-purple-100';
                const iconColor = index === 0 ? 'text-orange-600' : index === 1 ? 'text-green-600' : index === 2 ? 'text-blue-600' : 'text-purple-600';

                return (
                  <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3 p-4 md:p-6">
                      <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                        <div className={`p-2 ${bgColor} rounded-lg`}>
                          <Activity className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        {metric.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                      <div className="text-xl md:text-2xl font-bold text-gray-900">
                        {metric.format === 'currency'
                          ? formatCurrency(metric.value)
                          : metric.format === 'percentage'
                          ? `${metric.value}%`
                          : metric.value.toLocaleString()}
                      </div>
                      <div className={`mt-2 flex items-center gap-1 text-xs md:text-sm ${trendColor}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span>{Math.abs(metric.change_percentage).toFixed(1)}%</span>
                        <span className="text-gray-600">vs prev period</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Performance Over Time Chart */}
          {report?.time_series?.daily && report.time_series.daily.length > 0 && (
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <LineChartIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Performance Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[400px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={report.time_series.daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} />
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
                        yAxisId="left"
                        type="monotone"
                        dataKey="transactions"
                        name="Transactions"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ fill: '#f97316', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amount"
                        name="Amount"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Rate Trend */}
          {report?.time_series?.daily && report.time_series.daily.length > 0 && (
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Success Rate Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[320px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.time_series.daily}>
                      <defs>
                        <linearGradient id="colorSuccessRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="label"
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
                      <Area
                        type="monotone"
                        dataKey="success_rate"
                        name="Success Rate (%)"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSuccessRate)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Analysis */}
          {report?.payment_analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* By Payment Method */}
              {report.payment_analysis.by_method && report.payment_analysis.by_method.length > 0 && (
                <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <CardHeader className="p-4 md:p-6 pb-3">
                    <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                      <LucidePieChart className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                      By Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                      <ResponsiveContainer width="100%" height="100%">
                        <RPieChart>
                          <Pie
                            data={report.payment_analysis.by_method.map((item: any) => ({
                              name: item.payment_method,
                              value: item.amount,
                            }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={window.innerWidth < 640 ? 50 : 60}
                            outerRadius={window.innerWidth < 640 ? 90 : 110}
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={true}
                          >
                            {report.payment_analysis.by_method.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][index % 5]} />
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
                        </RPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gateway Performance */}
              {report.payment_analysis.by_gateway && report.payment_analysis.by_gateway.length > 0 && (
                <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <CardHeader className="p-4 md:p-6 pb-3">
                    <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                      <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                      Gateway Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <div className="space-y-3">
                      {report.payment_analysis.by_gateway.map((gateway: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs md:text-sm font-medium text-gray-900">
                              {gateway.gateway}
                            </span>
                            <span className="text-xs md:text-sm text-gray-700">
                              {gateway.success_rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                              style={{ width: `${gateway.success_rate}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-600">
                            <span>{gateway.transactions.toLocaleString()} txns</span>
                            <span>{formatCurrency(gateway.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Top Performing Clients */}
          {report?.client_performance?.top_clients && report.client_performance.top_clients.length > 0 && (
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold text-gray-900">Top Performing Clients</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {report.client_performance.top_clients.slice(0, 10).map((client: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                        <div>
                          <div className="font-bold text-gray-900 text-sm">#{client.rank}</div>
                          <div className="text-xs text-gray-700 mt-1">{client.client_name}</div>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            client.success_rate >= 90
                              ? 'bg-green-100 text-green-600 border border-green-200'
                              : client.success_rate >= 75
                              ? 'bg-yellow-100 text-yellow-600 border border-yellow-200'
                              : 'bg-red-100 text-red-600 border border-red-200'
                          }`}
                        >
                          {client.success_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-600">Transactions:</span>
                          <span className="font-semibold text-gray-900 ml-2">{client.transactions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold text-orange-600 ml-2">{formatCurrency(client.amount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Growth:</span>
                          <div className={`inline-flex items-center gap-1 ml-2 ${client.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {client.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span className="font-semibold">{Math.abs(client.growth).toFixed(1)}%</span>
                          </div>
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
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Client</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Transactions</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Amount</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Success Rate</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.client_performance.top_clients.slice(0, 10).map((client: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-orange-600">#{client.rank}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{client.client_name}</td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{client.transactions.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(client.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                client.success_rate >= 90
                                  ? 'bg-green-100 text-green-600 border border-green-200'
                                  : client.success_rate >= 75
                                  ? 'bg-yellow-100 text-yellow-600 border border-yellow-200'
                                  : 'bg-red-100 text-red-600 border border-red-200'
                              }`}
                            >
                              {client.success_rate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div
                              className={`flex items-center justify-center gap-1 text-sm ${
                                client.growth >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {client.growth >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span>{Math.abs(client.growth).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Insights */}
          {report?.insights && report.insights.length > 0 && (
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold text-gray-900">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-3">
                  {report.insights.map((insight: any, index: number) => (
                    <div
                      key={index}
                      className={`flex gap-3 rounded-lg p-4 border ${
                        insight.type === 'success'
                          ? 'bg-green-50 border-green-200'
                          : insight.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : insight.type === 'error'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div
                        className={`mt-0.5 rounded-full p-1 ${
                          insight.type === 'success'
                            ? 'bg-green-100'
                            : insight.type === 'warning'
                            ? 'bg-yellow-100'
                            : insight.type === 'error'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        <Activity className={`h-4 w-4 ${
                          insight.type === 'success'
                            ? 'text-green-600'
                            : insight.type === 'warning'
                            ? 'text-yellow-600'
                            : insight.type === 'error'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xs md:text-sm font-semibold text-gray-900">
                          {insight.title}
                        </h3>
                        <p className="mt-1 text-xs md:text-sm text-gray-700">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl shadow-lg">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-sm md:text-base text-gray-600">Select filters and click "Apply Filters" to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
