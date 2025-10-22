'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
// XLSX is lazy-loaded in export handler
import {
  Search,
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import AdminApiClient from '@/services/api/AdminApiService';
import ReportApiService from '@/services/api/ReportApiService';
import { DatePicker } from '@/components/ui/date-picker';
import { Combobox } from '@/components/ui/combobox';
import { resolveUserName } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface ClientOption {
  code: string;
  name: string;
}

interface SbiRefundRecord {
  txn_id?: string;
  client_code?: string;
  client_txn_id?: string;
  payee_amount?: number | string;
  payee_first_name?: string;
  payee_email?: string;
  payee_mob?: string;
  trans_date?: string;
  payment_mode?: string;
  status?: string;
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatAmount = (value?: number | string) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const amount = Number(value);
  return Number.isNaN(amount) ? String(value) : INR.format(amount);
};

const formatDate = (value?: string | number | null) => {
  if (!value) return 'N/A';
  const raw = String(value).trim();
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const statusChipClass = (status?: string) => {
  const value = status?.toLowerCase() || '';
  if (value.includes('success') || value.includes('refunded')) {
    return 'bg-green-500/20 text-green-700 border-green-500/30';
  }
  if (value.includes('pending') || value.includes('init')) {
    return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
  }
  if (value.includes('reject') || value.includes('fail')) {
    return 'bg-red-500/20 text-red-700 border-red-500/30';
  }
  return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
};

const normaliseClient = (record: any): ClientOption | null => {
  const code = record?.client_code || record?.clientcode || record?.clientCode || record?.client_id || record?.code;
  const name = record?.client_name || record?.clientname || record?.clientName || record?.name || code;
  if (!code) return null;
  return {
    code: String(code).trim(),
    name: String(name ?? code).trim(),
  };
};

export default function SbiRefundPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [clients, setClients] = useState<ClientOption[]>([{ code: 'ALL', name: 'All Clients' }]);
  const [selectedClient, setSelectedClient] = useState('ALL');
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  });

  const [records, setRecords] = useState<SbiRefundRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SbiRefundRecord | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundResponse, setRefundResponse] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const resolved = resolveUserName();
    if (resolved) setUserName(resolved);
  }, []);

  const loadClients = useCallback(async (loginBy: string) => {
    try {
      const data = await ReportApiService.getClientCodeListUSP_Cached(loginBy);
      const options = (Array.isArray(data) ? data : [])
        .map(normaliseClient)
        .filter(Boolean) as ClientOption[];
      setClients([{ code: 'ALL', name: 'All Clients' }, ...options]);
    } catch (error) {
      console.error('Failed to load client list', error);
      toast.error('Failed to load client list');
    }
  }, []);

  useEffect(() => {
    if (userName) {
      loadClients(userName);
    }
  }, [userName, loadClients]);

  const clientOptions = useMemo(() => {
    return clients.map((client) => ({
      value: client.code,
      label: client.code === 'ALL' ? 'ALL - All Clients' : client.name,
    }));
  }, [clients]);

  const fetchSbiData = useCallback(async () => {
    const trimmedClient = selectedClient?.trim() || 'ALL';

    if (!dateFrom || !dateTo) {
      toast.error('Please select date range');
      return;
    }

    const dFrom = new Date(dateFrom)
    const dTo = new Date(dateTo)
    const diffDays = Math.ceil((dTo.getTime() - dFrom.getTime()) / (1000 * 60 * 60 * 24));

    if (Number.isNaN(diffDays)) {
      toast.error('Invalid date range');
      return;
    }

    if (diffDays < 0) {
      toast.error('To Date must be after From Date');
      return;
    }

    if (diffDays > 92) {
      toast.error('Date range cannot exceed 92 days');
      return;
    }

    setIsLoading(true);
    setSelectedIndex(null);
    setSelectedRecord(null);
    setRefundResponse(null);
    setShowRefundDialog(false);

    try {
      const payload = {
        clientCode: trimmedClient,
        fromDate: dateFrom,
        endDate: dateTo,
        page: 0,
        length: 0,
      };
      const data = await AdminApiClient.getSbiCardData(payload);
      const list = Array.isArray(data) ? data : [];
      setRecords(list);
      if (list.length === 0) {
        toast.info('No data found for the selected filters');
      }
    } catch (error) {
      console.error('Failed to fetch SBI data', error);
      toast.error('Failed to fetch SBI refund data');
      setRecords([]);
    } finally {
      setIsLoading(false);
      setCurrentPage(0);
    }
  }, [selectedClient, dateFrom, dateTo]);

  const handleClearFilters = () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    setDateFrom(today);
    setDateTo(today);
    setSelectedClient('ALL');
    setSearchTerm('');
    setRecords([]);
    setSelectedIndex(null);
    setSelectedRecord(null);
    setRefundResponse(null);
    setShowRefundDialog(false);
    setCurrentPage(0);
  };

  const filteredRecords = useMemo(() => {
    if (!debouncedSearch) return records;
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) => {
      const fields = [
        record.txn_id,
        record.client_code,
        record.client_txn_id,
        record.payee_first_name,
        record.payee_email,
        record.payee_mob,
      ];
      return fields.some((field) => field?.toString().toLowerCase().includes(term));
    });
  }, [records, debouncedSearch]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredRecords.length / pageSize)),
    [filteredRecords.length, pageSize]
  );

  const paginatedRecords = useMemo(() => {
    const start = currentPage * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const metrics = useMemo(() => {
    if (records.length === 0) {
      return {
        totalRequests: 0,
        pending: 0,
        completed: 0,
        totalAmount: 0,
      };
    }

    return records.reduce(
      (acc, record) => {
        const status = record.status?.toLowerCase() || '';
        const amount = Number(record.payee_amount) || 0;
        return {
          totalRequests: acc.totalRequests + 1,
          pending: acc.pending + (status.includes('pending') || status.includes('init') ? 1 : 0),
          completed: acc.completed + (status.includes('success') || status.includes('refund') ? 1 : 0),
          totalAmount: acc.totalAmount + amount,
        };
      },
      { totalRequests: 0, pending: 0, completed: 0, totalAmount: 0 }
    );
  }, [records]);

  const handleRowSelection = (index: number) => {
    const globalIndex = currentPage * pageSize + index;
    if (selectedIndex === globalIndex) {
      setSelectedIndex(null);
      setSelectedRecord(null);
    } else {
      setSelectedIndex(globalIndex);
      setSelectedRecord(filteredRecords[globalIndex]);
    }
    setRefundResponse(null);
    setShowRefundDialog(false);
  };

  const handleRefund = async () => {
    if (!selectedRecord) {
      toast.error('Select a transaction to process refund');
      return;
    }

    if (!window.confirm('Are you sure you want to process this refund?')) {
      return;
    }

    try {
      const payload = {
        clientCode: selectedRecord.client_code || '',
        clientTxnId: selectedRecord.client_txn_id || '',
        spTxnId: selectedRecord.txn_id || '',
        amount: selectedRecord.payee_amount || 0,
      };

      const response = await AdminApiClient.postSbiRefund(payload);
      setRefundResponse(response);
      setShowRefundDialog(true);
      toast.success('Refund processed successfully');
      await fetchSbiData();
    } catch (error: any) {
      console.error('Refund processing error', error);
      const message = error?.response?.data?.message || 'Failed to process refund';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="pb-3 md:pb-4 border-b border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>SBI / RBI Refunds</h1>
          <p className="text-gray-700 text-xs md:text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
            Retrieve SBI card refund requests and trigger refunds via COB API.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push('/refunds')}
            className="min-h-[44px] touch-manipulation px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:border-gray-400 transition"
          >
            Back to Merchant Refunds
          </button>
          <button
            onClick={fetchSbiData}
            disabled={isLoading}
            className="min-h-[44px] touch-manipulation px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 hover:border-gray-400 transition disabled:opacity-50"
          >
            <Search className={`w-4 h-4 inline mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Search
          </button>
        </div>
      </header>

      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl">
          <p className="text-xs uppercase font-extrabold text-gray-700 mb-1" style={{ letterSpacing: '-0.02em' }}>Total Requests</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{metrics.totalRequests}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl">
          <p className="text-xs uppercase font-extrabold text-gray-700 mb-1" style={{ letterSpacing: '-0.02em' }}>Pending</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{metrics.pending}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl">
          <p className="text-xs uppercase font-extrabold text-gray-700 mb-1" style={{ letterSpacing: '-0.02em' }}>Completed</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{metrics.completed}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl">
          <p className="text-xs uppercase font-extrabold text-gray-700 mb-1" style={{ letterSpacing: '-0.02em' }}>Total Amount</p>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{formatAmount(metrics.totalAmount)}</p>
        </div>
      </div>

      <section className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-6 space-y-4 relative z-20">
        <div className="mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Filter Refund Requests</h2>
          <p className="text-xs md:text-sm text-gray-700 mt-0.5 font-light" style={{ letterSpacing: '-0.01em' }}>
            Select client and date range to search for refund requests
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-64 space-y-2">
            <label className="block text-xs font-extrabold text-gray-700" style={{ letterSpacing: '-0.02em' }}>Client</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Combobox
                  options={clientOptions}
                  value={selectedClient}
                  onChange={(value) => {
                    setSelectedClient(value);
                    setCurrentPage(0);
                  }}
                  placeholder="Select client..."
                  searchPlaceholder="Search clients..."
                  emptyMessage="No clients found"
                  onOpenChange={async (open) => {
                    if (open && clients.length <= 1 && userName) {
                      await loadClients(userName);
                    }
                  }}
                  className="min-h-[44px]"
                />
              </div>
              <button
                type="button"
                onClick={() => { setSelectedClient('ALL'); setCurrentPage(0); }}
                className="min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-full bg-white border border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-700 transition-colors"
              >
                ALL
              </button>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-2" style={{ letterSpacing: '-0.02em' }}>From Date</label>
              <DatePicker
                value={dateFrom}
                onChange={(val) => setDateFrom(val)}
                placeholder="Select start date"
                className="min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-2" style={{ letterSpacing: '-0.02em' }}>To Date</label>
              <DatePicker
                value={dateTo}
                onChange={(val) => setDateTo(val)}
                placeholder="Select end date"
                className="min-h-[44px]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 relative z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search transactions..."
              className="w-full min-h-[44px] touch-manipulation pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchSbiData}
              disabled={isLoading}
              className="min-h-[52px] touch-manipulation px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-extrabold flex items-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search →
                </>
              )}
            </button>
            <button
              onClick={handleClearFilters}
              className="min-h-[52px] touch-manipulation px-4 py-2.5 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition flex items-center gap-2 font-extrabold"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={async () => {
                if (filteredRecords.length === 0) {
                  toast.error('No data to export');
                  return;
                }
                try {
                  const XLSX = await import('xlsx');
                  const exportRows = filteredRecords.map((record, index) => ({
                    '#': index + 1,
                    'Client Code': record.client_code || 'N/A',
                    'Transaction ID': record.txn_id || 'N/A',
                    'Client Transaction ID': record.client_txn_id || 'N/A',
                    'Payee Amount': Number(record.payee_amount) || 0,
                    'Transaction Date': formatDate(record.trans_date),
                    Status: (record.status || 'PENDING').toUpperCase(),
                    'Payee Name': record.payee_first_name || 'N/A',
                    'Payee Mobile': record.payee_mob || 'N/A',
                    'Payee Email': record.payee_email || 'N/A',
                    'Payment Mode': record.payment_mode || 'N/A',
                  }));
                  const worksheet = XLSX.utils.json_to_sheet(exportRows);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'SBIRefunds');
                  XLSX.writeFile(workbook, `sbi-refunds-${new Date().toISOString().slice(0, 10)}.xlsx`);
                  toast.success('Export completed successfully');
                } catch (error) {
                  console.error('Export error', error);
                  toast.error('Failed to export data');
                }
              }}
              disabled={filteredRecords.length === 0}
              className="min-h-[52px] touch-manipulation px-4 py-2.5 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </section>

      {records.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs md:text-sm text-gray-700 px-2 md:px-0">
          <span>
            Showing <span className="text-gray-900 font-semibold">{paginatedRecords.length}</span> of{' '}
            <span className="text-gray-900 font-semibold">{filteredRecords.length}</span> records
            {searchTerm && ` (filtered from ${records.length})`}
          </span>
          <span>Page {currentPage + 1} of {totalPages}</span>
        </div>
      )}

      {(records.length === 0 && !isLoading) && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-8 md:p-12 text-center text-gray-700">
          <FileSpreadsheet className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-gray-500" />
          <p className="font-medium text-sm md:text-base">No data loaded</p>
          <p className="text-xs md:text-sm text-gray-500 mt-2">Select filters and click Search to fetch SBI refund data.</p>
        </div>
      )}

      {(records.length > 0 || isLoading) && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden">
          <div className="mb-3 md:mb-4 px-4 md:px-6 pt-4 md:pt-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Refund Requests</h2>
            <p className="text-xs md:text-sm text-gray-700 mt-0.5">
              View and process SBI refund requests
            </p>
          </div>
          <div className="overflow-x-auto">
            <div className="inline-block md:hidden px-4 pb-2 text-xs text-gray-700">
              Scroll horizontally to view all columns →
            </div>
            <table className="w-full text-xs md:text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase text-xs font-extrabold" style={{ letterSpacing: '-0.02em' }}>
                <tr className="border-b border-[#0077FF]/30">
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Client Code</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Txn ID</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Client Txn ID</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-right whitespace-nowrap">Payee Amount</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Trans Date</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Status</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Payee Name</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Payee Mobile</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Payee Email</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Payment Mode</th>
                  <th className="px-3 md:px-4 py-2.5 md:py-3 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-900">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, rowIdx) => (
                    <tr key={`loading-${rowIdx}`} className="animate-pulse">
                      {Array.from({ length: 11 }).map((__, cellIdx) => (
                        <td key={cellIdx} className="px-3 md:px-4 py-2.5 md:py-3">
                          <div className="h-3 md:h-4 bg-gray-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-3 md:px-4 py-8 md:py-12 text-center text-gray-700 text-xs md:text-sm">
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record, index) => {
                    const globalIndex = currentPage * pageSize + index;
                    const selected = selectedIndex === globalIndex;
                    const statusLower = record.status?.toLowerCase() || '';
                    const isSuccess = statusLower.includes('success') || statusLower.includes('refunded');
                    const isPending = statusLower.includes('pending') || statusLower.includes('init');
                    const isFailed = statusLower.includes('reject') || statusLower.includes('fail');

                    return (
                      <tr
                        key={`${record.txn_id}-${index}`}
                        className={`transition cursor-pointer ${
                          selected
                            ? 'bg-[#FF8800]/10 border-l-4 border-[#FF8800]'
                            : isSuccess
                            ? 'hover:bg-green-500/5'
                            : isPending
                            ? 'hover:bg-yellow-500/5'
                            : isFailed
                            ? 'hover:bg-red-500/5'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleRowSelection(index)}
                      >
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 whitespace-nowrap">{record.client_code || 'N/A'}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 font-semibold whitespace-nowrap">{record.txn_id || 'N/A'}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 whitespace-nowrap">{record.client_txn_id || 'N/A'}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-gray-900 whitespace-nowrap font-medium">{formatAmount(record.payee_amount)}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 whitespace-nowrap">{formatDate(record.trans_date)}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusChipClass(record.status)}`}>
                            {(record.status || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 whitespace-nowrap">{record.payee_first_name || 'N/A'}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 whitespace-nowrap">{record.payee_mob || 'N/A'}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 truncate max-w-[180px]">{record.payee_email || 'N/A'}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 text-gray-900 whitespace-nowrap">{record.payment_mode || 'N/A'}</td>
                        <td className="px-3 md:px-4 py-2.5 md:py-3 whitespace-nowrap">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedIndex(globalIndex);
                              setSelectedRecord(record);
                              handleRefund();
                            }}
                            disabled={!record.client_code || !record.txn_id}
                            className="min-h-[52px] touch-manipulation px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs font-extrabold shadow hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Process →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && paginatedRecords.length > 0 && (
            <div className="bg-gray-50 px-3 md:px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-700 text-xs">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(0);
                  }}
                  className="min-h-[36px] touch-manipulation bg-gray-100 text-gray-900 border border-gray-300 rounded px-2 py-1"
                >
                  {[10, 25, 50, 100, 200].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="min-h-[36px] md:min-h-[40px] touch-manipulation px-3 py-1.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="whitespace-nowrap">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="min-h-[36px] md:min-h-[40px] touch-manipulation px-3 py-1.5 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedRecord && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4">
          <div className="text-xs md:text-sm text-gray-700">
            Selected Txn: <span className="text-gray-900 font-semibold">{selectedRecord.txn_id}</span> — Amount: <span className="text-gray-900 font-semibold">{formatAmount(selectedRecord.payee_amount)}</span>
          </div>
          <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
            <button
              onClick={handleRefund}
              className="min-h-[52px] touch-manipulation px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-extrabold shadow hover:from-orange-600 hover:to-orange-700"
            >
              Process Refund →
            </button>
            <button
              onClick={() => {
                setSelectedIndex(null);
                setSelectedRecord(null);
                setRefundResponse(null);
                setShowRefundDialog(false);
              }}
              className="min-h-[52px] touch-manipulation px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm hover:bg-gray-300 font-extrabold"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {showRefundDialog && refundResponse && (
        <div className="border border-green-500/30 bg-green-500/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-xs md:text-sm text-green-700">
          <p className="font-semibold mb-2">Refund Response</p>
          <pre className="bg-black/20 rounded-lg p-3 overflow-x-auto text-xs text-green-100">
            {JSON.stringify(refundResponse, null, 2)}
          </pre>
        </div>
      )}

      {isLoading && records.length === 0 && (
        <div className="flex items-center justify-center text-gray-700 text-xs md:text-sm">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading refund data...
        </div>
      )}

      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-700 flex-shrink-0 mt-0.5" />
        <p className="text-xs md:text-sm text-orange-700 font-light" style={{ letterSpacing: '-0.01em' }}>
          Refund processing triggers the COB API immediately. Ensure you select the correct transaction and verify the merchant has already settled the amount before submitting the refund request.
        </p>
      </div>
    </div>
  );
}
