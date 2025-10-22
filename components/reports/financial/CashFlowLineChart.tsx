"use client";

import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Datum { name: string; inflows: number; outflows: number }

interface Props {
  data: Datum[];
  height?: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function CashFlowLineChart({ data, height = 300 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
        <Legend />
        <Line type="monotone" dataKey="inflows" stroke="#10b981" name="Inflows" strokeWidth={2} />
        <Line type="monotone" dataKey="outflows" stroke="#ef4444" name="Outflows" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

