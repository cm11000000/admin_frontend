/**
 * Bulk Import Page
 * Import various types of data with validation
 */

'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportWizard from '@/components/bulk/ImportWizard';
import BulkOperationsApiService from '@/services/api/BulkOperationsApiService';
import toast from 'react-hot-toast';
import type { ImportType } from '@/types/bulk';

export default function ImportPage() {
  if (typeof window === 'undefined') return null;
  const [showWizard, setShowWizard] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleImportComplete = async (data: {
    importType: ImportType;
    file: File;
    columnMappings: any[];
  }) => {
    try {
      const response = await BulkOperationsApiService.processImport({
        uploadId: 'temp-upload-id',
        validationId: 'temp-validation-id',
        importType: data.importType,
        columnMappings: data.columnMappings,
        options: {
          partialSuccess: true,
          skipDuplicates: true,
          rollbackOnError: false,
        },
      });

      setImportResult(response.result);
      toast.success('Import completed');
      setShowWizard(false);
    } catch (error) {
      toast.error('Import failed');
    }
  };

  const importTypes = [
    {
      type: 'merchant_onboarding',
      title: 'Merchant Onboarding',
      description: 'Bulk create merchant accounts with complete details',
      icon: '🏢',
    },
    {
      type: 'rate_configuration',
      title: 'Rate Configuration',
      description: 'Update merchant rates and pricing',
      icon: '💰',
    },
    {
      type: 'user_creation',
      title: 'User Creation',
      description: 'Create user accounts in bulk',
      icon: '👥',
    },
    {
      type: 'payment_link',
      title: 'Payment Links',
      description: 'Generate multiple payment links',
      icon: '🔗',
    },
    {
      type: 'settlement_adjustment',
      title: 'Settlement Adjustment',
      description: 'Adjust settlement amounts',
      icon: '📊',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            Bulk Import
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Import data from CSV or Excel files
          </p>
        </div>
        {!showWizard && (
          <Button onClick={() => setShowWizard(true)} className="min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Start </span>Import
          </Button>
        )}
      </div>

      {showWizard ? (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
          <ImportWizard
            onComplete={handleImportComplete}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {importTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => setShowWizard(true)}
                className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 md:p-5 hover:shadow-2xl transition-all text-left min-h-[44px] touch-manipulation"
              >
                <div className="text-3xl md:text-4xl mb-3">{type.icon}</div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  {type.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <FileSpreadsheet className="h-10 w-10 md:h-12 md:w-12 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-2">
                  Import Guidelines
                </h3>
                <ul className="space-y-2 text-xs md:text-sm text-blue-800">
                  <li>• Download the template for your import type</li>
                  <li>• Fill in all required fields marked with asterisk (*)</li>
                  <li>• Ensure data formats match the template</li>
                  <li>• Maximum file size: 100MB</li>
                  <li>• Supported formats: CSV, XLSX, XLS</li>
                  <li>• Validation will check for errors before import</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {importResult && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Import Results</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs md:text-sm text-blue-600">Total Rows</p>
              <p className="text-xl md:text-2xl font-bold text-blue-900">
                {importResult.totalRows}
              </p>
            </div>
            <div className="p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs md:text-sm text-green-600">Success</p>
              <p className="text-xl md:text-2xl font-bold text-green-900">
                {importResult.successCount}
              </p>
            </div>
            <div className="p-3 md:p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs md:text-sm text-red-600">Errors</p>
              <p className="text-xl md:text-2xl font-bold text-red-900">
                {importResult.errorCount}
              </p>
            </div>
            <div className="p-3 md:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs md:text-sm text-yellow-600">Skipped</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-900">
                {importResult.skippedCount}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4">
            {importResult.successFileUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(importResult.successFileUrl, '_blank')}
                className="min-h-[44px] px-4 md:px-6 py-2.5 text-xs md:text-sm font-medium"
              >
                Download Success Report
              </Button>
            )}
            {importResult.errorFileUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(importResult.errorFileUrl, '_blank')}
                className="min-h-[44px] px-4 md:px-6 py-2.5 text-xs md:text-sm font-medium"
              >
                Download Error Report
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
