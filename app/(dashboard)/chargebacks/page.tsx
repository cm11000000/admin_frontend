/**
 * Chargebacks List Page
 * Main chargebacks management interface with filtering and bulk operations
 */
'use client';
// Client-only page; safe for static export

import { useEffect, useState } from 'react';
import { useChargebackStore } from '@/stores/chargebackStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChargebackStatusBadge, ChargebackPriorityBadge, OverdueBadge } from '@/components/chargebacks/ChargebackStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ChargebacksPage() {
  const {
    chargebacks = [],
    isLoading = false,
    error = null,
    currentPage = 1,
    pageSize = 10,
    totalCount = 0,
    hasNext = false,
    hasPrev = false,
    filters = {} as any,
    stats = { totalAmount: 0, wonCount: 0, lostCount: 0, newCount: 0, underReviewCount: 0, evidenceSubmittedCount: 0, overdueCount: 0 },
    selectedChargebacks = new Set<string>(),
    fetchChargebacks = () => Promise.resolve(),
    setFilter = () => {},
    applyFilters = () => {},
    clearFilters = () => {},
    setPage = () => {},
    selectChargeback = () => {},
    deselectChargeback = () => {},
    selectAllChargebacks = () => {},
    clearSelection = () => {},
    exportChargebacks = () => Promise.resolve(),
    bulkAssign = () => Promise.resolve(),
    getAppliedFiltersCount = () => 0,
  } = useChargebackStore() as any;

  const [showFilters, setShowFilters] = useState(false);
  const appliedFiltersCount = typeof getAppliedFiltersCount === 'function' ? getAppliedFiltersCount() : 0;

  useEffect(() => {
    fetchChargebacks();
  }, []);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      await exportChargebacks(format);
      toast.success(`Chargebacks exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
    }
  };

  const handleBulkAssign = async (assignTo: string) => {
    if (selectedChargebacks.size === 0) {
      toast.error('No chargebacks selected');
      return;
    }

    try {
      await bulkAssign(Array.from(selectedChargebacks), assignTo);
      toast.success(`Assigned ${selectedChargebacks.size} chargebacks`);
    } catch (err: any) {
      toast.error(err.message || 'Bulk assign failed');
    }
  };

  const isAllSelected = chargebacks.length > 0 && selectedChargebacks.size === chargebacks.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chargebacks</h1>
          <p className="text-muted-foreground">
            Manage and track all chargeback disputes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchChargebacks(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/chargebacks/workflow">
            <Button variant="outline">Workflow View</Button>
          </Link>
          <Link href="/chargebacks/analytics">
            <Button variant="primary">Analytics</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalCount} chargebacks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.wonCount + stats.lostCount > 0
                ? Math.round((stats.wonCount / (stats.wonCount + stats.lostCount)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.wonCount} won, {stats.lostCount} lost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.newCount + stats.underReviewCount + stats.evidenceSubmittedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.newCount} new, {stats.underReviewCount} in review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters & Search</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {appliedFiltersCount > 0 && (
                <Badge variant="default" className="mr-2">{appliedFiltersCount}</Badge>
              )}
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by chargeback ID, transaction ID, or ARN..."
                  value={(filters as any)?.search || ''}
                  onChange={(e) => setFilter('search', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => applyFilters()}>Search</Button>
              {appliedFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={Array.isArray((filters as any)?.status) ? (filters as any).status[0] : ''}
                    onValueChange={(value) => setFilter('status', value ? [value] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="evidence_submitted">Evidence Submitted</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={Array.isArray((filters as any)?.priority) ? (filters as any).priority[0] : ''}
                    onValueChange={(value) => setFilter('priority', value ? [value] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={(filters as any)?.dateFrom || ''}
                      onChange={(e) => setFilter('dateFrom', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={(filters as any)?.dateTo || ''}
                      onChange={(e) => setFilter('dateTo', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Amount Range (₹)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={(filters as any)?.amountFrom || ''}
                      onChange={(e) => setFilter('amountFrom', e.target.value ? Number(e.target.value) : null)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={(filters as any)?.amountTo || ''}
                      onChange={(e) => setFilter('amountTo', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.isOverdue === true}
                      onCheckedChange={(checked) => setFilter('isOverdue', checked ? true : undefined)}
                    />
                    <span className="text-sm font-medium">Show overdue only</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedChargebacks.size > 0 && (
        <Card className="border-primary">
          <CardContent className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={true} onCheckedChange={clearSelection} />
                <span className="font-medium">{selectedChargebacks.size} selected</span>
              </div>
              <div className="flex gap-2">
                <Select onValueChange={handleBulkAssign}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent1">Agent 1</SelectItem>
                    <SelectItem value="agent2">Agent 2</SelectItem>
                    <SelectItem value="agent3">Agent 3</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-[#003366] to-[#002347]">
                <TableRow>
                  <TableHead className="text-white w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllChargebacks();
                        } else {
                          clearSelection();
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="text-white text-white">Chargeback ID</TableHead>
                  <TableHead className="text-white text-white">Transaction ID</TableHead>
                  <TableHead className="text-white text-white">Customer</TableHead>
                  <TableHead className="text-white text-white">Amount</TableHead>
                  <TableHead className="text-white text-white">Reason</TableHead>
                  <TableHead className="text-white text-white">Status</TableHead>
                  <TableHead className="text-white text-white">Priority</TableHead>
                  <TableHead className="text-white text-white">Due Date</TableHead>
                  <TableHead className="text-white text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading chargebacks...</p>
                    </TableCell>
                  </TableRow>
                ) : chargebacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <p className="text-muted-foreground">No chargebacks found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  chargebacks.map((chargeback) => (
                    <TableRow key={chargeback.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedChargebacks.has(chargeback.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectChargeback(chargeback.id);
                            } else {
                              deselectChargeback(chargeback.id);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/chargebacks/${chargeback.id}`}
                          className="font-medium hover:text-primary"
                        >
                          #{chargeback.chargebackId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {chargeback.transactionId}
                      </TableCell>
                      <TableCell>
                        {chargeback.customer ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{chargeback.customer.email}</p>
                              {chargeback.customer.name && (
                                <p className="text-xs text-muted-foreground">
                                  {chargeback.customer.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{formatCurrency(chargeback.amount)}</div>
                        <div className="text-xs text-muted-foreground">{chargeback.currency}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium">{chargeback.reasonCode}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {chargeback.reasonDescription}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ChargebackStatusBadge status={chargeback.status} />
                      </TableCell>
                      <TableCell>
                        <ChargebackPriorityBadge priority={chargeback.priority} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {chargeback.isOverdue && <OverdueBadge />}
                          <div>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(chargeback.dueDate)}</span>
                            </div>
                            {chargeback.daysUntilDue !== undefined && (
                              <p className={`text-xs ${
                                chargeback.isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'
                              }`}>
                                {chargeback.daysUntilDue < 0
                                  ? `${Math.abs(chargeback.daysUntilDue)}d overdue`
                                  : `${chargeback.daysUntilDue}d left`}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/chargebacks/${chargeback.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {chargebacks.length} of {totalCount} chargebacks
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage - 1)}
            disabled={!hasPrev || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{currentPage}</span>
            <span className="text-sm text-muted-foreground">
              of {Math.ceil(totalCount / pageSize)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage + 1)}
            disabled={!hasNext || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
