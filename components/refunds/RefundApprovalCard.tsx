/**
 * RefundApprovalCard Component
 * Card for approving/rejecting refund requests
 */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { IRefund } from '@/services/api/RefundApiService';
import { RefundStatusBadge } from './RefundStatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface RefundApprovalCardProps {
  refund: IRefund;
  onApprove: (refundId: string, notes?: string) => Promise<void>;
  onReject: (refundId: string, reason: string, notes?: string) => Promise<void>;
  showActions?: boolean;
  className?: string;
}

export function RefundApprovalCard({
  refund,
  onApprove,
  onReject,
  showActions = true,
  className,
}: RefundApprovalCardProps) {
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(refund.id, notes || undefined);
      setIsApproveOpen(false);
      setNotes('');
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      await onReject(refund.id, rejectionReason, notes || undefined);
      setIsRejectOpen(false);
      setNotes('');
      setRejectionReason('');
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                Refund ID: {refund.refundId}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Transaction: {refund.merchantTransactionId}
              </p>
            </div>
            <RefundStatusBadge status={refund.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Customer Details</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{refund.customerEmail}</span>
              </div>
              {refund.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{refund.customerPhone}</span>
                </div>
              )}
              {refund.customerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{refund.customerName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Refund Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Refund Details</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-lg">
                  {refund.currency} {refund.refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{refund.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason:</span>
                <span className="font-medium">{refund.reason}</span>
              </div>
              {refund.customReason && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custom Reason:</span>
                  <span className="font-medium">{refund.customReason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Request Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Request Information</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested By:</span>
                <span className="font-medium">{refund.requestedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested At:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(refund.requestedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {refund.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notes</h4>
              <p className="text-sm text-muted-foreground">{refund.notes}</p>
            </div>
          )}

          {/* Supporting Documents */}
          {refund.supportingDocuments && refund.supportingDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Supporting Documents</h4>
              <div className="space-y-1">
                {refund.supportingDocuments.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    {doc.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {showActions && refund.status === 'pending' && (
          <CardFooter className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => setIsApproveOpen(true)}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setIsRejectOpen(true)}
            >
              Reject
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to approve this refund request for{' '}
              <span className="font-bold">
                {refund.currency} {refund.refundAmount.toFixed(2)}
              </span>
              ?
            </p>
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Notes (Optional)</Label>
              <Textarea
                id="approve-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for approval..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveOpen(false)}
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
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
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
              <Label htmlFor="reject-notes">Additional Notes (Optional)</Label>
              <Textarea
                id="reject-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectOpen(false)}
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
    </>
  );
}
