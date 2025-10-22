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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Import</h1>
          <p className="text-slate-400 mt-1">Import data from CSV or Excel files</p>
        </div>
        {!showWizard && (
          <Button onClick={() => setShowWizard(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Start Import
          </Button>
        )}
      </div>

      {showWizard ? (
        <div className="bg-white border border-slate-700/50 rounded-lg p-6">
          <ImportWizard
            onComplete={handleImportComplete}
            onCancel={() => setShowWizard(false)}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {importTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => setShowWizard(true)}
                className="p-6 bg-white border-2 border-slate-700/50 rounded-lg hover:border-primary hover:shadow-md transition-all text-left"
              >
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-slate-400">{type.description}</p>
              </button>
            ))}
          </div>

          <div className="p-8 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-4">
              <FileSpreadsheet className="h-12 w-12 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Import Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
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
        <div className="p-6 bg-white border border-slate-700/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Import Results</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Total Rows</p>
              <p className="text-2xl font-bold text-blue-900">
                {importResult.totalRows}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Success</p>
              <p className="text-2xl font-bold text-green-900">
                {importResult.successCount}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Errors</p>
              <p className="text-2xl font-bold text-red-900">
                {importResult.errorCount}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Skipped</p>
              <p className="text-2xl font-bold text-yellow-900">
                {importResult.skippedCount}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {importResult.successFileUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(importResult.successFileUrl, '_blank')}
              >
                Download Success Report
              </Button>
            )}
            {importResult.errorFileUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(importResult.errorFileUrl, '_blank')}
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
