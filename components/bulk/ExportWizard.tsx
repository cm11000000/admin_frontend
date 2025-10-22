/**
 * ExportWizard Component
 * Multi-step wizard for configuring data exports
 */

'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { IExportConfig, ExportFormat, DeliveryMethod } from '@/types/bulk';
import { cn } from '@/lib/utils';

interface ExportWizardProps {
  onComplete: (config: Partial<IExportConfig>) => void;
  onCancel: () => void;
  className?: string;
}

const STEPS = [
  'Select Data Type',
  'Choose Columns',
  'Apply Filters',
  'Export Options',
  'Review & Export',
];

export default function ExportWizard({
  onComplete,
  onCancel,
  className,
}: ExportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Partial<IExportConfig>>({
    dataType: '',
    columns: [],
    filters: {},
    format: 'csv',
    compress: false,
    encrypt: false,
    deliveryMethod: 'download',
  });

  const dataTypes = [
    { value: 'transactions', label: 'Transactions', description: 'Export transaction records' },
    { value: 'refunds', label: 'Refunds', description: 'Export refund records' },
    { value: 'settlements', label: 'Settlements', description: 'Export settlement data' },
    { value: 'merchants', label: 'Merchants', description: 'Export merchant list' },
    { value: 'users', label: 'Users', description: 'Export user accounts' },
  ];

  const availableColumns = {
    transactions: [
      'id', 'amount', 'status', 'gateway', 'merchant_id', 'client_txn_id',
      'created_at', 'updated_at', 'payment_method', 'customer_email'
    ],
    refunds: ['id', 'transaction_id', 'amount', 'status', 'reason', 'created_at'],
    settlements: ['id', 'merchant_id', 'amount', 'status', 'settled_at', 'reference'],
    merchants: ['id', 'name', 'email', 'status', 'category', 'created_at'],
    users: ['id', 'name', 'email', 'role', 'status', 'last_login'],
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(config);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateConfig = (updates: Partial<IExportConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!config.dataType;
      case 1:
        return config.columns && config.columns.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <Label>Select the type of data you want to export</Label>
            <div className="grid grid-cols-1 gap-3">
              {dataTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateConfig({ dataType: type.value })}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all hover:border-primary',
                    config.dataType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  )}
                >
                  <p className="font-semibold text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        const columns = config.dataType ? availableColumns[config.dataType as keyof typeof availableColumns] : [];
        return (
          <div className="space-y-3">
            <Label>Select columns to include in export</Label>
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateConfig({ columns })}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateConfig({ columns: [] })}
              >
                Deselect All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {columns.map((col) => (
                <label
                  key={col}
                  className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={config.columns?.includes(col)}
                    onChange={(e) => {
                      const newColumns = e.target.checked
                        ? [...(config.columns || []), col]
                        : config.columns?.filter((c) => c !== col);
                      updateConfig({ columns: newColumns });
                    }}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm font-medium">{col}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Label>Apply filters (optional)</Label>
            <div className="space-y-3">
              <div>
                <Label htmlFor="dateFrom" className="text-sm">Date Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="date"
                    id="dateFrom"
                    className="px-3 py-2 border rounded-md text-sm"
                    onChange={(e) =>
                      updateConfig({
                        filters: {
                          ...config.filters,
                          dateRange: {
                            ...config.filters?.dateRange,
                            from: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <input
                    type="date"
                    className="px-3 py-2 border rounded-md text-sm"
                    onChange={(e) =>
                      updateConfig({
                        filters: {
                          ...config.filters,
                          dateRange: {
                            ...config.filters?.dateRange,
                            to: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">Export Format</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['csv', 'excel', 'json', 'pdf'] as ExportFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => updateConfig({ format })}
                    className={cn(
                      'p-3 border-2 rounded-lg text-sm font-medium transition-all',
                      config.format === format
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.compress}
                  onChange={(e) => updateConfig({ compress: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Compress as ZIP</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.encrypt}
                  onChange={(e) => updateConfig({ encrypt: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Encrypt with password</span>
              </label>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Delivery Method</Label>
              <select
                value={config.deliveryMethod}
                onChange={(e) => updateConfig({ deliveryMethod: e.target.value as DeliveryMethod })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="download">Download</option>
                <option value="email">Email</option>
                <option value="ftp">FTP</option>
                <option value="s3">S3 Bucket</option>
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Data Type:</span>
                <span className="text-sm font-semibold">{config.dataType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Columns:</span>
                <span className="text-sm font-semibold">{config.columns?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Format:</span>
                <span className="text-sm font-semibold">{config.format?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery:</span>
                <span className="text-sm font-semibold capitalize">{config.deliveryMethod}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Click &quot;Export&quot; to start the export process.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
      {/* Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1 text-center">{step}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mb-8 min-h-[400px]">{renderStepContent()}</div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={currentStep === 0 ? onCancel : handleBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()}>
          {currentStep === STEPS.length - 1 ? 'Export' : 'Next'}
          {currentStep < STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
