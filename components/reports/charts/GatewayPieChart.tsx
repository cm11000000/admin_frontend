'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/exportUtils';

interface GatewayPieChartProps {
  data: Array<{
    gateway: string;
    amount: number;
    transactions: number;
    percentage: number;
  }>;
  title?: string;
  height?: number;
  loading?: boolean;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
      <p className="font-semibold text-sm mb-2">{data.gateway}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">Amount:</span>
          <span className="font-semibold">{formatCurrency(data.amount)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">Transactions:</span>
          <span className="font-semibold">{data.transactions.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">Share:</span>
          <span className="font-semibold">{formatPercentage(data.percentage)}</span>
        </div>
      </div>
    </div>
  );
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function GatewayPieChart({
  data,
  title = 'Gateway Distribution',
  height = 300,
  loading = false,
}: GatewayPieChartProps) {
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="h-[300px] bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h3>
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          No data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h3>

      {Rc ? (
        <Rc.ResponsiveContainer width="100%" height={height}>
          <Rc.PieChart>
            <Rc.Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel as any}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
              nameKey="gateway"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Rc.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Rc.Pie>
            <Rc.Tooltip content={<CustomTooltip />} />
            <Rc.Legend content={<CustomLegend />} />
          </Rc.PieChart>
        </Rc.ResponsiveContainer>
      ) : (
        <div style={{ height }} className="w-full rounded-lg bg-gray-100 animate-pulse" />
      )}

      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.slice(0, 4).map((item, index) => (
            <div key={index} className="text-center">
              <div
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                {item.gateway}
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(item.amount)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatPercentage(item.percentage)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
