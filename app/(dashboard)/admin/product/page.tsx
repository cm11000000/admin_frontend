'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Users, Package, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import adminPagesApiService, {
  type ProductAssignRequest,
  type ProductAssignResponse,
  type ClientCode
} from '@/services/api/AdminPagesApiService';

interface ProductOption {
  id: string;
  name: string;
  description: string;
}

const products: ProductOption[] = [
  {
    id: '28',
    name: 'Payment Link',
    description: 'Enable payment link creation and management tools.'
  },
  {
    id: '29',
    name: 'eNach',
    description: 'Allow automated recurring collections via eNach mandates.'
  }
];

const normalizeClient = (client: ClientCode) => ({
  code: client.clientCode,
  name: client.clientName ?? client.clientCode
});

const ProductPage: React.FC = () => {
  const [clients, setClients] = useState<Array<{ code: string; name: string }>>([]);

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
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
  }, []);

  const clientOptions = useMemo(() => {
    return clients.map((client) => ({
      value: client.code,
      label: `${client.code} — ${client.name}`
    }));
  }, [clients]);

  const productOptions = useMemo(() => {
    return products.map((product) => ({
      value: product.id,
      label: product.name
    }));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClient) {
      toast.error('Select a client before assigning a product');
      return;
    }

    if (!selectedProduct) {
      toast.error('Select a product to assign');
      return;
    }

    setIsAssigning(true);

    try {
      const payload: ProductAssignRequest = {
        client_code: selectedClient,
        app_code: selectedProduct
      };

      const response: ProductAssignResponse = await adminPagesApiService.assignProduct(payload);
      toast.success(response?.message || 'Product assigned successfully');
      setSelectedProduct('');
    } catch (error: any) {
      console.error('Failed to assign product', error);
      toast.error(error?.message || 'Failed to assign product');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Assign Product</h1>
        <p className="mt-2 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
          Attach newly onboarded clients to Payment Link or eNach products. Matches the Angular Add Product flow.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg md:rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-extrabold">Clients available</p>
              <p className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg md:rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Package className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-extrabold">Products available</p>
              <p className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{products.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl md:rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl"
      >
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Product Assignment</h2>
          <p className="mt-1 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
            Select a client and product to assign
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <div className="space-y-2 md:space-y-3">
            <Label className="text-sm md:text-base font-extrabold">Client</Label>
            <Combobox
              options={clientOptions}
              value={selectedClient}
              onValueChange={setSelectedClient}
              placeholder={isLoadingClients ? 'Loading clients...' : 'Search and select client'}
              emptyText="No client found"
              searchPlaceholder="Search by code or name..."
              disabled={isLoadingClients || clientOptions.length === 0}
              className="min-h-[44px] touch-manipulation"
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <Label className="text-sm md:text-base font-extrabold">Product</Label>
            <Combobox
              options={productOptions}
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              placeholder="Search and select product"
              emptyText="No product found"
              searchPlaceholder="Search products..."
              className="min-h-[44px] touch-manipulation"
            />
            {selectedProduct && (
              <p className="text-xs md:text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                {products.find((product) => product.id === selectedProduct)?.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isAssigning || !selectedClient || !selectedProduct}
            className="min-h-[52px] touch-manipulation w-full md:w-auto"
          >
            {isAssigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Assign product →
          </Button>
        </div>
      </form>

      {/* Warning Notice */}
      <div className="rounded-lg md:rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 md:p-4 text-sm text-amber-700 font-light" style={{ letterSpacing: '-0.01em' }}>
        <strong className="font-extrabold">Important:</strong> Assigning a product calls the production cobAWS endpoint (`/application-master/assign-merchant/`). Ensure client code
        and product selections are correct before submitting.
      </div>
    </div>
  );
};

export default ProductPage;

