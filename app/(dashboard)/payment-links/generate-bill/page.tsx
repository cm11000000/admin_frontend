'use client';

/**
 * Generate Bill Page - Bill Creation Form
 * Create and generate bills for PayLink charges
 */
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  IndianRupee,
  User,
  Calendar,
  Plus,
  Trash2,
  Save,
  Send,
  Download,
  Check,
  Loader2,
  Building,
  Mail,
  Phone,
  MapPin,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/lib/toast';
import { formatCurrency } from '@/lib/utils';
import { payLinkChargeService, GenerateBillRequest, GenerateBillResponse } from '@/services/api/PayLinkChargeApiService';

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface BillData extends GenerateBillResponse {}

interface FormData {
  clientName: string;
  clientCode: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  items: BillItem[];
  taxRate: number;
  discountRate: number;
  notes: string;
  termsAndConditions: string;
}

export default function GenerateBillPage() {
  if (typeof window === 'undefined') return null;
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [billGenerated, setBillGenerated] = useState(false);
  const [billData, setBillData] = useState<BillData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientCode: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    billNumber: `BILL-${Date.now()}`,
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    taxRate: 18,
    discountRate: 0,
    notes: '',
    termsAndConditions: 'Payment due within 30 days. Late payments may incur additional charges.',
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: keyof BillItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const handleAddItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (formData.items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * formData.discountRate) / 100;
  };

  const calculateTax = () => {
    return ((calculateSubtotal() - calculateDiscount()) * formData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  const handleGenerateBill = async () => {
    // Validation
    if (!formData.clientName || !formData.clientCode) {
      toast.error('Please fill in required client details');
      return;
    }

    if (formData.items.some(item => !item.description || item.rate === 0)) {
      toast.error('Please fill in all item details');
      return;
    }

    setIsGenerating(true);
    try {
      // Determine billing types from items
      const billingTypes: ('SMS' | 'Email' | 'Link')[] = [];
      formData.items.forEach(item => {
        if (item.description.toLowerCase().includes('sms')) billingTypes.push('SMS');
        if (item.description.toLowerCase().includes('email')) billingTypes.push('Email');
        if (item.description.toLowerCase().includes('link')) billingTypes.push('Link');
      });

      // If no specific types found, default to all
      if (billingTypes.length === 0) {
        billingTypes.push('SMS', 'Email', 'Link');
      }

      const billRequest: GenerateBillRequest = {
        clientCode: formData.clientCode,
        fromDate: formData.billDate,
        endDate: formData.dueDate || formData.billDate,
        billingTypes,
      };

      const response = await payLinkChargeService.generateBill(billRequest);

      // Check if there's an error message
      if (response.message) {
        toast.error(response.message);
        return;
      }

      setBillData(response);
      setBillGenerated(true);
      toast.success('Bill generated successfully');
    } catch (error: any) {
      console.error('Failed to generate bill:', error);
      toast.error(error.message || 'Failed to generate bill');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    toast.success('Downloading bill as PDF');
  };

  const handleSendEmail = () => {
    toast.success('Bill sent via email');
  };

  const handleCreateNew = () => {
    setBillGenerated(false);
    setBillData(null);
    setFormData({
      clientName: '',
      clientCode: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      billNumber: `BILL-${Date.now()}`,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [
        {
          id: '1',
          description: '',
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
      taxRate: 18,
      discountRate: 0,
      notes: '',
      termsAndConditions: 'Payment due within 30 days. Late payments may incur additional charges.',
    });
  };

  if (billGenerated) {
    return (
      <div className="max-w-4xl">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bill Generated Successfully!</h1>
            <p className="text-gray-600">Bill #{formData.billNumber} has been created</p>
          </div>

          {/* Bill Preview Card */}
          <Card className="p-6 text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Bill Summary</h2>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/40">Generated</Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Bill Number</Label>
                  <p className="font-medium">{formData.billNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Client</Label>
                  <p className="font-medium">{formData.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Bill Date</Label>
                  <p className="font-medium">{formData.billDate}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Total Amount</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Bill Details</Label>
                {billData && (
                  <div className="space-y-2 text-sm">
                    {billData.totalSms > 0 && (
                      <div className="flex justify-between">
                        <span>SMS Count:</span>
                        <span className="font-medium">{billData.totalSms}</span>
                      </div>
                    )}
                    {billData.totalEmail > 0 && (
                      <div className="flex justify-between">
                        <span>Email Count:</span>
                        <span className="font-medium">{billData.totalEmail}</span>
                      </div>
                    )}
                    {billData.totalLink > 0 && (
                      <div className="flex justify-between">
                        <span>Link Count:</span>
                        <span className="font-medium">{billData.totalLink}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-green-600">{formatCurrency(billData.totalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleSendEmail}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Generate New Bill
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/payment-links')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Links
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Generate Bill</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create a new bill for PayLink charges
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Client Details */}
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <Building className="h-5 w-5" />
            Client Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  className="pl-9"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientCode">Client Code *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="clientCode"
                  placeholder="Enter client code"
                  className="pl-9"
                  value={formData.clientCode}
                  onChange={(e) => handleInputChange('clientCode', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  className="pl-9"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientPhone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="clientPhone"
                  type="tel"
                  placeholder="9876543210"
                  className="pl-9"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="clientAddress">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Textarea
                  id="clientAddress"
                  placeholder="Client address"
                  className="pl-9"
                  rows={2}
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Bill Details */}
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            Bill Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="billNumber">Bill Number</Label>
              <Input
                id="billNumber"
                value={formData.billNumber}
                onChange={(e) => handleInputChange('billNumber', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="billDate">Bill Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="billDate"
                  type="date"
                  className="pl-9"
                  value={formData.billDate}
                  onChange={(e) => handleInputChange('billDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="dueDate"
                  type="date"
                  className="pl-9"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Line Items */}
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Line Items</h3>
            <Button size="sm" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <Card key={item.id} className="p-4 border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5">
                    <Label>Description *</Label>
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Rate *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="pl-9"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Amount</Label>
                    <div className="h-10 flex items-center font-semibold text-green-600">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>

                  <div className="sm:col-span-1 flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Calculations */}
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
          <h3 className="font-semibold text-lg mb-4">Calculations</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="discountRate">Discount Rate (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discountRate}
                  onChange={(e) => handleInputChange('discountRate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
              </div>
              {formData.discountRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount ({formData.discountRate}%):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(calculateDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">{formatCurrency(calculateTax())}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-lg">Total:</span>
                <span className="font-bold text-xl text-green-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
          <h3 className="font-semibold text-lg mb-4">Additional Information</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or comments"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
              <Textarea
                id="termsAndConditions"
                placeholder="Terms and conditions"
                rows={3}
                value={formData.termsAndConditions}
                onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateBill}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Bill
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
