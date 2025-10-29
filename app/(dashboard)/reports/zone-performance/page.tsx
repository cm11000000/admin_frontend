/**
 * Zone Performance Dashboard - Mobile-First Redesign
 * Comprehensive zone-wise analytics with top client insights
 */
'use client';

import { useEffect, useState } from 'react';
import AnalyticsApiService from '@/services/api/AnalyticsApiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
// Recharts is lazy-loaded at runtime to reduce initial bundle
import { MapPin, TrendingUp, Users, DollarSign, RefreshCw, Download, Calendar, BarChart3, PieChart as LucidePieChart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type DateRange = { from: string; to: string };

function last7(): DateRange {
  const e = new Date();
  const s = new Date();
  s.setDate(e.getDate() - 6);
  const f = (d: Date) => d.toISOString().split('T')[0] || '';
  return { from: f(s), to: f(e) };
}

export default function ZonePerformancePage() {
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);
  const [range, setRange] = useState<DateRange>(last7());
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d'>('7d');

  const deriveRange = (rangeType: '7d' | '30d' | '90d') => {
    const now = new Date();
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const to = fmt(now);
    const start = new Date(now);
    if (rangeType === '7d') start.setDate(start.getDate() - 6);
    else if (rangeType === '30d') start.setDate(start.getDate() - 29);
    else if (rangeType === '90d') start.setDate(start.getDate() - 89);
    const from = fmt(start);
    return { from, to };
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await AnalyticsApiService.zonePerformance({ fromDate: range.from, endDate: range.to });
      setZones(data?.zones || []);
      setTopClients(data?.topClients || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRangeChange = (rangeType: '7d' | '30d' | '90d') => {
    setSelectedRange(rangeType);
    const newRange = deriveRange(rangeType);
    setRange(newRange);
  };

  const handleExport = () => {
    AnalyticsApiService.downloadCsv(
      '/analytics/zone_performance/',
      { fromDate: range.from, endDate: range.to },
      `zone_performance_${range.from}_${range.to}.csv`
    );
  };

  const zoneChart = zones.map((z: any) => ({
    zone: z.zone_code,
    amount: z.paid_amount,
    txns: z.txn_count,
  }));

  // Calculate totals for stat cards
  const totalAmount = zones.reduce((sum, z) => sum + (Number(z.paid_amount) || 0), 0);
  const totalTxns = zones.reduce((sum, z) => sum + (Number(z.txn_count) || 0), 0);
  const totalZones = zones.length;
  const totalClients = topClients.length;

  // Prepare pie chart data
  const zonePieData = zones.slice(0, 5).map((z: any) => ({
    name: z.zone_code,
    value: Number(z.paid_amount) || 0,
  }));

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Zone Performance
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
            Zone-wise volume analysis and top client insights
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
          <Button
            variant="outline"
            onClick={handleExport}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 relative z-20">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-0.5 md:mb-1">Filter Analytics</h3>
          <p className="text-xs md:text-sm text-gray-600">Select date range to view zone performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
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
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Total Amount */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                  </div>
                  Total Paid Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {formatCurrency(totalAmount)}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Across all zones
                </p>
              </CardContent>
            </Card>

            {/* Total Transactions */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {totalTxns.toLocaleString()}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Transaction count
                </p>
              </CardContent>
            </Card>

            {/* Total Zones */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  Active Zones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {totalZones}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  Zones with activity
                </p>
              </CardContent>
            </Card>

            {/* Top Clients */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  Top Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold text-purple-600">
                  {totalClients}
                </div>
                <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                  High-value clients
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Bar Chart - Zones by Paid Amount */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Zones by Paid Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                    <Rc.ResponsiveContainer width="100%" height="100%">
                      <Rc.BarChart data={zoneChart}>
                        <Rc.CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <Rc.XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-20} textAnchor="end" height={60} />
                        <Rc.YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Rc.Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                          formatter={(value: any, name: string) => {
                            if (name === 'amount') return [formatCurrency(value), 'Amount'];
                            return [value, 'Transactions'];
                          }}
                        />
                        <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Rc.Bar dataKey="amount" name="Amount" fill="url(#colorOrange)" radius={[8, 8, 0, 0]} barSize={typeof window !== 'undefined' && window.innerWidth < 640 ? 30 : 40} />
                        <defs>
                          <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#fb923c" stopOpacity={0.7} />
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

            {/* Pie Chart - Top 5 Zones */}
            <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2 text-gray-900">
                  <LucidePieChart className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                  Top 5 Zones Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
                  {Rc ? (
                    <Rc.ResponsiveContainer width="100%" height="100%">
                      <Rc.PieChart>
                        <Rc.Pie
                          data={zonePieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 50 : 60}
                          outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 90 : 110}
                          label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={true}
                        >
                          {zonePieData.map((entry: any, index: number) => (
                            <Rc.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Rc.Pie>
                        <Rc.Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} formatter={(value: any) => formatCurrency(value)} />
                        <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />
                      </Rc.PieChart>
                    </Rc.ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gray-100 animate-pulse" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone Details Table */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold text-gray-900">Zone Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {zones.map((zone, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm">
                      {zone.zone_code}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-semibold text-gray-900 ml-2">{zone.txn_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-orange-600 ml-2">{formatCurrency(zone.paid_amount)}</span>
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
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Zone Code</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Transactions</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Paid Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {zones.map((zone, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{zone.zone_code}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{zone.txn_count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(zone.paid_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top Clients Table */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-sm md:text-base font-semibold text-gray-900">Top Clients by Zone</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {topClients.map((client, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="font-bold text-gray-900 mb-1 text-sm">
                      {client.client_name}
                    </div>
                    <div className="text-xs text-gray-600 mb-3 pb-2 border-b border-gray-200">
                      Zone: {client.zone_code}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-semibold text-gray-900 ml-2">{client.txn_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold text-orange-600 ml-2">{formatCurrency(client.paid_amount)}</span>
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
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Zone</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Client Name</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Transactions</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Paid Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topClients.map((client, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.zone_code}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{client.client_name}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">{client.txn_count}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">{formatCurrency(client.paid_amount)}</td>
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
  );
}
