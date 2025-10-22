'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  Pencil,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import RateMappingApiService from '@/services/api/RateMappingApiService';

interface ClientOption {
  code: string;
  name: string;
}

interface FeeRecord {
  id: number;
  slabNumber: number;
  slabFloor: number;
  slabCeiling: number;
  convchargesType: 'percentage' | 'fixed';
  convcharges: number;
  endPointchargesTypes: 'percentage' | 'fixed';
  endPointcharge: number;
  gstType: 'percentage' | 'fixed';
  gst: number;
  convchargesApp: boolean;
  epchargesApp: boolean;
  payMode: string;
  endpoint: string;
  bankName: string;
}

interface RemarkRecord {
  clientCode?: string;
  clientName?: string;
  approvedBy?: string;
  approvedfor?: string;
  createdAt?: string;
  remarks?: string;
}

interface ManageFeeTabProps {
  clients: ClientOption[];
  userName: string;
  isAdmin: boolean;
}

const normalizeClient = (client: ClientOption): ClientOption => ({
  code: client.code ?? '',
  name: client.name ?? ''
});

const normalizeFee = (fee: any): FeeRecord => {
  const toNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const toChargeType = (value: any): 'percentage' | 'fixed' => {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized === 'fixed' ? 'fixed' : 'percentage';
  };

  const toBooleanFlag = (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    const numeric = toNumber(value);
    return numeric === 1;
  };

  return {
    id: toNumber(fee.feeId ?? fee.feeid ?? fee.Id ?? fee.id),
    slabNumber: toNumber(fee.slabNumber ?? fee.slabnumber),
    slabFloor: toNumber(fee.slabFloor ?? fee.slabfloor),
    slabCeiling: toNumber(fee.slabCeiling ?? fee.slabceiling),
    convchargesType: toChargeType(fee.convchargesType ?? fee.convchargestype),
    convcharges: toNumber(fee.convcharges),
    endPointchargesTypes: toChargeType(
      fee.endPointchargesTypes ?? fee.endpointchargestypes ?? fee.endpointChargesTypes
    ),
    endPointcharge: toNumber(fee.endPointcharge ?? fee.endpointcharge),
    gstType: toChargeType(fee.gstType ?? fee.gsttype),
    gst: toNumber(fee.gst),
    convchargesApp: toBooleanFlag(fee.convchargesApp ?? fee.convchargesapp ?? fee.param1),
    epchargesApp: toBooleanFlag(fee.epchargesApp ?? fee.epchargesapp ?? fee.param2),
    payMode: String(fee.paymodename ?? fee.payMode ?? fee.paymentMode ?? '').trim(),
    endpoint: String(fee.epname ?? fee.endpoint ?? '').trim(),
    bankName: String(fee.bankName ?? fee.bankname ?? '').trim()
  };
};

const normalizeRemarks = (items: any[]): RemarkRecord[] =>
  (items || []).map((item) => ({
    clientCode: item.client_code ?? item.clientCode,
    clientName: item.client_name ?? item.clientName,
    approvedBy: item.approved_by ?? item.approvedBy,
    approvedfor: item.approvedfor,
    createdAt: item.created_at ?? item.createdAt,
    remarks: item.remarks ?? item.approved_by
  }));

