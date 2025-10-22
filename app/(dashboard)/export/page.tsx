/**
 * Advanced Export Page
 * Configure and execute data exports with wizard interface
 */

'use client';
// Client-only page; safe for static export

import { useState, useEffect } from 'react';
import { Download, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExportWizard from '@/components/bulk/ExportWizard';
import JobStatusCard from '@/components/bulk/JobStatusCard';
import { useBulkOperationsStore } from '@/stores/bulkOperationsStore';
import BulkOperationsApiService from '@/services/api/BulkOperationsApiService';
import toast from 'react-hot-toast';
import type { IExportConfig } from '@/types/bulk';

export default function ExportPage() {
  if (typeof window === 'undefined') return null;
  const [showWizard, setShowWizard] = useState(false);
  const store = useBulkOperationsStore() as any;
  const exportHistory = Array.isArray(store?.exports) ? store.exports : [];
  const setExportHistory = (store?.setExports as any) || (() => {});

  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    try {
      const { exports } = await BulkOperationsApiService.getExportHistory(30);
      setExportHistory(exports);
    } catch (error) {
      toast.error('Failed to load export history');
    }
  };

  const handleExportComplete = async (config: Partial<IExportConfig>) => {
    try {
      await BulkOperationsApiService.createExport({
        config,
        executeNow: true,
      });

      toast.success('Export started successfully');
      setShowWizard(false);
      loadExportHistory();
    } catch (error) {
      toast.error('Failed to start export');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Export</h1>
          <p className="text-slate-400 mt-1">Export data with custom configurations</p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Download className="h-4 w-4 mr-2" />
          New Export
        </Button>
      </div>

      {showWizard ? (
        <div className="bg-white border border-slate-700/50 rounded-lg p-6">
          <ExportWizard
            onComplete={handleExportComplete}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-blue-900">Quick Export</h3>
            <p className="text-sm text-blue-700 mt-2">Start a new export wizard</p>
          </div>

          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <FileText className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-green-900">Export Templates</h3>
            <p className="text-sm text-green-700 mt-2">Use predefined templates</p>
          </div>

          <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg">
            <Download className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-purple-900">Recent Exports</h3>
            <p className="text-sm text-purple-700 mt-2">{exportHistory.length} exports</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Export History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportHistory.map((export_) => (
            <JobStatusCard
              key={export_.id}
              job={{
                id: export_.id,
                type: 'export',
                fileName: export_.configName,
                totalRows: export_.rowCount,
                processedRows: export_.rowCount,
                successCount: export_.rowCount,
                errorCount: 0,
                status: export_.status,
                progress: 100,
                startedAt: export_.createdAt,
                completedAt: export_.createdAt,
                resultsUrl: export_.downloadUrl,
              }}
              onDownload={async () => {
                window.open(export_.downloadUrl, '_blank');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
