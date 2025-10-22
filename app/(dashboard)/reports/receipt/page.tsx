'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, FileSpreadsheet, FileDown, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptReportPage() {
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
      receiptNumber: 'RCP-2025-001234',
      transactionId: 'TXN8945623120',
      clientName: 'ABC Corporation',
      customerName: 'John Doe',
      amount: 15000,
      paymentMethod: 'Credit Card',
      receiptDate: '2025-10-08T14:30:00',
      status: 'generated',
      downloadUrl: '#',
    },
    {
      id: '2',
      receiptNumber: 'RCP-2025-001235',
      transactionId: 'TXN8945623121',
      clientName: 'XYZ Limited',
      customerName: 'Jane Smith',
      amount: 25000,
      paymentMethod: 'UPI',
      receiptDate: '2025-10-08T14:15:00',
      status: 'generated',
      downloadUrl: '#',
    },
    {
      id: '3',
      receiptNumber: 'RCP-2025-001236',
      transactionId: 'TXN8945623122',
      clientName: 'PQR Industries',
      customerName: 'Robert Johnson',
      amount: 8500,
      paymentMethod: 'Net Banking',
      receiptDate: '2025-10-08T14:00:00',
      status: 'generated',
      downloadUrl: '#',
    },
    {
      id: '4',
      receiptNumber: 'RCP-2025-001237',
      transactionId: 'TXN8945623123',
      clientName: 'ABC Corporation',
      customerName: 'Maria Garcia',
      amount: 12000,
      paymentMethod: 'Debit Card',
      receiptDate: '2025-10-08T13:45:00',
      status: 'sent',
      downloadUrl: '#',
    },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting as ${format}`);
    // Implement export logic
  };

  const handleViewReceipt = (receiptNumber: string) => {
    console.log(`Viewing receipt: ${receiptNumber}`);
    // Implement view logic
  };

  // Calculate summary stats
  const totalReceipts = mockData.length;
  const generatedReceipts = mockData.filter(d => d.status === 'generated').length;
  const sentReceipts = mockData.filter(d => d.status === 'sent').length;
  const totalAmount = mockData.reduce((sum, d) => sum + d.amount, 0);

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
              Receipt Report
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage payment receipts
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
          <p className="text-sm text-gray-600">Total Receipts</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalReceipts}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Generated</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {generatedReceipts}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Sent</p>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {sentReceipts}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{totalAmount.toLocaleString()}
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
              <option value="generated">Generated</option>
              <option value="sent">Sent</option>
              <option value="downloaded">Downloaded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Receipt Details
          </h2>
        </div>

        {/* Mobile View - Cards */}
        <div className="block md:hidden divide-y divide-gray-200">
          {paginatedData.map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {item.receiptNumber}
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    item.status === 'generated'
                      ? 'bg-blue-50 text-blue-700'
                      : item.status === 'sent'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Txn: {item.transactionId}
              </div>
              <div className="text-sm text-gray-600">
                Client: {item.clientName}
              </div>
              <div className="text-sm text-gray-600">
                Customer: {item.customerName}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  ₹{item.amount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">
                  {item.paymentMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(item.receiptDate).toLocaleString()}
                </span>
                <button
                  onClick={() => handleViewReceipt(item.receiptNumber)}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <Eye className="h-3 w-3" />
                  View
                </button>
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
                  Receipt Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Transaction ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.receiptNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.transactionId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.clientName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.customerName}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.paymentMethod}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(item.receiptDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        item.status === 'generated'
                          ? 'bg-blue-50 text-blue-700'
                          : item.status === 'sent'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewReceipt(item.receiptNumber)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
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
