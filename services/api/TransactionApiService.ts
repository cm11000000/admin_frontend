/**
 * Transaction API Service for sabpaisa_admin_v5
 * Matches Angular transaction-report.component.ts API structure exactly
 * Uses ReportBaseApiService to call https://reportapi.sabpaisa.in/
 */
import { ReportBaseApiService } from './base/ReportBaseApiService';

export interface Transaction {
  id: string;
  merchantTransactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded' | 'disputed';
  paymentMethod: string;
  gatewayTransactionId?: string;
  clientId: string;
  clientName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  settlementDate?: string;
  fees: {
    gateway: number;
    platform: number;
    gst: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

// Angular transaction filter structure - matches TransactionFilter.ts
export interface AngularTransactionFilter {
  clientCode: string;
  paymentStatus: string;
  paymentMode: string;
  fromDate: string;
  endDate: string;
  length: number;
  page: number;
  search?: string;
  terminalStatus?: string;
  loginBy: string;
}

// Angular analysis filter - matches consolidated.component.ts
export interface AngularAnalysisFilter {
  fromDate: string;
  endDate: string;
  loginBy: string;
}

// Angular enquiry filter - matches viewtransactions.component.ts
export interface AngularEnquiryRequest {
  txnId?: string;
  clientTxnId?: string;
}

export interface TransactionSearchFilter {
  id?: string;
  merchantTransactionId?: string;
  status?: Transaction['status'][];
  paymentMethod?: string[];
  clientId?: string[];
  amountFrom?: number;
  amountTo?: number;
  dateFrom?: string;
  dateTo?: string;
  customerEmail?: string;
  customerPhone?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionSearchResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  summary: {
    totalAmount: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  };
}

export interface RefundRequest {
  amount: number;
  reason: string;
  notes?: string;
}

export interface RefundResponse {
  id: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  gatewayRefundId?: string;
  reason: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
}

export interface BulkOperation {
  operation: 'refund' | 'cancel' | 'retry' | 'export';
  transactionIds: string[];
  parameters?: Record<string, any>;
}

export interface BulkOperationResponse {
  operationId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  errors: {
    transactionId: string;
    error: string;
  }[];
  createdAt: string;
  completedAt?: string;
}

export interface ITimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending' | 'warning';
  duration?: number;
  details: any;
  gatewayLogs?: string;
  errorMessage?: string;
  ipAddress?: string;
  deviceInfo?: string;
  geolocation?: string;
}

export interface ITransactionTimeline {
  transactionId: string;
  events: ITimelineEvent[];
}

export interface ITransactionUpdate {
  transactionId: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  updatedBy: string;
  updatedAt: string;
  requiresApproval: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface ISplitRecipient {
  merchantId: string;
  merchantName: string;
  splitPercentage?: number;
  splitAmount?: number;
  settlementStatus: string;
  settledAt?: string;
}

export interface ISplitPayment {
  id: string;
  parentTransactionId: string;
  recipients: ISplitRecipient[];
  totalAmount: number;
  splitRule: 'percentage' | 'fixed';
  createdAt: string;
}

export interface IRetryAttempt {
  id: string;
  transactionId: string;
  attemptNumber: number;
  attemptedAt: string;
  status: 'success' | 'failed';
  failureReason?: string;
  gatewayResponse: any;
}

export interface IWebhookLog {
  id: string;
  transactionId: string;
  url: string;
  method: string;
  requestPayload: any;
  responsePayload: any;
  statusCode: number;
  responseTime: number;
  attemptNumber: number;
  status: 'success' | 'failed';
  sentAt: string;
}

export interface IFilterPreset {
  id: string;
  name: string;
  filters: TransactionSearchFilter;
  isShared: boolean;
  createdBy: string;
  createdAt: string;
}

export interface TransactionDetails extends Transaction {
  timeline: {
    status: string;
    timestamp: string;
    notes?: string;
    user?: string;
  }[];
  refunds: RefundResponse[];
  disputes: {
    id: string;
    amount: number;
    reason: string;
    status: 'pending' | 'resolved' | 'lost';
    createdAt: string;
    resolvedAt?: string;
  }[];
  webhookLogs: {
    id: string;
    url: string;
    status: number;
    response: string;
    attempt: number;
    sentAt: string;
  }[];
}

export class TransactionApiService extends ReportBaseApiService {
  public readonly serviceName = 'TransactionService';
  protected readonly endpoint = ''; // Empty because all paths include full path from base URL

