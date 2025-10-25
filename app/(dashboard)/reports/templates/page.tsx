'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { RefreshCw, Plus, Play, Calendar, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ReportType = 'transactions' | 'refunds' | 'chargebacks' | 'settlements';
type Visibility = 'private' | 'shared' | 'public';

const DATE_MACROS = [
  { key: '${YESTERDAY}', label: 'Yesterday' },
  { key: '${TODAY}', label: 'Today' },
  { key: '${LAST_7_DAYS}', label: 'Last 7 days' },
  { key: '${THIS_MONTH}', label: 'This month' },
  { key: '${PREV_MONTH}', label: 'Previous month' },
];

export default function TemplatesPage() {
  const [userName, setUserName] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    report_type: 'transactions' as ReportType,
    visibility: 'private' as Visibility,
    clientCode: 'ALL',
    fromDate: '${YESTERDAY}',
    endDate: '${YESTERDAY}',
    paymentStatus: 'ALL',
    paymentMode: 'ALL',
  });
  const router = useRouter();

  const load = async () => {
    if (!userName) return;
    setLoading(true);
    try {
      const resp = await ReportApiService.listTemplates({ created_by: userName });
      setTemplates(resp.results || []);
    } catch (e) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = resolveUserName();
    if (u) setUserName(u);
  }, []);
  useEffect(() => { if (userName) load(); }, [userName]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setCreating(true);
    try {
      const filters: any = { clientCode: form.clientCode, fromDate: form.fromDate, endDate: form.endDate };
      if (form.report_type === 'transactions') {
        filters.paymentStatus = form.paymentStatus;
        filters.paymentMode = form.paymentMode;
        filters.terminalStatus = 'TS';
      }
      const resp = await ReportApiService.createTemplate({
        name: form.name.trim(),
        description: form.description || '',
        report_type: form.report_type,
        filters_json: filters,
        visibility: form.visibility,
        created_by: userName,
      });
      toast.success('Template created');
      setForm({ ...form, name: '' });
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const handleRun = async (id: number, report_type: ReportType) => {
    try {
      const resp = await ReportApiService.runTemplate(id, userName);
      toast.success(resp.detail || 'Request received successfully');
      router.push('/exports');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to run template');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center justify-between pb-3 md:pb-4 border-b border-gray-200/60">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-gray-700" />
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Report Templates</h1>
            <p className="text-xs md:text-sm text-gray-600">Save reusable export templates and run them on demand</p>
          </div>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Create template */}
      <div className="bg-white/90 border border-gray-200 rounded-xl p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Yesterday Txns (ALL)" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Report</label>
            <select value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value as ReportType })} className="w-full border rounded-lg px-3 py-2">
              <option value="transactions">Transactions</option>
              <option value="refunds">Refunds</option>
              <option value="chargebacks">Chargebacks</option>
              <option value="settlements">Settlements</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Visibility</label>
            <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as Visibility })} className="w-full border rounded-lg px-3 py-2">
              <option value="private">Private</option>
              <option value="shared">Shared</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Client Code</label>
            <input value={form.clientCode} onChange={(e) => setForm({ ...form, clientCode: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">From Date</label>
            <select value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} className="w-full border rounded-lg px-3 py-2">
              {DATE_MACROS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">To Date</label>
            <select value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border rounded-lg px-3 py-2">
              {DATE_MACROS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          {form.report_type === 'transactions' && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2">Payment Status</label>
                <input value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Payment Mode</label>
                <input value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </>
          )}
        </div>
        <div className="pt-4">
          <button onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700">
            <Plus className={`w-4 h-4 ${creating ? 'animate-spin' : ''}`} /> Create Template
          </button>
        </div>
      </div>

      {/* Templates list */}
      <div className="bg-white/90 border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr className="border-b border-gray-200">
                <th className="px-3 md:px-4 py-2.5 md:py-3 text-left text-[11px] font-extrabold text-gray-700 uppercase">Name</th>
                <th className="px-3 md:px-4 py-2.5 md:py-3 text-left text-[11px] font-extrabold text-gray-700 uppercase">Report</th>
                <th className="px-3 md:px-4 py-2.5 md:py-3 text-left text-[11px] font-extrabold text-gray-700 uppercase">Visibility</th>
                <th className="px-3 md:px-4 py-2.5 md:py-3 text-left text-[11px] font-extrabold text-gray-700 uppercase">Owner</th>
                <th className="px-3 md:px-4 py-2.5 md:py-3 text-right text-[11px] font-extrabold text-gray-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk_${i}`} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-3 md:px-4 py-2.5 md:py-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-600 text-sm">No templates found</td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-900">{t.name}</td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-700">{t.report_type}</td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-700">{t.visibility}</td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-sm text-gray-600">{t.created_by}</td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-sm text-right">
                      <button onClick={() => handleRun(t.id, t.report_type)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50">
                        <Play className="w-4 h-4" /> Run
                      </button>
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

