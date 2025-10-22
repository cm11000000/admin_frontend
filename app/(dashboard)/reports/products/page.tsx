'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import Link from 'next/link';

export default function ProductsReportPage() {
  if (typeof window === 'undefined') return null;
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock data - replace with actual API call
  const mockData = [
    {
      id: '1',
      productCode: 'PRD-001',
      productName: 'Payment Gateway Standard',
      category: 'Payment Solutions',
      subscribedClients: 45,
      activeSubscriptions: 42,
      totalRevenue: 2100000,
      monthlyRevenue: 210000,
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: '2',
      productCode: 'PRD-002',
      productName: 'Payment Gateway Premium',
      category: 'Payment Solutions',
      subscribedClients: 28,
      activeSubscriptions: 28,
      totalRevenue: 1680000,
      monthlyRevenue: 168000,
      status: 'active',
      createdDate: '2024-01-15',
    },
    {
      id: '3',
      productCode: 'PRD-003',
      productName: 'Settlement API',
      category: 'API Services',
      subscribedClients: 35,
      activeSubscriptions: 33,
      totalRevenue: 525000,
      monthlyRevenue: 52500,
      status: 'active',
      createdDate: '2024-02-01',
    },
    {
      id: '4',
      productCode: 'PRD-004',
      productName: 'Reconciliation Service',
      category: 'Reporting Services',
      subscribedClients: 22,
      activeSubscriptions: 20,
      totalRevenue: 440000,
      monthlyRevenue: 44000,
      status: 'active',
      createdDate: '2024-02-15',
    },
    {
      id: '5',
      productCode: 'PRD-005',
      productName: 'Refund Management',
      category: 'API Services',
      subscribedClients: 18,
      activeSubscriptions: 17,
      totalRevenue: 270000,
      monthlyRevenue: 27000,
      status: 'active',
      createdDate: '2024-03-01',
    },
    {
      id: '6',
      productCode: 'PRD-006',
      productName: 'Legacy Gateway',
      category: 'Payment Solutions',
      subscribedClients: 8,
      activeSubscriptions: 5,
      totalRevenue: 120000,
      monthlyRevenue: 12000,
      status: 'deprecated',
      createdDate: '2023-06-01',
    },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format}`);
    // Implement export logic
  };

  // Calculate summary stats
  const totalProducts = mockData.length;
  const activeProducts = mockData.filter(d => d.status === 'active').length;
  const totalSubscribers = mockData.reduce((sum, d) => sum + d.subscribedClients, 0);
  const totalRevenue = mockData.reduce((sum, d) => sum + d.totalRevenue, 0);

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
              Subscribe Product List
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View subscribed products and their performance
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
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Active Products</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {activeProducts}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Subscribers</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalSubscribers}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            ₹{totalRevenue.toLocaleString()}
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
              Product Name
            </label>
            <input
              type="text"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              placeholder="Search product..."
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
            Product Details
          </h2>
        </div>

        {/* Mobile View - Cards */}
        <div className="block md:hidden divide-y divide-gray-200">
          {paginatedData.map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.productName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.productCode}
                  </div>
                </div>
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
              <div className="text-sm text-gray-600">
                Category: {item.category}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Subscribers:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {item.subscribedClients}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Active:</span>
                  <span className="ml-1 font-medium text-green-600">
                    {item.activeSubscriptions}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    ₹{item.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Monthly:</span>
                  <span className="ml-1 font-medium text-blue-600">
                    ₹{item.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Created: {new Date(item.createdDate).toLocaleDateString()}
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
                  Product Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Subscribers
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Active
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Total Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Monthly Revenue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.productCode}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.productName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.subscribedClients}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    {item.activeSubscriptions}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ₹{item.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    ₹{item.monthlyRevenue.toLocaleString()}
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
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(item.createdDate).toLocaleDateString()}
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
