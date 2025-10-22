'use client';
// Client-only page; safe for static export

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import RateMappingApiService from '@/services/api/RateMappingApiService';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';

interface ClientOption {
  code: string;
  name: string;
}

interface FeeRecord {
  id: number;
  payModeName: string;
  endpointName: string;
  slabFloor: number;
  slabCeiling: number;
  convCharges: number;
  convChargesType: string;
  endpointCharges: number;
  endpointChargesType: string;
  gst: number;
  gstType: string;
}

const normalizeClientOption = (item: any): ClientOption | null => {
  const code = String(
    item?.clientCode ?? item?.client_code ?? item?.clientcode ?? ''
  ).trim();

  if (!code) {
    return null;
  }

  const name = String(
    item?.clientName ?? item?.client_name ?? item?.clientname ?? ''
  ).trim();

  return { code, name };
};

const normalizeFeeRecord = (item: any): FeeRecord => {
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  return {
    id: toNumber(item.feeId ?? item.id ?? item.FeeId),
    payModeName: String(item.paymodename ?? item.payModeName ?? item.payMode ?? '').trim(),
    endpointName: String(item.epname ?? item.endpoint ?? '').trim(),
    slabFloor: toNumber(item.slabfloor ?? item.slabFloor),
    slabCeiling: toNumber(item.slabceiling ?? item.slabCeiling),
    convCharges: toNumber(item.convcharges ?? item.convCharges),
    convChargesType: String(item.convchargestype ?? item.convChargesType ?? '').trim(),
    endpointCharges: toNumber(item.endpointcharge ?? item.endPointcharge ?? item.endpointCharge),
    endpointChargesType: String(item.endpointchargestypes ?? item.endPointchargesTypes ?? '').trim(),
    gst: toNumber(item.gst),
    gstType: String(item.gsttype ?? item.gstType ?? '').trim()
  };
};

