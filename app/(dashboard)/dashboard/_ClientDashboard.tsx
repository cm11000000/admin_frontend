'use client'

import React, { useState, useEffect } from 'react'
import { Download, Search, DollarSign, CheckCircle2 } from 'lucide-react'
import { dashboardApiService, TransactionSummary, DashboardApiRequest } from '@/services/api/DashboardApiService'
// XLSX is lazy-loaded during export to reduce initial bundle size
import { resolveUserName } from '@/lib/utils'

interface SummaryStats {
  successfulTransactions: number
  gmv: number
}

export default function ClientDashboard() {
  // State management - No default selection, user must select
  const [selectedDateOption, setSelectedDateOption] = useState('')
  const [customizeDate, setCustomizeDate] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({ successfulTransactions: 0, gmv: 0 })
  const [transactionData, setTransactionData] = useState<TransactionSummary[]>([])
  const [filteredData, setFilteredData] = useState<TransactionSummary[]>([])

  const dateOptions = [
    { label: 'Today', value: '1' },
    { label: 'Yesterday', value: '2' },
    { label: 'Last 7 Days', value: '3' },
    { label: 'Current Month', value: '4' },
    { label: 'Last Month', value: '5' },
    { label: 'Customize Date', value: '6' }
  ]

  // Initialize dates but do not auto-load
  useEffect(() => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const today = `${yyyy}-${mm}-${dd}`
    setFromDate(today)
    setToDate(today)
  }, [])

  const handleDateRangeChange = (value: string) => {
    setSelectedDateOption(value)
    setShowGrid(false)
    setSearchTerm('')
    setSummaryStats({ successfulTransactions: 0, gmv: 0 })

    if (value === '6') {
      setCustomizeDate(true)
      setLoading(false)
      return
    }

    setCustomizeDate(false)
    const dates = calculateDateRangeSync(value)
    if (!dates.fromDate || !dates.toDate) return
    setFromDate(dates.fromDate)
    setToDate(dates.toDate)
    loadGMVDataWithDates(dates.fromDate, dates.toDate, value)
  }

  const calculateDateRangeSync = (value: string): { fromDate: string; toDate: string } => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    switch (value) {
      case '1':
        return { fromDate: `${yyyy}-${mm}-${dd}`, toDate: `${yyyy}-${mm}-${dd}` }
      case '2': {
        const d = new Date()
        d.setDate(d.getDate() - 1)
        return {
          fromDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          toDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }
      }
      case '3': {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 6)
        return {
          fromDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
          toDate: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
        }
      }
      case '4':
        return { fromDate: `${yyyy}-${mm}-01`, toDate: `${yyyy}-${mm}-${dd}` }
      case '5': {
        const now = new Date()
        const currMonth = now.getMonth() // 0-11
        const lastMonthYear = currMonth === 0 ? yyyy - 1 : yyyy
        const lastMonthNum = currMonth === 0 ? 12 : currMonth
        const lastDay = new Date(lastMonthYear, lastMonthNum, 0).getDate()
        return {
          fromDate: `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}-01`,
          toDate: `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        }
      }
      default:
        return { fromDate: `${yyyy}-${mm}-${dd}`, toDate: `${yyyy}-${mm}-${dd}` }
    }
  }

  const loadGMVDataWithDates = async (from: string, to: string, dateOptionValue?: string) => {
    if (!from || !to) return
    setLoading(true)
    try {
      const userName = resolveUserName()
      const clientcode = dateOptionValue || selectedDateOption || '1'
      const requestData: DashboardApiRequest = { fromdate: from, todate: to, clientcode, loginBy: userName }
      const response = await dashboardApiService.getGmvSummary(requestData)
      setSummaryStats({ successfulTransactions: response.successTxnTotal, gmv: response.paidamountTotal })
    } catch (error) {
      console.error('[Dashboard] GMV load error:', error)
      setSummaryStats({ successfulTransactions: 0, gmv: 0 })
    } finally {
      setLoading(false)
    }
  }

  const loadTransactionDetails = async () => {
    if (fromDate && toDate) {
      const d1 = new Date(fromDate)
      const d2 = new Date(toDate)
      const diffDays = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)
      if (diffDays < 0 || diffDays > 31) return
    }
    setLoading(true)
    setShowGrid(true)
    try {
      const userName = resolveUserName()
      const requestData: DashboardApiRequest = {
        fromdate: fromDate,
        todate: toDate,
        clientcode: selectedDateOption || '1',
        loginBy: userName
      }
      const response = await dashboardApiService.getTransactionSummaryByClient(requestData)
      setTransactionData(response)
      setFilteredData(response)
    } catch (error) {
      console.error('[Dashboard] Details load error:', error)
      setShowGrid(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (!value.trim()) { setFilteredData(transactionData); return }
    const filtered = transactionData.filter(
      i => i.client_code.toLowerCase().includes(value.toLowerCase()) || i.client_name.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredData(filtered)
  }

  const calculateTotals = () => {
    return filteredData.reduce(
      (acc, i) => ({
        success_txn: acc.success_txn + i.success_txn,
        failed_txn: acc.failed_txn + i.failed_txn,
        abort_init_txn: acc.abort_init_txn + i.abort_init_txn,
        refund_init_txn: acc.refund_init_txn + i.refund_init_txn,
        refunded_txn: acc.refunded_txn + i.refunded_txn,
        total_txn: acc.total_txn + i.total_txn
      }),
      { success_txn: 0, failed_txn: 0, abort_init_txn: 0, refund_init_txn: 0, refunded_txn: 0, total_txn: 0 }
    )
  }

  const handleExportToExcel = async () => {
    if (filteredData.length === 0) return
    const fileName = `SuccessfulTxn${Date.now()}.xlsx`
    const table = document.getElementById('txnDataTable')
    if (!table) return
    const XLSX = await import('xlsx')
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, fileName)
  }

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
  const formatNumber = (v: number) => new Intl.NumberFormat('en-IN').format(v)
  const totals = calculateTotals()

  return (
    <div className="space-y-6 px-6 pb-6">
      <div className="pb-4 border-b border-slate-700/50">
        <h4 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Transaction Summary</h4>
        <p className="text-slate-400 text-sm mt-2">Monitor your transaction metrics in real-time</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6">
        <div className="mb-6">
          <label className="text-lg font-bold text-white">Successful Transaction Summary</label>
          <p className="text-slate-400 text-sm mt-1">Select a date range to view transaction data</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {dateOptions.map((option) => (
            <label key={option.value} className={`${selectedDateOption === option.value ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/25' : 'bg-slate-700/30 text-slate-300 border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500'} flex items-center gap-2 px-5 py-3 rounded-xl cursor-pointer border transition-all duration-200`}>
              <input type="radio" name="dateRange" value={option.value} checked={selectedDateOption === option.value} onChange={(e) => handleDateRangeChange(e.target.value)} className="sr-only" />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>

        {customizeDate && (
          <div className="mt-4 bg-slate-700/30 border border-slate-600/50 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-300 mb-2">From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-300 mb-2">To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button onClick={() => loadGMVDataWithDates(fromDate, toDate, '6')} className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25">Search</button>
              </div>
            </div>
          </div>
        )}

        {!loading && summaryStats.successfulTransactions > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">Successful Transactions</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">{formatNumber(summaryStats.successfulTransactions)}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">GMV (INR)</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">{formatCurrency(summaryStats.gmv)}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <button onClick={loadTransactionDetails} className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25">View Transaction Details</button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-slate-300">Loading transaction data...</p>
          </div>
        </div>
      )}

      {showGrid && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by client code or name..." className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" />
            </div>
            <div className="flex justify-end">
              <button onClick={handleExportToExcel} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-500/25">
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table id="txnDataTable" className="min-w-full border-collapse">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Client Code</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Client's Name</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Success</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Failed</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Aborted / Init</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Refund Init</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Refunded</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-300 uppercase tracking-wider">GMV (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-orange-400 font-medium">{item.client_code}</td>
                      <td className="px-6 py-4 text-sm text-white">{item.client_name}</td>
                      <td className="px-6 py-4 text-sm text-right text-green-400 font-medium">{formatNumber(item.success_txn)}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-400 font-medium">{formatNumber(item.failed_txn)}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-300">{formatNumber(item.abort_init_txn)}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-300">{formatNumber(item.refund_init_txn)}</td>
                      <td className="px-6 py-4 text-sm text-right text-slate-300">{formatNumber(item.refunded_txn)}</td>
                      <td className="px-6 py-4 text-sm text-right text-white font-medium">{formatNumber(item.total_txn)}</td>
                      <td className="px-6 py-4 text-sm text-right text-white font-bold">{formatCurrency(item.paidamount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-700/50 border-t-2 border-orange-500/30">
                    <th className="px-6 py-4"></th>
                    <th className="px-6 py-4"></th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-200">Total Transactions:</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-green-400">{formatNumber(totals.success_txn)}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-red-400">{formatNumber(totals.failed_txn)}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-300">{formatNumber(totals.abort_init_txn)}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-300">{formatNumber(totals.refund_init_txn)}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-300">{formatNumber(totals.refunded_txn)}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-orange-400">{formatNumber(totals.total_txn)}</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
