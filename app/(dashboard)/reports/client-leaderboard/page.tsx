/**
 * Client Leaderboard Dashboard - Mobile-First Redesign
 * Top clients by GMV or Transactions with comprehensive analytics
 */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AnalyticsApiService from '@/services/api/AnalyticsApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { formatCurrency } from '@/lib/utils';
import { RefreshCw, Download, TrendingUp, DollarSign, Users, Calendar, BarChart3, Trophy, Crown, Medal, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

type DateRange = { from: string; to: string };

function last7(): DateRange {
  const e = new Date();
  const s = new Date();
  s.setDate(e.getDate() - 6);
  const f = (d: Date) => d.toISOString().split('T')[0] || '';
  return { from: f(s), to: f(e) };
}

export default function ClientLeaderboardPage() {
  const [range, setRange] = useState<DateRange>(last7());
  const [dateFrom, setDateFrom] = useState(last7().from);
  const [dateTo, setDateTo] = useState(last7().to);
  const [metric, setMetric] = useState<'gmv' | 'txn'>('gmv');
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  const deriveRange = useCallback((rangeType: '7d' | '30d' | '90d') => {
    const now = new Date();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const to = fmt(now);
    const start = new Date(now);
    if (rangeType === '7d') start.setDate(start.getDate() - 6);
    else if (rangeType === '30d') start.setDate(start.getDate() - 29);
    else if (rangeType === '90d') start.setDate(start.getDate() - 89);
    const from = fmt(start);
    return { from, to };
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await AnalyticsApiService.clientLeaderboard({
        fromDate: dateFrom,
        endDate: dateTo,
        metric,
        top: 20
      });
      setRows(Array.isArray(data) ? data : []);
      toast.success('Leaderboard data loaded successfully');
    } catch (e) {
      toast.error('Failed to load leaderboard data');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { from, to } = deriveRange(selectedRange);
    setDateFrom(from);
    setDateTo(to);
    setRange({ from, to });
  }, [selectedRange, deriveRange]);

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = () => {
    load();
  };

  const handleExport = async () => {
    try {
      await AnalyticsApiService.downloadCsv(
        '/analytics/client_leaderboard/',
        {
          fromDate: dateFrom,
          endDate: dateTo,
          metric,
          top: 100
        },
        `client_leaderboard_${metric}_${dateFrom}_${dateTo}.csv`
      );
      toast.success('Leaderboard CSV downloaded');
    } catch (e) {
      toast.error('Failed to export leaderboard');
    }
  };

  const handleClearFilters = () => {
    setMetric('gmv');
    setSelectedRange('7d');
    const { from, to } = deriveRange('7d');
    setDateFrom(from);
    setDateTo(to);
    setRange({ from, to });
  };

  const chartData = rows.map((r: any, idx: number) => ({
    name: r.client_code,
    value: Number(r.value || 0),
    rank: idx + 1
  }));

  // Calculate summary stats
  const totalValue = rows.reduce((sum, r) => sum + Number(r.value || 0), 0);
  const totalClients = rows.length;
  const avgValue = totalClients > 0 ? totalValue / totalClients : 0;
  const topClient = rows.length > 0 ? rows[0] : null;

  // Chart colors for top 3
  const getBarColor = (index: number) => {
    if (index === 0) return '#f97316'; // Orange for 1st
    if (index === 1) return '#fb923c'; // Light orange for 2nd
    if (index === 2) return '#fdba74'; // Lighter orange for 3rd
    return '#fed7aa'; // Lightest orange for others
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            Client Leaderboard
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Top performing clients by GMV or transaction volume
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 relative z-[100]">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-0.5 md:mb-1" style={{ letterSpacing: '-0.02em' }}>Filter Options</h3>
          <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select metric and date range to view leaderboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          {/* Metric Selection */}
          <div className="relative z-[110]">
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5" style={{ letterSpacing: '-0.02em' }}>
              <BarChart3 className="inline-block w-4 h-4 mr-1 text-gray-600" /> Metric
            </label>
            <Select value={metric} onValueChange={(v: any) => setMetric(v)}>
              <SelectTrigger className="w-full min-h-[52px]">
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[9999] max-h-[300px]">
                <SelectItem value="gmv">GMV (Gross Merchandise Value)</SelectItem>
                <SelectItem value="txn">Transaction Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div className="relative z-[105]">
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5" style={{ letterSpacing: '-0.02em' }}>
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> From
            </label>
            <DatePicker value={dateFrom} onChange={(v) => setDateFrom(v)} placeholder="From date" />
          </div>

          {/* To Date */}
          <div className="relative z-[105]">
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5" style={{ letterSpacing: '-0.02em' }}>
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" /> To
            </label>
            <DatePicker value={dateTo} onChange={(v) => setDateTo(v)} placeholder="To date" />
          </div>
        </div>

        {/* Range Selector Buttons */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
          <Button
            variant={selectedRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('7d')}
            className={`min-h-[52px] ${selectedRange === '7d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            7 Days
          </Button>
          <Button
            variant={selectedRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('30d')}
            className={`min-h-[52px] ${selectedRange === '30d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            30 Days
          </Button>
          <Button
            variant={selectedRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRange('90d')}
            className={`min-h-[52px] ${selectedRange === '90d' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-white'}`}
          >
            90 Days
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="min-h-[52px] px-4 md:px-6 text-gray-700 hover:bg-gray-100"
          >
            Clear Filters
          </Button>
          <Button
            onClick={load}
            className="min-h-[52px] px-6 md:px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            Apply Filters →
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
            <p className="text-sm md:text-base font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Loading leaderboard...</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Please wait while we fetch your data</p>
          </div>
        </div>
      ) : rows.length > 0 ? (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Top Client */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Crown className="h-4 w-4 text-orange-600" />
                  </div>
                  Top Client
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-base md:text-lg font-bold text-gray-900 truncate">
                  {topClient?.client_name || topClient?.client_code || '-'}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  {metric === 'gmv' ? formatCurrency(topClient?.value || 0) : `${topClient?.value || 0} txns`}
                </p>
              </CardContent>
            </Card>

            {/* Total Value */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  Total {metric === 'gmv' ? 'GMV' : 'Transactions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {metric === 'gmv' ? formatCurrency(totalValue) : totalValue.toLocaleString()}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Across all clients
                </p>
              </CardContent>
            </Card>

            {/* Average Value */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  Average {metric === 'gmv' ? 'GMV' : 'Transactions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {metric === 'gmv' ? formatCurrency(avgValue) : Math.round(avgValue).toLocaleString()}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Per client
                </p>
              </CardContent>
            </Card>

            {/* Total Clients */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  Total Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-purple-600">
                  {totalClients}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  In leaderboard
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Card */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                <Trophy className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Top Clients - {metric.toUpperCase()} Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-[320px] sm:h-[400px] md:h-[480px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="category"
                      dataKey="name"
                      interval={0}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickFormatter={(value) =>
                        metric === 'gmv'
                          ? `₹${(value / 1000000).toFixed(1)}M`
                          : value.toLocaleString()
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) =>
                        metric === 'gmv'
                          ? formatCurrency(value)
                          : value.toLocaleString()
                      }
                      labelFormatter={(label) => `Client: ${label}`}
                    />
                    <Bar
                      dataKey="value"
                      name={metric === 'gmv' ? 'GMV' : 'Transactions'}
                      radius={[8, 8, 0, 0]}
                      barSize={window.innerWidth < 640 ? 25 : 35}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Details Table Card */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold text-gray-900">Leaderboard Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {rows.map((r: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Crown className="h-5 w-5 text-orange-500" />}
                        {idx === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                        {idx === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                        <span className="font-bold text-gray-900 text-sm">#{idx + 1}</span>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Rank {idx + 1}
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-600">Client:</span>
                        <span className="font-semibold text-gray-900 ml-2 block mt-0.5">
                          {r.client_name || r.client_code}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">{metric === 'gmv' ? 'GMV' : 'Transactions'}:</span>
                        <span className="font-bold text-orange-600 ml-2 block mt-0.5">
                          {metric === 'gmv' ? formatCurrency(r.value || 0) : (r.value || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Change vs Previous:</span>
                        <span className={`font-semibold ml-2 block mt-0.5 ${Number(r.delta || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metric === 'gmv' ? formatCurrency(r.delta || 0) : (r.delta || 0).toLocaleString()}
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
                      <th className="px-4 py-3 text-center text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>Client</th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>
                        {metric === 'gmv' ? 'GMV' : 'Transactions'}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-extrabold text-gray-700 uppercase" style={{ letterSpacing: '-0.02em' }}>
                        Δ Previous Period
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {idx === 0 && <Crown className="h-4 w-4 text-orange-500" />}
                            {idx === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                            {idx === 2 && <Medal className="h-4 w-4 text-amber-600" />}
                            <span className="text-sm font-bold text-gray-900">#{idx + 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {r.client_name || r.client_code}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-orange-600">
                          {metric === 'gmv' ? formatCurrency(r.value || 0) : (r.value || 0).toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-semibold ${Number(r.delta || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {metric === 'gmv' ? formatCurrency(r.delta || 0) : (r.delta || 0).toLocaleString()}
                        </td>
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
            <h3 className="text-lg md:text-xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>No Leaderboard Data Available</h3>
            <p className="text-sm md:text-base text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select filters and click "Apply Filters" to view leaderboard</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
