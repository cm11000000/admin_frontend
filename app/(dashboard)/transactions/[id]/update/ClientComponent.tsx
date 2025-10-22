'use client';

/**
 * Update Transaction Dedicated Page
 * Dedicated page for updating transaction details with form submission
 */
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { transactionService, TransactionDetails } from '@/services/api/TransactionApiService';
import { useTransactionStore } from '@/stores/transactionStore';
import { UpdateTransactionForm } from '@/components/transactions/UpdateTransactionForm';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

export default function UpdateTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

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
      // Open the dialog immediately when data is loaded
      setUpdateDialogOpen(true);
    } catch (err) {
      setError('Failed to load transaction details');
      toast.error('Failed to load transaction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuccess = () => {
    toast.success('Update request submitted successfully');
    // Redirect to transaction details page after successful update
    router.push(`/transactions/${id}`);
  };

  const handleCancel = () => {
    // Navigate back to transaction details
    router.push(`/transactions/${id}`);
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
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading transaction details...</p>
          </div>
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
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/transactions')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
          <Button onClick={fetchTransactionDetails}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button
          onClick={() => router.push('/transactions')}
          className="hover:text-gray-900 transition-colors"
        >
          Transactions
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/transactions/${id}`)}
          className="hover:text-gray-900 transition-colors"
        >
          {id}
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Update</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Transaction</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">{transaction.id}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {/* Transaction Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn('border-2', status.className)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Current Transaction Status
            </CardTitle>
            <CardDescription>
              Review current transaction details before making updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge className={cn(status.className, 'capitalize')}>
                  {transaction.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="text-lg font-medium capitalize">{transaction.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Email</p>
                <p className="text-sm font-medium">{transaction.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Phone</p>
                <p className="text-sm font-medium">{transaction.customerPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-sm font-medium">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>
            {transaction.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-900">{transaction.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Critical Field Updates</p>
                <p>Updates to critical fields (like status) will require approval before being applied to the transaction.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">Audit Trail</p>
                <p>All changes are logged in the audit trail. Please provide a detailed reason for any updates.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Form - As Dialog */}
      {transaction && (
        <UpdateTransactionForm
          transaction={transaction as any}
          open={updateDialogOpen}
          onClose={() => {
            setUpdateDialogOpen(false);
            handleCancel();
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Show instruction to open form if closed */}
      {!updateDialogOpen && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Click the button below to open the update form</p>
            <Button onClick={() => setUpdateDialogOpen(true)}>
              Open Update Form
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

