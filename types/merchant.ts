/**
 * Merchant Management Type Definitions
 */

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface IContact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  isPrimary: boolean;
}

export interface IBankAccount {
  id: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'savings' | 'current';
  beneficiaryName: string;
  isPrimary: boolean;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface IDocument {
  id: string;
  type: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verifiedBy?: string;
  verifiedAt?: string;
  expiryDate?: string;
  notes?: string;
  rejectionReason?: string;
}

export interface IGatewayConfig {
  id: string;
  gatewayName: string;
  gatewayType: string;
  isActive: boolean;
  isPrimary: boolean;
  priority: number;
  credentials: Record<string, string>;
  testMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IRateConfig {
  id: string;
  templateId?: string;
  templateName?: string;
  customRates?: {
    paymentMode: string;
    rate: number;
    fixedFee: number;
  }[];
  settlementCycle: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  settlementDay?: number;
  reserveAmount: number;
  reservePercentage: number;
  createdAt: string;
  updatedAt: string;
}

export type MerchantStatus =
  | 'pending_approval'
  | 'under_review'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'rejected';

export interface IMerchant {
  id: string;
  merchantCode: string;
  businessName: string;
  businessType: string;
  category: string;
  subCategory?: string;
  gstNumber?: string;
  panNumber: string;
  registrationNumber?: string;
  cinNumber?: string;
  incorporationDate?: string;
  address: IAddress;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  contacts: IContact[];
  bankAccounts: IBankAccount[];
  documents: IDocument[];
  status: MerchantStatus;
  gateways: IGatewayConfig[];
  rateConfig?: IRateConfig;
  onboardingDate: string;
  approvedDate?: string;
  activatedDate?: string;
  accountManager?: string;
  accountManagerName?: string;
  tags: string[];
  metadata?: Record<string, any>;

  // Statistics
  totalTransactions?: number;
  totalVolume?: number;
  successRate?: number;
  averageTicketSize?: number;
  lastTransactionDate?: string;

  // Compliance
  complianceScore?: number;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  riskLevel?: 'low' | 'medium' | 'high';

  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface IOnboardingDraft {
  id?: string;
  merchantId?: string;
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  data: {
    businessInfo?: {
      businessName: string;
      businessType: string;
      category: string;
      subCategory?: string;
      registrationNumber?: string;
      gstNumber?: string;
      panNumber: string;
      cinNumber?: string;
      incorporationDate?: string;
      address: IAddress;
      website?: string;
      socialMedia?: Record<string, string>;
    };
    contactInfo?: {
      contacts: IContact[];
    };
    bankDetails?: {
      bankAccounts: IBankAccount[];
    };
    documents?: {
      uploadedDocuments: IDocument[];
    };
    gatewayConfig?: {
      gateways: IGatewayConfig[];
    };
    rateConfig?: IRateConfig;
  };
  savedAt: string;
  expiresAt?: string;
}

export interface IComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  timestamp: string;
  isInternal: boolean;
}

export interface IVerificationChecklist {
  businessInfoVerified: boolean;
  documentsVerified: boolean;
  bankDetailsVerified: boolean;
  gatewayTested: boolean;
  rateApproved: boolean;
  kycVerified: boolean;
  addressVerified: boolean;
}

export interface IApprovalRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantCode: string;
  businessType: string;
  category: string;
  submittedAt: string;
  submittedBy: string;
  submittedByName: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  assignedTo?: string;
  assignedToName?: string;
  priority: 'high' | 'medium' | 'low';
  daysPending: number;
  verificationChecklist: IVerificationChecklist;
  comments: IComment[];
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectionReason?: string;
}

export interface IActivityLog {
  id: string;
  merchantId: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'status_change' | 'approval' | 'rejection' | 'document_upload' | 'document_verification';
  description: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
}

export interface IMerchantNote {
  id: string;
  merchantId: string;
  note: string;
  category: 'general' | 'risk' | 'support' | 'compliance' | 'finance';
  isPinned: boolean;
  isPrivate: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IMerchantStats {
  totalMerchants: number;
  activeMerchants: number;
  inactiveMerchants: number;
  suspendedMerchants: number;
  pendingApprovals: number;
  thisMonthOnboarding: number;
  lastMonthOnboarding: number;
  growthRate: number;
}

export interface IMerchantFilters {
  search?: string;
  status?: MerchantStatus[];
  category?: string[];
  businessType?: string[];
  onboardingDateFrom?: string;
  onboardingDateTo?: string;
  tags?: string[];
  accountManager?: string;
  kycStatus?: string[];
  riskLevel?: string[];
  sortBy?: 'name' | 'date' | 'revenue' | 'transactions';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface IMerchantListResponse {
  merchants: IMerchant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IDocumentCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  isRequired: boolean;
  acceptedFormats: string[];
  maxSizeInMB: number;
  hasExpiry: boolean;
}

export interface IComplianceDashboard {
  overallScore: number;
  missingDocuments: IDocumentCategory[];
  expiringDocuments: IDocument[];
  expiredDocuments: IDocument[];
  verificationStatus: {
    kyc: 'pending' | 'verified' | 'rejected';
    businessDocs: 'pending' | 'verified' | 'rejected';
    bankDocs: 'pending' | 'verified' | 'rejected';
    addressProof: 'pending' | 'verified' | 'rejected';
  };
  complianceHistory: {
    date: string;
    score: number;
    notes?: string;
  }[];
}

export interface IMerchantTransaction {
  id: string;
  merchantId: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMode: string;
  gatewayName: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  completedAt?: string;
  settlementStatus?: string;
  settlementDate?: string;
}

export interface IMerchantSettlement {
  id: string;
  merchantId: string;
  settlementId: string;
  amount: number;
  transactionCount: number;
  periodStart: string;
  periodEnd: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  initiatedAt: string;
  completedAt?: string;
  utrNumber?: string;
}

export interface IApiKeyPair {
  id: string;
  merchantId: string;
  publicKey: string;
  secretKey: string;
  environment: 'test' | 'production';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

export interface IBulkActionRequest {
  merchantIds: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'export' | 'assign_manager' | 'add_tags';
  params?: Record<string, any>;
}

export interface IBulkActionResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: {
    merchantId: string;
    error: string;
  }[];
}

export interface IDocumentUploadRequest {
  file: File;
  type: string;
  category: string;
  expiryDate?: string;
  notes?: string;
}

export interface IDocumentUploadResponse {
  document: IDocument;
  message: string;
}

export interface IMerchantAgreement {
  id: string;
  merchantId: string;
  agreementType: string;
  templateId: string;
  content: string;
  status: 'draft' | 'sent' | 'signed' | 'expired' | 'rejected';
  sentAt?: string;
  signedAt?: string;
  signedBy?: string;
  expiresAt?: string;
  documentUrl?: string;
}

export interface IBusinessType {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface IBusinessCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface IRateTemplate {
  id: string;
  name: string;
  description: string;
  rates: {
    paymentMode: string;
    rate: number;
    fixedFee: number;
  }[];
  settlementCycle: 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  isActive: boolean;
}
