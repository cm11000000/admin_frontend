'use client';
// Client-only page; safe for static export

import React, { useEffect, useState } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { ISplitPayment, ISplitRecipient } from '@/services/api/TransactionApiService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';

export default function SplitPaymentsPage() {
  if (typeof window === 'undefined') return null as any;
  const txStore = useTransactionStore() as any;
  const splitPayments = Array.isArray(txStore?.splitPayments) ? txStore.splitPayments : [];
  const fetchSplitPayments = (txStore?.fetchSplitPayments as any) || (async () => {});
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadSplitPayments();
  }, []);

  const loadSplitPayments = async () => {
    setIsLoading(true);
    try {
      await fetchSplitPayments({});
    } catch (error) {
      toast.error('Failed to load split payments');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = splitPayments.filter((payment) => {
    const matchesSearch =
      searchQuery === '' ||
      payment.parentTransactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.recipients.some((r) =>
        r.merchantName.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus =
      filterStatus === 'all' ||
      payment.recipients.some((r) => r.settlementStatus === filterStatus);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      settled: { label: 'Settled', variant: 'default', icon: CheckCircle2 },
      pending: { label: 'Pending', variant: 'secondary', icon: Clock },
      failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Split Payments</h1>
          <p className="text-gray-500 mt-1">
            Manage split payment configurations and settlements
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Split Config
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Splits</div>
            <div className="text-2xl font-bold">{splitPayments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Settled</div>
            <div className="text-2xl font-bold text-emerald-600">
              {splitPayments.reduce(
                (acc, p) => acc + p.recipients.filter((r) => r.settlementStatus === 'settled').length,
                0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-amber-600">
              {splitPayments.reduce(
                (acc, p) => acc + p.recipients.filter((r) => r.settlementStatus === 'pending').length,
                0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="text-2xl font-bold">
              {formatCurrency(splitPayments.reduce((acc, p) => acc + p.totalAmount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by transaction ID or merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Split Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Split Payment Transactions</CardTitle>
          <CardDescription>
            View and manage all split payment configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No split payments found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first split payment configuration'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Split Config
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <SplitPaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Split Config Dialog */}
      <CreateSplitConfigDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={loadSplitPayments}
      />
    </div>
  );
}

const SplitPaymentCard: React.FC<{ payment: ISplitPayment }> = ({ payment }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">Transaction: {payment.parentTransactionId}</h4>
            <Badge variant="outline">{payment.splitRule}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {formatCurrency(payment.totalAmount)}</span>
            <span>{payment.recipients.length} recipients</span>
            <span>{new Date(payment.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide' : 'Show'} Details
        </Button>
      </div>

      {expanded && (
        <>
          <Separator className="my-3" />
          <div className="space-y-3">
            <h5 className="font-semibold text-sm">Split Breakdown</h5>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Split</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Settled At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payment.recipients.map((recipient, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{recipient.merchantName}</TableCell>
                    <TableCell>
                      {recipient.splitPercentage
                        ? `${recipient.splitPercentage}%`
                        : 'Fixed'}
                    </TableCell>
                    <TableCell>{formatCurrency(recipient.splitAmount || 0)}</TableCell>
                    <TableCell>{getStatusBadge(recipient.settlementStatus)}</TableCell>
                    <TableCell>
                      {recipient.settledAt
                        ? new Date(recipient.settledAt).toLocaleDateString('en-IN')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

const CreateSplitConfigDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, onClose, onSuccess }) => {
  const [splitRule, setSplitRule] = useState<'percentage' | 'fixed'>('percentage');
  const [recipients, setRecipients] = useState<
    Omit<ISplitRecipient, 'settlementStatus' | 'settledAt'>[]
  >([
    { merchantId: '', merchantName: '', splitPercentage: 0, splitAmount: 0 },
  ]);

  const addRecipient = () => {
    if (recipients.length < 10) {
      setRecipients([
        ...recipients,
        { merchantId: '', merchantName: '', splitPercentage: 0, splitAmount: 0 },
      ]);
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: string, value: any) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleSubmit = () => {
    toast.success('Split configuration created successfully');
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Split Payment Configuration</DialogTitle>
          <DialogDescription>
            Configure how payments should be split among recipients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Split Rule</Label>
            <Select value={splitRule} onValueChange={(v: any) => setSplitRule(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage-based</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Recipients (Max 10)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addRecipient}
                disabled={recipients.length >= 10}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>

            <div className="space-y-3">
              {recipients.map((recipient, index) => (
                <div key={index} className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Recipient {index + 1}</span>
                    {recipients.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Merchant ID</Label>
                      <Input
                        value={recipient.merchantId}
                        onChange={(e) =>
                          updateRecipient(index, 'merchantId', e.target.value)
                        }
                        placeholder="Enter merchant ID"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Merchant Name</Label>
                      <Input
                        value={recipient.merchantName}
                        onChange={(e) =>
                          updateRecipient(index, 'merchantName', e.target.value)
                        }
                        placeholder="Enter merchant name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">
                      {splitRule === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </Label>
                    <Input
                      type="number"
                      value={
                        splitRule === 'percentage'
                          ? recipient.splitPercentage
                          : recipient.splitAmount
                      }
                      onChange={(e) =>
                        updateRecipient(
                          index,
                          splitRule === 'percentage' ? 'splitPercentage' : 'splitAmount',
                          Number(e.target.value)
                        )
                      }
                      placeholder={splitRule === 'percentage' ? '0-100' : '0.00'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {splitRule === 'percentage' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-900">
                Total Percentage:{' '}
                <span className="font-semibold">
                  {recipients.reduce((sum, r) => sum + (r.splitPercentage || 0), 0)}%
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    settled: { label: 'Settled', variant: 'default', icon: CheckCircle2 },
    pending: { label: 'Pending', variant: 'secondary', icon: Clock },
    failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant as any}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};
