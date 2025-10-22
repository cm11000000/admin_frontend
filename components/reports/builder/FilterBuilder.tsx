'use client';

import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IReportFilter, FilterOperator, FilterLogic, DataSource } from '@/types/reports';

interface FilterBuilderProps {
  dataSource: DataSource;
  filters: IReportFilter[];
  onChange: (filters: IReportFilter[]) => void;
}

const FIELD_OPTIONS: Record<DataSource, Array<{ value: string; label: string; type: 'string' | 'number' | 'date' | 'select' }>> = {
  transactions: [
    { value: 'transaction_id', label: 'Transaction ID', type: 'string' },
    { value: 'amount', label: 'Amount', type: 'number' },
    { value: 'status', label: 'Status', type: 'select' },
    { value: 'payment_method', label: 'Payment Method', type: 'select' },
    { value: 'gateway', label: 'Gateway', type: 'select' },
    { value: 'client_code', label: 'Client Code', type: 'string' },
    { value: 'customer_email', label: 'Customer Email', type: 'string' },
    { value: 'customer_phone', label: 'Customer Phone', type: 'string' },
    { value: 'transaction_date', label: 'Transaction Date', type: 'date' },
  ],
  refunds: [
    { value: 'refund_id', label: 'Refund ID', type: 'string' },
    { value: 'transaction_id', label: 'Transaction ID', type: 'string' },
    { value: 'refund_amount', label: 'Refund Amount', type: 'number' },
    { value: 'status', label: 'Status', type: 'select' },
    { value: 'refund_type', label: 'Refund Type', type: 'select' },
    { value: 'refund_date', label: 'Refund Date', type: 'date' },
  ],
  chargebacks: [
    { value: 'chargeback_id', label: 'Chargeback ID', type: 'string' },
    { value: 'transaction_id', label: 'Transaction ID', type: 'string' },
    { value: 'amount', label: 'Amount', type: 'number' },
    { value: 'status', label: 'Status', type: 'select' },
    { value: 'reason', label: 'Reason', type: 'string' },
    { value: 'chargeback_date', label: 'Chargeback Date', type: 'date' },
  ],
  settlements: [
    { value: 'settlement_id', label: 'Settlement ID', type: 'string' },
    { value: 'batch_number', label: 'Batch Number', type: 'string' },
    { value: 'total_amount', label: 'Total Amount', type: 'number' },
    { value: 'status', label: 'Status', type: 'select' },
    { value: 'settlement_date', label: 'Settlement Date', type: 'date' },
  ],
};

const OPERATOR_OPTIONS: Record<string, Array<{ value: FilterOperator; label: string }>> = {
  string: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'gt', label: 'Greater Than' },
    { value: 'lt', label: 'Less Than' },
    { value: 'gte', label: 'Greater Than or Equal' },
    { value: 'lte', label: 'Less Than or Equal' },
    { value: 'between', label: 'Between' },
  ],
  date: [
    { value: 'equals', label: 'On' },
    { value: 'gt', label: 'After' },
    { value: 'lt', label: 'Before' },
    { value: 'between', label: 'Between' },
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is Not' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not In' },
  ],
};

const SELECT_OPTIONS: Record<string, string[]> = {
  status: ['success', 'failed', 'pending'],
  payment_method: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'],
  gateway: ['razorpay', 'payu', 'ccavenue', 'paytm'],
  refund_type: ['full', 'partial'],
};

