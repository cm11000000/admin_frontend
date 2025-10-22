'use client';

/**
 * Save Charges Page - PayLink Charges Saved
 * Display and manage saved PayLink charges with filtering and export
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
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
import { payLinkChargeService, PayLinkCharge, SaveChargeRequest } from '@/services/api/PayLinkChargeApiService';

interface SavedCharge extends PayLinkCharge {
  chargeId?: string;
  description?: string;
  createdBy?: string;
  lastModified?: string;
}

export default function SaveChargesPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [charges, setCharges] = useState<SavedCharge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    setIsLoading(true);
    try {
      const data = await payLinkChargeService.getAllCharges();

      // Map PayLinkCharge to SavedCharge with additional fields
      const mappedCharges: SavedCharge[] = data.map(charge => ({
        ...charge,
        chargeId: charge.id,
        description: `${charge.chargeType} charge for ${charge.clientCode}`,
        createdBy: 'System',
        lastModified: charge.updatedAt || charge.createdAt,
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

  const handleView = (charge: SavedCharge) => {
    toast.success(`Viewing charge ${charge.chargeId}`);
  };

  const handleEdit = (charge: SavedCharge) => {
    toast.success(`Editing charge ${charge.chargeId}`);
  };

  const handleDelete = (charge: SavedCharge) => {
    if (confirm(`Are you sure you want to delete charge ${charge.chargeId}?`)) {
      setCharges(charges.filter(c => c.id !== charge.id));
      toast.success('Charge deleted successfully');
    }
  };

  const getStatusBadge = (status: SavedCharge['status']) => {
    const variants = {
      active: 'bg-green-500/20 text-green-400 border border-green-500/40',
      inactive: 'bg-white text-gray-600',
    };

    const icons = {
      active: <CheckCircle className="h-3 w-3 mr-1" />,
      inactive: <XCircle className="h-3 w-3 mr-1" />,
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
      charge.clientCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || charge.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Save Charges</h1>
          <p className="text-gray-500 mt-1">
            Manage saved PayLink charges
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Charges</span>
            <IndianRupee className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {charges.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Saved configurations
          </div>
        </Card>

        <Card className="p-4 border-green-500/30 bg-green-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {charges.filter(c => c.status === 'active').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Currently active
          </div>
        </Card>

        <Card className="p-4 border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Inactive</span>
            <XCircle className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {charges.filter(c => c.status === 'inactive').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Deactivated
          </div>
        </Card>

        <Card className="p-4 border-[#0077FF]/30 bg-[#0077FF]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Amount</span>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(charges.reduce((sum, c) => sum + c.amount, 0))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Combined value
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by charge ID, client name, or code..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div className="sm:col-span-2 flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setStatusFilter('all');
                }}
              >
                Clear All
              </Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredCharges.length === 0 ? (
          <div className="p-12 text-center">
            <IndianRupee className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No charges found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'No saved charges available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-[#003366] to-[#002347]">
                <TableRow>
                  <TableHead className="text-white">Charge ID</TableHead>
                  <TableHead className="text-white">Client</TableHead>
                  <TableHead className="text-white">Client Code</TableHead>
                  <TableHead className="text-white">Amount</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white">Created By</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharges.map((charge) => (
                  <TableRow key={charge.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {charge.chargeId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{charge.clientName}</div>
                        {charge.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {charge.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{charge.clientCode}</Badge>
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
                        {formatDateTime(charge.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {charge.createdBy}
                      </div>
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
                          <DropdownMenuItem onClick={() => handleEdit(charge)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(charge)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
        {filteredCharges.map((charge) => (
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
                <p className="text-xs text-gray-600">Client Code</p>
                <p className="text-sm">{charge.clientCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Created</p>
                <p className="text-sm">{formatDateTime(charge.createdAt)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleView(charge)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(charge)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDelete(charge)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
