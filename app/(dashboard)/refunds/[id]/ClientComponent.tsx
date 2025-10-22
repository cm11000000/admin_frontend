/**
 * Refund Details Page
 * Comprehensive refund information with timeline and actions
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefundStatusBadge } from '@/components/refunds/RefundStatusBadge';
import { RefundTimeline } from '@/components/refunds/RefundTimeline';
import { useRefundStore } from '@/stores/refundStore';
import { refundService } from '@/services/api/RefundApiService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function RefundDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const refundId = params.id as string;

  const {
    selectedRefund,
    isLoading,
    isProcessing,
    fetchRefundById,
    approveRefund,
    rejectRefund,
    processRefund,
    downloadReceipt,
  } = useRefundStore();

  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    if (refundId) {
      fetchRefundById(refundId);
      loadTimeline();
    }
  }, [refundId]);

  const loadTimeline = async () => {
    setIsLoadingTimeline(true);
    try {
      const timelineData = await refundService.getRefundTimeline(refundId);
      setTimeline(timelineData);
    } catch (error) {
      toast.error('Failed to load timeline');
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveRefund(refundId, approvalNotes || undefined);
      toast.success('Refund approved successfully');
      setShowApproveDialog(false);
      setApprovalNotes('');
      loadTimeline();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve refund');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectRefund(refundId, rejectionReason, rejectionNotes || undefined);
      toast.success('Refund rejected successfully');
      setShowRejectDialog(false);
      setRejectionReason('');
      setRejectionNotes('');
      loadTimeline();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject refund');
    }
  };

  const handleProcess = async () => {
    try {
      await processRefund(refundId);
      toast.success('Refund processing initiated');
      loadTimeline();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process refund');
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      await downloadReceipt(refundId);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download receipt');
    }
  };

  if (isLoading || !selectedRefund) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const canApprove = selectedRefund.status === 'pending';
  const canReject = selectedRefund.status === 'pending';
  const canProcess = selectedRefund.status === 'approved';
  const canDownloadReceipt = selectedRefund.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Page Header - Dark theme with gradient */}
      <div className="pb-4 border-b border-slate-700/50">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 text-slate-300 hover:text-white">
          ← Back
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-3xl font-bold text-white flex items-center gap-2">
              Refund Details
            </h4>
            <p className="text-slate-400 text-sm mt-1">Refund ID: {selectedRefund.refundId}</p>
          </div>
          <RefundStatusBadge status={selectedRefund.status} />
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {canApprove && (
              <Button onClick={() => setShowApproveDialog(true)} disabled={isProcessing}>
                Approve
              </Button>
            )}
            {canReject && (
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
              >
                Reject
              </Button>
            )}
            {canProcess && (
              <Button onClick={handleProcess} disabled={isProcessing}>
                Process Refund
              </Button>
            )}
            {canDownloadReceipt && (
              <Button variant="outline" onClick={handleDownloadReceipt}>
                Download Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Refund Information */}
        <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle>Refund Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refund ID:</span>
                <span className="font-mono font-medium">{selectedRefund.refundId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono font-medium">{selectedRefund.merchantTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-lg font-bold">
                  {selectedRefund.currency} {selectedRefund.refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Amount:</span>
                <span className="font-medium">
                  {selectedRefund.currency} {selectedRefund.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {selectedRefund.type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason:</span>
                <span className="font-medium">{selectedRefund.reason}</span>
              </div>
              {selectedRefund.customReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custom Reason:</span>
                  <span className="font-medium">{selectedRefund.customReason}</span>
                </div>
              )}
              {selectedRefund.gatewayRefundId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gateway Refund ID:</span>
                  <span className="font-mono text-sm">{selectedRefund.gatewayRefundId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {selectedRefund.customerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{selectedRefund.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{selectedRefund.customerEmail}</span>
              </div>
              {selectedRefund.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{selectedRefund.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{selectedRefund.clientName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Information */}
        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested By:</span>
                <span className="font-medium">{selectedRefund.requestedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested At:</span>
                <span className="font-medium">
                  {new Date(selectedRefund.requestedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Ago:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(selectedRefund.requestedAt), { addSuffix: true })}
                </span>
              </div>

              {selectedRefund.approvedBy && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved By:</span>
                    <span className="font-medium">{selectedRefund.approvedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved At:</span>
                    <span className="font-medium">
                      {selectedRefund.approvedAt && new Date(selectedRefund.approvedAt).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              {selectedRefund.rejectedBy && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rejected By:</span>
                    <span className="font-medium">{selectedRefund.rejectedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rejected At:</span>
                    <span className="font-medium">
                      {selectedRefund.rejectedAt && new Date(selectedRefund.rejectedAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedRefund.rejectionReason && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rejection Reason:</span>
                      <span className="font-medium">{selectedRefund.rejectionReason}</span>
                    </div>
                  )}
                </>
              )}

              {selectedRefund.completedAt && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed At:</span>
                    <span className="font-medium">
                      {new Date(selectedRefund.completedAt).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Refund Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Refund Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refund Amount:</span>
                <span className="font-medium">
                  {selectedRefund.currency} {selectedRefund.breakdown.refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Fee:</span>
                <span className="font-medium">
                  {selectedRefund.currency} {selectedRefund.breakdown.processingFee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gateway Charges:</span>
                <span className="font-medium">
                  {selectedRefund.currency} {selectedRefund.breakdown.gatewayCharges.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Net Amount:</span>
                <span className="text-lg font-bold">
                  {selectedRefund.currency} {selectedRefund.breakdown.netAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {selectedRefund.notes && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedRefund.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Supporting Documents */}
      {selectedRefund.supportingDocuments && selectedRefund.supportingDocuments.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedRefund.supportingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">{doc.filename}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {isLoadingTimeline ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <RefundTimeline timeline={timeline} />
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to approve this refund request for{' '}
              <span className="font-bold">
                {selectedRefund.currency} {selectedRefund.refundAmount.toFixed(2)}
              </span>
              ?
            </p>
            <div className="space-y-2">
              <Label htmlFor="approval-notes">Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes for approval..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Approve Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this refund request.
            </p>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Input
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rejection-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="rejection-notes"
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Add any additional information..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? 'Processing...' : 'Reject Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

