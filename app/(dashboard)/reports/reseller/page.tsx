'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
// XLSX is lazy-loaded during export to keep bundle small
import {
  ArrowLeft,
  Download,
  Search,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import ReportApiService from '@/services/api/ReportApiService';
import { useDebounce } from '@/hooks/useDebounce';

interface ResellerOption {
  code: string;
  name: string;
}

interface ReferralReportRecord {
  client_code: string;
  client_name: string;
  txn_count: number;
  txn_paid_amount: number;
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

export default function ReferralReportPage() {
  const [resellers, setResellers] = useState<ResellerOption[]>([{ code: 'All', name: 'All' }]);
  const [selectedReseller, setSelectedReseller] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [dataSource, setDataSource] = useState<ReferralReportRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResellers, setIsLoadingResellers] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const load = async () => {
      setIsLoadingResellers(true);
      try {
        const list = await ReportApiService.getResellerList();
        const options = (Array.isArray(list?.result) ? list.result : list || [])
          .map((item: any) => ({
            code: String(item.loginMasterId ?? item.loginMasterID ?? item.code ?? '').trim(),
            name: String(item.name ?? item.loginMasterId ?? '').trim(),
          }))
          .filter((option) => option.code && option.name);

        setResellers([{ code: 'All', name: 'All' }, ...options]);
      } catch (error) {
        console.error('Failed to load reseller list', error);
        toast.error('Failed to load referral list');
        setResellers([{ code: 'All', name: 'All' }]);
      } finally {
        setIsLoadingResellers(false);
      }
    };

    load();
  }, []);

  const fetchReport = useCallback(async () => {
    if (!selectedReseller) {
      toast.error('Please select a referral name');
      return;
    }

    if (!fromDate || !toDate) {
      toast.error('Please select From and To dates');
      return;
    }

    const dFrom = new Date(fromDate)
    const dTo = new Date(toDate)
    if (dFrom > dTo) {
      toast.error('From Date cannot be after To Date');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const payload = {
        referral_code: selectedReseller,
        paymentStatus: selectedStatus,
        fromDate,
        endDate: toDate,
      };

      const response = await ReportApiService.getResellerReport(payload);
      const records = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
        ? response.results
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setDataSource(records as ReferralReportRecord[]);
      setErrorState(records.length === 0);
      if (records.length === 0) {
        toast.error('No data found for the selected criteria');
      } else {
        toast.success(`Found ${records.length} records`);
      }
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch referral report', error);
      toast.error('Failed to fetch referral report');
      setDataSource([]);
      setErrorState(true);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate, selectedReseller, selectedStatus]);

  const handleClear = () => {
    setSelectedReseller('All');
    setSelectedStatus('All');
    setFromDate('');
    setToDate('');
    setSearchTerm('');
    setDataSource([]);
    setCurrentPage(1);
    setHasSearched(false);
    setErrorState(false);
  };

  const filteredData = useMemo(() => {
    if (!debouncedSearch?.trim()) return dataSource;
    const term = debouncedSearch.trim().toLowerCase();
    return dataSource.filter((record) =>
      record.client_code?.toLowerCase().includes(term) ||
      record.client_name?.toLowerCase().includes(term) ||
      record.txn_count?.toString().includes(term) ||
      record.txn_paid_amount?.toString().includes(term)
    );
  }, [dataSource, debouncedSearch]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredData.length / pageSize)),
    [filteredData.length, pageSize]
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const summary = useMemo(() => {
    if (dataSource.length === 0) {
      return {
        totalClients: 0,
        totalTransactions: 0,
        totalAmount: 0,
      };
    }
    return dataSource.reduce(
      (acc, record) => ({
        totalClients: acc.totalClients + 1,
        totalTransactions: acc.totalTransactions + (Number(record.txn_count) || 0),
        totalAmount: acc.totalAmount + (Number(record.txn_paid_amount) || 0),
      }),
      { totalClients: 0, totalTransactions: 0, totalAmount: 0 }
    );
  }, [dataSource]);

  const handleExport = async () => {
    if (filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const rows = filteredData.map((record, index) => ({
        '#': index + 1,
        'Client Code': record.client_code || 'N/A',
        'Client Name': record.client_name || 'N/A',
        'Transaction Count': Number(record.txn_count) || 0,
        'Transaction Paid Amount': Number(record.txn_paid_amount) || 0,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'ReferralReport');
      XLSX.writeFile(workbook, `referral-report-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 min-h-[44px] touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Referral Report</h1>
            <p className="text-sm text-gray-600 mt-1">
              View transaction performance for referred clients
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="min-h-[44px] touch-manipulation"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card className="p-4 md:p-6 relative z-30">
        <div className="space-y-4 md:space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Filter Options</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select referral name, date range, and payment status to generate report
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 relative z-50">
              <label className="block text-sm font-medium text-gray-900">
                Referral Name
              </label>
              <Combobox
                options={resellers.map((r) => ({ value: r.code, label: r.name }))}
                value={selectedReseller}
                onChange={(value) => {
                  setSelectedReseller(value);
                  setCurrentPage(1);
                }}
                placeholder={isLoadingResellers ? 'Loading...' : 'Select referral'}
                searchPlaceholder="Search referral..."
                disabled={isLoadingResellers}
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div className="space-y-2 relative z-50">
              <label className="block text-sm font-medium text-gray-900">
                From Date
              </label>
              <DatePicker
                value={fromDate}
                onChange={(val) => setFromDate(val)}
                placeholder="Select from date"
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div className="space-y-2 relative z-50">
              <label className="block text-sm font-medium text-gray-900">
                To Date
              </label>
              <DatePicker
                value={toDate}
                onChange={(val) => setToDate(val)}
                placeholder="Select to date"
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div className="space-y-2 relative z-50">
              <label className="block text-sm font-medium text-gray-900">
                Payment Status
              </label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                <SelectTrigger className="min-h-[44px] touch-manipulation">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="NOT COMPLETE">NOT COMPLETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={fetchReport}
              disabled={isLoading || isLoadingResellers}
              className="min-h-[44px] touch-manipulation"
            >
              {isLoading ? 'Loading…' : 'Submit'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading && !hasSearched}
              className="min-h-[44px] touch-manipulation"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4 md:p-6">
          <p className="text-xs uppercase tracking-wide text-gray-600">Total Clients</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.totalClients}</p>
        </Card>
        <Card className="p-4 md:p-6">
          <p className="text-xs uppercase tracking-wide text-gray-600">Total Transactions</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.totalTransactions.toLocaleString()}</p>
        </Card>
        <Card className="p-4 md:p-6">
          <p className="text-xs uppercase tracking-wide text-gray-600">Total Paid Amount</p>
          <p className="text-2xl font-semibold text-gray-900">{INR.format(summary.totalAmount)}</p>
        </Card>
      </div>

      {hasSearched && (
        <Card className="p-4 md:p-6">
          <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            <div className="relative w-full md:max-w-md z-10">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                placeholder="Search results..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 min-h-[44px] touch-manipulation"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Rows per page</span>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[100px] min-h-[44px] touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {!hasSearched ? (
          <div className="p-8 md:p-12 text-center text-gray-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-3" />
            <p className="text-sm md:text-base">Select filters and click Submit to view the referral report.</p>
          </div>
        ) : errorState ? (
          <div className="p-8 md:p-12 text-center text-red-500">
            <p className="text-sm md:text-base">No data found for the selected criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="md:hidden text-xs text-gray-600 px-4 py-2 bg-gray-50 border-b border-gray-200">
                Scroll horizontally to view all columns
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900">
                  <tr>
                    <th className="px-3 md:px-4 py-3 text-left whitespace-nowrap">#</th>
                    <th className="px-3 md:px-4 py-3 text-left whitespace-nowrap">Client Code</th>
                    <th className="px-3 md:px-4 py-3 text-left whitespace-nowrap">Client Name</th>
                    <th className="px-3 md:px-4 py-3 text-right whitespace-nowrap">Transaction Count</th>
                    <th className="px-3 md:px-4 py-3 text-right whitespace-nowrap">Transaction Paid Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-3 md:px-4 py-8 md:py-12 text-center text-gray-600">
                        Loading report data...
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 md:px-4 py-8 md:py-12 text-center text-gray-600">
                        No records match your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((record, index) => {
                      const rowNumber = (currentPage - 1) * pageSize + index + 1;
                      return (
                        <tr
                          key={`${record.client_code}-${rowNumber}`}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-3 md:px-4 py-3 text-gray-600 whitespace-nowrap">{rowNumber}</td>
                          <td className="px-3 md:px-4 py-3 font-mono text-gray-900 whitespace-nowrap">
                            {record.client_code}
                          </td>
                          <td className="px-3 md:px-4 py-3 text-gray-900">
                            {record.client_name}
                          </td>
                          <td className="px-3 md:px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                            {record.txn_count?.toLocaleString() || 0}
                          </td>
                          <td className="px-3 md:px-4 py-3 text-right font-semibold text-green-600 whitespace-nowrap">
                            {INR.format(Number(record.txn_paid_amount) || 0)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredData.length > 0 && (
              <div className="border-t border-gray-200 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="min-h-[44px] touch-manipulation"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 whitespace-nowrap px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="min-h-[44px] touch-manipulation"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
