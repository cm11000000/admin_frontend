'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import {
  AlertCircle,
  FileText,
  Loader2,
  Search,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import settlementService from '@/services/api/SettlementApiService';

type Tab = 'disbursement' | 'history' | 'bulk';

interface PaymentModeOption {
  id: string;
  name: string;
}

interface CsvPreview {
  columns: string[];
  rows: Record<string, string>[];
}

const normalizePaymentMode = (item: any): PaymentModeOption | null => {
  const id = String(
    item?.paymode_id ??
      item?.paymodeId ??
      item?.payModeId ??
      item?.payModeID ??
      item?.id ??
      ''
  ).trim();

  if (!id) {
    return null;
  }

  const name = String(
    item?.paymode_name ??
      item?.paymodeName ??
      item?.payModeName ??
      item?.name ??
      id
  ).trim();

  return { id, name };
};

const renderValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toLocaleString('en-IN') : String(value);
  }

  return String(value);
};

const DisbursementPage: React.FC = () => {
  if (typeof window === 'undefined') return null as any;
  const [activeTab, setActiveTab] = useState<Tab>('disbursement');

  // Settlement tab state
  const [bank, setBank] = useState('Yes Bank');
  const [transDate, setTransDate] = useState<string>('');
  const [paymentModes, setPaymentModes] = useState<PaymentModeOption[]>([]);
  const [paymentMode, setPaymentMode] = useState('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // History tab state
  const [historyStart, setHistoryStart] = useState<string>('');
  const [historyEnd, setHistoryEnd] = useState<string>('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  // Bulk tab state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<string[][]>([]);
  const [bulkConfirmed, setBulkConfirmed] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);

  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }, []);

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [transactions, page, pageSize]);

  const transactionColumns = useMemo(() => {
    if (transactions.length === 0) {
      return ['client_code', 'txn_id', 'paid_amount', 'pg_pay_mode', 'payment_mode'];
    }
    return Object.keys(transactions[0]);
  }, [transactions]);

  useEffect(() => {
    let mounted = true;

    const loadPaymentModes = async () => {
      try {
        const response = await settlementService.getPaymentModeList();
        if (!mounted) return;
        const mapped = (response || [])
          .map(normalizePaymentMode)
          .filter((item): item is PaymentModeOption => Boolean(item))
          .sort((a, b) => a.name.localeCompare(b.name));
        setPaymentModes(mapped);
      } catch (error: any) {
        console.error('Failed to load payment modes', error);
        toast.error(error?.message || 'Unable to load payment modes');
      }
    };

    loadPaymentModes();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFetchTransactions = async () => {
    if (!transDate) {
      toast.error('Please select a transaction date');
      return;
    }

    setIsLoading(true);
    setCsvPreview(null);

    try {
      const records = await settlementService.getDisbursements({
        clientCode: 'ALL',
        transDate: transDate,
        pgPayMode: bank,
        paymentMode: paymentMode === 'ALL' ? '' : paymentMode
      });
      setTransactions(records);
      setPage(1);
      toast.success(`Fetched ${records.length} record${records.length === 1 ? '' : 's'}`);
    } catch (error: any) {
      console.error('Failed to fetch transactions', error);
      toast.error(error?.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewCsv = async () => {
    if (!transDate) {
      toast.error('Please select a transaction date');
      return;
    }

    setIsLoading(true);

    try {
      const csvText = await settlementService.getDisbursementCSV({
        clientCode: 'ALL',
        transDate: transDate,
        pgPayMode: bank,
        paymentMode: paymentMode === 'ALL' ? '' : paymentMode
      });

      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

      const columns = parsed.meta.fields || [];
      const rows = Array.isArray(parsed.data) ? (parsed.data as Record<string, string>[]) : [];

      setCsvPreview({ columns, rows });
      toast.success(`CSV generated with ${rows.length} row${rows.length === 1 ? '' : 's'}`);
    } catch (error: any) {
      console.error('Failed to generate CSV', error);
      toast.error(error?.message || 'Failed to generate CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!csvPreview || !transDate) return;

    const csvString = Papa.unparse(csvPreview.rows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `settlement-${transDate}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmSettlement = async () => {
    if (!transDate) {
      toast.error('Please select a transaction date');
      return;
    }

    const confirmed = window.confirm('Confirm settlement for the selected filters?');
    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await settlementService.postSettlement({
        clientCode: 'ALL',
        transDate: transDate,
        pgPayMode: bank,
        paymentMode: paymentMode === 'ALL' ? '' : paymentMode
      });

      const detail = response?.detail || response?.message || 'Settlement confirmed successfully';
      toast.success(detail);
      setCsvPreview(null);
      setTransactions([]);
    } catch (error: any) {
      console.error('Failed to confirm settlement', error);
      toast.error(error?.message || 'Failed to confirm settlement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySearch = async () => {
    setIsLoading(true);

    try {
      const records = await settlementService.getDailyDisbursement({
        startDate: historyStart || '',
        endDate: historyEnd || '',
        search: historySearch
      });
      setHistoryRecords(records);
      toast.success(`Found ${records.length} disbursement record${records.length === 1 ? '' : 's'}`);
    } catch (error: any) {
      console.error('Failed to fetch disbursement history', error);
      toast.error(error?.message || 'Failed to fetch disbursement history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setBulkFile(file);
    setBulkConfirmed(false);
    setBulkPreview([]);

    if (!file) {
      return;
    }

    Papa.parse(file, {
      complete: (result) => {
        if (Array.isArray(result.data)) {
          setBulkPreview(result.data as string[][]);
        }
      },
      error: (error) => {
        console.error('Failed to parse CSV', error);
        toast.error('Failed to parse CSV file');
      }
    });
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error('Please choose a CSV file to upload');
      return;
    }

    if (!bulkConfirmed) {
      toast.error('Please confirm the previewed data before uploading');
      return;
    }

    setBulkUploading(true);

    try {
      await settlementService.postBulkSettlementCSV(bulkFile);
      toast.success('Bulk disbursement file uploaded successfully');
      setBulkFile(null);
      setBulkPreview([]);
      setBulkConfirmed(false);
    } catch (error: any) {
      console.error('Bulk upload failed', error);
      toast.error(error?.message || 'Failed to upload bulk disbursement file');
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Disbursement</h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          Manage settlement disbursements, review historical batches, and upload bulk settlement CSV files. Parity with the
          Angular DisbSettlement module.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {(
            [
              ['disbursement', 'Disbursement'],
              ['history', 'View Disbursement'],
              ['bulk', 'Bulk Disbursement'],
            ] as Array<[Tab, string]>
          ).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`min-h-[52px] touch-manipulation whitespace-nowrap px-4 md:px-6 py-3 text-sm font-extrabold transition-colors ${
                activeTab === tab
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {activeTab === 'disbursement' && (
            <div className="space-y-4 md:space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Filter Disbursements</h2>
                <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select bank, transaction date, and payment mode to fetch disbursement records</p>
              </div>

              {/* Filters */}
              <div className="relative z-20 grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Bank</Label>
                  <Combobox
                    value={bank}
                    onChange={setBank}
                    options={[{ value: 'Yes Bank', label: 'Yes Bank' }]}
                    placeholder="Select bank"
                    className="mt-2 min-h-[44px] touch-manipulation"
                  />
                </div>
                <div>
                  <Label>Transaction date</Label>
                  <DatePicker
                    value={transDate}
                    onChange={(val) => setTransDate(val)}
                    maxDate={yesterday}
                    className="mt-2 min-h-[44px] touch-manipulation"
                  />
                </div>
                <div>
                  <Label>Payment mode</Label>
                  <Combobox
                    value={paymentMode}
                    onChange={setPaymentMode}
                    options={[
                      { value: 'ALL', label: 'All' },
                      ...paymentModes.map((mode) => ({ value: mode.id, label: mode.name }))
                    ]}
                    placeholder="Select payment mode"
                    className="mt-2 min-h-[44px] touch-manipulation"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Button
                  onClick={handleFetchTransactions}
                  disabled={isLoading}
                  className="min-h-[52px] touch-manipulation"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Fetch transactions →
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePreviewCsv}
                  disabled={isLoading || !transDate}
                  className="min-h-[52px] touch-manipulation"
                >
                  <FileText className="mr-2 h-4 w-4" /> Generate CSV preview
                </Button>
                <Button
                  variant="outline"
                  onClick={handleConfirmSettlement}
                  disabled={isLoading || !transDate}
                  className="min-h-[52px] touch-manipulation"
                >
                  Confirm settlement →
                </Button>
                {csvPreview && (
                  <Button
                    variant="link"
                    onClick={handleDownloadCsv}
                    className="min-h-[52px] touch-manipulation"
                  >
                    Download CSV
                  </Button>
                )}
              </div>

              {transactions.length > 0 && (
                <div className="space-y-4">
                  {/* Section Header */}
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Transaction Records</h2>
                    <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>View and manage fetched disbursement transactions</p>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-gray-600">
                    <span className="font-medium">Records: {transactions.length.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <span className="hidden md:inline">Rows per page</span>
                      <Combobox
                        value={String(pageSize)}
                        onChange={(value) => {
                          setPageSize(Number(value));
                          setPage(1);
                        }}
                        options={[10, 20, 50, 100, 200, 500].map((size) => ({
                          value: String(size),
                          label: String(size)
                        }))}
                        placeholder="Page size"
                        className="w-24 min-h-[44px] touch-manipulation"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <div className="md:hidden px-3 py-2 bg-gray-50 text-xs text-gray-600 border-b border-gray-200">
                      Swipe to view more columns
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {transactionColumns.map((column) => (
                            <th
                              key={column}
                              className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {paginatedTransactions.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            {transactionColumns.map((column) => (
                              <td
                                key={`${column}-${index}`}
                                className={`px-3 md:px-4 py-2 md:py-3 text-sm whitespace-nowrap ${
                                  column.toLowerCase().includes('amount') || column.toLowerCase().includes('paid')
                                    ? 'text-emerald-600 font-semibold'
                                    : 'text-gray-600'
                                }`}
                              >
                                {renderValue(row[column])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-gray-600">
                    <span>
                      Page {page} of {Math.max(1, Math.ceil(transactions.length / pageSize))}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="min-h-[52px] touch-manipulation"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page * pageSize >= transactions.length}
                        onClick={() => setPage((p) => p + 1)}
                        className="min-h-[52px] touch-manipulation"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {csvPreview && (
                <div className="space-y-3 md:space-y-4">
                  {/* Section Header */}
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>CSV Preview</h2>
                    <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Preview of generated CSV file before download</p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <div className="md:hidden px-3 py-2 bg-gray-50 text-xs text-gray-600 border-b border-gray-200">
                      Swipe to view more columns
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {csvPreview.columns.map((column) => (
                            <th
                              key={column}
                              className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {csvPreview.rows.slice(0, 20).map((row, index) => (
                          <tr key={`preview-${index}`} className="hover:bg-gray-50 transition-colors">
                            {csvPreview.columns.map((column) => (
                              <td
                                key={`${column}-${index}`}
                                className={`px-3 md:px-4 py-2 md:py-3 text-sm whitespace-nowrap ${
                                  column.toLowerCase().includes('amount') || column.toLowerCase().includes('paid')
                                    ? 'text-emerald-600 font-semibold'
                                    : 'text-gray-600'
                                }`}
                              >
                                {renderValue(row[column])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.rows.length > 20 && (
                    <p className="text-xs text-gray-600">
                      Showing first 20 rows. Use the download option for the full CSV.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 md:space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Disbursement History</h2>
                <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Search and view historical disbursement records by date range</p>
              </div>

              {/* Filters */}
              <div className="relative z-20 grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Start date</Label>
                  <DatePicker
                    value={historyStart}
                    onChange={(val) => setHistoryStart(val)}
                    className="mt-2 min-h-[44px] touch-manipulation"
                  />
                </div>
                <div>
                  <Label>End date</Label>
                  <DatePicker
                    value={historyEnd}
                    onChange={(val) => setHistoryEnd(val)}
                    className="mt-2 min-h-[44px] touch-manipulation"
                  />
                </div>
                <div>
                  <Label>Search</Label>
                  <div className="relative z-10 mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                    <Input
                      value={historySearch}
                      onChange={(event) => setHistorySearch(event.target.value)}
                      className="pl-9 min-h-[44px] touch-manipulation"
                      placeholder="Batch ID or reference"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleHistorySearch}
                disabled={isLoading}
                className="min-h-[52px] touch-manipulation"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Search →
              </Button>

              {historyRecords.length > 0 ? (
                <div>
                  {/* Section Header */}
                  <div className="mb-3">
                    <h3 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Search Results</h3>
                    <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Found {historyRecords.length} disbursement record{historyRecords.length === 1 ? '' : 's'}</p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <div className="md:hidden px-3 py-2 bg-gray-50 text-xs text-gray-600 border-b border-gray-200">
                      Swipe to view more columns
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {['date', 'txn_count', 'paid_amount', 'current_status', 'disbursement_ref_number', 'file_url'].map((column) => (
                            <th
                              key={column}
                              className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600"
                            >
                              {column.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {historyRecords.map((record, index) => (
                          <tr key={`history-${index}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-600 whitespace-nowrap">
                              {renderValue(record.date)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-600 whitespace-nowrap">
                              {renderValue(record.txn_count)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-emerald-600 font-semibold whitespace-nowrap">
                              {renderValue(record.paid_amount)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                  record.current_status?.toLowerCase().includes('success') ||
                                  record.current_status?.toLowerCase().includes('completed')
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : record.current_status?.toLowerCase().includes('pending')
                                    ? 'bg-amber-100 text-amber-700'
                                    : record.current_status?.toLowerCase().includes('failed')
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {renderValue(record.current_status)}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-gray-600 whitespace-nowrap">
                              {renderValue(record.disbursement_ref_number)}
                            </td>
                            <td className="px-3 md:px-4 py-2 md:py-3 text-sm text-blue-500 whitespace-nowrap">
                              {record.file_url ? (
                                <a
                                  className="underline hover:text-blue-700 transition-colors"
                                  target="_blank"
                                  rel="noreferrer"
                                  href={record.file_url}
                                >
                                  Download
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No history records loaded yet.</p>
              )}
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="space-y-4 md:space-y-6">
              {/* Section Header */}
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Bulk Disbursement Upload</h2>
                <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Upload CSV file for bulk disbursement processing</p>
              </div>

              <div>
                <Label>Upload CSV</Label>
                <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkFileChange}
                    className="md:w-80 min-h-[44px] touch-manipulation"
                  />
                  {bulkFile && <span className="text-sm text-gray-600 font-medium">{bulkFile.name}</span>}
                </div>
              </div>

              {bulkPreview.length > 0 && (
                <div className="space-y-3 md:space-y-4">
                  {/* Section Header */}
                  <div>
                    <h3 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>File Preview</h3>
                    <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Review the uploaded CSV data before confirmation</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      id="bulk-confirm"
                      type="checkbox"
                      className="h-4 w-4 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:h-4 md:w-4 touch-manipulation"
                      checked={bulkConfirmed}
                      onChange={(event) => setBulkConfirmed(event.target.checked)}
                    />
                    <label htmlFor="bulk-confirm" className="font-medium">
                      I confirm the data previewed below is correct.
                    </label>
                  </div>

                  <div className="max-h-64 overflow-auto rounded-xl border border-gray-200">
                    <div className="md:hidden px-3 py-2 bg-gray-50 text-xs text-gray-600 border-b border-gray-200 sticky top-0">
                      Swipe to view more columns
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <tbody className="bg-white">
                        {bulkPreview.slice(0, 20).map((row, rowIndex) => (
                          <tr key={`bulk-${rowIndex}`} className="divide-x divide-gray-200 hover:bg-gray-50 transition-colors">
                            {row.map((cell, cellIndex) => (
                              <td key={`bulk-${rowIndex}-${cellIndex}`} className="px-2 md:px-3 py-1 md:py-2 text-gray-600 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {bulkPreview.length > 20 && (
                    <p className="text-xs text-gray-600">Showing the first 20 rows of the file.</p>
                  )}
                </div>
              )}

              <Button
                onClick={handleBulkUpload}
                disabled={bulkUploading || !bulkFile}
                className="min-h-[52px] touch-manipulation"
              >
                {bulkUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload →
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 md:p-6 text-sm text-amber-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>
            Settlements rely on production sendpaylink endpoints. Ensure the client API key is up to date before confirming
            or uploading disbursement CSV files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisbursementPage;
