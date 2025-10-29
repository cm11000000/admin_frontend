/**
 * Payment Link Analytics Dashboard - Mobile-First Redesign
 * Comprehensive analytics and insights for payment links
 */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { usePaymentLinkStore } from '@/stores/paymentLinkStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { formatCurrency, resolveUserName } from '@/lib/utils';
import { RefreshCw, Download, TrendingUp, DollarSign, PieChart as LucidePieChart, Building2, Calendar, BarChart3, LineChart as LineChartIcon, AlertCircle, TrendingDown, Link as LinkIcon, Eye, MousePointerClick } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
// No charts rendered yet; avoid bundling recharts until needed

export default function PaymentLinkAnalyticsPage() {
  const { analytics, isLoading, fetchAnalytics } = usePaymentLinkStore();

  // Filters
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userName, setUserName] = useState<string>('');

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

  const handleRefresh = () => {
    fetchAnalytics({ range: selectedRange });
  };

  const handleExport = async () => {
    try {
      toast.info('Export functionality coming soon');
    } catch (e) {
      toast.error('Failed to export Payment Link Analytics');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Payment Link Analytics
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
            Insights and performance metrics for payment links
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
          <Link href="/payment-links">
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
      ) : analytics ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Links */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <LinkIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  Total Links
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {analytics.overview.totalLinks}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  {analytics.overview.activeLinks} active
                </p>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.overview.totalAmount)}
                </div>
                <p className="text-[10px] md:text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {formatCurrency(analytics.overview.totalPaidAmount)} paid
                </p>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LucidePieChart className="h-4 w-4 text-blue-600" />
                  </div>
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {analytics.overview.conversionRate.toFixed(1)}%
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  {analytics.overview.paidLinks} / {analytics.overview.totalLinks} links paid
                </p>
              </CardContent>
            </Card>

            {/* Total Views */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {analytics.overview.totalViews.toLocaleString()}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  {analytics.overview.totalClicks.toLocaleString()} clicks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {analytics.statusBreakdown.map((item) => (
                  <div key={item.status} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm capitalize">
                      {item.status}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Count:</span>
                        <span className="font-semibold text-gray-900 ml-2">{item.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-gray-900 ml-2">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Percentage:</span>
                        <span className="font-semibold text-orange-600 ml-2">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Grid View */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.statusBreakdown.map((item) => (
                  <div key={item.status} className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs md:text-sm text-gray-600 capitalize mb-2 font-medium">{item.status}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{item.count}</p>
                    <p className="text-xs text-gray-600 mb-1">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-orange-600 font-semibold">
                      {item.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Links */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Top Performing Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {analytics.topPerformingLinks.slice(0, 5).map((item, index) => (
                  <div key={item.link.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate text-sm">
                          {item.link.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(item.link.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">{item.views}</p>
                        <p className="text-gray-600">views</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{item.clicks}</p>
                        <p className="text-gray-600">clicks</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-600">
                          {item.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-gray-600">conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop List View */}
              <div className="hidden md:block space-y-3">
                {analytics.topPerformingLinks.slice(0, 5).map((item, index) => (
                  <div
                    key={item.link.id}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {item.link.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.link.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">{item.views}</p>
                        <p className="text-xs text-gray-600">views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">{item.clicks}</p>
                        <p className="text-xs text-gray-600">clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">
                          {item.conversionRate.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600">conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods & Channel Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Payment Methods */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-4">
                  {analytics.paymentMethodBreakdown.map((item) => (
                    <div key={item.method} className="space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="font-medium text-gray-800">{item.method}</span>
                        <span className="text-gray-600 font-semibold">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-600">
                        <span>{item.count} transactions</span>
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Channel Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-4">
                  {analytics.channelPerformance.map((item) => (
                    <div key={item.channel} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-800 capitalize text-sm md:text-base">
                          {item.channel}
                        </span>
                        <span className="text-xs md:text-sm font-semibold text-green-600">
                          {item.conversionRate.toFixed(1)}% conversion
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-base md:text-lg font-semibold text-gray-900">{item.sent}</p>
                          <p className="text-[10px] md:text-xs text-gray-600">Sent</p>
                        </div>
                        <div>
                          <p className="text-base md:text-lg font-semibold text-gray-900">{item.opened}</p>
                          <p className="text-[10px] md:text-xs text-gray-600">Opened</p>
                        </div>
                        <div>
                          <p className="text-base md:text-lg font-semibold text-gray-900">{item.clicked}</p>
                          <p className="text-[10px] md:text-xs text-gray-600">Clicked</p>
                        </div>
                        <div>
                          <p className="text-base md:text-lg font-semibold text-green-600">{item.paid}</p>
                          <p className="text-[10px] md:text-xs text-gray-600">Paid</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Over Time Chart */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <LineChartIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 text-orange-400" />
                  <p className="text-sm md:text-base font-medium">Chart visualization coming soon</p>
                  <p className="text-xs text-gray-400 mt-1">Time series data will be displayed here</p>
                </div>
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
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-sm md:text-base text-gray-600">Select filters and click "Apply Filters" to view analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
