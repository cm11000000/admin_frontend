/**
 * RefundStatusBadge Component
 * Displays refund status with appropriate styling
 */
'use client';

import { Badge } from '@/components/ui/badge';
import { RefundStatus } from '@/services/api/RefundApiService';
import { cn } from '@/lib/utils';

interface RefundStatusBadgeProps {
  status: RefundStatus;
  className?: string;
}

const statusConfig: Record<RefundStatus, { label: string; variant: string; className: string }> = {
  pending: {
    label: 'Pending',
    variant: 'default',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400',
  },
  processing: {
    label: 'Processing',
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400',
  },
};

export function RefundStatusBadge({ status, className }: RefundStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant as any}
      className={cn(config.className, 'font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}
