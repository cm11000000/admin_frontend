/**
 * Refund Analytics Dashboard - Mobile-First Redesign
 * Comprehensive analytics and insights for refunds
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRefundStore } from '@/stores/refundStore';
import AnalyticsApiService from '@/services/api/AnalyticsApiService';
import ReportApiService from '@/services/api/ReportApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { formatCurrency, resolveUserName } from '@/lib/utils';
import { RefreshCw, Download, TrendingUp, DollarSign, PieChart as LucidePieChart, Building2, Calendar, BarChart3, LineChart as LineChartIcon, AlertCircle, Activity } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
// Recharts lazy-loaded at runtime for better initial performance

export default function RefundAnalyticsPage() {
  const { analytics, isLoadingAnalytics, fetchAnalytics } = useRefundStore();
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);

  // Filters
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [userName, setUserName] = useState<string>('');
  const [clientList, setClientList] = useState<any[]>([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);

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

  // Initialize user and default range
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUserName(resolveUserName());
    const { from, to } = deriveRange(selectedRange);
    setDateFrom(from);
    setDateTo(to);
    fetchAnalytics({ range: selectedRange });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update when range changes
  useEffect(() => {
    const { from, to } = deriveRange(selectedRange);
    setDateFrom(from);
    setDateTo(to);
    fetchAnalytics({ range: selectedRange });
  }, [selectedRange, deriveRange, fetchAnalytics]);

  // Lazy load clients
  const ensureClients = useCallback(async () => {
    if (clientsLoaded || !userName) return;
    try {
      const list = await ReportApiService.getClientCodeListUSP_Cached(userName);
      setClientList(list || []);
      setClientsLoaded(true);
    } catch (e) {
      // non-blocking
    }
  }, [clientsLoaded, userName]);

  const handleRefresh = () => {
    fetchAnalytics({ range: selectedRange });
  };

  const handleExport = async () => {
    try {
      // Prefer explicit dates if provided, else derive from selectedRange
      const fmt = (d: Date) => d.toISOString().split('T')[0] || ''
      let from = dateFrom
      let to = dateTo
      if (!from || !to) {
        const now = new Date()
        to = fmt(now)
        const start = new Date(now)
        if (selectedRange === '7d') start.setDate(start.getDate() - 6)
        else if (selectedRange === '30d') start.setDate(start.getDate() - 29)
        else if (selectedRange === '90d') start.setDate(start.getDate() - 89)
        else if (selectedRange === '1y') start.setFullYear(start.getFullYear() - 1)
        from = fmt(start)
      }
      const body: any = { fromDate: from, endDate: to }
      if (selectedClient && selectedClient !== 'ALL') body.clientCode = selectedClient
      await AnalyticsApiService.downloadCsv('/analytics/refund_sla/', body, `refund_sla_${from}_${to}.csv`)
      toast.success('Refund SLA CSV downloaded')
    } catch (e) {
      toast.error('Failed to export Refund SLA')
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            Refund Analytics
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Insights and trends for refund management
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingAnalytics}
            className="min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all font-extrabold"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
            Refresh →
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all font-extrabold"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV →
          </Button>
          <Link href="/refunds">
            <Button
              variant="outline"
              className="min-h-[52px] px-4 md:px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md transition-all w-full font-extrabold"
            >
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 relative z-20">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-0.5 md:mb-1" style={{ letterSpacing: '-0.02em' }}>Filter Analytics</h3>
          <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select date range and client to view analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
          {/* Client Code */}
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5" style={{ letterSpacing: '-0.02em' }}>
              <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" /> Client Code
            </label>
            <Combobox
              options={[
                { value: 'ALL', label: 'ALL - All Clients' },
                ...((Array.isArray(clientList) ? clientList : []).map((client: any) => ({
                  value: client.client_code || client.clientCode,
                  label: `${client.client_code || client.clientCode} - ${client.client_name || client.clientName}`
                })))
              ]}
              value={selectedClient}
              onChange={(val) => setSelectedClient(val)}
              onOpenChange={(open) => { if (open) ensureClients(); }}
              placeholder="Select Client"
              searchPlaceholder="Search clients..."
              className="min-h-[44px]"
            />
          </div>

          {/* From Date */}
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5" style={{ letterSpacing: '-0.02em' }}>
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> From
            </label>
            <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v)} placeholder="From date" />
          </div>

          {/* To Date */}
          <div className="relative z-50">
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5" style={{ letterSpacing: '-0.02em' }}>
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
            className={`min-h-[52px] font-extrabold ${selectedRange === '7d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            7 Days
          </Button>
          <Button
            variant={selectedRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('30d')}
            className={`min-h-[52px] font-extrabold ${selectedRange === '30d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            30 Days
          </Button>
          <Button
            variant={selectedRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('90d')}
            className={`min-h-[52px] font-extrabold ${selectedRange === '90d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            90 Days
          </Button>
          <Button
            variant={selectedRange === '1y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('1y')}
            className={`min-h-[52px] font-extrabold ${selectedRange === '1y' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            1 Year
          </Button>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end pt-3 border-t border-gray-200">
          <Button
            onClick={handleRefresh}
            className="min-h-[52px] px-6 md:px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all font-extrabold"
          >
            Apply Filters →
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingAnalytics ? (
        <div className="flex items-center justify-center py-16 md:py-20 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="relative w-14 h-14 md:w-16 md:h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm md:text-base font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Loading analytics...</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Please wait while we fetch your data</p>
          </div>
        </div>
      ) : analytics ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Refunds */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-extrabold flex items-center gap-2 text-gray-700" style={{ letterSpacing: '-0.02em' }}>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  Total Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  {analytics.totalRefunds || 0}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                  Total refund requests processed
                </p>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-extrabold flex items-center gap-2 text-gray-700" style={{ letterSpacing: '-0.02em' }}>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-extrabold text-green-600" style={{ letterSpacing: '-0.02em' }}>
                  {formatCurrency(analytics.totalAmount)}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                  Total refunded amount
                </p>
              </CardContent>
            </Card>

            {/* Refund Rate */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-extrabold flex items-center gap-2 text-gray-700" style={{ letterSpacing: '-0.02em' }}>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LucidePieChart className="h-4 w-4 text-blue-600" />
                  </div>
                  Refund Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-extrabold text-blue-600" style={{ letterSpacing: '-0.02em' }}>
                  {analytics.refundRate?.toFixed(2) || '0.00'}%
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                  Of total transactions
                </p>
              </CardContent>
            </Card>

            {/* Avg Processing Time */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-extrabold flex items-center gap-2 text-gray-700" style={{ letterSpacing: '-0.02em' }}>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  Avg Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-extrabold text-purple-600" style={{ letterSpacing: '-0.02em' }}>
                  {analytics.averageProcessingTime?.toFixed(1) || '0.0'}h
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                  Average time to complete
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Refund Trend */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-extrabold flex items-center gap-2 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  <LineChartIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Refund Trend Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                  <Rc.ResponsiveContainer width="100%" height="100%">
                    <Rc.LineChart data={analytics.trends || []}>
                      <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <Rc.XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      />
                      <Rc.YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <Rc.Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                      />
                      <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Rc.Line
                        type="monotone"
                        dataKey="count"
                        name="Refund Count"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ fill: '#f97316', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Rc.Line
                        type="monotone"
                        dataKey="amount"
                        name="Refund Amount"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </Rc.LineChart>
                  </Rc.ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full rounded-lg bg-gray-100 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution Pie */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-extrabold flex items-center gap-2 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  <LucidePieChart className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                  <Rc.ResponsiveContainer width="100%" height="100%">
                    <Rc.PieChart>
                      <Rc.Pie
                        data={analytics.statusDistribution ? Object.entries(analytics.statusDistribution).map(([status, count]) => ({
                          name: status.charAt(0).toUpperCase() + status.slice(1),
                          value: count,
                        })) : []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={window.innerWidth < 640 ? 50 : 60}
                        outerRadius={window.innerWidth < 640 ? 90 : 110}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        <Rc.Cell fill="#FCD34D" />
                        <Rc.Cell fill="#60A5FA" />
                        <Rc.Cell fill="#EF4444" />
                        <Rc.Cell fill="#A78BFA" />
                        <Rc.Cell fill="#10B981" />
                        <Rc.Cell fill="#DC2626" />
                      </Rc.Pie>
                      <Rc.Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />
                    </Rc.PieChart>
                  </Rc.ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full rounded-lg bg-gray-100 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Top Refund Reasons */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-extrabold flex items-center gap-2 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Top Refund Reasons
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                  <Rc.ResponsiveContainer width="100%" height="100%">
                    <Rc.BarChart data={analytics.topReasons || []}>
                      <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <Rc.XAxis
                        dataKey="reason"
                        interval={0}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        angle={-35}
                        textAnchor="end"
                        height={70}
                        tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
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
                      <Rc.Bar
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
                    </Rc.BarChart>
                  </Rc.ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full rounded-lg bg-gray-100 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gateway Stats */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-extrabold flex items-center gap-2 text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Gateway Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                  <Rc.ResponsiveContainer width="100%" height="100%">
                    <Rc.BarChart data={analytics.gatewayStats || []}>
                      <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <Rc.XAxis
                        dataKey="gateway"
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
                      <Rc.Bar
                        dataKey="count"
                        name="Refund Count"
                        fill="#f97316"
                        radius={[8, 8, 0, 0]}
                        barSize={window.innerWidth < 640 ? 20 : 25}
                      />
                      <Rc.Bar
                        dataKey="amount"
                        name="Refund Amount"
                        fill="#10b981"
                        radius={[8, 8, 0, 0]}
                        barSize={window.innerWidth < 640 ? 20 : 25}
                      />
                    </Rc.BarChart>
                  </Rc.ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full rounded-lg bg-gray-100 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Refund Reasons Table */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Top Refund Reasons Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {(analytics.topReasons || []).map((reason, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-extrabold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm" style={{ letterSpacing: '-0.02em' }}>
                      #{index + 1} - {reason.reason}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs font-light" style={{ letterSpacing: '-0.01em' }}>
                      <div>
                        <span className="text-gray-600">Count:</span>
                        <span className="font-extrabold text-gray-900 ml-2">{reason.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Percentage:</span>
                        <span className="font-extrabold text-blue-600 ml-2">{reason.percentage.toFixed(1)}%</span>
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
                      <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Reason</th>
                      <th className="px-4 py-3 text-center text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Count</th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(analytics.topReasons || []).map((reason, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">#{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{reason.reason}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{reason.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{reason.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Gateway Statistics Table */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Gateway Statistics Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {(analytics.gatewayStats || []).map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm">
                      {stat.gateway}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Count:</span>
                        <span className="font-semibold text-gray-900 ml-2">{stat.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-green-600 ml-2">{formatCurrency(stat.amount)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Avg Amount:</span>
                        <span className="font-semibold text-gray-900 ml-2">{formatCurrency(stat.amount / stat.count)}</span>
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
                      <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Gateway</th>
                      <th className="px-4 py-3 text-center text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Count</th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Avg Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(analytics.gatewayStats || []).map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{stat.gateway}</td>
                        <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{stat.count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatCurrency(stat.amount)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{formatCurrency(stat.amount / stat.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl shadow-lg">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>No Analytics Data Available</h3>
            <p className="text-sm md:text-base text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select filters and click "Apply Filters" to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