export default function FilterBuilder({ dataSource, filters, onChange }: FilterBuilderProps) {
  const [filterRows, setFilterRows] = useState<IReportFilter[]>(
    filters.length > 0 ? filters : [generateEmptyFilter()]
  );

  function generateEmptyFilter(): IReportFilter {
    return {
      id: `filter_${Date.now()}_${Math.random()}`,
      field: '',
      operator: 'equals',
      value: '',
      logic: 'AND',
    };
  }

  function addFilter() {
    const newFilter = generateEmptyFilter();
    const updated = [...filterRows, newFilter];
    setFilterRows(updated);
    onChange(updated);
  }

  function removeFilter(id: string) {
    const updated = filterRows.filter(f => f.id !== id);
    setFilterRows(updated);
    onChange(updated);
  }

  function updateFilter(id: string, updates: Partial<IReportFilter>) {
    const updated = filterRows.map(f => (f.id === id ? { ...f, ...updates } : f));
    setFilterRows(updated);
    onChange(updated);
  }

  function getFieldType(field: string): 'string' | 'number' | 'date' | 'select' {
    const fieldOption = FIELD_OPTIONS[dataSource].find(f => f.value === field);
    return fieldOption?.type || 'string';
  }

  function renderValueInput(filter: IReportFilter) {
    const fieldType = getFieldType(filter.field);

    if (filter.operator === 'between') {
      return (
        <div className="flex gap-2">
          <Input
            type={fieldType === 'date' ? 'date' : 'number'}
            placeholder="From"
            value={Array.isArray(filter.value) ? filter.value[0] : ''}
            onChange={(e) =>
              updateFilter(filter.id, {
                value: [e.target.value, Array.isArray(filter.value) ? filter.value[1] : ''],
              })
            }
            className="flex-1"
          />
          <Input
            type={fieldType === 'date' ? 'date' : 'number'}
            placeholder="To"
            value={Array.isArray(filter.value) ? filter.value[1] : ''}
            onChange={(e) =>
              updateFilter(filter.id, {
                value: [Array.isArray(filter.value) ? filter.value[0] : '', e.target.value],
              })
            }
            className="flex-1"
          />
        </div>
      );
    }

    if (fieldType === 'select') {
      const options = SELECT_OPTIONS[filter.field] || [];
      const isMulti = filter.operator === 'in' || filter.operator === 'not_in';

      return (
        <select
          value={isMulti ? '' : filter.value}
          onChange={(e) => {
            if (isMulti) {
              const currentValues = Array.isArray(filter.value) ? filter.value : [];
              if (e.target.value && !currentValues.includes(e.target.value)) {
                updateFilter(filter.id, { value: [...currentValues, e.target.value] });
              }
            } else {
              updateFilter(filter.id, { value: e.target.value });
            }
          }}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (fieldType === 'date') {
      return (
        <Input
          type="date"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
        />
      );
    }

    if (fieldType === 'number') {
      return (
        <Input
          type="number"
          placeholder="Enter value"
          value={filter.value}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
        />
      );
    }

    return (
      <Input
        type="text"
        placeholder="Enter value"
        value={filter.value}
        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
      />
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Filters
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Add conditions to filter your report data
          </p>
        </div>
        <Button
          onClick={addFilter}
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Filter
        </Button>
      </div>

      <div className="space-y-3">
        {filterRows.map((filter, index) => (
          <div key={filter.id} className="space-y-2">
            {index > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={filter.logic}
                  onChange={(e) =>
                    updateFilter(filter.id, { logic: e.target.value as FilterLogic })
                  }
                  className="px-3 py-1 text-sm border border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
                <div className="flex-1 border-t border-slate-300 dark:border-slate-700" />
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  value={filter.field}
                  onChange={(e) => updateFilter(filter.id, { field: e.target.value, value: '' })}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Field</option>
                  {FIELD_OPTIONS[dataSource].map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filter.operator}
                  onChange={(e) =>
                    updateFilter(filter.id, { operator: e.target.value as FilterOperator, value: '' })
                  }
                  disabled={!filter.field}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
                >
                  {OPERATOR_OPTIONS[getFieldType(filter.field)].map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>

                <div>{renderValueInput(filter)}</div>
              </div>

              <Button
                onClick={() => removeFilter(filter.id)}
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                disabled={filterRows.length === 1}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filterRows.length > 0 && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Filter Summary:
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            {filterRows
              .filter(f => f.field && f.value)
              .map((f, i) => {
                const field = FIELD_OPTIONS[dataSource].find(fo => fo.value === f.field);
                const operator = OPERATOR_OPTIONS[getFieldType(f.field)].find(o => o.value === f.operator);
                return `${i > 0 ? ` ${f.logic} ` : ''}${field?.label || f.field} ${operator?.label || f.operator} ${Array.isArray(f.value) ? f.value.join(' - ') : f.value}`;
              })
              .join('') || 'No filters applied'}
          </p>
        </div>
      )}
    </Card>
  );
}
