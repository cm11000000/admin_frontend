'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { RefreshCw, Download, Clock, CheckCircle2, XCircle, FileSpreadsheet } from 'lucide-react';

interface ExportRow {
  id: number;
  from_date: string;
  to_date: string;
  created_by: string;
  created_on: string;
  is_active: boolean;
  s3_bucket_url: string;
  file_gen_status: 'Processing' | 'Completed' | 'Failure' | string;
  source?: string;
}

const statusIcon = (s: string) => {
  const v = (s || '').toLowerCase();
  if (v.startsWith('process')) return <Clock className="w-4 h-4 text-amber-600"/>;
  if (v.startsWith('complete')) return <CheckCircle2 className="w-4 h-4 text-emerald-600"/>;
  if (v.startsWith('fail')) return <XCircle className="w-4 h-4 text-rose-600"/>;
  return <Clock className="w-4 h-4 text-slate-500"/>;
};

export default function ExportsPage() {
  const [userName, setUserName] = useState<string>('');
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Processing' | 'Completed' | 'Failure'>('All');

  const load = React.useCallback(async () => {
    if (!userName) return;
    setLoading(true);
    try {
      const resp = await ReportApiService.listTxnReportS3Details({ created_by: userName, limit: 100 });
      const list = Array.isArray(resp?.results) ? resp.results : [];
      setRows(list as ExportRow[]);
    } catch (e) {
      console.error('[Exports] Failed to load list', e);
      toast.error('Failed to load exports');
    } finally {
      setLoading(false);
    }
  }, [userName]);

  // Resolve user and load
  useEffect(() => {
    const u = resolveUserName();
    if (u) setUserName(u);
  }, []);

  useEffect(() => {
    if (userName) load();
  }, [userName, load]);

  // Auto refresh every 5s while Processing exists
  useEffect(() => {
    if (!rows.some(r => String(r.file_gen_status).toLowerCase().startsWith('process'))) return;
    const id = setInterval(() => load(), 30000);
    return () => clearInterval(id);
  }, [rows, load]);

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return rows;
    return rows.filter(r => String(r.file_gen_status).toLowerCase().startsWith(statusFilter.toLowerCase()));
  }, [rows, statusFilter]);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            Exports
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Download recently generated CSV exports
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="min-h-[44px] px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors"
          >
            <option>All</option>
            <option>Processing</option>
            <option>Completed</option>
            <option>Failure</option>
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>ID</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Source</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Created On</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Status</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>From</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>To</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk_${i}`} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-3 md:px-4 py-2.5 md:py-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-600 text-sm">No exports found</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 font-medium">{r.id}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-700">{r.source || '-'}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">{r.created_on || '-'}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      <div className="inline-flex items-center gap-2">
                        {statusIcon(r.file_gen_status)}
                        <span className="font-medium">{r.file_gen_status}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">{r.from_date || '-'}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600">{r.to_date || '-'}</td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right">
                      {String(r.file_gen_status).toLowerCase().startsWith('complete') && r.s3_bucket_url && (
                        <button
                          onClick={() => window.open(r.s3_bucket_url, '_blank')}
                          className="inline-flex items-center gap-2 min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs md:text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                          title="Download CSV"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden xs:inline">Download</span>
                        </button>
                      )}
                      {String(r.file_gen_status).toLowerCase().startsWith('process') && (
                        <span className="text-xs text-amber-600 font-medium">Preparing…</span>
                      )}
                      {String(r.file_gen_status).toLowerCase().startsWith('fail') && (
                        <span className="text-xs text-rose-600 font-medium">Failed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
