'use client';

/**
 * Desktop-Optimized Transaction Table Component
 * Sortable columns, row actions, and virtualized scrolling
 */
import React, { useMemo } from 'react';
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
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Download,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TransactionTableProps {
  transactions: Transaction[];
  selectedIds?: Set<string>;
  onSelectTransaction?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onViewDetails?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
  onDownloadReceipt?: (transaction: Transaction) => void;
  className?: string;
}

const statusConfig = {
  success: {
    label: 'Success',
    icon: CheckCircle2,
    variant: 'default' as const,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    variant: 'destructive' as const,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  refunded: {
    label: 'Refunded',
    icon: RotateCcw,
    variant: 'outline' as const,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: AlertCircle,
    variant: 'outline' as const,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertCircle,
    variant: 'outline' as const,
    className: 'bg-purple-50 text-purple-700 border-purple-200',
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

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  selectedIds = new Set(),
  onSelectTransaction,
  onSelectAll,
  onSort,
  sortColumn,
  sortDirection,
  onViewDetails,
  onRefund,
  onDownloadReceipt,
  className,
}) => {
  const allSelected = useMemo(() => {
    return transactions.length > 0 && transactions.every(t => selectedIds.has(t.id));
  }, [transactions, selectedIds]);

  const someSelected = useMemo(() => {
    return transactions.some(t => selectedIds.has(t.id)) && !allSelected;
  }, [transactions, selectedIds, allSelected]);

  const handleSort = (column: string) => {
    if (!onSort) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortColumn === column && sortDirection === 'asc') {
      direction = 'desc';
    }
    onSort(column, direction);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
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
    <div className={cn('border rounded-lg overflow-hidden bg-white', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={(checked: boolean) => onSelectAll?.(!!checked)}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none hover:bg-gray-100"
              onClick={() => handleSort('createdAt')}
            >
              <div className="flex items-center">
                Date & Time
                <SortIcon column="createdAt" />
              </div>
            </TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Method</TableHead>
            <TableHead
              className="cursor-pointer select-none hover:bg-gray-100"
              onClick={() => handleSort('amount')}
            >
              <div className="flex items-center justify-end">
                Amount
                <SortIcon column="amount" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer select-none hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                Status
                <SortIcon column="status" />
              </div>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => {
              const status = statusConfig[transaction.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const PaymentIcon = paymentMethodIcons[transaction.paymentMethod as keyof typeof paymentMethodIcons] || paymentMethodIcons.default;

              return (
                <TableRow
                  key={transaction.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onViewDetails?.(transaction)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(transaction.id)}
                      onCheckedChange={(checked: boolean) =>
                        onSelectTransaction?.(transaction.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(transaction.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs text-gray-600">
                        {transaction.merchantTransactionId}
                      </span>
                      <span className="font-mono text-xs text-gray-400">
                        {transaction.id.slice(0, 12)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {transaction.clientName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-900 truncate max-w-[200px]">
                        {transaction.customerEmail}
                      </span>
                      {transaction.customerPhone && (
                        <span className="text-xs text-gray-500">
                          {transaction.customerPhone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {transaction.paymentMethod}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Fee: {formatCurrency(transaction.fees.total)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant as any} className={cn('gap-1', status.className)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails?.(transaction)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownloadReceipt?.(transaction)}>
                          <Download className="h-4 w-4 mr-2" />
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
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
