'use client';

/**
 * Transaction Loading Skeletons and Empty States
 * Beautiful placeholders for better UX
 */
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TransactionCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border shadow-sm p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3 flex-1">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-3 w-full" />
    <div className="flex justify-between pt-3 border-t">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

export const TransactionTableSkeleton: React.FC = () => (
  <div className="border rounded-lg overflow-hidden bg-white">
    <div className="p-4 border-b bg-gray-50">
      <div className="flex justify-between">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
    </div>
    {[...Array(10)].map((_, i) => (
      <div key={i} className="p-4 border-b last:border-b-0">
        <div className="flex justify-between items-center">
          {[...Array(8)].map((_, j) => (
            <Skeleton key={j} className="h-4 w-20" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const TransactionListSkeleton: React.FC<{ viewMode?: 'grid' | 'table' }> = ({
  viewMode = 'grid',
}) => {
  if (viewMode === 'table') {
    return <TransactionTableSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <TransactionCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const TransactionEmptyState: React.FC<{
  onClearFilters?: () => void;
  hasFilters?: boolean;
}> = ({ onClearFilters, hasFilters = false }) => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 mb-6">
      <FileText className="h-10 w-10 text-blue-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      {hasFilters ? 'No transactions found' : 'No transactions yet'}
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your filters or search query to find what you\'re looking for.'
        : 'Transactions will appear here once customers make payments through your platform.'}
    </p>
    {hasFilters && onClearFilters && (
      <Button onClick={onClearFilters} variant="outline" size="lg">
        <Filter className="h-4 w-4 mr-2" />
        Clear All Filters
      </Button>
    )}
  </div>
);

export const TransactionSearchEmptyState: React.FC<{
  searchQuery: string;
  onClear?: () => void;
}> = ({ searchQuery, onClear }) => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 mb-6">
      <Search className="h-10 w-10 text-amber-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      We couldn't find any transactions matching{' '}
      <span className="font-semibold">"{searchQuery}"</span>
    </p>
    {onClear && (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">Try searching for:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Transaction ID or Merchant Transaction ID</li>
          <li>Customer email address</li>
          <li>Customer phone number</li>
        </ul>
        <Button onClick={onClear} variant="outline" className="mt-4">
          Clear Search
        </Button>
      </div>
    )}
  </div>
);

export const TransactionErrorState: React.FC<{
  error: string;
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-pink-50 mb-6">
      <FileText className="h-10 w-10 text-red-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="lg">
        Try Again
      </Button>
    )}
  </div>
);
