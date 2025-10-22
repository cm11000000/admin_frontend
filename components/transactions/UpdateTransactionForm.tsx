'use client';

import React, { useState } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import { Transaction } from '@/services/api/TransactionApiService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Save } from 'lucide-react';
import { toast } from '@/lib/toast';

interface UpdateTransactionFormProps {
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UpdateTransactionForm: React.FC<UpdateTransactionFormProps> = ({
  transaction,
  open,
  onClose,
  onSuccess,
}) => {
  const { updateTransaction } = useTransactionStore();

  const [field, setField] = useState<string>('status');
  const [newValue, setNewValue] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editableFields = [
    { value: 'status', label: 'Status', critical: true },
    { value: 'customerEmail', label: 'Customer Email', critical: false },
    { value: 'customerPhone', label: 'Customer Phone', critical: false },
    { value: 'description', label: 'Description', critical: false },
    { value: 'metadata', label: 'Metadata', critical: false },
  ];

  const statusOptions = ['success', 'pending', 'failed', 'cancelled', 'refunded', 'disputed'];

  const getCurrentValue = () => {
    switch (field) {
      case 'status':
        return transaction.status;
      case 'customerEmail':
        return transaction.customerEmail;
      case 'customerPhone':
        return transaction.customerPhone || '';
      case 'description':
        return transaction.description;
      case 'metadata':
        return JSON.stringify(transaction.metadata || {}, null, 2);
      default:
        return '';
    }
  };

  const isCriticalField = editableFields.find(f => f.value === field)?.critical || false;

  const handleSubmit = async () => {
    if (!newValue.trim() || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTransaction(transaction.id, {
        transactionId: transaction.id,
        field,
        oldValue: getCurrentValue(),
        newValue,
        reason,
        updatedBy: 'current-user',
        updatedAt: new Date().toISOString(),
        requiresApproval: isCriticalField,
      });

      toast.success(
        isCriticalField
          ? 'Update request submitted for approval'
          : 'Transaction updated successfully'
      );
      onSuccess?.();
      handleClose();
    } catch (error) {
      toast.error('Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setField('status');
    setNewValue('');
    setReason('');
    onClose();
  };

  const renderFieldInput = () => {
    switch (field) {
      case 'status':
        return (
          <Select value={newValue} onValueChange={setNewValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  <span className="capitalize">{status}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'metadata':
        return (
          <Textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Enter JSON metadata"
            rows={6}
            className="font-mono text-sm"
          />
        );
      case 'description':
        return (
          <Textarea
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Enter new description"
            rows={4}
          />
        );
      default:
        return (
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Enter new ${field}`}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Transaction</DialogTitle>
          <DialogDescription>
            Modify transaction details. Critical changes require approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Transaction Info */}
          <div className="bg-gray-50 border rounded-md p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Transaction ID:</span>
                <p className="font-mono font-medium">{transaction.id}</p>
              </div>
              <div>
                <span className="text-gray-600">Current Status:</span>
                <p className="capitalize font-medium">{transaction.status}</p>
              </div>
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <Label htmlFor="field">Field to Update</Label>
            <Select value={field} onValueChange={(value) => {
              setField(value);
              setNewValue('');
            }}>
              <SelectTrigger id="field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editableFields.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    <div className="flex items-center gap-2">
                      {f.label}
                      {f.critical && (
                        <Badge variant="destructive" className="text-xs">
                          Requires Approval
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Value */}
          <div>
            <Label>Current Value</Label>
            <div className="bg-gray-100 border rounded-md p-3 text-sm">
              <pre className="whitespace-pre-wrap break-all">
                {getCurrentValue() || '(empty)'}
              </pre>
            </div>
          </div>

          {/* New Value */}
          <div>
            <Label htmlFor="newValue">New Value *</Label>
            {renderFieldInput()}
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason for Change *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this change is necessary..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be recorded in the audit log
            </p>
          </div>

          {/* Warning for Critical Changes */}
          {isCriticalField && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900">Approval Required</p>
                <p className="text-amber-700">
                  This is a critical field. Your update will be submitted for approval before
                  being applied.
                </p>
              </div>
            </div>
          )}

          {/* Comparison */}
          {newValue && (
            <div className="border rounded-md p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Preview Changes</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Old Value</p>
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                    <pre className="whitespace-pre-wrap break-all text-red-700">
                      {getCurrentValue() || '(empty)'}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">New Value</p>
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                    <pre className="whitespace-pre-wrap break-all text-green-700">
                      {newValue}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newValue.trim() || !reason.trim() || isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : isCriticalField ? 'Submit for Approval' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
