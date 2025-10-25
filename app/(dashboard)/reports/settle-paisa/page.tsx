'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function SettlePaisaReportPage() {
  if (typeof window === 'undefined') return null;
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock data - replace with actual API call
  const mockData = [
    {
      id: '1',
      settlementId: 'SETT-2025-001234',
      clientCode: 'CLI001',
      clientName: 'ABC Corporation',
      settlementDate: '2025-10-08',
      transactionCount: 1250,
      grossAmount: 5000000,
      commission: 100000,
      netAmount: 4900000,
      status: 'completed',
      paymentMode: 'NEFT',
      utrNumber: 'UTR2025100812345',
    },
    {
      id: '2',
      settlementId: 'SETT-2025-001235',
      clientCode: 'CLI002',
      clientName: 'XYZ Limited',
      settlementDate: '2025-10-07',
      transactionCount: 850,
      grossAmount: 3200000,
      commission: 64000,
      netAmount: 3136000,
      status: 'completed',
      paymentMode: 'RTGS',
      utrNumber: 'UTR2025100712346',
    },
    {
      id: '3',
      settlementId: 'SETT-2025-001236',
      clientCode: 'CLI003',
      clientName: 'PQR Industries',
      settlementDate: '2025-10-08',
      transactionCount: 450,
      grossAmount: 1800000,
      commission: 36000,
      netAmount: 1764000,
      status: 'pending',
      paymentMode: 'NEFT',
      utrNumber: '',
    },
    {
      id: '4',
      settlementId: 'SETT-2025-001237',
      clientCode: 'CLI004',
      clientName: 'LMN Enterprises',
      settlementDate: '2025-10-06',
      transactionCount: 620,
      grossAmount: 2480000,
      commission: 49600,
      netAmount: 2430400,
      status: 'completed',
      paymentMode: 'IMPS',
      utrNumber: 'UTR2025100612347',
    },
    {
      id: '5',
      settlementId: 'SETT-2025-001238',
      clientCode: 'CLI005',
      clientName: 'DEF Solutions',
      settlementDate: '2025-10-08',
      transactionCount: 320,
      grossAmount: 1280000,
      commission: 25600,
      netAmount: 1254400,
      status: 'processing',
      paymentMode: 'NEFT',
      utrNumber: '',
    },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format}`);
    // Implement export logic
  };

  // Calculate summary stats
  const totalSettlements = mockData.length;
  const completedSettlements = mockData.filter(d => d.status === 'completed').length;
  const totalGrossAmount = mockData.reduce((sum, d) => sum + d.grossAmount, 0);
  const totalNetAmount = mockData.reduce((sum, d) => sum + d.netAmount, 0);

  // Pagination
  const totalPages = Math.ceil(mockData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = mockData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="p-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl text-gray-700 hover:text-gray-900 hover:border-gray-300 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
              Settle Paisa Report
            </h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
              Track settlement transactions and payouts
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-50 transition-all touch-manipulation flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden xs:inline">CSV</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-50 transition-all touch-manipulation flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden xs:inline">Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all touch-manipulation flex items-center justify-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden xs:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
          <p className="text-xs md:text-sm text-gray-600 mb-2 font-light" style={{ letterSpacing: '-0.01em' }}>Total Settlements</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900">
            {totalSettlements}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
          <p className="text-xs md:text-sm text-green-600 mb-2 font-light" style={{ letterSpacing: '-0.01em' }}>Completed</p>
          <p className="text-xl md:text-2xl font-extrabold text-green-600">
            {completedSettlements}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
          <p className="text-xs md:text-sm text-gray-600 mb-2 font-light" style={{ letterSpacing: '-0.01em' }}>Total Gross Amount</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900">
            ₹{totalGrossAmount.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-orange-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
          <p className="text-xs md:text-sm text-orange-600 mb-2 font-light" style={{ letterSpacing: '-0.01em' }}>Total Net Amount</p>
          <p className="text-xl md:text-2xl font-extrabold text-orange-600">
            ₹{totalNetAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-0.5 md:mb-1" style={{ letterSpacing: '-0.02em' }}>Search Filters</h3>
          <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select filters to narrow down your search</p>
        </div>
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2.5 text-xs md:text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 touch-manipulation"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="min-h-[44px] w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2.5 text-xs md:text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 touch-manipulation"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
              Client Name
            </label>
            <input
              type="text"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              placeholder="Search client..."
              className="min-h-[44px] w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2.5 text-xs md:text-sm placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 touch-manipulation"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-extrabold text-gray-700 mb-1.5 md:mb-2" style={{ letterSpacing: '-0.02em' }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2.5 text-xs md:text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 touch-manipulation"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl">
        <div className="border-b border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            Settlement Details
          </h2>
        </div>

        {/* Mobile View - Cards */}
        <div className="block md:hidden divide-y divide-gray-200">
          {paginatedData.map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {item.settlementId}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    item.status === 'completed'
                      ? 'bg-green-50 text-green-700'
                      : item.status === 'processing'
                      ? 'bg-blue-50 text-blue-700'
                      : item.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Client: {item.clientName}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Transactions:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {item.transactionCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Mode:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {item.paymentMode}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Amount:</span>
                  <span className="font-medium text-gray-900">
                    ₹{item.grossAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission:</span>
                  <span className="font-medium text-red-600">
                    -₹{item.commission.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-gray-600">Net Amount:</span>
                  <span className="font-semibold text-blue-600">
                    ₹{item.netAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              {item.utrNumber && (
                <div className="text-xs text-gray-500">
                  UTR: {item.utrNumber}
                </div>
              )}
              <div className="text-xs text-gray-500">
                Date: {new Date(item.settlementDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Settlement ID
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Client
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Date
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Txns
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Gross Amount
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Commission
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Net Amount
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Payment Mode
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  UTR Number
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                    {item.settlementId}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {item.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.clientCode}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(item.settlementDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.transactionCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ₹{item.grossAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600">
                    ₹{item.commission.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    ₹{item.netAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.paymentMode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.utrNumber || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        item.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : item.status === 'processing'
                          ? 'bg-blue-50 text-blue-700'
                          : item.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4">
            <p className="text-xs md:text-sm text-gray-600 text-center sm:text-left font-light" style={{ letterSpacing: '-0.01em' }}>
              Showing <span className="font-extrabold text-gray-900">{startIndex + 1}</span> to <span className="font-extrabold text-gray-900">{Math.min(startIndex + itemsPerPage, mockData.length)}</span> of <span className="font-extrabold text-orange-600">{mockData.length}</span> entries
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="min-h-[44px] px-4 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-50 transition-all disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="min-h-[44px] px-4 md:px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs md:text-sm font-medium rounded-lg hover:bg-gray-50 transition-all disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
