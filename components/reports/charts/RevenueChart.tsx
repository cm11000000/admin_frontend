'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/exportUtils';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    transactions: number;
    label?: string;
  }>;
  title?: string;
  height?: number;
  showTransactions?: boolean;
  compareData?: Array<{
    date: string;
    revenue: number;
    label?: string;
  }>;
  loading?: boolean;
}

const COLORS = {
  primary: '#f97316',
  secondary: '#3b82f6',
  success: '#10b981',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      <p className="font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold">
            {entry.dataKey === 'transactions' || entry.dataKey === 'compareTransactions'
              ? formatNumber(entry.value)
              : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function RevenueChart({
  data,
  title = 'Revenue Trend',
  height = 300,
  showTransactions = false,
  compareData,
  loading = false,
}: RevenueChartProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-[300px] bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </Card>
    );
  }

  const mergedData = compareData
    ? data.map((item, index) => ({
        ...item,
        compareRevenue: compareData[index]?.revenue || 0,
      }))
    : data;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
            <span className="text-slate-600 dark:text-slate-400">Current</span>
          </div>
          {compareData && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.secondary }} />
              <span className="text-slate-600 dark:text-slate-400">Previous</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={mergedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={{ stroke: '#e2e8f0' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          {showTransactions && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={{ stroke: '#e2e8f0' }}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue"
          />
          {compareData && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="compareRevenue"
              stroke={COLORS.secondary}
              strokeWidth={2}
              dot={{ fill: COLORS.secondary, r: 4 }}
              strokeDasharray="5 5"
              name="Previous Revenue"
            />
          )}
          {showTransactions && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke={COLORS.success}
              strokeWidth={2}
              dot={{ fill: COLORS.success, r: 4 }}
              name="Transactions"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
