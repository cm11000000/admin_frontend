'use client';

/**
 * Transaction Enquiry Page (Angular parity)
 * - Mirrors viewtransactions.component.ts
 * - Light theme aligned with other V5 report pages
 */

import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  FileText,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { transactionService } from '@/services/api/TransactionApiService';

interface TransactionData {
  txn_id?: string;
  client_txn_id?: string;
  payment_mode?: string;
  payee_name?: string;
  payee_mob?: string;
  payee_email?: string;
  status?: string;
  bank_txn_id?: string;
  client_name?: string;
  client_id?: string;
  client_code?: string;
  payee_amount?: number | string;
  paid_amount?: number | string;
  trans_date?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  settlement_amount?: number | string;
  charge_back_amount?: number | string;
  charge_back_date?: string;
  charge_back_remarks?: string;
  refund_initiated_on?: string;
  refund_process_on?: string;
  refunded_amount?: number | string;
  refund_track_id?: string;
}

const DATE_KEYS = new Set([
  'trans_date',
  'charge_back_date',
  'refund_initiated_on',
  'refund_process_on',
]);

const MONEY_KEYS = new Set([
  'payee_amount',
  'paid_amount',
  'settlement_amount',
  'charge_back_amount',
  'refunded_amount',
]);

export default function TransactionEnquiryPage() {
  if (typeof window === 'undefined') return null;
  const [txnId, setTxnId] = useState('');
  const [isSabPaisaId, setIsSabPaisaId] = useState(true);
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const placeholder = isSabPaisaId
    ? 'Enter SabPaisa transaction id'
    : 'Enter client transaction id';

  const displayValue = useCallback((value: unknown, key?: string) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    if (key && MONEY_KEYS.has(key)) {
      const amount = Number(value);
      if (!Number.isNaN(amount)) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
        }).format(amount);
      }
    }

    if (key && DATE_KEYS.has(key)) {
      const raw = String(value).trim();
      const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
      const parsed = new Date(normalized);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      }
      return raw;
    }

    return String(value);
  }, []);

  const handleRadioChange = useCallback((type: 'sptxnid' | 'clttxnid') => {
    setIsSabPaisaId(type === 'sptxnid');
    setTxnId('');
    setTransaction(null);
    setShowGrid(false);
    setShowMsg(false);
  }, []);

  const handleSearch = useCallback(async () => {
    const trimmed = txnId.trim();
    if (!trimmed) {
      toast.error('Transaction Id required!');
      return;
    }

    const strQry = isSabPaisaId ? `${trimmed}/0` : `0/${trimmed}`;

    setIsLoading(true);
    setShowMsg(false);
    setShowGrid(false);

    try {
      const response = await transactionService.viewTransaction(strQry);
      const candidate = Array.isArray(response)
        ? response[0]
        : Array.isArray(response?.results)
          ? response.results[0]
          : response;

      if (!candidate || candidate === '') {
        setTransaction(null);
        setShowGrid(false);
        setShowMsg(true);
        return;
      }

      setTransaction(candidate as TransactionData);
      setShowGrid(true);
      setShowMsg(false);
    } catch (error) {
      console.error('Transaction enquiry error:', error);
      setTransaction(null);
      setShowGrid(false);
      setShowMsg(true);
      toast.error('Failed to fetch transaction details');
    } finally {
      setIsLoading(false);
    }
  }, [isSabPaisaId, txnId]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    setTxnId('');
    setTransaction(null);
    setShowGrid(false);
    setShowMsg(false);
  };

  const detailRows = useMemo(() => {
    if (!transaction)
      return [] as Array<Array<{ label: string; key?: keyof TransactionData } | null>>;
    return [
      [
        { label: 'Txn Id', key: 'txn_id' },
        { label: 'Payment Mode', key: 'payment_mode' },
        { label: 'Payee Name', key: 'payee_name' },
      ],
      [
        { label: 'Payee Mobile', key: 'payee_mob' },
        { label: 'Payee Email', key: 'payee_email' },
        { label: 'Status', key: 'status' },
      ],
      [
        { label: 'Bank Txn Id', key: 'bank_txn_id' },
        { label: 'Client Name', key: 'client_name' },
        { label: 'Client Id', key: 'client_id' },
      ],
      [
        { label: 'Payee Amount (INR)', key: 'payee_amount' },
        { label: 'Paid Amount', key: 'paid_amount' },
        { label: 'Trans Date', key: 'trans_date' },
      ],
      [
        { label: 'Client Code', key: 'client_code' },
        { label: 'Client Txn Id', key: 'client_txn_id' },
        { label: 'Settlement Status', key: 'udf1' },
      ],
      [
        { label: 'Chargeback', key: 'udf2' },
        { label: 'Refund', key: 'udf3' },
        { label: 'Refund Track Id', key: 'udf4' },
      ],
      [
        { label: 'Settlement Amount', key: 'settlement_amount' },
        { label: 'Chargeback Amount', key: 'charge_back_amount' },
        { label: 'Chargeback Date', key: 'charge_back_date' },
      ],
      [
        { label: 'Chargeback Remarks', key: 'charge_back_remarks' },
        { label: 'Refund Initiated On', key: 'refund_initiated_on' },
        { label: 'Refund Process On', key: 'refund_process_on' },
      ],
      [
        { label: 'Refunded Amount', key: 'refunded_amount' },
        { label: 'Refund Track Id', key: 'refund_track_id' },
        null,
      ],
    ];
  }, [transaction]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Section Header */}
      <header className="pb-3 md:pb-4 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Transaction Enquiry</h1>
        <p className="text-gray-600 text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
          Search and view transaction details by SabPaisa or client transaction ID
        </p>
      </header>

      {/* Search Section */}
      <section className="relative z-10">
        <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 md:p-6 space-y-4">
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>Search Transaction</h2>
            <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
              Enter transaction ID to view details
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] touch-manipulation">
              <input
                type="radio"
                name="txnType"
                checked={isSabPaisaId}
                onChange={() => handleRadioChange('sptxnid')}
                className="w-4 h-4 text-blue-500 bg-white border-gray-300 focus:ring-blue-500"
              />
              <span className="select-none">SabPaisa Transaction ID</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] touch-manipulation">
              <input
                type="radio"
                name="txnType"
                checked={!isSabPaisaId}
                onChange={() => handleRadioChange('clttxnid')}
                className="w-4 h-4 text-blue-500 bg-white border-gray-300 focus:ring-blue-500"
              />
              <span className="select-none">Client Transaction ID</span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoCapitalize="none"
                autoComplete="off"
                value={txnId}
                onChange={(event) => setTxnId(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 md:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0077FF]/50 min-h-[44px] touch-manipulation"
              />
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex-1 md:flex-none px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden md:inline">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    View →
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                disabled={isLoading && !txnId}
                className="flex-1 md:flex-none px-4 md:px-5 py-2.5 md:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2 min-h-[52px] touch-manipulation"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="md:inline">Reset</span>
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-6 md:py-8">
              <div className="text-center text-gray-700 text-sm flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching transaction...
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Hint Section */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 md:p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-orange-700 font-extrabold text-sm md:text-base" style={{ letterSpacing: '-0.02em' }}>Hint</p>
          <p className="text-orange-700 text-xs md:text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
            Use the exact transaction identifier as available in the Angular portal. SabPaisa ID checks `{`txnId/0`}` while client ID checks `0/clientTxnId`.
          </p>
        </div>
      </div>

      {/* Transaction Details Section */}
      {showGrid && transaction && (
        <section className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 md:p-6 print:bg-white print:text-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 md:pb-4 border-b border-gray-200 print:border-black/20">
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900 print:text-black" style={{ letterSpacing: '-0.02em' }}>Transaction Details</h2>
              <p className="text-xs md:text-sm text-gray-600 print:text-black/60 font-light" style={{ letterSpacing: '-0.01em' }}>
                Complete transaction information
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 print:hidden min-h-[52px] touch-manipulation whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              Print
            </button>
          </div>

          <div className="mt-4 md:mt-6">
            {/* Mobile scroll hint */}
            <div className="md:hidden mb-2 text-center">
              <p className="text-xs text-gray-500">← Scroll to view all details →</p>
            </div>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {detailRows.map((row, rowIndex) => (
                      <tr
                        key={`row-${rowIndex}`}
                        className="border-b border-gray-200 last:border-none print:border-black/20"
                      >
                        {row.map((cell, cellIndex) => (
                          <React.Fragment key={`${rowIndex}-${cellIndex}`}>
                            {cell ? (
                              <>
                                <td className="px-3 md:px-4 py-2 md:py-3 w-1/6 text-xs font-extrabold uppercase tracking-wide text-gray-700 print:text-black/70">
                                  {cell.label}
                                </td>
                                <td className="px-3 md:px-4 py-2 md:py-3 w-1/6 text-gray-900 print:text-black break-words">
                                  {displayValue(
                                    cell.key ? transaction[cell.key] : undefined,
                                    cell.key
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 md:px-4 py-2 md:py-3 w-1/6" />
                                <td className="px-3 md:px-4 py-2 md:py-3 w-1/6" />
                              </>
                            )}
                          </React.Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* No Results Message */}
      {showMsg && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 text-center text-gray-700">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-base md:text-lg">
            I can't find the result for you with the given search, I'm sorry, could you try it once again.
          </p>
        </div>
      )}
    </div>
  );
}
