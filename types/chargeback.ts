/**
 * Chargeback Management Types
 * TypeScript interfaces for Chargebacks module
 */

export type ChargebackStatus = 'new' | 'under_review' | 'evidence_submitted' | 'won' | 'lost' | 'closed';
export type ChargebackPriority = 'critical' | 'high' | 'medium' | 'low';
export type EvidenceStatus = 'pending' | 'submitted' | 'accepted' | 'rejected';
export type ResolutionOutcome = 'won' | 'lost';
export type EvidenceType = 'invoice' | 'proof_of_delivery' | 'communication' | 'terms_conditions' | 'other';

export interface IEvidence {
  id: string;
  type: EvidenceType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  description: string;
  uploadedAt: string;
  uploadedBy?: string;
  status: EvidenceStatus;
}

export interface IResolution {
  outcome: ResolutionOutcome;
  amount: number;
  recoveredAmount?: number;
  resolvedAt: string;
  notes: string;
  resolvedBy?: string;
}

export interface IChargebackNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  isInternal: boolean;
}

export interface IChargebackTimeline {
  id: string;
  status: ChargebackStatus;
  timestamp: string;
  notes?: string;
  user?: string;
  action: string;
}

export interface ITransaction {
  id: string;
  merchantTransactionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  gatewayTransactionId?: string;
  createdAt: string;
}

export interface ICustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  chargebackHistory: {
    totalChargebacks: number;
    wonChargebacks: number;
    lostChargebacks: number;
  };
}

export interface IChargeback {
  id: string;
  chargebackId: string;
  transactionId: string;
  transaction?: ITransaction;
  customer?: ICustomer;
  amount: number;
  currency: string;
  status: ChargebackStatus;
  priority: ChargebackPriority;
  reasonCode: string;
  reasonDescription: string;
  customerDisputeReason?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  evidence: IEvidence[];
  bankResponse?: string;
  resolution?: IResolution;
  notes: IChargebackNote[];
  timeline: IChargebackTimeline[];
  assignedTo?: string;
  arn?: string;
  gateway?: string;
  merchantName?: string;
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export interface IChargebackFilters {
  search: string;
  status: ChargebackStatus[];
  priority: ChargebackPriority[];
  dateFrom: string;
  dateTo: string;
  amountFrom: number | null;
  amountTo: number | null;
  gateway: string[];
  assignedTo: string[];
  reasonCode: string[];
  isOverdue?: boolean;
}

export interface IChargebackListResponse {
  chargebacks: IChargeback[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  stats: {
    totalAmount: number;
    newCount: number;
    underReviewCount: number;
    evidenceSubmittedCount: number;
    wonCount: number;
    lostCount: number;
    closedCount: number;
    overdueCount: number;
  };
}

export interface IEvidenceUploadRequest {
  type: EvidenceType;
  description: string;
  file: File;
}

export interface IEvidenceSubmitRequest {
  evidenceIds: string[];
  notes?: string;
}

export interface IChargebackStatusUpdate {
  status: ChargebackStatus;
  notes?: string;
}

export interface IChargebackAction {
  action: 'accept' | 'contest' | 'submit_evidence' | 'close';
  reason?: string;
  notes?: string;
  evidenceIds?: string[];
}

export interface IChargebackAnalytics {
  winLossRatio: {
    won: number;
    lost: number;
    percentage: number;
  };
  totalChargebackAmount: number;
  totalRecoveredAmount: number;
  chargebackRate: number;
  averageResponseTime: number;
  topReasonCodes: {
    code: string;
    description: string;
    count: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    totalChargebacks: number;
    wonChargebacks: number;
    lostChargebacks: number;
    amount: number;
  }[];
  gatewayStats: {
    gateway: string;
    chargebacks: number;
    won: number;
    lost: number;
    amount: number;
  }[];
  statusDistribution: Record<ChargebackStatus, number>;
}

export interface IChargebackKanbanColumn {
  id: ChargebackStatus;
  title: string;
  chargebacks: IChargeback[];
  count: number;
}

export interface IAutoAssignmentRule {
  id: string;
  name: string;
  condition: {
    amountFrom?: number;
    amountTo?: number;
    priority?: ChargebackPriority[];
    gateway?: string[];
    reasonCode?: string[];
  };
  assignTo: string;
  isActive: boolean;
}

export interface IChargebackExportRequest {
  format: 'csv' | 'xlsx' | 'pdf';
  filters: Partial<IChargebackFilters>;
  includeEvidence?: boolean;
}
