'use client'

import { create } from 'zustand'
import { transactionService, type TransactionDetails } from '@/services/api/TransactionApiService'

interface TransactionState {
  timeline: TransactionDetails['timeline']
  webhookLogs: any[]
  retryAttempts: any[]

  fetchTimeline: (id: string) => Promise<void>
  fetchWebhookLogs: (id: string) => Promise<void>
  fetchRetryHistory: (id: string) => Promise<void>

  updateTransaction: (id: string, change: {
    transactionId: string;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
    updatedBy: string;
    updatedAt: string;
    requiresApproval?: boolean;
  }) => Promise<void>
}

export const useTransactionStore = create<TransactionState>((set) => ({
  timeline: [],
  webhookLogs: [],
  retryAttempts: [],

  fetchTimeline: async (id: string) => {
    try {
      const tl = await transactionService.getTransactionTimeline(id);
      set({ timeline: tl || [] });
    } catch {
      set({ timeline: [] });
    }
  },

  fetchWebhookLogs: async (id: string) => {
    try {
      const logs = await transactionService.getWebhookLogs(id);
      set({ webhookLogs: logs || [] });
    } catch {
      set({ webhookLogs: [] });
    }
  },

  fetchRetryHistory: async (id: string) => {
    try {
      const rows = await transactionService.getRetryHistory(id);
      set({ retryAttempts: rows || [] });
    } catch {
      set({ retryAttempts: [] });
    }
  },

  updateTransaction: async (_id, _change) => {
    // Placeholder for admin update workflow; backend endpoint TBD
    await new Promise((r) => setTimeout(r, 200));
  },
}))

export default useTransactionStore

