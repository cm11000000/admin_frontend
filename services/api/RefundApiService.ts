/**
 * Refund API Service for sabpaisa_admin_v5
 * Comprehensive refund management with approval workflow
 */
import { reportAPI } from '@/lib/api-client';
import { BaseApiService } from './base/BaseApiService';

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed';
export type RefundType = 'full' | 'partial';

export interface IRefund {
  id: string;
  refundId: string;
  transactionId: string;
  merchantTransactionId: string;
  amount: number;
  refundAmount: number;
  currency: string;
  type: RefundType;
  status: RefundStatus;
  reason: string;
  customReason?: string;
  gatewayRefundId?: string;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  clientId: string;
  clientName: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  processedBy?: string;
  processedAt?: string;
  completedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  notes?: string;
  supportingDocuments: {
    id: string;
    filename: string;
    url: string;
    uploadedAt: string;
  }[];
  breakdown: {
    refundAmount: number;
    processingFee: number;
    gatewayCharges: number;
    netAmount: number;
  };
  metadata?: Record<string, any>;
}

export interface IRefundRequest {
  transactionId: string;
  amount: number;
  type: RefundType;
  reason: string;
  customReason?: string;
  notes?: string;
  supportingDocuments?: File[];
}

export interface IRefundApproval {
  refundId: string;
  action: 'approve' | 'reject';
  notes?: string;
  rejectionReason?: string;
}

export interface RefundTimeline {
  id: string;
  status: RefundStatus;
  timestamp: string;
  user: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface RefundSearchFilter {
  search?: string;
  status?: RefundStatus[];
  type?: RefundType[];
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  clientId?: string[];
  requestedBy?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'requestedAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface RefundSearchResponse {
  refunds: IRefund[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  summary: {
    totalAmount: number;
    totalRefundAmount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    completedCount: number;
  };
}

export interface RefundAnalytics {
  totalRefunds: number;
  totalAmount: number;
  refundRate: number;
  statusDistribution: Record<RefundStatus, number>;
  trends: {
    date: string;
    count: number;
    amount: number;
  }[];
  topReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
  averageProcessingTime: number;
  gatewayStats: {
    gateway: string;
    count: number;
    amount: number;
  }[];
}

export interface BulkRefundRequest {
  refunds: {
    transactionId: string;
    amount: number;
    reason: string;
  }[];
}

export interface BulkRefundResponse {
  operationId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  results: {
    transactionId: string;
    success: boolean;
    refundId?: string;
    error?: string;
  }[];
  createdAt: string;
  completedAt?: string;
}

export class RefundApiService extends BaseApiService {
  public readonly serviceName = 'RefundService';
  protected readonly endpoint = '/refunds';

  /**
   * Create a new refund request
   */
  async createRefund(request: IRefundRequest): Promise<IRefund> {
    const formData = new FormData();
    formData.append('transactionId', request.transactionId);
    formData.append('amount', request.amount.toString());
    formData.append('type', request.type);
    formData.append('reason', request.reason);
    if (request.customReason) {
      formData.append('customReason', request.customReason);
    }
    if (request.notes) {
      formData.append('notes', request.notes);
    }
    if (request.supportingDocuments) {
      request.supportingDocuments.forEach((file, index) => {
        formData.append(`supportingDocuments[${index}]`, file);
      });
    }

    const headers = this.getRequestHeaders();
    delete headers['Content-Type'];

    const fullUrl = this.buildFullUrl(`${this.endpoint}/create/`);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'POST',
        startTime: Date.now()
      });
    }

