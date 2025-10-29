'use client';

import { useMemo, useEffect, useState } from 'react';
import type { ChartType } from '@/types/reports';

interface ReportChartProps {
  type: ChartType;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  yAxisKey?: string;
  secondaryDataKey?: string;
  title?: string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

const defaultColors = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ReportChart({
  type,
  data,
  dataKey,
  xAxisKey = 'label',
  secondaryDataKey,
  title,
  height = 350,
  colors = defaultColors,
  showLegend = true,
  showGrid = true,
  className = '',
}: ReportChartProps) {
  const [Rc, setRc] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    import('recharts').then((mod) => mounted && setRc(mod));
    return () => { mounted = false };
  }, []);
  const chartColors = useMemo(() => colors, [colors]);

  const commonProps = {
    data,
    margin: { top: 5, right: 10, left: 10, bottom: 5 },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <Rc.LineChart {...commonProps}>
            {showGrid && (
              <Rc.CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            )}
            <Rc.XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.YAxis
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.Tooltip content={<CustomTooltip />} />
            {showLegend && <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />}
            <Rc.Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartColors[0]}
              strokeWidth={2}
              dot={{ fill: chartColors[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
            {secondaryDataKey && (
              <Rc.Line
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={chartColors[1]}
                strokeWidth={2}
                dot={{ fill: chartColors[1], r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </Rc.LineChart>
        );

      case 'bar':
        return (
          <Rc.BarChart {...commonProps}>
            {showGrid && (
              <Rc.CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            )}
            <Rc.XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.YAxis
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.Tooltip content={<CustomTooltip />} />
            {showLegend && <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />}
            <Rc.Bar dataKey={dataKey} fill={chartColors[0]} radius={[4, 4, 0, 0]} />
            {secondaryDataKey && (
              <Rc.Bar dataKey={secondaryDataKey} fill={chartColors[1]} radius={[4, 4, 0, 0]} />
            )}
          </Rc.BarChart>
        );

      case 'area':
        return (
          <Rc.AreaChart {...commonProps}>
            {showGrid && (
              <Rc.CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            )}
            <Rc.XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.YAxis
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.Tooltip content={<CustomTooltip />} />
            {showLegend && <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />}
            <Rc.Area
              type="monotone"
              dataKey={dataKey}
              stroke={chartColors[0]}
              fill={chartColors[0]}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            {secondaryDataKey && (
              <Rc.Area
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={chartColors[1]}
                fill={chartColors[1]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            )}
          </Rc.AreaChart>
        );

      case 'pie':
        return (
          <Rc.PieChart {...commonProps}>
            <Rc.Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry[xAxisKey]}: ${entry[dataKey]}`}
              labelLine={{ stroke: 'currentColor' }}
            >
              {data.map((entry, index) => (
                <Rc.Cell key={`cell-${index}`} fill={entry.color || chartColors[index % chartColors.length]} />
              ))}
            </Rc.Pie>
            <Rc.Tooltip content={<CustomTooltip />} />
            {showLegend && <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />}
          </Rc.PieChart>
        );

      case 'composed':
        return (
          <Rc.ComposedChart {...commonProps}>
            {showGrid && (
              <Rc.CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            )}
            <Rc.XAxis
              dataKey={xAxisKey}
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.YAxis
              className="text-xs text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <Rc.Tooltip content={<CustomTooltip />} />
            {showLegend && <Rc.Legend wrapperStyle={{ fontSize: '12px' }} />}
            <Rc.Bar dataKey={dataKey} fill={chartColors[0]} radius={[4, 4, 0, 0]} />
            {secondaryDataKey && (
              <Rc.Line
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={chartColors[1]}
                strokeWidth={2}
                dot={{ fill: chartColors[1], r: 4 }}
              />
            )}
          </Rc.ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>
      {title && (
        <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      {Rc ? (
        <Rc.ResponsiveContainer width="100%" height={height}>
          {renderChart() || <div />}
        </Rc.ResponsiveContainer>
      ) : (
        <div style={{ height }} className="w-full rounded-lg bg-gray-100 animate-pulse" />
      )}
    </div>
  );
}
