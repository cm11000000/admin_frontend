'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

// Client-only page; safe for static export
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import adminPagesApiService, {
  type ClientCode,
  type TransactionLimitResponse
} from '@/services/api/AdminPagesApiService';
import { resolveUserName } from '@/lib/utils';

interface NormalizedClient {
  code: string;
  name: string;
}

const normalizeClient = (client: ClientCode): NormalizedClient => ({
  code: client.clientCode,
  name: client.clientName ?? client.clientCode
});

export default function TransactionLimitPage(): JSX.Element {
  const [userName, setUserName] = useState('');
  const [clients, setClients] = useState<NormalizedClient[]>([]);
  const [selectedClient, setSelectedClient] = useState('');

  const [limitResponse, setLimitResponse] = useState<TransactionLimitResponse | null>(null);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [limitForm, setLimitForm] = useState({
    type: 'Daily' as 'Daily' | 'Monthly',
    value: ''
  });

  const [rangeForm, setRangeForm] = useState({
    min: '',
    max: ''
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setUserName(resolveUserName());
  }, []);

  useEffect(() => {
    if (!userName) {
      return;
    }

    let mounted = true;
    setIsLoadingClients(true);

    adminPagesApiService
      .getClientCodeList()
      .then((data) => {
        if (!mounted) return;
        const mapped = (data || [])
          .map(normalizeClient)
          .sort((a, b) => a.code.localeCompare(b.code));
        setClients(mapped);
      })
      .catch((error: any) => {
        console.error('Failed to load client list', error);
        toast.error(error?.message || 'Unable to load client list');
        if (mounted) {
          setClients([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingClients(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [userName]);

  useEffect(() => {
    if (!selectedClient) {
      setLimitResponse(null);
      setLimitForm({ type: 'Daily', value: '' });
      setRangeForm({ min: '', max: '' });
      return;
    }

    let mounted = true;
    setIsLoadingDetails(true);

    const loadDetails = async () => {
      try {
        await adminPagesApiService.getApiKey(selectedClient);
        const data = await adminPagesApiService.getTransactionLimit(selectedClient);
        if (!mounted) return;

        setLimitResponse(data);

        setLimitForm({
          type: (data.transaction_limit_type as 'Daily' | 'Monthly') || 'Daily',
          value: data.transaction_limit_value ? String(data.transaction_limit_value) : ''
        });

        setRangeForm({
          min: data.payment_amount_range?.minimum_payment_amount ? String(data.payment_amount_range.minimum_payment_amount) : '',
          max: data.payment_amount_range?.maximum_payment_amount ? String(data.payment_amount_range.maximum_payment_amount) : ''
        });
      } catch (error: any) {
        console.error('Failed to load transaction limit', error);
        toast.error(error?.message || 'Unable to load transaction limit');
        if (mounted) {
          setLimitResponse(null);
        }
      } finally {
        if (mounted) {
          setIsLoadingDetails(false);
        }
      }
    };

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [selectedClient]);

  const formatCurrency = (amount?: number) => {
    if (!Number.isFinite(amount)) return 'Not set';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount as number);
  };

  const parsePositiveNumber = (label: string, value: string, options?: { allowZero?: boolean }) => {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error(`${label} is required`);
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      throw new Error(`${label} must be a valid number`);
    }

    if (parsed < 0 || (!options?.allowZero && parsed === 0)) {
      throw new Error(`${label} must be greater than 0`);
    }

    return parsed;
  };

  const handleLimitSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    let value: number;

    try {
      value = parsePositiveNumber('Transaction limit value', limitForm.value);
    } catch (error: any) {
      toast.error(error?.message || 'Invalid transaction limit value');
      return;
    }

    setIsLoadingDetails(true);

    try {
      await adminPagesApiService.setTransactionLimit({
        client_code: selectedClient,
        transaction_limit_type: limitForm.type,
        transaction_limit_value: value
      });

      toast.success('Transaction limit updated successfully');
      const refreshed = await adminPagesApiService.getTransactionLimit(selectedClient);
      setLimitResponse(refreshed);
    } catch (error: any) {
      console.error('Failed to update transaction limit', error);
      toast.error(error?.message || 'Failed to update transaction limit');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleRangeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    let min: number;
    let max: number;

    try {
      min = parsePositiveNumber('Minimum amount', rangeForm.min, { allowZero: true });
      max = parsePositiveNumber('Maximum amount', rangeForm.max, { allowZero: false });
    } catch (error: any) {
      toast.error(error?.message || 'Invalid amount range');
      return;
    }

    if (min > max) {
      toast.error('Minimum amount cannot exceed maximum amount');
      return;
    }

    setIsLoadingDetails(true);

    try {
      await adminPagesApiService.setPaymentAmountRange(min, max, selectedClient);
      toast.success('Payment amount range updated successfully');
      const refreshed = await adminPagesApiService.getTransactionLimit(selectedClient);
      setLimitResponse(refreshed);
    } catch (error: any) {
      console.error('Failed to update payment range', error);
      toast.error(error?.message || 'Failed to update payment range');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const comboboxOptions = useMemo(() => {
    return clients.map((client) => ({
      value: client.code,
      label: `${client.code} — ${client.name}`
    }));
  }, [clients]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Transaction Limits</h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          Configure payment link transaction limits and amount ranges for clients. Matches Angular's payment-link-limit
          module and uses the same sendpaylink APIs.
        </p>
      </div>

      {/* Client Selection Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <div className="mb-3">
          <h2 className="text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Client Selection</h2>
          <p className="text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Select a client to view and manage transaction limits</p>
        </div>

        <div className="relative z-20">
          <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
            Client code
          </Label>
          <div className="mt-2">
            <Combobox
              options={comboboxOptions}
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder={isLoadingClients ? 'Loading clients...' : 'Search and select client...'}
              emptyMessage="No client found"
              searchPlaceholder="Search by code or name..."
              disabled={isLoadingClients || clients.length === 0}
              className="w-full min-h-[44px] touch-manipulation"
            />
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          The first request fetches the client's API key (required by sendpaylink) and then loads the latest limits.
        </div>
      </div>

      {/* Current Configuration and Update Forms */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Current Configuration</h2>
              <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                {selectedClient ? `Latest data for ${selectedClient}` : 'Select a client to view details.'}
              </p>
            </div>
            {isLoadingDetails && <Loader2 className="h-4 w-4 animate-spin text-gray-600" />}
          </div>

          {limitResponse ? (
            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 md:px-4 py-3 text-sm text-gray-600">
                <p className="text-xs uppercase text-gray-600 font-extrabold">Transaction limit</p>
                <p className="text-base md:text-lg font-extrabold text-gray-900 break-words" style={{ letterSpacing: '-0.02em' }}>
                  {limitResponse.transaction_limit_value
                    ? `${limitResponse.transaction_limit_value.toLocaleString()} (${limitResponse.transaction_limit_type || 'Daily'})`
                    : 'Not configured'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 md:px-4 py-3 text-sm text-gray-600">
                <p className="text-xs uppercase text-gray-600 font-extrabold">Payment amount range</p>
                <p className="text-base md:text-lg font-extrabold text-gray-900 break-words" style={{ letterSpacing: '-0.02em' }}>
                  {`${formatCurrency(limitResponse.payment_amount_range?.minimum_payment_amount)} → ${formatCurrency(limitResponse.payment_amount_range?.maximum_payment_amount)}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
              {selectedClient
                ? 'No transaction limit data available for this client yet.'
                : 'Choose a client to display current configuration.'}
            </p>
          )}
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Transaction Limit Form */}
          <form
            onSubmit={handleLimitSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl"
          >
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Set Transaction Limit</h3>
              <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                Updates `/set-payment-amount-range/` with limit type and value.
              </p>
            </div>

            <div className="mt-4 grid gap-4">
              <div>
                <Label className="text-sm font-extrabold">Limit type</Label>
                <Combobox
                  options={[
                    { value: 'Daily', label: 'Daily' },
                    { value: 'Monthly', label: 'Monthly' }
                  ]}
                  value={limitForm.type}
                  onChange={(value: string) => setLimitForm((prev) => ({ ...prev, type: value as 'Daily' | 'Monthly' }))}
                  placeholder="Select limit type"
                  emptyMessage="No type found"
                  disabled={!selectedClient}
                  className="w-full min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <Label className="text-sm font-extrabold">Limit value</Label>
                <Input
                  value={limitForm.value}
                  onChange={(event) => setLimitForm((prev) => ({ ...prev, value: event.target.value }))}
                  type="number"
                  min="1"
                  disabled={!selectedClient}
                  className="min-h-[44px] touch-manipulation"
                  placeholder="Enter limit value"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                disabled={!selectedClient || isLoadingDetails}
                className="min-h-[52px] touch-manipulation"
              >
                {isLoadingDetails && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save limit →
              </Button>
            </div>
          </form>

          {/* Payment Amount Range Form */}
          <form
            onSubmit={handleRangeSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl"
          >
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Set Payment Amount Range</h3>
              <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                Minimum can be zero. Maximum must be greater than zero and not smaller than minimum.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-extrabold">Minimum amount (₹)</Label>
                <Input
                  value={rangeForm.min}
                  onChange={(event) => setRangeForm((prev) => ({ ...prev, min: event.target.value }))}
                  type="number"
                  min="0"
                  disabled={!selectedClient}
                  className="min-h-[44px] touch-manipulation"
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-sm font-extrabold">Maximum amount (₹)</Label>
                <Input
                  value={rangeForm.max}
                  onChange={(event) => setRangeForm((prev) => ({ ...prev, max: event.target.value }))}
                  type="number"
                  min="1"
                  disabled={!selectedClient}
                  className="min-h-[44px] touch-manipulation"
                  placeholder="Enter max amount"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                disabled={!selectedClient || isLoadingDetails}
                className="min-h-[52px] touch-manipulation"
              >
                {isLoadingDetails && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save range →
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 px-3 md:px-4 py-3 text-sm text-amber-700 font-light" style={{ letterSpacing: '-0.01em' }}>
        <AlertCircle className="mr-2 inline-block h-4 w-4 flex-shrink-0" />
        <span className="inline">
          The sendpaylink APIs expect the client's API key in headers. The UI automatically fetches and stores it using the
          `get-api-key-by-client-code` endpoint before attempting limit updates.
        </span>
      </div>
    </div>
  );
}