  // Lightweight in-memory caches for heavy master endpoints
  private static _clientCodeCache: { key: string; data: any[]; expiry: number } | null = null;
  private static _paymentModeCache: { data: any[]; expiry: number } | null = null;
  private static _paymentStatusCache: { data: any[]; expiry: number } | null = null;

  private now() { return Date.now(); }
  private isValid(cache: { expiry: number } | null) { return !!cache && cache.expiry > this.now(); }

  async searchTransactions(filter: TransactionSearchFilter = {}): Promise<TransactionSearchResponse> {
    return this.requestWithConfig<TransactionSearchResponse>(
      'transactionSearch',
      'POST',
      filter
    );
  }

  async getTransaction(id: string): Promise<TransactionDetails> {
    try {
      return await this.requestWithConfig<TransactionDetails>(
        'transactionDetails',
        'GET',
        undefined,
        { id }
      );
    } catch (primaryErr) {
      try {
        // Fallback to Report API ViewTxnPublic path if available
        const raw: any = await this.get<any>(`/ViewTxnPublic/${encodeURIComponent(id)}/0`);
        const amount = raw?.paid_amount ?? raw?.amount ?? 0;
        const mapped: any = {
          ...raw,
          id: raw?.id || id,
          amount,
          paid_amount: raw?.paid_amount ?? amount,
          client_name: raw?.client_name || raw?.client || '',
          payment_mode: raw?.payment_mode || raw?.pg_pay_mode || '',
          status: raw?.status || '',
        };
        return mapped as TransactionDetails;
      } catch (fallbackErr) {
        throw primaryErr;
      }
    }
  }

  async getAll(filter: any = {}): Promise<any> {
    try {
      const params: Record<string, any> = {
        page: filter.page || 1,
        page_size: filter.page_size || 20
      };

      // Add filters if provided
      if (filter.search) params.search = filter.search;
      if (filter.status) params.status = filter.status;
      if (filter.payment_mode) params.payment_mode = filter.payment_mode;
      if (filter.client_code) params.client_code = filter.client_code;
      if (filter.date_from) params.date_from = filter.date_from;
      if (filter.date_to) params.date_to = filter.date_to;
      if (filter.min_amount !== undefined) params.min_amount = filter.min_amount;
      if (filter.max_amount !== undefined) params.max_amount = filter.max_amount;
      if (filter.is_settled !== undefined) params.is_settled = filter.is_settled;

      const queryString = this.buildQueryString(params);
      const response = await this.get<any>(`?${queryString}`);

      // Normalize and ensure amount/client fields are always present
      const normalizedResults = (response.results || []).map((t: any) => {
        const amount = (t.amount !== undefined && t.amount !== null) ? Number(t.amount) : Number(t.paid_amount ?? 0);
        return {
          ...t,
          amount,
          paid_amount: (t.paid_amount !== undefined && t.paid_amount !== null) ? Number(t.paid_amount) : amount,
          client_name: t.client_name ?? t.client ?? '',
        };
      });

      return {
        results: normalizedResults,
        count: response.count || 0,
        next: response.next || false,
        previous: response.previous || false
      };
    } catch (error) {
      console.error('TransactionApiService.getAll error:', error);
      throw error;
    }
  }

