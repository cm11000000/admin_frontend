'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function PGReportPage() {
  if (typeof window === 'undefined') return null;
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock data - replace with actual API call
  const mockData = [
    {
      id: '1',
      gatewayName: 'Razorpay',
      gatewayCode: 'RZP',
      totalTransactions: 8500,
      successfulTransactions: 8100,
      failedTransactions: 400,
      totalAmount: 42500000,
      successRate: 95.3,
      avgResponseTime: 1.2,
      status: 'active',
      lastTransaction: '2025-10-08T14:45:00',
    },
    {
      id: '2',
      gatewayName: 'PayU',
      gatewayCode: 'PAYU',
      totalTransactions: 6200,
      successfulTransactions: 5950,
      failedTransactions: 250,
      totalAmount: 31000000,
      successRate: 96.0,
      avgResponseTime: 1.5,
      status: 'active',
      lastTransaction: '2025-10-08T14:30:00',
    },
    {
      id: '3',
      gatewayName: 'CCAvenue',
      gatewayCode: 'CCAV',
      totalTransactions: 4800,
      successfulTransactions: 4600,
      failedTransactions: 200,
      totalAmount: 24000000,
      successRate: 95.8,
      avgResponseTime: 1.8,
      status: 'active',
      lastTransaction: '2025-10-08T14:20:00',
    },
    {
      id: '4',
      gatewayName: 'BillDesk',
      gatewayCode: 'BDSK',
      totalTransactions: 3500,
      successfulTransactions: 3290,
      failedTransactions: 210,
      totalAmount: 17500000,
      successRate: 94.0,
      avgResponseTime: 2.1,
      status: 'active',
      lastTransaction: '2025-10-08T13:50:00',
    },
    {
      id: '5',
      gatewayName: 'PayTM',
      gatewayCode: 'PYTM',
      totalTransactions: 2100,
      successfulTransactions: 1950,
      failedTransactions: 150,
      totalAmount: 10500000,
      successRate: 92.9,
      avgResponseTime: 1.6,
      status: 'active',
      lastTransaction: '2025-10-08T13:30:00',
    },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format}`);
    // Implement export logic
  };

  // Calculate summary stats
  const totalGateways = mockData.length;
  const activeGateways = mockData.filter(d => d.status === 'active').length;
  const totalTransactions = mockData.reduce((sum, d) => sum + d.totalTransactions, 0);
  const totalAmount = mockData.reduce((sum, d) => sum + d.totalAmount, 0);

  // Pagination
  const totalPages = Math.ceil(mockData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = mockData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="rounded-lg border border-gray-200 bg-white p-2 backdrop-blur-sm transition-all hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PG Report
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Payment gateway performance and analytics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-50"
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-orange-500"
            >
              <FileDown className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm">
            <p className="text-sm text-gray-600">Total Gateways</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalGateways}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm">
            <p className="text-sm text-gray-600">Active Gateways</p>
            <p className="mt-2 text-2xl font-bold text-green-400">
              {activeGateways}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalTransactions.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="mt-2 text-2xl font-bold text-orange-400">
              ₹{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Gateway Name
              </label>
              <input
                type="text"
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                placeholder="Search gateway..."
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg backdrop-blur-sm">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Gateway Details
            </h2>
          </div>

          {/* Mobile View - Cards */}
          <div className="block md:hidden divide-y divide-gray-200">
            {paginatedData.map((item) => (
              <div key={item.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.gatewayName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.gatewayCode}
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      item.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Transactions:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {item.totalTransactions.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <span className={`ml-1 font-medium ${
                      item.successRate >= 95 ? 'text-green-400' :
                      item.successRate >= 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {item.successRate}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">
                    ₹{item.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-gray-600">
                    Avg: {item.avgResponseTime}s
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Last txn: {new Date(item.lastTransaction).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-white/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Gateway
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                    Code
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                    Total Txns
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                    Successful
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                    Failed
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                    Success Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                    Avg Response
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item, index) => (
                  <tr key={item.id} className={`transition-colors hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.gatewayName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {item.gatewayCode}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {item.totalTransactions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-green-400">
                      {item.successfulTransactions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-red-400">
                      {item.failedTransactions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          item.successRate >= 95
                            ? 'bg-green-500/20 text-green-400'
                            : item.successRate >= 90
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {item.successRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      ₹{item.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                      {item.avgResponseTime}s
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
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
            <div className="flex items-center justify-between border-t border-gray-200 bg-white/30 p-4">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, mockData.length)} of {mockData.length} entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
