"use client"

import React, { useEffect, useState, useCallback } from 'react'
import AnalyticsApiService from '@/services/api/AnalyticsApiService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/date-picker'
import { Combobox } from '@/components/ui/combobox'
import { Calendar, Building2, Search, Download, Loader2, RefreshCw } from 'lucide-react'
import { toast } from '@/lib/toast'
import { resolveUserName } from '@/lib/utils'
import { transactionService } from '@/services/api/TransactionApiService'

type DateRange = { from: string; to: string }

function today(): DateRange { const t=new Date(); const f=(d:Date)=>d.toISOString().split('T')[0]||''; return { from: f(t), to: f(t) } }

export default function SbiCardSummaryPage() {
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [clientCode, setClientCode] = useState<string>('ALL')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>({ total: 0, success: 0, failed: 0, paid_amount: 0 })
  const [clientCodeList, setClientCodeList] = useState<any[]>([])
  const [userName, setUserName] = useState<string>('')
  const [clientsLoaded, setClientsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUserName(resolveUserName());
  }, [])

  // Lazy load client codes when combobox is opened
  const ensureClients = useCallback(async () => {
    if (clientsLoaded) return;
    if (!userName) {
      toast.error('User information missing; unable to load clients');
      return;
    }
    try {
      const codes = await transactionService.getClientCodeListCached(userName);
      setClientCodeList(codes || []);
      setClientsLoaded(true);
    } catch (e) {
      console.error('[SBI Card] Failed to load client codes:', e);
      toast.error('Failed to load client list');
    }
  }, [clientsLoaded, userName])

  const load = async () => {
    // Validation
    if (!fromDate || !endDate) {
      toast.error('Please select both from and to dates');
      return;
    }

    const d1 = new Date(fromDate);
    const d2 = new Date(endDate);
    const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      toast.error('From date should be less than to date');
      return;
    }

    if (diffDays > 31) {
      toast.error('Date range cannot exceed 31 days');
      return;
    }

    setLoading(true)
    try {
      const requestClientCode = clientCode === 'ALL' ? '' : clientCode;
      const res = await AnalyticsApiService.sbiCardSummary({
        clientCode: requestClientCode,
        fromDate: fromDate,
        endDate: endDate
      })
      setData(res || { total: 0, success: 0, failed: 0, paid_amount: 0 })
      toast.success('SBI Card summary loaded successfully')
    } catch (error) {
      console.error('Failed to load SBI card summary:', error);
      toast.error('Failed to load SBI card summary')
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setEndDate(today);
    setClientCode('ALL');
    setData({ total: 0, success: 0, failed: 0, paid_amount: 0 });
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="pb-3 md:pb-4 border-b border-gray-200">
        <h4 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          SBI Card Summary
        </h4>
        <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2">Quick totals for SBI card transactions</p>
      </div>

      {/* Filters Section */}
      <div className="relative z-20 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-0.5 md:mb-1">Filter Transactions</h3>
          <p className="text-xs md:text-sm text-gray-600">Select filters to narrow down your SBI card summary</p>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-5">
          {/* Client Name - with integrated search */}
          <div className="relative z-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="inline-block w-4 h-4 mr-1 text-gray-600" />
              Client Code
            </label>
            <Combobox
              options={[
                { value: 'ALL', label: 'ALL' },
                ...(Array.isArray(clientCodeList) ? clientCodeList.map((client: any) => ({
                  value: client.clientCode || client.client_code,
                  label: `${client.clientCode || client.client_code} - ${client.clientName || client.client_name}`
                })) : [])
              ]}
              value={clientCode}
              onChange={(value) => setClientCode(value)}
              placeholder="Select Client"
              searchPlaceholder="Search by code or name..."
              onOpenChange={async (open) => {
                if (open && !clientsLoaded) {
                  await ensureClients();
                }
              }}
              className="min-h-[44px] touch-manipulation"
            />
          </div>

          {/* From Date - with calendar picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
              From Date
            </label>
            <DatePicker
              value={fromDate}
              onChange={(value) => setFromDate(value)}
              placeholder="Select from date"
            />
          </div>

          {/* To Date - with calendar picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
              To Date
            </label>
            <DatePicker
              value={endDate}
              onChange={(value) => setEndDate(value)}
              placeholder="Select to date"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-3 pt-3 md:pt-2 border-t border-gray-200">
          <Button
            onClick={load}
            disabled={loading}
            className="flex-1 sm:flex-none min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden xs:inline">Loading...</span>
                <span className="xs:hidden">Load</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="hidden xs:inline">Load Summary</span>
                <span className="xs:hidden">Load</span>
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              const requestClientCode = clientCode === 'ALL' ? '' : clientCode;
              AnalyticsApiService.downloadCsv(
                '/analytics/sbicard_summary/',
                { clientCode: requestClientCode, fromDate: fromDate, endDate: endDate },
                `sbi_card_${fromDate}_${endDate}.csv`
              );
            }}
            disabled={loading}
            className="flex-1 sm:flex-none min-h-[44px] px-4 md:px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span className="hidden xs:inline">Export CSV</span>
            <span className="xs:hidden">Export</span>
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full sm:w-auto min-h-[44px] px-4 md:px-6 py-2.5 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Clear Filters</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Total</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{data.total}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Success</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-green-600">{data.success}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Failed</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-red-600">{data.failed}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Amount</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold text-orange-600">₹{Number(data.paid_amount||0).toLocaleString()}</CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
