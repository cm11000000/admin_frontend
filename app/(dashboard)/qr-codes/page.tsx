'use client';
// Client-only page; safe for static export

/**
 * QR Code Management Page - Mobile-First Design
 * Generate, manage, and download QR codes
 */
import React, { useEffect, useState } from 'react';
import { usePaymentLinkStore } from '@/stores/paymentLinkStore';
import {
  Plus,
  Download,
  QrCode as QrCodeIcon,
  RefreshCw,
  Eye,
  Trash2,
  BarChart3,
  Copy,
  Check,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/lib/toast';
import { formatDateTime } from '@/lib/utils';

export default function QRCodesPage() {
  const {
    qrCodes = [],
    isLoading = false,
    isCreating = false,
    fetchQRCodes = () => Promise.resolve(),
    generateQRCode = async () => null,
    deleteQRCode = async () => {},
    downloadQRCode = async () => {},
    bulkGenerateQRCodes = async () => {},
  } = usePaymentLinkStore() as any;

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    type: 'dynamic' as 'static' | 'dynamic',
    format: 'upi' as 'upi' | 'payment_link',
    upiId: '',
    merchantName: '',
    amount: '',
  });
  const [bulkFormData, setBulkFormData] = useState({
    count: '10',
    type: 'dynamic' as 'static' | 'dynamic',
    format: 'upi' as 'upi' | 'payment_link',
  });

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const handleCreateQRCode = async () => {
    try {
      const data: any = {
        name: createFormData.name,
        type: createFormData.type,
        format: createFormData.format,
      };

      if (createFormData.format === 'upi') {
        data.upiId = createFormData.upiId;
        data.merchantName = createFormData.merchantName;
        if (createFormData.amount) {
          data.amount = parseFloat(createFormData.amount);
        }
      }

      const result = await generateQRCode(data);
      if (result) {
        toast.success('QR code generated successfully');
        setShowCreateDialog(false);
        setCreateFormData({
          name: '',
          type: 'dynamic',
          format: 'upi',
          upiId: '',
          merchantName: '',
          amount: '',
        });
      }
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const handleBulkGenerate = async () => {
    try {
      await bulkGenerateQRCodes({
        count: parseInt(bulkFormData.count),
        type: bulkFormData.type,
        format: bulkFormData.format,
        baseData: {},
      });
      toast.success(`Generated ${bulkFormData.count} QR codes`);
      setShowBulkDialog(false);
    } catch (error) {
      toast.error('Failed to bulk generate QR codes');
    }
  };

  const handleDownload = async (qrCode: any, format: 'png' | 'svg' | 'pdf') => {
    try {
      await downloadQRCode(qrCode.id, format);
      toast.success(`Downloaded QR code as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleDelete = async (qrCode: any) => {
    try {
      await deleteQRCode(qrCode.id);
      toast.success('QR code deleted');
    } catch (error) {
      toast.error('Failed to delete QR code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-600 mt-1">
            Generate and manage payment QR codes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchQRCodes()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkDialog(true)}
          >
            Bulk Generate
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate QR
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total QR Codes</span>
            <QrCodeIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {qrCodes.length}
          </div>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Scans</span>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)}
          </div>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Conversions</span>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {qrCodes.reduce((sum, qr) => sum + qr.conversionCount, 0)}
          </div>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg. Conversion</span>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {qrCodes.length > 0
              ? ((qrCodes.reduce((sum, qr) => sum + qr.conversionCount, 0) /
                  qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)) * 100 || 0).toFixed(1)
              : 0}%
          </div>
        </Card>
      </div>

      {/* QR Codes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : qrCodes.length === 0 ? (
        <Card className="p-12 text-center">
          <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
          <p className="text-gray-600 mb-6">
            Generate your first QR code to get started
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {qrCodes.map((qrCode) => (
            <Card key={qrCode.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{qrCode.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {qrCode.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {qrCode.format}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(qrCode, 'png')}>
                      Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(qrCode, 'svg')}>
                      Download SVG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(qrCode, 'pdf')}>
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(qrCode)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* QR Code Preview */}
              <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <QrCodeIcon className="h-24 w-24 text-gray-400" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600 text-xs">Scans</p>
                  <p className="font-semibold">{qrCode.scanCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Conversions</p>
                  <p className="font-semibold">{qrCode.conversionCount}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                Created: {formatDateTime(qrCode.createdAt)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create QR Code Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">QR Code Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Store Counter 1"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={createFormData.type}
                  onValueChange={(value: any) => setCreateFormData({ ...createFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">Format</Label>
                <Select
                  value={createFormData.format}
                  onValueChange={(value: any) => setCreateFormData({ ...createFormData, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="payment_link">Payment Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {createFormData.format === 'upi' && (
              <>
                <div>
                  <Label htmlFor="upiId">UPI ID *</Label>
                  <Input
                    id="upiId"
                    placeholder="merchant@upi"
                    value={createFormData.upiId}
                    onChange={(e) => setCreateFormData({ ...createFormData, upiId: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="merchantName">Merchant Name</Label>
                  <Input
                    id="merchantName"
                    placeholder="Merchant Name"
                    value={createFormData.merchantName}
                    onChange={(e) => setCreateFormData({ ...createFormData, merchantName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={createFormData.amount}
                    onChange={(e) => setCreateFormData({ ...createFormData, amount: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateQRCode}
                disabled={isCreating || !createFormData.name}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Generate QR Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="count">Number of QR Codes *</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={bulkFormData.count}
                onChange={(e) => setBulkFormData({ ...bulkFormData, count: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulkType">Type</Label>
                <Select
                  value={bulkFormData.type}
                  onValueChange={(value: any) => setBulkFormData({ ...bulkFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="dynamic">Dynamic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulkFormat">Format</Label>
                <Select
                  value={bulkFormData.format}
                  onValueChange={(value: any) => setBulkFormData({ ...bulkFormData, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="payment_link">Payment Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBulkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleBulkGenerate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
