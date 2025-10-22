/**
 * ImportWizard Component
 * Multi-step wizard for data import
 */

'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import BulkUploader from './BulkUploader';
import DataPreview from './DataPreview';
import ColumnMapper from './ColumnMapper';
import ValidationErrors from './ValidationErrors';
import type { IDataPreview, IColumnMapping, IValidationResult, ImportType } from '@/types/bulk';
import { cn } from '@/lib/utils';

interface ImportWizardProps {
  onComplete: (data: {
    importType: ImportType;
    file: File;
    columnMappings: IColumnMapping[];
  }) => void;
  onCancel: () => void;
  className?: string;
}

const STEPS = ['Select Type', 'Upload File', 'Map Columns', 'Validate', 'Review & Import'];

export default function ImportWizard({
  onComplete,
  onCancel,
  className,
}: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [importType, setImportType] = useState<ImportType | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<IDataPreview | null>(null);
  const [columnMappings, setColumnMappings] = useState<IColumnMapping[]>([]);
  const [validationResult, setValidationResult] = useState<IValidationResult | null>(null);

  const importTypes = [
    { value: 'merchant_onboarding' as ImportType, label: 'Merchant Onboarding', description: 'Bulk create merchant accounts' },
    { value: 'rate_configuration' as ImportType, label: 'Rate Configuration', description: 'Update merchant rates' },
    { value: 'user_creation' as ImportType, label: 'User Creation', description: 'Create user accounts' },
    { value: 'payment_link' as ImportType, label: 'Payment Links', description: 'Create payment links' },
    { value: 'settlement_adjustment' as ImportType, label: 'Settlement Adjustment', description: 'Adjust settlements' },
  ];

  const systemFields = {
    merchant_onboarding: [
      { field: 'name', label: 'Business Name', required: true, type: 'string' },
      { field: 'email', label: 'Email', required: true, type: 'email' },
      { field: 'phone', label: 'Phone', required: true, type: 'phone' },
      { field: 'category', label: 'Category', required: true, type: 'string' },
    ],
    rate_configuration: [
      { field: 'merchant_id', label: 'Merchant ID', required: true, type: 'string' },
      { field: 'rate', label: 'Rate (%)', required: true, type: 'number' },
      { field: 'effective_from', label: 'Effective From', required: true, type: 'date' },
    ],
    user_creation: [
      { field: 'name', label: 'Full Name', required: true, type: 'string' },
      { field: 'email', label: 'Email', required: true, type: 'email' },
      { field: 'role', label: 'Role', required: true, type: 'string' },
    ],
    payment_link: [
      { field: 'amount', label: 'Amount', required: true, type: 'number' },
      { field: 'customer_email', label: 'Customer Email', required: true, type: 'email' },
      { field: 'description', label: 'Description', required: false, type: 'string' },
    ],
    settlement_adjustment: [
      { field: 'settlement_id', label: 'Settlement ID', required: true, type: 'string' },
      { field: 'adjustment_amount', label: 'Adjustment Amount', required: true, type: 'number' },
      { field: 'reason', label: 'Reason', required: true, type: 'string' },
    ],
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (file && importType) {
      onComplete({ importType: importType as ImportType, file, columnMappings });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!importType;
      case 1:
        return !!file && !!preview;
      case 2:
        return columnMappings.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <Label>Select the type of data you want to import</Label>
            <div className="grid grid-cols-1 gap-3">
              {importTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setImportType(type.value)}
                  className={cn(
                    'p-4 border-2 rounded-lg text-left transition-all hover:border-primary',
                    importType === type.value
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
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Upload your data file</Label>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            <BulkUploader
              onFileSelect={(selectedFile) => {
                setFile(selectedFile);
              }}
            />
            {preview && <DataPreview preview={preview} />}
          </div>
        );

      case 2:
        if (!importType || !preview) return null;
        return (
          <div>
            <Label className="mb-4 block">Map CSV columns to system fields</Label>
            <ColumnMapper
              csvColumns={preview.headers}
              systemFields={systemFields[importType as keyof typeof systemFields] || []}
              onMappingChange={setColumnMappings}
            />
          </div>
        );

      case 3:
        return (
          <div>
            <Label className="mb-4 block">Validation Results</Label>
            {validationResult ? (
              <ValidationErrors validationResult={validationResult} />
            ) : (
              <div className="p-8 text-center bg-gray-50 border rounded-lg">
                <p className="text-sm text-gray-600">
                  Validating your data...
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Import Type:</span>
                <span className="text-sm font-semibold capitalize">
                  {importType?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">File:</span>
                <span className="text-sm font-semibold">{file?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Rows:</span>
                <span className="text-sm font-semibold">{preview?.totalRows || 0}</span>
              </div>
              {validationResult && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valid Rows:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {validationResult.validRows}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Invalid Rows:</span>
                    <span className="text-sm font-semibold text-red-600">
                      {validationResult.invalidRows}
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Click &quot;Import&quot; to start the import process.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-3xl mx-auto', className)}>
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

      <div className="mb-8 min-h-[400px]">{renderStepContent()}</div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={currentStep === 0 ? onCancel : handleBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()}>
          {currentStep === STEPS.length - 1 ? 'Import' : 'Next'}
          {currentStep < STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
