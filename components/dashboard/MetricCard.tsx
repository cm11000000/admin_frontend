'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: 'up' | 'down' | 'neutral'
  prefix?: string
  suffix?: string
  isLoading?: boolean
  sparklineData?: number[]
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  iconColor = 'text-orange-400',
  iconBgColor = 'bg-orange-500/10',
  trend,
  prefix = '',
  suffix = '',
  isLoading = false,
  sparklineData,
  onClick
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp
    if (trend === 'down') return TrendingDown
    return Minus
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-400'
    if (trend === 'down') return 'text-red-400'
    return 'text-slate-400'
  }

  const TrendIcon = getTrendIcon()

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 overflow-hidden"
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
            <div className="w-20 h-6 bg-slate-700/50 rounded-lg" />
          </div>
          <div>
            <div className="w-24 h-4 bg-slate-700/50 rounded mb-2" />
            <div className="w-32 h-8 bg-slate-700/50 rounded-lg" />
          </div>
          <div className="w-full h-16 bg-slate-700/50 rounded-lg" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`
        relative bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50
        shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 hover:border-slate-600/50
        transition-all duration-300 overflow-hidden group
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center shadow-lg`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </motion.div>

          {/* Change indicator */}
          {change !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full ${
                trend === 'up'
                  ? 'bg-green-500/10 border border-green-500/30'
                  : trend === 'down'
                  ? 'bg-red-500/10 border border-red-500/30'
                  : 'bg-slate-500/10 border border-slate-500/30'
              }`}
            >
              <TrendIcon className={`w-3.5 h-3.5 ${getTrendColor()}`} />
              <span className={`text-xs font-bold ${getTrendColor()}`}>
                {Math.abs(change)}%
              </span>
            </motion.div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-slate-400 mb-2 group-hover:text-slate-300 transition-colors">
          {title}
        </h3>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-baseline space-x-1 mb-3"
        >
          {prefix && (
            <span className="text-2xl font-bold text-slate-300">{prefix}</span>
          )}
          <span className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {suffix && (
            <span className="text-sm font-semibold text-slate-400">{suffix}</span>
          )}
        </motion.div>

        {/* Change label */}
        {change !== undefined && (
          <p className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
            {changeLabel}
          </p>
        )}

        {/* Sparkline (optional) */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-4 h-12 flex items-end space-x-1">
            {sparklineData.map((value, index) => {
              const maxValue = Math.max(...sparklineData)
              const height = (value / maxValue) * 100

              return (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  className={`flex-1 rounded-t-sm ${
                    trend === 'up'
                      ? 'bg-gradient-to-t from-green-500/50 to-green-400/30'
                      : trend === 'down'
                      ? 'bg-gradient-to-t from-red-500/50 to-red-400/30'
                      : 'bg-gradient-to-t from-slate-500/50 to-slate-400/30'
                  }`}
                  style={{ minHeight: '4px' }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none"
      />
    </motion.div>
  )
}

// Skeleton loading component
export function MetricCardSkeleton() {
  return (
    <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
        <div className="w-16 h-6 bg-slate-700/50 rounded-full" />
      </div>
      <div className="w-24 h-4 bg-slate-700/50 rounded mb-2" />
      <div className="w-32 h-10 bg-slate-700/50 rounded-lg mb-2" />
      <div className="w-20 h-3 bg-slate-700/50 rounded" />
    </div>
  )
}