  async getTransactionsPaginated(
    page: number = 1,
    pageSize: number = 50,
    filter: Omit<TransactionSearchFilter, 'page' | 'pageSize'> = {}
  ): Promise<TransactionSearchResponse> {
    try {
      // Build query parameters
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
        ...filter
      };

      const queryString = this.buildQueryString(params);
      const response = await this.get<any>(`?${queryString}`);

      // Handle the response structure from Django backend
      const transactions = response.results || [];
      const total = response.count || 0;

      // Calculate summary from the transactions
      const summary = transactions.reduce(
        (acc: any, t: Transaction) => {
          acc.totalAmount += (t.amount ?? 0);
          const s = (t.status || '').toUpperCase();
          if (s === 'SUCCESS') acc.successCount += 1;
          else if (s === 'FAILED') acc.failedCount += 1;
          else acc.pendingCount += 1;
          return acc;
        },
        { totalAmount: 0, successCount: 0, failedCount: 0, pendingCount: 0 }
      );

      return {
        transactions,
        total,
        page,
        pageSize,
        hasNext: response.next || false,
        hasPrev: response.previous || false,
        summary,
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async refundTransaction(
    transactionId: string,
    refundRequest: RefundRequest
  ): Promise<RefundResponse> {
    return this.requestWithConfig<RefundResponse>(
      'transactionRefund',
      'POST',
      refundRequest,
      { id: transactionId }
    );
  }

  async getRefundStatus(refundId: string): Promise<RefundResponse> {
    return this.get<RefundResponse>(`/refunds/${refundId}`);
  }

  async retryTransaction(transactionId: string): Promise<Transaction> {
    return this.post<Transaction>(`/${transactionId}/retry`);
  }

  async cancelTransaction(
    transactionId: string,
    reason: string
  ): Promise<Transaction> {
    return this.post<Transaction>(`/${transactionId}/cancel`, { reason });
  }

  async getTransactionTimeline(transactionId: string): Promise<TransactionDetails['timeline']> {
    return this.get<TransactionDetails['timeline']>(`/${transactionId}/timeline`);
  }

  async addTransactionNote(
    transactionId: string,
    note: string
  ): Promise<void> {
    return this.post<void>(`/${transactionId}/notes`, { note });
  }

  async bulkOperation(operation: BulkOperation): Promise<BulkOperationResponse> {
    return this.requestWithConfig<BulkOperationResponse>(
      'bulkTransactionOperations',
      'POST',
      operation
    );
  }

  async getBulkOperationStatus(operationId: string): Promise<BulkOperationResponse> {
    return this.get<BulkOperationResponse>(`/bulk/${operationId}`);
  }

  async exportTransactions(
    filter: TransactionSearchFilter & { format: 'csv' | 'xlsx' | 'pdf' },
    filename?: string
  ): Promise<void> {
    const exportData = {
      ...filter,
      operation: 'export'
    } as any;

    // Convert params to string map for download
    const params: Record<string, string> = {};
    Object.entries(exportData).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        params[k] = v.join(',');
      } else if (typeof v === 'object') {
        params[k] = JSON.stringify(v);
      } else {
        params[k] = String(v);
      }
    });

    await this.downloadFile(
      'transactionExport',
      params,
      filename || `transactions-${new Date().toISOString().split('T')[0]}.${filter.format}`
    );
  }

  async getTransactionStats(filter: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    paymentMethod?: string;
    range?: '24h' | '7d' | '30d' | '90d';
  } = {}): Promise<{
    totalTransactions: number;
    totalVolume: number;
    successRate: number;
    averageAmount: number;
    statusBreakdown: Record<Transaction['status'], number>;
    paymentMethodBreakdown: Record<string, number>;
    hourlyStats: {
      hour: number;
      transactions: number;
      volume: number;
    }[];
  }> {
    const params: Record<string, any> = {};
    if (filter.range) params.range = filter.range;
    const queryString = this.buildQueryString(params);
    const path = `/stats/${queryString ? `?${queryString}` : ''}`;
    const raw = await this.get<any>(path);

    const totalTransactions = raw.totalTransactions ?? raw.total_transactions ?? 0;
    const totalVolume = raw.totalVolume ?? raw.total_amount ?? 0;
    const successRate = raw.successRate ?? raw.success_rate ?? 0;
    const averageAmount = raw.averageAmount ?? raw.average_amount ?? 0;
    const success = raw.success_count ?? raw.successful ?? 0;
    const failed = raw.failed_count ?? raw.failed ?? 0;
    const pending = raw.pending_count ?? raw.pending ?? 0;
    const statusBreakdown: any = {
      success: success,
      failed: failed,
      pending: pending,
    };
    return {
      totalTransactions,
      totalVolume,
      successRate,
      averageAmount,
      statusBreakdown,
      paymentMethodBreakdown: {},
      hourlyStats: [],
    };
  }

