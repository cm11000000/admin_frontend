'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children: ReactNode
  isLoading?: boolean
  error?: string | null
  onRefresh?: () => void
  actions?: ReactNode
  className?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

export function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  isLoading = false,
  error = null,
  onRefresh,
  actions,
  className = '',
  trend
}: ChartCardProps) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 ${className}`}
      >
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Failed to load chart</h3>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50
        shadow-lg hover:shadow-2xl hover:shadow-orange-500/5 hover:border-slate-600/50
        transition-all duration-300 ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-1">
            {Icon && (
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Trend indicator */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full mt-2 ${
                trend.isPositive
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400 rotate-180'
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  trend.isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && !isLoading && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 lg:h-80">
            <div className="space-y-4 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-slate-700 border-t-orange-500 rounded-full mx-auto"
              />
              <p className="text-sm text-slate-400">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Loading skeleton for chart cards
export function ChartCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-700/50 rounded-xl" />
          <div>
            <div className="w-32 h-5 bg-slate-700/50 rounded mb-2" />
            <div className="w-24 h-3 bg-slate-700/50 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 bg-slate-700/50 rounded-lg" />
      </div>
      <div className="h-64 lg:h-80 bg-slate-700/30 rounded-xl" />
    </div>
  )
}

// Empty state component
export function ChartEmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
      <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-300 mb-1">No Data Available</h4>
        <p className="text-xs text-slate-500">{message}</p>
      </div>
    </div>
  )
}
