'use client';

/**
 * Mobile-Friendly Transaction Filters Component
 * Drawer on mobile, sidebar on desktop
 */
import React, { useState } from 'react';
import { X, Filter, Calendar, DollarSign, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface FilterValues {
  search: string;
  status: string[];
  paymentMethod: string[];
  gateway: string[];
  clientId: string[];
  dateFrom: string;
  dateTo: string;
  amountFrom: number | null;
  amountTo: number | null;
  isSettled?: boolean;
}

interface TransactionFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: Partial<FilterValues>) => void;
  onApply: () => void;
  onClear: () => void;
  appliedCount?: number;
  className?: string;
}

const statusOptions = [
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'disputed', label: 'Disputed' },
];

const paymentMethodOptions = [
  { value: 'UPI', label: 'UPI' },
  { value: 'CC', label: 'Credit Card' },
  { value: 'DC', label: 'Debit Card' },
  { value: 'NB', label: 'Net Banking' },
  { value: 'WALLET', label: 'Wallet' },
];

const gatewayOptions = [
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'paytm', label: 'Paytm' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'ccavenue', label: 'CCAvenue' },
];

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  appliedCount = 0,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
    setOpen(false);
  };

  const handleClear = () => {
    const clearedFilters: FilterValues = {
      search: '',
      status: [],
      paymentMethod: [],
      gateway: [],
      clientId: [],
      dateFrom: '',
      dateTo: '',
      amountFrom: null,
      amountTo: null,
      isSettled: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClear();
  };

  const toggleArrayValue = (key: keyof FilterValues, value: string) => {
    const current = localFilters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleFilterChange(key, updated);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-semibold">Date Range</Label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dateFrom" className="text-xs text-gray-600">From</Label>
            <Input
              id="dateFrom"
              type="date"
              value={localFilters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dateTo" className="text-xs text-gray-600">To</Label>
            <Input
              id="dateTo"
              type="date"
              value={localFilters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Status</Label>
        <div className="space-y-2">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${option.value}`}
                checked={localFilters.status.includes(option.value)}
                onCheckedChange={() => toggleArrayValue('status', option.value)}
              />
              <label
                htmlFor={`status-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-semibold">Payment Method</Label>
        </div>
        <div className="space-y-2">
          {paymentMethodOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`payment-${option.value}`}
                checked={localFilters.paymentMethod.includes(option.value)}
                onCheckedChange={() => toggleArrayValue('paymentMethod', option.value)}
              />
              <label
                htmlFor={`payment-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Gateway */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-semibold">Gateway</Label>
        </div>
        <div className="space-y-2">
          {gatewayOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`gateway-${option.value}`}
                checked={localFilters.gateway.includes(option.value)}
                onCheckedChange={() => toggleArrayValue('gateway', option.value)}
              />
              <label
                htmlFor={`gateway-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Amount Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <Label className="text-sm font-semibold">Amount Range</Label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amountFrom" className="text-xs text-gray-600">Min Amount</Label>
            <Input
              id="amountFrom"
              type="number"
              placeholder="0"
              value={localFilters.amountFrom ?? ''}
              onChange={(e) => handleFilterChange('amountFrom', e.target.value ? Number(e.target.value) : null)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="amountTo" className="text-xs text-gray-600">Max Amount</Label>
            <Input
              id="amountTo"
              type="number"
              placeholder="100000"
              value={localFilters.amountTo ?? ''}
              onChange={(e) => handleFilterChange('amountTo', e.target.value ? Number(e.target.value) : null)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Settlement Status */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Settlement Status</Label>
        <Select
          value={localFilters.isSettled === undefined ? 'all' : localFilters.isSettled ? 'settled' : 'unsettled'}
          onValueChange={(value) => {
            if (value === 'all') {
              handleFilterChange('isSettled', undefined);
            } else {
              handleFilterChange('isSettled', value === 'settled');
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
            <SelectItem value="unsettled">Unsettled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={cn('gap-2', className)}>
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {appliedCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {appliedCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Transactions</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your transaction search
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <FilterContent />
        </div>

        <SheetFooter className="flex gap-2 mt-6 sticky bottom-0 bg-white pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Applied Filters Chips Component
export const AppliedFiltersChips: React.FC<{
  filters: FilterValues;
  onRemoveFilter: (key: keyof FilterValues, value?: string) => void;
}> = ({ filters, onRemoveFilter }) => {
  const chips: Array<{ key: keyof FilterValues; label: string; value?: string }> = [];

  if (filters.search) {
    chips.push({ key: 'search', label: `Search: ${filters.search}` });
  }
  filters.status.forEach(value => {
    chips.push({ key: 'status', label: `Status: ${value}`, value });
  });
  filters.paymentMethod.forEach(value => {
    chips.push({ key: 'paymentMethod', label: `Method: ${value}`, value });
  });
  filters.gateway.forEach(value => {
    chips.push({ key: 'gateway', label: `Gateway: ${value}`, value });
  });
  if (filters.dateFrom || filters.dateTo) {
    chips.push({
      key: 'dateFrom',
      label: `Date: ${filters.dateFrom || 'Any'} - ${filters.dateTo || 'Any'}`,
    });
  }
  if (filters.amountFrom !== null || filters.amountTo !== null) {
    chips.push({
      key: 'amountFrom',
      label: `Amount: ${filters.amountFrom || 0} - ${filters.amountTo || 'Any'}`,
    });
  }
  if (filters.isSettled !== undefined) {
    chips.push({
      key: 'isSettled',
      label: filters.isSettled ? 'Settled' : 'Unsettled',
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, index) => (
        <Badge
          key={`${chip.key}-${chip.value || ''}-${index}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          <span>{chip.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(chip.key, chip.value)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};
