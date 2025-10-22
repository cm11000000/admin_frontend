import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Merchant {
  id: string
  merchantId: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  kycStatus: 'pending' | 'verified' | 'rejected' | 'incomplete'
  businessType: string
  registrationNumber: string
  gstNumber?: string
  panNumber: string
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    country: string
  }
  bankDetails: {
    accountName: string
    accountNumber: string
    ifscCode: string
    bankName: string
    branchName?: string
  }
  onboardingDate: string
  lastActivityDate: string
  transactionVolume: number
  totalTransactions: number
  createdAt: string
  updatedAt: string
}

interface MerchantFilters {
  status?: string
  kycStatus?: string
  businessType?: string
  searchTerm?: string
  dateRange?: {
    from: string
    to: string
  }
}

interface MerchantState {
  merchants: Merchant[]
  selectedMerchant: Merchant | null
  filters: MerchantFilters
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number

  // Actions
  setMerchants: (merchants: Merchant[]) => void
  setSelectedMerchant: (merchant: Merchant | null) => void
  setFilters: (filters: MerchantFilters) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setTotalCount: (count: number) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  updateMerchant: (id: string, updates: Partial<Merchant>) => void
  addMerchant: (merchant: Merchant) => void
  removeMerchant: (id: string) => void
  clearFilters: () => void
  reset: () => void
}

const initialState = {
  merchants: [],
  selectedMerchant: null,
  filters: {},
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}

export const useMerchantStore = create<MerchantState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setMerchants: (merchants) => set({ merchants }),

        setSelectedMerchant: (merchant) => set({ selectedMerchant: merchant }),

        setFilters: (filters) => set({ filters }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setTotalCount: (totalCount) => set({ totalCount }),

        setCurrentPage: (currentPage) => set({ currentPage }),

        setPageSize: (pageSize) => set({ pageSize }),

        updateMerchant: (id, updates) =>
          set((state) => ({
            merchants: state.merchants.map((merchant) =>
              merchant.id === id ? { ...merchant, ...updates } : merchant
            ),
            selectedMerchant:
              state.selectedMerchant?.id === id
                ? { ...state.selectedMerchant, ...updates }
                : state.selectedMerchant,
          })),

        addMerchant: (merchant) =>
          set((state) => ({
            merchants: [merchant, ...state.merchants],
            totalCount: state.totalCount + 1,
          })),

        removeMerchant: (id) =>
          set((state) => ({
            merchants: state.merchants.filter((merchant) => merchant.id !== id),
            totalCount: state.totalCount - 1,
            selectedMerchant:
              state.selectedMerchant?.id === id ? null : state.selectedMerchant,
          })),

        clearFilters: () => set({ filters: {}, currentPage: 1 }),

        reset: () => set(initialState),
      }),
      {
        name: 'merchant-store',
        partialize: (state) => ({
          filters: state.filters,
          pageSize: state.pageSize,
        }),
      }
    )
  )
)