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
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Chargebacks</h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1.5 md:mt-2">
            Manage and track all chargeback disputes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => fetchChargebacks(true)}
            disabled={isLoading}
            className="min-h-[44px] touch-manipulation"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
          <Link href="/chargebacks/workflow">
            <Button variant="outline" className="min-h-[44px] touch-manipulation w-full sm:w-auto">
              <span className="hidden xs:inline">Workflow View</span>
              <span className="xs:hidden">Workflow</span>
            </Button>
          </Link>
          <Link href="/chargebacks/analytics">
            <Button variant="primary" className="min-h-[44px] touch-manipulation w-full sm:w-auto">
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Stats</span>
            </Button>
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
          <CardHeader className="p-4 md:p-5 pb-3">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-5 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalCount} chargebacks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-5 pb-3">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-5 pt-0">
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
          <CardHeader className="p-4 md:p-5 pb-3">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-5 pt-0">
            <div className="text-2xl font-bold text-blue-600">
              {stats.newCount + stats.underReviewCount + stats.evidenceSubmittedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.newCount} new, {stats.underReviewCount} in review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 md:p-5 pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-5 pt-0">
            <div className="text-2xl font-bold text-red-600">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <CardTitle>Filters & Search</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="min-h-[44px] touch-manipulation"
            >
              <Filter className="h-4 w-4 mr-2" />
              {appliedFiltersCount > 0 && (
                <Badge variant="default" className="mr-2">{appliedFiltersCount}</Badge>
              )}
              <span className="hidden xs:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by chargeback ID, transaction ID, or ARN..."
                  value={(filters as any)?.search || ''}
                  onChange={(e) => setFilter('search', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  className="pl-10 min-h-[44px]"
                />
              </div>
              <Button onClick={() => applyFilters()} className="min-h-[44px] touch-manipulation">Search</Button>
              {appliedFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="min-h-[44px] touch-manipulation">
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
                      className="min-h-[44px]"
                    />
                    <Input
                      type="date"
                      value={(filters as any)?.dateTo || ''}
                      onChange={(e) => setFilter('dateTo', e.target.value)}
                      className="min-h-[44px]"
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
                      className="min-h-[44px]"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={(filters as any)?.amountTo || ''}
                      onChange={(e) => setFilter('amountTo', e.target.value ? Number(e.target.value) : null)}
                      className="min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
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
          <CardContent className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-4 md:p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={true} onCheckedChange={clearSelection} />
                <span className="font-medium">{selectedChargebacks.size} selected</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select onValueChange={handleBulkAssign}>
                  <SelectTrigger className="w-full sm:w-[200px] min-h-[44px]">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent1">Agent 1</SelectItem>
                    <SelectItem value="agent2">Agent 2</SelectItem>
                    <SelectItem value="agent3">Agent 3</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => handleExport('csv')} className="min-h-[44px] touch-manipulation">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">Export Selected</span>
                  <span className="xs:hidden">Export</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
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
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Chargeback ID
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Transaction ID
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Customer
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Amount
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Reason
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Status
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Priority
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Due Date
                </th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-extrabold text-gray-700 uppercase whitespace-nowrap" style={{ letterSpacing: '-0.02em' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-3 md:px-6 py-8 text-center">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Loading chargebacks...</p>
                  </td>
                </tr>
              ) : chargebacks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 md:px-6 py-8 text-center">
                    <p className="text-sm text-gray-500">No chargebacks found</p>
                  </td>
                </tr>
              ) : (
                chargebacks.map((chargeback) => (
                  <tr key={chargeback.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-2.5 md:py-4">
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
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 font-medium">
                      <Link
                        href={`/chargebacks/${chargeback.id}`}
                        className="font-medium hover:text-orange-600 transition-colors"
                      >
                        #{chargeback.chargebackId}
                      </Link>
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 font-mono">
                      {chargeback.transactionId}
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      {chargeback.customer ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs md:text-sm text-gray-900">{chargeback.customer.email}</p>
                            {chargeback.customer.name && (
                              <p className="text-xs text-gray-500">
                                {chargeback.customer.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      <div className="font-semibold text-gray-900">{formatCurrency(chargeback.amount)}</div>
                      <div className="text-xs text-gray-500">{chargeback.currency}</div>
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      <div className="max-w-xs">
                        <p className="text-xs md:text-sm font-medium text-gray-900">{chargeback.reasonCode}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {chargeback.reasonDescription}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      <ChargebackStatusBadge status={chargeback.status} />
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      <ChargebackPriorityBadge priority={chargeback.priority} />
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {chargeback.isOverdue && <OverdueBadge />}
                        <div>
                          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-900">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{formatDate(chargeback.dueDate)}</span>
                          </div>
                          {chargeback.daysUntilDue !== undefined && (
                            <p className={`text-xs ${
                              chargeback.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'
                            }`}>
                              {chargeback.daysUntilDue < 0
                                ? `${Math.abs(chargeback.daysUntilDue)}d overdue`
                                : `${chargeback.daysUntilDue}d left`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900">
                      <Link href={`/chargebacks/${chargeback.id}`}>
                        <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation">
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {chargebacks.length} of {totalCount} chargebacks
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage - 1)}
            disabled={!hasPrev || isLoading}
            className="min-h-[44px] touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Previous</span>
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
            className="min-h-[44px] touch-manipulation"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
