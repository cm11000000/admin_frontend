'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Info,
  Loader2,
  RotateCcw,
  Search
} from 'lucide-react';
import RateMappingApiService from '@/services/api/RateMappingApiService';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';

type RawClient = Record<string, unknown>;

interface ClientOption {
  code: string;
  name: string;
  raw: RawClient;
}

interface FeeRow extends Record<string, unknown> {
  paymodename?: string;
  epname?: string;
  slabfloor?: number | string;
  slabceiling?: number | string;
  convcharges?: number | string;
  convchargestype?: string;
  endpointcharge?: number | string;
  endpointchargestypes?: string;
  gst?: number | string;
  gsttype?: string;
  feeforward?: string;
  feeForward?: string;
  epmrchntid?: number | string;
}

const TABLE_COLUMNS: Array<{ key: keyof FeeRow; label: string; align?: 'left' | 'right' }> = [
  { key: 'paymodename', label: 'Payment Mode' },
  { key: 'epname', label: 'EP Name' },
  { key: 'slabfloor', label: 'Slab Floor', align: 'right' },
  { key: 'slabceiling', label: 'Slab Ceiling', align: 'right' },
  { key: 'convcharges', label: 'Conv Charges', align: 'right' },
  { key: 'convchargestype', label: 'Conv Charges Type' },
  { key: 'endpointcharge', label: 'EP Charge', align: 'right' },
  { key: 'endpointchargestypes', label: 'EP Charges Type' },
  { key: 'gst', label: 'GST', align: 'right' },
  { key: 'gsttype', label: 'GST Applied' }
];

const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const normaliseClient = (client: RawClient): ClientOption | null => {
  const code = String(
    client?.clientCode ?? client?.client_code ?? client?.clientcode ?? ''
  ).trim();
  if (!code) {
    return null;
  }

  const name = String(
    client?.clientName ?? client?.client_name ?? client?.clientname ?? ''
  ).trim();

  return {
    code,
    name,
    raw: client
  };
};

const extractFeeForwardMessage = (rows: FeeRow[]): string => {
  if (!rows.length) {
    return '';
  }

  const flag = String(
    rows[0]?.feeforward ?? rows[0]?.feeForward ?? ''
  ).trim();

  if (!flag) {
    return '';
  }

  return flag.toUpperCase() === 'YES'
    ? 'Charge borne by payer'
    : 'Charge borne by merchant';
};

const formatCell = (value: unknown, align?: 'left' | 'right'): string => {
  if (value === null || value === undefined || value === '') {
    return align === 'right' ? '0' : '-';
  }

  if (align === 'right') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      });
    }
  }

  return String(value);
};

