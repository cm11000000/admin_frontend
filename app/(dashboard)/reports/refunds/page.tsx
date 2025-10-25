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
              Refund Report
            </h1>
            <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
              Track refund patterns and processing
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
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
          className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">
              Total Refunds
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {report.summary.total_refunds.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">
              Success Rate
            </p>
            <p className="text-2xl font-bold text-green-600">
              {report.summary.success_rate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-orange-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
            <p className="text-sm text-gray-600 mb-2">
              Total Amount
            </p>
            <p className="text-2xl font-bold text-orange-600">
              ₹{report.summary.total_refund_amount.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
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
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
        <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
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
        <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
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
          className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="border-b border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              Refund Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    Refund ID
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    Transaction ID
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    Original Amount
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    Refund Amount
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    Type
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    Status
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.refunds.slice(0, 20).map((refund) => (
                  <tr key={refund.refund_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-orange-500 font-mono font-medium whitespace-nowrap">
                      {refund.refund_id}
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700 font-mono">
                      {refund.transaction_id}
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 font-medium">
                      ₹{refund.original_amount.toLocaleString()}
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-orange-600 font-semibold">
                      ₹{refund.refund_amount.toLocaleString()}
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          refund.refund_type === 'full'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {refund.refund_type}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          refund.status === 'successful'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : refund.status === 'failed'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">
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
        <div className="flex items-center justify-center py-12 md:py-16 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl shadow-lg">
          <div className="text-center px-4">
            <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm md:text-base font-extrabold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>Loading Refund Report</p>
            <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Please wait while we fetch your data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl md:rounded-2xl p-4 md:p-6 text-red-700 shadow-lg">
          <p className="font-extrabold text-sm md:text-base mb-1" style={{ letterSpacing: '-0.02em' }}>Failed to Load Report</p>
          <p className="text-xs md:text-sm font-light" style={{ letterSpacing: '-0.01em' }}>Please try again or contact support if the problem persists.</p>
        </div>
      )}
    </div>
  );
}
