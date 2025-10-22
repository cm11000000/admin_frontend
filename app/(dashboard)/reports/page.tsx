'use client';

import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Activity,
  FileText,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import ReportCard from '@/components/reports/ReportCard';
import { useQuery } from '@tanstack/react-query';
import ReportApiService from '@/services/api/ReportApiService';

export default function ReportsPage() {
  if (typeof window === 'undefined') return null;
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dateRange = {
    from: thirtyDaysAgo.toISOString().split('T')[0] || '',
    to: today.toISOString().split('T')[0] || '',
  };

  // Fetch report summary
  const { data: summary } = useQuery({
    queryKey: ['report-summary', dateRange],
    queryFn: () => ReportApiService.getReportSummary(dateRange),
  });

  // Fetch recent reports
  const { data: recentReports } = useQuery({
    queryKey: ['recent-reports'],
    queryFn: () => ReportApiService.getRecentReports(5),
  });

  const reportCategories = [
    {
      id: 'transactions',
      title: 'Transaction Reports',
      description: 'View detailed transaction analytics with trends and breakdowns',
      icon: Activity,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      path: '/reports/transactions',
      stats: summary
        ? [
            {
              label: 'Total Transactions',
              value: summary.transactions?.toLocaleString() || '0',
            },
            {
              label: 'Success Rate',
              value: `${summary.success_rate?.toFixed(1) || '0'}%`,
            },
          ]
        : undefined,
    },
    {
      id: 'settlements',
      title: 'Settlement Reports',
      description: 'Track settlement batches, amounts, and timelines',
      icon: DollarSign,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      path: '/reports/settlements',
      stats: summary
        ? [
            {
              label: 'Settlements',
              value: summary.settlements?.toLocaleString() || '0',
            },
            {
              label: 'Total Volume',
              value: `₹${(summary.total_volume || 0).toLocaleString()}`,
            },
          ]
        : undefined,
    },
    {
      id: 'chargebacks',
      title: 'Chargeback Reports',
      description: 'Monitor chargebacks, reasons, and resolution status',
      icon: AlertCircle,
      gradient: 'bg-gradient-to-br from-red-500 to-red-600',
      path: '/reports/chargebacks',
      stats: summary
        ? [
            {
              label: 'Chargebacks',
              value: summary.chargebacks?.toLocaleString() || '0',
            },
            {
              label: 'Win Rate',
              value: '0%',
            },
          ]
        : undefined,
    },
    {
      id: 'refunds',
      title: 'Refund Reports',
      description: 'Analyze refund patterns, amounts, and processing times',
      icon: RefreshCw,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      path: '/reports/refunds',
      stats: summary
        ? [
            {
              label: 'Refunds',
              value: summary.refunds?.toLocaleString() || '0',
            },
            {
              label: 'Success Rate',
              value: '0%',
            },
          ]
        : undefined,
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics with custom metrics and insights',
      icon: BarChart3,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      path: '/reports/analytics',
      stats: [
        {
          label: 'Data Points',
          value: '10K+',
        },
        {
          label: 'Metrics',
          value: '25+',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header - Light theme */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Comprehensive reporting and analytics for all your payment data
        </p>
      </div>

      {/* Quick Stats Overview - Light glass morphism cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-blue-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1 font-medium">
                  Total Volume
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{(summary.total_volume || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">12.5%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-green-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1 font-medium">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {(summary.transactions || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">8.2%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-purple-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1 font-medium">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {(summary.success_rate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">2.1%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-orange-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1 font-medium">
                  Settlements
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {(summary.settlements || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-red-600 font-medium">3.1%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Report Categories */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Report Categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportCategories.map((category, index) => (
            <ReportCard
              key={category.id}
              title={category.title}
              description={category.description}
              icon={category.icon}
              gradient={category.gradient}
              href={category.path}
              stats={category.stats}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* Recent Reports - Light glass morphism */}
      {recentReports && recentReports.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Reports
          </h2>
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {report.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Generated {new Date(report.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        report.status === 'completed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
