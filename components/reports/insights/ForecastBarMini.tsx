"use client";

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface Datum { day: string; expected: number }

interface Props {
  data: Datum[];
  height?: number;
  formatCurrency?: (n: number) => string;
}

export default function ForecastBarMini({ data, height = 250, formatCurrency }: Props) {
  const fmt = (v: any) => (formatCurrency ? formatCurrency(Number(v)) : String(v));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(value: any) => fmt(value)} />
        <Bar dataKey="expected" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

