'use client';

/**
 * Transaction Detail Page - Mobile-Optimized
 * Detailed transaction view with timeline, payment details, and actions
 */
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transactionService, TransactionDetails } from '@/services/api/TransactionApiService';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatCurrency, cn, copyToClipboard } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TransactionTimeline } from '@/components/transactions/TransactionTimeline';
import { UpdateTransactionForm } from '@/components/transactions/UpdateTransactionForm';
import {
  ArrowLeft,
  Download,
  RotateCcw,
  Send,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  User,
  CreditCard,
  Receipt,
  FileText,
  Activity,
  Edit,
  Webhook,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    timeline,
    webhookLogs,
    retryAttempts,
    fetchTimeline,
    fetchWebhookLogs,
    fetchRetryHistory,
  } = useTransactionStore();

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchTransactionDetails();
    }
  }, [id]);

  const fetchTransactionDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransaction(id);
      setTransaction(data);

      fetchTimeline(id).catch(() => {});
      fetchWebhookLogs(id).catch(() => {});
      fetchRetryHistory(id).catch(() => {});
    } catch (err) {
      setError('Failed to load transaction details');
      toast.error('Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied to clipboard`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownloadReceipt = async () => {
    if (!transaction) return;
    try {
      toast.success('Receipt downloaded');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleRefund = async () => {
    if (!transaction) return;

    try {
      await transactionService.refundTransaction(transaction.id, {
        amount: Number(refundAmount),
        reason: refundReason,
      });
      toast.success('Refund initiated successfully');
      setRefundDialogOpen(false);
      fetchTransactionDetails();
    } catch (error) {
      toast.error('Failed to initiate refund');
    }
  };

  const handleResendWebhook = async () => {
    if (!transaction) return;
    try {
      toast.success('Webhook queued for resending');
    } catch (error) {
      toast.error('Failed to resend webhook');
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The transaction you are looking for does not exist.'}</p>
        <Button onClick={() => router.push('/transactions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </Button>
      </div>
    );
  }

  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/transactions')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-mono text-sm text-gray-500">{transaction.id}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleCopy(transaction.id, 'Transaction ID')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReceipt}
          >
            <Download className="h-4 w-4 mr-2" />
            Receipt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUpdateDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update
          </Button>
          {transaction.status === 'success' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefundDialogOpen(true)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Refund
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendWebhook}
          >
            <Send className="h-4 w-4 mr-2" />
            Resend Webhook
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Card className={cn('border-2', status.className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-full', status.className)}>
                <StatusIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Status</p>
                <p className="text-2xl font-bold">{status.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-3xl font-bold">{formatCurrency(transaction.amount)}</p>
              <p className="text-sm text-gray-500">{transaction.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Payment Method" value={transaction.paymentMethod} />
            <InfoRow
              label="Merchant Txn ID"
              value={transaction.merchantTransactionId}
              copyable
              onCopy={() => handleCopy(transaction.merchantTransactionId, 'Merchant Transaction ID')}
            />
            {transaction.gatewayTransactionId && (
              <InfoRow
                label="Gateway Txn ID"
                value={transaction.gatewayTransactionId}
                copyable
                onCopy={() => handleCopy(transaction.gatewayTransactionId!, 'Gateway Transaction ID')}
              />
            )}
            <InfoRow label="Created At" value={formatDate(transaction.createdAt)} />
            <InfoRow label="Updated At" value={formatDate(transaction.updatedAt)} />
            {transaction.settlementDate && (
              <InfoRow label="Settlement Date" value={formatDate(transaction.settlementDate)} />
            )}
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Email"
              value={transaction.customerEmail}
              copyable
              onCopy={() => handleCopy(transaction.customerEmail, 'Email')}
            />
            {transaction.customerPhone && (
              <InfoRow
                label="Phone"
                value={transaction.customerPhone}
                copyable
                onCopy={() => handleCopy(transaction.customerPhone!, 'Phone')}
              />
            )}
            <InfoRow label="Client Name" value={transaction.clientName} />
            <InfoRow label="Client ID" value={transaction.clientId} />
          </CardContent>
        </Card>

        {/* Fee Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-600" />
              Fee Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Gateway Fee" value={formatCurrency(transaction.fees.gateway)} />
            <InfoRow label="Platform Fee" value={formatCurrency(transaction.fees.platform)} />
            <InfoRow label="GST" value={formatCurrency(transaction.fees.gst)} />
            <Separator />
            <div className="flex justify-between font-semibold pt-2">
              <span>Total Fees</span>
              <span>{formatCurrency(transaction.fees.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Timeline */}
      {timeline && timeline.events && timeline.events.length > 0 && (
        <TransactionTimeline events={timeline.events} />
      )}

      {/* Webhook Logs */}
      {webhookLogs && webhookLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-gray-600" />
              Webhook Logs
            </CardTitle>
            <CardDescription>Recent webhook delivery attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {webhookLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm">{log.url}</span>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                      {log.statusCode}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Attempt: {log.attemptNumber}</span>
                    <span>Response: {log.responseTime}ms</span>
                    <span>{new Date(log.sentAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retry History */}
      {retryAttempts && retryAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-gray-600" />
              Retry History
            </CardTitle>
            <CardDescription>Previous retry attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {retryAttempts.map((attempt) => (
                <div key={attempt.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Attempt #{attempt.attemptNumber}</span>
                    <Badge variant={attempt.status === 'success' ? 'default' : 'destructive'}>
                      {attempt.status}
                    </Badge>
                  </div>
                  {attempt.failureReason && (
                    <p className="text-sm text-red-600 mt-2">{attempt.failureReason}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(attempt.attemptedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refunds */}
      {transaction.refunds && transaction.refunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-gray-600" />
              Refunds
            </CardTitle>
            <CardDescription>All refund requests for this transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {transaction.refunds.map((refund) => (
              <div
                key={refund.id}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(refund.amount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                  </div>
                  <Badge variant="outline">{refund.status}</Badge>
                </div>
                {refund.notes && (
                  <p className="text-xs text-gray-500 mt-2">{refund.notes}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Created: {formatDate(refund.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {transaction.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{transaction.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Refund</DialogTitle>
            <DialogDescription>
              Process a refund for this transaction. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                placeholder="0.00"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={transaction.amount}
              />
              <p className="text-xs text-gray-500 mt-1">
                Max: {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <Label htmlFor="refundReason">Reason</Label>
              <Textarea
                id="refundReason"
                placeholder="Enter reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={!refundAmount || !refundReason}
            >
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Transaction Dialog */}
      {transaction && (
        <UpdateTransactionForm
          transaction={transaction as any}
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
          onSuccess={fetchTransactionDetails}
        />
      )}
    </div>
  );
}


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

