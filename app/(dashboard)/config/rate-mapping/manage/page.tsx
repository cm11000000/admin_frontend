'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ManageFeeTab from './ManageFeeTab';
import ReportApiService from '@/services/api/ReportApiService';
import RateMappingApiService from '@/services/api/RateMappingApiService';
import { resolveUserName } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import TabContentWrapper from '@/components/rate-mapping/TabContentWrapper';
import { Combobox } from '@/components/ui/combobox';

interface ClientOption {
  code: string;
  name: string;
}

const normalizeClient = (client: any): ClientOption | null => {
  const code = String(
    client?.client_code ?? client?.clientCode ?? client?.clientcode ?? ''
  ).trim();

  if (!code) {
    return null;
  }

  const name = String(
    client?.client_name ?? client?.clientName ?? client?.clientname ?? ''
  ).trim();

  return { code, name };
};

const normalizeField = (value: any, fallback = ''): string =>
  value === null || value === undefined ? fallback : String(value).trim();

const normalizeBool = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const normalized = String(value ?? '').toLowerCase();
  return normalized === 'true' || normalized === 'yes' || normalized === '1';
};

interface ManageClientState {
  clientId: string;
  clientName: string;
  clientContact: string;
  clientEmail: string;
  clientUsername: string;
  clientPass: string;
  successReturnURL: string;
  failureReturnURL: string;
  pushApiUrl: string;
  authKey: string;
  clientIV: string;
  authFlag: boolean;
  authType: string;
  pushApiFlag: boolean;
  enquiryFlag: boolean;
  refundApplicable: boolean;
  uiByPass: boolean;
  roundOff: boolean;
  active: boolean;
}

