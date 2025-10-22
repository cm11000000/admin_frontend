/**
 * Refund History Page - V5 Design
 * Light theme with glassmorphism and orange gradient accents
 * Based on Angular refundhistory.component.html layout
 * Uses EXACT same APIs as Angular refundhistory.component.ts
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
// XLSX is lazy-loaded in export handler to keep bundle small
import {
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Building2,
  Calendar
} from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

// API Base URL from Angular environment
const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '') + '/api/';

// Interface matching Angular data structure
interface RefundHistory {
  client_code?: string;
  clientcode?: string;
  txn_id?: string;
  client_txn_id?: string;
  paid_amount?: number;
  udf2?: string; // Refund amount
  trans_date?: string;
  udf20?: string; // Refund date
  status?: string;
  udf3?: string; // PG Pay mode
  payment_mode?: string;
  payee_first_name?: string;
  payee_lst_name?: string; // Last name
  payee_mob?: string;
  payee_email?: string;
  udf1?: string; // Refund Req By
}

export default function RefundHistoryPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();

  // State matching Angular component
  const [refundHistory, setRefundHistory] = useState<RefundHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [clientCodeList, setClientCodeList] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [noRecord, setNoRecord] = useState(0);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Initialize with current date like Angular
    const today = getCurrentDate();
    setDateFrom(today);
    setDateTo(today);

    // DO NOT auto-load - wait for user to click Search
    // Angular DOES auto-load but V5 requirement is to NOT auto-load
    fetchClientCodeList();
  }, []);

  // API: Fetch Refund History - Exact Angular implementation
  // Angular: AdminTxnReport/GetRefundRequested/{clientCode}/{fromDate}/{endDate}/2
  const fetchRefundHistory = async (clientCode: string, fromDate: string, endDate: string) => {
    const startTime = new Date().getTime();
    setIsLoading(true);
    setRefundHistory([]);

    try {
      const url = `${ADMIN_URL}AdminTxnReport/GetRefundRequested/${clientCode}/${fromDate}/${endDate}/2`;
      const response = await axios.get(url);

      const data = Object.values(response.data) as RefundHistory[];
      const endTime = new Date().getTime();
      const timeDiff = (endTime - startTime) / 60;

      setTimeout(() => {
        setIsLoading(false);
      }, timeDiff);

      if (data.length > 0) {
        setRefundHistory(data);
        setShowGrid(true);
        setNoRecord(data.length);
        setErrorMsg(false);
      } else {
        setShowGrid(false);
        setErrorMsg(true);
      }
    } catch (error) {
      console.error('Exception: Refund History not found', error);
      setIsLoading(false);
      setErrorMsg(true);
      setShowGrid(false);
      toast.error('Failed to fetch refund history');
    }
  };

  // API: Get Client Code List - Exact Angular implementation
  // Angular: common-data/0/0
  const fetchClientCodeList = async () => {
    try {
      const url = `${ADMIN_URL}common-data/0/0`;
      const response = await axios.get(url);
      setClientCodeList(response.data || []);
    } catch (error) {
      console.error('clientCodeList not found!', error);
      setClientCodeList([]);
    }
  };

  const handleSearch = () => {
    // V5 Validation (Angular doesn't validate, but V5 requirement is to validate)
    if (!dateFrom || !dateTo) {
      toast.error('Please select date range');
      return;
    }

    if (!selectedClient || selectedClient === '') {
      toast.error('Please select client');
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

    const clientCode = selectedClient || 'ALL';
    fetchRefundHistory(clientCode, dateFrom, dateTo);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClient('ALL');
    const today = getCurrentDate();
    setDateFrom(today);
    setDateTo(today);
    // Don't auto-load after clear - wait for user to click Search
    setRefundHistory([]);
    setShowGrid(false);
    setErrorMsg(false);
  };

  // Export to Excel - Matching Angular implementation
  const handleExport = async () => {
    if (refundHistory.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Use Angular's exportexcel method equivalent
      const table = document.getElementById('refundHistoryTable');
      if (table) {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.table_to_sheet(table);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const myVar = Math.floor(100000 + Math.random() * 900000);
        XLSX.writeFile(wb, `${myVar}.xlsx`);
        toast.success('Export completed successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  // Filter for search term
  const filteredHistory = refundHistory.filter(refund => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const clientCode = refund.client_code || refund.clientcode || '';
    return (
      refund.txn_id?.toLowerCase().includes(term) ||
      refund.client_txn_id?.toLowerCase().includes(term) ||
      clientCode.toLowerCase().includes(term) ||
      refund.payee_first_name?.toLowerCase().includes(term) ||
      refund.payee_email?.toLowerCase().includes(term)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / pageSize);
  const paginatedHistory = filteredHistory.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Summary calculations
  const completedCount = refundHistory.filter(r =>
    r.status?.toLowerCase().includes('success') || r.status?.toLowerCase().includes('refunded')
  ).length;
  const rejectedCount = refundHistory.filter(r =>
    r.status?.toLowerCase().includes('reject') || r.status?.toLowerCase().includes('fail')
  ).length;
  const totalAmount = refundHistory
    .filter(r => r.status?.toLowerCase().includes('success') || r.status?.toLowerCase().includes('refunded'))
    .reduce((sum, r) => sum + (parseFloat(r.udf2 || '0')), 0);

  return (
    <div className="space-y-6">
      {/* Page Header - Light theme */}
      <div className="pb-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h4 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
            Processed Refund Requests
          </h4>
          <p className="text-gray-600 text-sm mt-1">View all processed refund transactions</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="flex items-center gap-2 min-h-[44px] touch-manipulation px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Section - Glass morphism card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-6 hover:shadow-orange-500/10 transition-shadow duration-300 relative z-10">
          <div className="space-y-4">
            {/* Client and Dates - Match Angular's layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative z-50">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
                  Client
                </label>
                <Combobox
                  options={[
                    { value: 'ALL', label: 'All Clients' },
                    ...(Array.isArray(clientCodeList) ? clientCodeList.map((client: any) => ({
                      value: client.clientcode || client.client_code,
                      label: `${client.clientcode || client.client_code} - ${client.clientname || client.client_name || ''}`
                    })) : [])
                  ]}
                  value={selectedClient}
                  onChange={(value) => setSelectedClient(value)}
                  placeholder="Select Client"
                  searchPlaceholder="Search by code or name..."
                  onOpenChange={async (open) => {
                    if (open && clientCodeList.length === 0) {
                      await fetchClientCodeList();
                    }
                  }}
                  className="min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full min-h-[44px] touch-manipulation px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full min-h-[44px] touch-manipulation px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                />
              </div>

            </div>

            {/* Buttons row - Match Angular's layout (below filters) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSearch}
                className="min-h-[44px] touch-manipulation px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4 inline mr-2" />
                Search
              </button>
              <button
                onClick={handleExport}
                disabled={refundHistory.length === 0}
                className="min-h-[44px] touch-manipulation px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download className="w-4 h-4 inline mr-2" />
                Export to Excel
              </button>
            </div>

            {/* Search and Page Size */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                    placeholder="Search here"
                    className="w-full min-h-[44px] touch-manipulation pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-end">
                <label className="text-sm text-gray-700">Count Per Page</label>
              </div>

              <div className="md:col-span-3">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="w-full min-h-[44px] touch-manipulation px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={300}>300</option>
                  <option value={400}>400</option>
                  <option value={500}>500</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 min-h-[44px] touch-manipulation px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
      </div>

      {/* Total Records Display or Empty State */}
      {showGrid ? (
          <div className="flex items-center justify-between relative z-0">
            <div className="text-sm text-gray-600">
              Showing <span className="text-gray-900 font-medium">{paginatedHistory.length}</span> of{' '}
              <span className="text-gray-900 font-medium">{filteredHistory.length}</span> total records
              {searchTerm && ` (filtered from ${refundHistory.length} total)`}
            </div>
          </div>
      ) : !isLoading && (
        <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-12 text-center">
          <div className="text-gray-700 mb-2 font-medium">No data loaded</div>
          <div className="text-sm text-gray-600">Please select filters and click Search to load refund history</div>
        </div>
      )}

      {/* History Table - Only show if data loaded or loading */}
      {(showGrid || isLoading) && (
          <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg overflow-hidden relative z-0">
            <div className="overflow-x-auto">
            <table className="w-full" id="refundHistoryTable">
              <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                <tr className="border-b border-orange-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Client Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trans ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trans Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Refunded Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PG Pay mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Txn Amt(INR)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Refund Req Amt(INR)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payee Mob
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payee Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Refund Req By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-6 bg-gray-300 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-20"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-24"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-300 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center">
                      <div className="text-gray-600">No refund history found</div>
                    </td>
                  </tr>
                ) : paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center">
                      <div className="text-gray-600">No matching refund history found</div>
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((refund, index) => {
                    const clientCode = refund.client_code || refund.clientcode || 'N/A';
                    return (
                      <tr
                        key={`${refund.txn_id}-${index}`}
                        className="hover:bg-orange-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900 font-mono">
                            {clientCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900 font-mono">{refund.txn_id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{refund.trans_date}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{refund.udf20}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{refund.udf3}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{refund.payment_mode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{refund.payee_first_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{refund.payee_lst_name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900 font-medium">
                            {refund.paid_amount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-orange-700 font-medium">
                            {refund.udf2}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                              refund.status?.toLowerCase().includes('success') || refund.status?.toLowerCase().includes('refunded')
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : refund.status?.toLowerCase().includes('reject') || refund.status?.toLowerCase().includes('fail')
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}
                          >
                            {refund.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{refund.payee_mob}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{refund.payee_email}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-900">{refund.udf1}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredHistory.length)} of {filteredHistory.length} results
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="min-h-[44px] touch-manipulation px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="min-h-[44px] touch-manipulation px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
