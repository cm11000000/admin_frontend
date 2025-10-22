'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Upload, CheckCircle, XCircle, AlertTriangle, Download, Search } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import DateRangePicker from '@/components/reports/DateRangePicker';
import { useReportStore } from '@/stores/reportStore';
import ReportApiService from '@/services/api/ReportApiService';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/exportUtils';
import toast from 'react-hot-toast';
import type { IReconciliationReport, DateRange, IBankTransaction } from '@/types/reports';

export default function ReconciliationReportsPage() {
  if (typeof window === 'undefined') return null;
  const { reconciliationReport, setReconciliationReport, setReconciliationLoading } = useReportStore();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [reconciliationInProgress, setReconciliationInProgress] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showDiscrepancyDialog, setShowDiscrepancyDialog] = useState(false);
  const [selectedUnmatched, setSelectedUnmatched] = useState<any>(null);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [manualMatchData, setManualMatchData] = useState({
    systemTransactionId: '',
  });

  const [discrepancyResolution, setDiscrepancyResolution] = useState({
    status: 'resolved' as 'resolved' | 'ignored',
    notes: '',
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, format }: { file: File; format: 'csv' | 'excel' }) =>
      ReportApiService.uploadBankStatement(file, format),
    onSuccess: (data) => {
      setUploadId(data.upload_id);
      toast.success(`Bank statement uploaded successfully. ${data.transactions_count} transactions found.`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload bank statement');
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: ({ uploadId, period }: { uploadId: string; period: DateRange }) =>
      ReportApiService.startReconciliation(uploadId, period),
    onSuccess: (data) => {
      setReconciliationReport(data);
      setReconciliationInProgress(false);
      toast.success('Reconciliation completed');
    },
    onError: (error: any) => {
      setReconciliationInProgress(false);
      toast.error(error.message || 'Failed to complete reconciliation');
    },
  });

  const manualMatchMutation = useMutation({
    mutationFn: (data: { bank_transaction_id: string; system_transaction_id: string }) =>
      ReportApiService.manualMatch(data),
    onSuccess: () => {
      toast.success('Transaction matched successfully');
      setShowMatchDialog(false);
      // Refresh reconciliation report
      if (uploadId) {
        reconcileMutation.mutate({ uploadId, period: dateRange });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to match transaction');
    },
  });

  const resolveDiscrepancyMutation = useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: any }) =>
      ReportApiService.resolveDiscrepancy(id, resolution),
    onSuccess: () => {
      toast.success('Discrepancy resolved');
      setShowDiscrepancyDialog(false);
      // Refresh reconciliation report
      if (uploadId) {
        reconcileMutation.mutate({ uploadId, period: dateRange });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resolve discrepancy');
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validFormats = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validFormats.includes(fileExtension)) {
      toast.error('Invalid file format. Please upload CSV or Excel file.');
      return;
    }

    setUploadedFile(file);
    const format = fileExtension === '.csv' ? 'csv' : 'excel';
    uploadMutation.mutate({ file, format });
  };

  const handleStartReconciliation = () => {
    if (!uploadId) {
      toast.error('Please upload bank statement first');
      return;
    }

    setReconciliationInProgress(true);
    reconcileMutation.mutate({ uploadId, period: dateRange });
  };

  const handleManualMatch = (unmatchedTransaction: any) => {
    setSelectedUnmatched(unmatchedTransaction);
    setShowMatchDialog(true);
  };

  const handleResolveDiscrepancy = (discrepancy: any) => {
    setSelectedDiscrepancy(discrepancy);
    setShowDiscrepancyDialog(true);
  };

  const handleSubmitManualMatch = () => {
    if (!selectedUnmatched || !manualMatchData.systemTransactionId) {
      toast.error('Please enter transaction ID');
      return;
    }

    manualMatchMutation.mutate({
      bank_transaction_id: selectedUnmatched.id,
      system_transaction_id: manualMatchData.systemTransactionId,
    });
  };

  const handleSubmitResolution = () => {
    if (!selectedDiscrepancy) return;

    resolveDiscrepancyMutation.mutate({
      id: selectedDiscrepancy.id,
      resolution: discrepancyResolution,
    });
  };

  const handleExport = async (type: 'full' | 'matched' | 'unmatched' | 'discrepancies', format: 'csv' | 'excel' | 'pdf') => {
    if (!reconciliationReport) {
      toast.error('No reconciliation data to export');
      return;
    }

    try {
      const response = await ReportApiService.downloadReconciliation(reconciliationReport.id, format);
      const blob = await ReportApiService.downloadExportedFile(response.file_url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`${type} report exported successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const reconciliationProgress = reconciliationReport
    ? (reconciliationReport.matchedCount / reconciliationReport.totalBankTransactions) * 100
    : 0;

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
              Bank Reconciliation
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Match transactions with bank statements
            </p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bank Statement Upload
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Select Date Range</Label>
            <DateRangePicker value={dateRange} onChange={setDateRange} variant="orange" helperText="Max 92 days" />
          </div>

          <div>
            <Label>Upload Bank Statement (CSV or Excel)</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">CSV or Excel file</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploadMutation.isPending}
                />
              </label>
            </div>
          </div>

          <Button
            onClick={handleStartReconciliation}
            disabled={!uploadId || reconciliationInProgress}
            className="w-full sm:w-auto"
          >
            {reconciliationInProgress ? 'Reconciling...' : 'Start Reconciliation'}
          </Button>
        </div>
      </Card>

      {/* Reconciliation Results */}
      {reconciliationReport && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Matched</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reconciliationReport.matchedCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unmatched</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reconciliationReport.unmatchedBankCount + reconciliationReport.unmatchedSystemCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discrepancies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reconciliationReport.discrepancyCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reconciliationReport.totalBankAmount)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                Reconciliation Progress
              </h3>
              <span className="text-sm text-gray-600">
                {reconciliationProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={reconciliationProgress} className="h-2" />
          </Card>

          {/* Export Options */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Download Reports
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('full', 'pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Full Report (PDF)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('matched', 'excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Matched (Excel)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('unmatched', 'excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Unmatched (Excel)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('discrepancies', 'excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Discrepancies (Excel)
              </Button>
            </div>
          </Card>

          {/* Matched Transactions */}
          {reconciliationReport.matches.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Matched Transactions ({reconciliationReport.matches.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Bank Reference
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        System Transaction ID
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Match Type
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Confidence
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Matched At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconciliationReport.matches.slice(0, 10).map((match) => (
                      <tr key={match.bankTransactionId} className="border-t border-gray-200">
                        <td className="p-3 text-gray-700">
                          {match.bankTransactionId}
                        </td>
                        <td className="p-3 text-gray-700">
                          {match.systemTransactionId}
                        </td>
                        <td className="p-3">
                          <Badge className={match.matchType === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                            {match.matchType}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-700">
                          {(match.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="p-3 text-gray-700">
                          {new Date(match.matchedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Discrepancies */}
          {reconciliationReport.discrepancies.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Discrepancies ({reconciliationReport.discrepancies.length})
              </h3>
              <div className="space-y-3">
                {reconciliationReport.discrepancies.map((discrepancy) => (
                  <Card key={discrepancy.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30">
                            {discrepancy.type.replace(/_/g, ' ')}
                          </Badge>
                          <Badge
                            className={
                              discrepancy.status === 'resolved'
                                ? 'bg-green-100 text-green-700'
                                : discrepancy.status === 'ignored'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-red-100 text-red-700'
                            }
                          >
                            {discrepancy.status}
                          </Badge>
                        </div>
                        {discrepancy.difference && (
                          <p className="text-sm text-gray-700 mb-1">
                            Difference: {formatCurrency(Math.abs(discrepancy.difference))}
                          </p>
                        )}
                        {discrepancy.notes && (
                          <p className="text-sm text-gray-600">
                            Notes: {discrepancy.notes}
                          </p>
                        )}
                      </div>
                      {discrepancy.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveDiscrepancy(discrepancy)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Manual Match Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Transaction Match</DialogTitle>
            <DialogDescription>
              Match bank transaction with system transaction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedUnmatched && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  Bank Transaction
                </h4>
                <div className="text-sm space-y-1">
                  <p>Reference: {selectedUnmatched.reference}</p>
                  <p>Amount: {formatCurrency(selectedUnmatched.amount)}</p>
                  <p>Date: {new Date(selectedUnmatched.date).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <div>
              <Label>System Transaction ID</Label>
              <Input
                value={manualMatchData.systemTransactionId}
                onChange={(e) =>
                  setManualMatchData({ ...manualMatchData, systemTransactionId: e.target.value })
                }
                placeholder="Enter transaction ID"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitManualMatch} disabled={manualMatchMutation.isPending}>
              Confirm Match
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discrepancy Resolution Dialog */}
      <Dialog open={showDiscrepancyDialog} onOpenChange={setShowDiscrepancyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Discrepancy</DialogTitle>
            <DialogDescription>
              Choose how to handle this discrepancy
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Resolution</Label>
              <Select
                value={discrepancyResolution.status}
                onValueChange={(value: any) =>
                  setDiscrepancyResolution({ ...discrepancyResolution, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolved">Mark as Resolved</SelectItem>
                  <SelectItem value="ignored">Ignore</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={discrepancyResolution.notes}
                onChange={(e) =>
                  setDiscrepancyResolution({ ...discrepancyResolution, notes: e.target.value })
                }
                placeholder="Add notes about resolution..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDiscrepancyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResolution}
              disabled={resolveDiscrepancyMutation.isPending}
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
