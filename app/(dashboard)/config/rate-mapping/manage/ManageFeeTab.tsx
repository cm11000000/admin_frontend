'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Search, Loader2, Pencil, FileText, PlusCircle, Trash2, RefreshCw, Info } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { VIRT_THRESHOLD } from '@/config/perf';

interface ClientOption {
  code: string;
  name: string;
}

interface FeeRecord {
  feeId: number;
  paymodeId?: number;
  clientId?: number;
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
  const pickNumber = (obj: any, keys: string[]): number => {
    for (const k of keys) {
      const v = obj?.[k];
      const n = toNumber(v);
      if (n) return n;
    }
    return 0;
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
    feeId: pickNumber(fee, ['feeId', 'feeid', 'id', 'FeeId']),
    // Angular rows use Id for paymode in some responses; include multiple candidates
    paymodeId: pickNumber(fee, [
      'paymodeId', 'payModeId', 'paymodeid', 'paymentModeId', 'paymentmodeid', 'p_payment_id', 'Id'
    ]),
    clientId: pickNumber(fee, ['clientId', 'clientid', 'p_client_id']),
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
  const [selectedFeeIds, setSelectedFeeIds] = useState<Set<number>>(new Set());
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
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

  // Add Slab dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addFee, setAddFee] = useState<FeeRecord | null>(null);
  const [addForm, setAddForm] = useState({
    slabFloor: 0,
    slabCeiling: 0,
    convchargesType: 'percentage' as 'percentage' | 'fixed',
    convcharges: 0,
    endPointchargesTypes: 'percentage' as 'percentage' | 'fixed',
    endPointcharge: 0,
    gstType: 'percentage' as 'percentage' | 'fixed',
    convchargesApp: true,
    epchargesApp: true,
  });

  // Delete Slab dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFee, setDeleteFee] = useState<FeeRecord | null>(null);
  const [deleteRemarks, setDeleteRemarks] = useState('');

  // Fee Forwarded state
  const [isFFLoading, setIsFFLoading] = useState(false);
  const DEFAULT_GST_PERCENT = Number(process.env.NEXT_PUBLIC_DEFAULT_GST_PERCENT || 18);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [bulkForm, setBulkForm] = useState({
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

  // Virtualization state for potentially long fee lists
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const [virtScrollTop, setVirtScrollTop] = useState(0);
  const [virtViewportHeight, setVirtViewportHeight] = useState(0);
  const [virtRowHeight, setVirtRowHeight] = useState<number>(0);
  const virtualizationEnabled = filteredFees.length > VIRT_THRESHOLD;
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!virtualizationEnabled) return;
    const measure = () => {
      const el = tableScrollRef.current;
      if (!el) return;
      setVirtViewportHeight(el.clientHeight || 0);
      const firstRow = el.querySelector('tbody tr') as HTMLElement | null;
      const h = firstRow?.offsetHeight || 56;
      setVirtRowHeight(h);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [virtualizationEnabled, filteredFees.length]);

  const onTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!virtualizationEnabled) return;
    setVirtScrollTop(e.currentTarget.scrollTop || 0);
  };

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
        const data = await RateMappingApiService.viewPDF(selectedClient);
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0 && data[0]?.file_path) {
          setAgreementUrl(String(data[0].file_path));
        } else {
          setAgreementUrl(null);
        }
      } catch (error) {
        if (mounted) setAgreementUrl(null);
      } finally {
        if (mounted) setIsAgreementLoading(false);
      }
    };

    load();
    loadAgreement();

    return () => {
      mounted = false;
    };
  }, [selectedClient]);

  useEffect(() => {
    // Clear selections when client changes
    setSelectedFeeIds(new Set());
  }, [selectedClient]);

  useEffect(() => {
    if (selectAllRef.current) {
      const total = filteredFees.length;
      const selected = filteredFees.filter((fee) => selectedFeeIds.has(fee.feeId)).length;
      selectAllRef.current.indeterminate = selected > 0 && selected < total;
    }
  }, [filteredFees, selectedFeeIds]);

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
      const history = await RateMappingApiService.getRemarksData(fee.feeId);
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
        feeId: activeFee.feeId,
        slabNumber: activeFee.slabNumber,
        slabFloor: formData.slabFloor,
        slabCeiling: formData.slabCeiling,
        convchargesType: formData.convchargesType,
        convcharges: formData.convcharges,
        endPointchargesTypes: formData.endPointchargesTypes,
        endPointcharge: formData.endPointcharge,
        gstType: formData.gstType,
        gst: formData.gstType === 'fixed' ? 0 : DEFAULT_GST_PERCENT,
        convchargesApp: formData.convchargesApp ? 1 : 0,
        epchargesApp: formData.epchargesApp ? 1 : 0
      };

      await RateMappingApiService.updateFeeByID(String(activeFee.feeId), payload);

      // Log history + remarks for audit parity with Angular
      await Promise.all([
        RateMappingApiService.approveFee({
          approved_by: userName,
          client_code: selectedClient,
          approvedfor: 'ManageFee'
        }),
        RateMappingApiService.approveFee({
          approved_by: `${userName}:${remarks.trim()}:${activeFee.feeId}`,
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

  const toggleFeeSelection = (feeId: number) => {
    setSelectedFeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(feeId)) {
        next.delete(feeId);
      } else {
        next.add(feeId);
      }
      return next;
    });
  };

  const toggleAllFees = () => {
    if (filteredFees.length === 0) return;
    const allSelected = filteredFees.every((fee) => selectedFeeIds.has(fee.feeId));
    if (allSelected) {
      setSelectedFeeIds(new Set());
    } else {
      setSelectedFeeIds(new Set(filteredFees.map((fee) => fee.feeId)));
    }
  };

  const openBulkUpdate = () => {
    if (selectedFeeIds.size === 0) {
      toast.error('Select at least one fee to bulk update');
      return;
    }
    const first = filteredFees.find((fee) => selectedFeeIds.has(fee.feeId)) || feeRecords.find((fee) => selectedFeeIds.has(fee.feeId));
    if (first) {
      setBulkForm({
        slabFloor: first.slabFloor,
        slabCeiling: first.slabCeiling,
        convchargesType: first.convchargesType,
        convcharges: first.convcharges,
        endPointchargesTypes: first.endPointchargesTypes,
        endPointcharge: first.endPointcharge,
        gstType: first.gstType,
        convchargesApp: first.convchargesApp,
        epchargesApp: first.epchargesApp
      });
    } else {
      setBulkForm({
        slabFloor: 0,
        slabCeiling: 0,
        convchargesType: 'percentage',
        convcharges: 0,
        endPointchargesTypes: 'percentage',
        endPointcharge: 0,
        gstType: 'percentage',
        convchargesApp: true,
        epchargesApp: true
      });
    }
    setIsBulkOpen(true);
  };

  const handleBulkUpdate = async () => {
    if (!selectedClient) {
      toast.error('Select a client before updating fees');
      return;
    }
    if (selectedFeeIds.size === 0) {
      toast.error('Select at least one fee to update');
      return;
    }
    if (bulkForm.slabFloor >= bulkForm.slabCeiling) {
      toast.error('Slab floor must be less than slab ceiling');
      return;
    }
    if (bulkForm.convcharges <= 0 || bulkForm.endPointcharge <= 0) {
      toast.error('Charges must be greater than zero');
      return;
    }

    const targetFees = feeRecords.filter((fee) => selectedFeeIds.has(fee.feeId));
    if (targetFees.length === 0) {
      toast.error('No matching fees found for selection');
      return;
    }

    setIsBulkSaving(true);
    try {
      const payloadForFee = (fee: FeeRecord) => ({
        feeId: fee.feeId,
        slabNumber: fee.slabNumber,
        slabFloor: bulkForm.slabFloor,
        slabCeiling: bulkForm.slabCeiling,
        convchargesType: bulkForm.convchargesType,
        convcharges: bulkForm.convcharges,
        endPointchargesTypes: bulkForm.endPointchargesTypes,
        endPointcharge: bulkForm.endPointcharge,
        gstType: bulkForm.gstType,
        gst: bulkForm.gstType === 'fixed' ? 0 : DEFAULT_GST_PERCENT,
        convchargesApp: bulkForm.convchargesApp ? 1 : 0,
        epchargesApp: bulkForm.epchargesApp ? 1 : 0
      });

      const results = await Promise.allSettled(
        targetFees.map((fee) => RateMappingApiService.updateFeeByID(String(fee.feeId), payloadForFee(fee)))
      );

      const failed = results.filter((result) => result.status === 'rejected');

      // Log ManageFee once for parity with Angular bulk update trail
      await RateMappingApiService.approveFee({
        approved_by: userName,
        client_code: selectedClient,
        approvedfor: 'ManageFee'
      });

      const refreshed = await RateMappingApiService.getFeeForUpdate(selectedClient);
      setFeeRecords(refreshed.map(normalizeFee));
      setSelectedFeeIds(new Set());
      setIsBulkOpen(false);

      if (failed.length > 0) {
        toast.error(`Updated ${targetFees.length - failed.length} fee(s); ${failed.length} failed`);
      } else {
        toast.success(`Updated ${targetFees.length} fee${targetFees.length === 1 ? '' : 's'}`);
      }
    } catch (error: any) {
      console.error('Bulk fee update failed', error);
      toast.error(error?.message || 'Bulk fee update failed');
    } finally {
      setIsBulkSaving(false);
    }
  };

  // Add Slab handlers
  const openAddSlab = (fee: FeeRecord) => {
    setAddFee(fee);
    setAddForm({
      slabFloor: 0,
      slabCeiling: 0,
      convchargesType: 'percentage',
      convcharges: 0,
      endPointchargesTypes: 'percentage',
      endPointcharge: 0,
      gstType: 'percentage',
      convchargesApp: true,
      epchargesApp: true,
    });
    setIsAddOpen(true);
  };

  const submitAddSlab = async () => {
    if (!addFee) return;
    if (addForm.slabFloor >= addForm.slabCeiling) {
      toast.error('Slab floor must be less than slab ceiling');
      return;
    }
    try {
      await RateMappingApiService.addNewSlab({
        FeeId: addFee.feeId,
        ConvChargesType: addForm.convchargesType,
        ConvCharges: addForm.convcharges,
        EPChargesTypes: addForm.endPointchargesTypes,
        EPCharges: addForm.endPointcharge,
        GstType: addForm.gstType,
        GstValue: addForm.gstType === 'fixed' ? 0 : DEFAULT_GST_PERCENT,
        SlabFloor: addForm.slabFloor,
        SlabCeiling: addForm.slabCeiling,
        AddedBy: userName,
      });
      toast.success('Slab added successfully');
      setBanner({ type: 'success', message: 'Slab added successfully.' });
      setIsAddOpen(false);
      const refreshed = await RateMappingApiService.getFeeForUpdate(selectedClient);
      setFeeRecords(refreshed.map(normalizeFee));
    } catch (error: any) {
      const msg = error?.message || 'Failed to add slab';
      toast.error(msg);
      setBanner({ type: 'error', message: msg });
    }
  };

  // Delete Slab handlers
  const openDeleteSlab = (fee: FeeRecord) => {
    setDeleteFee(fee);
    setDeleteRemarks('');
    setIsDeleteOpen(true);
  };
  const submitDeleteSlab = async () => {
    if (!deleteFee) return;
    if (!deleteRemarks.trim()) {
      toast.error('Remarks are required to delete a slab');
      return;
    }
    try {
      await RateMappingApiService.deleteSlab(deleteFee.feeId, userName, deleteRemarks.trim());
      toast.success('Slab deleted successfully');
      setBanner({ type: 'success', message: 'Slab deleted successfully.' });
      setIsDeleteOpen(false);
      const refreshed = await RateMappingApiService.getFeeForUpdate(selectedClient);
      setFeeRecords(refreshed.map(normalizeFee));
    } catch (error: any) {
      const msg = error?.message || 'Failed to delete slab';
      toast.error(msg);
      setBanner({ type: 'error', message: msg });
    }
  };

  const updateFeeForwarded = async (fee: FeeRecord) => {
    if (!selectedClient) return;
    try {
      setIsFFLoading(true);
      let clientId = fee.clientId || 0;
      if (!clientId) {
        const resp = await RateMappingApiService.getClientId(selectedClient);
        const first = Array.isArray(resp) && resp.length > 0 ? resp[0] : null;
        clientId = Number(first?.clientId || first?.clientid || 0);
      }
      const paymodeId = Number(fee.paymodeId || 0);
      if (!clientId || !paymodeId) {
        toast.error('Missing client or payment mode identifier');
        return;
      }
      await RateMappingApiService.updateFeeForwarded({
        p_client_id: clientId,
        p_paymode_id: paymodeId,
        p_updatedBy: userName,
      });
      toast.success('Fee forwarded updated');
      setBanner({ type: 'success', message: 'Fee forwarded updated.' });
      const refreshed = await RateMappingApiService.getFeeForUpdate(selectedClient);
      setFeeRecords(refreshed.map(normalizeFee));
    } catch (error: any) {
      const msg = error?.message || 'Failed to update fee forwarded';
      toast.error(msg);
      setBanner({ type: 'error', message: msg });
    } finally {
      setIsFFLoading(false);
    }
  };

  const getFeeFwdDisabledReason = (fee: FeeRecord): string | null => {
    if (!isAdmin) return 'Requires admin privileges';
    if (isFFLoading) return 'Updating in progress';
    if (!fee.paymodeId) return 'Missing payment mode identifier';
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters Section */}
      <div className="relative z-20 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-lg">
        {banner && (
          <div
            className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              banner.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <Info className={banner.type === 'success' ? 'text-emerald-600 h-4 w-4' : 'text-red-600 h-4 w-4'} />
            <span>{banner.message}</span>
          </div>
        )}
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
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={openBulkUpdate}
              disabled={selectedFeeIds.size === 0 || isLoading}
              className="min-h-[40px] touch-manipulation"
            >
              Bulk Update ({selectedFeeIds.size})
            </Button>
            {selectedFeeIds.size > 0 && (
              <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                {selectedFeeIds.size} fee{selectedFeeIds.size === 1 ? '' : 's'} selected
              </p>
            )}
          </div>
        </div>
        <div
          className="overflow-x-auto"
          ref={tableScrollRef}
          onScroll={onTableScroll}
          style={virtualizationEnabled ? { maxHeight: '70vh', overflowY: 'auto' } : undefined}
        >
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-600" style={{ letterSpacing: '-0.01em' }}>
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="h-4 w-4"
                      checked={filteredFees.length > 0 && filteredFees.every((fee) => selectedFeeIds.has(fee.feeId))}
                      onChange={toggleAllFees}
                      aria-label="Select all fees"
                    />
                  </th>
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
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                      {selectedClient
                        ? 'No fee configurations available for the selected client.'
                        : 'Choose a client to load fee configurations.'}
                    </td>
                  </tr>
                )}

                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-600" />
                    </td>
                  </tr>
                )}

                {!isLoading && virtualizationEnabled && virtRowHeight > 0 && virtViewportHeight > 0 ? (
                  (() => {
                    const total = filteredFees.length;
                    const rh = virtRowHeight || 56;
                    const overscan = 10;
                    const startIndex = Math.max(0, Math.floor(virtScrollTop / rh) - overscan);
                    const visibleCount = Math.ceil(virtViewportHeight / rh) + overscan * 2;
                    const endIndex = Math.min(total, startIndex + visibleCount);
                    const slice = filteredFees.slice(startIndex, endIndex);
                    const topPad = startIndex * rh;
                    const bottomPad = Math.max(0, (total - endIndex) * rh);
                    return (
                      <>
                        {topPad > 0 && (
                          <tr style={{ height: topPad }}><td colSpan={8}></td></tr>
                        )}
                        {slice.map((fee) => (
                          <tr key={`${fee.feeId}-${fee.slabNumber}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 md:px-4 py-2 md:py-3">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={selectedFeeIds.has(fee.feeId)}
                                onChange={() => toggleFeeSelection(fee.feeId)}
                                aria-label={`Select fee ${fee.feeId}`}
                              />
                            </td>
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
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditModal(fee)}
                                  className="min-h-[40px] touch-manipulation"
                                >
                                  <Pencil className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Edit
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openAddSlab(fee)}
                                  disabled={!isAdmin}
                                  className="min-h-[40px] touch-manipulation"
                                >
                                  <PlusCircle className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Add Slab
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openDeleteSlab(fee)}
                                  disabled={!isAdmin}
                                  className="min-h-[40px] touch-manipulation"
                                >
                                  <Trash2 className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Delete
                                </Button>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => updateFeeForwarded(fee)}
                                          disabled={Boolean(getFeeFwdDisabledReason(fee))}
                                          className="min-h-[40px] touch-manipulation"
                                        >
                                          <RefreshCw className={`mr-1 h-3 w-3 md:h-4 md:w-4 ${isFFLoading ? 'animate-spin' : ''}`} />
                                          Fee Fwd
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    {getFeeFwdDisabledReason(fee) && (
                                      <TooltipContent>
                                        <p>{getFeeFwdDisabledReason(fee)}</p>
                                      </TooltipContent>
                                    )}
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bottomPad > 0 && (
                      <tr style={{ height: bottomPad }}><td colSpan={8}></td></tr>
                    )}
                  </>
                );
              })()
            ) : (
              !isLoading && filteredFees.map((fee) => (
                <tr key={`${fee.feeId}-${fee.slabNumber}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedFeeIds.has(fee.feeId)}
                      onChange={() => toggleFeeSelection(fee.feeId)}
                      aria-label={`Select fee ${fee.feeId}`}
                    />
                  </td>
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
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(fee)}
                            className="min-h-[40px] touch-manipulation"
                          >
                            <Pencil className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openAddSlab(fee)}
                            disabled={!isAdmin}
                            className="min-h-[40px] touch-manipulation"
                          >
                            <PlusCircle className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Add Slab
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteSlab(fee)}
                            disabled={!isAdmin}
                            className="min-h-[40px] touch-manipulation"
                          >
                            <Trash2 className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Delete
                          </Button>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateFeeForwarded(fee)}
                                    disabled={Boolean(getFeeFwdDisabledReason(fee))}
                                    className="min-h-[40px] touch-manipulation"
                                  >
                                    <RefreshCw className={`mr-1 h-3 w-3 md:h-4 md:w-4 ${isFFLoading ? 'animate-spin' : ''}`} />
                                    Fee Fwd
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              {getFeeFwdDisabledReason(fee) && (
                                <TooltipContent>
                                  <p>{getFeeFwdDisabledReason(fee)}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
                        <SelectItem value="percentage">Percentage ({DEFAULT_GST_PERCENT}%)</SelectItem>
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

      {/* Bulk Update Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={(open) => !open && setIsBulkOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
              Bulk Update Fees
            </DialogTitle>
            <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
              Applies to {selectedFeeIds.size} selected fee{selectedFeeIds.size === 1 ? '' : 's'} for client {selectedClient || '—'}.
              This mirrors the Angular bulk update and uses the same <code>/REST/client/updateFee/{'{'}feeId{'}'}/</code> endpoint.
            </p>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6 py-2">
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label className="text-xs md:text-sm">Slab floor (₹)</Label>
                <Input
                  type="number"
                  value={bulkForm.slabFloor}
                  onChange={(e) => setBulkForm((p) => ({ ...p, slabFloor: Number(e.target.value) }))}
                  className="mt-1 min-h-[44px] touch-manipulation"
                />
              </div>
              <div>
                <Label className="text-xs md:text-sm">Slab ceiling (₹)</Label>
                <Input
                  type="number"
                  value={bulkForm.slabCeiling}
                  onChange={(e) => setBulkForm((p) => ({ ...p, slabCeiling: Number(e.target.value) }))}
                  className="mt-1 min-h-[44px] touch-manipulation"
                />
              </div>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label className="text-xs md:text-sm">Conv charges value</Label>
                <Input
                  type="number"
                  value={bulkForm.convcharges}
                  onChange={(e) => setBulkForm((p) => ({ ...p, convcharges: Number(e.target.value) }))}
                  className="mt-1 min-h-[44px] touch-manipulation"
                />
              </div>
              <div>
                <Label className="text-xs md:text-sm">Conv charges type</Label>
                <Select
                  value={bulkForm.convchargesType}
                  onValueChange={(value: 'percentage' | 'fixed') => setBulkForm((p) => ({ ...p, convchargesType: value }))}
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

            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label className="text-xs md:text-sm">EP charges value</Label>
                <Input
                  type="number"
                  value={bulkForm.endPointcharge}
                  onChange={(e) => setBulkForm((p) => ({ ...p, endPointcharge: Number(e.target.value) }))}
                  className="mt-1 min-h-[44px] touch-manipulation"
                />
              </div>
              <div>
                <Label className="text-xs md:text-sm">EP charges type</Label>
                <Select
                  value={bulkForm.endPointchargesTypes}
                  onValueChange={(value: 'percentage' | 'fixed') => setBulkForm((p) => ({ ...p, endPointchargesTypes: value }))}
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

            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label className="text-xs md:text-sm">GST type</Label>
                <Select
                  value={bulkForm.gstType}
                  onValueChange={(value: 'percentage' | 'fixed') => setBulkForm((p) => ({ ...p, gstType: value }))}
                >
                  <SelectTrigger className="mt-1 min-h-[44px] touch-manipulation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage ({DEFAULT_GST_PERCENT}%)</SelectItem>
                    <SelectItem value="fixed">Fixed (₹0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Conv charges tax applicable</p>
                  <p className="text-xs text-gray-600">Toggle param1 flag</p>
                </div>
                <Switch
                  checked={bulkForm.convchargesApp}
                  onCheckedChange={(checked) => setBulkForm((p) => ({ ...p, convchargesApp: Boolean(checked) }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-gray-700">EP charge tax applicable</p>
                  <p className="text-xs text-gray-600">Toggle param2 flag</p>
                </div>
                <Switch
                  checked={bulkForm.epchargesApp}
                  onCheckedChange={(checked) => setBulkForm((p) => ({ ...p, epchargesApp: Boolean(checked) }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsBulkOpen(false)}
              className="w-full sm:w-auto min-h-[48px] touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={!isAdmin || isBulkSaving}
              className="w-full sm:w-auto min-h-[48px] touch-manipulation"
            >
              {isBulkSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update selected →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Slab Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !open && setIsAddOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
              Add New Slab
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label className="text-xs md:text-sm">Slab floor (₹)</Label>
                <Input type="number" value={addForm.slabFloor} onChange={(e) => setAddForm((p) => ({ ...p, slabFloor: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs md:text-sm">Slab ceiling (₹)</Label>
                <Input type="number" value={addForm.slabCeiling} onChange={(e) => setAddForm((p) => ({ ...p, slabCeiling: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label className="text-xs md:text-sm">Conv charges value</Label>
                <Input type="number" value={addForm.convcharges} onChange={(e) => setAddForm((p) => ({ ...p, convcharges: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs md:text-sm">Conv type</Label>
                <Select value={addForm.convchargesType} onValueChange={(v) => setAddForm((p) => ({ ...p, convchargesType: v as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <Label className="text-xs md:text-sm">EP charges value</Label>
                <Input type="number" value={addForm.endPointcharge} onChange={(e) => setAddForm((p) => ({ ...p, endPointcharge: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs md:text-sm">EP type</Label>
                <Select value={addForm.endPointchargesTypes} onValueChange={(v) => setAddForm((p) => ({ ...p, endPointchargesTypes: v as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs md:text-sm">GST Type</Label>
              <Select value={addForm.gstType} onValueChange={(v) => setAddForm((p) => ({ ...p, gstType: v as any }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage ({DEFAULT_GST_PERCENT}%)</SelectItem>
                  <SelectItem value="fixed">Fixed (₹0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={submitAddSlab} disabled={!isAdmin} className="w-full sm:w-auto">Add slab →</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Slab Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && setIsDeleteOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
              Delete Slab
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Provide remarks for audit trail.</p>
            <Label className="text-xs md:text-sm">Remarks</Label>
            <Input value={deleteRemarks} onChange={(e) => setDeleteRemarks(e.target.value)} placeholder="Reason for deletion" />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={submitDeleteSlab} disabled={!isAdmin} className="w-full sm:w-auto">Delete →</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageFeeTab;
