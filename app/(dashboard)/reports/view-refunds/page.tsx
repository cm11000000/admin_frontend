/**
 * View Refund Report Page - V4 Design
 * Light theme with glassmorphism and orange gradient accents
 * Based on Angular view-refund-report.component.ts
 * Uses EXACT same API endpoints as Angular component
 * Supports selecting a specific client or "ALL" (cross-client)
 *
 * API Endpoints (Angular parity):
 * - Client dropdown: GET /masters/clientDataMaster/?login_by={user}
 * - Main data: POST /transactions/GetRefundTxnHistory/
 */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
// XLSX is lazy-loaded during export
import {
  Search,
  Download,
  AlertCircle,
  RotateCcw,
  FileSpreadsheet,
  Calendar,
  Building2
} from 'lucide-react';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox';
import { useDebounce } from '@/hooks/useDebounce';

// Interface matching Angular data structure
interface RefundTransaction {
  // Add fields based on API response structure
  [key: string]: any;
}

export default function ViewRefundReportPage() {
  if (typeof window === 'undefined') return null;
  // State matching Angular component
  const [refundData, setRefundData] = useState<RefundTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [clientCodeList, setClientCodeList] = useState<any[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [noRecord, setNoRecord] = useState(0);
  const [userName, setUserName] = useState<string>('');
  const debouncedTableSearch = useDebounce(tableSearchTerm, 300);

  // Get current date in YYYY-MM-DD format (matching Angular)
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

    // Initialize with current date like Angular
    const today = getCurrentDate();
    setDateFrom(today);
    setDateTo(today);

    // Apply deep link params if present: ?client=QCCLI&from=YYYY-MM-DD&to=YYYY-MM-DD
    try {
      const sp = new URLSearchParams(window.location.search);
      const qClient = sp.get('client');
      const qFrom = sp.get('from');
      const qTo = sp.get('to');
      if (qClient) setSelectedClient(qClient);
      if (qFrom) setDateFrom(qFrom);
      if (qTo) setDateTo(qTo);
      if (qClient && qFrom && qTo) {
        // Trigger fetch shortly after state update
        setTimeout(() => {
          fetchRefundReport();
        }, 0);
      }
    } catch {}
  }, []);

  // API: Get Client Code List - Using masters clientDataMaster
  // GET /masters/clientDataMaster/?login_by={user}
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

  // Shared function to fetch refunds with pagination
  const fetchRefunds = async (page: number, length: number, showSuccessToast = false) => {
    try {
      const inputData = {
        clientCode: selectedClient || 'ALL',
        fromDate: dateFrom,
        endDate: dateTo,
        noOfClient: 0,
        rpttype: 1,
        page,
        length,
        search: tableSearchTerm || undefined, // Backend search
      };

      const response = await ReportApiService.getRefundTxnHistory(inputData);

      // Handle response - check if paginated format
      if (response && typeof response === 'object' && 'results' in response) {
        setRefundData(response.results || []);
        setTotalCount(response.count || 0);
        setShowGrid(true);
        setErrorMsg(false);
        setNoRecord(response.count || 0);
        if (showSuccessToast) {
          toast.success(`Found ${response.count || 0} refund transactions`);
        }
      } else {
        // Fallback for non-paginated response
        const data = Array.isArray(response) ? response : [];
        setRefundData(data);
        setTotalCount(data.length);
        setShowGrid(true);
        setErrorMsg(data.length === 0);
        setNoRecord(data.length);
        if (showSuccessToast && data.length > 0) {
          toast.success(`Loaded ${data.length} refund transactions`);
        }
      }
    } catch (error) {
      console.error('Exception: Refund Transaction History not found', error);
      setRefundData([]);
      setTotalCount(0);
      setErrorMsg(true);
      setShowGrid(false);
      setNoRecord(0);
      toast.error('Failed to fetch refund report');
      throw error;
    }
  };

  // API: Fetch Refund Transaction History - Angular parity
  // POST /transactions/GetRefundTxnHistory/
  const fetchRefundReport = async () => {
    // Allow specific client or ALL (like Transaction History)

    if (!dateFrom || !dateTo) {
      toast.error('Please select date range');
      return;
    }

    // Calculate date difference
    const fromDateObj = new Date(dateFrom);
    const toDateObj = new Date(dateTo);
    const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
      toast.error('To Date must be after From Date');
      return;
    }

    if (daysDiff > 92) {
      toast.error('Date range cannot exceed 92 days');
      return;
    }

    setIsLoading(true);
    setRefundData([]);
    setShowGrid(false);
    setCurrentPage(0);

    try {
      await fetchRefunds(1, pageSize, true);
    } catch (error) {
      // Error already handled in fetchRefunds
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
    setRefundData([]);
    setShowGrid(false);
    setErrorMsg(false);
    setNoRecord(0);
    setTotalCount(0);
  };

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    setIsLoading(true);
    try {
      await fetchRefunds(newPage + 1, pageSize); // +1 because currentPage is 0-indexed
    } catch (error) {
      // Error already handled in fetchRefunds
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
      await fetchRefunds(1, newSize);
    } catch (error) {
      // Error already handled in fetchRefunds
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect - triggers backend search when tableSearchTerm changes
  useEffect(() => {
    if (!showGrid || refundData.length === 0) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(0);
      setIsLoading(true);
      fetchRefunds(1, pageSize)
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tableSearchTerm]);

  // Export via backend (v6 async CSV)
  const handleExport = async () => {
    if (!showGrid) {
      toast.error('No data to export. Please search data first.');
      return;
    }
    setIsLoading(true);
    try {
      await ReportApiService.requestRefundTxnExcelV6({
        clientCode: selectedClient || 'ALL',
        fromDate: dateFrom,
        endDate: dateTo,
        loginBy: userName,
      });
      toast.info('Export started. Preparing CSV on server...');
      const url = await ReportApiService.waitForExportUrl({
        createdBy: userName,
        sourceStartsWith: 'v6_refund_txn_excel',
        pollMs: 3000,
        timeoutMs: 120000,
      });
      if (url) {
        window.open(url, '_blank');
        toast.success('CSV is ready. Download started.');
      } else {
        toast.info('Export queued. Check Jobs later.');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to start export');
    } finally {
      setIsLoading(false);
    }
  };

  // Backend handles search and pagination - no client-side filtering needed
  const paginatedData = refundData; // Backend already returns paginated data
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Get column keys from first record (dynamic columns)
  const columnKeys = refundData.length > 0 ? Object.keys(refundData[0]) : [];

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header - Light theme with gradient - Mobile-First */}
      <div className="pb-3 md:pb-4 border-b border-gray-200/50">
        <h4 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
          View Refund Report
        </h4>
        <p className="text-gray-600 text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>View detailed refund transaction history by client</p>
      </div>

      {/* ALERT: Client Selection Required - Mobile-First */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4">
        <div className="flex items-start gap-2 md:gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-700 font-extrabold text-sm md:text-base" style={{ letterSpacing: '-0.02em' }}>Important Notice</p>
            <p className="text-orange-700 text-xs md:text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
              You can search by a specific client or choose "ALL" to view cross-client refunds. Queries are limited to 92 days; broad ranges may be heavy.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section - Glass morphism card - Mobile-First - Z-Index 20 */}
      <div className="relative z-20 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
        {/* Section Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Filter Options</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Select client and date range to view refund transactions</p>
        </div>

        <div className="space-y-4">
          {/* Client and Date Filters - Match Angular's layout - Mobile-First */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="relative z-50">
              <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
                <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
                Client Code <span className="text-red-700">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Combobox
                    value={selectedClient}
                    onChange={(value) => setSelectedClient(value)}
                    options={[
                      { value: 'ALL', label: 'ALL - All Clients' },
                      ...(
                        Array.isArray(clientCodeList)
                          ? clientCodeList.map((client: any) => ({
                              value: client.client_code || client.clientcode || client.clientCode,
                              label: `${client.client_code || client.clientcode || client.clientCode} - ${client.client_name || client.clientname || client.clientName || ''}`
                            }))
                          : []
                      )
                    ]}
                    placeholder="Search and select client..."
                    searchPlaceholder="Search clients..."
                    emptyMessage="No clients found"
                    onOpenChange={(open) => {
                      if (open && userName && clientCodeList.length === 0) {
                        fetchClientCodeList(userName);
                      }
                    }}
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
                placeholder="Select from date"
                className="w-full"
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
                placeholder="Select to date"
                className="w-full"
              />
            </div>
          </div>

          {/* Buttons row - Match Angular's layout (below filters) - Mobile-First */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 pt-2">
            <button
              onClick={fetchRefundReport}
              disabled={isLoading}
              className="min-h-[52px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm md:text-base font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 touch-manipulation"
            >
              <Search className="w-4 h-4 inline mr-2" />
              {isLoading ? 'Loading...' : 'Search →'}
            </button>
            <button
              onClick={handleExport}
              disabled={refundData.length === 0}
              className="min-h-[52px] px-4 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm md:text-base rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              <Download className="w-4 h-4 inline mr-2" />
              Export to Excel
            </button>
          </div>

          {/* Search and Count Per Page - Mobile-First */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <div className="md:col-span-7">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5 md:mb-2 md:hidden">
                Search Results
              </label>
              <div className="relative z-10">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearchTerm}
                  onChange={(e) => {
                    setTableSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  placeholder="Search in results..."
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-xl border border-gray-300 rounded-xl text-gray-900 text-sm md:text-base placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 touch-manipulation"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-start md:justify-end">
              <label className="text-xs md:text-sm text-gray-700 font-extrabold" style={{ letterSpacing: '-0.02em' }}>Count Per Page</label>
            </div>

            <div className="md:col-span-3">
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-full min-h-[44px] bg-white/90 border border-gray-300 rounded-xl text-gray-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
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

          {/* Clear Filters Button - Mobile-First */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 min-h-[44px] px-3 py-1.5 text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors touch-manipulation"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Section Header - Mobile-First */}
      {showGrid && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Refund Transactions</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                Showing <span className="text-gray-900 font-extrabold">{paginatedData.length}</span> of{' '}
                <span className="text-gray-900 font-extrabold">{totalCount}</span> total records
                {tableSearchTerm && ` (search: "${tableSearchTerm}")`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Mobile-First */}
      {!showGrid && !isLoading && (
        <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200/50 shadow-2xl p-8 md:p-12 text-center">
          <FileSpreadsheet className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
          <div className="text-gray-600 mb-2 font-extrabold text-sm md:text-base" style={{ letterSpacing: '-0.02em' }}>No data loaded</div>
          <div className="text-xs md:text-sm text-gray-500 font-light" style={{ letterSpacing: '-0.01em' }}>Please select a client and date range, then click Search to load refund report</div>
        </div>
      )}

      {/* Refund Report Table - Light glass morphism with brand colors - Mobile-First */}
      {(showGrid || isLoading) && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl overflow-hidden">
          {/* Mobile scroll hint */}
          <div className="md:hidden px-4 py-2 bg-white/60 border-b border-gray-200/50 text-center">
            <p className="text-xs text-gray-600">Swipe left to see more columns</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                <tr className="border-b-2 border-orange-200">
                  {columnKeys.length > 0 ? (
                    columnKeys.map((key, index) => (
                      <th key={index} className="px-3 md:px-4 py-2.5 md:py-3 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))
                  ) : (
                    <th className="px-3 md:px-4 py-2.5 md:py-3 text-left text-xs font-extrabold text-gray-700 uppercase tracking-wider" style={{ letterSpacing: '-0.02em' }}>
                      Loading...
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: columnKeys.length || 5 }).map((_, j) => (
                        <td key={j} className="px-3 md:px-4 py-2.5 md:py-3">
                          <div className="h-4 bg-gray-300 rounded w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={columnKeys.length || 1} className="px-3 md:px-4 py-8 md:py-12 text-center">
                      <div className="text-gray-600 text-sm md:text-base">No refund transactions found for the selected filters</div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columnKeys.length || 1} className="px-3 md:px-4 py-8 md:py-12 text-center">
                      <div className="text-gray-600 text-sm md:text-base">No matching refund transactions found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((refund, rowIndex) => {
                    // Detect status columns for color coding
                    const hasStatus = columnKeys.some(key =>
                      key.toLowerCase().includes('status') ||
                      key.toLowerCase().includes('state')
                    );

                    return (
                      <tr key={rowIndex} className="hover:bg-gray-50/30 transition-colors">
                        {columnKeys.map((key, colIndex) => {
                          const value = refund[key];
                          const displayValue = value !== null && value !== undefined ? value.toString() : 'N/A';

                          // Color coding for status and amount columns
                          const isStatusColumn = key.toLowerCase().includes('status') || key.toLowerCase().includes('state');
                          const isAmountColumn = key.toLowerCase().includes('amount') || key.toLowerCase().includes('amt');

                          let cellClass = "text-sm text-gray-900";

                          if (isStatusColumn) {
                            const lowerValue = displayValue.toLowerCase();
                            if (lowerValue.includes('success') || lowerValue.includes('completed') || lowerValue.includes('approved')) {
                              cellClass = "text-sm font-semibold text-green-600";
                            } else if (lowerValue.includes('fail') || lowerValue.includes('reject') || lowerValue.includes('error')) {
                              cellClass = "text-sm font-semibold text-red-600";
                            } else if (lowerValue.includes('pending') || lowerValue.includes('process')) {
                              cellClass = "text-sm font-semibold text-yellow-600";
                            }
                          } else if (isAmountColumn && !isNaN(Number(displayValue))) {
                            cellClass = "text-sm font-semibold text-orange-600";
                          }

                          return (
                            <td key={colIndex} className="px-3 md:px-4 py-2.5 md:py-3 whitespace-nowrap">
                              <span className={cellClass}>
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

          {/* Pagination - Mobile-First */}
          {totalPages > 1 && (
            <div className="bg-white/60 px-3 md:px-4 py-3 md:py-4 border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left order-2 sm:order-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} results
                </div>
                <div className="flex items-center gap-3 md:gap-4 order-1 sm:order-2">
                  <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap font-light" style={{ letterSpacing: '-0.01em' }}>
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0 || isLoading}
                      className="min-h-[52px] px-3 md:px-4 py-2 bg-white text-gray-700 text-xs md:text-sm rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1 || isLoading}
                      className="min-h-[52px] px-3 md:px-4 py-2 bg-white text-gray-700 text-xs md:text-sm rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
