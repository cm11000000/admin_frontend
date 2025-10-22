"use client";

import React from "react";
import FilterPanel from "./FilterPanel";
import { Calendar } from "lucide-react";

interface SingleDateFilterPanelProps {
  title?: string;
  description?: string;
  dateLabel?: string;
  date: string;
  onDateChange: (value: string) => void;
  children?: React.ReactNode; // extra filters (e.g., Combobox)
  actions?: React.ReactNode;
}

export default function SingleDateFilterPanel({
  title,
  description,
  dateLabel = 'Date',
  date,
  onDateChange,
  children,
  actions,
}: SingleDateFilterPanelProps) {
  return (
    <FilterPanel title={title} description={description} actions={actions}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {children && <div className="relative z-50">{children}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline-block w-4 h-4 mr-1 text-gray-600" />
            {dateLabel}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>
    </FilterPanel>
  );
}

