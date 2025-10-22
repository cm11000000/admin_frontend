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
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Settle Paisa Report
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track settlement transactions and payouts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <FileDown className="h-4 w-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Settlements</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalSettlements}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {completedSettlements}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Gross Amount</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{totalGrossAmount.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Net Amount</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            ₹{totalNetAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              type="text"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              placeholder="Search client..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Settlement ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Txns
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Gross Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Commission
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Net Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Payment Mode
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  UTR Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
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
          <div className="flex items-center justify-between border-t border-gray-200 p-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, mockData.length)} of {mockData.length} entries
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
