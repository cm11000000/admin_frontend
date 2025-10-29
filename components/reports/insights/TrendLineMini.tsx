"use client";

import React, { useEffect, useState } from 'react';

interface Props {
  values: number[];
  height?: number;
}

export default function TrendLineMini({ values, height = 200 }: Props) {
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);
  const data = (values || []).map((value, index) => ({ month: `Month ${index + 1}`, value }));
  return Rc ? (
    <Rc.ResponsiveContainer width="100%" height={height}>
      <Rc.LineChart data={data}>
        <Rc.CartesianGrid strokeDasharray="3 3" />
        <Rc.XAxis dataKey="month" />
        <Rc.YAxis />
        <Rc.Tooltip />
        <Rc.Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} />
      </Rc.LineChart>
    </Rc.ResponsiveContainer>
  ) : (
    <div style={{ height }} className="w-full rounded-lg bg-gray-100 animate-pulse" />
  );
}
