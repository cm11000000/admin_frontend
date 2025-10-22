'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Play, Share2, Clock, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs } from '@/components/ui/tabs';
import FilterBuilder from '@/components/reports/builder/FilterBuilder';
import { useReportStore } from '@/stores/reportStore';
import ReportApiService from '@/services/api/ReportApiService';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';
import toast from 'react-hot-toast';
import type { ICustomReport, IReportFilter, DataSource } from '@/types/reports';

export default function CustomReportBuilder() {
  if (typeof window === 'undefined') return null;
  const queryClient = useQueryClient();
  const {
    customReports,
    currentCustomReport,
    customReportPreview,
    customReportLoading,
    setCustomReports,
    setCurrentCustomReport,
    setCustomReportPreview,
    setCustomReportLoading,
    addCustomReport,
    updateCustomReport: updateStoreReport,
    deleteCustomReport: deleteStoreReport,
  } = useReportStore();

  const [activeTab, setActiveTab] = useState<'builder' | 'saved'>('builder');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [reportConfig, setReportConfig] = useState<Partial<ICustomReport>>({
    name: '',
    description: '',
    dataSource: 'transactions',
    columns: [],
    filters: [],
    aggregations: [],
    groupBy: [],
    sortBy: [],
    isTemplate: false,
    isPublic: false,
    tags: [],
  });

  const [availableColumns, setAvailableColumns] = useState<Record<DataSource, string[]>>({
    transactions: ['transaction_id', 'client_name', 'amount', 'status', 'payment_method', 'gateway', 'transaction_date', 'customer_email'],
    refunds: ['refund_id', 'transaction_id', 'refund_amount', 'refund_type', 'status', 'refund_date'],
    chargebacks: ['chargeback_id', 'transaction_id', 'amount', 'reason', 'status', 'chargeback_date'],
    settlements: ['settlement_id', 'batch_number', 'total_amount', 'transaction_count', 'status', 'settlement_date'],
  });

  const { data: savedReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['customReports'],
    queryFn: () => ReportApiService.getCustomReports(),
    onSuccess: (data) => setCustomReports(data),
  });

  const previewMutation = useMutation({
    mutationFn: (config: Partial<ICustomReport>) =>
      ReportApiService.previewCustomReport(config),
    onSuccess: (data) => {
      setCustomReportPreview(data);
      toast.success('Preview generated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate preview');
    },
  });

  const saveMutation = useMutation({
    mutationFn: (config: Omit<ICustomReport, 'id' | 'createdAt' | 'updatedAt'>) =>
      ReportApiService.createCustomReport(config),
    onSuccess: (data) => {
      addCustomReport(data);
      toast.success('Report saved successfully');
      setReportConfig({
        name: '',
        description: '',
        dataSource: 'transactions',
        columns: [],
        filters: [],
        aggregations: [],
        groupBy: [],
        sortBy: [],
        isTemplate: false,
        isPublic: false,
        tags: [],
      });
      setStep(1);
      setActiveTab('saved');
      queryClient.invalidateQueries({ queryKey: ['customReports'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save report');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ReportApiService.deleteCustomReport(id),
    onSuccess: (_, id) => {
      deleteStoreReport(id);
      toast.success('Report deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['customReports'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete report');
    },
  });

  function handleDataSourceChange(dataSource: DataSource) {
    setReportConfig({
      ...reportConfig,
      dataSource,
      columns: [],
      filters: [],
    });
  }

  function handleColumnToggle(column: string) {
    const currentColumns = reportConfig.columns || [];
    const updated = currentColumns.includes(column)
      ? currentColumns.filter((c) => c !== column)
      : [...currentColumns, column];
    setReportConfig({ ...reportConfig, columns: updated });
  }

  function handlePreview() {
    if (!reportConfig.dataSource || !reportConfig.columns || reportConfig.columns.length === 0) {
      toast.error('Please select data source and at least one column');
      return;
    }
    previewMutation.mutate(reportConfig);
    setStep(4);
  }

  function handleSave() {
    if (!reportConfig.name || !reportConfig.dataSource || !reportConfig.columns || reportConfig.columns.length === 0) {
      toast.error('Please fill in report name, data source, and select columns');
      return;
    }

    saveMutation.mutate({
      ...reportConfig,
      createdBy: 'current_user',
    } as any);
  }

  async function handleExport(format: 'csv' | 'excel' | 'pdf') {
    if (!customReportPreview || !customReportPreview.data) {
      toast.error('Please generate preview first');
      return;
    }

    const filename = reportConfig.name || 'custom_report';
    const data = customReportPreview.data;

    try {
      if (format === 'csv') {
        exportToCSV(data, filename, reportConfig.columns);
      } else if (format === 'excel') {
        await exportToExcel(data, filename, {
          columns: reportConfig.columns,
          includeMetadata: true,
          metadata: {
            'Report Name': reportConfig.name,
            'Data Source': reportConfig.dataSource,
            'Generated': new Date().toLocaleString(),
          },
        });
      } else {
        await exportToPDF(data, filename, {
          title: reportConfig.name,
          columns: reportConfig.columns?.map((col) => ({
            header: col.replace(/_/g, ' ').toUpperCase(),
            dataKey: col,
          })),
          includeMetadata: true,
          metadata: {
            'Data Source': reportConfig.dataSource || '',
            'Total Records': data.length.toString(),
          },
        });
      }
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  function renderStep1() {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Step 1: Select Data Source
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['transactions', 'refunds', 'chargebacks', 'settlements'] as DataSource[]).map((source) => (
            <button
              key={source}
              onClick={() => handleDataSourceChange(source)}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                reportConfig.dataSource === source
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="text-lg font-semibold text-gray-900 capitalize mb-2">
                {source}
              </h4>
              <p className="text-sm text-gray-600">
                Generate reports from {source} data
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setStep(2)}
            disabled={!reportConfig.dataSource}
          >
            Next: Configure Columns
          </Button>
        </div>
      </Card>
    );
  }

  function renderStep2() {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Step 2: Select Columns
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableColumns[reportConfig.dataSource as DataSource].map((column) => (
            <label
              key={column}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={reportConfig.columns?.includes(column) || false}
                onChange={() => handleColumnToggle(column)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {column.replace(/_/g, ' ')}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <Button onClick={() => setStep(1)} variant="outline">
            Back
          </Button>
          <Button
            onClick={() => setStep(3)}
            disabled={!reportConfig.columns || reportConfig.columns.length === 0}
          >
            Next: Add Filters
          </Button>
        </div>
      </Card>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-6">
        <FilterBuilder
          dataSource={reportConfig.dataSource as DataSource}
          filters={reportConfig.filters || []}
          onChange={(filters) => setReportConfig({ ...reportConfig, filters })}
        />

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Report Details
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="report-name">Report Name *</Label>
              <Input
                id="report-name"
                value={reportConfig.name}
                onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                placeholder="Enter report name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="report-description">Description</Label>
              <Input
                id="report-description"
                value={reportConfig.description}
                onChange={(e) =>
                  setReportConfig({ ...reportConfig, description: e.target.value })
                }
                placeholder="Enter report description (optional)"
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportConfig.isTemplate || false}
                  onChange={(e) =>
                    setReportConfig({ ...reportConfig, isTemplate: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">
                  Save as template
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reportConfig.isPublic || false}
                  onChange={(e) =>
                    setReportConfig({ ...reportConfig, isPublic: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <span className="text-sm text-gray-700">
                  Share with team
                </span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button onClick={() => setStep(2)} variant="outline">
            Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePreview} variant="secondary" leftIcon={<Play />}>
              Preview
            </Button>
            <Button onClick={handleSave} leftIcon={<Save />} loading={saveMutation.isPending}>
              Save Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Preview Results
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              CSV
            </Button>
            <Button
              onClick={() => handleExport('excel')}
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Excel
            </Button>
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              PDF
            </Button>
          </div>
        </div>

        {previewMutation.isPending ? (
          <div className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Generating preview...</p>
          </div>
        ) : customReportPreview && customReportPreview.data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {reportConfig.columns?.map((col) => (
                    <th
                      key={col}
                      className="text-left p-3 font-semibold text-gray-700 capitalize"
                    >
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customReportPreview.data.slice(0, 10).map((row: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {reportConfig.columns?.map((col) => (
                      <td key={col} className="p-3 text-gray-700">
                        {row[col] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-sm text-gray-600">
              Showing 10 of {customReportPreview.data.length} records
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">No preview data available</div>
        )}

        <div className="mt-6 flex justify-between">
          <Button onClick={() => setStep(3)} variant="outline">
            Back to Config
          </Button>
          <Button onClick={handleSave} leftIcon={<Save />} loading={saveMutation.isPending}>
            Save Report
          </Button>
        </div>
      </Card>
    );
  }

  function renderSavedReports() {
    if (reportsLoading) {
      return (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-100 rounded" />
            </Card>
          ))}
        </div>
      );
    }

    if (!savedReports || savedReports.length === 0) {
      return (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">
            No saved reports yet. Create your first custom report!
          </p>
          <Button onClick={() => setActiveTab('builder')}>
            Create Report
          </Button>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {savedReports.map((report) => (
          <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {report.name}
                </h4>
                {report.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {report.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="capitalize">{report.dataSource}</span>
                  <span>{report.columns.length} columns</span>
                  <span>{report.filters.length} filters</span>
                  <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" leftIcon={<Play />}>
                  Run
                </Button>
                <Button size="sm" variant="secondary" leftIcon={<Clock />}>
                  Schedule
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(report.id)}
                  leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Custom Report Builder
        </h1>
        <p className="text-gray-600">
          Create custom reports with visual query builder - no code required
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'builder'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Report Builder
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved Reports ({savedReports?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'builder' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= s
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      ) : (
        renderSavedReports()
      )}
    </div>
  );
}
