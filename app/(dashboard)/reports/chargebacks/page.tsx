'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
// XLSX is lazy-loaded during export to keep bundle small
import {
  Search,
  Download,
  AlertCircle,
  RotateCcw,
  FileSpreadsheet,
  Loader2,
  Building2,
  Calendar
} from 'lucide-react';
import ReportApiService from '@/services/api/ReportApiService';
import { useRouter } from 'next/navigation';
import { resolveUserName } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox';
import { useDebounce } from '@/hooks/useDebounce';

interface ChargebackTransaction {
  client_code?: string;
  client_name?: string;
  client_txn_id?: string;
  txn_id?: string;
  payment_mode?: string;
  payee_amount?: number | string;
  paid_amount?: number | string;
  charge_back_amount?: number | string;
  charge_back_date?: string;
  charge_back_debit_amount?: number | string;
  charge_back_credit_date_to_merchant?: string;
  charge_back_remarks?: string;
  status?: string;
  charge_back_status?: string;
  arn?: string;
  bank_cb_fee?: number | string;
  merchant_cb_status?: string;
  prearb_date?: string;
  cb_credit_date_txn_reject?: string;
  [key: string]: unknown;
}

const TABLE_COLUMNS: Array<{ key: keyof ChargebackTransaction; label: string }> = [
  { key: 'client_code', label: 'Client Code' },
  { key: 'client_name', label: 'Client Name' },
  { key: 'client_txn_id', label: 'Client Txn ID' },
  { key: 'txn_id', label: 'SP Txn ID' },
  { key: 'payment_mode', label: 'Payment Mode' },
  { key: 'payee_amount', label: 'Payer Amount (INR)' },
  { key: 'paid_amount', label: 'Round Off Paid Amount (INR)' },
  { key: 'charge_back_amount', label: 'Chargeback Amount' },
  { key: 'charge_back_date', label: 'Chargeback Date' },
  { key: 'charge_back_debit_amount', label: 'Chargeback Debit Amount' },
  { key: 'charge_back_credit_date_to_merchant', label: 'CB Credit Date To Merchant' },
  { key: 'charge_back_remarks', label: 'Chargeback Remarks' },
  { key: 'status', label: 'Status' },
  { key: 'charge_back_status', label: 'Chargeback Status' },
  { key: 'arn', label: 'ARN' },
  { key: 'bank_cb_fee', label: 'Bank Chargeback Fee' },
  { key: 'merchant_cb_status', label: 'Merchant Chargeback Status' },
  { key: 'prearb_date', label: 'Prearb Date' },
  { key: 'cb_credit_date_txn_reject', label: 'CB Credit Date Txn Reject' }
];

