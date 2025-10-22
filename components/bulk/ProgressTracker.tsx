/**
 * ProgressTracker Component
 * Track progress of bulk operations with real-time updates
 */

'use client';

import { useEffect, useState } from 'react';
import { Pause, Play, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IBulkJob } from '@/types/bulk';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  job: IBulkJob;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function ProgressTracker({
  job,
  onPause,
  onResume,
  onCancel,
  className,
}: ProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (job.status === 'processing' || job.status === 'validating') {
      const interval = setInterval(() => {
        const start = new Date(job.startedAt).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [job.status, job.startedAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('p-6 border rounded-lg', getStatusColor(), className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h3 className="text-lg font-semibold capitalize">{job.status}</h3>
        </div>
        <div className="flex items-center gap-2">
          {job.status === 'processing' && onPause && (
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          {job.status === 'paused' && onResume && (
            <Button variant="outline" size="sm" onClick={onResume}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          {(job.status === 'processing' || job.status === 'paused') && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">{job.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={cn(
              'h-2.5 rounded-full transition-all duration-300',
              job.status === 'completed'
                ? 'bg-green-600'
                : job.status === 'failed'
                ? 'bg-red-600'
                : 'bg-blue-600'
            )}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs opacity-75">Processed</p>
          <p className="text-lg font-bold">
            {job.processedRows.toLocaleString()} / {job.totalRows.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75">Success</p>
          <p className="text-lg font-bold text-green-600">
            {job.successCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75">Errors</p>
          <p className="text-lg font-bold text-red-600">
            {job.errorCount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75">
            {job.estimatedTimeRemaining ? 'Time Remaining' : 'Elapsed Time'}
          </p>
          <p className="text-lg font-bold">
            {job.estimatedTimeRemaining
              ? formatTime(job.estimatedTimeRemaining)
              : formatTime(elapsedTime)}
          </p>
        </div>
      </div>

      {/* File Info */}
      <div className="text-sm opacity-75">
        <p>
          File: <span className="font-medium">{job.fileName}</span>
        </p>
        <p>
          Started: <span className="font-medium">{new Date(job.startedAt).toLocaleString()}</span>
        </p>
        {job.completedAt && (
          <p>
            Completed:{' '}
            <span className="font-medium">{new Date(job.completedAt).toLocaleString()}</span>
          </p>
        )}
      </div>
    </div>
  );
}
