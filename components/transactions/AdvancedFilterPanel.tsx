'use client';

import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '@/stores/transactionStore';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Filter,
  X,
  Save,
  Share2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdvancedFilterPanelProps {
  trigger?: React.ReactNode;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({ trigger }) => {
  const {
    filters,
    setFilter,
    setFilters,
    applyFilters,
    clearFilters,
    filterOptions,
    fetchFilterOptions,
    filterPresets,
    saveFilterPreset,
    loadFilterPreset,
    deleteFilterPreset,
    getAppliedFiltersCount,
  } = useTransactionStore();

  const [open, setOpen] = useState(false);
  const [savePresetDialog, setSavePresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetShared, setPresetShared] = useState(false);
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 1000000]);

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    amount: false,
    payment: false,
    customer: false,
    advanced: false,
    presets: false,
  });

  useEffect(() => {
    if (open) {
      fetchFilterOptions();
    }
  }, [open]);

  useEffect(() => {
    if (filters.amountFrom !== null || filters.amountTo !== null) {
      setAmountRange([
        filters.amountFrom || 0,
        filters.amountTo || 1000000,
      ]);
    }
  }, [filters.amountFrom, filters.amountTo]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMultiSelectChange = (
    key: keyof typeof filters,
    value: string,
    checked: boolean
  ) => {
    const current = filters[key] as string[];
    if (checked) {
      setFilter(key, [...current, value]);
    } else {
      setFilter(key, current.filter((v) => v !== value));
    }
  };

  const handleAmountRangeChange = (values: number[]) => {
    setAmountRange(values as [number, number]);
    setFilters({
      amountFrom: values[0],
      amountTo: values[1],
    });
  };

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let dateFrom = '';
    let dateTo = today.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        dateFrom = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateFrom = yesterday.toISOString().split('T')[0];
        dateTo = dateFrom;
        break;
      case 'last7':
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        dateFrom = last7.toISOString().split('T')[0];
        break;
      case 'last30':
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        dateFrom = last30.toISOString().split('T')[0];
        break;
      case 'last90':
        const last90 = new Date(today);
        last90.setDate(last90.getDate() - 90);
        dateFrom = last90.toISOString().split('T')[0];
        break;
    }

    setFilters({ dateFrom, dateTo });
  };

  const handleApply = () => {
    applyFilters();
    setOpen(false);
  };

  const handleClear = () => {
    clearFilters();
    setAmountRange([0, 1000000]);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    try {
      await saveFilterPreset(presetName, presetShared);
      setSavePresetDialog(false);
      setPresetName('');
      setPresetShared(false);
    } catch (error) {
      // Error handled
    }
  };

  const appliedCount = getAppliedFiltersCount();

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
              {appliedCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {appliedCount}
                </Badge>
              )}
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Apply advanced filters to refine your transaction search
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-6">
            {/* Filter Presets */}
            <Collapsible
              open={expandedSections.presets}
              onOpenChange={() => toggleSection('presets')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <h3 className="font-semibold">Saved Presets</h3>
                {expandedSections.presets ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                {filterPresets.length > 0 ? (
                  filterPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <button
                          onClick={() => {
                            loadFilterPreset(preset);
                            setOpen(false);
                          }}
                          className="text-sm font-medium hover:underline"
                        >
                          {preset.name}
                        </button>
                        {preset.isShared && (
                          <Badge variant="secondary" className="ml-2">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFilterPreset(preset.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No saved presets</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSavePresetDialog(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current Filters
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Basic Filters */}
            <Collapsible
              open={expandedSections.basic}
              onOpenChange={() => toggleSection('basic')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <h3 className="font-semibold">Basic Filters</h3>
                {expandedSections.basic ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                {/* Status */}
                <div>
                  <Label>Status</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['success', 'pending', 'failed', 'refunded', 'cancelled', 'disputed'].map(
                      (status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status.includes(status)}
                            onCheckedChange={(checked) =>
                              handleMultiSelectChange('status', status, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {status}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Date Presets */}
                <div>
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { label: 'Today', value: 'today' },
                      { label: 'Yesterday', value: 'yesterday' },
                      { label: 'Last 7d', value: 'last7' },
                      { label: 'Last 30d', value: 'last30' },
                      { label: 'Last 90d', value: 'last90' },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDatePreset(preset.value)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label htmlFor="dateFrom" className="text-xs">From</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilter('dateFrom', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateTo" className="text-xs">To</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilter('dateTo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Amount Range */}
            <Collapsible
              open={expandedSections.amount}
              onOpenChange={() => toggleSection('amount')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <h3 className="font-semibold">Amount Range</h3>
                {expandedSections.amount ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Min: ₹{amountRange[0].toLocaleString('en-IN')}</span>
                    <span className="text-sm">Max: ₹{amountRange[1].toLocaleString('en-IN')}</span>
                  </div>
                  <Slider
                    value={amountRange}
                    onValueChange={handleAmountRangeChange}
                    max={1000000}
                    step={1000}
                    className="my-4"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="amountFrom" className="text-xs">Min Amount</Label>
                      <Input
                        id="amountFrom"
                        type="number"
                        value={filters.amountFrom || ''}
                        onChange={(e) => setFilter('amountFrom', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amountTo" className="text-xs">Max Amount</Label>
                      <Input
                        id="amountTo"
                        type="number"
                        value={filters.amountTo || ''}
                        onChange={(e) => setFilter('amountTo', Number(e.target.value))}
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Payment Details */}
            <Collapsible
              open={expandedSections.payment}
              onOpenChange={() => toggleSection('payment')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <h3 className="font-semibold">Payment Details</h3>
                {expandedSections.payment ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                {/* Payment Method */}
                <div>
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filterOptions.paymentModes.map((mode) => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox
                          id={`payment-${mode}`}
                          checked={filters.paymentMethod.includes(mode)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange('paymentMethod', mode, checked as boolean)
                          }
                        />
                        <label htmlFor={`payment-${mode}`} className="text-sm cursor-pointer">
                          {mode}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gateway */}
                <div>
                  <Label>Gateway</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filterOptions.gateways.map((gateway) => (
                      <div key={gateway} className="flex items-center space-x-2">
                        <Checkbox
                          id={`gateway-${gateway}`}
                          checked={filters.gateway.includes(gateway)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange('gateway', gateway, checked as boolean)
                          }
                        />
                        <label htmlFor={`gateway-${gateway}`} className="text-sm cursor-pointer">
                          {gateway}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Type */}
                <div>
                  <Label>Card Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filterOptions.cardTypes.map((cardType) => (
                      <div key={cardType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cardType-${cardType}`}
                          checked={filters.cardType.includes(cardType)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange('cardType', cardType, checked as boolean)
                          }
                        />
                        <label htmlFor={`cardType-${cardType}`} className="text-sm cursor-pointer">
                          {cardType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Network */}
                <div>
                  <Label>Card Network</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filterOptions.cardNetworks.map((network) => (
                      <div key={network} className="flex items-center space-x-2">
                        <Checkbox
                          id={`network-${network}`}
                          checked={filters.cardNetwork.includes(network)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange('cardNetwork', network, checked as boolean)
                          }
                        />
                        <label htmlFor={`network-${network}`} className="text-sm cursor-pointer">
                          {network}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank */}
                <div>
                  <Label>Bank</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filterOptions.banks.map((bank) => (
                      <div key={bank} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bank-${bank}`}
                          checked={filters.bank.includes(bank)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange('bank', bank, checked as boolean)
                          }
                        />
                        <label htmlFor={`bank-${bank}`} className="text-sm cursor-pointer">
                          {bank}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Customer Search */}
            <Collapsible
              open={expandedSections.customer}
              onOpenChange={() => toggleSection('customer')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <h3 className="font-semibold">Customer Search</h3>
                {expandedSections.customer ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={filters.customerName}
                    onChange={(e) => setFilter('customerName', e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    value={filters.customerPhone}
                    onChange={(e) => setFilter('customerPhone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Advanced Search */}
            <Collapsible
              open={expandedSections.advanced}
              onOpenChange={() => toggleSection('advanced')}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <h3 className="font-semibold">Advanced Search</h3>
                {expandedSections.advanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div>
                  <Label htmlFor="orderTransactionId">Order/Transaction ID</Label>
                  <Input
                    id="orderTransactionId"
                    value={filters.orderTransactionId}
                    onChange={(e) => setFilter('orderTransactionId', e.target.value)}
                    placeholder="Enter order or transaction ID"
                  />
                </div>
                <div>
                  <Label htmlFor="utrRrnArn">UTR / RRN / ARN</Label>
                  <Input
                    id="utrRrnArn"
                    value={filters.utrRrnArn}
                    onChange={(e) => setFilter('utrRrnArn', e.target.value)}
                    placeholder="Enter UTR, RRN, or ARN"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={filters.location}
                    onChange={(e) => setFilter('location', e.target.value)}
                    placeholder="City, State, or Country"
                  />
                </div>
                <div>
                  <Label>Merchant</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {filterOptions.merchants.map((merchant) => (
                      <div key={merchant} className="flex items-center space-x-2">
                        <Checkbox
                          id={`merchant-${merchant}`}
                          checked={filters.clientId.includes(merchant)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange('clientId', merchant, checked as boolean)
                          }
                        />
                        <label htmlFor={`merchant-${merchant}`} className="text-sm cursor-pointer">
                          {merchant}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Device Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['web', 'mobile', 'app'].map((device) => (
                      <div key={device} className="flex items-center space-x-2">
                        <Checkbox
                          id={`device-${device}`}
                          checked={filters.deviceType.includes(device)}
                          onCheckedChange={(checked) =>
                            handleMultiSelectChange('deviceType', device, checked as boolean)
                          }
                        />
                        <label htmlFor={`device-${device}`} className="text-sm capitalize cursor-pointer">
                          {device}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Save Preset Dialog */}
      <Dialog open={savePresetDialog} onOpenChange={setSavePresetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Save your current filters as a preset for quick access later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="presetName">Preset Name</Label>
              <Input
                id="presetName"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Last 30 Days Failed Transactions"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="presetShared"
                checked={presetShared}
                onCheckedChange={(checked) => setPresetShared(checked as boolean)}
              />
              <label htmlFor="presetShared" className="text-sm cursor-pointer">
                Share with team
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavePresetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
