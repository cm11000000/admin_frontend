'use client';

/**
 * Transaction History Page - V5 with Angular API Integration
 * Matches Angular transaction-report.component.ts API calls exactly
 * Uses same filter parameters, pagination, and export logic as Angular
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  transactionService,
  AngularTransactionFilter
} from '@/services/api/TransactionApiService';
import ReportApiService from '@/services/api/ReportApiService';
import { useRouter } from 'next/navigation';
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  CreditCard,
  Building2,
  Loader2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { toast } from '@/lib/toast';
import { resolveUserName } from '@/lib/utils';
import { formatCurrency, formatIndianNumber } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TransactionsPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  // State - matches Angular component state
  const [transactions, setTransactions] = useState<any[]>([]);
  // Progressive row rendering for very large pages to keep UI responsive
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [clientCodeList, setClientCodeList] = useState<any[]>([]);
  const [paymentModeList, setPaymentModeList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportingRef = useRef<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasSearchedRef = useRef<boolean>(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizeOptions, setPageSizeOptions] = useState<number[]>([10, 25, 100, 500, 1000]);

  // Column visibility state
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    // Load from localStorage or use defaults
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('transaction-visible-columns');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved columns:', e);
        }
      }
      // Mobile defaults (5 core columns), desktop shows all
      return window.innerWidth < 768
        ? ['txn_id', 'client_code', 'payee_amount', 'status', 'trans_date']
        : ['all'];
    }
    return ['all'];
  });

  // Filter state - matches Angular TransactionFilter
  const [filters, setFilters] = useState({
    clientCode: 'ALL',
    paymentStatus: 'ALL',
    paymentMode: 'ALL',
    fromDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    terminalStatus: 'TS',
    search: '',
  });

  // Auth context — derive userName from localStorage (fallback to stored user object)
  const [userName, setUserName] = useState<string>('');
  const userNameRef = useRef<string>('');

  // Save visible columns to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && visibleColumns.length > 0) {
      localStorage.setItem('transaction-visible-columns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  // Initialize on mount - runs once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resolved = resolveUserName();
    if (resolved) {
      setUserName(resolved);
      userNameRef.current = resolved;
    }

    // Do not wait on master APIs; render immediately
    setIsInitializing(false);
    // Optionally prefetch masters in background (non-blocking)
    setTimeout(() => {
      transactionService.getPaymentModeListCached().then(setPaymentModeList).catch(() => {});
      transactionService.getPaymentStatusListCached().then(setStatusList).catch(() => {});
    }, 0);
  }, []); // Run once on mount

  // Load Client Code List - matches Angular getClientCodeListUSP_Slave (line 191)
  const loadClientCodeList = useCallback(async () => {
    try {
      const resolvedName = userNameRef.current || userName || '';
      if (!resolvedName) return;
      const data = await transactionService.getClientCodeList(resolvedName);
      setClientCodeList(data || []);
    } catch (error) {
      console.error('Failed to load client code list:', error);
    }
  }, [userName]);

  // Load Payment Mode List - matches Angular getPaymentModeList (line 256)
  const loadPaymentModeList = useCallback(async () => {
    try {
      const data = await transactionService.getPaymentModeList();
      setPaymentModeList(data || []);
    } catch (error) {
      console.error('Failed to load payment mode list:', error);
    }
  }, []);

  // Load Payment Status List - matches Angular getPaymentStatusList (line 276)
  const loadPaymentStatusList = useCallback(async () => {
    try {
      const data = await transactionService.getPaymentStatusList();
      setStatusList(data || []);
    } catch (error) {
      console.error('Failed to load payment status list:', error);
    }
  }, []);

  // Dynamic page size options based on count - matches Angular setPageSizeOptions (line 244)
  const updatePageSizeOptions = (count: number) => {
    if (count < 100) {
      setPageSizeOptions([10, 25]);
    } else if (count < 1000) {
      setPageSizeOptions([25, 100, 500]);
    } else {
      setPageSizeOptions([100, 500, 1000, 10000]);
    }
  };

  // Admin Filter - matches Angular AdminFilter (line 368)
  // IMPORTANT: This function validates filters EXACTLY like Angular before calling API
  // Angular validation rules (line 376-394):
  // 1. Date range required
  // 2. From date must be less than to date
  // 3. Maximum 31 days allowed between dates
  // Build Angular-compatible request from current filters
  const buildAdminFilter = (page: number, length: number): AngularTransactionFilter => {
    const norm = (v: string) => (v && v !== 'ALL' ? v : 'ALL');
    const status = filters.paymentStatus ? String(filters.paymentStatus).toUpperCase() : 'ALL';
      const payload: AngularTransactionFilter = {
      clientCode: norm(filters.clientCode),
      paymentStatus: status,
      paymentMode: norm(filters.paymentMode),
      fromDate: filters.fromDate,
      endDate: filters.endDate,
      length,
      page,
      terminalStatus: filters.terminalStatus || 'TS',
      loginBy: (userNameRef.current || userName || '').trim(),
      search: (filters.search || '').trim(),
    };
    console.log('[TxnHistory] Request payload:', payload);
    return payload;
  };

  const handleSearch = async () => {
    hasSearchedRef.current = true;
    // EXACT Angular validation - line 376-379
    if (!filters.fromDate || !filters.endDate) {
      toast.error('Date range required');
      return;
    }

    // EXACT Angular date difference calculation - line 381-394
    const d1 = new Date(filters.fromDate);
    const d2 = new Date(filters.endDate);
    // To calculate the time difference of two dates
    const DifferenceInTime = d2.getTime() - d1.getTime();
    // To calculate the no. of days between two dates
    const DifferenceInDays = DifferenceInTime / (1000 * 3600 * 24);

    if (DifferenceInDays < 0) {
      toast.error('From date should be less than to date');
      return;
    }

    if (DifferenceInDays > 31) {
      toast.error('You can filter only for 1 month data only!');
      return;
    }

    setIsLoading(true);
    setCurrentPage(1); // Reset to first page

    try {
      // Build request matching Angular inputData (line 406-416)
      const requestData = buildAdminFilter(1, pageSize);
      const response = await transactionService.getAdminTxnHistory(requestData);

      setTransactions(response.results || []);
      // Initialize progressive rendering when page is very large
      const total = (response.results || []).length;
      if (total > 500) {
        setVisibleCount(Math.min(500, total));
      } else {
        setVisibleCount(total);
      }
      setTotalCount(response.count || 0);
      updatePageSizeOptions(response.count || 0);

      if (response.results && response.results.length > 0) {
        toast.success(`Found ${formatIndianNumber(response.count || 0)} transactions`);
      } else {
        toast.info('No transactions found for the selected criteria');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to load transactions');
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced type-to-search that calls backend after first search
  useEffect(() => {
    const term = (filters.search || '').trim();
    if (!hasSearchedRef.current) return; // only after user performed first search
    const id = setTimeout(() => {
      handleSearch();
    }, 500);
    return () => clearTimeout(id);
  }, [filters.search]);

  // Page change handler - matches Angular pageChangeEvent (line 318)
  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    setIsLoading(true);

    try {
      const response = await transactionService.getAdminTxnHistory(buildAdminFilter(newPage, pageSize));
      setTransactions(response.results || []);
      // Reset progressive rendering on page change
      const total = (response.results || []).length;
      if (total > 500) {
        setVisibleCount(Math.min(500, total));
      } else {
        setVisibleCount(total);
      }
    } catch (error) {
      console.error('Page change error:', error);
      toast.error('Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  // Export via backend (v6 async CSV) - triggers job and opens S3 link when ready
  const handleExport = async () => {
    if (exportingRef.current || isExporting) return;
    if (!transactions || transactions.length === 0) {
      toast.error('Search data first');
      return;
    }
    exportingRef.current = true;
    setIsExporting(true);
    try {
      const exportRequest: AngularTransactionFilter = {
        clientCode: filters.clientCode,
        paymentStatus: filters.paymentStatus || 'ALL',
        paymentMode: filters.paymentMode || 'ALL',
        fromDate: filters.fromDate,
        endDate: filters.endDate,
        length: 0,
        page: 0,
        terminalStatus: filters.terminalStatus,
        loginBy: userName,
        search: (filters.search || '').trim() || undefined,
      } as any;

      const resp = await ReportApiService.requestAdminTxnHistoryExcelV6(exportRequest);
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
      setIsExporting(false);
      exportingRef.current = false;
    }
  };

  // Progressive rendering scheduler – append rows in chunks for very large pages
  useEffect(() => {
    if (!transactions || transactions.length <= 500) return;
    let rafId: number | null = null;
    let cancelled = false;
    let count = 0;

    const step = () => {
      if (cancelled) return;
      count = Math.min(count + 500, transactions.length);
      setVisibleCount(count);
      if (count < transactions.length) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    // reset and start
    count = Math.min(500, transactions.length);
    setVisibleCount(count);
    if (count < transactions.length) {
      rafId = window.requestAnimationFrame(step);
    }

    return () => {
      cancelled = true;
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [transactions]);

  const rowsToRender = transactions.length > 500 ? transactions.slice(0, visibleCount) : transactions;

  const handleClearFilters = () => {
    setFilters({
      clientCode: 'ALL',
      paymentStatus: 'ALL',
      paymentMode: 'ALL',
      fromDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      terminalStatus: 'TS',
      search: '',
    });
    setTransactions([]);
    setTotalCount(0);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'PENDING':
      case 'INITIATED':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper to check if column should be visible
  const isColumnVisible = (columnKey: string) => {
    return visibleColumns.includes('all') || visibleColumns.includes(columnKey);
  };

  // Note: avoid blocking the entire page on init; show inline loader instead

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="pb-3 md:pb-4 border-b border-gray-200">
        <h4 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
          Transaction History
        </h4>
        <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>Search and manage all transactions across the platform</p>
        {isInitializing && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></span>
            Loading filters...
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="relative z-20 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-0.5 md:mb-1" style={{ letterSpacing: '-0.02em' }}>Filter Transactions</h3>
          <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select filters to narrow down your transaction search</p>
        </div>

        {/* Filter Grid - Angular col-md-3 = ~4 items per row on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5">
          {/* Client Name - Now with integrated search */}
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
              Client Name
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Combobox
                  options={[
                    { value: 'ALL', label: 'ALL' },
                    ...(Array.isArray(clientCodeList) ? clientCodeList.map((client: any) => ({
                      value: client.clientCode || client.client_code,
                      label: `${client.clientCode || client.client_code} - ${client.clientName || client.client_name}`
                    })) : [])
                  ]}
                  value={filters.clientCode}
                  onChange={(value) => setFilters({ ...filters, clientCode: value })}
                  placeholder="Select Client"
                  searchPlaceholder="Search by code or name..."
                  onOpenChange={async (open) => {
                    if (open && clientCodeList.length === 0) {
                      await loadClientCodeList();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, clientCode: 'ALL' })}
                className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700 transition-colors"
              >
                ALL
              </button>
            </div>
          </div>

          {/* From Date - Now with calendar picker */}
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
              From Date
            </label>
            <DatePicker
              value={filters.fromDate}
              onChange={(value) => setFilters({ ...filters, fromDate: value })}
              placeholder="Select from date"
            />
          </div>

          {/* To Date - Now with calendar picker */}
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
              To Date
            </label>
            <DatePicker
              value={filters.endDate}
              onChange={(value) => setFilters({ ...filters, endDate: value })}
              placeholder="Select to date"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <CreditCard className="inline-block w-4 h-4 mr-1 text-gray-600" />
              Payment Mode
            </label>
            <Combobox
              options={[
                { value: 'ALL', label: 'ALL' },
                ...(Array.isArray(paymentModeList) ? paymentModeList.map((mode: any) => {
                  const modeId = mode.paymode_id || mode;
                  const modeName = mode.paymode_name || mode;
                  return {
                    value: String(modeId),
                    label: modeName
                  };
                }) : [])
              ]}
              value={filters.paymentMode}
              onChange={(value) => setFilters({ ...filters, paymentMode: value })}
              placeholder="Select Payment Mode"
              searchPlaceholder="Search payment modes..."
              onOpenChange={async (open) => {
                if (open && paymentModeList.length === 0) {
                  try {
                    const modes = await transactionService.getPaymentModeListCached();
                    setPaymentModeList(modes || []);
                  } catch (e) {
                    console.error('[Transactions] Failed to load payment modes:', e);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Second Row - Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Filter className="inline-block w-4 h-4 mr-1 text-gray-600" />
              Payment Status
            </label>
            <Combobox
              options={[
                { value: 'ALL', label: 'ALL' },
                ...(Array.isArray(statusList) ? statusList.map((status: any) => {
                  const statusValue = typeof status === 'string' ? status : (status.payment_status_name || status.status_name || status.paymentstatus_name || String(status));
                  return {
                    value: statusValue,
                    label: statusValue
                  };
                }) : [])
              ]}
              value={filters.paymentStatus}
              onChange={(value) => setFilters({ ...filters, paymentStatus: value })}
              placeholder="Select Payment Status"
              searchPlaceholder="Search status..."
              onOpenChange={async (open) => {
                if (open && statusList.length === 0) {
                  try {
                    const statuses = await transactionService.getPaymentStatusListCached();
                    setStatusList(statuses || []);
                  } catch (e) {
                    console.error('[Transactions] Failed to load status list:', e);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 pt-3 md:pt-2 border-t border-gray-200">
          <Button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex-1 sm:flex-none min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 touch-manipulation"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden xs:inline">Searching...</span>
                <span className="xs:hidden">Search</span>
              </>
            ) : (
              <>
                <span className="hidden xs:inline">Search Transactions →</span>
                <span className="xs:hidden">Search →</span>
              </>
            )}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
            className="flex-1 sm:flex-none min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs md:text-sm font-medium rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden xs:inline">Exporting...</span>
                <span className="xs:hidden">Export</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span className="hidden xs:inline">Export to Excel</span>
                <span className="xs:hidden">Export</span>
              </>
            )}
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full sm:w-auto min-h-[52px] px-4 md:px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-xs md:text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 touch-manipulation"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Clear Filters</span>
          </Button>
        </div>
      </div>

      {/* Search Bar and Total Records */}
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
            <label className="block text-xs md:text-sm font-extrabold text-gray-900 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>Search Query</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="search"
                autoComplete="off"
                placeholder="Search by ID, client, email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 h-11 bg-white border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 md:gap-3 p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="p-2 md:p-2.5 bg-white rounded-lg shadow-sm">
              <FileSpreadsheet className="w-4 md:w-5 h-4 md:h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-600 font-medium">Total Records</p>
              <p className="text-lg md:text-xl font-bold text-orange-600">{formatIndianNumber(totalCount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      {isLoading && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-12 md:py-16 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
          <div className="text-center px-4">
            <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm md:text-base font-extrabold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>Loading Transactions</p>
            <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Please wait while we fetch your data...</p>
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-gradient-to-br from-white to-gray-50 border-2 border-dashed border-gray-300 rounded-xl md:rounded-2xl shadow-lg px-4">
          <div className="max-w-md mx-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
            </div>
            <h4 className="text-base md:text-lg font-extrabold text-gray-900 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>No Transactions Found</h4>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 font-light" style={{ letterSpacing: '-0.01em' }}>Select your filters above and click "Search" to view results</p>
            <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-full px-3 md:px-4 py-1.5 md:py-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              Ready to search
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Column Selector - hidden on mobile since mobile uses card view */}
          <div className="hidden md:block mb-4">
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Customize Columns ({visibleColumns.includes('all') ? 'All' : visibleColumns.length})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showColumnSelector ? 'rotate-180' : ''}`} />
            </button>

            {showColumnSelector && (
              <div className="mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 max-h-96 overflow-y-auto">
                <div className="col-span-full flex justify-between items-center mb-3 pb-3 border-b">
                  <span className="text-sm font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Select Columns to Display</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVisibleColumns(['all'])}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setVisibleColumns(['txn_id', 'client_code', 'payee_amount', 'status', 'trans_date'])}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>

                {/* Core columns */}
                {[
                  { key: 'txn_id', label: 'Transaction ID' },
                  { key: 'client_txn_id', label: 'Client Trans ID' },
                  { key: 'pg_txn_id', label: 'RNN/UTR' },
                  { key: 'challan_no', label: 'Challan/VAN' },
                  { key: 'pg_pay_mode', label: 'PG Pay Mode' },
                  { key: 'payee_amount', label: 'Payer Amount' },
                  { key: 'act_amount', label: 'Actual Amount' },
                  { key: 'paid_amount', label: 'Round off Paid' },
                  { key: 'pg_return_amount', label: 'Bank Amount' },
                  { key: 'amount_type', label: 'Currency' },
                  { key: 'p_convcharges', label: 'Conv. Charges' },
                  { key: 'p_ep_charges', label: 'EP Charges' },
                  { key: 'p_gst', label: 'GST' },
                  { key: 'ep_conv_rate', label: 'EP Conv Rate' },
                  { key: 'ep_conv_rate_type', label: 'EP Conv Type' },
                  { key: 'sp_conv_rate', label: 'SP Conv Rate' },
                  { key: 'sp_conv_rate_type', label: 'SP Conv Type' },
                  { key: 'gst_rate', label: 'GST Rate' },
                  { key: 'gst_rate_type', label: 'GST Rate Type' },
                  { key: 'trans_date', label: 'Transaction Date' },
                  { key: 'status', label: 'Payment Status' },
                  { key: 'payee_first_name', label: 'Payer First Name' },
                  { key: 'payee_lst_name', label: 'Payer Last Name' },
                  { key: 'payee_mob', label: 'Payer Mobile' },
                  { key: 'payee_email', label: 'Payer Email' },
                  { key: 'client_code', label: 'Client Code' },
                  { key: 'payment_mode', label: 'Payment Mode' },
                  { key: 'payee_address', label: 'Payer Address' },
                  { key: 'udf1', label: 'UDF1' },
                  { key: 'udf2', label: 'UDF2' },
                  { key: 'udf3', label: 'UDF3' },
                  { key: 'udf4', label: 'UDF4' },
                  { key: 'udf5', label: 'UDF5' },
                  { key: 'udf6', label: 'UDF6' },
                  { key: 'udf9', label: 'UDF9' },
                  { key: 'udf10', label: 'UDF10' },
                  { key: 'udf20', label: 'UDF20' },
                  { key: 'gr_number', label: 'Gr.No' },
                  { key: 'fee_forward', label: 'Fee Forward' },
                  { key: 'bank_message', label: 'Bank Response' },
                  { key: 'ifsc_code', label: 'IFSC Code' },
                  { key: 'payer_acount_number', label: 'Payer Account No' },
                  { key: 'bank_txn_id', label: 'Bank Txn ID' },
                  { key: 'donation_amount', label: 'Donation Amount' },
                ].map(col => (
                  <label key={col.key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(col.key) || visibleColumns.includes('all')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setVisibleColumns([...visibleColumns.filter(c => c !== 'all'), col.key]);
                        } else {
                          setVisibleColumns(visibleColumns.filter(c => c !== col.key));
                        }
                      }}
                      className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Card View - ONLY visible < 768px */}
          <div className="md:hidden space-y-3">
            {rowsToRender.map((txn, index) => (
              <div
                key={txn.txn_id || index}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header: Transaction ID + Status */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                    <p className="font-mono text-sm font-bold text-orange-600 truncate">
                      {txn.txn_id || '-'}
                    </p>
                  </div>
                  <div className="ml-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusBadge(txn.status)}`}>
                      {txn.status || '-'}
                    </span>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(txn.payee_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Date</p>
                    <p className="text-gray-900 text-xs">
                      {txn.trans_date ? new Date(txn.trans_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Client</p>
                    <p className="text-gray-900 truncate text-xs font-medium">{txn.client_code || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Payment Mode</p>
                    <p className="text-gray-900 truncate text-xs">{txn.payment_mode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Payer Name</p>
                    <p className="text-gray-900 truncate text-xs">
                      {txn.payee_first_name || txn.payee_lst_name
                        ? `${txn.payee_first_name || ''} ${txn.payee_lst_name || ''}`.trim()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Mobile</p>
                    <p className="text-gray-900 truncate text-xs font-mono">{txn.payee_mob || 'N/A'}</p>
                  </div>
                </div>

                {/* Additional Info */}
                {txn.client_txn_id && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-0.5">Client Txn ID</p>
                    <p className="text-gray-900 truncate text-xs font-mono">{txn.client_txn_id}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View - ONLY visible ≥ 768px - UNCHANGED */}
          <div className="hidden md:block bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto -mx-px">
              <table className="min-w-full border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    {/* All 45 columns from Angular */}
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>S.No</th>
                    <th className="sticky left-0 z-20 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Trans ID</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Client Trans ID</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>RNN/UTR</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Challan / VAN</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>PG Pay mode</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer Amount</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Actual Amount</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Round off paid</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Bank amount</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Currency</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Conv. charges</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>EP charges</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>GST</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>EP Conv Rate</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>EP Conv Type</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>SP Conv Rate</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>SP Conv Type</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>GST Rate</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>GST Rate Type</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Transaction Date</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payment Status</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer First Name</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer Last Name</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer Mobile</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer Email</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Client Code</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payment Mode</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer Address</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf1</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf2</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf3</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf4</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf5</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf6</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf9</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf10</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Udf20</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Gr.No</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Fee Forward</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Bank Response</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>IFSC Code</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Payer Account No</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Bank Txn Id</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Donation amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rowsToRender.map((txn, index) => (
                    <tr key={txn.txn_id || index} className="hover:bg-gray-50 transition-colors">
                      {/* All 45 data cells */}
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{txn.srNo || ((currentPage - 1) * pageSize + index + 1)}</td>
                      <td className="sticky left-0 z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-orange-500 font-mono font-medium whitespace-nowrap">{txn.txn_id || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 font-mono">{txn.client_txn_id || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.pg_txn_id || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.challan_no || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.pg_pay_mode || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-900 font-medium">{formatCurrency(txn.payee_amount || 0)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700">{formatCurrency(txn.act_amount || 0)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700">{formatCurrency(txn.paid_amount || 0)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700">{formatCurrency(txn.pg_return_amount || 0)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.amount_type || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700">{txn.p_convcharges || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700">{txn.p_ep_charges || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700">{txn.p_gst || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.ep_conv_rate || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.ep_conv_rate_type || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.sp_conv_rate || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.sp_conv_rate_type || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.gst_rate || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.gst_rate_type || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{formatDate(txn.trans_date)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusBadge(txn.status)}`}>
                          {txn.status || '-'}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.payee_first_name || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.payee_lst_name || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.payee_mob || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.payee_email || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-orange-500 font-medium">{txn.client_code || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.payment_mode || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 max-w-xs truncate">{txn.payee_address || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf1 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf2 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf3 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf4 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf5 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf6 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf9 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf10 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.udf20 || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.gr_number || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.fee_forward || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 max-w-xs truncate">{txn.bank_message || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.ifsc_code || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.payer_acount_number || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{txn.bank_txn_id || '-'}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700">{formatCurrency(txn.donation_amount || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg p-3 md:p-5">
              <div className="text-xs md:text-sm text-gray-700 flex items-center gap-2 text-center sm:text-left font-light" style={{ letterSpacing: '-0.01em' }}>
                <div className="hidden sm:block w-1 h-6 bg-orange-500 rounded-full"></div>
                <span>
                  Showing <span className="font-extrabold text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-extrabold text-gray-900">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                  <span className="font-extrabold text-orange-600">{formatIndianNumber(totalCount)}</span> transactions
                </span>
              </div>
              <div className="flex flex-col xs:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-2.5 md:px-3 py-1.5 md:py-2 shadow-sm">
                  <span className="text-xs md:text-sm text-gray-900 font-extrabold" style={{ letterSpacing: '-0.02em' }}>Rows:</span>
                  <Select
                    value={`${pageSize}`}
                    disabled={isLoading}
                    onValueChange={async (value) => {
                      // Guard: Prevent action if already loading
                      if (isLoading) return;

                      const newPageSize = Number(value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);

                      // Only refetch if we have existing data
                      if (transactions.length > 0 && !isLoading) {
                        setIsLoading(true);
                        try {
                          const response = await transactionService.getAdminTxnHistory(
                            buildAdminFilter(1, newPageSize)
                          );
                          setTransactions(response.results || []);
                          setTotalCount(response.count || 0);
                        } catch (error) {
                          console.error('Page size change error:', error);
                          toast.error('Failed to load transactions');
                        } finally {
                          setIsLoading(false);
                        }
                      }
                    }}
                  >
                  <SelectTrigger className="w-16 md:w-20 h-11 md:h-8 min-h-[44px] md:min-h-[32px] bg-white border-0 rounded text-gray-900 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/50 touch-manipulation">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                      {pageSizeOptions.map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    variant="outline"
                    size="sm"
                    className="h-11 md:h-9 min-h-[52px] md:min-h-[36px] px-3 md:px-2 bg-white border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-900 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 md:px-4 py-2.5 md:py-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-xs md:text-sm font-extrabold text-white shadow-md whitespace-nowrap min-h-[52px] md:min-h-[36px] flex items-center">
                    <span>{currentPage}</span>
                    <span className="mx-1 md:mx-1.5 text-orange-200">/</span>
                    <span className="text-orange-100">{totalPages}</span>
                  </div>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                    variant="outline"
                    size="sm"
                    className="h-11 md:h-9 min-h-[52px] md:min-h-[36px] px-3 md:px-2 bg-white border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-900 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
