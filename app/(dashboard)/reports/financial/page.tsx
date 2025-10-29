'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/reports/DateRangePicker';
import dynamic from 'next/dynamic';
import { useReportStore } from '@/stores/reportStore';
import ReportApiService from '@/services/api/ReportApiService';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';
import toast from 'react-hot-toast';
import type { DateRange, IFinancialReport } from '@/types/reports';
import { VIRT_THRESHOLD } from '@/config/perf';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

// Dynamically load chart components (no SSR) to reduce initial bundle cost
const RevenueDistributionPie = dynamic(() => import('@/components/reports/financial/RevenueDistributionPie'), { ssr: false });
const MarginBarChart = dynamic(() => import('@/components/reports/financial/MarginBarChart'), { ssr: false });
const CashFlowLineChart = dynamic(() => import('@/components/reports/financial/CashFlowLineChart'), { ssr: false });

export default function FinancialReportsPage() {
  if (typeof window === 'undefined') return null;
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const { data: financialReport, isLoading } = useQuery({
    queryKey: ['financial-report', dateRange],
    queryFn: () => ReportApiService.getFinancialReport(dateRange),
  });

  const { data: taxReport } = useQuery({
    queryKey: ['tax-report', selectedYear, selectedMonth],
    queryFn: () => ReportApiService.getTaxReport({
      from: `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`,
      to: `${selectedYear}-${selectedMonth.padStart(2, '0')}-31`,
    }),
  });

  const { data: profitLossReport } = useQuery({
    queryKey: ['profit-loss-report', dateRange],
    queryFn: () => ReportApiService.getProfitLossReport(dateRange),
  });

  const { data: cashFlowReport } = useQuery({
    queryKey: ['cash-flow-report', dateRange],
    queryFn: () => ReportApiService.getCashFlowReport(dateRange),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportTally = async () => {
    try {
      toast.loading('Exporting for Tally...', { id: 'export' });
      const response = await ReportApiService.exportForAccounting(dateRange, 'tally');
      const blob = await ReportApiService.downloadExportedFile(response.file_url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Exported successfully', { id: 'export' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to export', { id: 'export' });
    }
  };

  const renderRevenueTab = () => {
    if (!financialReport) return null;

    const revenueData = financialReport.revenue || [];
    const grossRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
    const totalTransactions = revenueData.reduce((sum, item) => sum + item.transactions, 0);

    // Virtualization state for revenue table (desktop only)
    const tableRef = useRef<HTMLDivElement | null>(null);
    const [virtScrollTop, setVirtScrollTop] = useState(0);
    const [virtViewportHeight, setVirtViewportHeight] = useState(0);
    const [virtRowHeight, setVirtRowHeight] = useState<number>(0);
    const virtualizationEnabled = revenueData.length > VIRT_THRESHOLD;

    useEffect(() => {
      if (!virtualizationEnabled) return;
      const measure = () => {
        const el = tableRef.current;
        if (!el) return;
        setVirtViewportHeight(el.clientHeight || 0);
        const firstRow = el.querySelector('tbody tr') as HTMLElement | null;
        const h = firstRow?.offsetHeight || 48;
        setVirtRowHeight(h);
      };
      measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }, [virtualizationEnabled, revenueData.length]);
    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (!virtualizationEnabled) return;
      setVirtScrollTop(e.currentTarget.scrollTop || 0);
    };

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </div>
                Gross Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {formatCurrency(grossRevenue)}
              </div>
              <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                Total revenue generated
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                Net Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(grossRevenue * 0.97)}
              </div>
              <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                After deducting fees
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </div>
                Total Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {formatCurrency(grossRevenue * 0.03)}
              </div>
              <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                Platform & gateway fees
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2 text-gray-700">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {totalTransactions.toLocaleString()}
              </div>
              <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                Total transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown Table */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              Revenue Breakdown by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {revenueData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm">
                    {item.category}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">Transactions:</span>
                      <span className="font-semibold text-gray-900 ml-2">{item.transactions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-gray-900 ml-2">{formatCurrency(item.amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Percentage:</span>
                      <span className="font-semibold text-gray-900 ml-2">{item.percentage.toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Change:</span>
                      <span className={`font-semibold ml-2 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div
              className="hidden md:block overflow-x-auto"
              ref={tableRef}
              onScroll={onScroll}
              style={virtualizationEnabled ? { maxHeight: '70vh', overflowY: 'auto' } : undefined}
            >
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-bold text-gray-700 uppercase text-xs">
                      Category
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      Transactions
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      Amount
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      Percentage
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {virtualizationEnabled && virtRowHeight > 0 && virtViewportHeight > 0 ? (
                    (() => {
                      const total = revenueData.length;
                      const rh = virtRowHeight || 48;
                      const overscan = 10;
                      const startIndex = Math.max(0, Math.floor(virtScrollTop / rh) - overscan);
                      const visibleCount = Math.ceil(virtViewportHeight / rh) + overscan * 2;
                      const endIndex = Math.min(total, startIndex + visibleCount);
                      const slice = revenueData.slice(startIndex, endIndex);
                      const topPad = startIndex * rh;
                      const bottomPad = Math.max(0, (total - endIndex) * rh);
                      return (
                        <>
                          {topPad > 0 && (<tr style={{ height: topPad }}><td colSpan={5}></td></tr>)}
                          {slice.map((item, i) => (
                            <tr key={`${startIndex + i}-${item.category}`} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 text-gray-700 font-medium">{item.category}</td>
                              <td className="p-3 text-right text-gray-700">{item.transactions.toLocaleString()}</td>
                              <td className="p-3 text-right text-gray-700 font-semibold">{formatCurrency(item.amount)}</td>
                              <td className="p-3 text-right text-gray-700">{item.percentage.toFixed(2)}%</td>
                              <td className="p-3 text-right">
                                <div className={`flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {item.change >= 0 ? (<TrendingUp className="h-4 w-4" />) : (<TrendingDown className="h-4 w-4" />)}
                                  <span className="font-semibold">{Math.abs(item.change).toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {bottomPad > 0 && (<tr style={{ height: bottomPad }}><td colSpan={5}></td></tr>)}
                        </>
                      );
                    })()
                  ) : (
                    revenueData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-700 font-medium">{item.category}</td>
                        <td className="p-3 text-right text-gray-700">{item.transactions.toLocaleString()}</td>
                        <td className="p-3 text-right text-gray-700 font-semibold">{formatCurrency(item.amount)}</td>
                        <td className="p-3 text-right text-gray-700">{item.percentage.toFixed(2)}%</td>
                        <td className="p-3 text-right">
                          <div className={`flex items-center justify-end gap-1 ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.change >= 0 ? (<TrendingUp className="h-4 w-4" />) : (<TrendingDown className="h-4 w-4" />)}
                            <span className="font-semibold">{Math.abs(item.change).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
              <RevenueDistributionPie data={revenueData} height={300} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTaxTab = () => {
    if (!taxReport) return null;

    const { transactions = [], summary = {} } = taxReport;

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Tax Summary Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Total CGST
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {formatCurrency(summary.totalCGST || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Total SGST
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {formatCurrency(summary.totalSGST || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Total IGST
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {formatCurrency(summary.totalIGST || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Total Tax
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {formatCurrency((summary.totalCGST || 0) + (summary.totalSGST || 0) + (summary.totalIGST || 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Selector */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                  Financial Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024-25</SelectItem>
                    <SelectItem value="2023">2023-24</SelectItem>
                    <SelectItem value="2022">2022-23</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs md:text-sm font-medium text-gray-700 mb-2 block">
                  Month
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                variant="outline"
                onClick={handleExportTally}
                className="min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export for Tally
              </Button>
              <Button
                variant="outline"
                className="min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                GSTR-1 Format
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tax Breakdown Table */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              GST Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {transactions.slice(0, 20).map((txn: any, index: number) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200 text-sm">
                    {txn.transactionId}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {new Date(txn.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-gray-900 ml-2">{formatCurrency(txn.amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">CGST:</span>
                      <span className="font-semibold text-orange-600 ml-2">{formatCurrency(txn.cgst)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SGST:</span>
                      <span className="font-semibold text-orange-600 ml-2">{formatCurrency(txn.sgst)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">IGST:</span>
                      <span className="font-semibold text-orange-600 ml-2">{formatCurrency(txn.igst)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Tax:</span>
                      <span className="font-semibold text-gray-900 ml-2">
                        {formatCurrency(txn.cgst + txn.sgst + txn.igst)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-bold text-gray-700 uppercase text-xs">
                      Transaction ID
                    </th>
                    <th className="text-left p-3 font-bold text-gray-700 uppercase text-xs">
                      Date
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      Amount
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      CGST
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      SGST
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      IGST
                    </th>
                    <th className="text-right p-3 font-bold text-gray-700 uppercase text-xs">
                      Total Tax
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.slice(0, 20).map((txn: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-700 font-medium">{txn.transactionId}</td>
                      <td className="p-3 text-gray-700">
                        {new Date(txn.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right text-gray-700 font-semibold">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="p-3 text-right text-orange-600 font-semibold">
                        {formatCurrency(txn.cgst)}
                      </td>
                      <td className="p-3 text-right text-orange-600 font-semibold">
                        {formatCurrency(txn.sgst)}
                      </td>
                      <td className="p-3 text-right text-orange-600 font-semibold">
                        {formatCurrency(txn.igst)}
                      </td>
                      <td className="p-3 text-right font-bold text-gray-900">
                        {formatCurrency(txn.cgst + txn.sgst + txn.igst)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProfitLossTab = () => {
    if (!profitLossReport) return null;

    const { revenue, costs, profit } = profitLossReport;

    return (
      <div className="space-y-4 md:space-y-6">
        {/* P&L Statement */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              Profit & Loss Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-4 md:space-y-6">
              {/* Revenue Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Revenue</h4>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-700 font-medium">Gross Revenue</span>
                    <span className="font-bold text-gray-900">{formatCurrency(revenue.gross)}</span>
                  </div>
                  {revenue.byCategory.map((cat, index) => (
                    <div key={index} className="flex justify-between text-xs md:text-sm pl-4">
                      <span className="text-gray-600">{cat.category}</span>
                      <span className="text-gray-700 font-semibold">{formatCurrency(cat.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costs Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">
                  Less: Operating Expenses
                </h4>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Gateway Charges</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(costs.gatewayCharges)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Platform Fees</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(costs.operatingCosts)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Other Expenses</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(costs.other)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm font-bold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total Costs</span>
                    <span className="text-red-600">{formatCurrency(costs.total)}</span>
                  </div>
                </div>
              </div>

              {/* Profit Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 p-4 md:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm md:text-base">
                      Net Profit
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-green-600">
                      {formatCurrency(profit.net)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="text-gray-700 font-medium">Profit Margin</span>
                    <Badge className="bg-green-600 text-white border-0 text-xs md:text-sm font-bold">
                      {profit.margin.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Margin Analysis Chart */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              Margin Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
              <MarginBarChart
                data={[
                  { name: 'Gross Revenue', value: revenue.gross },
                  { name: 'Total Costs', value: -costs.total },
                  { name: 'Net Profit', value: profit.net },
                ]}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCashFlowTab = () => {
    if (!cashFlowReport) return null;

    const { inflows, outflows, netCashFlow, openingBalance, closingBalance } = cashFlowReport;

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Cash Flow Summary */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Opening Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {formatCurrency(openingBalance)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Total Inflows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(inflows.total)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Total Outflows
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {formatCurrency(outflows.total)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-700">
                Closing Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="text-xl md:text-2xl font-bold text-orange-600">
                {formatCurrency(closingBalance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cash Flow Statement */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              Cash Flow Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-4 md:space-y-6">
              {/* Inflows */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Cash Inflows</h4>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Transactions</span>
                    <span className="text-green-600 font-semibold">{formatCurrency(inflows.transactions)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Refunds Reversed</span>
                    <span className="text-green-600 font-semibold">{formatCurrency(inflows.refundsReversed)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Other</span>
                    <span className="text-green-600 font-semibold">{formatCurrency(inflows.other)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm font-bold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total Inflows</span>
                    <span className="text-green-600">{formatCurrency(inflows.total)}</span>
                  </div>
                </div>
              </div>

              {/* Outflows */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Cash Outflows</h4>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Refunds</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(outflows.refunds)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Settlements</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(outflows.settlements)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Charges</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(outflows.charges)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Other</span>
                    <span className="text-red-600 font-semibold">{formatCurrency(outflows.other)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm font-bold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total Outflows</span>
                    <span className="text-red-600">{formatCurrency(outflows.total)}</span>
                  </div>
                </div>
              </div>

              {/* Net Cash Flow */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-4 md:p-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-sm md:text-base">
                    Net Cash Flow
                  </span>
                  <span className={`text-xl md:text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Chart */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-3">
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              Cash Flow Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-[280px] sm:h-[320px] md:h-[360px] w-full overflow-hidden">
              <CashFlowLineChart
                data={[
                  { name: 'Week 1', inflows: inflows.total * 0.2, outflows: outflows.total * 0.15 },
                  { name: 'Week 2', inflows: inflows.total * 0.25, outflows: outflows.total * 0.3 },
                  { name: 'Week 3', inflows: inflows.total * 0.3, outflows: outflows.total * 0.25 },
                  { name: 'Week 4', inflows: inflows.total * 0.25, outflows: outflows.total * 0.3 },
                ]}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg border-2 border-gray-300 p-2 transition-all hover:bg-gray-50 hover:border-orange-500"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Financial Reports
            </h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">
              Comprehensive financial analysis and reports
            </p>
          </div>
        </div>

        <DateRangePicker value={dateRange} onChange={setDateRange} variant="orange" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-transparent h-auto p-0">
          <TabsTrigger
            value="revenue"
            className="min-h-[44px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg border-2 border-gray-200 data-[state=active]:border-orange-500"
          >
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="tax"
            className="min-h-[44px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg border-2 border-gray-200 data-[state=active]:border-orange-500"
          >
            Tax Report
          </TabsTrigger>
          <TabsTrigger
            value="pl"
            className="min-h-[44px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg border-2 border-gray-200 data-[state=active]:border-orange-500"
          >
            P&L
          </TabsTrigger>
          <TabsTrigger
            value="cashflow"
            className="min-h-[44px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg border-2 border-gray-200 data-[state=active]:border-orange-500"
          >
            Cash Flow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4 md:mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 md:py-20 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="relative w-14 h-14 md:w-16 md:h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-900">Loading financial data...</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Please wait while we fetch your data</p>
              </div>
            </div>
          ) : (
            renderRevenueTab()
          )}
        </TabsContent>

        <TabsContent value="tax" className="mt-4 md:mt-6">
          {renderTaxTab()}
        </TabsContent>

        <TabsContent value="pl" className="mt-4 md:mt-6">
          {renderProfitLossTab()}
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4 md:mt-6">
          {renderCashFlowTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
