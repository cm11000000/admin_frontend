'use client';
// Client-only page; safe for static export

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const normalizeClient = (item: any): ClientOption | null => {
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
    id: toNumber(item.feeId ?? item.Id ?? item.id),
    payModeName: String(item.paymodename ?? item.payModeName ?? item.payMode ?? '').trim(),
    endpointName: String(item.epname ?? item.endpoint ?? '').trim(),
    slabFloor: toNumber(item.slabfloor ?? item.slabFloor),
    slabCeiling: toNumber(item.slabceiling ?? item.slabCeiling),
    convCharges: toNumber(item.convcharges ?? item.convCharges),
    convChargesType: String(item.convchargestype ?? item.convChargesType ?? '').trim(),
    endpointCharges: toNumber(item.endpointcharge ?? item.endpointCharge ?? item.endPointcharge),
    endpointChargesType: String(item.endpointchargestypes ?? item.endpointChargesTypes ?? item.endPointchargesTypes ?? '').trim(),
    gst: toNumber(item.gst),
    gstType: String(item.gsttype ?? item.gstType ?? '').trim()
  };
};

const CloneRateMappingPage: React.FC = () => {
  const [userName, setUserName] = useState('');

  const [sourceClient, setSourceClient] = useState('');
  const [targetClient, setTargetClient] = useState('');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [previewFees, setPreviewFees] = useState<FeeRecord[]>([]);

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
          .map(normalizeClient)
          .filter((item): item is ClientOption => Boolean(item));

        const unique = Array.from(new Map(combined.map((item) => [item.code, item])).values()).sort((a, b) =>
          a.code.localeCompare(b.code)
        );

        setClients(unique);
      } catch (error: any) {
        console.error('Failed to load client lists', error);
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
      setPreviewFees([]);
      return;
    }

    let mounted = true;
    setIsLoadingPreview(true);

    RateMappingApiService.getFeeForUpdate(sourceClient)
      .then((data) => {
        if (!mounted) return;
        setPreviewFees((data || []).map(normalizeFeeRecord));
      })
      .catch((error) => {
        console.error('Failed to load fee preview', error);
        toast.error(error?.message || 'Unable to load source client fees');
        if (mounted) {
          setPreviewFees([]);
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

    if (previewFees.length === 0) {
      toast.error('Source client has no fees to clone');
      return;
    }

    const confirmed = window.confirm(
      `Clone ${previewFees.length} fee record${previewFees.length === 1 ? '' : 's'} from ${sourceClient} to ${targetClient}?`
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
          setPreviewFees([]);
          break;
        case 2:
        case 3:
          toast.error('Target client already has rate mapping configured.');
          break;
        default:
          toast.error('Target client not found in downstream system.');
          break;
      }
    } catch (error: any) {
      console.error('Clone operation failed', error);
      toast.error(error?.message || 'Failed to clone rate mapping');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Fast Forward Rate Mapping</h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          Clone production rate configurations from an existing client to a new client. Matches Angular's Fast Forward
          screen and uses the same <code>/clone/{'{'}source{'}'}/{'{'}target{'}'}/{'{'}user{'}'}</code> API.
        </p>
      </div>

      {/* Client Selection Section */}
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Client Selection</h2>
          <p className="mt-1 text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
            Select the source client to copy from and the target client to copy to
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <div className="relative z-20">
            <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
              Source client (existing)
            </Label>
            <div className="mt-2">
              <Combobox
                value={sourceClient}
                onChange={setSourceClient}
                options={clients.map((client) => ({
                  value: client.code,
                  label: `${client.code} — ${client.name}`
                }))}
                placeholder={isLoadingClients ? 'Loading clients…' : 'Select source client'}
                searchPlaceholder="Search clients..."
                emptyMessage="Client master unavailable."
                disabled={isLoadingClients || clients.length === 0}
                className="min-h-[44px] touch-manipulation"
              />
            </div>
          </div>

          <div className="relative z-10">
            <Label className="text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
              Target client (new)
            </Label>
            <div className="mt-2">
              <Combobox
                value={targetClient}
                onChange={setTargetClient}
                options={clients.map((client) => ({
                  value: client.code,
                  label: `${client.code} — ${client.name}`
                }))}
                placeholder={isLoadingClients ? 'Loading clients…' : 'Select target client'}
                searchPlaceholder="Search clients..."
                emptyMessage="Client master unavailable."
                disabled={isLoadingClients || clients.length === 0}
                className="min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 rounded-xl border border-gray-200 bg-gray-50 px-3 md:px-4 py-3 text-sm text-gray-600">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 md:h-5 md:w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-extrabold text-xs md:text-sm" style={{ letterSpacing: '-0.01em' }}>Clone rules</p>
              <p className="text-xs font-light" style={{ letterSpacing: '-0.01em' }}>
                Target client must not have existing rates. The clone endpoint returns ID=2/3 when the target already has
                mappings and ID=4 when the client is missing from the downstream SabPaisa2 database.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-end gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={() => { setSourceClient(''); setTargetClient(''); setPreviewFees([]); }}
            className="min-h-[52px] touch-manipulation"
          >
            Reset
          </Button>
          <Button
            onClick={handleClone}
            disabled={isCloning || !sourceClient || !targetClient}
            className="min-h-[52px] touch-manipulation"
          >
            {isCloning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clone rates →
          </Button>
        </div>
      </div>

      {/* Fee Preview Section */}
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Source Client Fee Preview</h2>
              <p className="mt-0.5 text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                {previewFees.length} slab{previewFees.length === 1 ? '' : 's'} will be cloned from
                {` ${sourceClient || '—'}`} to {` ${targetClient || '—'}`}
              </p>
            </div>
            {isLoadingPreview && <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-gray-600 flex-shrink-0" />}
          </div>
        </div>
        <div className="overflow-x-auto">
          {/* Mobile scroll hint */}
          <div className="md:hidden px-4 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-200 font-light" style={{ letterSpacing: '-0.01em' }}>
            Swipe left to see more columns →
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                  Payment Mode
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                  Endpoint
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                  Slab (₹)
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                  Conv Charges
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-right text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                  EP Charges
                </th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                  GST
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {!isLoadingPreview && previewFees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 md:py-12 text-center text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                    {sourceClient ? 'No fee configurations found for source client.' : 'Select a source client to preview.'}
                  </td>
                </tr>
              )}

              {isLoadingPreview && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 md:py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 md:h-6 md:w-6 animate-spin text-gray-600" />
                  </td>
                </tr>
              )}

              {!isLoadingPreview &&
                previewFees.map((fee) => (
                  <tr key={`${fee.id}-${fee.payModeName}-${fee.slabFloor}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-700 font-medium">
                      {fee.payModeName || '-'}
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-600">
                      {fee.endpointName || '-'}
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      <span className="text-emerald-600 font-medium">₹{fee.slabFloor.toLocaleString()}</span>
                      <span className="text-gray-600 mx-1">–</span>
                      <span className="text-emerald-600 font-medium">₹{fee.slabCeiling.toLocaleString()}</span>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      <span className="font-medium text-gray-700">{fee.convCharges.toFixed(2)}</span>
                      <span className="text-gray-600 text-xs ml-1">({fee.convChargesType || '-'})</span>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-right text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      <span className="font-medium text-gray-700">{fee.endpointCharges.toFixed(2)}</span>
                      <span className="text-gray-600 text-xs ml-1">({fee.endpointChargesType || '-'})</span>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                      <span className="font-medium text-gray-700">{fee.gst.toFixed(2)}</span>
                      <span className="text-gray-600 text-xs ml-1">({fee.gstType || '-'})</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CloneRateMappingPage;
