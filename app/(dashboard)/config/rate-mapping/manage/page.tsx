'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ManageFeeTab from './ManageFeeTab';
import ReportApiService from '@/services/api/ReportApiService';
import { resolveUserName } from '@/lib/utils';

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

export default function ManageRateMappingPage(): JSX.Element {
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    return 'Edit production fee slabs, taxes, and audit remarks in parity with the Angular Manage Fee tab.';
  }, [clients.length, isLoading]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Manage Rate Mapping</h1>
          <p className="text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>{headerDescription}</p>
          <p className="text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
            Features such as payment-mode toggles, mapping updates, and client flag management are scheduled next. This
            iteration focuses on the Manage Fee workflow, wired to the production approval trail.
          </p>
        </div>
      </div>

      <ManageFeeTab clients={clients} userName={userName} isAdmin={isAdmin} />
    </div>
  );
}
