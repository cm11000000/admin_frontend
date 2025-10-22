'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Apple,
  Eye,
  Loader2,
  Lock,
  Shield,
  Smartphone,
  Unlock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import pocApiService from '@/services/api/POCApiService';

type Platform = 'ANDROID' | 'IOS';

interface ClientRecord {
  id: number;
  client_code: string;
  package_name: string;
  unique_assets: string;
  blockdirectlyforassets: boolean;
  blockdirectlyforplaystorepresence: boolean;
}

const normalizeRecord = (record: ClientRecord) => ({
  ...record,
  package_name: record.package_name ?? '',
  unique_assets: record.unique_assets ?? '',
  blockdirectlyforassets: Boolean(record.blockdirectlyforassets),
  blockdirectlyforplaystorepresence: Boolean(record.blockdirectlyforplaystorepresence)
});

const formatBooleanTag = (value: boolean, trueLabel: string, falseLabel: string) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
      value ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
    }`}
  >
    {value ? trueLabel : falseLabel}
  </span>
);

const POCPage: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<Platform>('ANDROID');
  const [androidData, setAndroidData] = useState<ClientRecord[]>([]);
  const [iosData, setIosData] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsContent, setDetailsContent] = useState<any>(null);
  const [detailsClient, setDetailsClient] = useState<{ code: string; platform: Platform } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [androidResponse, iosResponse] = await Promise.all([
          pocApiService.getClients('ANDROID'),
          pocApiService.getClients('IOS')
        ]);

        if (!mounted) return;
        setAndroidData(androidResponse.map(normalizeRecord));
        setIosData(iosResponse.map(normalizeRecord));
      } catch (error: any) {
        console.error('Failed to load POC data', error);
        toast.error(error?.message || 'Failed to load POC data');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const currentData = activePlatform === 'ANDROID' ? androidData : iosData;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return currentData;
    }
    const term = searchTerm.trim().toLowerCase();
    return currentData.filter((record) => record.client_code.toLowerCase().includes(term));
  }, [currentData, searchTerm]);

  const stats = useMemo(() => {
    const total = currentData.length;
    const fraudDetected = currentData.filter((record) => record.package_name !== '1' || record.unique_assets !== '1').length;
    const blocked = currentData.filter(
      (record) => record.blockdirectlyforassets || record.blockdirectlyforplaystorepresence
    ).length;
    return { total, fraudDetected, blocked };
  }, [currentData]);

  const handleToggle = async (
    record: ClientRecord,
    field: 'blockdirectlyforassets' | 'blockdirectlyforplaystorepresence'
  ) => {
    try {
      const targetFlag = !record[field];
      await pocApiService.updateBlocking(
        record.client_code,
        field === 'blockdirectlyforassets' ? targetFlag : record.blockdirectlyforassets,
        field === 'blockdirectlyforplaystorepresence' ? targetFlag : record.blockdirectlyforplaystorepresence
      );

      toast.success(`Client ${record.client_code} ${targetFlag ? 'blocked' : 'unblocked'} successfully`);

      const updateState = (records: ClientRecord[]) =>
        records.map((item) =>
          item.id === record.id
            ? {
                ...item,
                blockdirectlyforassets:
                  field === 'blockdirectlyforassets' ? targetFlag : item.blockdirectlyforassets,
                blockdirectlyforplaystorepresence:
                  field === 'blockdirectlyforplaystorepresence' ? targetFlag : item.blockdirectlyforplaystorepresence
              }
            : item
        );

      if (activePlatform === 'ANDROID') {
        setAndroidData((prev) => updateState(prev));
      } else {
        setIosData((prev) => updateState(prev));
      }
    } catch (error: any) {
      console.error('Failed to update block status', error);
      toast.error(error?.message || 'Failed to update block status');
    }
  };

  const handleViewDetails = async (record: ClientRecord) => {
    setDetailsClient({ code: record.client_code, platform: activePlatform });
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsContent(null);

    try {
      const history = await pocApiService.getClientHistory(record.client_code, activePlatform);
      setDetailsContent(history);
    } catch (error: any) {
      console.error('Failed to fetch client history', error);
      toast.error(error?.message || 'Failed to load client details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const renderPlatformButton = (platform: Platform, label: string, icon: React.ReactElement) => (
    <button
      key={platform}
      onClick={() => {
        setActivePlatform(platform);
        setSearchTerm('');
      }}
      className={`flex-1 flex items-center justify-center gap-2 px-3 md:px-4 py-3 text-sm font-medium transition-colors min-h-[44px] touch-manipulation ${
        activePlatform === platform
          ? 'bg-orange-500/10 text-orange-400 border-b-2 border-orange-500'
          : 'text-gray-600 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Section Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Mobile App Security (POC)</h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          Monitor suspicious mobile app activity and block compromised clients. Mirrors the Angular POC screen.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-extrabold">Clients ({activePlatform.toLowerCase()})</p>
              <p className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-extrabold">Potential fraud</p>
              <p className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats.fraudDetected}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <Lock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-extrabold">Blocked</p>
              <p className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{stats.blocked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Data Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex border-b border-gray-200">
          {renderPlatformButton('ANDROID', 'Android', <Smartphone className="h-4 w-4" />)}
          {renderPlatformButton('IOS', 'iOS', <Apple className="h-4 w-4" />)}
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Search Bar with Z-Index */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="relative w-full md:w-72">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search client code"
                className="min-h-[44px] touch-manipulation"
              />
            </div>
            <p className="text-xs text-gray-600">
              Source: {activePlatform === 'ANDROID' ? 'getUniqueClientCode (Android)' : 'getUniqueClientCode (iOS)'}
            </p>
          </div>

          {/* Mobile Scroll Hint */}
          <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <div className="md:hidden text-xs text-gray-600 mb-2 flex items-center gap-1">
              <span>Swipe to see more</span>
              <span className="animate-bounce">&rarr;</span>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-gray-600">
                  <th className="px-3 md:px-4 py-3">Client Code</th>
                  <th className="px-3 md:px-4 py-3">Package origin</th>
                  <th className="px-3 md:px-4 py-3">Unique assets</th>
                  <th className="px-3 md:px-4 py-3">Block assets</th>
                  <th className="px-3 md:px-4 py-3">Block store</th>
                  <th className="px-3 md:px-4 py-3">Fraud status</th>
                  <th className="px-3 md:px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 md:px-4 py-12 text-center text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 md:px-4 py-12 text-center text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                      No clients match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record) => {
                    const fraud = record.package_name !== '1' || record.unique_assets !== '1';
                    return (
      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 md:px-4 py-3 font-medium text-gray-900">{record.client_code}</td>
                        <td className="px-3 md:px-4 py-3">{formatBooleanTag(record.package_name === '1', 'Valid', 'Invalid')}</td>
                        <td className="px-3 md:px-4 py-3">{formatBooleanTag(record.unique_assets === '1', 'Valid', 'Invalid')}</td>
                        <td className="px-3 md:px-4 py-3">
                          <Button
                            variant={record.blockdirectlyforassets ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleToggle(record, 'blockdirectlyforassets')}
                            className="min-h-[52px] touch-manipulation"
                          >
                            {record.blockdirectlyforassets ? <Unlock className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
                            {record.blockdirectlyforassets ? 'Unblock' : 'Block'}
                          </Button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <Button
                            variant={record.blockdirectlyforplaystorepresence ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => handleToggle(record, 'blockdirectlyforplaystorepresence')}
                            className="min-h-[52px] touch-manipulation"
                          >
                            {record.blockdirectlyforplaystorepresence ? (
                              <Unlock className="mr-1 h-3.5 w-3.5" />
                            ) : (
                              <Lock className="mr-1 h-3.5 w-3.5" />
                            )}
                            {record.blockdirectlyforplaystorepresence ? 'Unblock' : 'Block'}
                          </Button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          {formatBooleanTag(!fraud, fraud ? 'Review' : 'Healthy', fraud ? 'bg-red-500/15 text-red-400' : '')}
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleViewDetails(record)}
                            className="min-h-[52px] touch-manipulation"
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 text-sm shadow-sm font-light" style={{ letterSpacing: '-0.01em' }}>
        <Shield className="mr-2 inline-block h-5 w-5 text-blue-400" />
        Package origin/unique asset flags come from the mobile POC service. A value of "1" indicates the application build
        matches the approved binary and asset list. Any deviation should trigger manual investigation before unblocking.
      </div>

      {/* Client Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>Client Details</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-12 text-center text-sm text-gray-600">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : detailsContent ? (
            <pre className="max-h-[60vh] overflow-auto rounded-lg bg-gray-100 p-3 md:p-4 text-xs text-gray-900">
              {JSON.stringify(detailsContent, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-600">
              No additional details returned for {detailsClient?.code} ({detailsClient?.platform}).
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POCPage;