export default function ViewRateMappingPage(): JSX.Element {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [userName, setUserName] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [isLoadingFees, setIsLoadingFees] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feeForwardNote, setFeeForwardNote] = useState('');

  const clientCacheRef = useRef<
    { timestamp: number; items: ClientOption[]; login: string } | null
  >(
    null
  );

  const loadClients = useCallback(async (loginBy: string) => {
    if (
      clientCacheRef.current &&
      clientCacheRef.current.login === loginBy &&
      Date.now() - clientCacheRef.current.timestamp < CLIENT_CACHE_TTL
    ) {
      setClients(clientCacheRef.current.items);
      return;
    }

    setIsLoadingClients(true);

    try {
      const response = await ReportApiService.getClientCodeListUSP_Cached(loginBy);
      console.log('[RateMapping] Raw client response:', response?.length, 'clients');

      const mapped = Array.isArray(response)
        ? response
            .map(normaliseClient)
            .filter((item): item is ClientOption => Boolean(item))
        : [];

      console.log('[RateMapping] After filtering:', mapped.length, 'valid clients');

      const sorted = mapped.sort((a, b) => a.code.localeCompare(b.code));
      setClients(sorted);
      clientCacheRef.current = {
        items: sorted,
        timestamp: Date.now(),
        login: loginBy
      };
    } catch (error) {
      console.error('Client lookup failed', error);
      toast.error('Unable to load client list');
    } finally {
      setIsLoadingClients(false);
    }
  }, []);

  const fetchFees = useCallback(async (clientCode: string) => {
    if (!clientCode) {
      setFees([]);
      setFeeForwardNote('');
      setErrorMessage('');
      return;
    }

    setIsLoadingFees(true);
    setErrorMessage('');
    setFees([]);
    setFeeForwardNote('');

    try {
      const raw = await RateMappingApiService.findCheckFee(clientCode);
      const rows: FeeRow[] = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.results)
          ? (raw as any).results
          : [];

      if (!rows.length) {
        setErrorMessage('No rate mapping found for the selected client.');
        return;
      }

      setFees(rows);
      setFeeForwardNote(extractFeeForwardMessage(rows));
    } catch (error) {
      console.error('Failed to load rate configurations', error);
      setErrorMessage('Failed to load rate configurations.');
      toast.error('Unable to load rate configurations');
    } finally {
      setIsLoadingFees(false);
    }
  }, []);

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

    loadClients(userName);
  }, [userName, loadClients]);

  useEffect(() => {
    if (selectedClient) {
      fetchFees(selectedClient);
    }
  }, [selectedClient, fetchFees]);

  const filteredClients = useMemo(() => {
    const term = clientSearchTerm.trim().toLowerCase();
    const matches = term
      ? clients.filter((client) => {
          const composite = `${client.code} ${client.name}`.toLowerCase();
          return composite.includes(term);
        })
      : clients;

    return {
      list: matches.slice(0, 200),
      total: matches.length
    };
  }, [clientSearchTerm, clients]);

  const autoSelectClient = useCallback(() => {
    const term = clientSearchTerm.trim().toLowerCase();
    if (!term) {
      return;
    }

    const exact = clients.find((client) => client.code.toLowerCase() === term);
    if (exact) {
      setSelectedClient(exact.code);
      setClientSearchTerm(exact.code);
      return;
    }

    const startsWith = clients.find((client) => client.code.toLowerCase().startsWith(term));
    if (startsWith) {
      setSelectedClient(startsWith.code);
      setClientSearchTerm(startsWith.code);
      return;
    }

    const contains = clients.find((client) => {
      const composite = `${client.code} ${client.name}`.toLowerCase();
      return composite.includes(term);
    });

    if (contains) {
      setSelectedClient(contains.code);
      setClientSearchTerm(contains.code);
      return;
    }

    toast.error('No matching client found');
  }, [clientSearchTerm, clients]);

  const filteredFees = useMemo(() => {
    if (!tableSearchTerm) {
      return fees;
    }

    const term = tableSearchTerm.toLowerCase();
    return fees.filter((row) =>
      TABLE_COLUMNS.some(({ key }) => {
        const value = row[key];
        return (
          value !== undefined &&
          value !== null &&
          value.toString().toLowerCase().includes(term)
        );
      })
    );
  }, [fees, tableSearchTerm]);

  const handleReset = () => {
    setSelectedClient('');
    setClientSearchTerm('');
    setFees([]);
    setTableSearchTerm('');
    setFeeForwardNote('');
    setErrorMessage('');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Section Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
          View Rate Mapping
        </h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          Review production fee slabs per client exactly as the Angular View Configuration module.
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 shadow-xl space-y-4 relative z-20">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1.5" style={{ letterSpacing: '-0.01em' }}>
              Client Code <span className="text-red-500">*</span>
            </label>
            <Combobox
              options={clients.map((client) => ({
                value: client.code,
                label: `${client.code} — ${client.name || 'Unnamed Client'}`
              }))}
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder="Search and select client..."
              searchPlaceholder="Type to search by client code or name..."
              emptyMessage={
                isLoadingClients
                  ? 'Loading clients...'
                  : 'No matching clients found'
              }
              disabled={isLoadingClients || clients.length === 0}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
              {isLoadingClients
                ? 'Loading clients…'
                : clients.length > 0
                  ? `${clients.length} clients available. Start typing to search by code or name.`
                  : 'No clients available.'}
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-300 bg-gray-50 p-3 md:p-4 text-sm">
            <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700 font-extrabold" style={{ letterSpacing: '-0.01em' }}>
                Rate Mapping is read-only
              </p>
              <p className="text-xs text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
                Data is sourced from the production `rest/client_ep/Fee/{'{clientCode}'}` endpoint. Use the rate update flows for changes.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                value={tableSearchTerm}
                onChange={(e) => setTableSearchTerm(e.target.value)}
                placeholder="Filter table (payment mode, EP, GST...)"
                className="pl-9 min-h-[44px] touch-manipulation"
                disabled={!fees.length}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={!selectedClient && !fees.length}
              className="border-gray-300 text-gray-700 hover:text-gray-900 hover:border-orange-400 min-h-[52px] touch-manipulation whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {selectedClient && feeForwardNote && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 md:p-4 text-sm text-amber-700">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700 font-extrabold" style={{ letterSpacing: '-0.01em' }}>
                Fee Forwarding Note for {selectedClient}
              </p>
              <p className="text-xs text-amber-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>{feeForwardNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rate Configurations Table Section */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
              Rate Configurations
            </p>
              <p className="text-xs text-gray-600 mt-0.5 font-light" style={{ letterSpacing: '-0.01em' }}>
                {selectedClient
                  ? `Showing production rates for ${selectedClient}`
                  : 'Select a client to view rate mappings'}
              </p>
          </div>
          {isLoadingFees && <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />}
        </div>

        <div className="px-4 md:px-6 py-4 md:py-6">
          {isLoadingFees ? (
            <div className="py-12 flex items-center justify-center text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              <span className="font-light" style={{ letterSpacing: '-0.01em' }}>Loading rate configurations...</span>
            </div>
          ) : errorMessage ? (
            <div className="py-12">
              <div className="max-w-md mx-auto text-center bg-gray-50 border border-gray-300 rounded-2xl p-6">
                <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <p className="text-sm text-gray-700 font-extrabold mb-1" style={{ letterSpacing: '-0.01em' }}>{errorMessage}</p>
                <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                  {selectedClient
                    ? 'Verify that the client has active payment configurations.'
                    : 'Choose a client to fetch rate mapping details.'}
                </p>
              </div>
            </div>
          ) : !fees.length ? (
            <div className="py-12 text-center text-gray-600 text-sm font-light" style={{ letterSpacing: '-0.01em' }}>
              Select a client to view rate configurations.
            </div>
          ) : (
            <>
              {/* Mobile scroll hint */}
              <div className="mb-3 md:hidden">
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                    <span className="text-[10px]">⟷</span>
                  </span>
                  Scroll horizontally to view all columns
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {TABLE_COLUMNS.map(({ key, label, align }) => (
                        <th
                          key={key as string}
                          className={`px-3 md:px-4 py-2 md:py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 ${align === 'right' ? 'text-right' : 'text-left'}`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFees.map((row, index) => {
                      const chargeType = String(row.convchargestype || '').toLowerCase();
                      const isPercentage = chargeType.includes('%') || chargeType.includes('percent');

                      return (
                        <tr
                          key={`${row.paymodename ?? 'row'}-${index}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {TABLE_COLUMNS.map(({ key, align }) => {
                            const value = row[key];
                            let colorClass = 'text-gray-900';

                            // Color coding for specific columns
                            if (key === 'convcharges' && value) {
                              colorClass = isPercentage ? 'text-blue-600' : 'text-green-600';
                            } else if (key === 'gst' && value) {
                              colorClass = 'text-purple-600';
                            } else if (key === 'endpointcharge' && value) {
                              colorClass = 'text-orange-600';
                            }

                            return (
                              <td
                                key={`${String(key)}-${index}`}
                                className={`px-3 md:px-4 py-2 md:py-3 text-sm ${colorClass} ${align === 'right' ? 'text-right font-medium' : 'text-left'}`}
                              >
                                {formatCell(value, align)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-600 mt-3 font-light" style={{ letterSpacing: '-0.01em' }}>
                Displaying {filteredFees.length} of {fees.length} rows.
                <span className="ml-2 text-gray-400">•</span>
                <span className="ml-2 text-green-600">Conv Charges (Flat)</span>
                <span className="ml-2 text-blue-600">Conv Charges (%)</span>
                <span className="ml-2 text-orange-600">EP Charges</span>
                <span className="ml-2 text-purple-600">GST</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
