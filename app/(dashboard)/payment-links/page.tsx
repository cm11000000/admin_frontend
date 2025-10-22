'use client';

/**
 * Payment Links List Page - Mobile-First Design
 * Comprehensive payment link management with filters and actions
 */
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePaymentLinkStore } from '@/stores/paymentLinkStore';
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  Filter,
  Link as LinkIcon,
  Eye,
  Share2,
  XCircle,
  Trash2,
  Copy,
  Check,
  MoreVertical,
  Loader2,
  Calendar,
  TrendingUp,
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { formatCurrency, formatDateTime, copyToClipboard, debounce } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentLink } from '@/services/api/PaymentLinkApiService';

export default function PaymentLinksPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  const {
    paymentLinks,
    isLoading,
    isLoadingMore,
    isRefreshing,
    isExporting,
    filters,
    appliedFilters,
    summary,
    totalCount,
    hasNext,
    pageSize,
    sortBy,
    sortOrder,
    fetchPaymentLinks,
    loadMorePaymentLinks,
    refreshPaymentLinks,
    setFilter,
    applyFilters,
    clearFilters,
    setSorting,
    exportPaymentLinks,
    deactivatePaymentLink,
    sharePaymentLink,
  } = usePaymentLinkStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPaymentLinks(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNext && !isLoadingMore && !isLoading) {
          loadMorePaymentLinks();
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNext, isLoadingMore, isLoading]);

  const debouncedSearch = debounce((query: string) => {
    setFilter('search', query);
    applyFilters();
  }, 500);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleCopyLink = async (link: PaymentLink) => {
    const success = await copyToClipboard(link.linkUrl);
    if (success) {
      setCopiedId(link.id);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleViewLink = (link: PaymentLink) => {
    router.push(`/payment-links/${link.id}`);
  };

  const handleShare = async (link: PaymentLink) => {
    try {
      await sharePaymentLink(link.id, ['email'], {
        customerEmail: link.customerEmail,
        customerName: link.customerName,
      });
      toast.success('Notification sent successfully');
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const handleDeactivate = async (link: PaymentLink) => {
    try {
      await deactivatePaymentLink(link.id, 'Deactivated by admin');
      toast.success('Payment link deactivated');
      refreshPaymentLinks();
    } catch (error) {
      toast.error('Failed to deactivate link');
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      await exportPaymentLinks(format);
      toast.success(`Exported ${totalCount} payment links`);
    } catch (error) {
      toast.error('Failed to export payment links');
    }
  };

  const getStatusBadge = (status: PaymentLink['status']) => {
    const variants: Record<string, string> = {
      active: 'bg-[#0077FF]/20 text-[#0077FF] border border-[#0077FF]/40',
      paid: 'bg-green-500/20 text-green-400 border border-green-500/40',
      expired: 'bg-white text-gray-600',
      cancelled: 'bg-red-500/20 text-red-400 border border-red-500/40',
    };

    return (
      <Badge className={variants[status] || 'bg-white text-gray-600'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h4 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          Payment Links
        </h4>
        <p className="text-gray-600 text-sm mt-1">
          Create and manage payment links
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div></div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshPaymentLinks()}
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
          <Button size="sm" onClick={() => router.push('/payment-links/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Link
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 hover:shadow-orange-500/5 transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Amount</span>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalCount} links
          </div>
        </Card>

        <Card className="p-4 border-green-500/30 bg-green-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Paid</span>
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.paidCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((summary.paidCount / totalCount) * 100 || 0).toFixed(1)}% conversion
          </div>
        </Card>

        <Card className="p-4 border-[#0077FF]/30 bg-[#0077FF]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <LinkIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.activeCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.totalViews} views
          </div>
        </Card>

        <Card className="p-4 border-amber-500/30 bg-amber-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Conversion</span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.conversionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Average rate
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by title, ID, email, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
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
            {appliedFilters > 0 && (
              <Badge variant="secondary" className="ml-2">
                {appliedFilters}
              </Badge>
            )}
          </Button>

          <Select
            value={`${pageSize}`}
            onValueChange={(value) => usePaymentLinkStore.getState().setPageSize(Number(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl shadow-2xl p-4 space-y-4 hover:shadow-orange-500/5 transition-shadow duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={filters.status[0] || 'all'}
                    onValueChange={(value) => {
                      setFilter('status', value === 'all' ? [] : [value]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date From</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilter('dateFrom', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date To</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilter('dateTo', e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Amount Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.amountFrom || ''}
                      onChange={(e) => setFilter('amountFrom', e.target.value ? Number(e.target.value) : null)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.amountTo || ''}
                      onChange={(e) => setFilter('amountTo', e.target.value ? Number(e.target.value) : null)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button size="sm" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Links List */}
      {isLoading && paymentLinks.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : paymentLinks.length === 0 ? (
        <Card className="p-12 text-center">
          <LinkIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment links found</h3>
          <p className="text-gray-600 mb-6">
            Create your first payment link to get started
          </p>
          <Button onClick={() => router.push('/payment-links/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Payment Link
          </Button>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paymentLinks.map((link) => (
              <Card key={link.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-800 truncate">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {link.description}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(link.status)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div>
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(link.amount)}
                        </p>
                      </div>

                      {link.customerName && (
                        <div>
                          <p className="text-xs text-gray-600">Customer</p>
                          <p className="font-medium text-sm truncate">
                            {link.customerName}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-600">Views</p>
                        <p className="font-medium">{link.views}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-600">Created</p>
                        <p className="font-medium text-sm">
                          {formatDateTime(link.createdAt)}
                        </p>
                      </div>
                    </div>

                    {link.expiresAt && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-amber-600">
                        <Calendar className="h-3 w-3" />
                        Expires: {formatDateTime(link.expiresAt)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(link)}
                      className="flex-1 sm:flex-none"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewLink(link)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShare(link)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        {link.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleDeactivate(link)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          {hasNext && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {isLoadingMore && (
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
