/**
 * Rate Mapping Types and Interfaces
 * Complex rate configuration system with multi-level rules
 */

export interface IRateConfig {
  id: string
  gateway: string
  gatewayId: string
  paymentMode: string
  paymentModeId: string
  subCategory?: string
  subCategoryId?: string
  merchantMDR: number
  gatewayMDR: number
  fixedCharge: number
  minAmount: number
  maxAmount: number
  settlementCycle: number
  isActive: boolean
  priority: number
  effectiveFrom: string
  effectiveTo?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
  children?: IRateConfig[]
}

export interface IRateUpdateRequest {
  id: string
  currentRates: IRateConfig[]
  proposedRates: IRateConfig[]
  reason: string
  effectiveDate: string
  applyTo: 'all' | 'specific' | 'group'
  merchantIds?: string[]
  merchantGroupIds?: string[]
  impactAnalysis: IImpactAnalysis
  status: 'pending' | 'approved' | 'rejected' | 'applied' | 'scheduled'
  approvalChain: IApproval[]
  supportingDocuments?: IDocument[]
  createdBy: string
  createdAt: string
  updatedAt: string
  appliedAt?: string
  scheduledAt?: string
}

export interface IImpactAnalysis {
  affectedTransactionsCount: number
  revenueImpact: number
  revenueImpactPercent: number
  merchantsAffected: number
  averageTicketSize: number
  estimatedMonthlyImpact: number
  breakdownByGateway: {
    gateway: string
    transactionsAffected: number
    revenueImpact: number
  }[]
  breakdownByPaymentMode: {
    paymentMode: string
    transactionsAffected: number
    revenueImpact: number
  }[]
}

export interface IApproval {
  id: string
  level: number
  approverRole: string
  approverName: string
  approverId: string
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  notes?: string
  timestamp?: string
  action?: 'approved' | 'rejected' | 'changes_requested'
}

export interface IDocument {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: string
  uploadedBy: string
}

export interface IRateHistory {
  id: string
  rateConfigId: string
  changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated'
  oldValue?: IRateConfig
  newValue: IRateConfig
  changedBy: string
  changedAt: string
  reason?: string
  approvalRequestId?: string
  approvedBy?: string
  approvedAt?: string
  revertable: boolean
}

export interface IRateCalculationInput {
  amount: number
  gateway: string
  paymentMode: string
  subCategory?: string
  merchantId?: string
}

export interface IRateCalculationResult {
  amount: number
  merchantMDR: number
  merchantMDRAmount: number
  gatewayMDR: number
  gatewayMDRAmount: number
  fixedCharge: number
  totalCharges: number
  netAmount: number
  settlementCycle: number
  breakdown: {
    label: string
    value: number
    percentage?: number
  }[]
  rateConfigUsed: IRateConfig
}

export interface IRateTemplate {
  id: string
  name: string
  description: string
  rates: IRateConfig[]
  createdBy: string
  createdAt: string
  isDefault: boolean
  usageCount: number
}

export interface IRateBulkUpdate {
  rateIds: string[]
  updates: Partial<IRateConfig>
  reason: string
  effectiveDate: string
}

export interface IRateComparison {
  rateId: string
  gateway: string
  paymentMode: string
  subCategory?: string
  current: {
    merchantMDR: number
    gatewayMDR: number
    fixedCharge: number
    isActive: boolean
  }
  proposed: {
    merchantMDR: number
    gatewayMDR: number
    fixedCharge: number
    isActive: boolean
  }
  difference: {
    merchantMDR: number
    gatewayMDR: number
    fixedCharge: number
  }
  percentageChange: {
    merchantMDR: number
    gatewayMDR: number
    fixedCharge: number
  }
}

export interface IRateValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
  rateId?: string
}

export interface IRateImportResult {
  success: boolean
  totalRows: number
  successCount: number
  errorCount: number
  errors: {
    row: number
    errors: IRateValidationError[]
  }[]
  importedRates?: IRateConfig[]
}

export interface IRateExportOptions {
  includeInactive?: boolean
  gateways?: string[]
  paymentModes?: string[]
  format: 'csv' | 'excel' | 'json'
  dateRange?: {
    from: string
    to: string
  }
}

export interface IGateway {
  id: string
  name: string
  code: string
  isActive: boolean
  icon?: string
  color?: string
}

export interface IPaymentMode {
  id: string
  name: string
  code: string
  icon?: string
  color?: string
  category: 'card' | 'upi' | 'netbanking' | 'wallet' | 'other'
}

export interface ISubCategory {
  id: string
  name: string
  code: string
  paymentModeId: string
  icon?: string
}

export interface IRateTreeNode extends IRateConfig {
  level: 'gateway' | 'paymentMode' | 'subCategory'
  expanded?: boolean
  children?: IRateTreeNode[]
  parentId?: string
}

export interface IRateScheduledUpdate {
  id: string
  updateRequestId: string
  scheduledDate: string
  status: 'scheduled' | 'applied' | 'cancelled' | 'failed'
  appliedAt?: string
  error?: string
}

export type RateFilterOptions = {
  clientCode?: string
  gateway?: string[]
  paymentMode?: string[]
  isActive?: boolean
  search?: string
  dateRange?: {
    from: string
    to: string
  }
}

export type RateSortOptions = {
  field: 'gateway' | 'paymentMode' | 'merchantMDR' | 'gatewayMDR' | 'priority' | 'effectiveFrom'
  direction: 'asc' | 'desc'
}

export type UpdateRequestStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'applied' | 'scheduled'

export type HistoryFilterOptions = {
  changeType?: ('created' | 'updated' | 'deleted' | 'activated' | 'deactivated')[]
  changedBy?: string[]
  dateRange?: {
    from: string
    to: string
  }
  rateConfigId?: string
}