const ManageClientTab: React.FC<{
  clients: ClientOption[];
  userName: string;
}> = ({ clients, userName }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [clientState, setClientState] = useState<ManageClientState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!selectedClient) {
        setClientState(null);
        setClientError(null);
        return;
      }
      setIsLoading(true);
      setClientError(null);
      try {
        const idResp = await RateMappingApiService.getClientId(selectedClient);
        const first = Array.isArray(idResp) && idResp.length > 0 ? idResp[0] : null;
        const clientId = String(first?.clientId ?? first?.clientid ?? '');
        if (!clientId) throw new Error('Client ID not found');
        const details = await RateMappingApiService.getClientForUpdate(clientId);
        setClientState({
          clientId,
          clientName: normalizeField(details.clientName || details.client_name),
          clientContact: normalizeField(details.clientContact || details.client_contact),
          clientEmail: normalizeField(details.clientEmail || details.client_email),
          clientUsername: normalizeField(details.clientUsername || details.client_username),
          clientPass: normalizeField(details.clientPass || details.client_pass),
          successReturnURL: normalizeField(details.successReturnURL || details.success_return_url),
          failureReturnURL: normalizeField(details.failureReturnURL || details.failure_return_url),
          pushApiUrl: normalizeField(details.pushApiUrl || details.push_api_url),
          authKey: normalizeField(details.authKey || details.auth_key),
          clientIV: normalizeField(details.clientIV || details.client_iv),
          authFlag: normalizeBool(details.authFlag || details.auth_flag),
          authType: normalizeField(details.authType || details.auth_type),
          pushApiFlag: normalizeBool(details.pushApiFlag || details.push_api_flag),
          enquiryFlag: normalizeBool(details.enquiryFlag || details.enquiry_flag),
          refundApplicable: normalizeBool(details.refundApplicable || details.refund_applicable),
          uiByPass: normalizeBool(details.uiByPass || details.ui_bypass),
          roundOff: normalizeBool(details.roundOff || details.round_off),
          active: normalizeBool(details.active)
        });
      } catch (error: any) {
        console.error('Failed to load client details', error);
        toast.error(error?.message || 'Failed to load client details');
        setClientState(null);
        setClientError(error?.message || 'Client details not available (API error).');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedClient]);

  const handleSave = async () => {
    if (!clientState) return;
    setIsSaving(true);
    try {
      const payload = {
        clientName: clientState.clientName,
        clientContact: clientState.clientContact,
        clientEmail: clientState.clientEmail,
        clientUsername: clientState.clientUsername,
        clientPass: clientState.clientPass,
        successReturnURL: clientState.successReturnURL,
        failureReturnURL: clientState.failureReturnURL,
        pushApiUrl: clientState.pushApiUrl,
        authKey: clientState.authKey,
        clientIV: clientState.clientIV,
        authFlag: clientState.authFlag,
        authType: clientState.authType,
        pushApiFlag: clientState.pushApiFlag,
        enquiryFlag: clientState.enquiryFlag,
        refundApplicable: clientState.refundApplicable,
        uiByPass: clientState.uiByPass,
        roundOff: clientState.roundOff,
        active: clientState.active,
      };
      await RateMappingApiService.updateClientDataTable(clientState.clientId, payload);
      toast.success('Client details updated');
    } catch (error: any) {
      console.error('Failed to update client', error);
      toast.error(error?.message || 'Failed to update client');
    } finally {
      setIsSaving(false);
    }
  };

  const clientOptions = clients.map((client) => ({
    value: client.code,
    label: `${client.code} — ${client.name}`
  }));

  return (
    <TabContentWrapper
      description="Edit client contact/email/URLs exactly as Angular Manage Client."
      clients={clientOptions}
      selectedClient={selectedClient}
      onClientChange={setSelectedClient}
      isLoading={isLoading}
      loadingText="Loading client details..."
    >
      {clientState && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-gray-700">Client Name</Label>
              <Input value={clientState.clientName} onChange={(e) => setClientState((p) => p && ({ ...p, clientName: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <Label className="text-xs text-gray-700">Contact</Label>
              <Input value={clientState.clientContact} onChange={(e) => setClientState((p) => p && ({ ...p, clientContact: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <Label className="text-xs text-gray-700">Email</Label>
              <Input value={clientState.clientEmail} onChange={(e) => setClientState((p) => p && ({ ...p, clientEmail: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <Label className="text-xs text-gray-700">Username</Label>
              <Input value={clientState.clientUsername} onChange={(e) => setClientState((p) => p && ({ ...p, clientUsername: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <Label className="text-xs text-gray-700">Password</Label>
              <Input value={clientState.clientPass} onChange={(e) => setClientState((p) => p && ({ ...p, clientPass: e.target.value }))} className="min-h-[44px] touch-manipulation" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-700">Success URL</Label>
              <Textarea value={clientState.successReturnURL} onChange={(e) => setClientState((p) => p && ({ ...p, successReturnURL: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <Label className="text-xs text-gray-700">Failure URL</Label>
              <Textarea value={clientState.failureReturnURL} onChange={(e) => setClientState((p) => p && ({ ...p, failureReturnURL: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <Label className="text-xs text-gray-700">Push API URL</Label>
              <Textarea value={clientState.pushApiUrl} onChange={(e) => setClientState((p) => p && ({ ...p, pushApiUrl: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-700">Auth Key</Label>
                  <Input value={clientState.authKey} onChange={(e) => setClientState((p) => p && ({ ...p, authKey: e.target.value }))} className="min-h-[44px] touch-manipulation" />
                </div>
                <div>
                  <Label className="text-xs text-gray-700">Client IV</Label>
                  <Input value={clientState.clientIV} onChange={(e) => setClientState((p) => p && ({ ...p, clientIV: e.target.value }))} className="min-h-[44px] touch-manipulation" />
                </div>
              </div>
              <Label className="text-xs text-gray-700">Auth Type</Label>
              <Input value={clientState.authType} onChange={(e) => setClientState((p) => p && ({ ...p, authType: e.target.value }))} className="min-h-[44px] touch-manipulation" />
              <div className="grid gap-3 md:grid-cols-2 mt-2">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <Label className="text-xs font-medium text-gray-700">UI Bypass</Label>
                  <Switch
                    checked={clientState.uiByPass}
                    onCheckedChange={(checked) => setClientState((p) => p && ({ ...p, uiByPass: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <Label className="text-xs font-medium text-gray-700">Round Off</Label>
                  <Switch
                    checked={clientState.roundOff}
                    onCheckedChange={(checked) => setClientState((p) => p && ({ ...p, roundOff: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <Label className="text-xs font-medium text-gray-700">Active</Label>
                  <Switch
                    checked={clientState.active}
                    onCheckedChange={(checked) => setClientState((p) => p && ({ ...p, active: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <Label className="text-xs font-medium text-gray-700">Auth Flag</Label>
                  <Switch
                    checked={clientState.authFlag}
                    onCheckedChange={(checked) => setClientState((p) => p && ({ ...p, authFlag: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <Label className="text-xs font-medium text-gray-700">Push API</Label>
                  <Switch
                    checked={clientState.pushApiFlag}
                    onCheckedChange={(checked) => setClientState((p) => p && ({ ...p, pushApiFlag: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <Label className="text-xs font-medium text-gray-700">Enquiry</Label>
                  <Switch
                    checked={clientState.enquiryFlag}
                    onCheckedChange={(checked) => setClientState((p) => p && ({ ...p, enquiryFlag: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <Label className="text-xs font-medium text-gray-700">Refund Applicable</Label>
                  <Switch
                    checked={clientState.refundApplicable}
                    onCheckedChange={(checked) => setClientState((p) => p && ({ ...p, refundApplicable: checked }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setSelectedClient('')} className="min-h-[52px] touch-manipulation">Reset</Button>
            <Button onClick={handleSave} disabled={!clientState || isSaving || !selectedClient} className="min-h-[52px] touch-manipulation">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update Client
            </Button>
          </div>
          {clientError && <p className="text-xs text-red-600">Client details unavailable: {clientError}</p>}
        </>
      )}
    </TabContentWrapper>
  );
};

interface PaymentModeRow {
  clientId?: number | string;
  clientCode?: string;
  clientName?: string;
  paymodeId?: number | string;
  paymodeName?: string;
  payModeFlag?: boolean;
}

const ManagePaymentModeTab: React.FC<{
  clients: ClientOption[];
  userName: string;
}> = ({ clients, userName }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [assigned, setAssigned] = useState<PaymentModeRow[]>([]);
  const [available, setAvailable] = useState<PaymentModeRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState<string>('');
  const [clientIdError, setClientIdError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!selectedClient) {
        setAssigned([]);
        setAvailable([]);
        setClientId('');
        setClientIdError(null);
        return;
      }
      setIsLoading(true);
      try {
        const idResp = await RateMappingApiService.getClientId(selectedClient);
        const first = Array.isArray(idResp) && idResp.length > 0 ? idResp[0] : null;
        const cid = String(first?.clientId ?? first?.clientid ?? '');
        if (!cid) throw new Error('Client ID not found for selected client');
        setClientId(cid);
        setClientIdError(null);
        const [assignedResp, addableResp] = await Promise.all([
          RateMappingApiService.getAssignedPaymentMode(selectedClient),
          RateMappingApiService.getPaymodeForAddNewRate(selectedClient),
        ]);
        setAssigned(Array.isArray(assignedResp) ? assignedResp : []);
        setAvailable(Array.isArray(addableResp) ? addableResp : []);
      } catch (error: any) {
        console.error('Failed to load payment modes', error);
        toast.error(error?.message || 'Failed to load payment modes');
        setAssigned([]);
        setAvailable([]);
        setClientIdError(error?.message || 'Missing client ID');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedClient]);

  const togglePaymode = async (row: PaymentModeRow) => {
    try {
      const paymodeId = String(row.clientCode ?? row.paymodeId ?? row.Id ?? row.clientId ?? '');
      if (!clientId || !paymodeId) throw new Error('Missing payment mode identifier');
      const id = `${clientId}/${paymodeId}`;
      const nextFlag = !(row.payModeFlag ?? row.clientId === 1);
      await RateMappingApiService.updateClientPaymode(id, { payModeFlag: nextFlag });
      toast.success('Payment mode updated');
      setAssigned((prev) =>
        prev.map((item) =>
          item.clientId === row.clientId ? { ...item, payModeFlag: nextFlag } : item
        )
      );
    } catch (error: any) {
      console.error('Failed to update payment mode', error);
      toast.error(error?.message || 'Failed to update payment mode');
    }
  };

  const addPaymode = async (row: PaymentModeRow) => {
    try {
      const paymodeId = String(row.paymodeId ?? row.clientId ?? row.clientCode ?? '');
      if (!paymodeId || !clientId) throw new Error('Missing paymode id');
      await RateMappingApiService.addNewPaymentMode(selectedClient, paymodeId, userName);
      toast.success('Payment mode added');
      // Refresh lists
      const [assignedResp, addableResp] = await Promise.all([
        RateMappingApiService.getAssignedPaymentMode(selectedClient),
        RateMappingApiService.getPaymodeForAddNewRate(selectedClient),
      ]);
      setAssigned(Array.isArray(assignedResp) ? assignedResp : []);
      setAvailable(Array.isArray(addableResp) ? addableResp : []);
    } catch (error: any) {
      console.error('Failed to add payment mode', error);
      toast.error(error?.message || 'Failed to add payment mode');
    }
  };

  const clientOptions = clients.map((client) => ({
    value: client.code,
    label: `${client.code} — ${client.name}`
  }));

  return (
    <TabContentWrapper
      description="Toggle assigned payment modes or add new ones."
      clients={clientOptions}
      selectedClient={selectedClient}
      onClientChange={setSelectedClient}
      isLoading={isLoading}
      loadingText="Loading payment modes..."
    >
      {clientIdError && (
        <p className="text-xs text-red-600">Client identifier unavailable: {clientIdError}</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Assigned</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {assigned.length === 0 && <p className="text-xs text-gray-600">No assigned payment modes.</p>}
            {assigned.map((row) => (
              <div key={`${row.clientId}-${row.clientCode}-${row.paymodeId}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row.clientName || row.paymodeName || row.clientCode}</p>
                  <p className="text-xs text-gray-600">ID: {row.clientId ?? row.paymodeId ?? '—'}</p>
                  <p className="text-xs text-gray-500">Enabled: {row.payModeFlag || row.clientId === 1 ? 'Yes' : 'No'}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => togglePaymode(row)}>
                  {row.payModeFlag || row.clientId === 1 ? 'Disable' : 'Enable'}
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-3">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Not Assigned</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {available.length === 0 && <p className="text-xs text-gray-600">Nothing to add.</p>}
            {available.map((row) => (
              <div key={`${row.paymodeId || row.clientId}-${row.paymodeName || row.clientName}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row.paymodeName || row.clientName}</p>
                  <p className="text-xs text-gray-600">ID: {row.paymodeId ?? row.clientId ?? '—'}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => addPaymode(row)}>
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabContentWrapper>
  );
};

interface MappingRow {
  mappingid?: number;
  clientId?: string | number;
  endpointname?: string;
  epusername?: string;
  eppassword?: string;
  epmrchntid?: string;
  epUrl?: string;
  active?: string | number | boolean;
  feeForward?: boolean | string | number;
  priority?: number | string;
  paymodeId?: number | string;
  endpointId?: number | string;
  param1?: string;
  param2?: string;
  param3?: string;
  param4?: string;
  param5?: string;
  param6?: string;
  param7?: string;
  param8?: string;
  param9?: string;
  hasSlabs?: boolean | string | number;
  epName?: string;
}

const ManageMappingTab: React.FC<{
  clients: ClientOption[];
}> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [mappings, setMappings] = useState<MappingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editRow, setEditRow] = useState<MappingRow | null>(null);

  const normalizeMapping = (row: any): MappingRow => ({
    mappingid: Number(row.mappingid ?? row.Id ?? row.id ?? 0),
    clientId: row.clientId ?? row.clientid,
    endpointname: row.endpointname ?? row.epName,
    epusername: row.epusername ?? row.epUsername,
    eppassword: row.eppassword ?? row.epPass,
    epmrchntid: row.epmrchntid ?? row.epMrchntId,
    epUrl: row.epUrl ?? row.epurl ?? '',
    active: row.active,
    feeForward: row.feeForward,
    priority: row.priority ?? row.Priority,
    paymodeId: row.paymodeId ?? row.payModeId,
    endpointId: row.endpointId ?? row.endpointid,
    param1: row.param1,
    param2: row.param2,
    param3: row.param3,
    param4: row.param4,
    param5: row.param5,
    param6: row.param6,
    param7: row.param7,
    param8: row.param8,
    param9: row.param9,
    hasSlabs: row.hasSlabs,
    epName: row.epName ?? row.endpointname
  });

  useEffect(() => {
    const load = async () => {
      if (!selectedClient) {
        setMappings([]);
        return;
      }
      setIsLoading(true);
      try {
        const resp = await RateMappingApiService.getMappingDetail(selectedClient);
        const list = Array.isArray(resp) ? resp : [];
        setMappings(list.map(normalizeMapping));
      } catch (error: any) {
        console.error('Failed to load mappings', error);
        toast.error(error?.message || 'Failed to load mappings');
        setMappings([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedClient]);

  const saveMapping = async () => {
    if (!editRow?.mappingid) return;
    const clientId = String(editRow.clientId || '');
    if (!clientId) {
      toast.error('Missing client id for mapping update');
      return;
    }
    const ids = `${clientId}/${editRow.mappingid}`;
    setIsSaving(true);
    try {
      const payload = {
        mappingId: editRow.mappingid,
        priority: Number(editRow.priority || 0),
        epUsername: editRow.epusername || '',
        epPass: editRow.eppassword || '',
        epMrchntId: editRow.epmrchntid || '',
        feeForward: normalizeBool(editRow.feeForward),
        epUrl: editRow.epUrl || '',
        clientId: clientId,
        paymodeId: Number(editRow.paymodeId || 0),
        endpointId: Number(editRow.endpointId || 0),
        param1: editRow.param1 || '',
        param2: editRow.param2 || '',
        param3: editRow.param3 || '',
        param4: editRow.param4 || '',
        param5: editRow.param5 || '',
        param6: editRow.param6 || '',
        param7: editRow.param7 || '',
        param8: editRow.param8 || '',
        param9: editRow.param9 || '',
        hasSlabs: normalizeBool(editRow.hasSlabs),
        active: normalizeBool(editRow.active) ? '1' : '0'
      };
      await RateMappingApiService.updateMappingByID(ids, payload);
      toast.success('Mapping updated');
      const resp = await RateMappingApiService.getMappingDetail(selectedClient);
      setMappings(Array.isArray(resp) ? resp : []);
      setEditRow(null);
    } catch (error: any) {
      console.error('Failed to update mapping', error);
      toast.error(error?.message || 'Failed to update mapping');
    } finally {
      setIsSaving(false);
    }
  };

  const clientOptions = clients.map((client) => ({
    value: client.code,
    label: `${client.code} — ${client.name}`
  }));

  return (
    <TabContentWrapper
      description="Update endpoint credentials / merchant IDs (Angular Manage Mapping)."
      clients={clientOptions}
      selectedClient={selectedClient}
      onClientChange={setSelectedClient}
      isLoading={isLoading}
      loadingText="Loading mappings..."
    >
      {mappings.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Mapping ID</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Endpoint</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Username</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Password</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Merchant ID</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Priority</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Fee Fwd</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Active</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mappings.map((row) => (
                <tr key={row.mappingid || row.endpointname}>
                  <td className="px-3 md:px-4 py-2 md:py-3">{row.mappingid ?? '—'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700">{row.endpointname ?? '—'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700">{row.epusername ?? '—'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700">{row.eppassword ? '•••••' : '—'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700">{row.epmrchntid ?? '—'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700">{row.priority ?? '—'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700">{normalizeBool(row.feeForward) ? 'Yes' : 'No'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-700">{normalizeBool(row.active) ? 'Yes' : 'No'}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <Button variant="outline" size="sm" onClick={() => setEditRow(row)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editRow && (
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Edit Mapping #{editRow.mappingid}</p>
            <Button variant="ghost" size="sm" onClick={() => setEditRow(null)}>Cancel</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label className="text-xs text-gray-700">EP Username</Label>
              <Input value={editRow.epusername || ''} onChange={(e) => setEditRow((p) => p && ({ ...p, epusername: e.target.value }))} className="min-h-[44px] touch-manipulation" />
            </div>
            <div>
              <Label className="text-xs text-gray-700">EP Password</Label>
              <Input value={editRow.eppassword || ''} onChange={(e) => setEditRow((p) => p && ({ ...p, eppassword: e.target.value }))} className="min-h-[44px] touch-manipulation" />
            </div>
            <div>
              <Label className="text-xs text-gray-700">Merchant ID</Label>
              <Input value={editRow.epmrchntid || ''} onChange={(e) => setEditRow((p) => p && ({ ...p, epmrchntid: e.target.value }))} className="min-h-[44px] touch-manipulation" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label className="text-xs text-gray-700">Priority</Label>
              <Input type="number" value={editRow.priority ?? ''} onChange={(e) => setEditRow((p) => p && ({ ...p, priority: Number(e.target.value) }))} className="min-h-[44px] touch-manipulation" />
            </div>
            <div>
              <Label className="text-xs text-gray-700">EP URL</Label>
              <Input value={editRow.epUrl || ''} onChange={(e) => setEditRow((p) => p && ({ ...p, epUrl: e.target.value }))} className="min-h-[44px] touch-manipulation" />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input type="checkbox" checked={normalizeBool(editRow.feeForward)} onChange={(e) => setEditRow((p) => p && ({ ...p, feeForward: e.target.checked }))} />
                Fee Forward
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input type="checkbox" checked={normalizeBool(editRow.active)} onChange={(e) => setEditRow((p) => p && ({ ...p, active: e.target.checked }))} />
                Active
              </label>
            </div>
          </div>
          <Button onClick={saveMapping} disabled={isSaving} className="min-h-[52px] touch-manipulation">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save mapping
          </Button>
        </div>
      )}
    </TabContentWrapper>
  );
};

interface FlagState {
  flagType: string;
  value: string;
}

const FLAG_TYPE_OPTIONS = [
  { value: 'active', label: 'Client Status' },
  { value: 'uibypass', label: 'UI By Pass' },
  { value: 'roundoff', label: 'Round Off' },
  { value: 'feefwd', label: 'Fee Fwd' },
  { value: 'duprestriction', label: 'Duplicate Restriction' },
  { value: 'authtype', label: 'Auth Type' },
  { value: 'riskcategory', label: 'Risk Category' },
  { value: 'apiversion', label: 'API Version' },
  { value: 'mesaagebypass', label: 'Email / SMS' },
  { value: 'forcesuccessflag', label: 'Force Success' },
  { value: 'whitelisted', label: 'Whitelist Flag' },
];

const YES_NO_OPTIONS = [
  { value: '1', label: 'Yes' },
  { value: '0', label: 'No' },
];

const RISK_OPTIONS = [
  { value: '1', label: 'Good' },
  { value: '2', label: 'Normal' },
  { value: '3', label: 'Low' },
  { value: '4', label: 'Medium' },
  { value: '5', label: 'High' },
];

const ManageFlagsTab: React.FC<{
  clients: ClientOption[];
  userName: string;
}> = ({ clients, userName }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [state, setState] = useState<FlagState>({ flagType: 'active', value: '1' });
  const [isSaving, setIsSaving] = useState(false);

  const handleFlagTypeChange = (flagType: string) => {
    setState((prev) => {
      if (flagType === 'authtype') {
        return { flagType, value: '' };
      }
      if (flagType === 'riskcategory') {
        return { flagType, value: prev.value && ['1', '2', '3', '4', '5'].includes(prev.value) ? prev.value : '1' };
      }
      return { flagType, value: prev.value === '0' || prev.value === '1' ? prev.value : '1' };
    });
  };

  const submit = async () => {
    if (!selectedClient) {
      toast.error('Select a client');
      return;
    }
    if (state.flagType === 'authtype' && !state.value) {
      toast.error('Enter auth type');
      return;
    }
    setIsSaving(true);
    try {
      await RateMappingApiService.getFlagDetail({
        CltCode: selectedClient,
        pType: state.flagType,
        TypeValue: state.value,
        upDateBy: userName
      });
      toast.success('Flag updated');
    } catch (error: any) {
      console.error('Failed to update flag', error);
      toast.error(error?.message || 'Failed to update flag');
    } finally {
      setIsSaving(false);
    }
  };

  const clientOptions = clients.map((client) => ({
    value: client.code,
    label: `${client.code} — ${client.name}`
  }));

  return (
    <TabContentWrapper
      description="Client Config flags (UI bypass, roundoff, fee fwd, etc.)."
      clients={clientOptions}
      selectedClient={selectedClient}
      onClientChange={setSelectedClient}
      isLoading={false}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label className="text-xs text-gray-700">Flag Type</Label>
          <Combobox
            options={FLAG_TYPE_OPTIONS}
            value={state.flagType}
            onChange={handleFlagTypeChange}
            placeholder="Select flag type"
            searchPlaceholder="Search flag type..."
            className="mt-1 min-h-[44px] touch-manipulation"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-700">Value</Label>
          {state.flagType === 'riskcategory' ? (
            <Combobox
              options={RISK_OPTIONS}
              value={state.value}
              onChange={(v) => setState((p) => ({ ...p, value: v }))}
              placeholder="Select risk category"
              searchPlaceholder="Search risk category..."
              className="mt-1 min-h-[44px] touch-manipulation"
            />
          ) : state.flagType === 'authtype' ? (
            <Input
              className="mt-1"
              value={state.value}
              onChange={(e) => setState((p) => ({ ...p, value: e.target.value }))}
              placeholder="Enter auth type"
            />
          ) : (
            <Combobox
              options={YES_NO_OPTIONS}
              value={state.value}
              onChange={(v) => setState((p) => ({ ...p, value: v }))}
              placeholder="Select value"
              searchPlaceholder="Search value..."
              className="mt-1 min-h-[44px] touch-manipulation"
            />
          )}
        </div>
      </div>

      <Button onClick={submit} disabled={isSaving || !selectedClient}>
        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Update Flag
      </Button>
    </TabContentWrapper>
  );
};

interface FeeFwdRow {
  Id?: number;
  clientId?: number;
  clientCode?: string;
  clientName?: string;
  feeForward?: string;
}

const ManageFeeForwardedTab: React.FC<{
  clients: ClientOption[];
  userName: string;
}> = ({ clients, userName }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [rows, setRows] = useState<FeeFwdRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    if (!selectedClient) {
      setRows([]);
      return;
    }
    setIsLoading(true);
    try {
      const resp = await RateMappingApiService.getFeeForwardedDetail(`25/${selectedClient}`);
      setRows(Array.isArray(resp) ? resp : []);
    } catch (error: any) {
      console.error('Failed to load fee forwarded list', error);
      toast.error(error?.message || 'Failed to load fee forwarded list');
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedClient]);

  const toggle = async (row: FeeFwdRow) => {
    if (!row.clientId || !row.Id) {
      toast.error('Missing identifiers');
      return;
    }
    setIsSaving(true);
    try {
      await RateMappingApiService.updateFeeForwarded({
        p_client_id: row.clientId,
        p_paymode_id: row.Id,
        p_updatedBy: userName,
      });
      toast.success('Fee forwarded updated');
      await load();
    } catch (error: any) {
      console.error('Failed to update fee forwarded', error);
      toast.error(error?.message || 'Failed to update fee forwarded');
    } finally {
      setIsSaving(false);
    }
  };

  const clientOptions = clients.map((client) => ({
    value: client.code,
    label: `${client.code} — ${client.name}`
  }));

  return (
    <TabContentWrapper
      description="Toggle fee forwarded at paymode level."
      clients={clientOptions}
      selectedClient={selectedClient}
      onClientChange={setSelectedClient}
      isLoading={isLoading}
      loadingText="Loading fee forwarded data..."
    >
      <div className="space-y-2">
        {rows.length === 0 && <p className="text-xs text-gray-600">No records found.</p>}
        {rows.map((row) => (
          <div key={`${row.Id}-${row.clientId}`} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{row.clientName || row.clientCode}</p>
              <p className="text-xs text-gray-600">Paymode ID: {row.Id}</p>
              <p className="text-xs text-gray-500">Fee Forwarded: {(row.feeForward || row.clientName || '').toString().toLowerCase() === 'yes' ? 'Yes' : 'No'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toggle(row)} disabled={isSaving}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
              Toggle
            </Button>
          </div>
        ))}
      </div>
    </TabContentWrapper>
  );
};

export default function ManageRateMappingPage(): JSX.Element {
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fee');

  const resolveUserContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const resolvedUser = resolveUserName();
    setUserName(resolvedUser);

    try {
      const roleId = localStorage.getItem('RoleId');
      const rightsValue = Number(localStorage.getItem('rights'));
      setIsAdmin(roleId === '1' || Number.isFinite(rightsValue));
    } catch (error) {
      setIsAdmin(true);
    }
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
      setIsLoading(true);
      try {
        const response = await ReportApiService.getClientCodeListUSP_Cached(userName);
        if (!mounted) return;
        const mapped = (response || [])
          .map(normalizeClient)
          .filter((item): item is ClientOption => Boolean(item))
          .sort((a, b) => a.code.localeCompare(b.code));
        setClients(mapped);
      } catch (error: any) {
        console.error('Failed to load client master for Manage Rate Mapping', error);
        toast.error(error?.message || 'Unable to load client master list');
        if (mounted) {
          setClients([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      mounted = false;
    };
  }, [userName]);

  const headerDescription = useMemo(() => {
    if (isLoading) {
      return 'Loading client master…';
    }

    if (clients.length === 0) {
      return 'Client master could not be loaded. Retry after ensuring your session is valid.';
    }

    return 'Full parity with Angular Manage Rate Mapping (client, paymode, mapping, flags, fee, fee forwarded).';
  }, [clients.length, isLoading]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Manage Rate Mapping</h1>
          <p className="text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>{headerDescription}</p>
          <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
            Backend: adminapiv2.sabpaisa.in/admin-hackathon (parity with Angular updateratemapping).
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="client">Manage Client</TabsTrigger>
          <TabsTrigger value="paymode">Manage Payment Mode</TabsTrigger>
          <TabsTrigger value="mapping">Manage Mapping</TabsTrigger>
          <TabsTrigger value="fee">Manage Fee</TabsTrigger>
          <TabsTrigger value="flags">Client Configuration</TabsTrigger>
          <TabsTrigger value="feefwd">Fee Forwarded</TabsTrigger>
        </TabsList>

        <TabsContent value="client">
          <ManageClientTab clients={clients} userName={userName} />
        </TabsContent>

        <TabsContent value="paymode">
          <ManagePaymentModeTab clients={clients} userName={userName} />
        </TabsContent>

        <TabsContent value="mapping">
          <ManageMappingTab clients={clients} />
        </TabsContent>

        <TabsContent value="fee">
          <ManageFeeTab clients={clients} userName={userName} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="flags">
          <ManageFlagsTab clients={clients} userName={userName} />
        </TabsContent>

        <TabsContent value="feefwd">
          <ManageFeeForwardedTab clients={clients} userName={userName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
