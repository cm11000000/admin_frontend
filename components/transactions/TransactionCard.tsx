'use client';

/**
 * Mobile-Optimized Transaction Card Component
 * Beautiful card layout with swipe actions and animations
 */
import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { formatCurrency, cn } from '@/lib/utils';
import { Transaction } from '@/services/api/TransactionApiService';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  DownloadCloud,
  RotateCcw,
  MoreVertical,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionCardProps {
  transaction: Transaction;
  onViewDetails?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
  onDownloadReceipt?: (transaction: Transaction) => void;
  className?: string;
  showActions?: boolean;
}

const statusConfig = {
  success: {
    label: 'Success',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    variant: 'default' as const,
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    variant: 'destructive' as const,
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    variant: 'secondary' as const,
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    variant: 'outline' as const,
  },
  cancelled: {
    label: 'Cancelled',
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    variant: 'outline' as const,
  },
  disputed: {
    label: 'Disputed',
    icon: AlertCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    variant: 'outline' as const,
  },
};

const paymentMethodIcons = {
  UPI: Smartphone,
  CC: CreditCard,
  DC: CreditCard,
  NB: Building2,
  WALLET: Wallet,
  default: CreditCard,
};

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onViewDetails,
  onRefund,
  onDownloadReceipt,
  className,
  showActions = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const PaymentIcon = paymentMethodIcons[transaction.paymentMethod as keyof typeof paymentMethodIcons] || paymentMethodIcons.default;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      // Swiped left - show actions
      setSwipeOffset(-100);
    } else if (info.offset.x > 100) {
      // Swiped right - hide actions
      setSwipeOffset(0);
    } else {
      setSwipeOffset(0);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Swipe Actions Background */}
      {showActions && (
        <div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-4 bg-gradient-to-l from-blue-500 to-blue-600">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => onDownloadReceipt?.(transaction)}
          >
            <DownloadCloud className="h-5 w-5" />
          </Button>
          {transaction.status === 'success' && (
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => onRefund?.(transaction)}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {/* Main Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swipeOffset }}
        className={cn(
          'bg-white rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer',
          status.borderColor
        )}
        onClick={() => onViewDetails?.(transaction)}
      >
        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Payment Method Icon */}
              <div className={cn('p-2 rounded-lg', status.bgColor)}>
                <PaymentIcon className={cn('h-5 w-5', status.color)} />
              </div>

              {/* Transaction Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {transaction.clientName}
                  </p>
                  <Badge variant={status.variant as any} className="shrink-0">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {transaction.merchantTransactionId}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0 ml-3">
              <p className="font-bold text-lg text-gray-900">
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-gray-500">{transaction.currency}</p>
            </div>
          </div>

          {/* Details Row */}
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-4 text-gray-600">
              <div>
                <span className="text-gray-400">Method:</span>{' '}
                <span className="font-medium">{transaction.paymentMethod}</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-400">ID:</span>{' '}
                <span className="font-mono text-xs">{transaction.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="truncate">{transaction.customerEmail}</span>
            <span className="shrink-0 ml-2">{formatDate(transaction.createdAt)}</span>
          </div>

          {/* Expandable Section */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t pt-3 mt-3 space-y-2 text-sm"
            >
              <div className="flex justify-between">
                <span className="text-gray-500">Gateway Fee:</span>
                <span className="font-medium">{formatCurrency(transaction.fees.gateway)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Platform Fee:</span>
                <span className="font-medium">{formatCurrency(transaction.fees.platform)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GST:</span>
                <span className="font-medium">{formatCurrency(transaction.fees.gst)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Fees:</span>
                <span>{formatCurrency(transaction.fees.total)}</span>
              </div>
              {transaction.gatewayTransactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Gateway Txn ID:</span>
                  <span className="font-mono text-xs">{transaction.gatewayTransactionId}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-xs"
            >
              {expanded ? 'Show Less' : 'Show More'}
              <ChevronRight className={cn('h-3 w-3 ml-1 transition-transform', expanded && 'rotate-90')} />
            </Button>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails?.(transaction)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadReceipt?.(transaction)}>
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Download Receipt
                  </DropdownMenuItem>
                  {transaction.status === 'success' && (
                    <DropdownMenuItem onClick={() => onRefund?.(transaction)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Refund
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
