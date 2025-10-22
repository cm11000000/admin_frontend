import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface RateMapping {
  id: string
  merchantId: string
  merchantName: string
  paymentMethod: string
  mdr: number // Merchant Discount Rate
  fixedFee: number
  minAmount: number
  maxAmount: number
  effectiveFrom: string
  effectiveTo?: string
  isActive: boolean
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

interface RateMappingFilters {
  merchantId?: string
  paymentMethod?: string
  isActive?: boolean
  searchTerm?: string
}

interface RateMappingState {
  rateMappings: RateMapping[]
  selectedRateMapping: RateMapping | null
  filters: RateMappingFilters
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number

  // Actions
  setRateMappings: (rateMappings: RateMapping[]) => void
  setSelectedRateMapping: (rateMapping: RateMapping | null) => void
  setFilters: (filters: RateMappingFilters) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setTotalCount: (count: number) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  updateRateMapping: (id: string, updates: Partial<RateMapping>) => void
  addRateMapping: (rateMapping: RateMapping) => void
  removeRateMapping: (id: string) => void
  clearFilters: () => void
  reset: () => void
}

const initialState = {
  rateMappings: [],
  selectedRateMapping: null,
  filters: {},
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}

export const useRateMappingStore = create<RateMappingState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setRateMappings: (rateMappings) => set({ rateMappings }),

        setSelectedRateMapping: (rateMapping) => set({ selectedRateMapping: rateMapping }),

        setFilters: (filters) => set({ filters }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setTotalCount: (totalCount) => set({ totalCount }),

        setCurrentPage: (currentPage) => set({ currentPage }),

        setPageSize: (pageSize) => set({ pageSize }),

        updateRateMapping: (id, updates) =>
          set((state) => ({
            rateMappings: state.rateMappings.map((rm) =>
              rm.id === id ? { ...rm, ...updates } : rm
            ),
            selectedRateMapping:
              state.selectedRateMapping?.id === id
                ? { ...state.selectedRateMapping, ...updates }
                : state.selectedRateMapping,
          })),

        addRateMapping: (rateMapping) =>
          set((state) => ({
            rateMappings: [rateMapping, ...state.rateMappings],
            totalCount: state.totalCount + 1,
          })),

        removeRateMapping: (id) =>
          set((state) => ({
            rateMappings: state.rateMappings.filter((rm) => rm.id !== id),
            totalCount: state.totalCount - 1,
            selectedRateMapping:
              state.selectedRateMapping?.id === id ? null : state.selectedRateMapping,
          })),

        clearFilters: () => set({ filters: {}, currentPage: 1 }),

        reset: () => set(initialState),
      }),
      {
        name: 'rate-mapping-store',
        partialize: (state) => ({
          filters: state.filters,
          pageSize: state.pageSize,
        }),
      }
    )
  )
)