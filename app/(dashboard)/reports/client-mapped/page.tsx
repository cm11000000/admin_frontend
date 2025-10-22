'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText, FileSpreadsheet, FileDown, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ReportApiService from '@/services/api/ReportApiService';
// XLSX is lazy-loaded during export to reduce bundle size

export default function ClientMappedReportPage() {
  if (typeof window === 'undefined') return null;
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    return { from: dateStr, to: dateStr };
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [fetchData, setFetchData] = useState(false);
  const itemsPerPage = 20;

  // Fetch client mapped report
  const { data: reportData = [], isLoading, error } = useQuery({
    queryKey: ['clientMappedReport', dateRange.from, dateRange.to, fetchData],
    queryFn: () => ReportApiService.getClientMappedReport(dateRange.from, dateRange.to),
    enabled: fetchData,
  });

  const handleSearch = () => {
    // Validate date range
    if (!dateRange.from || !dateRange.to) {
      alert('Date range required');
      return;
    }

    const d1 = new Date(dateRange.from);
    const d2 = new Date(dateRange.to);
    const diffInDays = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);

    if (diffInDays < 0) {
      alert('From date should be less than to date');
      return;
    }

    if (diffInDays > 92) {
      alert('You can filter only for 3 months data only!');
      return;
    }

    setFetchData(true);
    setCurrentPage(1);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!reportData || reportData.length === 0) {
      alert('No data to export');
      return;
    }

    if (format === 'excel' || format === 'csv') {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(reportData as any[]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ClientMappedData');
      XLSX.writeFile(wb, `ClientMappedData_${dateRange.from}_${dateRange.to}.xlsx`);
    }
  };

  // Filter data based on search term
  const filteredData = reportData.filter((item: any) =>
    searchTerm === '' ||
    Object.values(item).some((val: any) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate summary stats
  const totalRecords = filteredData.length;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
                Client Mapped Report
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                View client and merchant mapping details (Max 3 months data)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={!reportData || reportData.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={!reportData || reportData.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
          </div>
        </div>

        {/* Summary Card */}
        {reportData && reportData.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Total Records:</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                From Date *
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
                To Date *
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
                Search in Results
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                disabled={!reportData || reportData.length === 0}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-gray-900 transition-all hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-center">
            <p className="text-red-400">Error loading data: {String(error)}</p>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && fetchData && reportData.length === 0 && !error && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No records found for the selected date range</p>
          </div>
        )}

        {/* Data Table */}
        {reportData && reportData.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg backdrop-blur-sm">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Client Mapping Details
              </h2>
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </p>
            </div>

            {/* Desktop View - Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-white/50">
                  <tr>
                    {Object.keys(reportData[0] || {}).map((key) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.map((item: any, index: number) => (
                    <tr key={index} className={`transition-colors hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}>
                      {Object.values(item).map((value: any, idx: number) => (
                        <td key={idx} className="px-4 py-3 text-sm text-gray-700">
                          {value !== null && value !== undefined ? String(value) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white/30 p-4">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
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
        )}
      </div>
    </div>
  );
}