const AggregatorSwapPage: React.FC = () => {
  const [userName, setUserName] = useState('');

  const [sourceClient, setSourceClient] = useState('');
  const [targetClient, setTargetClient] = useState('');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clonePreview, setClonePreview] = useState<FeeRecord[]>([]);

  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

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

    const loadClients = async () => {
      try {
        const [allClients, mappingClients] = await Promise.all([
          ReportApiService.getClientCodeListUSP_Cached(userName),
          RateMappingApiService.getClientCodeListMapping()
        ]);

        if (!mounted) return;

        const combined = [...(allClients || []), ...(mappingClients || [])]
          .map(normalizeClientOption)
          .filter((item): item is ClientOption => Boolean(item));

        const unique = Array.from(new Map(combined.map((item) => [item.code, item])).values()).sort((a, b) =>
          a.code.localeCompare(b.code)
        );

        setClients(unique);
      } catch (error: any) {
        console.error('Failed to load client dropdown data', error);
        toast.error(error?.message || 'Unable to load client lists');
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
    if (!sourceClient) {
      setClonePreview([]);
      return;
    }

    let mounted = true;
    setIsLoadingPreview(true);

    RateMappingApiService.getFeeForUpdate(sourceClient)
      .then((data) => {
        if (!mounted) return;
        setClonePreview((data || []).map(normalizeFeeRecord));
      })
      .catch((error) => {
        console.error('Failed to load source fee preview', error);
        toast.error(error?.message || 'Unable to load source client rates');
        if (mounted) {
          setClonePreview([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingPreview(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [sourceClient]);

  const handleClone = async () => {
    if (!sourceClient || !targetClient) {
      toast.error('Please select both source and target clients');
      return;
    }

    if (sourceClient === targetClient) {
      toast.error('Source and target clients must be different');
      return;
    }

    if (clonePreview.length === 0) {
      toast.error('Source client has no fee configurations to clone');
      return;
    }

    const confirmed = window.confirm(
      `This will clone ${clonePreview.length} fee configurations from ${sourceClient} to ${targetClient}. Continue?`
    );

    if (!confirmed) {
      return;
    }

    setIsCloning(true);

    try {
      const response = await RateMappingApiService.cloneRateMapping(sourceClient, targetClient, userName);

      const resultCode = Array.isArray(response)
        ? Number(response[0]?.ID ?? response[0]?.result)
        : Number((response as any)?.ID ?? (response as any)?.result);

      switch (resultCode) {
        case 1:
          toast.success('Rate mapping cloned successfully');
          setSourceClient('');
          setTargetClient('');
          setClonePreview([]);
          break;
        case 2:
        case 3:
          toast.error('Target client already has rate configuration. Clone aborted.');
          break;
        default:
          toast.error('Target client does not exist in downstream system.');
          break;
      }
    } catch (error: any) {
      console.error('Failed to clone rate mapping', error);
      toast.error(error?.message || 'Failed to clone rate mapping');
    } finally {
      setIsCloning(false);
    }
  };

  const headerDescription = useMemo(() => {
    if (isLoadingClients) {
      return 'Loading client master…';
    }

    if (clients.length === 0) {
      return 'Client master unavailable. Retry after verifying your session.';
    }

    return 'Clone production rate mapping from an existing client to a new client in one step (Fast Forward).';
  }, [clients.length, isLoadingClients]);

  // Transform clients data for Combobox component
  const clientOptions = useMemo(() => {
    return clients.map((client) => ({
      value: client.code,
      label: `${client.code} — ${client.name}`
    }));
  }, [clients]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header Section */}
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-lg md:shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Fast Forward Rate Mapping</h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>{headerDescription}</p>
        <p className="mt-1 text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          This workflow mirrors Angular's clone screen. Source client fees are previewed before cloning; submissions hit the
          production <code>/clone/{'{'}source{'}'}/{'{'}target{'}'}/{'{'}user{'}'}</code> endpoint.
        </p>
      </div>

      {/* Client Selection Section */}
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-lg md:shadow-xl">
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Select Clients</h2>
          <p className="mt-1 text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
            Choose source client to copy from and target client to copy to
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <div className="relative z-20">
            <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
              Target client (new)
            </Label>
            <div className="mt-2">
              <Combobox
                options={clientOptions}
                value={targetClient}
                onChange={setTargetClient}
                placeholder={isLoadingClients ? 'Loading clients...' : 'Search and select target client'}
                emptyMessage="No clients found"
                disabled={isLoadingClients || clients.length === 0}
                searchPlaceholder="Search client code or name..."
                className="min-h-[44px] touch-manipulation"
              />
            </div>
          </div>

          <div className="relative z-10">
            <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
              Source client (existing)
            </Label>
            <div className="mt-2">
              <Combobox
                options={clientOptions}
                value={sourceClient}
                onChange={setSourceClient}
                placeholder={isLoadingClients ? 'Loading clients...' : 'Search and select source client'}
                emptyMessage="No clients found"
                disabled={isLoadingClients || clients.length === 0}
                searchPlaceholder="Search client code or name..."
                className="min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 rounded-xl border border-gray-200 bg-gray-50 p-3 md:px-4 md:py-3 text-sm text-gray-600">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-extrabold text-xs md:text-sm" style={{ letterSpacing: '-0.01em' }}>Important</p>
              <p className="text-xs mt-0.5 font-light" style={{ letterSpacing: '-0.01em' }}>
                Target client must not have existing rates. The clone endpoint returns code 2/3 when rates already exist,
                and code 4 when the client is missing in downstream systems.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={() => { setSourceClient(''); setTargetClient(''); setClonePreview([]); }}
            className="min-h-[52px] touch-manipulation w-full sm:w-auto"
          >
            Reset
          </Button>
          <Button
            onClick={handleClone}
            disabled={isCloning || !sourceClient || !targetClient}
            className="min-h-[52px] touch-manipulation w-full sm:w-auto"
          >
            {isCloning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clone rates →
          </Button>
        </div>
      </div>

      {/* Fee Preview Section */}
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-lg md:shadow-xl">
        <div className="border-b border-gray-200 p-4 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Source Client Fee Preview</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 font-light" style={{ letterSpacing: '-0.01em' }}>
                {clonePreview.length} slab{clonePreview.length === 1 ? '' : 's'} will be cloned from {sourceClient || '—'} to
                {` ${targetClient || '—'}`}
              </p>
            </div>
            {isLoadingPreview && <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-gray-600 flex-shrink-0" />}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                      Payment Mode
                    </th>
                    <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                      Endpoint
                    </th>
                    <th className="px-3 py-2.5 md:px-4 md:py-3 text-right text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                      Slab (₹)
                    </th>
                    <th className="px-3 py-2.5 md:px-4 md:py-3 text-right text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                      Conv Charges
                    </th>
                    <th className="px-3 py-2.5 md:px-4 md:py-3 text-right text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                      EP Charges
                    </th>
                    <th className="px-3 py-2.5 md:px-4 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                      GST
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {!isLoadingPreview && clonePreview.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 md:px-4 md:py-12 text-center text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                        {sourceClient ? 'No fee configurations found for source client.' : 'Select a source client to preview.'}
                      </td>
                    </tr>
                  )}

                  {isLoadingPreview && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 md:px-4 md:py-12 text-center">
                        <Loader2 className="mx-auto h-5 w-5 md:h-6 md:w-6 animate-spin text-gray-600" />
                      </td>
                    </tr>
                  )}

                  {!isLoadingPreview &&
                    clonePreview.map((fee) => (
                      <tr key={`${fee.id}-${fee.payModeName}-${fee.slabFloor}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm font-medium text-gray-700">
                          {fee.payModeName || '-'}
                        </td>
                        <td className="px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-600">
                          {fee.endpointName || '-'}
                        </td>
                        <td className="px-3 py-2.5 md:px-4 md:py-3 text-right text-xs md:text-sm text-gray-600">
                          <span className="font-mono">₹{fee.slabFloor.toLocaleString()} – ₹{fee.slabCeiling.toLocaleString()}</span>
                        </td>
                        <td className="px-3 py-2.5 md:px-4 md:py-3 text-right text-xs md:text-sm text-gray-600">
                          <span className="font-mono">{fee.convCharges.toFixed(2)}</span> ({fee.convChargesType || '-'})
                        </td>
                        <td className="px-3 py-2.5 md:px-4 md:py-3 text-right text-xs md:text-sm text-gray-600">
                          <span className="font-mono">{fee.endpointCharges.toFixed(2)}</span> ({fee.endpointChargesType || '-'})
                        </td>
                        <td className="px-3 py-2.5 md:px-4 md:py-3 text-xs md:text-sm text-gray-600">
                          <span className="font-mono">{fee.gst.toFixed(2)}</span> ({fee.gstType || '-'})
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Mobile scroll hint */}
          {clonePreview.length > 0 && (
            <div className="md:hidden p-2 text-center text-xs text-gray-600 bg-gray-50 border-t border-gray-200 font-light" style={{ letterSpacing: '-0.01em' }}>
              Swipe left to see more columns
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AggregatorSwapPage;
