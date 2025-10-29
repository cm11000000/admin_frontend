"use client";

import React, { useEffect, useState } from 'react';

interface Datum { name: string; value: number }

interface Props {
  data: Datum[];
  height?: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(amount));

export default function MarginBarChart({ data, height = 300 }: Props) {
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);

  if (!Rc) return <div style={{ height }} className="w-full rounded-lg bg-gray-100 animate-pulse" />;

  return (
    <Rc.ResponsiveContainer width="100%" height={height}>
      <Rc.BarChart data={data}>
        <Rc.CartesianGrid strokeDasharray="3 3" />
        <Rc.XAxis dataKey="name" />
        <Rc.YAxis />
        <Rc.Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
        <Rc.Bar dataKey="value" fill="#f97316" />
      </Rc.BarChart>
    </Rc.ResponsiveContainer>
  );
}
