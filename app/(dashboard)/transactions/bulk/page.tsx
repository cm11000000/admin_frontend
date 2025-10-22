/**
 * Bulk Transaction Operations Page
 * Handle bulk refunds, updates, tags, and deletions
 */

'use client';
// Client-only page; safe for static export

import { useState, useEffect } from 'react';
import { Upload, Download, RefreshCw, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkUploader from '@/components/bulk/BulkUploader';
import DataPreview from '@/components/bulk/DataPreview';
import ColumnMapper from '@/components/bulk/ColumnMapper';
import ValidationErrors from '@/components/bulk/ValidationErrors';
import ProgressTracker from '@/components/bulk/ProgressTracker';
import JobStatusCard from '@/components/bulk/JobStatusCard';
import { useBulkOperationsStore } from '@/stores/bulkOperationsStore';
import { parseCSVFile, parseExcelFile, validateData } from '@/utils/fileProcessing';
import BulkOperationsApiService from '@/services/api/BulkOperationsApiService';
import toast from 'react-hot-toast';
import type { BulkJobType } from '@/types/bulk';

export default function BulkTransactionsPage() {
  if (typeof window === 'undefined') return null;
  const [step, setStep] = useState<'upload' | 'preview' | 'map' | 'validate' | 'process'>('upload');
  const [actionType, setActionType] = useState<BulkJobType>('refund');
  const [file, setFile] = useState<File | null>(null);

  const store = useBulkOperationsStore() as any;
  const uploadedData = store?.uploadedData || null;
  const columnMappings = store?.columnMappings || [];
  const validationResult = store?.validationResult || null;
  const activeJobs = store?.activeJobs || [];
  const currentJob = store?.currentJob || null;
  const setUploadedData = (store?.setUploadedData as any) || (() => {});
  const setColumnMappings = (store?.setColumnMappings as any) || (() => {});
  const setValidationResult = (store?.setValidationResult as any) || (() => {});
  const setActiveJobs = (store?.setActiveJobs as any) || (() => {});
  const addActiveJob = (store?.addActiveJob as any) || (() => {});
  const updateJobProgress = (store?.updateJobProgress as any) || (() => {});
  const setCurrentJob = (store?.setCurrentJob as any) || (() => {});

  const bulkActions = [
    { type: 'refund' as BulkJobType, label: 'Bulk Refund', icon: RefreshCw, description: 'Process refunds for multiple transactions' },
    { type: 'update' as BulkJobType, label: 'Bulk Update', icon: Upload, description: 'Update transaction details in bulk' },
    { type: 'tag' as BulkJobType, label: 'Bulk Tag', icon: Tags, description: 'Assign tags to multiple transactions' },
    { type: 'delete' as BulkJobType, label: 'Bulk Delete', icon: Trash2, description: 'Soft delete multiple transactions' },
  ];

  const systemFields = {
    refund: [
      { field: 'transaction_id', label: 'Transaction ID', required: true, type: 'string' },
      { field: 'refund_amount', label: 'Refund Amount', required: true, type: 'number' },
      { field: 'reason', label: 'Reason', required: true, type: 'string' },
    ],
    update: [
      { field: 'transaction_id', label: 'Transaction ID', required: true, type: 'string' },
      { field: 'status', label: 'Status', required: true, type: 'string' },
      { field: 'notes', label: 'Notes', required: false, type: 'string' },
    ],
    tag: [
      { field: 'transaction_id', label: 'Transaction ID', required: true, type: 'string' },
      { field: 'tags', label: 'Tags', required: true, type: 'string' },
    ],
    delete: [
      { field: 'transaction_id', label: 'Transaction ID', required: true, type: 'string' },
      { field: 'reason', label: 'Reason', required: true, type: 'string' },
    ],
  };

  useEffect(() => {
    loadActiveJobs();
  }, []);

  const loadActiveJobs = async () => {
    try {
      const jobs = await BulkOperationsApiService.getActiveJobs();
      setActiveJobs(jobs);
    } catch (error) {
      toast.error('Failed to load active jobs');
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const preview = selectedFile.name.endsWith('.csv')
        ? await parseCSVFile(selectedFile, { preview: 10 })
        : await parseExcelFile(selectedFile);

      setUploadedData(preview);
      setStep('preview');
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to parse file');
    }
  };

  const handleColumnMapping = (mappings: any[]) => {
    setColumnMappings(mappings);
  };

  const handleValidate = () => {
    if (!uploadedData) return;

    try {
      const result = validateData(
        uploadedData.rows.map((row) => {
          const obj: any = {};
          uploadedData.headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        }),
        columnMappings
      );
      setValidationResult(result);
      setStep('validate');

      if (result.isValid) {
        toast.success('Validation passed');
      } else {
        toast.error(`Validation failed: ${result.errors.length} errors found`);
      }
    } catch (error) {
      toast.error('Validation failed');
    }
  };

  const handleProcess = async () => {
    if (!file || !validationResult?.isValid) return;

    try {
      setStep('process');

      const response = await BulkOperationsApiService.processBulkAction({
        uploadId: 'temp-id',
        validationId: 'temp-validation-id',
        actionType,
        columnMappings,
      });

      const newJob = {
        id: response.jobId,
        type: actionType,
        fileName: file.name,
        totalRows: uploadedData?.totalRows || 0,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        status: 'processing' as const,
        progress: 0,
        startedAt: new Date().toISOString(),
      };

      addActiveJob(newJob);
      setCurrentJob(newJob);
      toast.success('Processing started');

      const pollInterval = setInterval(async () => {
        try {
          const progress = await BulkOperationsApiService.getJobProgress(response.jobId);
          updateJobProgress(response.jobId, progress);

          if (progress.status === 'completed' || progress.status === 'failed') {
            clearInterval(pollInterval);
            toast.success(
              progress.status === 'completed'
                ? 'Processing completed successfully'
                : 'Processing failed'
            );
          }
        } catch (error) {
          clearInterval(pollInterval);
        }
      }, 2000);

    } catch (error) {
      toast.error('Failed to start processing');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const templates = await BulkOperationsApiService.getTemplates(actionType);
      if (templates.length > 0) {
        const blob = await BulkOperationsApiService.downloadTemplate(templates[0].id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${actionType}_template.csv`;
        a.click();
      }
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Transaction Operations</h1>
          <p className="text-gray-600 mt-1">Process multiple transactions at once</p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <Tabs value={actionType} onValueChange={(v) => setActionType(v as BulkJobType)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {bulkActions.map((action) => (
            <TabsTrigger key={action.type} value={action.type} className="flex items-center gap-2">
              <action.icon className="h-4 w-4" />
              {action.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {bulkActions.map((action) => (
          <TabsContent key={action.type} value={action.type} className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">{action.description}</p>
            </div>

            {step === 'upload' && (
              <BulkUploader onFileSelect={handleFileSelect} />
            )}

            {step === 'preview' && uploadedData && (
              <div className="space-y-4">
                <DataPreview preview={uploadedData} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back
                  </Button>
                  <Button onClick={() => setStep('map')}>
                    Continue to Mapping
                  </Button>
                </div>
              </div>
            )}

            {step === 'map' && uploadedData && (
              <div className="space-y-4">
                <ColumnMapper
                  csvColumns={uploadedData.headers}
                  systemFields={(actionType === 'refund' || actionType === 'update' || actionType === 'tag' || actionType === 'delete') ? systemFields[actionType] : []}
                  onMappingChange={handleColumnMapping}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep('preview')}>
                    Back
                  </Button>
                  <Button onClick={handleValidate}>
                    Validate Data
                  </Button>
                </div>
              </div>
            )}

            {step === 'validate' && validationResult && (
              <div className="space-y-4">
                <ValidationErrors validationResult={validationResult} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep('map')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleProcess}
                    disabled={!validationResult.isValid}
                  >
                    Process {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                  </Button>
                </div>
              </div>
            )}

            {step === 'process' && currentJob && (
              <ProgressTracker
                job={currentJob}
                onPause={async () => {
                  await BulkOperationsApiService.pauseJob(currentJob.id);
                  toast.success('Job paused');
                }}
                onResume={async () => {
                  await BulkOperationsApiService.resumeJob(currentJob.id);
                  toast.success('Job resumed');
                }}
                onCancel={async () => {
                  await BulkOperationsApiService.cancelJob(currentJob.id);
                  toast.success('Job cancelled');
                }}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>

      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeJobs.map((job) => (
              <JobStatusCard
                key={job.id}
                job={job}
                onView={() => setCurrentJob(job)}
                onDownload={async () => {
                  const blob = await BulkOperationsApiService.downloadResults(job.id);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${job.fileName}_results.csv`;
                  a.click();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
