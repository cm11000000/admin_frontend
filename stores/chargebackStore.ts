import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import AnalyticsApiService from '@/services/api/AnalyticsApiService'
import ReportApiService from '@/services/api/ReportApiService'
import { ChargebackStatus } from '@/types/chargeback'

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
  hasNext?: boolean
  hasPrev?: boolean

  // UI selections + stats used by pages
  selectedChargebacks?: Set<string>
  stats?: any

  // Workflow board columns
  workflowColumns?: any[]

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

  // Listing and filters (List page expectations)
  fetchChargebacks: (force?: boolean) => Promise<void>
  setFilter: (key: string, value: any) => void
  applyFilters: () => Promise<void>
  setPage: (page: number) => Promise<void>
  selectChargeback: (id: string) => void
  deselectChargeback: (id: string) => void
  selectAllChargebacks: () => void
  clearSelection: () => void
  exportChargebacks: (format: 'csv' | 'xlsx' | 'pdf') => Promise<void>
  bulkAssign: (ids: string[], assignTo: string) => Promise<void>
  getAppliedFiltersCount: () => number

  // Workflow
  fetchWorkflowBoard: () => Promise<void>
  moveToStatus: (id: string, status: ChargebackStatus) => Promise<void>

  // Details (safe stubs)
  fetchChargebackById: (id: string) => Promise<void>
  uploadEvidence: (id: string, type: string, description: string, file: File) => Promise<void>
  submitEvidence: (id: string, evidenceIds: string[], notes?: string) => Promise<void>
  deleteEvidence: (id: string, evidenceId: string) => Promise<void>
  downloadAllEvidence: (id: string) => Promise<void>
  acceptChargeback: (id: string, reason: string, notes?: string) => Promise<void>
  contestChargeback: (id: string, reason: string, notes?: string) => Promise<void>
  closeChargeback: (id: string, notes?: string) => Promise<void>
  addNote: (id: string, content: string, isInternal?: boolean) => Promise<void>
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
      (set, get) => ({
        ...initialState,
        hasNext: false,
        hasPrev: false,
        selectedChargebacks: new Set<string>(),
        stats: { totalAmount: 0, wonCount: 0, lostCount: 0, newCount: 0, underReviewCount: 0, evidenceSubmittedCount: 0, overdueCount: 0 },
        workflowColumns: [],

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

        // ========= Chargebacks List (implementation for list page) =========
        fetchChargebacks: async (_force?: boolean) => {
          const state = get();
          set({ isLoading: true, error: null });
          try {
            const f: any = state.filters || {};
            const page = state.currentPage || 1;
            const length = state.pageSize || 10;

            // Derive date window (default: today)
            const today = new Date();
            const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const fromDate = f.dateFrom || fmt(today);
            const endDate = f.dateTo || fmt(today);
            const clientCode = 'ALL';

            const resp = await ReportApiService.getChargebackTxnHistory({
              clientCode,
              fromDate,
              endDate,
              noOfClient: 0,
              rpttype: 1,
              page,
              length,
              search: f.search || undefined,
            });

            const results: any[] = Array.isArray(resp?.results)
              ? resp.results
              : Array.isArray(resp)
                ? resp
                : (resp?.results || []);

            const mapped = results.map((r: any, idx: number) => {
              const id = String(r.txn_id || r.client_txn_id || `${Date.now()}_${idx}`);
              const amount = Number(r.charge_back_amount ?? r.paid_amount ?? 0) || 0;
              const currency = 'INR';
              const statusRaw = String(r.charge_back_status || r.status || '').toLowerCase();
              const status: ChargebackStatus = statusRaw.includes('won') || statusRaw.includes('success') ? 'won'
                : statusRaw.includes('lost') || statusRaw.includes('failed') ? 'lost'
                : statusRaw.includes('evidence') ? 'evidence_submitted'
                : statusRaw.includes('review') ? 'under_review'
                : statusRaw.includes('closed') ? 'closed'
                : 'new';
              const reason = String(r.charge_back_remarks || r.reason || '').trim() || 'N/A';
              const fmtDate = (s: any) => String(s || '').slice(0, 10);
              const due = fmtDate(r.cb_credit_date_txn_reject || r.prearb_date || r.charge_back_date);
              const dueDate = due || fmt(today);
              const dDue = new Date(dueDate);
              const days = Math.ceil((dDue.getTime() - today.getTime()) / (1000*60*60*24));
              const isOverdue = !Number.isNaN(days) && days < 0;
              return {
                id,
                chargebackId: r.arn || id,
                transactionId: r.txn_id || '',
                amount,
                currency,
                status,
                priority: amount > 100000 ? 'high' : amount > 50000 ? 'medium' : 'low',
                reasonCode: reason,
                reasonDescription: reason,
                dueDate,
                createdAt: String(r.charge_back_date || '').slice(0,19),
                updatedAt: String(r.charge_back_credit_date_to_merchant || r.cb_credit_date_txn_reject || r.charge_back_date || '').slice(0,19),
                evidence: [],
                notes: [],
                arn: r.arn || '',
                gateway: r.payment_mode || r.pg_pay_mode || '',
                merchantName: r.client_name || '',
                isOverdue,
                daysUntilDue: Number.isNaN(days) ? undefined : days,
              } as any;
            });

            // Stats
            const stats = mapped.reduce((acc: any, m: any) => {
              acc.totalAmount += m.amount || 0;
              const st = m.status;
              if (st === 'won') acc.wonCount += 1;
              else if (st === 'lost') acc.lostCount += 1;
              else if (st === 'under_review') acc.underReviewCount += 1;
              else if (st === 'evidence_submitted') acc.evidenceSubmittedCount += 1;
              else if (st === 'new') acc.newCount += 1;
              if (m.isOverdue) acc.overdueCount += 1;
              return acc;
            }, { totalAmount: 0, wonCount: 0, lostCount: 0, newCount: 0, underReviewCount: 0, evidenceSubmittedCount: 0, overdueCount: 0 });

            const count = Number(resp?.count ?? mapped.length);
            const pageSize = state.pageSize || 10;
            const totalPages = pageSize > 0 ? Math.ceil(count / pageSize) : 1;
            set({
              chargebacks: mapped as any,
              totalCount: count,
              hasPrev: page > 1,
              hasNext: page < totalPages,
              isLoading: false,
              stats,
            });
          } catch (err: any) {
            set({ isLoading: false, error: err?.message || 'Failed to load chargebacks' });
          }
        },

        setFilter: (key: string, value: any) => set((state) => ({ filters: { ...(state.filters || {}), [key]: value } })),

        applyFilters: async () => {
          set({ currentPage: 1 });
          await get().fetchChargebacks();
        },

        setPage: async (page: number) => {
          set({ currentPage: Math.max(1, page) });
          await get().fetchChargebacks();
        },

        selectChargeback: (id: string) => set((state) => {
          const sel = new Set(state.selectedChargebacks || []);
          sel.add(id);
          return { selectedChargebacks: sel } as any;
        }),
        deselectChargeback: (id: string) => set((state) => {
          const sel = new Set(state.selectedChargebacks || []);
          sel.delete(id);
          return { selectedChargebacks: sel } as any;
        }),
        selectAllChargebacks: () => set((state) => ({ selectedChargebacks: new Set((state.chargebacks || []).map((c: any) => c.id)) } as any)),
        clearSelection: () => set({ selectedChargebacks: new Set<string>() } as any),

        exportChargebacks: async (_format) => {
          // Client-side CSV for selected items
          const sel = Array.from(get().selectedChargebacks || []);
          const rows = (get().chargebacks || []).filter((c: any) => sel.includes(c.id));
          const header = ['Chargeback ID','Transaction ID','Amount','Currency','Status','Reason','ARN','Merchant','Gateway','Due Date'];
          const esc = (v: any) => {
            const s = String(v ?? '');
            return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
          };
          const csv = [header.join(','), ...rows.map((r: any) => [r.chargebackId, r.transactionId, r.amount, r.currency, r.status, r.reasonCode, r.arn, r.merchantName, r.gateway, r.dueDate].map(esc).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `chargebacks_${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },

        bulkAssign: async (ids: string[], assignTo: string) => {
          set((state) => ({
            chargebacks: (state.chargebacks || []).map((c: any) => ids.includes(c.id) ? { ...c, assignedTo: assignTo } : c)
          }));
        },

        getAppliedFiltersCount: () => {
          const f: any = get().filters as any;
          if (!f) return 0;
          const keys = ['search','status','priority','dateFrom','dateTo','amountFrom','amountTo','gateway','assignedTo','reasonCode','isOverdue'];
          let cnt = 0;
          for (const k of keys) {
            const v = f[k];
            if (Array.isArray(v) && v.length) cnt++;
            else if (v !== undefined && v !== null && v !== '' && v !== false) cnt++;
          }
          return cnt;
        },

        // ========= Workflow (simplified local-only implementation) =========
        fetchWorkflowBoard: async () => {
          const items: any[] = (get().chargebacks || []) as any[];
          const columns: any[] = [
            { id: 'new', title: 'New', chargebacks: [] as any[] },
            { id: 'under_review', title: 'Under Review', chargebacks: [] as any[] },
            { id: 'evidence_submitted', title: 'Evidence Submitted', chargebacks: [] as any[] },
            { id: 'won', title: 'Won', chargebacks: [] as any[] },
            { id: 'lost', title: 'Lost', chargebacks: [] as any[] },
            { id: 'closed', title: 'Closed', chargebacks: [] as any[] },
          ];
          for (const it of items) {
            const col = columns.find(c => c.id === it.status) || columns[0];
            col.chargebacks.push(it);
          }
          for (const c of columns) (c as any).count = c.chargebacks.length;
          set({ workflowColumns: columns });
        },
        moveToStatus: async (id: string, status: ChargebackStatus) => {
          set((state) => ({
            chargebacks: (state.chargebacks || []).map((c: any) => c.id === id ? { ...c, status } : c)
          }));
          await get().fetchWorkflowBoard();
        },

        // ========= Details (safe local stubs) =========
        fetchChargebackById: async (id: string) => {
          const found = (get().chargebacks || []).find((c: any) => c.id === id || c.chargebackId === id);
          if (found) {
            set({ selectedChargeback: found as any });
            return;
          }
          // fallback: try backend search within today's range
          const today = new Date();
          const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          const resp = await ReportApiService.getChargebackTxnHistory({
            clientCode: 'ALL',
            fromDate: fmt(today),
            endDate: fmt(today),
            noOfClient: 0,
            rpttype: 1,
            page: 0,
            length: 0,
            search: id,
          });
          const results: any[] = Array.isArray(resp?.results)
            ? resp.results
            : Array.isArray(resp) ? resp : (resp?.results || []);
          if (results.length) {
            // Map minimal fields to selectedChargeback
            const r = results[0];
            const mapped: any = {
              id: String(r.txn_id || r.client_txn_id || id),
              chargebackId: r.arn || id,
              transactionId: r.txn_id || '',
              amount: Number(r.charge_back_amount ?? r.paid_amount ?? 0) || 0,
              currency: 'INR',
              status: 'under_review',
              priority: 'medium',
              reasonCode: String(r.charge_back_remarks || 'N/A'),
              reasonDescription: String(r.charge_back_remarks || 'N/A'),
              dueDate: String(r.cb_credit_date_txn_reject || r.prearb_date || r.charge_back_date || '').slice(0,10),
              createdAt: String(r.charge_back_date || '').slice(0,19),
              updatedAt: String(r.charge_back_credit_date_to_merchant || r.cb_credit_date_txn_reject || r.charge_back_date || '').slice(0,19),
              evidence: [],
              notes: [],
              arn: r.arn || '',
              gateway: r.payment_mode || r.pg_pay_mode || '',
              merchantName: r.client_name || '',
            };
            set({ selectedChargeback: mapped });
          }
        },
        uploadEvidence: async (id: string, type: string, description: string, file: File) => {
          set((state) => {
            if (!state.selectedChargeback || state.selectedChargeback.id !== id) return {} as any;
            const ev = (state.selectedChargeback as any).evidence || [];
            const newE = {
              id: `${Date.now()}`,
              type,
              fileName: file.name,
              fileUrl: URL.createObjectURL(file),
              fileSize: file.size,
              description,
              uploadedAt: new Date().toISOString(),
              status: 'pending',
            } as any;
            return { selectedChargeback: { ...(state.selectedChargeback as any), evidence: [newE, ...ev] } } as any;
          });
        },
        submitEvidence: async (id: string, evidenceIds: string[], _notes?: string) => {
          set((state) => {
            if (!state.selectedChargeback || state.selectedChargeback.id !== id) return {} as any;
            const ev = ((state.selectedChargeback as any).evidence || []).map((e: any) => evidenceIds.includes(e.id) ? { ...e, status: 'submitted' } : e);
            return { selectedChargeback: { ...(state.selectedChargeback as any), evidence: ev } } as any;
          });
        },
        deleteEvidence: async (id: string, evidenceId: string) => {
          set((state) => {
            if (!state.selectedChargeback || state.selectedChargeback.id !== id) return {} as any;
            const ev = ((state.selectedChargeback as any).evidence || []).filter((e: any) => e.id !== evidenceId);
            return { selectedChargeback: { ...(state.selectedChargeback as any), evidence: ev } } as any;
          });
        },
        downloadAllEvidence: async (_id: string) => { return; },
        acceptChargeback: async (id: string, _reason: string, _notes?: string) => {
          set((state) => ({
            chargebacks: (state.chargebacks || []).map((c: any) => c.id === id ? { ...c, status: 'lost' } : c),
            selectedChargeback: state.selectedChargeback?.id === id ? { ...(state.selectedChargeback as any), status: 'lost' } : state.selectedChargeback,
          }));
        },
        contestChargeback: async (id: string, _reason: string, _notes?: string) => {
          set((state) => ({
            chargebacks: (state.chargebacks || []).map((c: any) => c.id === id ? { ...c, status: 'under_review' } : c),
            selectedChargeback: state.selectedChargeback?.id === id ? { ...(state.selectedChargeback as any), status: 'under_review' } : state.selectedChargeback,
          }));
        },
        closeChargeback: async (id: string, _notes?: string) => {
          set((state) => ({
            chargebacks: (state.chargebacks || []).map((c: any) => c.id === id ? { ...c, status: 'closed' } : c),
            selectedChargeback: state.selectedChargeback?.id === id ? { ...(state.selectedChargeback as any), status: 'closed' } : state.selectedChargeback,
          }));
        },
        addNote: async (id: string, content: string, isInternal?: boolean) => {
          set((state) => {
            if (!state.selectedChargeback || state.selectedChargeback.id !== id) return {} as any;
            const notes = ((state.selectedChargeback as any).notes || []);
            const newN = { id: `${Date.now()}`, content, createdAt: new Date().toISOString(), createdBy: 'You', isInternal: !!isInternal };
            return { selectedChargeback: { ...(state.selectedChargeback as any), notes: [newN, ...notes] } } as any;
          });
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
