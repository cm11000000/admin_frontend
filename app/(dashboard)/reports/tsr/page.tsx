'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Search, Filter, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FilterPanel from '@/components/filters/FilterPanel'
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/reports/DateRangePicker';
import type { DateRange } from '@/types/reports';
import toast from 'react-hot-toast';
import { VIRT_THRESHOLD } from '@/config/perf';

interface TSRRecord {
  tsrId: string;
  merchantName: string;
  merchantId: string;
  transactionDate: string;
  settlementDate: string;
  transactionAmount: number;
  settlementAmount: number;
  charges: number;
  tax: number;
  status: 'settled' | 'pending' | 'failed' | 'processing';
  bankReference: string;
  paymentMode: string;
  utr: string;
}

export default function TSRReportPage() {
  if (typeof window === 'undefined') return null;
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');

  const { data: tsrData, isLoading } = useQuery({
    queryKey: ['tsr-report', dateRange, statusFilter, paymentModeFilter],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const mockData: TSRRecord[] = [
        {
          tsrId: 'TSR2024010001',
          merchantName: 'ABC Retail Pvt Ltd',
          merchantId: 'MER001',
          transactionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          settlementDate: new Date().toISOString(),
          transactionAmount: 125000,
          settlementAmount: 123500,
          charges: 1250,
          tax: 250,
          status: 'settled',
          bankReference: 'BRF123456789',
          paymentMode: 'UPI',
          utr: 'UTR20240100001',
        },
        {
          tsrId: 'TSR2024010002',
          merchantName: 'XYZ Electronics',
          merchantId: 'MER002',
          transactionDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          settlementDate: new Date().toISOString(),
          transactionAmount: 89500,
          settlementAmount: 88605,
          charges: 895,
          tax: 0,
          status: 'settled',
          bankReference: 'BRF123456790',
          paymentMode: 'Net Banking',
          utr: 'UTR20240100002',
        },
        {
          tsrId: 'TSR2024010003',
          merchantName: 'PQR Services',
          merchantId: 'MER003',
          transactionDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          settlementDate: new Date(Date.now() + 86400000).toISOString(),
          transactionAmount: 45000,
          settlementAmount: 44550,
          charges: 450,
          tax: 0,
          status: 'pending',
          bankReference: '',
          paymentMode: 'Credit Card',
          utr: '',
        },
        {
          tsrId: 'TSR2024010004',
          merchantName: 'LMN Hospitality',
          merchantId: 'MER004',
          transactionDate: new Date(Date.now() - 3 * 86400000).toISOString(),
          settlementDate: new Date().toISOString(),
          transactionAmount: 234500,
          settlementAmount: 232155,
          charges: 2345,
          tax: 0,
          status: 'settled',
          bankReference: 'BRF123456791',
          paymentMode: 'Debit Card',
          utr: 'UTR20240100004',
        },
        {
          tsrId: 'TSR2024010005',
          merchantName: 'RST Healthcare',
          merchantId: 'MER005',
          transactionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
          settlementDate: new Date().toISOString(),
          transactionAmount: 67800,
          settlementAmount: 67122,
          charges: 678,
          tax: 0,
          status: 'processing',
          bankReference: '',
          paymentMode: 'UPI',
          utr: '',
        },
        {
          tsrId: 'TSR2024010006',
          merchantName: 'DEF Education',
          merchantId: 'MER006',
          transactionDate: new Date(Date.now() - 4 * 86400000).toISOString(),
          settlementDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          transactionAmount: 156000,
          settlementAmount: 0,
          charges: 1560,
          tax: 0,
          status: 'failed',
          bankReference: '',
          paymentMode: 'Net Banking',
          utr: '',
        },
      ];

      return {
        records: mockData,
        summary: {
          totalRecords: mockData.length,
          settledCount: mockData.filter(t => t.status === 'settled').length,
          pendingCount: mockData.filter(t => t.status === 'pending').length,
          totalTransactionAmount: mockData.reduce((sum, t) => sum + t.transactionAmount, 0),
          totalSettlementAmount: mockData.reduce((sum, t) => sum + t.settlementAmount, 0),
          totalCharges: mockData.reduce((sum, t) => sum + t.charges, 0),
        },
      };
    },
  });

  const filteredRecords = tsrData?.records.filter((record) => {
    const matchesSearch =
      record.tsrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.merchantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.utr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPaymentMode = paymentModeFilter === 'all' || record.paymentMode === paymentModeFilter;

    return matchesSearch && matchesStatus && matchesPaymentMode;
  }) || [];

  // Virtualization for large result sets (desktop table)
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const [virtScrollTop, setVirtScrollTop] = useState(0);
  const [virtViewportHeight, setVirtViewportHeight] = useState(0);
  const [virtRowHeight, setVirtRowHeight] = useState<number>(0);
  const virtualizationEnabled = filteredRecords.length > VIRT_THRESHOLD;

  useEffect(() => {
    if (!virtualizationEnabled) return;
    const measure = () => {
      const el = tableScrollRef.current;
      if (!el) return;
      setVirtViewportHeight(el.clientHeight || 0);
      const firstRow = el.querySelector('tbody tr') as HTMLElement | null;
      const h = firstRow?.offsetHeight || 56;
      setVirtRowHeight(h);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [virtualizationEnabled, filteredRecords.length]);

  const onTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!virtualizationEnabled) return;
    setVirtScrollTop(e.currentTarget.scrollTop || 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    toast.loading(`Exporting to ${format.toUpperCase()}...`, { id: 'export' });

    setTimeout(() => {
      toast.success('Export completed successfully', { id: 'export' });
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'settled':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              TSR Report
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Transaction Settlement Report and analytics
            </p>
          </div>
        </div>

        <div className="hidden" />
      </div>

      <FilterPanel title="Filter Options" description="Select date range and export">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Date Range</label>
            <DateRangePicker value={dateRange} onChange={setDateRange} variant="orange" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} className="min-h-[44px]">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')} className="min-h-[44px]">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="ghost" className="min-h-[44px]" onClick={() => setDateRange({ from: new Date(Date.now()-30*24*60*60*1000).toISOString().split('T')[0], to: new Date().toISOString().split('T')[0] })}>
            Clear Filters
          </Button>
        </div>
      </FilterPanel>

      {/* Summary Cards */}
      {tsrData?.summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tsrData.summary.totalRecords}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Settled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tsrData.summary.settledCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(tsrData.summary.totalTransactionAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Settlement Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(tsrData.summary.totalSettlementAmount)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by TSR ID, Merchant, or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Payment Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Net Banking">Net Banking</SelectItem>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Debit Card">Debit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* TSR Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Settlement Details ({filteredRecords.length} records)
          </h2>
        </div>

        <div
          className="overflow-x-auto"
          ref={tableScrollRef}
          onScroll={onTableScroll}
          style={virtualizationEnabled ? { maxHeight: '70vh', overflowY: 'auto' } : undefined}
        >
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  TSR ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Merchant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Payment Mode
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-700">
                  Transaction Amt
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-700">
                  Charges
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-700">
                  Settlement Amt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  UTR
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Settlement Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-600">
                    No TSR records found
                  </td>
                </tr>
              ) : (
                virtualizationEnabled && virtRowHeight > 0 && virtViewportHeight > 0 ? (
                  (() => {
                    const total = filteredRecords.length;
                    const rh = virtRowHeight || 56;
                    const overscan = 10;
                    const startIndex = Math.max(0, Math.floor(virtScrollTop / rh) - overscan);
                    const visibleCount = Math.ceil(virtViewportHeight / rh) + overscan * 2;
                    const endIndex = Math.min(total, startIndex + visibleCount);
                    const slice = filteredRecords.slice(startIndex, endIndex);
                    const topPad = startIndex * rh;
                    const bottomPad = Math.max(0, (total - endIndex) * rh);
                    return (
                      <>
                        {topPad > 0 && (<tr style={{ height: topPad }}><td colSpan={9}></td></tr>)}
                        {slice.map((record) => (
                          <tr key={record.tsrId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{record.tsrId}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{record.merchantName}</div>
                                <div className="text-gray-500">{record.merchantId}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{record.paymentMode}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(record.transactionAmount)}</td>
                            <td className="px-4 py-3 text-right text-sm text-red-600">{formatCurrency(record.charges)}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">{formatCurrency(record.settlementAmount)}</td>
                            <td className="px-4 py-3">
                              <Badge className={`${getStatusColor(record.status)} flex items-center gap-1 w-fit`}>
                                {getStatusIcon(record.status)}
                                {record.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{record.utr || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(record.settlementDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {bottomPad > 0 && (<tr style={{ height: bottomPad }}><td colSpan={9}></td></tr>)}
                      </>
                    );
                  })()
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.tsrId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {record.tsrId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {record.merchantName}
                          </div>
                          <div className="text-gray-500">
                            {record.merchantId}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.paymentMode}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(record.transactionAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-red-600">
                        {formatCurrency(record.charges)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                        {formatCurrency(record.settlementAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${getStatusColor(record.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {record.utr || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(record.settlementDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