  async getStats(range: '24h' | '7d' | '30d' | '90d' = '24h') {
    const raw: any = await this.getTransactionStats({ range });
    return {
      total_transactions: raw.totalTransactions ?? raw.total_transactions ?? 0,
      total_amount: raw.totalVolume ?? raw.total_amount ?? 0,
      average_amount: raw.averageAmount ?? raw.average_amount ?? 0,
      success_count: (raw.statusBreakdown?.success ?? raw.statusBreakdown?.SUCCESS) ?? raw.success_count ?? 0,
      failed_count: (raw.statusBreakdown?.failed ?? raw.statusBreakdown?.FAILED) ?? raw.failed_count ?? 0,
      pending_count: (raw.statusBreakdown?.pending ?? raw.statusBreakdown?.PENDING) ?? raw.pending_count ?? 0,
      success_rate: raw.successRate ?? raw.success_rate ?? 0,
      date_range: raw.date_range ?? range,
    };
  }

  async getFailedTransactions(
    page: number = 1,
    pageSize: number = 50,
    filter: {
      dateFrom?: string;
      dateTo?: string;
      errorCode?: string;
      paymentMethod?: string[];
    } = {}
  ): Promise<{
    transactions: Transaction[];
    total: number;
    errorAnalysis: {
      errorCode: string;
      count: number;
      percentage: number;
    }[];
  }> {
    const searchFilter: TransactionSearchFilter = {
      ...filter,
      status: ['failed'],
      page,
      pageSize
    };

    const res = await this.searchTransactions(searchFilter);
    const analysisMap = new Map<string, number>();
    res.transactions.forEach((t) => {
      const code = (t as any).errorCode || (t as any).pg_error_code || 'UNKNOWN';
      analysisMap.set(code, (analysisMap.get(code) || 0) + 1);
    });
    const total = res.total || res.transactions.length;
    const errorAnalysis = Array.from(analysisMap.entries()).map(([errorCode, count]) => ({
      errorCode,
      count,
      percentage: total ? +(count * 100 / total).toFixed(2) : 0,
    }));

    return {
      transactions: res.transactions,
      total: res.total,
      errorAnalysis,
    };
  }

  async getDetailedTimeline(transactionId: string): Promise<ITransactionTimeline> {
    return this.get<ITransactionTimeline>(`/${transactionId}/timeline/`);
  }

  async updateTransaction(transactionId: string, update: Partial<ITransactionUpdate>): Promise<Transaction> {
    return this.put<Transaction>(`/${transactionId}/update/`, update);
  }

  async requestUpdateApproval(transactionId: string, update: Partial<ITransactionUpdate>): Promise<{ requestId: string }> {
    return this.post<{ requestId: string }>(`/${transactionId}/update-request/`, update);
  }

  async getSplitPayments(filter: {
    page?: number;
    pageSize?: number;
    parentTransactionId?: string;
    merchantId?: string;
    settlementStatus?: string;
  } = {}): Promise<{
    splitPayments: ISplitPayment[];
    total: number;
    hasNext: boolean;
  }> {
    const params = this.buildQueryString(filter);
    return this.get<any>(`/split-payments/?${params}`);
  }

  async createSplitConfig(config: {
    parentTransactionId?: string;
    recipients: Omit<ISplitRecipient, 'settlementStatus' | 'settledAt'>[];
    splitRule: 'percentage' | 'fixed';
  }): Promise<ISplitPayment> {
    return this.post<ISplitPayment>('/split-payment/config/', config);
  }

  async retryFailedTransaction(transactionId: string): Promise<{ success: boolean; newTransactionId?: string }> {
    return this.post<{ success: boolean; newTransactionId?: string }>(`/${transactionId}/retry/`);
  }

  async getRetryHistory(transactionId: string): Promise<IRetryAttempt[]> {
    return this.get<IRetryAttempt[]>(`/${transactionId}/retries/`);
  }

