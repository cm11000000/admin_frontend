'use client';

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

export default function RefundReportPage() {
  if (typeof window === 'undefined') return null;
  const {
    refundFilters,
    selectedChartType,
    setRefundReport,
    setRefundLoading,
    setChartType,
    setDateRange,
  } = useReportStore();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['refund-report', refundFilters],
    queryFn: () => ReportApiService.fetchRefundReport(refundFilters),
  });

  useEffect(() => {
    setRefundLoading(isLoading);
    if (report) {
      setRefundReport(report);
    }
  }, [report, isLoading, setRefundReport, setRefundLoading]);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await ReportApiService.exportReport({
        report_type: 'refunds',
        format,
        filters: refundFilters,
        include_summary: true,
      });

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

  const chartType = selectedChartType.refunds || 'line';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="p-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl text-gray-700 hover:text-gray-900 hover:border-gray-300 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Refund Report
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track refund patterns and processing
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={refundFilters.dateRange}
            onChange={setDateRange}
          />
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Summary Cards */}
      {report?.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-5 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">
              Total Refunds
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {report.summary.total_refunds.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-green-500/30 rounded-xl p-5 shadow-xl">
            <p className="text-sm text-green-300 mb-2">
              Success Rate
            </p>
            <p className="text-2xl font-bold text-green-400">
              {report.summary.success_rate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-[#FF8800]/30 rounded-xl p-5 shadow-xl">
            <p className="text-sm text-orange-300 mb-2">
              Total Amount
            </p>
            <p className="text-2xl font-bold text-[#FF8800]">
              ₹{report.summary.total_refund_amount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-5 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">
              Avg Refund
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{report.summary.avg_refund_amount.toLocaleString()}
            </p>
          </div>
        </motion.div>
      )}

      {/* Chart Controls */}
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          Refund Trends
        </h2>
        <ChartSelector
          selectedType={chartType}
          onChange={(type) => setChartType('refunds', type)}
          availableTypes={['line', 'bar', 'area']}
        />
      </div>

      {/* Trends Chart */}
      {report?.trends && report.trends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReportChart
            type={chartType}
            data={report.trends}
            dataKey="count"
            secondaryDataKey="amount"
            xAxisKey="date"
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
              data={report.breakdown.by_type}
              dataKey="value"
              xAxisKey="category"
              title="By Type"
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
              data={report.breakdown.by_status}
              dataKey="value"
              xAxisKey="category"
              title="By Status"
              height={300}
              showLegend
            />
          </motion.div>
        </div>
      )}

      {/* Refund Details */}
      {report?.refunds && report.refunds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Refund Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Refund ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Original Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Refund Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.refunds.slice(0, 20).map((refund) => (
                  <tr key={refund.refund_id} className="hover:bg-gray-100 transition-colors duration-150">
                    <td className="px-4 py-3 text-sm text-[#0077FF] font-semibold">
                      {refund.refund_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {refund.transaction_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      ₹{refund.original_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#FF8800]">
                      ₹{refund.refund_amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          refund.refund_type === 'full'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {refund.refund_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          refund.status === 'successful'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : refund.status === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(refund.refund_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#0077FF] border-r-[#FF8800] rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl p-6 text-red-400">
          Failed to load refund report. Please try again.
        </div>
      )}
    </div>
  );
}
