'use client';

/**
 * Transaction Report Page - V4 Dark Theme
 * Detailed transaction analytics with charts and export
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useReportStore } from '@/stores/reportStore';
import ReportApiService from '@/services/api/ReportApiService';
import DateRangePicker from '@/components/reports/DateRangePicker';
import ChartSelector from '@/components/reports/ChartSelector';
import ExportButton from '@/components/reports/ExportButton';
import dynamic from 'next/dynamic';
const ReportChart = dynamic(() => import('@/components/reports/ReportChart'), { ssr: false });

export default function TransactionReportPage() {
  if (typeof window === 'undefined') return null;
  const {
    transactionFilters,
    selectedChartType,
    setTransactionReport,
    setTransactionLoading,
    setChartType,
    setDateRange,
  } = useReportStore();

  // Fetch transaction report
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['transaction-report', transactionFilters],
    queryFn: () => ReportApiService.fetchTransactionReport(transactionFilters),
  });

  useEffect(() => {
    setTransactionLoading(isLoading);
    if (report) {
      setTransactionReport(report);
    }
  }, [report, isLoading, setTransactionReport, setTransactionLoading]);

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await ReportApiService.exportReport({
        report_type: 'transactions',
        format,
        filters: transactionFilters,
        include_summary: true,
      });

      // Download the file
      const blob = await ReportApiService.downloadExportedFile(response.file_url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const chartType = selectedChartType.transactions || 'line';

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/reports"
            className="p-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl text-gray-700 hover:text-gray-900 hover:border-gray-300 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Transaction Report</h1>
            <p className="text-gray-600">Detailed transaction analytics and trends</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={transactionFilters.dateRange}
            onChange={setDateRange}
          />
          <ExportButton onExport={handleExport} />
        </div>
      </motion.div>

      {/* Summary Cards */}
      {report?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">
              Total Transactions
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {report.summary.total_transactions.toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-sm text-green-300 mb-2">
              Success Rate
            </p>
            <p className="text-3xl font-bold text-green-400">
              {report.summary.success_rate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-sm text-orange-300 mb-2">
              Total Amount
            </p>
            <p className="text-3xl font-bold text-orange-400">
              ₹{report.summary.total_amount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">
              Avg Transaction
            </p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{report.summary.avg_transaction_amount.toLocaleString()}
            </p>
          </div>
        </motion.div>
      )}

      {/* Chart Controls */}
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          Transaction Trends
        </h2>
        <ChartSelector
          selectedType={chartType}
          onChange={(type) => setChartType('transactions', type)}
          availableTypes={['line', 'bar', 'area']}
        />
      </div>

      {/* Main Chart */}
      {report?.trends && report.trends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReportChart
            type={chartType}
            data={report.trends}
            dataKey="total_transactions"
            secondaryDataKey="successful_transactions"
            xAxisKey="label"
            height={400}
            showLegend
            showGrid
          />
        </motion.div>
      )}

      {/* Breakdown Charts */}
      {report?.breakdown && (
        <div className="grid gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ReportChart
              type="pie"
              data={report.breakdown.by_payment_method}
              dataKey="value"
              xAxisKey="category"
              title="By Payment Method"
              height={300}
              showLegend
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ReportChart
              type="pie"
              data={report.breakdown.by_gateway}
              dataKey="value"
              xAxisKey="category"
              title="By Gateway"
              height={300}
              showLegend
            />
          </motion.div>
        </div>
      )}

      {/* Transaction Table */}
      {report?.transactions && report.transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="overflow-hidden bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl"
        >
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700 tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700 tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700 tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700 tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700 tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-700 tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.transactions.slice(0, 20).map((txn) => (
                  <tr key={txn.transaction_id} className="hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {txn.transaction_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {txn.client_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-orange-400">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          txn.status === 'success'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : txn.status === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {txn.payment_method}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(txn.transaction_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {report.pagination && report.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 p-4">
              <p className="text-sm text-gray-600">
                Showing {report.transactions.length} of {report.pagination.total} transactions
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={report.pagination.page === 1}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-xl hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={report.pagination.page === report.pagination.total_pages}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-xl hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full"
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 text-red-400"
        >
          Failed to load transaction report. Please try again.
        </motion.div>
      )}
    </div>
  );
}