  async configureAutoRetry(config: {
    maxAttempts: number;
    retryInterval: number;
    enableAutoRetry: boolean;
  }): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/retry-config/', config);
  }

  async getWebhookLogs(transactionId: string): Promise<IWebhookLog[]> {
    return this.get<IWebhookLog[]>(`/${transactionId}/webhooks/`);
  }

  async retryWebhook(webhookId: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>(`/webhooks/${webhookId}/retry/`);
  }

  async testWebhook(config: {
    url: string;
    transactionId: string;
    eventType: string;
  }): Promise<{
    success: boolean;
    statusCode: number;
    responseTime: number;
    response: any;
  }> {
    return this.post<any>('/webhooks/test/', config);
  }

  async getFilterOptions(): Promise<{
    statuses: string[];
    gateways: string[];
    paymentModes: string[];
    banks: string[];
    merchants: string[];
    cardTypes: string[];
    cardNetworks: string[];
  }> {
    return this.get<any>('/filters/options/');
  }

  async saveFilterPreset(preset: Omit<IFilterPreset, 'id' | 'createdAt'>): Promise<IFilterPreset> {
    return this.post<IFilterPreset>('/filters/presets/', preset);
  }

  async getFilterPresets(): Promise<IFilterPreset[]> {
    return this.get<IFilterPreset[]>('/filters/presets/');
  }

  async deleteFilterPreset(presetId: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/filters/presets/${presetId}/`);
  }

  async bulkStatusUpdate(update: {
    transactionIds: string[];
    status: string;
    reason: string;
    notifyCustomers?: boolean;
  }): Promise<{ success: boolean; updated: number }> {
    return this.post<{ success: boolean; updated: number }>('/bulk/status-update/', update);
  }

  async getRetryAnalytics(filter: {
    dateFrom?: string;
    dateTo?: string;
    gateway?: string;
  } = {}): Promise<{
    totalRetries: number;
    successRate: number;
    averageRetryTime: number;
    bestRetryTiming: string;
    gatewayWiseSuccess: { gateway: string; successRate: number }[];
  }> {
    const params = this.buildQueryString(filter);
    return this.get<any>(`/retries/analytics/?${params}`);
  }

  // ============================================================================
  // ANGULAR API COMPATIBILITY METHODS
  // These methods match the exact Angular API calls from transaction-report.component.ts
  // ============================================================================

  /**
   * Get Admin Transaction History - Matches Angular getAdminTxnFilterPostMethodSlave
   * API: POST v6/transactions/GetAdminTxnHistory/
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: transaction-report.component.ts lines 343, 421, 632
   */
  async getAdminTxnHistory(filter: AngularTransactionFilter): Promise<{
    results: any[];
    count: number;
  }> {
    try {
      // Switch to v6 optimized endpoint under the same report base
      const response = await this.post<any>('v6/transactions/GetAdminTxnHistory/', filter);
      return {
        results: response.results || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('getAdminTxnHistory error:', error);
      throw error;
    }
  }

  /**
   * Get Client Code List - Matches Angular getClientCodeListUSP_Slave
   * API: GET masters/clientDataMaster/?login_by={userName}
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: transaction-report.component.ts line 191
   */
  async getClientCodeList(loginBy: string): Promise<any[]> {
    try {
      const params = this.buildQueryString({ login_by: loginBy });
      // Match Angular API exactly - reportapi.sabpaisa.in/masters/clientDataMaster/
      const response = await this.get<any[]>(`masters/clientDataMaster/?${params}`);
      return response || [];
    } catch (error) {
      console.error('getClientCodeList error:', error);
      return [];
    }
  }

  // Cached variant with TTL to mitigate heavy results
  async getClientCodeListCached(loginBy: string, ttlMs: number = 5 * 60 * 1000): Promise<any[]> {
    const key = String(loginBy || 'ALL');
    if (TransactionApiService._clientCodeCache &&
        TransactionApiService._clientCodeCache.key === key &&
        this.isValid(TransactionApiService._clientCodeCache)) {
      return TransactionApiService._clientCodeCache.data;
    }
    const data = await this.getClientCodeList(loginBy);
    TransactionApiService._clientCodeCache = { key, data, expiry: this.now() + ttlMs };
    return data;
  }

  /**
   * Get Payment Mode List - Matches Angular getPaymentModeList
   * API: GET masters/paymentModeMaster/
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: transaction-report.component.ts line 256
   */
  async getPaymentModeList(): Promise<string[]> {
    try {
      // Match Angular API exactly - reportapi.sabpaisa.in/masters/paymentModeMaster/
      const response = await this.get<string[]>('masters/paymentModeMaster/');
      return response || [];
    } catch (error) {
      console.error('getPaymentModeList error:', error);
      return [];
    }
  }

  async getPaymentModeListCached(ttlMs: number = 10 * 60 * 1000): Promise<any[]> {
    if (this.isValid(TransactionApiService._paymentModeCache)) {
      return TransactionApiService._paymentModeCache!.data as any[];
    }
    const data = await this.getPaymentModeList();
    TransactionApiService._paymentModeCache = { data, expiry: this.now() + ttlMs };
    return data as any[];
  }

  /**
   * Get Payment Status List - Matches Angular getPaymentStatusList
   * API: GET masters/paymentStatusMaster/
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: transaction-report.component.ts line 276
   */
  async getPaymentStatusList(): Promise<string[]> {
    try {
      // Match Angular API exactly - reportapi.sabpaisa.in/masters/paymentStatusMaster/
      const response = await this.get<string[]>('masters/paymentStatusMaster/');
      return response || [];
    } catch (error) {
      console.error('getPaymentStatusList error:', error);
      return [];
    }
  }

  async getPaymentStatusListCached(ttlMs: number = 10 * 60 * 1000): Promise<any[]> {
    if (this.isValid(TransactionApiService._paymentStatusCache)) {
      return TransactionApiService._paymentStatusCache!.data as any[];
    }
    const data = await this.getPaymentStatusList();
    TransactionApiService._paymentStatusCache = { data, expiry: this.now() + ttlMs };
    return data as any[];
  }

  /**
   * Get Analysis Report - Matches Angular getAdminAnalysisReport
   * API: POST REST/GetAnalysisReport
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: consolidated.component.ts line 218
   */
  async getAnalysisReport(filter: AngularAnalysisFilter): Promise<any[]> {
    try {
      // Match Angular API exactly - reportapi.sabpaisa.in/REST/GetAnalysisReport
      const response = await this.post<any[]>('REST/GetAnalysisReport', filter);
      return response || [];
    } catch (error) {
      console.error('getAnalysisReport error:', error);
      return [];
    }
  }

  /**
   * Get Success Transaction Summary - v6 (AdminSuccessTxnSummary)
   * API: POST v6/transactions/AdminSuccessTxnSummary/
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: consolidated.component.ts line 151
   */
  async getSuccessTxnSummary(filter: {
    fromdate: string;
    todate: string;
    clientcode: string;
    loginBy: string;
  }): Promise<any[]> {
    try {
      // Use v6 optimized endpoint under the same report base
      const response = await this.post<any[]>('v6/transactions/AdminSuccessTxnSummary/', filter);
      return response || [];
    } catch (error) {
      console.error('getSuccessTxnSummary error:', error);
      return [];
    }
  }

  /**
   * View Transaction by ID - Matches Angular getTransactionSP
   * API: GET transactions/ViewTxnPublic/{txnId}/0
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: viewtransactions.component.ts line 93
   */
  async viewTransaction(query: string): Promise<any> {
    try {
      // Query format: "{txnId}/0" or "0/{clientTxnId}"
      // Match Angular API exactly - reportapi.sabpaisa.in/transactions/ViewTxnPublic/
      // Django endpoint expects trailing slash: ViewTxnPublic/<txnid>/<clienttxnid>/
      const response = await this.get<any>(`transactions/ViewTxnPublic/${query}/`);
      return response;
    } catch (error) {
      console.error('viewTransaction error:', error);
      throw error;
    }
  }

  /**
   * Get Export Data Users - Matches Angular getExportDataUser
   * API: GET common-data/27/0
   * BASE URL: https://reportapi.sabpaisa.in/
   * Used in: transaction-report.component.ts line 166
   */
  async getExportDataUsers(): Promise<any[]> {
    try {
      // Match Angular API exactly - reportapi.sabpaisa.in/common-data/27/0
      const response = await this.get<any[]>('common-data/27/0');
      return response || [];
    } catch (error) {
      console.error('getExportDataUsers error:', error);
      return [];
    }
  }
}

export const transactionService = new TransactionApiService();
