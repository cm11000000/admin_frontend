"use client";

import React, { useEffect, useState } from 'react';

type RevenueItem = {
  category: string;
  amount: number;
  percentage: number;
};

interface Props {
  data: RevenueItem[];
  height?: number;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function RevenueDistributionPie({ data, height = 300 }: Props) {
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);

  if (!Rc) return <div style={{ height }} className="w-full rounded-lg bg-gray-100 animate-pulse" />;

  return (
    <Rc.ResponsiveContainer width="100%" height={height}>
      <Rc.PieChart>
        <Rc.Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: RevenueItem) => `${entry.category}: ${entry.percentage.toFixed(1)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((_, index) => (
            <Rc.Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Rc.Pie>
        <Rc.Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
      </Rc.PieChart>
    </Rc.ResponsiveContainer>
  );
}
