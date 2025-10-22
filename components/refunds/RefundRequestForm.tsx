/**
 * RefundRequestForm Component
 * Form for creating refund requests with validation
 */
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { RefundType } from '@/services/api/RefundApiService';

interface RefundRequestFormProps {
  transactionId: string;
  maxAmount: number;
  onSubmit: (data: {
    amount: number;
    type: RefundType;
    reason: string;
    customReason?: string;
    notes?: string;
    supportingDocuments?: File[];
  }) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

const REFUND_REASONS = [
  { value: 'duplicate_transaction', label: 'Duplicate Transaction' },
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'defective_product', label: 'Defective Product' },
  { value: 'cancelled_order', label: 'Cancelled Order' },
  { value: 'merchant_error', label: 'Merchant Error' },
  { value: 'fraudulent_transaction', label: 'Fraudulent Transaction' },
  { value: 'service_not_provided', label: 'Service Not Provided' },
  { value: 'other', label: 'Other (Specify)' },
];

export function RefundRequestForm({
  transactionId,
  maxAmount,
  onSubmit,
  onCancel,
  className,
}: RefundRequestFormProps) {
  const [type, setType] = useState<RefundType>('full');
  const [amount, setAmount] = useState<string>(maxAmount.toString());
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setAmount('');
    } else if (numValue > maxAmount) {
      setAmount(maxAmount.toString());
    } else {
      setAmount(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles([...files, ...newFiles]);
    }
  }, [files]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason) {
      setError('Please select a refund reason');
      return;
    }

    if (reason === 'other' && !customReason.trim()) {
      setError('Please provide a custom reason');
      return;
    }

    const refundAmount = parseFloat(amount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }

    if (refundAmount > maxAmount) {
      setError(`Refund amount cannot exceed ${maxAmount}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        amount: refundAmount,
        type,
        reason,
        customReason: reason === 'other' ? customReason : undefined,
        notes: notes.trim() || undefined,
        supportingDocuments: files.length > 0 ? files : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit refund request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Refund Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          {/* Refund Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Refund Type</Label>
            <Select value={type} onValueChange={(value) => {
              setType(value as RefundType);
              if (value === 'full') {
                setAmount(maxAmount.toString());
              }
            }}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select refund type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Refund</SelectItem>
                <SelectItem value="partial">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Refund Amount <span className="text-muted-foreground">(Max: {maxAmount})</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={maxAmount}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              disabled={type === 'full'}
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refund</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {reason === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Custom Reason</Label>
              <Input
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please specify the reason"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information..."
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Supporting Documents (Optional)</Label>
            <div
              className={cn(
                'relative rounded-lg border-2 border-dashed p-6 transition-colors',
                dragActive ? 'border-primary bg-primary/5' : 'border-border',
                'hover:border-primary hover:bg-primary/5'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here, or click to select
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supported formats: Images, PDF
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-muted p-2"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