    return await response.json();
  }

  /**
   * Search/list refunds with filters
   */
  async searchRefunds(filter: RefundSearchFilter = {}): Promise<RefundSearchResponse> {
    const params: Record<string, any> = {
      page: filter.page || 1,
      page_size: filter.pageSize || 20,
    };

    if (filter.search) params.search = filter.search;
    if (filter.status && filter.status.length > 0) {
      params.status = filter.status.join(',');
    }
    if (filter.type && filter.type.length > 0) {
      params.type = filter.type.join(',');
    }
    if (filter.dateFrom) params.date_from = filter.dateFrom;
    if (filter.dateTo) params.date_to = filter.dateTo;
    if (filter.amountFrom !== undefined) params.amount_from = filter.amountFrom;
    if (filter.amountTo !== undefined) params.amount_to = filter.amountTo;
    if (filter.clientId && filter.clientId.length > 0) {
      params.client_id = filter.clientId.join(',');
    }
    if (filter.requestedBy) params.requested_by = filter.requestedBy;
    if (filter.sortBy) params.sort_by = filter.sortBy;
    if (filter.sortOrder) params.sort_order = filter.sortOrder;

    const queryString = this.buildQueryString(params);
    const response = await this.get<any>(`/list/?${queryString}`);

    return {
      refunds: response.results || [],
      total: response.count || 0,
      page: filter.page || 1,
      pageSize: filter.pageSize || 20,
      hasNext: !!response.next,
      hasPrev: !!response.previous,
      summary: response.summary || {
        totalAmount: 0,
        totalRefundAmount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        completedCount: 0,
      },
    };
  }

  /**
   * Get refund details by ID
   */
  async getRefundById(id: string): Promise<IRefund> {
    return this.get<IRefund>(`/${id}/`);
  }

  /**
   * Get refund timeline/audit log
   */
  async getRefundTimeline(id: string): Promise<RefundTimeline[]> {
    return this.get<RefundTimeline[]>(`/${id}/timeline/`);
  }

  /**
   * Approve a refund
   */
  async approveRefund(id: string, notes?: string): Promise<IRefund> {
    return this.post<IRefund>(`/${id}/approve/`, { notes });
  }

  /**
   * Reject a refund
   */
  async rejectRefund(id: string, reason: string, notes?: string): Promise<IRefund> {
    return this.post<IRefund>(`/${id}/reject/`, { reason, notes });
  }

  /**
   * Process a refund (initiate gateway processing)
   */
  async processRefund(id: string): Promise<IRefund> {
    return this.post<IRefund>(`/${id}/process/`);
  }

  /**
   * Upload supporting document for refund
   */
  async uploadDocument(refundId: string, file: File): Promise<IRefund> {
    const formData = new FormData();
    formData.append('document', file);

    const headers = this.getRequestHeaders();
    delete headers['Content-Type'];

    const fullUrl = this.buildFullUrl(`${this.endpoint}/${refundId}/upload-document/`);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'POST',
        startTime: Date.now()
      });
    }

    return await response.json();
  }

  /**
   * Add notes to refund
   */
  async addNote(refundId: string, note: string): Promise<void> {
    return this.post<void>(`/${refundId}/notes/`, { note });
  }

  /**
   * Bulk approve refunds
   */
  async bulkApprove(refundIds: string[], notes?: string): Promise<{
    success: boolean;
    results: { refundId: string; success: boolean; error?: string }[];
  }> {
    return this.post<any>('/bulk-approve/', { refundIds, notes });
  }

  /**
   * Bulk reject refunds
   */
  async bulkReject(refundIds: string[], reason: string, notes?: string): Promise<{
    success: boolean;
    results: { refundId: string; success: boolean; error?: string }[];
  }> {
    return this.post<any>('/bulk-reject/', { refundIds, reason, notes });
  }

  /**
   * Create bulk refunds from CSV
   */
  async bulkCreateRefunds(request: BulkRefundRequest): Promise<BulkRefundResponse> {
    return this.post<BulkRefundResponse>('/bulk-create/', request);
  }

  /**
   * Get bulk operation status
   */
  async getBulkOperationStatus(operationId: string): Promise<BulkRefundResponse> {
    return this.get<BulkRefundResponse>(`/bulk-operation/${operationId}/`);
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(page: number = 1, pageSize: number = 20): Promise<RefundSearchResponse> {
    return this.searchRefunds({
      status: ['pending'],
      page,
      pageSize,
      sortBy: 'requestedAt',
      sortOrder: 'asc',
    });
  }

  /**
   * Get refund analytics
   */
  async getAnalytics(filter: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    range?: '7d' | '30d' | '90d' | 'custom';
  } = {}): Promise<RefundAnalytics> {
    const body: Record<string, any> = {};
    if (filter.dateFrom) body.fromDate = filter.dateFrom;
    if (filter.dateTo) body.endDate = filter.dateTo;
    if (filter.clientId) body.clientCode = filter.clientId;
    if (filter.range) body.range = filter.range;

    const resp = await reportAPI.post('/analytics/refund_sla/', body);
    if (!resp?.data) throw new Error('Failed to fetch refund analytics');
    return resp.data as RefundAnalytics;
  }

  /**
   * Export refunds to CSV/Excel
   */
  async exportRefunds(
    filter: RefundSearchFilter & { format: 'csv' | 'xlsx' },
    filename?: string
  ): Promise<void> {
    const params: Record<string, string> = {
      format: filter.format,
    };

    if (filter.search) params.search = filter.search;
    if (filter.status && filter.status.length > 0) {
      params.status = filter.status.join(',');
    }
    if (filter.type && filter.type.length > 0) {
      params.type = filter.type.join(',');
    }
    if (filter.dateFrom) params.date_from = filter.dateFrom;
    if (filter.dateTo) params.date_to = filter.dateTo;
    if (filter.amountFrom !== undefined) params.amount_from = filter.amountFrom.toString();
    if (filter.amountTo !== undefined) params.amount_to = filter.amountTo.toString();

    await this.downloadFile(
      'refundExport',
      params,
      filename || `refunds-${new Date().toISOString().split('T')[0]}.${filter.format}`
    );
  }

  /**
   * Download refund receipt
   */
  async downloadReceipt(refundId: string): Promise<void> {
    const fullUrl = this.buildFullUrl(`${this.endpoint}/${refundId}/receipt/`);
    const headers = this.getRequestHeaders();

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'GET',
        startTime: Date.now()
      });
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `refund-receipt-${refundId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Search transaction for refund (validate transaction is eligible)
   */
  async searchTransaction(transactionId: string): Promise<{
    transaction: {
      id: string;
      merchantTransactionId: string;
      amount: number;
      status: string;
      customerEmail: string;
      customerPhone?: string;
      paymentMethod: string;
      createdAt: string;
    };
    eligibility: {
      eligible: boolean;
      reason?: string;
      maxRefundAmount: number;
      alreadyRefunded: number;
    };
  }> {
    return this.get<any>(`/search-transaction/${transactionId}/`);
  }

  /**
   * Download bulk refund template CSV
   */
  async downloadBulkTemplate(): Promise<void> {
    const fullUrl = this.buildFullUrl(`${this.endpoint}/bulk-template/`);
    const headers = this.getRequestHeaders();

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'GET',
        startTime: Date.now()
      });
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'bulk-refund-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

export const refundService = new RefundApiService();
