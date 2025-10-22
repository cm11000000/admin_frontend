import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import AnalyticsApiService from '@/services/api/AnalyticsApiService'
import ReportApiService from '@/services/api/ReportApiService'

export interface Chargeback {
  id: string
  merchantId: string
  merchantName: string
  transactionId: string
  amount: number
  reason: string
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'resolved'
  requestDate: string
  responseDeadline: string
  documents: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

interface ChargebackFilters {
  status?: string
  merchantId?: string
  dateRange?: {
    from: string
    to: string
  }
  searchTerm?: string
}

interface ChargebackState {
  chargebacks: Chargeback[]
  selectedChargeback: Chargeback | null
  filters: ChargebackFilters
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number

  // Analytics (lightweight, used by /chargebacks/analytics)
  analytics: any | null
  fetchAnalytics: (
    fromDate?: string,
    endDate?: string,
    clientCode?: string,
    range?: '7d' | '30d' | '90d' | '1y'
  ) => Promise<void>

  // Actions
  setChargebacks: (chargebacks: Chargeback[]) => void
  setSelectedChargeback: (chargeback: Chargeback | null) => void
  setFilters: (filters: ChargebackFilters) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setTotalCount: (count: number) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  updateChargeback: (id: string, updates: Partial<Chargeback>) => void
  addChargeback: (chargeback: Chargeback) => void
  removeChargeback: (id: string) => void
  clearFilters: () => void
  reset: () => void
}

const initialState = {
  chargebacks: [],
  selectedChargeback: null,
  filters: {},
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  analytics: null,
}

export const useChargebackStore = create<ChargebackState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setChargebacks: (chargebacks) => set({ chargebacks }),

        setSelectedChargeback: (chargeback) => set({ selectedChargeback: chargeback }),