const ManageFeeTab: React.FC<ManageFeeTabProps> = ({ clients, userName, isAdmin }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreementUrl, setAgreementUrl] = useState<string | null>(null);
  const [isAgreementLoading, setIsAgreementLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeFee, setActiveFee] = useState<FeeRecord | null>(null);
  const [remarks, setRemarks] = useState('');
  const [remarksHistory, setRemarksHistory] = useState<RemarkRecord[]>([]);
  const [isRemarksLoading, setIsRemarksLoading] = useState(false);
  const [formData, setFormData] = useState({
    slabFloor: 0,
    slabCeiling: 0,
    convchargesType: 'percentage' as 'percentage' | 'fixed',
    convcharges: 0,
    endPointchargesTypes: 'percentage' as 'percentage' | 'fixed',
    endPointcharge: 0,
    gstType: 'percentage' as 'percentage' | 'fixed',
    convchargesApp: true,
    epchargesApp: true
  });

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.code,
        label: `${client.code} — ${client.name || 'Unnamed client'}`
      })),
    [clients]
  );

  const filteredFees = useMemo(() => {
    if (!tableSearch.trim()) {
      return feeRecords;
    }

    const term = tableSearch.trim().toLowerCase();
    return feeRecords.filter((fee) =>
      [fee.payMode, fee.endpoint, fee.bankName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [feeRecords, tableSearch]);

  useEffect(() => {
    if (!selectedClient) {
      setFeeRecords([]);
      setAgreementUrl(null);
      return;
    }

    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const fees = await RateMappingApiService.getFeeForUpdate(selectedClient);
        if (!mounted) return;
        setFeeRecords(fees.map(normalizeFee));
      } catch (error: any) {
        console.error('Failed to load fee configurations', error);
        toast.error(error?.message || 'Failed to load fee configurations');
        if (mounted) {
          setFeeRecords([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const loadAgreement = async () => {
      setIsAgreementLoading(true);
      try {
        const response = await fetch(
          'https://cobkyc.sabpaisa.in/kyc/upload-merchant-document/get-merchant-agreement-by-client-code/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ client_code: selectedClient })
          }
        );

        if (!mounted) return;

        if (response.ok) {
          const data: any[] = await response.json();
          if (Array.isArray(data) && data.length > 0 && data[0]?.file_path) {
            setAgreementUrl(String(data[0].file_path));
          } else {
            setAgreementUrl(null);
          }
        } else {
          setAgreementUrl(null);
        }
      } catch (error) {
        console.warn('Agreement lookup failed', error);
        if (mounted) {
          setAgreementUrl(null);
        }
      } finally {
        if (mounted) {
          setIsAgreementLoading(false);
        }
      }
    };

    load();
    loadAgreement();

    return () => {
      mounted = false;
    };
  }, [selectedClient]);

  const openEditModal = async (fee: FeeRecord) => {
    setActiveFee(fee);
    setFormData({
      slabFloor: fee.slabFloor,
      slabCeiling: fee.slabCeiling,
      convchargesType: fee.convchargesType,
      convcharges: fee.convcharges,
      endPointchargesTypes: fee.endPointchargesTypes,
      endPointcharge: fee.endPointcharge,
      gstType: fee.gstType,
      convchargesApp: fee.convchargesApp,
      epchargesApp: fee.epchargesApp
    });
    setRemarks('');
    setIsEditOpen(true);
    setIsRemarksLoading(true);
    try {
      const history = await RateMappingApiService.getRemarksData(fee.id);
      setRemarksHistory(normalizeRemarks(history));
    } catch (error) {
      console.warn('Failed to load remarks history', error);
      setRemarksHistory([]);
    } finally {
      setIsRemarksLoading(false);
    }
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setActiveFee(null);
    setRemarks('');
    setRemarksHistory([]);
  };

  const handleUpdateFee = async () => {
    if (!activeFee) return;

    if (!remarks.trim()) {
      toast.error('Remarks are required to update the fee');
      return;
    }

    if (formData.slabFloor >= formData.slabCeiling) {
      toast.error('Slab floor must be less than slab ceiling');
      return;
    }

    if (formData.convcharges <= 0 || formData.endPointcharge <= 0) {
      toast.error('Charges must be greater than zero');
      return;
    }

    try {
      const payload = {
        feeId: activeFee.id,
        slabNumber: activeFee.slabNumber,
        slabFloor: formData.slabFloor,
        slabCeiling: formData.slabCeiling,
        convchargesType: formData.convchargesType,
        convcharges: formData.convcharges,
        endPointchargesTypes: formData.endPointchargesTypes,
        endPointcharge: formData.endPointcharge,
        gstType: formData.gstType,
        gst: formData.gstType === 'fixed' ? 0 : 18,
        convchargesApp: formData.convchargesApp ? 1 : 0,
        epchargesApp: formData.epchargesApp ? 1 : 0
      };

      await RateMappingApiService.updateFeeByID(String(activeFee.id), payload);

      // Log history + remarks for audit parity with Angular
      await Promise.all([
        RateMappingApiService.approveFee({
          approved_by: userName,
          client_code: selectedClient,
          approvedfor: 'ManageFee'
        }),
        RateMappingApiService.approveFee({
          approved_by: `${userName}:${remarks.trim()}:${activeFee.id}`,
          client_code: selectedClient,
          approvedfor: 'updatefee'
        })
      ]);

      toast.success('Fee updated successfully');
      closeEditModal();
      // Reload fee list
      const refreshed = await RateMappingApiService.getFeeForUpdate(selectedClient);
      setFeeRecords(refreshed.map(normalizeFee));
    } catch (error: any) {
      console.error('Failed to update fee', error);
      toast.error(error?.message || 'Failed to update fee');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters Section */}
      <div className="relative z-20 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-lg">
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Client Selection</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
            Choose a client to manage their fee configurations
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div>
            <Label className="text-xs font-extrabold text-gray-600" style={{ letterSpacing: '-0.01em' }}>
              Client Code <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={clientOptions}
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder={isLoading ? 'Loading clients…' : 'Select a client'}
              searchPlaceholder="Search client code or name..."
              emptyMessage="No clients found"
              disabled={isLoading || clientOptions.length === 0}
              className="mt-2 min-h-[44px] touch-manipulation"
            />
            <p className="mt-2 text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
              {selectedClient
                ? `Managing fees for ${selectedClient}`
                : 'Choose a client to load rate configurations.'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 md:p-4 text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
              Update slabs, charges, and GST flags exactly as the Angular Manage Fee tab. All changes are logged to the
              production approval trail (`v2/REST/CheckFee/Approved`).
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 z-10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <Input
                  value={tableSearch}
                  onChange={(event) => setTableSearch(event.target.value)}
                  placeholder="Quick search (payment mode, endpoint, bank)"
                  className="pl-9 min-h-[44px] touch-manipulation"
                  disabled={feeRecords.length === 0}
                />
              </div>
              {agreementUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="min-h-[52px] touch-manipulation"
                >
                  <a href={agreementUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" /> View agreement
                  </a>
                </Button>
              )}
              {!agreementUrl && !isAgreementLoading && selectedClient && (
                <p className="text-xs text-gray-600">
                  No agreement uploaded for this client.
                </p>
              )}
              {isAgreementLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-600" />}
            </div>
          </div>
        </div>
      </div>

      {/* Fee Configurations Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Fee Configurations</h2>
              <p className="text-xs text-gray-600 mt-0.5 font-light" style={{ letterSpacing: '-0.01em' }}>
                {filteredFees.length} slab{filteredFees.length === 1 ? '' : 's'} loaded
              </p>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-gray-600" />}
          </div>
          <p className="text-xs text-gray-600 mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Edit requires remarks and logs an audit trail. Scroll horizontally to view all columns.
          </p>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
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
                    GST Type
                  </th>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {!isLoading && filteredFees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                      {selectedClient
                        ? 'No fee configurations available for the selected client.'
                        : 'Choose a client to load fee configurations.'}
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-600" />
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  filteredFees.map((fee) => (
                    <tr key={`${fee.id}-${fee.slabNumber}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium text-gray-900">
                        {fee.payMode || '-'}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600">
                        {fee.endpoint || '-'}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm font-medium text-emerald-700">
                        ₹{fee.slabFloor.toLocaleString()} – ₹{fee.slabCeiling.toLocaleString()}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{fee.convcharges.toFixed(2)}</span>{' '}
                        <span className="text-gray-600">({fee.convchargesType === 'fixed' ? '₹' : '%'})</span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right text-xs md:text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{fee.endPointcharge.toFixed(2)}</span>{' '}
                        <span className="text-gray-600">({fee.endPointchargesTypes === 'fixed' ? '₹' : '%'})</span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          fee.gstType === 'percentage'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-50 text-gray-700'
                        }`}>
                          {fee.gstType}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(fee)}
                          className="min-h-[52px] touch-manipulation"
                        >
                          <Pencil className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                          <span className="hidden sm:inline">Edit</span>
                          <span className="sm:hidden">Edit</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Fee Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>Edit Fee Configuration</DialogTitle>
            {activeFee && (
              <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                {activeFee.payMode} → {activeFee.endpoint} (Slab #{activeFee.slabNumber})
              </p>
            )}
          </DialogHeader>

          {activeFee && (
            <div className="space-y-4 md:space-y-6 py-2">
              {/* Slab Configuration Section */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>Slab Configuration</h3>
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label className="text-xs md:text-sm">Slab floor (₹)</Label>
                    <Input
                      type="number"
                      value={formData.slabFloor}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, slabFloor: Number(event.target.value) }))
                      }
                      className="mt-1 min-h-[44px] touch-manipulation"
                    />
                  </div>
                  <div>
                    <Label className="text-xs md:text-sm">Slab ceiling (₹)</Label>
                    <Input
                      type="number"
                      value={formData.slabCeiling}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, slabCeiling: Number(event.target.value) }))
                      }
                      className="mt-1 min-h-[44px] touch-manipulation"
                    />
                  </div>
                </div>
              </div>

              {/* Convenience Charges Section */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>Convenience Charges</h3>
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label className="text-xs md:text-sm">Conv charges value</Label>
                    <Input
                      type="number"
                      value={formData.convcharges}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, convcharges: Number(event.target.value) }))
                      }
                      className="mt-1 min-h-[44px] touch-manipulation"
                    />
                  </div>
                  <div>
                    <Label className="text-xs md:text-sm">Conv charges type</Label>
                    <Select
                      value={formData.convchargesType}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setFormData((prev) => ({ ...prev, convchargesType: value }))
                      }
                    >
                      <SelectTrigger className="mt-1 min-h-[44px] touch-manipulation">
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

              {/* Endpoint Charges Section */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>Endpoint Charges</h3>
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label className="text-xs md:text-sm">EP charges value</Label>
                    <Input
                      type="number"
                      value={formData.endPointcharge}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, endPointcharge: Number(event.target.value) }))
                      }
                      className="mt-1 min-h-[44px] touch-manipulation"
                    />
                  </div>
                  <div>
                    <Label className="text-xs md:text-sm">EP charges type</Label>
                    <Select
                      value={formData.endPointchargesTypes}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setFormData((prev) => ({ ...prev, endPointchargesTypes: value }))
                      }
                    >
                      <SelectTrigger className="mt-1 min-h-[44px] touch-manipulation">
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

              {/* GST Configuration Section */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>GST Configuration</h3>
                <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label className="text-xs md:text-sm">GST type</Label>
                    <Select
                      value={formData.gstType}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setFormData((prev) => ({ ...prev, gstType: value }))
                      }
                    >
                      <SelectTrigger className="mt-1 min-h-[44px] touch-manipulation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (18%)</SelectItem>
                        <SelectItem value="fixed">Fixed (₹0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tax Application Flags Section */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>Tax Application Flags</h3>
                <div className="grid gap-3 md:gap-4 grid-cols-1">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 md:px-4 md:py-3">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-700">Apply tax on conv charges</p>
                      <p className="text-xs text-gray-600">Mirrors Angular convchargesApp flag</p>
                    </div>
                    <Switch
                      checked={formData.convchargesApp}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, convchargesApp: checked }))
                      }
                      className="touch-manipulation"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 md:px-4 md:py-3">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-700">Apply tax on EP charges</p>
                      <p className="text-xs text-gray-600">Mirrors Angular epchargesApp flag</p>
                    </div>
                    <Switch
                      checked={formData.epchargesApp}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, epchargesApp: checked }))
                      }
                      className="touch-manipulation"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-3" style={{ letterSpacing: '-0.01em' }}>Audit Trail</h3>
                <div>
                  <Label className="text-xs md:text-sm">
                    Remarks <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    placeholder="Required – stored in approval trail"
                    className="mt-1 min-h-[44px] touch-manipulation"
                  />
                </div>
              </div>

              {/* Previous Remarks Section */}
              <div>
                <h3 className="text-xs font-extrabold uppercase text-gray-600 mb-2" style={{ letterSpacing: '-0.01em' }}>Previous Remarks</h3>
                {isRemarksLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading remarks…
                  </div>
                ) : remarksHistory.length === 0 ? (
                  <p className="mt-3 text-xs md:text-sm text-gray-600">
                    No historical remarks found for this fee.
                  </p>
                ) : (
                  <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-2 md:px-3 py-2 text-left font-medium text-gray-600">Timestamp</th>
                          <th className="px-2 md:px-3 py-2 text-left font-medium text-gray-600">Approved by</th>
                          <th className="px-2 md:px-3 py-2 text-left font-medium text-gray-600">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {remarksHistory.map((record, index) => (
                          <tr key={`${record.approvedBy}-${index}`}>
                            <td className="px-2 md:px-3 py-2 text-gray-600">
                              {record.createdAt || '—'}
                            </td>
                            <td className="px-2 md:px-3 py-2 text-gray-600">
                              {record.approvedBy || '—'}
                            </td>
                            <td className="px-2 md:px-3 py-2 text-gray-600">
                              {record.remarks || record.clientName || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={closeEditModal}
              className="w-full sm:w-auto min-h-[52px] touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFee}
              disabled={!isAdmin}
              className="w-full sm:w-auto min-h-[52px] touch-manipulation"
            >
              Update fee →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageFeeTab;
