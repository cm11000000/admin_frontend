'use client'
// Client-only page; safe for static export

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRateMappingStore } from '@/stores/rateMappingStore'
import RateMappingApiService from '@/services/api/RateMappingApiService'
import { RateHistoryTimeline } from '@/components/rate-mapping/RateHistoryTimeline'
import { HistoryTimelineSkeleton } from '@/components/rate-mapping/RateMappingSkeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { IRateHistory, HistoryFilterOptions } from '@/types/rateMapping'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RateHistoryPage() {
  const store = useRateMappingStore() as any
  const history = Array.isArray(store?.history) ? store.history : []
  const setHistory = (store?.setHistory as any) || (() => {})
  const historyLoading = !!store?.historyLoading
  const setHistoryLoading = (store?.setHistoryLoading as any) || (() => {})
  const historyFilters = (store?.historyFilters as any) || {}
  const setHistoryFilters = (store?.setHistoryFilters as any) || (() => {})

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadHistory()
  }, [historyFilters, page])

  const loadHistory = async () => {
    setHistoryLoading(true)

    try {
      const response = await RateMappingApiService.getRateHistory(historyFilters, page, 20)
      setHistory(response.data)
      setTotalPages(Math.ceil(response.total / 20))
    } catch (error) {
      toast.error('Failed to load rate history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleRevert = async (historyId: string) => {
    const confirmed = confirm(
      'Are you sure you want to revert to this rate configuration? This will create a new update request.'
    )

    if (!confirmed) return

    const reason = prompt('Please provide a reason for reverting:')
    if (!reason) return

    try {
      await RateMappingApiService.revertToHistory(historyId, reason)
      toast.success('Revert request created successfully')
      await loadHistory()
    } catch (error) {
      toast.error('Failed to create revert request')
    }
  }

  const handleExportAuditLog = async () => {
    try {
      const response = await RateMappingApiService.getRateHistory(historyFilters, 1, 10000)
      const csvContent = generateAuditLogCSV(response.data)

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `rate-audit-log-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Audit log exported successfully')
    } catch (error) {
      toast.error('Failed to export audit log')
    }
  }

  const generateAuditLogCSV = (historyData: IRateHistory[]): string => {
    const headers = [
      'ID',
      'Change Type',
      'Gateway',
      'Payment Mode',
      'Sub Category',
      'Changed By',
      'Changed At',
      'Reason',
      'Old Merchant MDR',
      'New Merchant MDR',
      'Old Gateway MDR',
      'New Gateway MDR',
      'Old Fixed Charge',
      'New Fixed Charge'
    ]

    const rows = historyData.map((item) => [
      item.id,
      item.changeType,
      item.newValue.gateway,
      item.newValue.paymentMode,
      item.newValue.subCategory || '',
      item.changedBy,
      item.changedAt,
      item.reason || '',
      item.oldValue?.merchantMDR || '',
      item.newValue.merchantMDR,
      item.oldValue?.gatewayMDR || '',
      item.newValue.gatewayMDR,
      item.oldValue?.fixedCharge || '',
      item.newValue.fixedCharge
    ])

    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  const changeTypes = [
    { value: '', label: 'All Changes' },
    { value: 'created', label: 'Created' },
    { value: 'updated', label: 'Updated' },
    { value: 'deleted', label: 'Deleted' },
    { value: 'activated', label: 'Activated' },
    { value: 'deactivated', label: 'Deactivated' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Rate Mapping History & Audit
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Complete audit trail of all rate configuration changes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/config/rate-mapping">
              <Button variant="outline">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Configuration
              </Button>
            </Link>

            <Button variant="primary" onClick={handleExportAuditLog}>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export Audit Log
            </Button>
          </div>
        </motion.div>

        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by ID, user, or reason..."
                onChange={(e) => {
                  const value = e.target.value
                  if (value) {
                    setHistoryFilters({ rateConfigId: value })
                  } else {
                    setHistoryFilters({ rateConfigId: undefined })
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={historyFilters.changeType?.[0] || ''}
                onValueChange={(value) => {
                  setHistoryFilters({
                    changeType: value ? [value as any] : undefined
                  })
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Change Type" />
                </SelectTrigger>
                <SelectContent>
                  {changeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {selectedDate ? formatDate(selectedDate) : 'Filter by Date'}
                </Button>

                {showDatePicker && (
                  <div className="absolute top-full mt-2 z-50">
                    <Calendar
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        if (date) {
                          setHistoryFilters({
                            dateRange: {
                              from: date.toISOString(),
                              to: new Date(
                                date.getTime() + 24 * 60 * 60 * 1000
                              ).toISOString()
                            }
                          })
                        }
                        setShowDatePicker(false)
                      }}
                      maxDate={new Date()}
                    />
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setHistoryFilters({})
                  setSelectedDate(undefined)
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge variant="secondary" className="text-sm">
                Showing {history.length} entries
              </Badge>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>

                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          {historyLoading ? (
            <HistoryTimelineSkeleton />
          ) : (
            <RateHistoryTimeline history={history} onRevert={handleRevert} />
          )}
        </Card>
      </div>
    </div>
  )
}
