/**
 * Refund Approval Workflow Page
 * Dashboard for pending refund approvals
 */
'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefundApprovalCard } from '@/components/refunds/RefundApprovalCard';
import { useRefundStore } from '@/stores/refundStore';
import { toast } from 'sonner';

export default function RefundApprovalsPage() {
  if (typeof window === 'undefined') return null;
  const {
    pendingApprovals,
    pendingApprovalsCount,
    isLoadingApprovals,
    fetchPendingApprovals,
    approveRefund,
    rejectRefund,
  } = useRefundStore();

  useEffect(() => {
    fetchPendingApprovals();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingApprovals();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (refundId: string, notes?: string) => {
    try {
      await approveRefund(refundId, notes);
      toast.success('Refund approved successfully');
      await fetchPendingApprovals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve refund');
      throw error;
    }
  };

  const handleReject = async (refundId: string, reason: string, notes?: string) => {
    try {
      await rejectRefund(refundId, reason, notes);
      toast.success('Refund rejected successfully');
      await fetchPendingApprovals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject refund');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header - Light theme */}
      <div className="pb-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <h4 className="text-3xl font-bold text-white flex items-center gap-2">
            Pending Approvals
          </h4>
          {pendingApprovalsCount > 0 && (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {pendingApprovalsCount}
            </Badge>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1">Review and approve/reject refund requests</p>
      </div>

      {/* Stats */}
      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Refund requests awaiting your approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{pendingApprovalsCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </div>
            <Button onClick={() => fetchPendingApprovals()} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals List */}
      <div className="space-y-4">
        {isLoadingApprovals ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </>
        ) : pendingApprovals.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">No pending approvals</p>
                <p className="text-sm text-muted-foreground">
                  All refund requests have been processed
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {pendingApprovals.map((refund) => (
              <RefundApprovalCard
                key={refund.id}
                refund={refund}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
