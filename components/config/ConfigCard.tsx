'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ConfigCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  gradient: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
  className?: string
}

export default function ConfigCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  trend,
  onClick,
  className = ''
}: ConfigCardProps) {
  const isClickable = !!onClick

  return (
    <div
      className={`
        bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6
        transition-all duration-300 group
        ${isClickable ? 'cursor-pointer hover:bg-slate-800/70 hover:border-slate-600/50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-tr ${gradient} rounded-xl flex items-center justify-center shadow-lg ${isClickable ? 'group-hover:scale-110 transition-transform' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <div className={`text-xs px-2 py-1 rounded-full ${
              trend.isPositive
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          </div>
        )}
      </div>
      <h3 className={`text-2xl font-bold text-white mb-1 ${isClickable ? 'group-hover:text-orange-400 transition-colors' : ''}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      <p className="text-sm text-slate-300 mb-1">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  )
}