        setFilters: (filters) => set({ filters }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        setTotalCount: (totalCount) => set({ totalCount }),

        setCurrentPage: (currentPage) => set({ currentPage }),

        setPageSize: (pageSize) => set({ pageSize }),

        updateChargeback: (id, updates) =>
          set((state) => ({
            chargebacks: state.chargebacks.map((cb) =>
              cb.id === id ? { ...cb, ...updates } : cb
            ),
            selectedChargeback:
              state.selectedChargeback?.id === id
                ? { ...state.selectedChargeback, ...updates }
                : state.selectedChargeback,
          })),

        addChargeback: (chargeback) =>
          set((state) => ({
            chargebacks: [chargeback, ...state.chargebacks],
            totalCount: state.totalCount + 1,
          })),

        removeChargeback: (id) =>
          set((state) => ({
            chargebacks: state.chargebacks.filter((cb) => cb.id !== id),
            totalCount: state.totalCount - 1,
            selectedChargeback:
              state.selectedChargeback?.id === id ? null : state.selectedChargeback,
          })),

        clearFilters: () => set({ filters: {}, currentPage: 1 }),

        reset: () => set(initialState),

        // Analytics fetcher: aggregates data from chargeback history into the shape used by the UI
        fetchAnalytics: async (fromDate?: string, endDate?: string, clientCode?: string, range: '7d' | '30d' | '90d' | '1y' = '30d') => {
          set({ isLoading: true })
          try {
            // derive date range if not provided
            let from = fromDate
            let to = endDate
            const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
            if (!from || !to) {
              const now = new Date()
              to = fmt(now)
              const start = new Date(now)
              if (range === '7d') start.setDate(start.getDate() - 6)
              else if (range === '30d') start.setDate(start.getDate() - 29)
              else if (range === '90d') start.setDate(start.getDate() - 89)
              else if (range === '1y') start.setFullYear(start.getFullYear() - 1)
              from = fmt(start)
            }

            const code = clientCode && clientCode.trim() ? clientCode.trim() : 'ALL'

            // Fetch chargeback transactions
            const resp = await ReportApiService.getChargebackTxnHistory({
              clientCode: code,
              fromDate: from!,
              endDate: to!,
              noOfClient: 0,
              rpttype: 1,
            })
            const rows: any[] = Array.isArray(resp?.results)
              ? resp.results
              : Array.isArray(resp)
                ? resp
                : (resp?.results || [])

            // Aggregate metrics
            let totalChargebackAmount = 0
            let totalRecoveredAmount = 0
            let won = 0
            let lost = 0
            const reasonCounts: Record<string, number> = {}
            const gatewayMap: Record<string, { chargebacks: number, won: number, lost: number, amount: number }> = {}
            const monthMap: Record<string, { total: number, won: number, lost: number, amount: number }> = {}
            const statusDistribution: Record<string, number> = {}
            let totalResponseHours = 0
            let responseSamples = 0

            for (const r of rows) {
              const amount = Number(r.charge_back_amount ?? r.paid_amount ?? 0) || 0
              totalChargebackAmount += amount
              const status = String(r.charge_back_status || r.status || '').toLowerCase()
              const reason = String(r.charge_back_remarks || r.reason || r.status || 'Unknown').trim() || 'Unknown'
              reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
              const gateway = String(r.payment_mode || r.pg_pay_mode || 'Unknown').trim() || 'Unknown'
              gatewayMap[gateway] = gatewayMap[gateway] || { chargebacks: 0, won: 0, lost: 0, amount: 0 }
              gatewayMap[gateway].chargebacks += 1
              gatewayMap[gateway].amount += amount

              // Win/Loss heuristics
              const isWon = status.includes('won') || status.includes('success') || status.includes('accepted')
              const isLost = status.includes('lost') || status.includes('failed') || status.includes('rejected')
              if (isWon) { won += 1; totalRecoveredAmount += amount; gatewayMap[gateway].won += 1 }
              else if (isLost) { lost += 1; gatewayMap[gateway].lost += 1 }

              // Monthly
              const dtStr: string = String(r.charge_back_date || r.trans_date || '').slice(0, 10)
              if (dtStr) {
                const d = new Date(dtStr)
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
                monthMap[key] = monthMap[key] || { total: 0, won: 0, lost: 0, amount: 0 }
                monthMap[key].total += 1
                monthMap[key].amount += amount
                if (isWon) monthMap[key].won += 1
                if (isLost) monthMap[key].lost += 1
              }

              // Status distribution
              const statusKey = String(r.charge_back_status || r.status || 'Unknown')
              statusDistribution[statusKey] = (statusDistribution[statusKey] || 0) + 1

              // Response time heuristic (hours) between charge_back_date and credit date to merchant
              const startStr = String(r.charge_back_date || '').slice(0, 19)
              const endStr = String(r.charge_back_credit_date_to_merchant || r.cb_credit_date_txn_reject || '').slice(0, 19)
              if (startStr && endStr) {
                const start = new Date(startStr)
                const end = new Date(endStr)
                const diffHrs = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                if (Number.isFinite(diffHrs)) { totalResponseHours += diffHrs; responseSamples += 1 }
              }
            }

            const winLossTotal = won + lost
            const winPct = winLossTotal > 0 ? (won / winLossTotal) * 100 : 0
            // Interpret "chargeback rate" as win percentage over decided cases for this dashboard
            const chargebackRate = winPct

            const topReasonCodes = Object.entries(reasonCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([code, count]) => ({
                code,
                count,
                percentage: Number(((count / rows.length) * 100).toFixed(2)),
                description: code,
              }))

            const gatewayStats = Object.entries(gatewayMap).map(([gateway, g]) => ({
              gateway,
              chargebacks: g.chargebacks,
              won: g.won,
              lost: g.lost,
              amount: g.amount,
            }))

            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            const monthlyTrend = Object.entries(monthMap)
              .sort((a,b) => a[0].localeCompare(b[0]))
              .map(([ym, m]) => {
                const [yy, mm] = ym.split('-')
                const label = `${monthNames[Number(mm)-1]} ${yy}`
                return {
                  month: label,
                  totalChargebacks: m.total,
                  wonChargebacks: m.won,
                  lostChargebacks: m.lost,
                  amount: m.amount,
                }
              })

            const averageResponseTime = responseSamples > 0 ? Number((totalResponseHours / responseSamples).toFixed(1)) : 0

            const analytics = {
              totalChargebackAmount,
              totalRecoveredAmount,
              winLossRatio: { percentage: Number(winPct.toFixed(2)), won, lost },
              chargebackRate: Number(chargebackRate.toFixed(2)),
              topReasonCodes,
              gatewayStats,
              monthlyTrend,
              statusDistribution,
              averageResponseTime,
            }

            set({ analytics })
          } catch (e) {
            set({ analytics: null })
          } finally {
            set({ isLoading: false })
          }
        },
      }),
      {
        name: 'chargeback-store',
        partialize: (state) => ({
          filters: state.filters,
          pageSize: state.pageSize,
        }),
      }
    )
  )
)
