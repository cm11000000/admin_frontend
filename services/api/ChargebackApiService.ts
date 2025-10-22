/**
 * Chargeback API Service for sabpaisa_admin_v5
 * Comprehensive chargeback management with evidence handling
 */
import { BaseApiService } from './base/BaseApiService';
import {
  IChargeback,
  IChargebackFilters,
  IChargebackListResponse,
  IEvidenceUploadRequest,
  IEvidenceSubmitRequest,
  IChargebackStatusUpdate,
  IChargebackAction,
  IChargebackAnalytics,
  IChargebackNote,
  IEvidence,
  ChargebackStatus,
  IAutoAssignmentRule,
  IChargebackExportRequest,
} from '@/types/chargeback';

export interface ChargebackSearchParams {
  search?: string;
  status?: ChargebackStatus[];
  priority?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  gateway?: string[];
  assignedTo?: string[];
  reasonCode?: string[];
  isOverdue?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'amount' | 'priority' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

export class ChargebackApiService extends BaseApiService {
  public readonly serviceName = 'ChargebackService';
  protected readonly endpoint = '/api/chargebacks';

  /**
   * Get list of chargebacks with filters and pagination
   */
  async getChargebacks(params: ChargebackSearchParams = {}): Promise<IChargebackListResponse> {
    try {
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        page_size: params.pageSize || 20,
      };

      if (params.search) queryParams.search = params.search;
      if (params.status && params.status.length > 0) queryParams.status = params.status.join(',');
      if (params.priority && params.priority.length > 0) queryParams.priority = params.priority.join(',');
      if (params.dateFrom) queryParams.date_from = params.dateFrom;
      if (params.dateTo) queryParams.date_to = params.dateTo;
      if (params.amountFrom !== undefined) queryParams.amount_from = params.amountFrom;
      if (params.amountTo !== undefined) queryParams.amount_to = params.amountTo;
      if (params.gateway && params.gateway.length > 0) queryParams.gateway = params.gateway.join(',');
      if (params.assignedTo && params.assignedTo.length > 0) queryParams.assigned_to = params.assignedTo.join(',');
      if (params.reasonCode && params.reasonCode.length > 0) queryParams.reason_code = params.reasonCode.join(',');
      if (params.isOverdue !== undefined) queryParams.is_overdue = params.isOverdue;
      if (params.sortBy) queryParams.sort_by = params.sortBy;
      if (params.sortOrder) queryParams.sort_order = params.sortOrder;

      const queryString = this.buildQueryString(queryParams);
      const response = await this.get<any>(`/list/?${queryString}`);

      const chargebacks = (response.results || response.chargebacks || []).map((cb: any) =>
        this.normalizeChargeback(cb)
      );

      return {
        chargebacks,
        total: response.count || response.total || 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        hasNext: response.next || false,
        hasPrev: response.previous || false,
        stats: response.stats || {
          totalAmount: 0,
          newCount: 0,
          underReviewCount: 0,
          evidenceSubmittedCount: 0,
          wonCount: 0,
          lostCount: 0,
          closedCount: 0,
          overdueCount: 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single chargeback details
   */
  async getChargebackById(id: string): Promise<IChargeback> {
    try {
      const response = await this.get<any>(`/${id}/`);
      return this.normalizeChargeback(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload evidence document
   */
  async uploadEvidence(
    chargebackId: string,
    evidenceData: IEvidenceUploadRequest
  ): Promise<IEvidence> {
    try {
      const formData = new FormData();
      formData.append('file', evidenceData.file);
      formData.append('type', evidenceData.type);
      formData.append('description', evidenceData.description);

      const fullUrl = this.buildFullUrl(`${this.endpoint}/${chargebackId}/upload-evidence/`);
      const headers = this.getRequestHeaders();
      delete headers['Content-Type'];

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

      const data = await response.json();
      return this.normalizeEvidence(data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Submit evidence to bank
   */
  async submitEvidence(
    chargebackId: string,
    submitData: IEvidenceSubmitRequest
  ): Promise<IChargeback> {
    try {
      const response = await this.post<any>(`/${chargebackId}/submit-evidence/`, submitData);
      return this.normalizeChargeback(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update chargeback status
   */
  async updateStatus(
    chargebackId: string,
    statusUpdate: IChargebackStatusUpdate
  ): Promise<IChargeback> {
    try {
      const response = await this.put<any>(`/${chargebackId}/status/`, statusUpdate);
      return this.normalizeChargeback(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Accept chargeback
   */
  async acceptChargeback(
    chargebackId: string,
    reason: string,
    notes?: string
  ): Promise<IChargeback> {
    try {
      const response = await this.post<any>(`/${chargebackId}/accept/`, { reason, notes });
      return this.normalizeChargeback(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contest chargeback
   */
  async contestChargeback(
    chargebackId: string,
    reason: string,
    notes?: string
  ): Promise<IChargeback> {
    try {
      const response = await this.post<any>(`/${chargebackId}/contest/`, { reason, notes });
      return this.normalizeChargeback(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Close chargeback
   */
  async closeChargeback(
    chargebackId: string,
    notes?: string
  ): Promise<IChargeback> {
    try {
      const response = await this.post<any>(`/${chargebackId}/close/`, { notes });
      return this.normalizeChargeback(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add note to chargeback
   */
  async addNote(
    chargebackId: string,
    content: string,
    isInternal: boolean = true
  ): Promise<IChargebackNote> {
    try {
      const response = await this.post<any>(`/${chargebackId}/notes/`, {
        content,
        is_internal: isInternal,
      });
      return this.normalizeNote(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get chargeback analytics
   */
  async getAnalytics(params: {
    dateFrom?: string;
    dateTo?: string;
    gateway?: string[];
    range?: '7d' | '30d' | '90d' | '1y';
  } = {}): Promise<IChargebackAnalytics> {
    try {
      const queryParams: Record<string, any> = {};
      if (params.dateFrom) queryParams.date_from = params.dateFrom;
      if (params.dateTo) queryParams.date_to = params.dateTo;
      if (params.gateway && params.gateway.length > 0) queryParams.gateway = params.gateway.join(',');
      if (params.range) queryParams.range = params.range;

      const queryString = this.buildQueryString(queryParams);
      const response = await this.get<any>(`/analytics/${queryString ? `?${queryString}` : ''}`);

      return this.normalizeAnalytics(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export chargebacks
   */
  async exportChargebacks(
    exportRequest: IChargebackExportRequest
  ): Promise<void> {
    try {
      const params: Record<string, string> = {
        format: exportRequest.format,
      };

      if (exportRequest.filters.search) params.search = exportRequest.filters.search;
      if (exportRequest.filters.status && exportRequest.filters.status.length > 0) {
        params.status = exportRequest.filters.status.join(',');
      }
      if (exportRequest.filters.dateFrom) params.date_from = exportRequest.filters.dateFrom;
      if (exportRequest.filters.dateTo) params.date_to = exportRequest.filters.dateTo;
      if (exportRequest.includeEvidence) params.include_evidence = 'true';

      await this.downloadFile(
        'chargebackExport',
        params,
        `chargebacks-${new Date().toISOString().split('T')[0]}.${exportRequest.format}`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk assign chargebacks
   */
  async bulkAssign(chargebackIds: string[], assignTo: string): Promise<void> {
    try {
      await this.post<any>('/bulk/assign/', {
        chargeback_ids: chargebackIds,
        assigned_to: assignTo,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get workflow board data (Kanban)
   */
  async getWorkflowBoard(filters?: Partial<ChargebackSearchParams>): Promise<any> {
    try {
      const params: Record<string, any> = {};
      if (filters?.assignedTo && filters.assignedTo.length > 0) {
        params.assigned_to = filters.assignedTo.join(',');
      }
      if (filters?.gateway && filters.gateway.length > 0) {
        params.gateway = filters.gateway.join(',');
      }

      const queryString = this.buildQueryString(params);
      const response = await this.get<any>(`/workflow/${queryString ? `?${queryString}` : ''}`);

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Move chargeback to different status (for Kanban)
   */
  async moveToStatus(
    chargebackId: string,
    newStatus: ChargebackStatus,
    notes?: string
  ): Promise<IChargeback> {
    try {
      const response = await this.patch<any>(`/${chargebackId}/move/`, {
        status: newStatus,
        notes,
      });
      return this.normalizeChargeback(response);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get auto-assignment rules
   */
  async getAutoAssignmentRules(): Promise<IAutoAssignmentRule[]> {
    try {
      const response = await this.get<any>('/auto-assignment-rules/');
      return response.results || response || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create auto-assignment rule
   */
  async createAutoAssignmentRule(rule: Omit<IAutoAssignmentRule, 'id'>): Promise<IAutoAssignmentRule> {
    try {
      const response = await this.post<any>('/auto-assignment-rules/', rule);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete evidence
   */
  async deleteEvidence(chargebackId: string, evidenceId: string): Promise<void> {
    try {
      await this.delete<any>(`/${chargebackId}/evidence/${evidenceId}/`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download all evidence as ZIP
   */
  async downloadAllEvidence(chargebackId: string): Promise<void> {
    try {
      await this.downloadFile(
        'chargebackEvidenceZip',
        { id: chargebackId },
        `chargeback-${chargebackId}-evidence.zip`
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate priority based on due date and amount
   */
  calculatePriority(dueDate: string, amount: number): 'critical' | 'high' | 'medium' | 'low' {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'critical';
    if (daysUntilDue <= 3 || amount >= 100000) return 'critical';
    if (daysUntilDue <= 7 || amount >= 50000) return 'high';
    if (daysUntilDue <= 14 || amount >= 10000) return 'medium';
    return 'low';
  }

  /**
   * Normalize chargeback data from API
   */
  private normalizeChargeback(data: any): IChargeback {
    const now = new Date();
    const dueDate = new Date(data.due_date || data.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;

    const priority = data.priority || this.calculatePriority(
      data.due_date || data.dueDate,
      data.amount
    );

    return {
      id: data.id,
      chargebackId: data.chargeback_id || data.chargebackId || data.id,
      transactionId: data.transaction_id || data.transactionId,
      transaction: data.transaction,
      customer: data.customer,
      amount: Number(data.amount || 0),
      currency: data.currency || 'INR',
      status: data.status,
      priority,
      reasonCode: data.reason_code || data.reasonCode || '',
      reasonDescription: data.reason_description || data.reasonDescription || '',
      customerDisputeReason: data.customer_dispute_reason || data.customerDisputeReason,
      dueDate: data.due_date || data.dueDate,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
      evidence: (data.evidence || []).map((e: any) => this.normalizeEvidence(e)),
      bankResponse: data.bank_response || data.bankResponse,
      resolution: data.resolution ? {
        outcome: data.resolution.outcome,
        amount: Number(data.resolution.amount || 0),
        recoveredAmount: data.resolution.recovered_amount || data.resolution.recoveredAmount,
        resolvedAt: data.resolution.resolved_at || data.resolution.resolvedAt,
        notes: data.resolution.notes || '',
        resolvedBy: data.resolution.resolved_by || data.resolution.resolvedBy,
      } : undefined,
      notes: (data.notes || []).map((n: any) => this.normalizeNote(n)),
      timeline: (data.timeline || []).map((t: any) => ({
        id: t.id,
        status: t.status,
        timestamp: t.timestamp || t.created_at,
        notes: t.notes,
        user: t.user || t.created_by,
        action: t.action || '',
      })),
      assignedTo: data.assigned_to || data.assignedTo,
      arn: data.arn,
      gateway: data.gateway,
      merchantName: data.merchant_name || data.merchantName,
      isOverdue,
      daysUntilDue,
    };
  }

  /**
   * Normalize evidence data
   */
  private normalizeEvidence(data: any): IEvidence {
    return {
      id: data.id,
      type: data.type,
      fileName: data.file_name || data.fileName,
      fileUrl: data.file_url || data.fileUrl,
      fileSize: data.file_size || data.fileSize || 0,
      description: data.description || '',
      uploadedAt: data.uploaded_at || data.uploadedAt,
      uploadedBy: data.uploaded_by || data.uploadedBy,
      status: data.status || 'pending',
    };
  }

  /**
   * Normalize note data
   */
  private normalizeNote(data: any): IChargebackNote {
    return {
      id: data.id,
      content: data.content,
      createdAt: data.created_at || data.createdAt,
      createdBy: data.created_by || data.createdBy || 'Unknown',
      isInternal: data.is_internal !== undefined ? data.is_internal : data.isInternal !== undefined ? data.isInternal : true,
    };
  }

  /**
   * Normalize analytics data
   */
  private normalizeAnalytics(data: any): IChargebackAnalytics {
    const won = Number(data.win_loss_ratio?.won || data.winLossRatio?.won || 0);
    const lost = Number(data.win_loss_ratio?.lost || data.winLossRatio?.lost || 0);
    const total = won + lost;

    return {
      winLossRatio: {
        won,
        lost,
        percentage: total > 0 ? Number(((won / total) * 100).toFixed(2)) : 0,
      },
      totalChargebackAmount: Number(data.total_chargeback_amount || data.totalChargebackAmount || 0),
      totalRecoveredAmount: Number(data.total_recovered_amount || data.totalRecoveredAmount || 0),
      chargebackRate: Number(data.chargeback_rate || data.chargebackRate || 0),
      averageResponseTime: Number(data.average_response_time || data.averageResponseTime || 0),
      topReasonCodes: (data.top_reason_codes || data.topReasonCodes || []).map((rc: any) => ({
        code: rc.code,
        description: rc.description,
        count: Number(rc.count || 0),
        percentage: Number(rc.percentage || 0),
      })),
      monthlyTrend: (data.monthly_trend || data.monthlyTrend || []).map((mt: any) => ({
        month: mt.month,
        totalChargebacks: Number(mt.total_chargebacks || mt.totalChargebacks || 0),
        wonChargebacks: Number(mt.won_chargebacks || mt.wonChargebacks || 0),
        lostChargebacks: Number(mt.lost_chargebacks || mt.lostChargebacks || 0),
        amount: Number(mt.amount || 0),
      })),
      gatewayStats: (data.gateway_stats || data.gatewayStats || []).map((gs: any) => ({
        gateway: gs.gateway,
        chargebacks: Number(gs.chargebacks || 0),
        won: Number(gs.won || 0),
        lost: Number(gs.lost || 0),
        amount: Number(gs.amount || 0),
      })),
      statusDistribution: data.status_distribution || data.statusDistribution || {},
    };
  }
}

export const chargebackService = new ChargebackApiService();
