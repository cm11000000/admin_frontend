'use client';

/**
 * All Charges Page - Complete Charge List
 * Comprehensive view of all PayLink charges with advanced filtering
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Loader2,
  MoreVertical,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { payLinkChargeService, PayLinkCharge, UpdateChargeRequest } from '@/services/api/PayLinkChargeApiService';

interface Charge extends PayLinkCharge {
  chargeId?: string;
  paymentLinkId?: string;
  description?: string;
  transactionDate?: string;
  processedDate?: string;
  createdBy?: string;
  referenceNumber?: string;
}

export default function AllChargesPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [chargeTypeFilter, setChargeTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingCharge, setEditingCharge] = useState<Charge | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    setIsLoading(true);
    try {
      const data = await payLinkChargeService.getAllCharges();

      // Map PayLinkCharge to Charge with additional fields
      const mappedCharges: Charge[] = data.map(charge => ({
        ...charge,
        chargeId: charge.id,
        paymentLinkId: `PL-${charge.clientCode}`,
        description: `${charge.chargeType} charge for ${charge.clientCode}`,
        transactionDate: charge.createdAt,
        processedDate: charge.status === 'active' ? charge.updatedAt : undefined,
        createdBy: 'System',
        referenceNumber: charge.status === 'active' ? `REF-${charge.id.slice(0, 8)}` : undefined,
      }));

      setCharges(mappedCharges);
    } catch (error: any) {
      console.error('Failed to load charges:', error);
      toast.error(error.message || 'Failed to load charges');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCharges();
    setIsRefreshing(false);
    toast.success('Charges refreshed');
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export charges');
    } finally {
      setIsExporting(false);
    }
  };

  const handleView = (charge: Charge) => {
    router.push(`/payment-links/${charge.paymentLinkId}`);
  };

  const handleEdit = (charge: Charge) => {
    setEditingCharge(charge);
    setEditAmount(charge.amount);
    setShowEditModal(true);
  };

  const handleUpdateCharge = async () => {
    if (!editingCharge) return;

    if (!editAmount || editAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const updateRequest: UpdateChargeRequest = {
        clientCode: editingCharge.clientCode,
        type: editingCharge.chargeType,
        chargeAmount: editAmount,
      };

      await payLinkChargeService.updateCharge(updateRequest);
      toast.success('Charge updated successfully');
      setShowEditModal(false);
      setEditingCharge(null);
      await loadCharges();
    } catch (error: any) {
      console.error('Failed to update charge:', error);
      toast.error(error.message || 'Failed to update charge');
    }
  };

  const getStatusBadge = (status: Charge['status']) => {
    const variants = {
      pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
      processed: 'bg-green-500/20 text-green-400 border border-green-500/40',
      failed: 'bg-red-500/20 text-red-400 border border-red-500/40',
      cancelled: 'bg-white text-gray-600',
    };

    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      processed: <CheckCircle className="h-3 w-3 mr-1" />,
      failed: <XCircle className="h-3 w-3 mr-1" />,
      cancelled: <XCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge className={`${variants[status]} flex items-center`}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  const filteredCharges = charges.filter(charge => {
    const matchesSearch = !searchQuery ||
      charge.chargeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charge.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charge.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charge.paymentLinkId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (charge.referenceNumber && charge.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || charge.status === statusFilter;
    const matchesChargeType = chargeTypeFilter === 'all' || charge.chargeType === chargeTypeFilter;

    const matchesAmount = (!amountFrom || charge.amount >= parseFloat(amountFrom)) &&
                          (!amountTo || charge.amount <= parseFloat(amountTo));

    return matchesSearch && matchesStatus && matchesChargeType && matchesAmount;
  });

  const totalAmount = filteredCharges.reduce((sum, c) => sum + c.amount, 0);
  const processedCount = filteredCharges.filter(c => c.status === 'processed').length;
  const pendingCount = filteredCharges.filter(c => c.status === 'pending').length;
  const failedCount = filteredCharges.filter(c => c.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Charges</h1>
          <p className="text-gray-500 mt-1">
            Complete list of all PayLink charges
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Charges</span>
            <FileText className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredCharges.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatCurrency(totalAmount)}
          </div>
        </Card>

        <Card className="p-4 border-green-500/30 bg-green-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Processed</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {processedCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((processedCount / filteredCharges.length) * 100 || 0).toFixed(1)}% of total
          </div>
        </Card>

        <Card className="p-4 border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending</span>
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {pendingCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Awaiting process
          </div>
        </Card>

        <Card className="p-4 border-red-500/30 bg-red-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Failed</span>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {failedCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Requires action
          </div>
        </Card>

        <Card className="p-4 border-[#0077FF]/30 bg-[#0077FF]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Charge</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalAmount / filteredCharges.length || 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Per transaction
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by charge ID, client, payment link, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Charge Type</label>
              <Select value={chargeTypeFilter} onValueChange={setChargeTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Transaction Fee">Transaction Fee</SelectItem>
                  <SelectItem value="Service Fee">Service Fee</SelectItem>
                  <SelectItem value="Setup Fee">Setup Fee</SelectItem>
                  <SelectItem value="Platform Fee">Platform Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Amount Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={amountFrom}
                  onChange={(e) => setAmountFrom(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={amountTo}
                  onChange={(e) => setAmountTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setAmountFrom('');
                setAmountTo('');
                setStatusFilter('all');
                setChargeTypeFilter('all');
              }}
            >
              Clear All
            </Button>
            <Button size="sm">Apply Filters</Button>
          </div>
        </Card>
      )}

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredCharges.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No charges found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'No charges available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-[#003366] to-[#002347]">
                <TableRow>
                  <TableHead className="text-white">Charge ID</TableHead>
                  <TableHead className="text-white">Client</TableHead>
                  <TableHead className="text-white">Payment Link</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Transaction Date</TableHead>
                  <TableHead className="text-white">Reference</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(filteredCharges) && filteredCharges.map((charge) => (
                  <TableRow key={charge.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {charge.chargeId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{charge.clientName}</div>
                        <div className="text-xs text-gray-500">{charge.clientCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{charge.paymentLinkId}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(charge.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{charge.chargeType}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(charge.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateTime(charge.transactionDate)}
                      </div>
                      {charge.processedDate && (
                        <div className="text-xs text-gray-500">
                          Processed: {formatDateTime(charge.processedDate)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {charge.referenceNumber ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {charge.referenceNumber}
                        </Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(charge)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Mobile View - Cards */}
      <div className="lg:hidden space-y-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))
        ) : filteredCharges.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No charges found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'No charges available'}
            </p>
          </Card>
        ) : (
          Array.isArray(filteredCharges) && filteredCharges.map((charge) => (
            <Card key={charge.id} className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 mb-1">
                    {charge.chargeId}
                  </div>
                  <div className="text-sm text-gray-600">{charge.clientName}</div>
                </div>
                {getStatusBadge(charge.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-600">Amount</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(charge.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Type</p>
                  <p className="text-sm">{charge.chargeType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Payment Link</p>
                  <Badge variant="outline" className="text-xs">{charge.paymentLinkId}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Date</p>
                  <p className="text-sm">{formatDateTime(charge.transactionDate)}</p>
                </div>
              </div>

              {charge.referenceNumber && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600">Reference</p>
                  <Badge variant="outline" className="font-mono text-xs mt-1">
                    {charge.referenceNumber}
                  </Badge>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(charge)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
