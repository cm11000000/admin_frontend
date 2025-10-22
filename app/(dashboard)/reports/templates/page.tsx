'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, Play, Eye, FileText, DollarSign, Shield, Activity } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/reports/DateRangePicker';
import { useReportStore } from '@/stores/reportStore';
import ReportApiService from '@/services/api/ReportApiService';
import toast from 'react-hot-toast';
import type { IReportTemplate, DateRange } from '@/types/reports';

const templates = [
  {
    id: '1',
    name: 'Daily Transaction Summary',
    category: 'Transaction',
    description: 'All transactions for a selected day with totals',
    icon: Activity,
    color: 'blue',
    dataSource: 'transactions' as const,
  },
  {
    id: '2',
    name: 'Monthly Revenue Report',
    category: 'Financial',
    description: 'Revenue breakdown by gateway and payment mode',
    icon: DollarSign,
    color: 'green',
    dataSource: 'transactions' as const,
  },
  {
    id: '3',
    name: 'Gateway Performance',
    category: 'Operations',
    description: 'Success rates and response times by gateway',
    icon: Activity,
    color: 'purple',
    dataSource: 'transactions' as const,
  },
  {
    id: '4',
    name: 'Payment Mode Analysis',
    category: 'Transaction',
    description: 'Transaction distribution by payment method',
    icon: FileText,
    color: 'blue',
    dataSource: 'transactions' as const,
  },
  {
    id: '5',
    name: 'Failed Transactions Report',
    category: 'Operations',
    description: 'All failed transactions with failure reasons',
    icon: Activity,
    color: 'red',
    dataSource: 'transactions' as const,
  },
  {
    id: '6',
    name: 'Reconciliation Report',
    category: 'Financial',
    description: 'Transaction matching with gateway settlements',
    icon: DollarSign,
    color: 'green',
    dataSource: 'settlements' as const,
  },
  {
    id: '7',
    name: 'Settlement Report',
    category: 'Financial',
    description: 'Detailed settlement breakdown with fees',
    icon: DollarSign,
    color: 'green',
    dataSource: 'settlements' as const,
  },
  {
    id: '8',
    name: 'Tax Report (GST)',
    category: 'Compliance',
    description: 'GST breakdown by CGST, SGST, IGST',
    icon: Shield,
    color: 'orange',
    dataSource: 'transactions' as const,
  },
  {
    id: '9',
    name: 'Customer Transaction History',
    category: 'Transaction',
    description: 'All transactions for a specific customer',
    icon: FileText,
    color: 'blue',
    dataSource: 'transactions' as const,
  },
  {
    id: '10',
    name: 'Merchant Performance',
    category: 'Operations',
    description: 'Transaction volumes and success rates by merchant',
    icon: Activity,
    color: 'purple',
    dataSource: 'transactions' as const,
  },
];

const categories = ['All', 'Transaction', 'Financial', 'Compliance', 'Operations'];

const categoryColors: Record<string, string> = {
  Transaction: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Financial: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Compliance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Operations: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function ReportTemplatesPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [customization, setCustomization] = useState({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    },
    format: 'excel' as 'csv' | 'excel' | 'pdf',
    gateway: '',
    paymentMethod: '',
    status: 'all',
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: typeof templates[0]) => {
    setSelectedTemplate(template);
    setShowUseDialog(true);
  };

  const handlePreview = async (template: typeof templates[0]) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
    setPreviewLoading(true);

    try {
      const data = await ReportApiService.runTemplate(template.id, {
        dateRange: customization.dateRange,
        limit: 10,
      });
      setPreviewData(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    try {
      toast.loading('Generating report...', { id: 'generate' });

      const result = await ReportApiService.createFromTemplate(selectedTemplate.id, {
        dateRange: customization.dateRange,
        filters: {
          gateway: customization.gateway || undefined,
          paymentMethod: customization.paymentMethod || undefined,
          status: customization.status !== 'all' ? customization.status : undefined,
        },
        format: customization.format,
      });

      toast.success('Report generated successfully', { id: 'generate' });
      setShowUseDialog(false);

      // Navigate to custom reports or download
      router.push('/reports/custom');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report', { id: 'generate' });
    }
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      red: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Report Templates
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Pre-built report templates ready to use
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getIconColor(template.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge className={categoryColors[template.category]}>
                    {template.category}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {template.description}
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                  <Button
                    onClick={() => handlePreview(template)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-600">
            No templates found matching your criteria
          </p>
        </Card>
      )}

      {/* Use Template Dialog */}
      <Dialog open={showUseDialog} onOpenChange={setShowUseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize Template</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.name} - {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Date Range</Label>
              <DateRangePicker
                value={customization.dateRange}
                onChange={(dateRange) => setCustomization({ ...customization, dateRange })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gateway (Optional)</Label>
                <Select
                  value={customization.gateway}
                  onValueChange={(value) => setCustomization({ ...customization, gateway: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Gateways" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Gateways</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="payu">PayU</SelectItem>
                    <SelectItem value="ccavenue">CCAvenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Method (Optional)</Label>
                <Select
                  value={customization.paymentMethod}
                  onValueChange={(value) => setCustomization({ ...customization, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Methods</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={customization.status}
                  onValueChange={(value) => setCustomization({ ...customization, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Export Format</Label>
                <Select
                  value={customization.format}
                  onValueChange={(value: any) => setCustomization({ ...customization, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Sample output showing first 10 records
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {previewLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
              </div>
            ) : previewData ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {previewData.columns?.map((col: string) => (
                        <th key={col} className="text-left p-3 font-semibold text-gray-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.data?.slice(0, 10).map((row: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        {previewData.columns?.map((col: string) => (
                          <td key={col} className="p-3 text-gray-700">
                            {row[col] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No preview data available
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
