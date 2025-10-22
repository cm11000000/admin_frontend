'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StepIndicator } from '@/components/merchants/StepIndicator';
import { DocumentUploader } from '@/components/merchants/DocumentUploader';
import { useMerchantStore } from '@/stores/merchantStore';
import { toast } from 'react-hot-toast';
import type { IOnboardingDraft, IContact, IBankAccount } from '@/types/merchant';

const ONBOARDING_STEPS = [
  { id: 0, title: 'Business Info', description: 'Basic business details' },
  { id: 1, title: 'Contact Info', description: 'Contact persons' },
  { id: 2, title: 'Bank Details', description: 'Banking information' },
  { id: 3, title: 'Documents', description: 'Upload documents' },
  { id: 4, title: 'Gateway Config', description: 'Payment gateways' },
  { id: 5, title: 'Rate Config', description: 'Rate configuration' },
  { id: 6, title: 'Review', description: 'Review and submit' },
];

export default function MerchantOnboardingPage() {
  if (typeof window === 'undefined') return null as any;
  const router = useRouter();
  const {
    onboardingDraft,
    currentOnboardingStep,
    isSubmitting,
    businessTypes,
    businessCategories,
    rateTemplates,
    saveDraft,
    loadDraft,
    setCurrentStep,
    nextStep,
    previousStep,
    submitForApproval,
    fetchBusinessTypes,
    fetchBusinessCategories,
    fetchRateTemplates,
  } = useMerchantStore();

  const [formData, setFormData] = useState<any>({
    businessInfo: {},
    contactInfo: { contacts: [] },
    bankDetails: { bankAccounts: [] },
    documents: { uploadedDocuments: [] },
    gatewayConfig: { gateways: [] },
    rateConfig: {},
  });

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDraft();
    fetchBusinessTypes();
    fetchBusinessCategories();
    fetchRateTemplates();
  }, []);

  useEffect(() => {
    if (onboardingDraft) {
      setFormData(onboardingDraft.data || formData);
    }
  }, [onboardingDraft]);

  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    setAutoSaveTimer(timer);

    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [formData, currentOnboardingStep]);

  const handleAutoSave = async () => {
    try {
      const completedSteps = Object.keys(formData)
        .map((key, idx) => {
          const data = formData[key];
          if (data && Object.keys(data).length > 0) return idx;
          return null;
        })
        .filter((step) => step !== null) as number[];

      const draft: IOnboardingDraft = {
        id: onboardingDraft?.id,
        currentStep: currentOnboardingStep,
        completedSteps,
        totalSteps: ONBOARDING_STEPS.length,
        data: formData,
        savedAt: new Date().toISOString(),
      };

      await saveDraft(draft);
    } catch (error) {
      // Silent fail for auto-save
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = async () => {
    await handleAutoSave();
    nextStep();
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSubmit = async () => {
    try {
      await handleAutoSave();

      if (onboardingDraft?.merchantId) {
        await submitForApproval(onboardingDraft.merchantId);
        toast.success('Merchant submitted for approval successfully!');
        router.push('/clients/merchants');
      } else {
        toast.error('Please complete all steps before submitting');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit merchant for approval');
    }
  };

  const renderBusinessInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={formData.businessInfo?.businessName || ''}
            onChange={(e) => handleInputChange('businessInfo', 'businessName', e.target.value)}
            placeholder="Enter business name"
            required
          />
        </div>

        <div>
          <Label htmlFor="businessType">Business Type *</Label>
          <select
            id="businessType"
            className="w-full px-3 py-2 border border-gray-300/50 rounded-md"
            value={formData.businessInfo?.businessType || ''}
            onChange={(e) => handleInputChange('businessInfo', 'businessType', e.target.value)}
            required
          >
            <option value="">Select business type</option>
            {businessTypes.map((type) => (
              <option key={type.id} value={type.code}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <select
            id="category"
            className="w-full px-3 py-2 border border-gray-300/50 rounded-md"
            value={formData.businessInfo?.category || ''}
            onChange={(e) => handleInputChange('businessInfo', 'category', e.target.value)}
            required
          >
            <option value="">Select category</option>
            {businessCategories.map((cat) => (
              <option key={cat.id} value={cat.code}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="panNumber">PAN Number *</Label>
          <Input
            id="panNumber"
            value={formData.businessInfo?.panNumber || ''}
            onChange={(e) => handleInputChange('businessInfo', 'panNumber', e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            maxLength={10}
            required
          />
        </div>

        <div>
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input
            id="gstNumber"
            value={formData.businessInfo?.gstNumber || ''}
            onChange={(e) => handleInputChange('businessInfo', 'gstNumber', e.target.value.toUpperCase())}
            placeholder="22ABCDE1234F1Z5"
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            value={formData.businessInfo?.registrationNumber || ''}
            onChange={(e) => handleInputChange('businessInfo', 'registrationNumber', e.target.value)}
            placeholder="Enter registration number"
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.businessInfo?.website || ''}
            onChange={(e) => handleInputChange('businessInfo', 'website', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Business Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={formData.businessInfo?.address?.street || ''}
              onChange={(e) =>
                handleInputChange('businessInfo', 'address', {
                  ...formData.businessInfo?.address,
                  street: e.target.value,
                })
              }
              placeholder="Enter street address"
              required
            />
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.businessInfo?.address?.city || ''}
              onChange={(e) =>
                handleInputChange('businessInfo', 'address', {
                  ...formData.businessInfo?.address,
                  city: e.target.value,
                })
              }
              placeholder="Enter city"
              required
            />
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.businessInfo?.address?.state || ''}
              onChange={(e) =>
                handleInputChange('businessInfo', 'address', {
                  ...formData.businessInfo?.address,
                  state: e.target.value,
                })
              }
              placeholder="Enter state"
              required
            />
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code *</Label>
            <Input
              id="postalCode"
              value={formData.businessInfo?.address?.postalCode || ''}
              onChange={(e) =>
                handleInputChange('businessInfo', 'address', {
                  ...formData.businessInfo?.address,
                  postalCode: e.target.value,
                })
              }
              placeholder="Enter postal code"
              maxLength={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.businessInfo?.address?.country || 'India'}
              onChange={(e) =>
                handleInputChange('businessInfo', 'address', {
                  ...formData.businessInfo?.address,
                  country: e.target.value,
                })
              }
              placeholder="Enter country"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactInfoStep = () => {
    const addContact = () => {
      const newContact: IContact = {
        name: '',
        email: '',
        phone: '',
        designation: '',
        isPrimary: formData.contactInfo?.contacts?.length === 0,
      };
      handleInputChange('contactInfo', 'contacts', [
        ...(formData.contactInfo?.contacts || []),
        newContact,
      ]);
    };

    const updateContact = (index: number, field: string, value: any) => {
      const contacts = [...(formData.contactInfo?.contacts || [])];
      contacts[index] = { ...contacts[index], [field]: value };
      handleInputChange('contactInfo', 'contacts', contacts);
    };

    const removeContact = (index: number) => {
      const contacts = formData.contactInfo?.contacts?.filter((_: any, i: number) => i !== index) || [];
      handleInputChange('contactInfo', 'contacts', contacts);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <Button onClick={addContact} variant="outline">
            Add Contact
          </Button>
        </div>

        {formData.contactInfo?.contacts?.map((contact: IContact, index: number) => (
          <Card key={index} className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium">
                Contact {index + 1}
                {contact.isPrimary && (
                  <span className="ml-2 text-xs bg-[#0077FF]/20 text-[#0077FF] border border-[#0077FF]/40 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </h4>
              {!contact.isPrimary && (
                <Button
                  onClick={() => removeContact(index)}
                  variant="ghost"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="text"
                  value={contact.email}
                  onChange={(e) => updateContact(index, 'email', e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <Label>Phone *</Label>
                <Input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  placeholder="+91 1234567890"
                  required
                />
              </div>

              <div>
                <Label>Designation *</Label>
                <Input
                  value={contact.designation}
                  onChange={(e) => updateContact(index, 'designation', e.target.value)}
                  placeholder="e.g., CEO, Manager"
                  required
                />
              </div>
            </div>
          </Card>
        ))}

        {(!formData.contactInfo?.contacts || formData.contactInfo.contacts.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No contacts added yet. Click "Add Contact" to get started.
          </div>
        )}
      </div>
    );
  };

  const renderBankDetailsStep = () => {
    const addBankAccount = () => {
      const newAccount: Partial<IBankAccount> = {
        bankName: '',
        branch: '',
        accountNumber: '',
        ifscCode: '',
        accountType: 'current',
        beneficiaryName: '',
        isPrimary: formData.bankDetails?.bankAccounts?.length === 0,
        isVerified: false,
      };
      handleInputChange('bankDetails', 'bankAccounts', [
        ...(formData.bankDetails?.bankAccounts || []),
        newAccount,
      ]);
    };

    const updateBankAccount = (index: number, field: string, value: any) => {
      const accounts = [...(formData.bankDetails?.bankAccounts || [])];
      accounts[index] = { ...accounts[index], [field]: value };
      handleInputChange('bankDetails', 'bankAccounts', accounts);
    };

    const removeBankAccount = (index: number) => {
      const accounts = formData.bankDetails?.bankAccounts?.filter((_: any, i: number) => i !== index) || [];
      handleInputChange('bankDetails', 'bankAccounts', accounts);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Bank Account Details</h3>
          <Button onClick={addBankAccount} variant="outline">
            Add Bank Account
          </Button>
        </div>

        {formData.bankDetails?.bankAccounts?.map((account: any, index: number) => (
          <Card key={index} className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium">
                Account {index + 1}
                {account.isPrimary && (
                  <span className="ml-2 text-xs bg-[#0077FF]/20 text-[#0077FF] border border-[#0077FF]/40 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </h4>
              {!account.isPrimary && (
                <Button
                  onClick={() => removeBankAccount(index)}
                  variant="ghost"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bank Name *</Label>
                <Input
                  value={account.bankName}
                  onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                  placeholder="Enter bank name"
                  required
                />
              </div>

              <div>
                <Label>Branch *</Label>
                <Input
                  value={account.branch}
                  onChange={(e) => updateBankAccount(index, 'branch', e.target.value)}
                  placeholder="Enter branch name"
                  required
                />
              </div>

              <div>
                <Label>Account Number *</Label>
                <Input
                  value={account.accountNumber}
                  onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  required
                />
              </div>

              <div>
                <Label>IFSC Code *</Label>
                <Input
                  value={account.ifscCode}
                  onChange={(e) => updateBankAccount(index, 'ifscCode', e.target.value.toUpperCase())}
                  placeholder="ABCD0123456"
                  maxLength={11}
                  required
                />
              </div>

              <div>
                <Label>Account Type *</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300/50 rounded-md"
                  value={account.accountType}
                  onChange={(e) => updateBankAccount(index, 'accountType', e.target.value)}
                  required
                >
                  <option value="current">Current</option>
                  <option value="savings">Savings</option>
                </select>
              </div>

              <div>
                <Label>Beneficiary Name *</Label>
                <Input
                  value={account.beneficiaryName}
                  onChange={(e) => updateBankAccount(index, 'beneficiaryName', e.target.value)}
                  placeholder="Enter beneficiary name"
                  required
                />
              </div>
            </div>
          </Card>
        ))}

        {(!formData.bankDetails?.bankAccounts || formData.bankDetails.bankAccounts.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No bank accounts added yet. Click "Add Bank Account" to get started.
          </div>
        )}
      </div>
    );
  };

  const renderDocumentsStep = () => {
    const handleDocumentUpload = async (files: File[]) => {
      toast.success(`${files.length} document(s) uploaded successfully`);
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Upload Business Documents</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Documents</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Incorporation Certificate</li>
              <li>GST Certificate (if applicable)</li>
              <li>PAN Card</li>
              <li>Address Proof</li>
              <li>Bank Statement (last 6 months)</li>
              <li>Board Resolution / MOA</li>
              <li>Director KYC Documents</li>
            </ul>
          </div>

          <DocumentUploader
            onUpload={handleDocumentUpload}
            acceptedFormats={['.pdf', '.jpg', '.jpeg', '.png']}
            maxSizeInMB={10}
            multiple={true}
          />
        </div>
      </div>
    );
  };

  const renderGatewayConfigStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Gateway Configuration</h3>
      <p className="text-gray-600">
        Select and configure payment gateways for this merchant. This section will be configured by the admin team.
      </p>
      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          Gateway configuration will be completed during the approval process by the admin team.
        </p>
      </Card>
    </div>
  );

  const renderRateConfigStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Rate Configuration</h3>

      <div>
        <Label htmlFor="rateTemplate">Select Rate Template</Label>
        <select
          id="rateTemplate"
          className="w-full px-3 py-2 border border-gray-300/50 rounded-md"
          value={formData.rateConfig?.templateId || ''}
          onChange={(e) => handleInputChange('rateConfig', 'templateId', e.target.value)}
        >
          <option value="">Select a rate template</option>
          {rateTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} - {template.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="settlementCycle">Settlement Cycle *</Label>
        <select
          id="settlementCycle"
          className="w-full px-3 py-2 border border-gray-300/50 rounded-md"
          value={formData.rateConfig?.settlementCycle || 'daily'}
          onChange={(e) => handleInputChange('rateConfig', 'settlementCycle', e.target.value)}
          required
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="bi_weekly">Bi-Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reserveAmount">Reserve Amount (INR)</Label>
          <Input
            id="reserveAmount"
            type="number"
            value={formData.rateConfig?.reserveAmount || 0}
            onChange={(e) => handleInputChange('rateConfig', 'reserveAmount', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="reservePercentage">Reserve Percentage (%)</Label>
          <Input
            id="reservePercentage"
            type="number"
            value={formData.rateConfig?.reservePercentage || 0}
            onChange={(e) => handleInputChange('rateConfig', 'reservePercentage', parseFloat(e.target.value) || 0)}
            placeholder="0"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review & Submit</h3>

      <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
        <h4 className="font-medium mb-4">Business Information</h4>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Business Name</dt>
            <dd className="font-medium">{formData.businessInfo?.businessName || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Business Type</dt>
            <dd className="font-medium">{formData.businessInfo?.businessType || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Category</dt>
            <dd className="font-medium">{formData.businessInfo?.category || '-'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">PAN Number</dt>
            <dd className="font-medium">{formData.businessInfo?.panNumber || '-'}</dd>
          </div>
        </dl>
      </Card>

      <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
        <h4 className="font-medium mb-4">Contacts</h4>
        <p className="text-sm text-gray-600">
          {formData.contactInfo?.contacts?.length || 0} contact(s) added
        </p>
      </Card>

      <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
        <h4 className="font-medium mb-4">Bank Accounts</h4>
        <p className="text-sm text-gray-600">
          {formData.bankDetails?.bankAccounts?.length || 0} bank account(s) added
        </p>
      </Card>

      <Card className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/5 transition-shadow duration-300">
        <h4 className="font-medium mb-4">Documents</h4>
        <p className="text-sm text-gray-600">
          {formData.documents?.uploadedDocuments?.length || 0} document(s) uploaded
        </p>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          By submitting this application, you confirm that all information provided is accurate and complete.
          The application will be reviewed by our team and you will be notified of the approval status.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentOnboardingStep) {
      case 0:
        return renderBusinessInfoStep();
      case 1:
        return renderContactInfoStep();
      case 2:
        return renderBankDetailsStep();
      case 3:
        return renderDocumentsStep();
      case 4:
        return renderGatewayConfigStep();
      case 5:
        return renderRateConfigStep();
      case 6:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const completedSteps = Object.keys(formData)
    .map((key, idx) => {
      const data = formData[key];
      if (data && Object.keys(data).length > 0) return idx;
      return null;
    })
    .filter((step) => step !== null) as number[];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Merchant Onboarding
        </h1>
        <p className="text-gray-600">
          Complete the merchant onboarding process step by step
        </p>
      </div>

      <StepIndicator
        steps={ONBOARDING_STEPS}
        currentStep={currentOnboardingStep}
        completedSteps={completedSteps}
        onStepClick={(stepId) => setCurrentStep(stepId)}
      />

      <Card className="p-8 mt-8">
        {renderCurrentStep()}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentOnboardingStep === 0 || isSubmitting}
          >
            Previous
          </Button>

          {currentOnboardingStep < ONBOARDING_STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
