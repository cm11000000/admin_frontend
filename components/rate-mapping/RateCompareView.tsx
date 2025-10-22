'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'
import type { IRateComparison } from '@/types/rateMapping'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface RateCompareViewProps {
  comparisons: IRateComparison[]
  className?: string
}

export function RateCompareView({ comparisons, className }: RateCompareViewProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600 dark:text-red-400'
    if (change < 0) return 'text-green-600 dark:text-green-400'
    return 'text-slate-600 dark:text-slate-400'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
    if (change < 0) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {comparisons.map((comparison, index) => (
        <motion.div
          key={comparison.rateId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {comparison.gateway} - {comparison.paymentMode}
                  </h3>
                  {comparison.subCategory && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {comparison.subCategory}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    comparison.difference.merchantMDR === 0 &&
                    comparison.difference.gatewayMDR === 0 &&
                    comparison.difference.fixedCharge === 0
                      ? 'secondary'
                      : 'warning'
                  }
                >
                  {comparison.difference.merchantMDR === 0 &&
                  comparison.difference.gatewayMDR === 0 &&
                  comparison.difference.fixedCharge === 0
                    ? 'No Changes'
                    : 'Modified'}
                </Badge>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComparisonField
                  label="Merchant MDR"
                  current={comparison.current.merchantMDR}
                  proposed={comparison.proposed.merchantMDR}
                  difference={comparison.difference.merchantMDR}
                  percentageChange={comparison.percentageChange.merchantMDR}
                  unit="%"
                />

                <ComparisonField
                  label="Gateway MDR"
                  current={comparison.current.gatewayMDR}
                  proposed={comparison.proposed.gatewayMDR}
                  difference={comparison.difference.gatewayMDR}
                  percentageChange={comparison.percentageChange.gatewayMDR}
                  unit="%"
                />

                <ComparisonField
                  label="Fixed Charge"
                  current={comparison.current.fixedCharge}
                  proposed={comparison.proposed.fixedCharge}
                  difference={comparison.difference.fixedCharge}
                  percentageChange={comparison.percentageChange.fixedCharge}
                  unit="₹"
                  isCurrency
                />
              </div>

              {comparison.current.isActive !== comparison.proposed.isActive && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Status Change: {comparison.current.isActive ? 'Active' : 'Inactive'}{' '}
                      → {comparison.proposed.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}

      {comparisons.length === 0 && (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            No rate comparisons available
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            Select rates to compare or create a new update request
          </p>
        </div>
      )}
    </div>
  )
}

interface ComparisonFieldProps {
  label: string
  current: number
  proposed: number
  difference: number
  percentageChange: number
  unit: string
  isCurrency?: boolean
}

function ComparisonField({
  label,
  current,
  proposed,
  difference,
  percentageChange,
  unit,
  isCurrency = false
}: ComparisonFieldProps) {
  const hasChange = difference !== 0

  const formatValue = (value: number) => {
    if (isCurrency) {
      return formatCurrency(value)
    }
    return `${value}${unit}`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600 dark:text-red-400'
    if (change < 0) return 'text-green-600 dark:text-green-400'
    return 'text-slate-600 dark:text-slate-400'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
    if (change < 0) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        hasChange
          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
      )}
    >
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-3">
        {label}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-500">Current</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {formatValue(current)}
          </span>
        </div>

        {hasChange && (
          <div className="flex items-center justify-center py-1">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-500">Proposed</span>
          <span
            className={cn(
              'text-sm font-bold',
              hasChange
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-slate-900 dark:text-slate-100'
            )}
          >
            {formatValue(proposed)}
          </span>
        </div>

        {hasChange && (
          <div
            className={cn(
              'flex items-center justify-between pt-2 mt-2 border-t border-slate-200 dark:border-slate-700',
              getChangeColor(difference)
            )}
          >
            <span className="text-xs font-medium">Change</span>
            <div className="flex items-center gap-1 font-bold text-sm">
              {getChangeIcon(difference)}
              <span>
                {difference > 0 ? '+' : ''}
                {isCurrency ? formatCurrency(Math.abs(difference)) : `${difference}${unit}`}
              </span>
              <span className="text-xs">
                ({percentageChange > 0 ? '+' : ''}
                {percentageChange.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
