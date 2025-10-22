'use client';

/**
 * Transaction Detail Modal Component
 * Full-screen on mobile, centered on desktop with beautiful animations
 */
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, cn, copyToClipboard } from '@/lib/utils';
import { TransactionDetails } from '@/services/api/TransactionApiService';
import {
  Copy,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';

interface TransactionDetailModalProps {
  transaction: TransactionDetails | null;
  open: boolean;
  onClose: () => void;
  onRefund?: (transaction: TransactionDetails) => void;
  onDownloadReceipt?: (transaction: TransactionDetails) => void;
}

const statusConfig = {
  success: {
    label: 'Success',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: AlertCircle,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertCircle,
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  open,
  onClose,
  onRefund,
  onDownloadReceipt,
}) => {
  if (!transaction) return null;

  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const copyToClipboardHandler = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied to clipboard`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl">Transaction Details</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <span className="font-mono text-sm">{transaction.id}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => copyToClipboardHandler(transaction.id, 'Transaction ID')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </DialogDescription>
              </div>
              <Badge className={cn('text-sm px-3 py-1', status.className)}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {status.label}
              </Badge>
            </div>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadReceipt?.(transaction)}
            >
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
            {transaction.status === 'success' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefund?.(transaction)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refund
              </Button>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Amount Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transaction Amount</p>
                <p className="text-4xl font-bold text-gray-900">
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-500 mt-1">{transaction.currency}</p>
              </div>
              <DollarSign className="h-16 w-16 text-blue-200" />
            </div>
          </div>

          {/* Transaction Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-600" />
                Payment Details
              </h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <InfoRow
                  label="Payment Method"
                  value={transaction.paymentMethod}
                />
                <InfoRow
                  label="Merchant Txn ID"
                  value={transaction.merchantTransactionId}
                  copyable
                  onCopy={() => copyToClipboardHandler(transaction.merchantTransactionId, 'Merchant Transaction ID')}
                />
                {transaction.gatewayTransactionId && (
                  <InfoRow
                    label="Gateway Txn ID"
                    value={transaction.gatewayTransactionId}
                    copyable
                    onCopy={() => copyToClipboardHandler(transaction.gatewayTransactionId!, 'Gateway Transaction ID')}
                  />
                )}
                <InfoRow
                  label="Created At"
                  value={formatDate(transaction.createdAt)}
                />
                {transaction.settlementDate && (
                  <InfoRow
                    label="Settlement Date"
                    value={formatDate(transaction.settlementDate)}
                  />
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600" />
                Customer Details
              </h3>
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <InfoRow
                  label="Email"
                  value={transaction.customerEmail}
                  copyable
                  onCopy={() => copyToClipboardHandler(transaction.customerEmail, 'Email')}
                />
                {transaction.customerPhone && (
                  <InfoRow
                    label="Phone"
                    value={transaction.customerPhone}
                    copyable
                    onCopy={() => copyToClipboardHandler(transaction.customerPhone!, 'Phone')}
                  />
                )}
                <InfoRow label="Client" value={transaction.clientName} />
                <InfoRow label="Client ID" value={transaction.clientId} />
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-600" />
              Fee Breakdown
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gateway Fee</span>
                <span className="font-medium">{formatCurrency(transaction.fees.gateway)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium">{formatCurrency(transaction.fees.platform)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST</span>
                <span className="font-medium">{formatCurrency(transaction.fees.gst)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Fees</span>
                <span>{formatCurrency(transaction.fees.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {transaction.timeline && transaction.timeline.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                Transaction Timeline
              </h3>
              <div className="relative pl-8 space-y-4">
                {transaction.timeline.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute -left-8 top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-white" />
                    {index < transaction.timeline.length - 1 && (
                      <div className="absolute -left-6 top-5 w-0.5 h-full bg-gray-200" />
                    )}
                    <div className="bg-white border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{event.status}</span>
                        <span className="text-xs text-gray-500">{formatDate(event.timestamp)}</span>
                      </div>
                      {event.notes && (
                        <p className="text-sm text-gray-600">{event.notes}</p>
                      )}
                      {event.user && (
                        <p className="text-xs text-gray-400 mt-1">By: {event.user}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Refunds */}
          {transaction.refunds && transaction.refunds.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Refunds</h3>
              <div className="space-y-2">
                {transaction.refunds.map((refund) => (
                  <div key={refund.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{formatCurrency(refund.amount)}</p>
                        <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                        {refund.notes && (
                          <p className="text-xs text-gray-500 mt-1">{refund.notes}</p>
                        )}
                      </div>
                      <Badge variant="outline">{refund.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {transaction.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Description
              </h3>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                {transaction.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper Component
const InfoRow: React.FC<{
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
}> = ({ label, value, copyable, onCopy }) => (
  <div className="flex justify-between items-start">
    <span className="text-sm text-gray-600">{label}</span>
    <div className="flex items-center gap-1">
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
      {copyable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={onCopy}
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
    </div>
  </div>
);
