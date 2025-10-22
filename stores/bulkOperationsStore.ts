import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface BulkExport {
  id: string
  name: string
  type: 'transactions' | 'settlements' | 'refunds' | 'merchants' | 'chargebacks' | 'custom'
  format: 'csv' | 'excel' | 'pdf' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  filters: Record<string, any>
  recordCount: number
  fileSize?: number
  downloadUrl?: string
  error?: string
  scheduledAt?: string
  createdBy: string
  createdAt: string
  completedAt?: string
}

export interface ScheduledExport {
  id: string
  name: string
  type: BulkExport['type']
  format: BulkExport['format']
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    dayOfWeek?: number // 0-6 for weekly
    dayOfMonth?: number // 1-31 for monthly
  }
  filters: Record<string, any>
  recipients: string[]
  isActive: boolean
  lastRunAt?: string
  nextRunAt: string
  createdBy: string
  createdAt: string
}

interface BulkOperationsState {
  exports: BulkExport[]
  scheduledExports: ScheduledExport[]
  currentExport: BulkExport | null
  selectedSchedule: ScheduledExport | null
  isLoading: boolean
  error: string | null

  // Actions
  setExports: (exports: BulkExport[]) => void
  setScheduledExports: (scheduledExports: ScheduledExport[]) => void
  setCurrentExport: (currentExport: BulkExport | null) => void
  setSelectedSchedule: (schedule: ScheduledExport | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  addExport: (export_: BulkExport) => void
  updateExport: (id: string, updates: Partial<BulkExport>) => void
  removeExport: (id: string) => void
  addScheduledExport: (schedule: ScheduledExport) => void
  updateScheduledExport: (id: string, updates: Partial<ScheduledExport>) => void
  removeScheduledExport: (id: string) => void
  reset: () => void
}

const initialState = {
  exports: [],
  scheduledExports: [],
  currentExport: null,
  selectedSchedule: null,
  isLoading: false,
  error: null,
}

export const useBulkOperationsStore = create<BulkOperationsState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setExports: (exports) => set({ exports }),

        setScheduledExports: (scheduledExports) => set({ scheduledExports }),

        setCurrentExport: (currentExport) => set({ currentExport }),

        setSelectedSchedule: (selectedSchedule) => set({ selectedSchedule }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        addExport: (export_) =>
          set((state) => ({
            exports: [export_, ...state.exports],
          })),

        updateExport: (id, updates) =>
          set((state) => ({
            exports: state.exports.map((exp) =>
              exp.id === id ? { ...exp, ...updates } : exp
            ),
            currentExport:
              state.currentExport?.id === id
                ? { ...state.currentExport, ...updates }
                : state.currentExport,
          })),

        removeExport: (id) =>
          set((state) => ({
            exports: state.exports.filter((exp) => exp.id !== id),
            currentExport:
              state.currentExport?.id === id ? null : state.currentExport,
          })),

        addScheduledExport: (schedule) =>
          set((state) => ({
            scheduledExports: [schedule, ...state.scheduledExports],
          })),

        updateScheduledExport: (id, updates) =>
          set((state) => ({
            scheduledExports: state.scheduledExports.map((sch) =>
              sch.id === id ? { ...sch, ...updates } : sch
            ),
            selectedSchedule:
              state.selectedSchedule?.id === id
                ? { ...state.selectedSchedule, ...updates }
                : state.selectedSchedule,
          })),

        removeScheduledExport: (id) =>
          set((state) => ({
            scheduledExports: state.scheduledExports.filter((sch) => sch.id !== id),
            selectedSchedule:
              state.selectedSchedule?.id === id ? null : state.selectedSchedule,
          })),

        reset: () => set(initialState),
      }),
      {
        name: 'bulk-operations-store',
        partialize: (state) => ({
          exports: state.exports.filter(exp => exp.status === 'completed').slice(0, 10),
          scheduledExports: state.scheduledExports,
        }),
      }
    )
  )
)