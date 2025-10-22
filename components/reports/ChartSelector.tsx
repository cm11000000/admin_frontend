'use client';

import { motion } from 'framer-motion';
import { BarChart3, LineChart, PieChart, AreaChart } from 'lucide-react';
import type { ChartType } from '@/types/reports';

interface ChartSelectorProps {
  selectedType: ChartType;
  onChange: (type: ChartType) => void;
  availableTypes?: ChartType[];
}

const chartIcons: Record<ChartType, any> = {
  line: LineChart,
  bar: BarChart3,
  pie: PieChart,
  area: AreaChart,
  composed: BarChart3,
};

const chartLabels: Record<ChartType, string> = {
  line: 'Line',
  bar: 'Bar',
  pie: 'Pie',
  area: 'Area',
  composed: 'Combined',
};

export default function ChartSelector({
  selectedType,
  onChange,
  availableTypes = ['line', 'bar', 'pie', 'area'],
}: ChartSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-900">
      {availableTypes.map((type) => {
        const Icon = chartIcons[type];
        const isSelected = selectedType === type;

        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              isSelected
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="chart-selector-bg"
                className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-gray-800"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative hidden sm:inline">{chartLabels[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
