'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function EndpointReportPage() {
  if (typeof window === 'undefined') return null;
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [endpointFilter, setEndpointFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock data - replace with actual API call
  const mockData = [
    {
      id: '1',
      endpointName: 'Payment Gateway API',
      endpointUrl: 'https://api.sabpaisa.in/v1/payment',
      method: 'POST',
      totalRequests: 15420,
      successfulRequests: 14850,
      failedRequests: 570,
      avgResponseTime: 245,
      uptime: 99.8,
      status: 'active',
      lastUsed: '2025-10-08T14:30:00',
    },
    {
      id: '2',
      endpointName: 'Refund API',
      endpointUrl: 'https://api.sabpaisa.in/v1/refund',
      method: 'POST',
      totalRequests: 3280,
      successfulRequests: 3200,
      failedRequests: 80,
      avgResponseTime: 312,
      uptime: 99.5,
      status: 'active',
      lastUsed: '2025-10-08T14:15:00',
    },
    {
      id: '3',
      endpointName: 'Settlement API',
      endpointUrl: 'https://api.sabpaisa.in/v1/settlement',
      method: 'GET',
      totalRequests: 1850,
      successfulRequests: 1820,
      failedRequests: 30,
      avgResponseTime: 180,
      uptime: 99.9,
      status: 'active',
      lastUsed: '2025-10-08T13:45:00',
    },
    {
      id: '4',
      endpointName: 'Legacy API',
      endpointUrl: 'https://api.sabpaisa.in/v0/payment',
      method: 'POST',
      totalRequests: 120,
      successfulRequests: 100,
      failedRequests: 20,
      avgResponseTime: 850,
      uptime: 95.2,
      status: 'deprecated',
      lastUsed: '2025-09-15T10:20:00',
    },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format}`);
    // Implement export logic
  };

  // Calculate summary stats
  const totalEndpoints = mockData.length;
  const activeEndpoints = mockData.filter(d => d.status === 'active').length;
  const totalRequests = mockData.reduce((sum, d) => sum + d.totalRequests, 0);
  const avgUptime = (mockData.reduce((sum, d) => sum + d.uptime, 0) / mockData.length).toFixed(1);

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
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Endpoint Report
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor API endpoints performance and usage
            </p>
          </div>
        </div>

      <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <FileText className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
          <p className="text-sm text-gray-700">Total Endpoints</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalEndpoints}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-700">Active Endpoints</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {activeEndpoints}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-700">Total Requests</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalRequests.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-700">Avg Uptime</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {avgUptime}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Endpoint Name
            </label>
            <input
              type="text"
              value={endpointFilter}
              onChange={(e) => setEndpointFilter(e.target.value)}
              placeholder="Search endpoint..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="deprecated">Deprecated</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Endpoint Performance Details
          </h2>
        </div>

        {/* Mobile View - Cards */}
        <div className="block md:hidden divide-y divide-gray-300">
          {paginatedData.map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {item.endpointName}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    item.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : item.status === 'deprecated'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-xs text-gray-700 font-mono">
                {item.method} {item.endpointUrl}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-700">Requests:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {item.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-700">Success Rate:</span>
                  <span className="ml-1 font-medium text-green-600">
                    {((item.successfulRequests / item.totalRequests) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-700">Avg Response:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {item.avgResponseTime}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-700">Uptime:</span>
                  <span className="ml-1 font-medium text-blue-600">
                    {item.uptime}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Last used: {new Date(item.lastUsed).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Endpoint
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Total Requests
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Success Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Avg Response
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Uptime
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-700">
                  Last Used
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {item.endpointName}
                    </div>
                    <div className="text-xs text-gray-600 font-mono">
                      {item.endpointUrl}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700">
                      {item.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.totalRequests.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-green-50 text-green-700">
                      {((item.successfulRequests / item.totalRequests) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.avgResponseTime}ms
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        item.uptime >= 99 ? 'text-green-600' :
                        item.uptime >= 95 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {item.uptime}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        item.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : item.status === 'deprecated'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(item.lastUsed).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 p-4">
            <p className="text-sm text-gray-700">
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
  </div>
  );
}
