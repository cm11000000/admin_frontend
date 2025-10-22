/**
 * Refund Request Page
 * Create new refund requests with transaction validation
 */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefundRequestForm } from '@/components/refunds/RefundRequestForm';
import { useRefundStore } from '@/stores/refundStore';
import { refundService } from '@/services/api/RefundApiService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateRefundPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  const { createRefund } = useRefundStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a transaction ID');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setTransactionData(null);

    try {
      const result = await refundService.searchTransaction(searchQuery.trim());

      if (!result.eligibility.eligible) {
        setSearchError(result.eligibility.reason || 'Transaction is not eligible for refund');
        return;
      }

      setTransactionData(result);
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : 'Transaction not found or ineligible for refund'
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const refund = await createRefund({
        transactionId: transactionData.transaction.id,
        ...data,
      });

      toast.success('Refund request created successfully');
      router.push(`/refunds/${refund.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create refund request');
      throw error;
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setTransactionData(null);
    setSearchError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Light theme */}
      <div className="pb-4 border-b border-gray-700/50">
        <h4 className="text-3xl font-bold text-white flex items-center gap-2">
          Create Refund Request
        </h4>
        <p className="text-gray-400 text-sm mt-1">Search for a transaction and create a refund request</p>
      </div>

      {/* Transaction Search */}
      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
        <CardHeader>
          <CardTitle>Search Transaction</CardTitle>
          <CardDescription>
            Enter transaction ID or merchant transaction ID to search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchError && (
            <Alert variant="destructive">
              <p className="text-sm">{searchError}</p>
            </Alert>
          )}

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Transaction ID</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter transaction ID..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                disabled={isSearching || !!transactionData}
              />
            </div>
            <div className="flex items-end">
              {transactionData ? (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              ) : (
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              )}
            </div>
          </div>

          {isSearching && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {transactionData && (
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Transaction Details</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono font-medium">
                    {transactionData.transaction.merchantTransactionId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">
                    INR {transactionData.transaction.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Email:</span>
                  <span className="font-medium">{transactionData.transaction.customerEmail}</span>
                </div>
                {transactionData.transaction.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer Phone:</span>
                    <span className="font-medium">
                      {transactionData.transaction.customerPhone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{transactionData.transaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">
                    {transactionData.transaction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Refunded:</span>
                  <span className="font-medium">
                    INR {transactionData.eligibility.alreadyRefunded.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Refund Amount:</span>
                  <span className="font-bold text-green-600">
                    INR {transactionData.eligibility.maxRefundAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Request Form */}
      {transactionData && (
        <RefundRequestForm
          transactionId={transactionData.transaction.id}
          maxAmount={transactionData.eligibility.maxRefundAmount}
          onSubmit={handleSubmit}
          onCancel={handleReset}
        />
      )}
    </div>
  );
}
