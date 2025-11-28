'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import RateMappingApiService from '@/services/api/RateMappingApiService';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

const normalizeOption = (item: any): Option | null => {
  const id = String(
    item?.clientId ??
      item?.client_id ??
      item?.paymodeId ??
      item?.payModeId ??
      item?.id ??
      ''
  ).trim();

  if (!id) {
    return null;
  }

  const name = String(
    item?.clientName ??
      item?.client_name ??
      item?.paymode ??
      item?.payMode ??
      item?.name ??
      id
  ).trim();

  return { id, name };
};

const normalizeClientOption = (item: any): Option | null => {
  const id = String(item?.client_code ?? item?.clientCode ?? '').trim();
  if (!id) return null;
  const name = String(item?.client_name ?? item?.clientName ?? id).trim();
  return { id, name };
};

export default function AddRateForNewPayModePage(): JSX.Element {
  const [userName, setUserName] = useState('');

  const [clients, setClients] = useState<Option[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const [paymodes, setPaymodes] = useState<Option[]>([]);
  const [isLoadingPaymodes, setIsLoadingPaymodes] = useState(false);

  const [endpoints, setEndpoints] = useState<Option[]>([]);
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(false);

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPaymode, setSelectedPaymode] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    amountFrom: '',
    amountTo: '',
    rate: '',
    commType: 'percentage' as 'percentage' | 'fixed',
    convFee: '',
    convFeeType: 'percentage' as 'percentage' | 'fixed',
    gstApplied: true
  });

  const resolveUserContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setUserName(resolveUserName());
  }, []);

  useEffect(() => {
    resolveUserContext();
  }, [resolveUserContext]);

  useEffect(() => {
    if (!userName) {
      return;
    }

    let mounted = true;

    const loadClients = async () => {
      setIsLoadingClients(true);
      try {
        const response = await ReportApiService.getClientCodeListUSP_Cached(userName);
        if (!mounted) return;

        const mapped = (response || [])
          .map(normalizeClientOption)
          .filter((item): item is Option => Boolean(item))
          .map((item) => ({
            id: item.id,
            name: item.name || item.id
          }))
          .sort((a, b) => a.id.localeCompare(b.id));

        setClients(mapped);
      } catch (error: any) {
        console.error('Failed to load client list', error);
        toast.error(error?.message || 'Unable to load client list');
        if (mounted) {
          setClients([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingClients(false);
        }
      }
    };

    loadClients();

    return () => {
      mounted = false;
    };
  }, [userName]);

  useEffect(() => {
    if (!selectedClient) {
      setPaymodes([]);
      setSelectedPaymode('');
      return;
    }

    let mounted = true;
    setIsLoadingPaymodes(true);

    RateMappingApiService.getPaymodeForAddNewRate(selectedClient)
      .then((data) => {
        if (!mounted) return;
        const mapped = (data || [])
          .map(normalizeOption)
          .filter((item): item is Option => Boolean(item))
          .sort((a, b) => a.name.localeCompare(b.name));
        setPaymodes(mapped);
        setSelectedPaymode('');
      })
      .catch((error) => {
        console.error('Failed to load payment modes', error);
        toast.error(error?.message || 'Failed to load payment modes');
        if (mounted) {
          setPaymodes([]);
          setSelectedPaymode('');
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingPaymodes(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedPaymode) {
      setEndpoints([]);
      setSelectedEndpoint('');
      return;
    }

    let mounted = true;
    setIsLoadingEndpoints(true);

    RateMappingApiService.getEndpointForAddNewRate(selectedPaymode)
      .then((data) => {
        if (!mounted) return;
        const mapped = (data || [])
          .map(normalizeOption)
          .filter((item): item is Option => Boolean(item))
          .sort((a, b) => a.name.localeCompare(b.name));
        setEndpoints(mapped);
        setSelectedEndpoint('');
      })
      .catch((error) => {
        console.error('Failed to load endpoints', error);
        toast.error(error?.message || 'Failed to load endpoints');
        if (mounted) {
          setEndpoints([]);
          setSelectedEndpoint('');
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingEndpoints(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedPaymode]);

  const parseNumberField = (label: string, value: string, options?: { allowZero?: boolean }) => {
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

  const resetForm = () => {
    setForm({
      amountFrom: '',
      amountTo: '',
      rate: '',
      commType: 'percentage',
      convFee: '',
      convFeeType: 'percentage',
      gstApplied: true
    });
    setSelectedClient('');
    setSelectedPaymode('');
    setSelectedEndpoint('');
    setPaymodes([]);
    setEndpoints([]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (!selectedPaymode) {
      toast.error('Please select a payment mode');
      return;
    }

    if (!selectedEndpoint) {
      toast.error('Please select an endpoint');
      return;
    }

    try {
      const amountFrom = parseNumberField('From amount', form.amountFrom, { allowZero: true });
      const amountTo = parseNumberField('To amount', form.amountTo, { allowZero: true });

      if (amountFrom > amountTo) {
        throw new Error('From amount cannot be greater than To amount');
      }

      const rate = parseNumberField('Rate', form.rate);
      const convFee = parseNumberField('Convenience fee', form.convFee, { allowZero: true });

      const commType = form.commType === 'fixed' ? 'fixed' : 'percentage';
      const convFeeType = form.convFeeType === 'fixed' ? 'fixed' : 'percentage';
      const gstper = form.gstApplied ? 18 : 0;

      const confirmed = window.confirm('Are you sure you want to add this fee for the selected payment mode?');
      if (!confirmed) {
        return;
      }

      setIsSubmitting(true);

      const response = await RateMappingApiService.addFeeForNewPaymentMode(
        selectedClient,
        selectedPaymode,
        selectedEndpoint,
        amountFrom,
        amountTo,
        rate,
        commType,
        convFee,
        convFeeType,
        userName,
        gstper
      );

      const success = Array.isArray(response)
        ? response.some((item) => String(item?.result).toLowerCase() === 'true')
        : String((response as any)?.result).toLowerCase() === 'true';

      if (success) {
        toast.success('Fee added successfully');
        resetForm();
      } else {
        toast.error('Fee could not be added. Please verify details and try again.');
      }
    } catch (error: any) {
      console.error('Failed to add fee for new payment mode', error);
      toast.error(error?.message || 'Failed to add fee for new payment mode');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Add Rate For New Pay Mode</h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          This flow mirrors the Angular add-new-rate workflow: choose a client, select a payment mode and endpoint, then
          configure the slab and charges. Submissions call the production `REST/AddFeeForNewPMode` endpoint and record the
          logged-in user as the approver.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 md:space-y-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl"
      >
        <div className="space-y-4 md:space-y-0 md:grid md:gap-6 md:grid-cols-2">
          <div className="relative z-20">
            <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
              Client Code <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={clients.map((client) => ({
                value: client.id,
                label: `${client.id} — ${client.name}`
              }))}
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder={isLoadingClients ? 'Loading clients…' : 'Search and select client'}
              emptyMessage="Client master unavailable."
              searchPlaceholder="Search client code or name..."
              disabled={isLoadingClients || clients.length === 0}
              className="min-h-[44px] touch-manipulation"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative z-10">
              <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                Payment Mode <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={paymodes.map((mode) => ({
                  value: mode.id,
                  label: mode.name
                }))}
              value={selectedPaymode}
              onChange={setSelectedPaymode}
                placeholder={selectedClient ? 'Search and select payment mode' : 'Select client first'}
                emptyMessage={
                  selectedClient
                    ? isLoadingPaymodes
                      ? 'Loading payment modes…'
                      : 'No additional payment modes available.'
                    : 'Select a client to view payment modes.'
                }
                searchPlaceholder="Search payment mode..."
                disabled={!selectedClient || isLoadingPaymodes || paymodes.length === 0}
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div className="relative z-10">
              <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                Endpoint <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={endpoints.map((endpoint) => ({
                  value: endpoint.id,
                  label: endpoint.name
                }))}
              value={selectedEndpoint}
              onChange={setSelectedEndpoint}
                placeholder={selectedPaymode ? 'Search and select endpoint' : 'Select payment mode first'}
                emptyMessage={
                  selectedPaymode
                    ? isLoadingEndpoints
                      ? 'Loading endpoints…'
                      : 'No endpoints available for this payment mode.'
                    : 'Select a payment mode to view endpoints.'
                }
                searchPlaceholder="Search endpoint..."
                disabled={!selectedPaymode || isLoadingEndpoints || endpoints.length === 0}
                className="min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900" style={{ letterSpacing: '-0.01em' }}>Rate Configuration</h3>
            <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Configure amount slab and commission details</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>From amount (₹)</Label>
              <Input
                value={form.amountFrom}
                onChange={(event) => setForm((prev) => ({ ...prev, amountFrom: event.target.value }))}
                type="number"
                min="0"
                className="mt-1.5 min-h-[44px] touch-manipulation"
              />
            </div>
            <div>
              <Label>To amount (₹)</Label>
              <Input
                value={form.amountTo}
                onChange={(event) => setForm((prev) => ({ ...prev, amountTo: event.target.value }))}
                type="number"
                min="0"
                className="mt-1.5 min-h-[44px] touch-manipulation"
              />
            </div>
            <div>
              <Label>Rate (%)</Label>
              <Input
                value={form.rate}
                onChange={(event) => setForm((prev) => ({ ...prev, rate: event.target.value }))}
                type="number"
                min="0"
                step="0.01"
                className="mt-1.5 min-h-[44px] touch-manipulation"
              />
            </div>
            <div>
              <Label>Commission type</Label>
              <Select
                value={form.commType}
                onValueChange={(value: 'percentage' | 'fixed') =>
                  setForm((prev) => ({ ...prev, commType: value }))
                }
              >
                <SelectTrigger className="mt-1.5 min-h-[44px] touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Convenience fee</Label>
              <Input
                value={form.convFee}
                onChange={(event) => setForm((prev) => ({ ...prev, convFee: event.target.value }))}
                type="number"
                min="0"
                step="0.01"
                className="mt-1.5 min-h-[44px] touch-manipulation"
              />
            </div>
            <div>
              <Label>Convenience fee type</Label>
              <Select
                value={form.convFeeType}
                onValueChange={(value: 'percentage' | 'fixed') =>
                  setForm((prev) => ({ ...prev, convFeeType: value }))
                }
              >
                <SelectTrigger className="mt-1.5 min-h-[44px] touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 md:px-4 md:py-3">
          <div>
            <p className="text-sm font-extrabold text-gray-600" style={{ letterSpacing: '-0.01em' }}>Apply GST</p>
            <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>When enabled, the request sends 18% as the GST rate.</p>
          </div>
          <Switch
            checked={form.gstApplied}
            onCheckedChange={(checked) => setForm((prev) => ({ ...prev, gstApplied: checked }))}
            className="min-h-[40px] touch-manipulation"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={isSubmitting}
            className="min-h-[52px] touch-manipulation"
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[52px] touch-manipulation"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit →
          </Button>
        </div>
      </form>
    </div>
  );
}
