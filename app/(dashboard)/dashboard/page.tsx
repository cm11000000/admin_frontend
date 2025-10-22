"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Download, Search, DollarSign, CheckCircle2 } from 'lucide-react'
import { dashboardApiService, TransactionSummary, DashboardApiRequest } from '@/services/api/DashboardApiService'
import { DatePicker } from '@/components/ui/date-picker'
// XLSX is lazy-loaded in export handler to reduce initial bundle size

interface SummaryStats {
  successfulTransactions: number
  gmv: number
}

export default function DashboardPage() {
  const [selectedDateOption, setSelectedDateOption] = useState('1')
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

  useEffect(() => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const today = `${yyyy}-${mm}-${dd}`
    setFromDate(today)
    setToDate(today)
  }, [])

  // Initial auto-load (Today) — run once after dates are initialized
  const didAutoLoad = useRef(false)
  useEffect(() => {
    if (!didAutoLoad.current && fromDate && toDate) {
      didAutoLoad.current = true
      loadGMVDataWithDates(fromDate, toDate, '1')
    }
  }, [fromDate, toDate])

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
    // Trigger GMV directly with the chosen option to avoid any stale state
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
        const currMonth = now.getMonth()
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

  const resolveUserName = (): string => {
    try {
      const loginId = localStorage.getItem('loginId')
      if (loginId && loginId.trim()) return loginId.trim()
      const userName = localStorage.getItem('userName')
      if (userName && userName.trim()) return userName.trim()
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const u = JSON.parse(storedUser)
        const resolved = u?.userName || u?.email || u?.clientUserId || ''
        if (resolved && String(resolved).trim()) return String(resolved).trim()
      }
    } catch {}
    return ''
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
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="pb-3 md:pb-4 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Transaction Summary</h1>
        <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>Monitor your transaction metrics in real-time</p>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <label className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Successful Transaction Summary</label>
          <p className="text-gray-600 text-xs md:text-sm mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Select a date range to view transaction data</p>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
          {dateOptions.map((option) => (
            <label
              key={option.value}
              onClick={() => handleDateRangeChange(option.value)}
              className={`${selectedDateOption === option.value ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-lg shadow-orange-500/25' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'} flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl cursor-pointer border transition-all duration-200 touch-manipulation min-h-[44px]`}
            >
              <input
                type="radio"
                name="dateRange"
                value={option.value}
                checked={selectedDateOption === option.value}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="sr-only"
              />
              <span className="text-xs md:text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>

        {customizeDate && (
          <div className="mt-4 bg-gray-50 border border-gray-300 rounded-xl p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">From Date</label>
                <DatePicker
                  value={fromDate}
                  onChange={(date) => setFromDate(date)}
                  placeholder="Select from date"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">To Date</label>
                <DatePicker
                  value={toDate}
                  onChange={(date) => setToDate(date)}
                  placeholder="Select to date"
                  minDate={fromDate ? new Date(fromDate) : undefined}
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button onClick={() => loadGMVDataWithDates(fromDate, toDate, '6')} className="w-full min-h-[52px] px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25 touch-manipulation">Search →</button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Successful Transactions</p>
                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">{formatNumber(summaryStats.successfulTransactions)}</p>
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">GMV (INR)</p>
                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">{formatCurrency(summaryStats.gmv)}</p>
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <button onClick={loadTransactionDetails} className="w-full min-h-[52px] px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25 touch-manipulation">View Transaction Details →</button>
            </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 md:py-16 bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-lg">
          <div className="text-center">
            <div className="inline-block w-8 h-8 md:w-10 md:h-10 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mb-3 md:mb-4"></div>
            <p className="text-xs md:text-sm font-light text-gray-700" style={{ letterSpacing: '-0.01em' }}>Loading transaction data...</p>
          </div>
        </div>
      )}

      {showGrid && (
        <div className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
              <input type="search" autoComplete="off" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by client code or name..." className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-xs md:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all min-h-[44px]" />
            </div>
            <div className="flex justify-end">
              <button onClick={handleExportToExcel} className="w-full sm:w-auto min-h-[52px] px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs md:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/25 touch-manipulation">
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {Array.isArray(filteredData) && filteredData.map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Header with Client Code */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Client Code</p>
                    <p className="font-mono text-sm font-bold text-orange-500 truncate">
                      {item.client_code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">#{index + 1}</p>
                  </div>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Client Name</p>
                    <p className="font-semibold text-gray-900 truncate">{item.client_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Total Txn</p>
                    <p className="font-semibold text-gray-900">{formatNumber(item.total_txn)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Success</p>
                    <p className="font-semibold text-green-600">{formatNumber(item.success_txn)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Failed</p>
                    <p className="font-semibold text-red-600">{formatNumber(item.failed_txn)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">GMV (INR)</p>
                    <p className="font-bold text-green-700 text-base">{formatCurrency(item.paidamount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Refund Init</p>
                    <p className="text-gray-900">{formatNumber(item.refund_init_txn)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Refunded</p>
                    <p className="text-gray-900">{formatNumber(item.refunded_txn)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            {/* Mobile: Show scroll hint */}
            <div className="md:hidden bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 flex items-center gap-2">
              <div className="text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-xs text-orange-800 font-medium">Swipe left to view more columns</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto -mx-px">
                <table id="txnDataTable" className="min-w-full border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="sticky left-0 z-20 bg-white px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">#</th>
                    <th className="sticky left-[60px] z-20 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Client Code</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Client's Name</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Success</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Failed</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Aborted / Init</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Refund Init</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Refunded</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Total</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">GMV (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(filteredData) && filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">{index + 1}</td>
                      <td className="sticky left-[60px] z-10 bg-white shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-orange-500 font-medium whitespace-nowrap">{item.client_code}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{item.client_name}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-green-600 font-medium whitespace-nowrap">{formatNumber(item.success_txn)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-red-600 font-medium whitespace-nowrap">{formatNumber(item.failed_txn)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700 whitespace-nowrap">{formatNumber(item.abort_init_txn)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700 whitespace-nowrap">{formatNumber(item.refund_init_txn)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-700 whitespace-nowrap">{formatNumber(item.refunded_txn)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-900 font-medium whitespace-nowrap">{formatNumber(item.total_txn)}</td>
                      <td className="px-3 md:px-6 py-2.5 md:py-4 text-xs md:text-sm text-right text-gray-900 font-bold whitespace-nowrap">{formatCurrency(item.paidamount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-orange-500/30">
                    <th className="sticky left-0 z-10 bg-gray-50 px-3 md:px-6 py-3 md:py-4"></th>
                    <th className="sticky left-[60px] z-10 bg-gray-50 shadow-[2px_0_4px_rgba(0,0,0,0.05)] px-3 md:px-6 py-3 md:py-4"></th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-800 whitespace-nowrap">Total Transactions:</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-green-600 whitespace-nowrap">{formatNumber(totals.success_txn)}</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-red-600 whitespace-nowrap">{formatNumber(totals.failed_txn)}</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-700 whitespace-nowrap">{formatNumber(totals.abort_init_txn)}</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-700 whitespace-nowrap">{formatNumber(totals.refund_init_txn)}</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-gray-700 whitespace-nowrap">{formatNumber(totals.refunded_txn)}</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-bold text-orange-500 whitespace-nowrap">{formatNumber(totals.total_txn)}</th>
                    <th className="px-3 md:px-6 py-3 md:py-4"></th>
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
