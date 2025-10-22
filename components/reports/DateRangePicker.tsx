'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DateRange, DateRangePreset } from '@/types/reports';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  variant?: 'blue' | 'orange';
  helperText?: string;
}

const defaultPresets: DateRangePreset[] = [
  'today',
  'yesterday',
  'last_7_days',
  'last_30_days',
  'this_month',
  'custom',
];

const presetLabels: Record<DateRangePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_quarter: 'This Quarter',
  last_quarter: 'Last Quarter',
  this_year: 'This Year',
  custom: 'Custom Range',
};

function getPresetDateRange(preset: DateRangePreset): DateRange | null {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0] || '';

  switch (preset) {
    case 'today':
      return {
        from: formatDate(today),
        to: formatDate(today),
      };

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        from: formatDate(yesterday),
        to: formatDate(yesterday),
      };
    }

    case 'last_7_days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return {
        from: formatDate(sevenDaysAgo),
        to: formatDate(today),
      };
    }

    case 'last_30_days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        from: formatDate(thirtyDaysAgo),
        to: formatDate(today),
      };
    }

    case 'this_month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        from: formatDate(firstDay),
        to: formatDate(today),
      };
    }

    case 'last_month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        from: formatDate(firstDay),
        to: formatDate(lastDay),
      };
    }

    case 'this_quarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const firstDay = new Date(today.getFullYear(), quarter * 3, 1);
      return {
        from: formatDate(firstDay),
        to: formatDate(today),
      };
    }

    case 'last_quarter': {
      const quarter = Math.floor(today.getMonth() / 3) - 1;
      const year = quarter < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const adjustedQuarter = quarter < 0 ? 3 : quarter;
      const firstDay = new Date(year, adjustedQuarter * 3, 1);
      const lastDay = new Date(year, adjustedQuarter * 3 + 3, 0);
      return {
        from: formatDate(firstDay),
        to: formatDate(lastDay),
      };
    }

    case 'this_year': {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      return {
        from: formatDate(firstDay),
        to: formatDate(today),
      };
    }

    default:
      return null;
  }
}

export default function DateRangePicker({
  value,
  onChange,
  presets = defaultPresets,
  variant = 'blue',
  helperText,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('last_30_days');
  const [customFrom, setCustomFrom] = useState(value.from);
  const [customTo, setCustomTo] = useState(value.to);

  useEffect(() => {
    setCustomFrom(value.from);
    setCustomTo(value.to);
  }, [value]);

  const handlePresetClick = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const range = getPresetDateRange(preset);
      if (range) {
        onChange(range);
        setIsOpen(false);
      }
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onChange({ from: customFrom, to: customTo });
      setIsOpen(false);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Theme tokens
  const ring = variant === 'orange' ? 'focus:ring-orange-500' : 'focus:ring-blue-500';
  const ringOffset = 'focus:ring-offset-2 dark:focus:ring-offset-gray-800';
  const borderFocus = variant === 'orange' ? 'focus:border-orange-500' : 'focus:border-blue-500';
  const selectedPresetCls = variant === 'orange'
    ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
    : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
  const applyBtnCls = variant === 'orange'
    ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 320; // dropdown width
    const left = Math.min(
      rect.left + (window.scrollX || window.pageXOffset),
      (window.scrollX || window.pageXOffset) + window.innerWidth - width - 8
    );
    const top = rect.bottom + (window.scrollY || window.pageYOffset) + 8;
    setDropdownStyle({ position: 'fixed', top, left, zIndex: 9999, width });
    const onResize = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const l = Math.min(
        r.left + (window.scrollX || window.pageXOffset),
        (window.scrollX || window.pageXOffset) + window.innerWidth - width - 8
      );
      const t = r.bottom + (window.scrollY || window.pageYOffset) + 8;
      setDropdownStyle({ position: 'fixed', top: t, left: l, zIndex: 9999, width });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [isOpen]);

  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow focus:outline-none focus:ring-2 ${ring} dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600`}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">
          {formatDisplayDate(value.from)} - {formatDisplayDate(value.to)}
        </span>
        <span className="sm:hidden">Date Range</span>
        <svg
          className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {helperText && (
        <p className="mt-1 text-[11px] text-gray-500">{helperText}</p>
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && portalRoot && (
          <>
            {/* Backdrop */}
            {ReactDOM.createPortal(
              <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />, portalRoot
            )}

            {/* Dropdown Content */}
            {ReactDOM.createPortal(
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
              style={dropdownStyle}
            >
              <div className="p-4">
                {/* Presets */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Quick Select
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handlePresetClick(preset)}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          selectedPreset === preset
                            ? selectedPresetCls
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {presetLabels[preset]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                {selectedPreset === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${borderFocus} focus:outline-none focus:ring-1 ${ring} dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${borderFocus} focus:outline-none focus:ring-1 ${ring} dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                      />
                    </div>

                    <button
                      onClick={handleCustomApply}
                      className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${applyBtnCls} focus:outline-none focus:ring-2 ${ring} ${ringOffset}`}
                    >
                      Apply Range
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>, portalRoot)}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
