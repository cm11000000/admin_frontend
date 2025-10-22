/**
 * JobStatusCard Component
 * Compact card showing job status and actions
 */

'use client';

import { Download, Eye, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IBulkJob } from '@/types/bulk';
import { cn } from '@/lib/utils';

interface JobStatusCardProps {
  job: IBulkJob;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function JobStatusCard({
  job,
  onView,
  onDownload,
  onDelete,
  className,
}: JobStatusCardProps) {
  const getStatusBadge = () => {
    const statusConfig = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
      paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused' },
      queued: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Queued' },
      validating: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Validating' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
    };

    const config = statusConfig[job.status];

    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          config.bg,
          config.text
        )}
      >
        {config.label}
      </span>
    );
  };

  const getTypeLabel = () => {
    const typeLabels = {
      refund: 'Bulk Refund',
      update: 'Bulk Update',
      export: 'Export',
      import: 'Import',
      delete: 'Bulk Delete',
      tag: 'Bulk Tag',
    };

    return typeLabels[job.type] || job.type;
  };

  return (
    <div className={cn('p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{getTypeLabel()}</h4>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-500 truncate">{job.fileName}</p>
        </div>
      </div>

      {/* Progress */}
      {(job.status === 'processing' || job.status === 'validating' || job.status === 'paused') && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-semibold text-gray-900">{job.totalRows.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Success</p>
          <p className="text-sm font-semibold text-green-600">{job.successCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Errors</p>
          <p className="text-sm font-semibold text-red-600">{job.errorCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mb-3">
        {job.completedAt
          ? `Completed ${new Date(job.completedAt).toLocaleDateString()}`
          : `Started ${new Date(job.startedAt).toLocaleDateString()}`}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onView && (
          <Button variant="outline" size="sm" onClick={onView} className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
        {job.status === 'completed' && job.resultsUrl && onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload} className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
