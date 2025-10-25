'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Download, Loader2, Calendar, Building2, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { formatIndianNumber } from '@/lib/utils';

interface SettlementTransaction {
  client_code: string;
  client_name: string;
  client_txn_id: string;
  txn_id: string;
  payee_amount: number;
  act_amount: number;
  paid_amount: number;
  settlement_amount: number;
  settlement_date: string;
  trans_date: string;
  settlement_bank_amount: number;
  settlement_bank_amount_date: string;
  settlement_by: string;
}

interface SettlementReportResponse {
  results: SettlementTransaction[];
}

export default function SettlementReportPage() {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [clientCode, setClientCode] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const [clientList, setClientList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [reportData, setReportData] = useState<SettlementReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [userName, setUserName] = useState<string>('');

  // Do not block page load with client list; lazy load when needed
  const [clientsLoaded, setClientsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setUserName(resolveUserName());
    // Deep link support: ?client=QCCLI&from=YYYY-MM-DD&to=YYYY-MM-DD
    try {
      const sp = new URLSearchParams(window.location.search);
      const qClient = sp.get('client');
      const qFrom = sp.get('from');
      const qTo = sp.get('to');
      if (qClient) setClientCode(qClient);
      if (qFrom) setFromDate(qFrom);
      if (qTo) setEndDate(qTo);
      if (qClient && qFrom && qTo) setTimeout(() => { handleSearch(); }, 0);
    } catch {}
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Only trigger search if we already have data loaded (not initial load)
    if (!reportData || !searchTerm) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      setIsLoading(true);

      fetchSettlements(1, pageSize)
        .catch(() => {}) // Error already handled in fetchSettlements
        .finally(() => setIsLoading(false));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Only depend on searchTerm
  const ensureClients = async () => {
    if (clientsLoaded) {
      return;
    }

    if (!userName) {
      toast.error('User information missing; unable to load clients');
      return;
    }

    try {
      const clients = await ReportApiService.getClientCodeListUSP_Cached(userName);
      setClientList(clients || []);
      setClientsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch client list:', error);
      toast.error('Failed to load client list');
    }
  };

  // Shared function to fetch settlements with pagination and search
  const fetchSettlements = async (page: number, length: number, showSuccessToast = false) => {
    try {
      const inputData = {
        clientCode,
        fromDate,
        endDate,
        noOfClient: 0,
        rpttype: 1,
        page,
        length,
        search: searchTerm || undefined, // ✅ Send search to backend
      };
      const response = await ReportApiService.getSettlementReport(inputData);

      // Handle paginated response
      if (response && typeof response === 'object' && 'results' in response) {
        setReportData({ results: response.results || [] });
        setTotalCount(response.count || 0);

        if (showSuccessToast) {
          toast.success(`Found ${formatIndianNumber(response.count || 0)} settlements`);
        }
      } else {
        // Fallback for non-paginated response (when page=0 or length=0)
        setReportData({ results: Array.isArray(response) ? response : [] });
        setTotalCount(Array.isArray(response) ? response.length : 0);

        if (showSuccessToast && Array.isArray(response)) {
          toast.success(`Found ${formatIndianNumber(response.length)} settlements`);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch settlements:', err);
      setError(err);
      setReportData({ results: [] });
      setTotalCount(0);
      toast.error('Failed to load settlement report');
      throw err; // Re-throw for caller to handle
    }
  };

  // Fetch settlement report with backend pagination
  const handleSearch = async () => {
    if (!clientCode) {
      toast.error('Please select a client code');
      return;
    }

    // Validate date range: To >= From and max 92 days like Angular screens
    const d1 = new Date(fromDate);
    const d2 = new Date(endDate);
    const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    if (Number.isNaN(diffDays) || diffDays < 0) {
      toast.error('Invalid date range');
      return;
    }
    if (diffDays > 92) {
      toast.error('Date range cannot exceed 92 days');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page on new search

    try {
      await fetchSettlements(1, pageSize, true);
    } catch (err) {
      // Error already handled in fetchSettlements
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
      await fetchSettlements(newPage, pageSize);
    } catch (err) {
      // Error already handled in fetchSettlements
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page size change
  const handlePageSizeChange = async (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    setIsLoading(true);

    try {
      await fetchSettlements(1, newSize);
    } catch (err) {
      // Error already handled in fetchSettlements
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!reportData?.results || reportData.results.length === 0) {
      toast.error('No data to export');
      return;
    }
    setIsLoading(true);
    try {
      await ReportApiService.requestSettledTxnExcelV6({
        clientCode,
        fromDate,
        endDate,
        loginBy: userName,
      });
      toast.info('Export started. Preparing CSV on server...');
      const url = await ReportApiService.waitForExportUrl({
        createdBy: userName,
        sourceStartsWith: 'v6_settled_txn_excel',
        pollMs: 3000,
        timeoutMs: 120000,
      });
      if (url) {
        window.open(url, '_blank');
        toast.success('CSV is ready. Download started.');
      } else {
        toast.info('Export queued. Check Jobs later.');
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      toast.error('Failed to start export');
    } finally {
      setIsLoading(false);
    }
  };

  // Backend pagination - display current page data directly
  const transactions = reportData?.results || [];

  // ✅ No client-side filtering - search is handled by backend
  const paginatedTransactions = transactions; // Backend handles search and pagination

  // Use backend totalCount for pagination calculation
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="p-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl text-gray-700 hover:text-gray-900 hover:border-gray-300 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
              View Settlement Reports
            </h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
              Search and view settlement transaction details
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-20 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-0.5 md:mb-1" style={{ letterSpacing: '-0.02em' }}>Search Filters</h3>
          <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select filters to narrow down your settlement search</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
              Client Code <span className="text-red-700">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Combobox
                  options={[
                    { value: '', label: 'Select Client' },
                    { value: 'ALL', label: 'ALL - All Clients' },
                    ...(Array.isArray(clientList) ? clientList.map((client: any) => ({
                      value: client.client_code || client.clientCode,
                      label: `${client.client_code || client.clientCode} - ${client.client_name || client.clientName}`
                    })) : [])
                  ]}
                  value={clientCode}
                  onChange={(value) => setClientCode(value)}
                  placeholder="Select Client"
                  searchPlaceholder="Search by code or name..."
                  onOpenChange={async (open) => {
                    if (open && !clientsLoaded) {
                      await ensureClients();
                    }
                  }}
                  className="min-h-[44px] touch-manipulation"
                />
              </div>
              <button
                type="button"
                onClick={() => setClientCode('ALL')}
                className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700 transition-colors"
              >
                ALL
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
              From Date
            </label>
            <DatePicker
              value={fromDate}
              onChange={(date) => setFromDate(date)}
              placeholder="Select from date"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
              To Date
            </label>
            <DatePicker
              value={endDate}
              onChange={(date) => setEndDate(date)}
              placeholder="Select to date"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 pt-3 md:pt-2 border-t border-gray-200">
          <button
            onClick={handleSearch}
            disabled={isLoading || !clientCode}
            className="flex-1 sm:flex-none min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden xs:inline">Searching...</span>
                <span className="xs:hidden">Search</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden xs:inline">Search Settlements →</span>
                <span className="xs:hidden">Search →</span>
              </>
            )}
          </button>
          {!clientCode && (
            <p className="w-full text-xs text-gray-600 mt-1">
              Select a client code to enable search (choose a specific client or ALL).
            </p>
          )}
        </div>
      </div>

      {/* Search Bar and Total Records */}
      {!isLoading && reportData && (
        <div className="relative z-10 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
          <div className="mb-4 md:mb-5">
            <h3 className="text-sm md:text-base font-extrabold text-gray-900 mb-0.5 md:mb-1 flex items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
              <Search className="w-4 md:w-5 h-4 md:h-5 text-orange-500" />
              Quick Search
            </h3>
            <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Search within your filtered results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-end">
            <div className="md:col-span-2 relative">
              <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>Search Query</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="search"
                  autoComplete="off"
                  placeholder="Search by client code, name, transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 h-11 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="p-2 md:p-2.5 bg-white rounded-lg shadow-sm">
                <FileSpreadsheet className="w-4 md:w-5 h-4 md:h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-600 font-medium">Total Records</p>
                <p className="text-lg md:text-xl font-bold text-orange-600">{formatIndianNumber(transactions.length)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && reportData && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
          {/* Results Header */}
          <div className="border-b border-gray-200 p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Settlement Transactions</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                  Total Records: <span className="text-gray-900 font-extrabold">{totalCount}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 h-11 md:h-10 min-h-[44px] md:min-h-[40px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>

                {transactions.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all min-h-[52px]"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden xs:inline">Export to Excel</span>
                    <span className="xs:hidden">Export</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {paginatedTransactions.map((txn, index) => (
              <div key={startIndex + index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Header with Client Code */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Client Code</p>
                    <p className="font-mono text-sm font-bold text-blue-600 truncate">
                      {txn.client_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">#{startIndex + index + 1}</p>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">SP Transaction ID</p>
                    <p className="font-semibold text-gray-900 truncate">{txn.txn_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Payer Amount</p>
                    <p className="font-semibold text-gray-900">₹{txn.payee_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Actual Amount</p>
                    <p className="font-semibold text-gray-900">₹{txn.act_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Settlement Amount</p>
                    <p className="font-semibold text-orange-600">₹{txn.settlement_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Settlement Date</p>
                    <p className="text-gray-900 text-xs">{txn.settlement_date ? new Date(txn.settlement_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Client Name</p>
                    <p className="text-gray-900 truncate">{txn.client_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Trans Date</p>
                    <p className="text-gray-600 text-xs">{txn.trans_date ? new Date(txn.trans_date).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Settled By</p>
                    <p className="text-gray-700 truncate">{txn.settlement_by || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>#</th>
                  <th className="sticky left-0 z-20 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Client Code</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Client Name</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Client Txn ID</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>SP Txn ID</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Actual Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Paid Amount</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Settlement Amt</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Settlement Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Trans Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Bank Settlement Amt</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Bank Settlement Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Settled By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((txn, index) => (
                  <tr key={startIndex + index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{startIndex + index + 1}</td>
                    <td className="sticky left-0 z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-blue-600 font-semibold whitespace-nowrap">{txn.client_code}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">{txn.client_name}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.client_txn_id}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.txn_id}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 text-right">₹{txn.payee_amount?.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 text-right">₹{txn.act_amount?.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 text-right">₹{txn.paid_amount?.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm font-semibold text-orange-600 text-right">₹{txn.settlement_amount?.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">{txn.settlement_date ? new Date(txn.settlement_date).toLocaleString() : '-'}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">{txn.trans_date ? new Date(txn.trans_date).toLocaleString() : '-'}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 text-right">₹{txn.settlement_bank_amount?.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">{txn.settlement_bank_amount_date ? new Date(txn.settlement_bank_amount_date).toLocaleString() : '-'}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.settlement_by || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 md:px-6 py-3 md:py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                <p className="text-xs md:text-sm text-gray-700 text-center sm:text-left font-light" style={{ letterSpacing: '-0.01em' }}>
                  Showing <span className="font-extrabold text-gray-900">{startIndex + 1}</span> to{' '}
                  <span className="font-extrabold text-gray-900">{Math.min(startIndex + pageSize, totalCount)}</span> of{' '}
                  <span className="font-extrabold text-orange-600">{formatIndianNumber(totalCount)}</span> entries
                </p>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="h-11 md:h-9 min-h-[44px] md:min-h-[36px] px-3 md:px-2 bg-white border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-900 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="px-3 md:px-4 py-2.5 md:py-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg text-xs md:text-sm font-bold text-white shadow-md whitespace-nowrap min-h-[44px] md:min-h-[36px] flex items-center">
                    <span>{currentPage}</span>
                    <span className="mx-1 md:mx-1.5 text-orange-200">/</span>
                    <span className="text-orange-100">{totalPages}</span>
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-11 md:h-9 min-h-[44px] md:min-h-[36px] px-3 md:px-2 bg-white border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-900 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data Message */}
      {!isLoading && reportData && transactions.length === 0 && (
        <div className="text-center py-12 md:py-16 bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl shadow-lg px-4">
          <div className="max-w-md mx-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
            </div>
            <h4 className="text-base md:text-lg font-extrabold text-gray-900 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>No Settlements Found</h4>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 font-light" style={{ letterSpacing: '-0.01em' }}>No settlement records found for the selected criteria. Please try different filters.</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl md:rounded-2xl p-6 text-red-400">
          Failed to load settlement report. Please try again.
        </div>
      )}
    </div>
  );
}
