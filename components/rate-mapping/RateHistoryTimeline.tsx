'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn, formatDateTime } from '@/lib/utils'
import type { IRateHistory } from '@/types/rateMapping'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RateHistoryTimelineProps {
  history: IRateHistory[]
  onRevert?: (historyId: string) => void
  className?: string
}

export function RateHistoryTimeline({ history, onRevert, className }: RateHistoryTimelineProps) {
  const getChangeTypeColor = (type: IRateHistory['changeType']) => {
    switch (type) {
      case 'created':
        return 'bg-blue-500'
      case 'updated':
        return 'bg-yellow-500'
      case 'deleted':
        return 'bg-red-500'
      case 'activated':
        return 'bg-green-500'
      case 'deactivated':
        return 'bg-slate-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getChangeTypeIcon = (type: IRateHistory['changeType']) => {
    switch (type) {
      case 'created':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'updated':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        )
      case 'deleted':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'activated':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'deactivated':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const getChangeTypeBadge = (type: IRateHistory['changeType']) => {
    switch (type) {
      case 'created':
        return <Badge variant="secondary">Created</Badge>
      case 'updated':
        return <Badge variant="warning">Updated</Badge>
      case 'deleted':
        return <Badge variant="danger">Deleted</Badge>
      case 'activated':
        return <Badge variant="success">Activated</Badge>
      case 'deactivated':
        return <Badge variant="secondary">Deactivated</Badge>
      default:
        return null
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {history.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          <Card className="overflow-hidden">
            <div className="flex">
              <div className={cn('w-2 flex-shrink-0', getChangeTypeColor(item.changeType))} />

              <div className="flex-1 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full',
                        getChangeTypeColor(item.changeType)
                      )}
                    >
                      {getChangeTypeIcon(item.changeType)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {item.changeType.charAt(0).toUpperCase() + item.changeType.slice(1)} Rate Configuration
                        </h4>
                        {getChangeTypeBadge(item.changeType)}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        By {item.changedBy} on {formatDateTime(item.changedAt)}
                      </p>
                    </div>
                  </div>

                  {item.revertable && onRevert && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRevert(item.id)}
                    >
                      Revert
                    </Button>
                  )}
                </div>

                {item.reason && (
                  <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Reason:
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.reason}</p>
                  </div>
                )}

                {item.changeType === 'updated' && item.oldValue && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Old Values
                      </h5>
                      <div className="space-y-1 text-xs">
                        <ValueDisplay label="Merchant MDR" value={`${item.oldValue.merchantMDR}%`} />
                        <ValueDisplay label="Gateway MDR" value={`${item.oldValue.gatewayMDR}%`} />
                        <ValueDisplay label="Fixed Charge" value={`₹${item.oldValue.fixedCharge}`} />
                        <ValueDisplay
                          label="Status"
                          value={item.oldValue.isActive ? 'Active' : 'Inactive'}
                        />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        New Values
                      </h5>
                      <div className="space-y-1 text-xs">
                        <ValueDisplay
                          label="Merchant MDR"
                          value={`${item.newValue.merchantMDR}%`}
                          changed={item.oldValue.merchantMDR !== item.newValue.merchantMDR}
                        />
                        <ValueDisplay
                          label="Gateway MDR"
                          value={`${item.newValue.gatewayMDR}%`}
                          changed={item.oldValue.gatewayMDR !== item.newValue.gatewayMDR}
                        />
                        <ValueDisplay
                          label="Fixed Charge"
                          value={`₹${item.newValue.fixedCharge}`}
                          changed={item.oldValue.fixedCharge !== item.newValue.fixedCharge}
                        />
                        <ValueDisplay
                          label="Status"
                          value={item.newValue.isActive ? 'Active' : 'Inactive'}
                          changed={item.oldValue.isActive !== item.newValue.isActive}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {item.changeType === 'created' && (
                  <div className="space-y-1 text-xs">
                    <ValueDisplay label="Gateway" value={item.newValue.gateway} />
                    <ValueDisplay label="Payment Mode" value={item.newValue.paymentMode} />
                    {item.newValue.subCategory && (
                      <ValueDisplay label="Sub Category" value={item.newValue.subCategory} />
                    )}
                    <ValueDisplay label="Merchant MDR" value={`${item.newValue.merchantMDR}%`} />
                    <ValueDisplay label="Gateway MDR" value={`${item.newValue.gatewayMDR}%`} />
                    <ValueDisplay label="Fixed Charge" value={`₹${item.newValue.fixedCharge}`} />
                  </div>
                )}

                {item.approvalRequestId && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <span className="font-semibold">Approval Request ID:</span>{' '}
                      {item.approvalRequestId}
                    </p>
                    {item.approvedBy && item.approvedAt && (
                      <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                        Approved by {item.approvedBy} on {formatDateTime(item.approvedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {history.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            No history available
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            Rate configuration changes will appear here
          </p>
        </div>
      )}
    </div>
  )
}

interface ValueDisplayProps {
  label: string
  value: string
  changed?: boolean
}

function ValueDisplay({ label, value, changed = false }: ValueDisplayProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-1 px-2 rounded',
        changed && 'bg-yellow-50 dark:bg-yellow-900/20'
      )}
    >
      <span className="text-slate-600 dark:text-slate-400">{label}:</span>
      <span
        className={cn(
          'font-semibold',
          changed
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-slate-900 dark:text-slate-100'
        )}
      >
        {value}
        {changed && (
          <svg
            className="w-3 h-3 inline-block ml-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </div>
  )
}
