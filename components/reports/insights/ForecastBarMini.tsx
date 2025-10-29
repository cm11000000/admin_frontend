"use client";

import React, { useEffect, useState } from 'react';

interface Datum { day: string; expected: number }

interface Props {
  data: Datum[];
  height?: number;
  formatCurrency?: (n: number) => string;
}

export default function ForecastBarMini({ data, height = 250, formatCurrency }: Props) {
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);
  const fmt = (v: any) => (formatCurrency ? formatCurrency(Number(v)) : String(v));
  return Rc ? (
    <Rc.ResponsiveContainer width="100%" height={height}>
      <Rc.BarChart data={data}>
        <Rc.CartesianGrid strokeDasharray="3 3" />
        <Rc.XAxis dataKey="day" />
        <Rc.YAxis />
        <Rc.Tooltip formatter={(value: any) => fmt(value)} />
        <Rc.Bar dataKey="expected" fill="#8b5cf6" />
      </Rc.BarChart>
    </Rc.ResponsiveContainer>
  ) : (
    <div style={{ height }} className="w-full rounded-lg bg-gray-100 animate-pulse" />
  );
}
