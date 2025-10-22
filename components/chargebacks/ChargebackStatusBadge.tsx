/**
 * Chargeback Status Badge Component
 * Color-coded status indicators for chargebacks
 */
'use client';

import { Badge } from '@/components/ui/badge';
import { ChargebackStatus, ChargebackPriority } from '@/types/chargeback';

interface ChargebackStatusBadgeProps {
  status: ChargebackStatus;
  className?: string;
}

interface ChargebackPriorityBadgeProps {
  priority: ChargebackPriority;
  className?: string;
}

const statusConfig: Record<ChargebackStatus, { label: string; variant: any; className: string }> = {
  new: {
    label: 'New',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  under_review: {
    label: 'Under Review',
    variant: 'secondary',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  },
  evidence_submitted: {
    label: 'Evidence Submitted',
    variant: 'outline',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  won: {
    label: 'Won',
    variant: 'default',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  lost: {
    label: 'Lost',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  closed: {
    label: 'Closed',
    variant: 'outline',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  },
};

const priorityConfig: Record<ChargebackPriority, { label: string; variant: any; className: string }> = {
  critical: {
    label: 'Critical',
    variant: 'destructive',
    className: 'bg-red-600 text-white font-semibold',
  },
  high: {
    label: 'High',
    variant: 'default',
    className: 'bg-orange-500 text-white font-medium',
  },
  medium: {
    label: 'Medium',
    variant: 'secondary',
    className: 'bg-yellow-500 text-white',
  },
  low: {
    label: 'Low',
    variant: 'outline',
    className: 'bg-gray-300 text-gray-800',
  },
};

export function ChargebackStatusBadge({ status, className = '' }: ChargebackStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}

export function ChargebackPriorityBadge({ priority, className = '' }: ChargebackPriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.low;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}

export function OverdueBadge({ className = '' }: { className?: string }) {
  return (
    <Badge variant="destructive" className={`bg-red-600 text-white font-semibold animate-pulse ${className}`}>
      Overdue
    </Badge>
  );
}
