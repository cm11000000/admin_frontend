'use client'

import { create } from 'zustand'
import { refundService, type IRefund, type RefundAnalytics } from '@/services/api/RefundApiService'

interface RefundState {
  // Selection & lists
  selectedRefund: IRefund | null
  pendingApprovals: IRefund[]
  pendingApprovalsCount: number

  // Flags
  isLoading: boolean
  isProcessing: boolean
  isLoadingApprovals: boolean
  isLoadingAnalytics: boolean

  // Analytics
  analytics: RefundAnalytics | null

  // Actions
  fetchRefundById: (id: string) => Promise<void>
  approveRefund: (id: string, notes?: string) => Promise<void>
  rejectRefund: (id: string, reason: string, notes?: string) => Promise<void>
  processRefund: (id: string) => Promise<void>
  downloadReceipt: (id: string) => Promise<void>

  fetchPendingApprovals: () => Promise<void>
  createRefund: (req: { transactionId: string; amount: number; type: 'full' | 'partial'; reason: string; customReason?: string; notes?: string; supportingDocuments?: File[] }) => Promise<IRefund>
  bulkCreateRefunds: (rows: any[]) => Promise<void>

  fetchAnalytics: (filter?: { range?: '7d' | '30d' | '90d' | 'custom'; dateFrom?: string; dateTo?: string; clientId?: string }) => Promise<void>
}

export const useRefundStore = create<RefundState>((set, get) => ({
  selectedRefund: null,
  pendingApprovals: [],
  pendingApprovalsCount: 0,
  isLoading: false,
  isProcessing: false,
  isLoadingApprovals: false,
  isLoadingAnalytics: false,
  analytics: null,

  fetchRefundById: async (id) => {
    set({ isLoading: true });
    try {
      const refund = await refundService.getRefundById(id);
      set({ selectedRefund: refund });
    } catch {
      set({ selectedRefund: null });
    } finally {
      set({ isLoading: false });
    }
  },

  approveRefund: async (id, notes) => {
    set({ isProcessing: true });
    try {
      const updated = await refundService.approveRefund(id, notes);
      if (get().selectedRefund?.id === updated.id) set({ selectedRefund: updated });
    } finally {
      set({ isProcessing: false });
    }
  },

  rejectRefund: async (id, reason, notes) => {
    set({ isProcessing: true });
    try {
      const updated = await refundService.rejectRefund(id, reason, notes);
      if (get().selectedRefund?.id === updated.id) set({ selectedRefund: updated });
    } finally {
      set({ isProcessing: false });
    }
  },

  processRefund: async (id) => {
    set({ isProcessing: true });
    try {
      const updated = await refundService.processRefund(id);
      if (get().selectedRefund?.id === updated.id) set({ selectedRefund: updated });
    } finally {
      set({ isProcessing: false });
    }
  },

  downloadReceipt: async (id) => {
    await refundService.downloadReceipt(id);
  },

  fetchPendingApprovals: async () => {
    set({ isLoadingApprovals: true });
    try {
      const resp = await refundService.getPendingApprovals(1, 50);
      set({ pendingApprovals: resp.refunds, pendingApprovalsCount: resp.total });
    } catch {
      set({ pendingApprovals: [], pendingApprovalsCount: 0 });
    } finally {
      set({ isLoadingApprovals: false });
    }
  },

  createRefund: async (req) => {
    // Map to service input
    return refundService.createRefund({
      transactionId: req.transactionId,
      amount: req.amount,
      type: req.type,
      reason: req.reason,
      customReason: req.customReason,
      notes: req.notes,
      supportingDocuments: req.supportingDocuments,
    } as any);
  },

  bulkCreateRefunds: async (rows) => {
    await refundService.bulkCreateRefunds({ refunds: rows } as any);
  },

  fetchAnalytics: async (filter) => {
    set({ isLoadingAnalytics: true });
    try {
      const analytics = await refundService.getAnalytics(filter);
      set({ analytics });
    } catch {
      set({ analytics: null });
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },
}))

export default useRefundStore

