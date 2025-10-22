/**
 * Bulk Refund Processing Page
 * Upload and process refunds in bulk via CSV
 */
'use client';

import React from 'react';
import { BulkRefundUploader } from '@/components/refunds/BulkRefundUploader';
import { useRefundStore } from '@/stores/refundStore';
import { refundService } from '@/services/api/RefundApiService';
import { toast } from 'sonner';

export default function BulkRefundPage() {
  if (typeof window === 'undefined') return null;
  const { bulkCreateRefunds } = useRefundStore();

  const handleUpload = async (refunds: any[]) => {
    try {
      await bulkCreateRefunds(refunds);
      return await refundService.bulkCreateRefunds({ refunds });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process bulk refunds');
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await refundService.downloadBulkTemplate();
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download template');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Light theme */}
      <div className="pb-4 border-b border-gray-700/50">
        <h4 className="text-3xl font-bold text-white flex items-center gap-2">
          Bulk Refund Processing
        </h4>
        <p className="text-gray-400 text-sm mt-1">Upload a CSV file to process multiple refunds at once</p>
      </div>

      {/* Instructions */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Download the CSV template using the button in the upload section</li>
          <li>Fill in the required fields: Transaction ID, Amount, and Reason</li>
          <li>Save the file and upload it using the drag-and-drop area</li>
          <li>Review the parsed data and fix any validation errors</li>
          <li>Click the &quot;Process Refunds&quot; button to submit</li>
        </ol>
        <div className="mt-4 rounded-md bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            <strong>Note:</strong> All refunds will be created in pending status and require approval
            before processing. Invalid entries will be skipped with error details.
          </p>
        </div>
      </div>

      {/* Uploader */}
      <BulkRefundUploader
        onUpload={handleUpload}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
