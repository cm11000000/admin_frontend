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
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            Advanced Export
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Export data with custom configurations
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">New </span>Export
        </Button>
      </div>

      {showWizard ? (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
          <ExportWizard
            onComplete={handleExportComplete}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 md:p-5 hover:shadow-2xl transition-shadow">
            <Clock className="h-8 w-8 md:h-10 md:w-10 text-blue-600 mb-3" />
            <h3 className="text-base md:text-lg font-semibold text-blue-900">Quick Export</h3>
            <p className="text-xs md:text-sm text-blue-700 mt-2">Start a new export wizard</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 md:p-5 hover:shadow-2xl transition-shadow">
            <FileText className="h-8 w-8 md:h-10 md:w-10 text-green-600 mb-3" />
            <h3 className="text-base md:text-lg font-semibold text-green-900">Export Templates</h3>
            <p className="text-xs md:text-sm text-green-700 mt-2">Use predefined templates</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 md:p-5 hover:shadow-2xl transition-shadow">
            <Download className="h-8 w-8 md:h-10 md:w-10 text-purple-600 mb-3" />
            <h3 className="text-base md:text-lg font-semibold text-purple-900">Recent Exports</h3>
            <p className="text-xs md:text-sm text-purple-700 mt-2">{exportHistory.length} exports</p>
          </div>
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Export History</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
