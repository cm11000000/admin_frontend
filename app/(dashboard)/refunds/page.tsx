'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
// XLSX is lazy-loaded in export handler to keep bundle smaller
import {
  Search,
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  Calendar,
} from 'lucide-react';
import AdminApiClient from '@/services/api/AdminApiService';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { resolveUserName } from '@/lib/utils';

interface RefundRequest {
  client_code?: string;
  txn_id?: string;
  client_txn_id?: string;
  paid_amount?: number | string;
  udf2?: number | string; // Refund requested amount
  trans_date?: string;
  udf20?: string; // Refund initiated date
  status?: string;
  payee_first_name?: string;
  payee_mob?: string;
  payee_email?: string;
  udf3?: string; // PG Pay mode
  payment_mode?: string;
  udf1?: string; // Request from
}

interface ClientOption {
  code: string;
  name: string;
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const formatDate = (value?: string | number | null) => {
  if (!value) return 'N/A';
  const raw = String(value).trim();
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatAmount = (value?: number | string) => {
  if (value === undefined || value === null || value === '') {
    return 'N/A';
  }
  const amount = Number(value);
  return Number.isNaN(amount) ? String(value) : INR.format(amount);
};

const normaliseClient = (record: any): ClientOption | null => {
  const code =
    record?.clientcode || record?.client_code || record?.clientCode || record?.client_id || record?.code;
  const name =
    record?.clientname || record?.client_name || record?.clientName || record?.name || code;
  if (!code) return null;
  return { code: String(code).trim(), name: String(name ?? code).trim() };
};

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function MerchantRefundRequestsPage() {
  if (typeof window === 'undefined') return null;
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [dateFrom, setDateFrom] = useState(getToday());
  const [dateTo, setDateTo] = useState(getToday());
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedTxnId, setSelectedTxnId] = useState('');
  const [bankReferenceId, setBankReferenceId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const resolved = resolveUserName();
    if (resolved) setUserName(resolved);
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const data = await AdminApiClient.getCommonData(0, 0);
      const options = (Array.isArray(data) ? data : []).map(normaliseClient).filter(Boolean) as ClientOption[];
      setClients([{ code: 'ALL', name: 'All Clients' }, ...options]);
    } catch (error) {
      console.error('Unable to fetch client list', error);
      toast.error('Failed to load client list');
    }
  }, []);

  // Lazy load clients when needed, not on mount
  // useEffect(() => {
  //   loadClients();
  // }, [loadClients]);

  const fetchRefundRequests = useCallback(
    async (clientCode: string, fromDate: string, endDate: string) => {
      setIsLoading(true);
      setShowGrid(false);
      setErrorMsg(false);

      try {
        const response = await AdminApiClient.getRefundRequested(clientCode, fromDate, endDate);
        const data = Array.isArray(response) ? response : Object.values(response ?? {});

        if (data.length === 0) {
          setRefunds([]);
          setShowGrid(false);
          setErrorMsg(true);
        } else {
          setRefunds(data as RefundRequest[]);
          setShowGrid(true);
          setErrorMsg(false);
        }
      } catch (error) {
        console.error('Refund request fetch error:', error);
        setRefunds([]);
        setShowGrid(false);
        setErrorMsg(true);
        toast.error('Failed to fetch refund requests');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(() => {
    const trimmedClient = selectedClient?.trim() || 'ALL';

    if (!dateFrom || !dateTo) {
      toast.error('Please select date range');
      return;
    }

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

    if (Number.isNaN(diffDays)) {
      toast.error('Invalid date range');
      return;
    }

    if (diffDays < 0) {
      toast.error('To Date must be after From Date');
      return;
    }

    if (diffDays > 92) {
      toast.error('Date range cannot exceed 92 days');
      return;
    }

    setCurrentPage(0);
    fetchRefundRequests(trimmedClient || 'ALL', dateFrom, dateTo);
  }, [dateFrom, dateTo, selectedClient, fetchRefundRequests]);

  const handleClearFilters = () => {
    const today = getToday();
    setDateFrom(today);
    setDateTo(today);
    setSelectedClient('ALL');
    setSearchTerm('');
    setRefunds([]);
    setShowGrid(false);
    setErrorMsg(false);
    setCurrentPage(0);
  };

  const filteredRefunds = useMemo(() => {
    if (!debouncedSearch) return refunds;
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return refunds;
    return refunds.filter((refund) => {
      const fields = [
        refund.txn_id,
        refund.client_txn_id,
        refund.client_code,
        refund.payee_first_name,
        refund.payee_email,
        refund.payee_mob,
      ];
      return fields.some((field) => field?.toString().toLowerCase().includes(term));
    });
  }, [refunds, debouncedSearch]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredRefunds.length / pageSize)), [filteredRefunds.length, pageSize]);

  const paginatedRefunds = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRefunds.slice(start, start + pageSize);
  }, [filteredRefunds, currentPage, pageSize]);

  const metrics = useMemo(() => {
    if (refunds.length === 0) {
      return {
        totalRequests: 0,
        totalTxnAmount: 0,
        totalRefundReqAmount: 0,
      };
    }

    return refunds.reduce(
      (acc, refund) => {
        const txnAmount = Number(refund.paid_amount) || 0;
        const refundReq = Number(refund.udf2) || 0;
        return {
          totalRequests: acc.totalRequests + 1,
          totalTxnAmount: acc.totalTxnAmount + txnAmount,
          totalRefundReqAmount: acc.totalRefundReqAmount + refundReq,
        };
      },
      { totalRequests: 0, totalTxnAmount: 0, totalRefundReqAmount: 0 }
    );
  }, [refunds]);

  const handleExport = async () => {
    if (filteredRefunds.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const exportRows = filteredRefunds.map((item, index) => ({
        '#': index + 1,
        'Client Code': item.client_code || 'N/A',
        'Transaction ID': item.txn_id || 'N/A',
        'Client Transaction ID': item.client_txn_id || 'N/A',
        'Paid Amount': Number(item.paid_amount) || 0,
        'Refund Requested Amount': Number(item.udf2) || 0,
        'Transaction Date': formatDate(item.trans_date),
        'Refund Initiated Date': formatDate(item.udf20),
        Status: item.status || 'PENDING',
        'Payee Name': item.payee_first_name || 'N/A',
        'Payee Mobile': item.payee_mob || 'N/A',
        'Payee Email': item.payee_email || 'N/A',
        'PG Pay Mode': item.udf3 || 'N/A',
        'Payment Mode': item.payment_mode || 'N/A',
        'Request From': item.udf1 || 'N/A',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'MerchantRefundRequests');
      XLSX.writeFile(workbook, `merchant-refund-requests-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleRefundClick = (txnId?: string) => {
    if (!txnId) return;
    setSelectedTxnId(txnId);
    setBankReferenceId('');
    setShowRefundModal(true);
  };

  const handleProcessRefund = async () => {
    const trimmedRef = bankReferenceId.trim();
    if (!trimmedRef) {
      toast.error('Bank reference Id is required');
      return;
    }

    if (!selectedTxnId) {
      toast.error('Transaction Id not available');
      return;
    }

    if (!window.confirm('Are you sure you want to proceed with this refund?')) {
      return;
    }

    try {
      await AdminApiClient.processRefund(userName || 'admin', selectedTxnId, trimmedRef);
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      fetchRefundRequests(selectedClient || 'ALL', dateFrom, dateTo);
    } catch (error) {
      console.error('Refund processing error:', error);
      toast.error('Failed to process refund');
    }
  };

  const statusChipClass = (status?: string) => {
    const value = status?.toLowerCase() || '';
    if (value.includes('success') || value.includes('refunded')) {
      return 'bg-green-500/20 text-green-700 border-green-500/30';
    }
    if (value.includes('pending') || value.includes('init')) {
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    }
    if (value.includes('reject') || value.includes('fail')) {
      return 'bg-red-500/20 text-red-700 border-red-500/30';
    }
    return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Section Header */}
      <header className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Merchant Refund Requests</h1>
        <p className="text-gray-700 text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
          View merchant initiated refund requests, validate details, and trigger processing.
        </p>
      </header>

      {/* Summary Metrics */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl">
          <p className="text-xs uppercase font-extrabold text-gray-700 mb-1" style={{ letterSpacing: '-0.02em' }}>Total Requests</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{metrics.totalRequests}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl">
          <p className="text-xs uppercase font-extrabold text-gray-700 mb-1" style={{ letterSpacing: '-0.02em' }}>Total Txn Amount</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{formatAmount(metrics.totalTxnAmount)}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl sm:col-span-2 lg:col-span-1">
          <p className="text-xs uppercase font-extrabold text-gray-700 mb-1" style={{ letterSpacing: '-0.02em' }}>Total Refund Requested</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{formatAmount(metrics.totalRefundReqAmount)}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 space-y-4 relative z-20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Client Filter */}
          <div className="lg:w-64 space-y-2 relative z-50">
            <label className="block text-xs font-extrabold text-gray-700" style={{ letterSpacing: '-0.02em' }}>
              <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
              Client
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Combobox
                  options={[
                    { value: 'ALL', label: 'ALL - All Clients' },
                    ...clients.slice(0, 200).map((client) => ({
                      value: client.code,
                      label: client.name,
                    }))
                  ]}
                  value={selectedClient}
                  onChange={(value) => {
                    setSelectedClient(value);
                    setCurrentPage(0);
                  }}
                  placeholder="Select client..."
                  searchPlaceholder="Search clients..."
                  emptyMessage="No clients found"
                  onOpenChange={async (open) => {
                    if (open && clients.length === 0) {
                      await loadClients();
                    }
                  }}
                  className="w-full min-h-[44px] touch-manipulation"
                />
              </div>
              <button
                type="button"
                onClick={() => { setSelectedClient('ALL'); setCurrentPage(0); }}
                className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700 transition-colors"
              >
                ALL
              </button>
            </div>
            {clients.length > 200 && (
              <p className="text-xs text-gray-500">Showing 200 of {clients.length}. Refine search…</p>
            )}
          </div>

          {/* Date Range Filters */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-gray-700" style={{ letterSpacing: '-0.02em' }}>
                <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
                From Date
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(val) => setDateFrom(val)}
                placeholder="Select from date"
                maxDate={dateTo ? new Date(dateTo) : undefined}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-gray-700" style={{ letterSpacing: '-0.02em' }}>
                <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
                To Date
              </label>
              <DatePicker
                value={dateTo}
                onChange={(val) => setDateTo(val)}
                placeholder="Select to date"
                minDate={dateFrom ? new Date(dateFrom) : undefined}
              />
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-3 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="search"
              autoComplete="off"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search by transaction ID, client code, payee details..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/50 min-h-[44px] touch-manipulation"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-4 md:px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search →</span>
                </>
              )}
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition flex items-center justify-center gap-2 min-h-[52px] touch-manipulation font-extrabold"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleExport}
              disabled={filteredRefunds.length === 0}
              className="px-4 py-2.5 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation font-extrabold"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {showGrid ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-700 px-2 font-light" style={{ letterSpacing: '-0.01em' }}>
          <div>
            Showing <span className="text-gray-900 font-extrabold">{paginatedRefunds.length}</span> of{' '}
            <span className="text-gray-900 font-extrabold">{filteredRefunds.length}</span> records
            {searchTerm && ` (filtered from ${refunds.length})`}
          </div>
          <div>
            Page {currentPage + 1} of {totalPages}
          </div>
        </div>
      ) : !isLoading && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-8 md:p-12 text-center text-gray-700">
          <FileSpreadsheet className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-500" />
          <p className="font-extrabold text-base md:text-lg" style={{ letterSpacing: '-0.02em' }}>No data loaded</p>
          <p className="text-sm text-gray-500 mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Select a client, date range, and click Search to view refund requests.
          </p>
        </div>
      )}

      {/* Data Table */}
      {(showGrid || isLoading) && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={`loading-${idx}`} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((__, cellIdx) => (
                      <div key={cellIdx} className="h-3 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ))
            ) : paginatedRefunds.length === 0 ? (
              <div className="text-center py-8 text-gray-700">
                No matching refund requests found
              </div>
            ) : (
              paginatedRefunds.map((refund, index) => {
                const status = refund.status || 'PENDING';
                const allowRefund = status.toLowerCase().includes('pending') || status.toLowerCase().includes('init');
                const statusClass = statusChipClass(status);

                return (
                  <div key={`${refund.txn_id}-${index}`} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Header with Client Code + Status */}
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Client Code</p>
                        <p className="font-mono text-sm font-bold text-gray-900 truncate">
                          {refund.client_code || 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusClass}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Transaction ID</p>
                        <p className="font-semibold text-gray-900 truncate">{refund.txn_id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Refund Amount</p>
                        <p className="font-semibold text-green-700">{formatAmount(refund.udf2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Transaction Date</p>
                        <p className="text-gray-900 text-xs">{formatDate(refund.trans_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Payer Name</p>
                        <p className="text-gray-900 truncate">{refund.payee_first_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Payment Mode</p>
                        <p className="text-gray-900 truncate">{refund.payment_mode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Txn Amount</p>
                        <p className="text-gray-900">{formatAmount(refund.paid_amount)}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    {allowRefund && (
                      <button
                        onClick={() => handleRefundClick(refund.txn_id)}
                        className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold shadow hover:from-orange-600 hover:to-orange-700 transition"
                      >
                        Process Refund
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            {/* Mobile scroll hint */}
            <div className="md:hidden bg-gray-50 px-4 py-2 text-xs text-gray-700 text-center border-b border-gray-200">
              Scroll horizontally to view all columns
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 z-20 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Client Code</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Trans ID</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Client Trans ID</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Txn Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Refund Req. Amt</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Trans Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Refund Initiated</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payee Name</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payee Mobile</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payee Email</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>PG Pay Mode</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payment Mode</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Request From</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, rowIdx) => (
                    <tr key={`loading-${rowIdx}`} className="animate-pulse">
                      {Array.from({ length: 15 }).map((__, cellIdx) => (
                        <td key={cellIdx} className="px-3 md:px-6 py-2.5 md:py-4">
                          <div className="h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-10 text-center text-gray-600 text-sm">
                      No matching refund requests found
                    </td>
                  </tr>
                ) : (
                  paginatedRefunds.map((refund, index) => {
                    const status = refund.status || 'PENDING';
                    const allowRefund = status.toLowerCase().includes('pending') || status.toLowerCase().includes('init');
                    const statusClass = statusChipClass(status);

                    return (
                      <tr key={`${refund.txn_id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="sticky left-0 z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{refund.client_code || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 font-semibold whitespace-nowrap">{refund.txn_id || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{refund.client_txn_id || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right whitespace-nowrap">
                          <span className={Number(refund.paid_amount) > 0 ? 'text-green-700' : 'text-gray-900'}>
                            {formatAmount(refund.paid_amount)}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right whitespace-nowrap">
                          <span className={Number(refund.udf2) > 0 ? 'text-amber-700' : 'text-gray-900'}>
                            {formatAmount(refund.udf2)}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{formatDate(refund.trans_date)}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{formatDate(refund.udf20)}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusClass}`}>
                            {status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{refund.payee_first_name || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{refund.payee_mob || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 truncate max-w-[180px]">{refund.payee_email || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{refund.udf3 || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{refund.payment_mode || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{refund.udf1 || 'N/A'}</td>
                        <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm whitespace-nowrap">
                          {allowRefund ? (
                            <button
                              onClick={() => handleRefundClick(refund.txn_id)}
                              className="px-3 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all min-h-[44px] touch-manipulation"
                            >
                              Process →
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {!isLoading && paginatedRefunds.length > 0 && (
            <div className="bg-gray-50 px-3 md:px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-700 text-xs font-light" style={{ letterSpacing: '-0.01em' }}>
                <span className="whitespace-nowrap">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(0);
                  }}
                  className="bg-gray-100 text-gray-900 border border-gray-300 rounded px-3 md:px-4 py-2.5 h-11 md:h-9 min-h-[44px] md:min-h-[36px] touch-manipulation"
                >
                  {[10, 25, 50, 100, 200, 300, 400, 500].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-sm font-light" style={{ letterSpacing: '-0.01em' }}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 md:py-1.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed h-11 md:h-9 min-h-[52px] md:min-h-[36px] touch-manipulation font-extrabold"
                >
                  Previous
                </button>
                <span className="whitespace-nowrap px-2 h-11 md:h-9 min-h-[52px] md:min-h-[36px] flex items-center">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-2 md:py-1.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed h-11 md:h-9 min-h-[52px] md:min-h-[36px] touch-manipulation font-extrabold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && !isLoading && (
        <div className="bg-white/90 backdrop-blur-xl border border-red-500/30 text-red-700 rounded-xl md:rounded-2xl p-4 md:p-6 text-center">
          <p className="text-sm md:text-base">I can't find the result for you with the given search, I'm sorry, could you try it once again.</p>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Process Refund</h2>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-gray-400 hover:text-gray-900 text-2xl w-8 h-8 flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 mb-1 font-extrabold" style={{ letterSpacing: '-0.02em' }}>Transaction ID</p>
                <p className="text-base font-light text-gray-900 break-all" style={{ letterSpacing: '-0.01em' }}>{selectedTxnId}</p>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Enter Bank Reference Id
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoCapitalize="none"
                  autoComplete="off"
                  value={bankReferenceId}
                  onChange={(event) => setBankReferenceId(event.target.value)}
                  placeholder="Bank reference Id"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077FF]/50 min-h-[44px] touch-manipulation"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleProcessRefund}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-extrabold rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-700 transition min-h-[52px] touch-manipulation"
                >
                  Submit →
                </button>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition min-h-[52px] touch-manipulation font-extrabold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center text-gray-700 text-sm py-4">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading refund requests...
        </div>
      )}

      {/* Information Alert */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs md:text-sm text-orange-700 font-light" style={{ letterSpacing: '-0.01em' }}>
            Only refund requests in pending/initiated status can be processed. Ensure the bank reference Id you submit matches the settlement transaction for accurate reconciliation.
          </p>
        </div>
      </div>
    </div>
  );
}