export default function ChargebackReportPage() {
  const router = useRouter();
  const [chargebacks, setChargebacks] = useState<ChargebackTransaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [clientCodeList, setClientCodeList] = useState<any[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const debouncedTableSearch = useDebounce(tableSearchTerm, 300);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [userName, setUserName] = useState<string>('');

  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setUserName(resolveUserName());

    const today = getCurrentDate();
    setDateFrom(today);
    setDateTo(today);

    // Deep link support: ?client=QCCLI&from=YYYY-MM-DD&to=YYYY-MM-DD
    try {
      const sp = new URLSearchParams(window.location.search);
      const qClient = sp.get('client');
      const qFrom = sp.get('from');
      const qTo = sp.get('to');
      if (qClient) setSelectedClient(qClient);
      if (qFrom) setDateFrom(qFrom);
      if (qTo) setDateTo(qTo);
      if (qClient && qFrom && qTo) setTimeout(() => { fetchChargebackReport(); }, 0);
    } catch {}
  }, []);

  const fetchClientCodeList = useCallback(async (loginBy: string) => {
    const normalizedLogin = loginBy?.trim();

    if (!normalizedLogin) {
      toast.error('Unable to load client list: missing user identity');
      return;
    }

    try {
      const response = await ReportApiService.getClientCodeListUSP_Cached(normalizedLogin);
      setClientCodeList(response || []);
    } catch (error) {
      console.error('clientCodeList not found!', error);
      toast.error('Failed to load client list');
    }
  }, []);

  useEffect(() => {
    if (!userName) {
      return;
    }

    fetchClientCodeList(userName);
  }, [userName, fetchClientCodeList]);

  // Debounced search effect
  useEffect(() => {
    // Only trigger search if we already have data loaded
    if (!showGrid || chargebacks.length === 0) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      setIsLoading(true);

      fetchChargebacks(1, pageSize)
        .catch(() => {}) // Error already handled in fetchChargebacks
        .finally(() => setIsLoading(false));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tableSearchTerm]); // Only depend on tableSearchTerm

  // Shared function to fetch chargebacks with pagination and search
  const fetchChargebacks = async (page: number, length: number, showSuccessToast = false) => {
    try {
      const response = await ReportApiService.getChargebackTxnHistory({
        clientCode: selectedClient,
        fromDate: dateFrom,
        endDate: dateTo,
        noOfClient: 0,
        rpttype: 1,
        page,
        length,
        search: tableSearchTerm || undefined
      });

      // Handle paginated response
      if (response && typeof response === 'object' && 'results' in response) {
        setChargebacks(response.results || []);
        setTotalCount(response.count || 0);
        setShowGrid(true);
        setErrorMsg(false);

        if (showSuccessToast) {
          toast.success(`Found ${response.count || 0} chargeback records`);
        }
      } else {
        // Fallback for non-paginated response (when page=0 or length=0)
        const data = Array.isArray(response) ? response : [];
        setChargebacks(data);
        setTotalCount(data.length);
        setShowGrid(true);
        setErrorMsg(data.length === 0);

        if (showSuccessToast) {
          if (data.length > 0) {
            toast.success(`Found ${data.length} chargeback records`);
          } else {
            toast.info('No chargebacks found for the selected filters');
          }
        }
      }
    } catch (error) {
      console.error('Exception: Chargeback report not found', error);
      setChargebacks([]);
      setTotalCount(0);
      setErrorMsg(true);
      setShowGrid(false);
      toast.error('Failed to fetch chargeback report');
      throw error;
    }
  };

  const fetchChargebackReport = async () => {
    if (!selectedClient) {
      toast.error('Please select a client code or choose ALL.');
      return;
    }

    if (!dateFrom || !dateTo) {
      toast.error('Please select date range');
      return;
    }

    const fromDateObj = new Date(dateFrom);
    const toDateObj = new Date(dateTo);
    const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (Number.isNaN(daysDiff)) {
      toast.error('Invalid date range');
      return;
    }

    if (daysDiff < 0) {
      toast.error('To Date must be after From Date');
      return;
    }

    if (daysDiff > 92) {
      toast.error('Date range cannot exceed 92 days');
      return;
    }

    setIsLoading(true);
    setCurrentPage(0);

    try {
      await fetchChargebacks(1, pageSize, true);
    } catch (error) {
      // Error already handled in fetchChargebacks
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change with backend pagination
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage) return;

    setCurrentPage(newPage);
    setIsLoading(true);

    try {
      await fetchChargebacks(newPage + 1, pageSize); // +1 because currentPage is 0-indexed
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page size change
  const handlePageSizeChange = async (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
    setIsLoading(true);

    try {
      await fetchChargebacks(1, newSize);
    } catch (error) {
      // Error already handled
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setClientSearchTerm('');
    setTableSearchTerm('');
    setSelectedClient('ALL');
    const today = getCurrentDate();
    setDateFrom(today);
    setDateTo(today);
    setChargebacks([]);
    setShowGrid(false);
    setErrorMsg(false);
    setCurrentPage(0);
  };

  const exportingRef = React.useRef<boolean>(false);

  const handleExport = async () => {
    if (exportingRef.current) return;
    if (chargebacks.length === 0) {
      toast.error('No data to export. Please search data first.');
      return;
    }
    setIsLoading(true);
    exportingRef.current = true;
    try {
      const resp = await ReportApiService.requestChargebackTxnExcelV6({
        clientCode: selectedClient,
        fromDate: dateFrom,
        endDate: dateTo,
        loginBy: userName,
        search: tableSearchTerm || undefined,
      });
      if (resp && typeof resp === 'object' && (resp as any).detail) {
        toast.success((resp as any).detail);
      } else {
        toast.info('Export started. Redirecting to Exports…');
      }
      router.push('/exports');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to start export');
    } finally {
      setIsLoading(false);
      exportingRef.current = false;
    }
  };

  // ✅ No client-side filtering - search is handled by backend
  const paginatedData = chargebacks; // Backend handles search and pagination

  // Use backend totalCount for pagination calculation
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div className="pb-3 md:pb-4 border-b border-gray-200">
        <h4 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
          Chargeback Report
        </h4>
        <p className="text-gray-600 text-xs md:text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>View chargeback history by client</p>
      </div>

      {/* Important Notice Alert */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-700 font-extrabold text-sm md:text-base" style={{ letterSpacing: '-0.02em' }}>Important Notice</p>
            <p className="text-orange-700 text-xs md:text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
              Select a specific client or choose ALL. Large ranges with ALL may take longer.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="relative z-20 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Section Header */}
          <div className="pb-3 border-b border-gray-200">
            <h5 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Search Filters</h5>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5 font-light" style={{ letterSpacing: '-0.01em' }}>Select client and date range to view chargeback data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="relative z-50">
              <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
                <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
                Client Code <span className="text-red-700">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Combobox
                    options={[
                      { value: 'ALL', label: 'ALL - All Clients' },
                      ...((Array.isArray(clientCodeList) ? clientCodeList : []).map((client: any) => ({
                        value: client.client_code || client.clientcode || client.clientCode,
                        label: `${client.client_code || client.clientcode || client.clientCode} - ${client.client_name || client.clientname || client.clientName || ''}`
                      })))
                    ]}
                    value={selectedClient}
                    onChange={(value) => setSelectedClient(value)}
                    onOpenChange={(open) => {
                      if (open && userName && clientCodeList.length === 0) {
                        fetchClientCodeList(userName);
                      }
                    }}
                    placeholder="Select Client"
                    searchPlaceholder="Search client..."
                    className="min-h-[44px] touch-manipulation"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClient('ALL')}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700 transition-colors"
                >
                  ALL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
                <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
                From Date
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(val) => setDateFrom(val)}
                placeholder="Select start date"
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
                <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
                To Date
              </label>
              <DatePicker
                value={dateTo}
                onChange={(val) => setDateTo(val)}
                placeholder="Select end date"
                className="min-h-[44px] touch-manipulation"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 pt-2">
            <button
              onClick={fetchChargebackReport}
              disabled={isLoading}
              className="min-h-[52px] touch-manipulation px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm md:text-base font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Search className="w-4 h-4" /> Search →</span>
              )}
            </button>
            <button
              onClick={handleExport}
              disabled={chargebacks.length === 0}
              className="min-h-[52px] touch-manipulation px-4 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm md:text-base rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export to Excel
            </button>
          </div>

          {/* Search and Pagination Section */}
          <div className="pt-3 border-t border-gray-200">
            <h6 className="text-sm md:text-base font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.02em' }}>Search Results</h6>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7 relative z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={tableSearchTerm}
                    onChange={(e) => {
                      setTableSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                    placeholder="Search in results..."
                    className="w-full min-h-[44px] touch-manipulation pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-xl border border-gray-300 rounded-xl text-gray-900 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                <label className="text-xs md:text-sm text-gray-700 font-extrabold" style={{ letterSpacing: '-0.02em' }}>Count Per Page</label>
              </div>

              <div className="md:col-span-3">
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className="w-full min-h-[44px] touch-manipulation bg-white/90 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 text-gray-900">
                    {[10,25,50,100].map((size) => (
                      <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors min-h-[44px] touch-manipulation"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {showGrid ? (
        <div className="flex items-center justify-between px-2">
          <div className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
            Showing <span className="text-gray-900 font-extrabold">{paginatedData.length}</span> of{' '}
            <span className="text-gray-900 font-extrabold">{totalCount}</span> total records
            {tableSearchTerm && ` (filtered)`}
          </div>
        </div>
      ) : !isLoading && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl p-8 md:p-12 text-center">
          <FileSpreadsheet className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-600 mb-2 font-extrabold text-sm md:text-base" style={{ letterSpacing: '-0.02em' }}>No data loaded</div>
          <div className="text-xs md:text-sm text-gray-500 font-light" style={{ letterSpacing: '-0.01em' }}>Please select a client and date range, then click Search to load chargeback report</div>
        </div>
      )}

      {/* Data Table */}
      {(showGrid || isLoading) && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
          {/* Mobile scroll hint */}
          <div className="md:hidden bg-white/60 px-3 py-2 text-xs text-gray-600 text-center border-b border-gray-200">
            Scroll horizontally to view all columns
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr className="border-b-2 border-orange-200">
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    #
                  </th>
                  {TABLE_COLUMNS.map(({ key, label }) => (
                    <th key={key as string} className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      {Array.from({ length: TABLE_COLUMNS.length + 1 }).map((_, j) => (
                        <td key={j} className="px-3 md:px-4 py-2 md:py-3">
                          <div className="h-4 bg-gray-200 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-4 py-8 md:py-12 text-center">
                      <div className="text-gray-600 text-xs md:text-sm">No chargeback records found for the selected filters</div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length + 1} className="px-4 py-8 md:py-12 text-center">
                      <div className="text-gray-600 text-xs md:text-sm">No matching chargeback records found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((record, index) => {
                    // Color coding based on status
                    const statusLower = (record.charge_back_status || record.status || '').toLowerCase();
                    const isSuccess = statusLower.includes('won') || statusLower.includes('success');
                    const isFailed = statusLower.includes('lost') || statusLower.includes('failed');
                    const isPending = statusLower.includes('pending') || statusLower.includes('new');

                    return (
                      <tr
                        key={`${record.txn_id}-${index}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900 font-medium">
                          {currentPage * pageSize + index + 1}
                        </td>
                        {TABLE_COLUMNS.map(({ key }) => {
                          const value = record[key];
                          const displayValue = value !== null && value !== undefined && value !== '' ? value.toString() : 'N/A';

                          // Apply color coding to status columns
                          let colorClass = 'text-gray-900';
                          if (key === 'charge_back_status' || key === 'status' || key === 'merchant_cb_status') {
                            if (isSuccess) colorClass = 'text-green-600';
                            else if (isFailed) colorClass = 'text-red-600';
                            else if (isPending) colorClass = 'text-yellow-600';
                          }

                          return (
                            <td key={String(key)} className="px-3 md:px-4 py-2 md:py-3 whitespace-nowrap">
                              <span className={`text-xs md:text-sm ${colorClass}`}>
                                {displayValue}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="bg-white/60 px-3 md:px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left font-light" style={{ letterSpacing: '-0.01em' }}>
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} results
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                    Page <span className="font-extrabold">{currentPage + 1}</span> of <span className="font-extrabold">{totalPages}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="min-h-[52px] touch-manipulation px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="min-h-[52px] touch-manipulation px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
