'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VIRT_THRESHOLD } from '@/config/perf';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MerchantCard } from '@/components/merchants/MerchantCard';
import { useMerchantStore } from '@/stores/merchantStore';
import { toast } from 'react-hot-toast';
import type { MerchantStatus } from '@/types/merchant';

export default function MerchantsPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  const {
    merchants,
    merchantStats,
    filters,
    currentPage,
    totalPages,
    totalCount,
    isLoading,
    fetchMerchants,
    fetchMerchantStats,
    setFilters,
    setPage,
    exportMerchants,
  } = useMerchantStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const [virtScrollTop, setVirtScrollTop] = useState(0);
  const [virtViewportHeight, setVirtViewportHeight] = useState(0);
  const [virtRowHeight, setVirtRowHeight] = useState<number>(0);

  const virtualizationEnabled = viewMode === 'table' && Array.isArray(merchants) && merchants.length > VIRT_THRESHOLD;

  useEffect(() => {
    if (!virtualizationEnabled) return;
    const measure = () => {
      const el = tableScrollRef.current;
      if (!el) return;
      setVirtViewportHeight(el.clientHeight || 0);
      const firstRow = el.querySelector('tbody tr') as HTMLElement | null;
      const h = firstRow?.offsetHeight || 56;
      setVirtRowHeight(h);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [virtualizationEnabled, merchants]);

  const onTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!virtualizationEnabled) return;
    setVirtScrollTop(e.currentTarget.scrollTop || 0);
  };

  useEffect(() => {
    fetchMerchants();
    fetchMerchantStats();
  }, [currentPage, filters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value, page: 1 });
  };

  const handleStatusFilter = (status: MerchantStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];
    setFilters({ status: newStatuses.length > 0 ? newStatuses : undefined, page: 1 });
  };

  const handleExport = async () => {
    try {
      await exportMerchants(filters);
      toast.success('Merchants exported successfully');
    } catch (error) {
      toast.error('Failed to export merchants');
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    suspended: 'bg-red-500',
    pending_approval: 'bg-yellow-500',
    under_review: 'bg-blue-500',
  };

  if (isLoading && merchants.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-600 mt-1">Manage merchant accounts and onboarding</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            Export
          </Button>
          <Button onClick={() => router.push('/clients/onboard')}>
            Onboard Merchant
          </Button>
        </div>
      </div>

      {merchantStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Merchants</p>
                <p className="text-3xl font-bold">{merchantStats.totalMerchants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Merchants</p>
                <p className="text-3xl font-bold text-green-600">{merchantStats.activeMerchants}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600">{merchantStats.pendingApprovals}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-blue-600">{merchantStats.thisMonthOnboarding}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{merchantStats.growthRate}% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or merchant ID..."
              value={filters.search || ''}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['active', 'inactive', 'pending_approval', 'suspended'].map((status) => (
              <Badge
                key={status}
                className={`cursor-pointer ${
                  filters.status?.includes(status as MerchantStatus)
                    ? statusColors[status]
                    : 'bg-gray-200 text-gray-600'
                } text-gray-900`}
                onClick={() => handleStatusFilter(status as MerchantStatus)}
              >
                {status.replace('_', ' ')}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
        </div>
      </Card>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(merchants) && merchants.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              onClick={() => router.push(`/clients/merchants/${merchant.id}`)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <div
            className="overflow-x-auto"
            ref={tableScrollRef}
            onScroll={onTableScroll}
            style={virtualizationEnabled ? { maxHeight: '70vh', overflowY: 'auto' } : undefined}
          >
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {virtualizationEnabled && virtRowHeight > 0 && virtViewportHeight > 0 ? (
                  (() => {
                    const total = merchants.length;
                    const rh = virtRowHeight || 56;
                    const overscan = 10;
                    const startIndex = Math.max(0, Math.floor(virtScrollTop / rh) - overscan);
                    const visibleCount = Math.ceil(virtViewportHeight / rh) + overscan * 2;
                    const endIndex = Math.min(total, startIndex + visibleCount);
                    const slice = merchants.slice(startIndex, endIndex);
                    const topPad = startIndex * rh;
                    const bottomPad = Math.max(0, (total - endIndex) * rh);
                    return (
                      <>
                        {topPad > 0 && (
                          <tr style={{ height: topPad }}><td colSpan={6}></td></tr>
                        )}
                        {slice.map((merchant) => (
                          <tr
                            key={merchant.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/clients/merchants/${merchant.id}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-800">{merchant.businessName}</div>
                                <div className="text-sm text-gray-500">{merchant.merchantCode}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${statusColors[merchant.status]} text-gray-900`}>
                                {merchant.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{merchant.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{merchant.totalTransactions?.toLocaleString() || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(merchant.totalVolume || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/clients/merchants/${merchant.id}`); }}>View</Button>
                            </td>
                          </tr>
                        ))}
                        {bottomPad > 0 && (
                          <tr style={{ height: bottomPad }}><td colSpan={6}></td></tr>
                        )}
                      </>
                    );
                  })()
                ) : (
                  Array.isArray(merchants) && merchants.map((merchant) => (
                    <tr
                      key={merchant.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/clients/merchants/${merchant.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{merchant.businessName}</div>
                          <div className="text-sm text-gray-500">{merchant.merchantCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${statusColors[merchant.status]} text-gray-900`}>{merchant.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{merchant.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{merchant.totalTransactions?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(merchant.totalVolume || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/clients/merchants/${merchant.id}`); }}>View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {merchants.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No merchants found</h3>
          <p className="text-gray-600 mb-4">
            Get started by onboarding your first merchant
          </p>
          <Button onClick={() => router.push('/clients/onboard')}>
            Onboard Merchant
          </Button>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
