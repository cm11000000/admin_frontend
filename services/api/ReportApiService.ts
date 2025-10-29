/**
 * Report API Service for SabPaisa Admin V5
 * Comprehensive API integration for all report endpoints
 */

import ApiService from './ApiService';
import type {
  TransactionReportFilter,
  TransactionReportResponse,
  SettlementReportFilter,
  SettlementReportResponse,
  SettlementDetailResponse,
  ChargebackReportFilter,
  ChargebackReportResponse,
  RefundReportFilter,
  RefundReportResponse,
  AnalyticsFilter,
  AnalyticsReportResponse,
  ExportRequest,
  ExportResponse,
  DateRange,
  ICustomReport,
  IReportTemplate,
  IScheduledReport,
  IReportExecution,
  IInsight,
  IReconciliationReport,
  IFinancialReport,
  IAdvancedAnalytics,
  IBankTransaction,
} from '@/types/reports';

class ReportApiService {
  /**
   * Fetch transaction report with filters
   */
  static async fetchTransactionReport(
    filters: TransactionReportFilter
  ): Promise<TransactionReportResponse> {
    const params = new URLSearchParams();

    params.append('from_date', filters.dateRange.from);
    params.append('to_date', filters.dateRange.to);

    if (filters.clientCode) params.append('client_code', filters.clientCode);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.paymentMethod) params.append('payment_method', filters.paymentMethod);
    if (filters.gateway) params.append('gateway', filters.gateway);
    if (filters.minAmount) params.append('min_amount', filters.minAmount.toString());
    if (filters.maxAmount) params.append('max_amount', filters.maxAmount.toString());
    if (filters.groupBy) params.append('group_by', filters.groupBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return ApiService.get(`/reports/transactions?${params.toString()}`);
  }

  /**
   * Fetch settlement report with filters
   */
  static async fetchSettlementReport(
    filters: SettlementReportFilter
  ): Promise<SettlementReportResponse> {
    const params = new URLSearchParams();

    params.append('from_date', filters.dateRange.from);
    params.append('to_date', filters.dateRange.to);

    if (filters.clientCode) params.append('client_code', filters.clientCode);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.settlementId) params.append('settlement_id', filters.settlementId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return ApiService.get(`/reports/settlements?${params.toString()}`);
  }

  /**
   * Fetch settlement details by ID
   */
  static async fetchSettlementDetail(
    settlementId: string
  ): Promise<SettlementDetailResponse> {
    return ApiService.get(`/reports/settlements/${settlementId}`);
  }

  /**
   * Fetch chargeback report with filters
   */
  static async fetchChargebackReport(
    filters: ChargebackReportFilter
  ): Promise<ChargebackReportResponse> {
    const params = new URLSearchParams();

    params.append('from_date', filters.dateRange.from);
    params.append('to_date', filters.dateRange.to);

    if (filters.clientCode) params.append('client_code', filters.clientCode);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.reason) params.append('reason', filters.reason);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return ApiService.get(`/reports/chargebacks?${params.toString()}`);
  }

  /**
   * Fetch refund report with filters
   */
  static async fetchRefundReport(
    filters: RefundReportFilter
  ): Promise<RefundReportResponse> {
    const params = new URLSearchParams();

    params.append('from_date', filters.dateRange.from);
    params.append('to_date', filters.dateRange.to);

    if (filters.clientCode) params.append('client_code', filters.clientCode);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.refundType && filters.refundType !== 'all') params.append('refund_type', filters.refundType);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return ApiService.get(`/reports/refunds?${params.toString()}`);
  }

  // ============= VIEW REFUND REPORT (Angular parity) =============

  /**
   * Fetch refund transaction history (Angular viewAllRefundHistory)
   * API: POST /api/merchantRefund/viewAllRefundHistory/
   * Body: { client_code, from_date, to_date, login_by }
   */
  static async viewAllRefundHistory(body: {
    client_code: string;
    from_date: string;
    to_date: string;
    login_by: string;
  }): Promise<any> {
    const base = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    return ApiService.post(`${base}/api/merchantRefund/viewAllRefundHistory/`, body);
  }

  /**
   * Fetch refund transaction history via txnHistory service (v6)
   * Matches Angular getRefundReport(filter) payload
   * API: POST {txnHistoryDbsUrl}/v6/transactions/GetRefundTxnHistory/
   * Body: { clientCode, fromDate, endDate, noOfClient, rpttype, page, length, search }
   */
  static async getRefundTxnHistory(body: {
    clientCode: string;
    fromDate: string;
    endDate: string;
    noOfClient: number;
    rpttype: number;
    page?: number;
    length?: number;
    search?: string;
  }): Promise<any> {
    const base = process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL || 'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(`${base.replace(/\/$/, '')}/v6/transactions/GetRefundTxnHistory/`, body);
  }

  /**
   * Fetch chargeback transaction history (v6)
   * API: POST {txnHistoryDbsUrl}/v6/transactions/GetChargebackTxnHistory/
   * Body: { clientCode, fromDate, endDate, noOfClient, rpttype, page, length, search }
   */
  static async getChargebackTxnHistory(body: {
    clientCode: string;
    fromDate: string;
    endDate: string;
    noOfClient: number;
    rpttype: number;
    page?: number;
    length?: number;
    search?: string;
  }): Promise<any> {
    const base = process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL || 'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(`${base.replace(/\/$/, '')}/v6/transactions/GetChargebackTxnHistory/`, body);
  }

  /**
   * Fetch refund client codes (Angular searchClientCodeByStatus)
   * API: POST /api/merchantRefund/searchClientCodeByStatus/
   */
  static async getRefundClientCodes(status: 'A' | 'I' | 'ALL', login_by: string): Promise<any[]> {
    const base = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    return ApiService.post(`${base}/api/merchantRefund/searchClientCodeByStatus/`, {
      status,
      login_by,
    });
  }

  /**
   * Payment Mode Master for refunds (Angular GetPaymentModeMaster)
   * API: POST /transactions/GetPaymentModeMaster/
   */
  static async getPaymentModeMaster(): Promise<any[]> {
    // Always resolve via configured txn history/report base; avoid hardcoded production hosts
    const base =
      process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL ||
      process.env.NEXT_PUBLIC_REPORT_API_URL ||
      'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(`${String(base).replace(/\/$/, '')}/transactions/GetPaymentModeMaster/`, {});
  }

  // ==================== V6 Export Triggers (CSV via backend) ====================
  /**
   * Trigger Admin Transactions CSV export (v6 async job)
   * Endpoint: POST {reportBase}/v6/transactions/GetAdminTxnHistoryExcel/
   */
  static async requestAdminTxnHistoryExcelV6(filter: {
    clientCode: string;
    paymentStatus: string;
    paymentMode: string;
    fromDate: string;
    endDate: string;
    length: number;
    page: number;
    terminalStatus: string;
    loginBy: string;
    search?: string;
  }): Promise<{ detail: string }> {
    const base =
      process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL ||
      process.env.NEXT_PUBLIC_REPORT_API_URL ||
      'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(
      `${String(base).replace(/\/$/, '')}/v6/transactions/GetAdminTxnHistoryExcel/`,
      filter
    );
  }

  /**
   * Trigger Refunds CSV export (v6 async job)
   * Endpoint: POST {reportBase}/v6/transactions/GetRefundTxnExcelHistory/
   */
  static async requestRefundTxnExcelV6(body: {
    clientCode: string;
    fromDate: string;
    endDate: string;
    loginBy: string;
    search?: string;
  }): Promise<{ detail: string }> {
    const base =
      process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL ||
      process.env.NEXT_PUBLIC_REPORT_API_URL ||
      'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(
      `${String(base).replace(/\/$/, '')}/v6/transactions/GetRefundTxnExcelHistory/`,
      body
    );
  }

  /**
   * Trigger Chargebacks CSV export (v6 async job)
   * Endpoint: POST {reportBase}/v6/transactions/GetChargebackTxnExcelHistory/
   */
  static async requestChargebackTxnExcelV6(body: {
    clientCode: string;
    fromDate: string;
    endDate: string;
    loginBy: string;
    search?: string;
  }): Promise<{ detail: string }> {
    const base =
      process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL ||
      process.env.NEXT_PUBLIC_REPORT_API_URL ||
      'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(
      `${String(base).replace(/\/$/, '')}/v6/transactions/GetChargebackTxnExcelHistory/`,
      body
    );
  }

  /**
   * Trigger Settlements CSV export (v6 async job; V2 columns)
   * Endpoint: POST {reportBase}/v6/transactions/GetSettledTxnExcelV2History/
   */
  static async requestSettledTxnExcelV6(body: {
    clientCode: string;
    fromDate: string;
    endDate: string;
    loginBy: string;
    search?: string;
  }): Promise<{ detail: string }> {
    const base =
      process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL ||
      process.env.NEXT_PUBLIC_REPORT_API_URL ||
      'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(
      `${String(base).replace(/\/$/, '')}/v6/transactions/GetSettledTxnExcelV2History/`,
      body
    );
  }

  /**
   * List export jobs for a user and date window via Admin API
   * Endpoint: GET {adminBase}/api/REST/TxnReportS3Details/?created_by=...&from_date=...&to_date=...&status=Completed
   */
  static async listTxnReportS3Details(params: {
    created_by: string;
    from_date?: string;
    to_date?: string;
    status?: 'Processing' | 'Completed' | 'Failure' | string;
    limit?: number;
    offset?: number;
  }): Promise<{ count: number; results: any[] }> {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    const qs = new URLSearchParams();
    qs.set('created_by', params.created_by);
    if (params.from_date) qs.set('from_date', params.from_date);
    if (params.to_date) qs.set('to_date', params.to_date);
    if (params.status) qs.set('status', params.status);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    return ApiService.get(`${adminBase.replace(/\/$/, '')}/api/REST/TxnReportS3Details/?${qs.toString()}`);
  }

  /**
   * Poll for latest Completed export for a source; resolves with s3_bucket_url or null on timeout
   */
  static async waitForExportUrl(opts: {
    createdBy: string;
    sourceStartsWith: string; // e.g. 'v6_admin_txn_excel'
    pollMs?: number;
    timeoutMs?: number;
  }): Promise<string | null> {
    const pollMs = opts.pollMs ?? 3000;
    const timeoutMs = opts.timeoutMs ?? 120000; // 2 minutes
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const resp = await this.listTxnReportS3Details({
          created_by: opts.createdBy,
          status: 'Completed',
          limit: 50,
        });
        const rows = Array.isArray(resp?.results) ? resp.results : [];
        // Find the most recent matching source with a valid URL
        const match = rows.find((r: any) =>
          String(r?.source || '').startsWith(opts.sourceStartsWith) &&
          r?.s3_bucket_url && String(r.s3_bucket_url).startsWith('http')
        );
        if (match) {
          return String(match.s3_bucket_url);
        }
      } catch (e) {
        // ignore and continue polling
      }
      await new Promise(res => setTimeout(res, pollMs));
    }
    return null;
  }

  /**
   * Cached refund client codes to avoid heavy response re-fetch
   */
  private static _refundClientCache: { key: string; data: any[]; expiry: number } | null = null;
  static async getRefundClientCodesCached(status: 'A' | 'I' | 'ALL', login_by: string, ttlMs: number = 5 * 60 * 1000): Promise<any[]> {
    const key = `${status}|${login_by}`;
    const now = Date.now();
    if (this._refundClientCache && this._refundClientCache.key === key && this._refundClientCache.expiry > now) {
      return this._refundClientCache.data;
    }
    const data = await this.getRefundClientCodes(status, login_by);
    this._refundClientCache = { key, data, expiry: now + ttlMs };
    return data;
  }

  /**
   * Fetch analytics report with filters
   */
  static async fetchAnalytics(
    filters: AnalyticsFilter
  ): Promise<AnalyticsReportResponse> {
    const params = new URLSearchParams();

    params.append('from_date', filters.dateRange.from);
    params.append('to_date', filters.dateRange.to);

    if (filters.clientCode) params.append('client_code', filters.clientCode);
    if (filters.metrics && filters.metrics.length > 0) {
      params.append('metrics', filters.metrics.join(','));
    }
    if (filters.comparison) params.append('comparison', filters.comparison);

    return ApiService.get(`/reports/analytics?${params.toString()}`);
  }

  /**
   * Export report to specified format
   */
  static async exportReport(
    request: ExportRequest
  ): Promise<ExportResponse> {
    return ApiService.post('/reports/export', request);
  }

  /**
   * Download exported report file
   */
  static async downloadExportedFile(fileUrl: string): Promise<Blob> {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    return response.blob();
  }

  /**
   * Get report summary for dashboard
   */
  static async getReportSummary(dateRange: DateRange): Promise<{
    transactions: number;
    settlements: number;
    chargebacks: number;
    refunds: number;
    total_volume: number;
    success_rate: number;
  }> {
    const params = new URLSearchParams();
    params.append('from_date', dateRange.from);
    params.append('to_date', dateRange.to);

    return ApiService.get(`/reports/summary?${params.toString()}`);
  }

  /**
   * Get recent reports list
   */
  static async getRecentReports(limit: number = 10): Promise<Array<{
    id: string;
    type: string;
    title: string;
    generated_at: string;
    file_url?: string;
    status: string;
  }>> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    return ApiService.get(`/reports/recent?${params.toString()}`);
  }

  /**
   * Get available payment methods for filtering
   */
  static async getPaymentMethods(): Promise<string[]> {
    return ApiService.get('/reports/filters/payment-methods');
  }

  /**
   * Get available gateways for filtering
   */
  static async getGateways(): Promise<string[]> {
    return ApiService.get('/reports/filters/gateways');
  }

  /**
   * Get chargeback reasons for filtering
   */
  static async getChargebackReasons(): Promise<Array<{
    code: string;
    description: string;
  }>> {
    return ApiService.get('/reports/filters/chargeback-reasons');
  }

  /**
   * Schedule a report for automatic generation
   */
  static async scheduleReport(config: {
    report_type: string;
    schedule: 'daily' | 'weekly' | 'monthly';
    filters: any;
    recipients: string[];
  }): Promise<{
    schedule_id: string;
    message: string;
  }> {
    return ApiService.post('/reports/schedule', config);
  }

  /**
   * Delete scheduled report
   */
  static async deleteScheduledReport(scheduleId: string): Promise<void> {
    return ApiService.delete(`/reports/scheduled/${scheduleId}`);
  }

  /**
   * Get report comparison data
   */
  static async getComparisonData(
    reportType: string,
    currentRange: DateRange,
    comparisonRange: DateRange
  ): Promise<{
    current: any;
    comparison: any;
    changes: {
      metric: string;
      change: number;
      percentage: number;
    }[];
  }> {
    return ApiService.post('/reports/comparison', {
      report_type: reportType,
      current_range: currentRange,
      comparison_range: comparisonRange,
    });
  }

  // ============= Custom Reports =============

  /**
   * Create a custom report
   */
  static async createCustomReport(report: Omit<ICustomReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<ICustomReport> {
    return ApiService.post('/reports/custom/create', report);
  }

  /**
   * Get all custom reports
   */
  static async getCustomReports(): Promise<ICustomReport[]> {
    return ApiService.get('/reports/custom/list');
  }

  /**
   * Get a custom report by ID
   */
  static async getCustomReport(id: string): Promise<ICustomReport> {
    return ApiService.get(`/reports/custom/${id}`);
  }

  /**
   * Update a custom report
   */
  static async updateCustomReport(id: string, updates: Partial<ICustomReport>): Promise<ICustomReport> {
    return ApiService.put(`/reports/custom/${id}`, updates);
  }

  /**
   * Delete a custom report
   */
  static async deleteCustomReport(id: string): Promise<void> {
    return ApiService.delete(`/reports/custom/${id}`);
  }

  /**
   * Run a custom report and get preview data
   */
  static async runCustomReport(reportId: string, filters?: any): Promise<any> {
    return ApiService.post('/reports/custom/run', { report_id: reportId, filters });
  }

  /**
   * Preview custom report before saving
   */
  static async previewCustomReport(config: Partial<ICustomReport>): Promise<any> {
    return ApiService.post('/reports/custom/preview', config);
  }

  // ============= Report Templates =============

  /**
   * Get all report templates
   */
  static async getReportTemplates(category?: string): Promise<IReportTemplate[]> {
    const params = category ? new URLSearchParams({ category }) : '';
    return ApiService.get(`/reports/templates${params ? '?' + params : ''}`);
  }

  /**
   * Get a specific template
   */
  static async getReportTemplate(id: string): Promise<IReportTemplate> {
    return ApiService.get(`/reports/templates/${id}`);
  }

  /**
   * Create report from template
   */
  static async createFromTemplate(templateId: string, customization?: any): Promise<ICustomReport> {
    return ApiService.post('/reports/templates/create', { template_id: templateId, customization });
  }

  /**
   * Run a template directly
   */
  static async runTemplate(templateId: string, filters?: any): Promise<any> {
    return ApiService.post('/reports/templates/run', { template_id: templateId, filters });
  }

  // ============= Scheduled Reports =============

  /**
   * Create a scheduled report
   */
  static async createScheduledReport(schedule: Omit<IScheduledReport, 'id' | 'createdAt' | 'nextRun'>): Promise<IScheduledReport> {
    return ApiService.post('/reports/schedule/create', schedule);
  }

  /**
   * Get all scheduled reports
   */
  static async getScheduledReports(): Promise<IScheduledReport[]> {
    return ApiService.get('/reports/schedule/list');
  }

  /**
   * Get a scheduled report by ID
   */
  static async getScheduledReport(id: string): Promise<IScheduledReport> {
    return ApiService.get(`/reports/schedule/${id}`);
  }

  /**
   * Update a scheduled report
   */
  static async updateScheduledReport(id: string, updates: Partial<IScheduledReport>): Promise<IScheduledReport> {
    return ApiService.put(`/reports/schedule/${id}`, updates);
  }

  /**
   * Delete a scheduled report
   */
  static async deleteSchedule(id: string): Promise<void> {
    return ApiService.delete(`/reports/schedule/${id}`);
  }

  /**
   * Toggle scheduled report active status
   */
  static async toggleSchedule(id: string, isActive: boolean): Promise<IScheduledReport> {
    return ApiService.patch(`/reports/schedule/${id}/toggle`, { is_active: isActive });
  }

  /**
   * Get execution history for a scheduled report
   */
  static async getExecutionHistory(scheduleId: string, limit?: number): Promise<IReportExecution[]> {
    const params = limit ? new URLSearchParams({ limit: limit.toString() }) : '';
    return ApiService.get(`/reports/schedule/${scheduleId}/history${params ? '?' + params : ''}`);
  }

  /**
   * Retry a failed execution
   */
  static async retryExecution(executionId: string): Promise<IReportExecution> {
    return ApiService.post(`/reports/execution/${executionId}/retry`);
  }

  /**
   * Manually trigger a scheduled report
   */
  static async triggerScheduledReport(scheduleId: string): Promise<IReportExecution> {
    return ApiService.post(`/reports/schedule/${scheduleId}/trigger`);
  }

  // ============= Email Reports =============

  /**
   * Send report via email
   */
  static async emailReport(data: {
    report_id?: string;
    report_type: string;
    recipients: string[];
    format: 'csv' | 'excel' | 'pdf';
    filters?: any;
    message?: string;
  }): Promise<{ success: boolean; message: string }> {
    return ApiService.post('/reports/email/send', data);
  }

  // ============= Reconciliation Reports =============

  /**
   * Upload bank statement for reconciliation
   */
  static async uploadBankStatement(file: File, format: 'csv' | 'excel'): Promise<{
    upload_id: string;
    transactions_count: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    return ApiService.post('/reports/reconciliation/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Start reconciliation process
   */
  static async startReconciliation(uploadId: string, period: DateRange): Promise<IReconciliationReport> {
    return ApiService.post('/reports/reconciliation/start', {
      upload_id: uploadId,
      period,
    });
  }

  /**
   * Get reconciliation report
   */
  static async getReconciliationReport(reportId: string): Promise<IReconciliationReport> {
    return ApiService.get(`/reports/reconciliation/${reportId}`);
  }

  /**
   * Manual match transaction
   */
  static async manualMatch(data: {
    bank_transaction_id: string;
    system_transaction_id: string;
  }): Promise<{ success: boolean }> {
    return ApiService.post('/reports/reconciliation/match', data);
  }

  /**
   * Resolve discrepancy
   */
  static async resolveDiscrepancy(discrepancyId: string, resolution: {
    status: 'resolved' | 'ignored';
    notes?: string;
  }): Promise<{ success: boolean }> {
    return ApiService.post(`/reports/reconciliation/discrepancy/${discrepancyId}/resolve`, resolution);
  }

  /**
   * Download reconciliation report
   */
  static async downloadReconciliation(reportId: string, format: 'csv' | 'excel' | 'pdf'): Promise<ExportResponse> {
    return ApiService.post('/reports/reconciliation/export', {
      report_id: reportId,
      format,
    });
  }

  // ============= Financial Reports =============

  /**
   * Get financial report
   */
  static async getFinancialReport(period: DateRange, type?: string): Promise<IFinancialReport> {
    const params = new URLSearchParams();
    params.append('from_date', period.from);
    params.append('to_date', period.to);
    if (type) params.append('type', type);

    return ApiService.get(`/reports/financial?${params.toString()}`);
  }

  /**
   * Export financial report for accounting software
   */
  static async exportForAccounting(period: DateRange, format: 'tally' | 'quickbooks'): Promise<ExportResponse> {
    return ApiService.post('/reports/financial/export', {
      period,
      format,
    });
  }

  /**
   * Get tax report
   */
  static async getTaxReport(period: DateRange): Promise<any> {
    const params = new URLSearchParams();
    params.append('from_date', period.from);
    params.append('to_date', period.to);

    return ApiService.get(`/reports/financial/tax?${params.toString()}`);
  }

  /**
   * Get profit & loss report
   */
  static async getProfitLossReport(period: DateRange): Promise<any> {
    const params = new URLSearchParams();
    params.append('from_date', period.from);
    params.append('to_date', period.to);

    return ApiService.get(`/reports/financial/profit-loss?${params.toString()}`);
  }

  /**
   * Get cash flow report
   */
  static async getCashFlowReport(period: DateRange): Promise<any> {
    const params = new URLSearchParams();
    params.append('from_date', period.from);
    params.append('to_date', period.to);

    return ApiService.get(`/reports/financial/cash-flow?${params.toString()}`);
  }

  // ============= Advanced Analytics =============

  /**
   * Get advanced analytics data
   */
  static async getAdvancedAnalytics(period: DateRange, options?: {
    include_cohort?: boolean;
    include_geo?: boolean;
    include_segments?: boolean;
    include_predictions?: boolean;
  }): Promise<IAdvancedAnalytics> {
    return ApiService.post('/reports/analytics/advanced', {
      period,
      ...options,
    });
  }

  /**
   * Get cohort analysis
   */
  static async getCohortAnalysis(startDate: string, periods: number): Promise<any> {
    return ApiService.get(`/reports/analytics/cohort?start_date=${startDate}&periods=${periods}`);
  }

  /**
   * Get geographical analysis
   */
  static async getGeoAnalysis(period: DateRange): Promise<any> {
    const params = new URLSearchParams();
    params.append('from_date', period.from);
    params.append('to_date', period.to);

    return ApiService.get(`/reports/analytics/geo?${params.toString()}`);
  }

  /**
   * Get customer segmentation
   */
  static async getCustomerSegmentation(period: DateRange): Promise<any> {
    const params = new URLSearchParams();
    params.append('from_date', period.from);
    params.append('to_date', period.to);

    return ApiService.get(`/reports/analytics/segments?${params.toString()}`);
  }

  // ============= Insights =============

  /**
   * Get insights
   */
  static async getInsights(options?: {
    category?: string;
    type?: string;
    dismissed?: boolean;
    limit?: number;
  }): Promise<IInsight[]> {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.type) params.append('type', options.type);
    if (options?.dismissed !== undefined) params.append('dismissed', options.dismissed.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    return ApiService.get(`/reports/insights?${params.toString()}`);
  }

  /**
   * Dismiss an insight
   */
  static async dismissInsight(insightId: string): Promise<{ success: boolean }> {
    return ApiService.post(`/reports/insights/${insightId}/dismiss`);
  }

  /**
   * Generate insights for a period
   */
  static async generateInsights(period: DateRange): Promise<IInsight[]> {
    return ApiService.post('/reports/insights/generate', { period });
  }

  /**
   * Get anomaly detection results
   */
  static async detectAnomalies(period: DateRange): Promise<IInsight[]> {
    return ApiService.post('/reports/insights/anomalies', { period });
  }

  /**
   * Get revenue forecast
   */
  static async getForecast(periods: number): Promise<any> {
    return ApiService.get(`/reports/insights/forecast?periods=${periods}`);
  }

  // ============= PART 1: 6 Report Features =============

  /**
   * 1. CLIENT MAPPED REPORT
   * Get client mapped report for a date range (max 3 months)
   * @param fromDate - Format: YYYY-MM-DD
   * @param toDate - Format: YYYY-MM-DD
   */
  static async getClientMappedReport(fromDate: string, toDate: string): Promise<any[]> {
    return ApiService.get(`https://staging-apis.13-204-100-160.sslip.io/admin/api/REST/GetClientMapped/${fromDate}/${toDate}`);
  }

  /**
   * 2. CURRENT TRANSACTING CLIENT REPORT
   * Get client code list for dropdown
   */
  static async getClientCodeList(): Promise<any[]> {
    return ApiService.get('/common-data/0/0');
  }

  /**
   * Get current transacting client report
   * @param data - Request body with ptype, clientCode, fromDate, endDate
   */
  static async getCurrentTransactingReport(data: {
    ptype: number;
    clientCode: string;
    fromDate: string;
    endDate: string;
  }): Promise<any[]> {
    return ApiService.post('https://staging-apis.13-204-100-160.sslip.io/admin/api/REST/CurrentTransactingReport', data);
  }

  /**
   * 3. ENDPOINT REPORT
   * Get assigned payment modes for a client
   * @param clientCode - Client code
   */
  static async getAssignedPaymentMode(clientCode: string): Promise<any[]> {
    return ApiService.get(`/common-data/19/${clientCode}`);
  }

  /**
   * Get endpoint report
   * @param clientCode - Client code
   * @param payModeId - Payment mode ID
   * @param action - 0 for view, 1 for update
   * @param mapId - Mapping ID (for updates)
   * @param userName - Logged in user name
   */
  static async getEndpointReport(
    clientCode: string,
    payModeId: string,
    action: number,
    mapId: string,
    userName: string
  ): Promise<any[]> {
    const url = `https://staging-apis.13-204-100-160.sslip.io/admin/api/REST/EndpointReport/${clientCode}/${payModeId}/${action}/${mapId}/${userName}`;
    return ApiService.get(url);
  }

  /**
   * Update endpoint (enable/disable)
   * @param clientCode - Client code
   * @param payModeId - Payment mode ID
   * @param mapId - Mapping ID
   * @param userName - Logged in user name
   */
  static async updateEndpoint(
    clientCode: string,
    payModeId: string,
    mapId: string,
    userName: string
  ): Promise<any[]> {
    return this.getEndpointReport(clientCode, payModeId, 1, mapId, userName);
  }

  /**
   * 4. PG REPORT
   * Get payment mode list for dropdown
   */
  static async getPaymentModeList(): Promise<any[]> {
    return ApiService.get('/common-data/30/0');
  }

  /**
   * Get PG Report
   * @param data - Request body with p_fromDate, p_endDate, p_payment_id
   */
  static async getPGReport(data: {
    p_fromDate: string;
    p_endDate: string;
    p_payment_id: number;
  }): Promise<any[]> {
    const adminBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '');
    return ApiService.post(`${adminBase}/api/REST/ViewPGReport/`, data);
  }

  /**
   * 5. RECEIPT REPORT
   * Search transaction by transaction ID
   * @param transactionId - Transaction ID to search
   */
  static async searchTransactionById(transactionId: string): Promise<any> {
    const adminBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '');
    return ApiService.get(`${adminBase}/api/REST/transaction/searchByTransId/${transactionId}`);
  }

  /**
   * 6. SUBSCRIBE PRODUCT LIST
   * Get product list for dropdown
   */
  static async getProductList(): Promise<any[]> {
    const cobBase = (process.env.NEXT_PUBLIC_COB_AWS_API_URL || 'https://cobawsapi.sabpaisa.in').replace(/\/$/, '');
    return ApiService.get(`${cobBase}/client-subscription-service/fetchAppAndPlan`);
  }

  /**
   * Get subscribed clients for a product
   * @param data - Request body with applicationId, startDate, endDate
   */
  static async getSubscribedProduct(data: {
    applicationId: string;
    startDate: string;
    endDate: string;
  }): Promise<any[]> {
    const cobBase = (process.env.NEXT_PUBLIC_COB_AWS_API_URL || 'https://cobawsapi.sabpaisa.in').replace(/\/$/, '');
    return ApiService.post(`${cobBase}/client-subscription-service/fetchSubscribedClient`, data);
  }

  // ============= REFUND FEATURES =============

  /**
   * VIEW REFUND REPORT - Get Client Codes by Status
   * Uses POST /api/merchantRefund/searchClientCodeByStatus/
   * @param status - Status filter (e.g., "A" for active)
   * @param loginBy - Logged in user name
   */
  static async getRefundClientCodes(status: string, loginBy: string): Promise<any[]> {
    const body = {
      status,
      login_by: loginBy
    };

    // Use AdminApiClient for this endpoint
    const { createAdminClient } = await import('./AdminApiClient');
    const adminClient = createAdminClient();
    const response = await adminClient.post('/api/merchantRefund/searchClientCodeByStatus/', body);
    return response.data;
  }

  /**
   * Get Payment Mode Master
   * Uses POST /transactions/GetPaymentModeMaster/
   */
  static async getPaymentModeMaster(): Promise<any[]> {
    const base =
      process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL ||
      process.env.NEXT_PUBLIC_REPORT_API_URL ||
      'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(`${String(base).replace(/\/$/, '')}/transactions/GetPaymentModeMaster/`, {});
  }

  /**
   * VIEW REFUND REPORT - Get All Refund History
   * Uses POST /api/merchantRefund/viewAllRefundHistory/
   * IMPORTANT: Client selection is REQUIRED (no "ALL" option)
   * @param data - Request body with client_code, from_date, to_date, login_by
   */
  static async viewAllRefundHistory(data: {
    client_code: string;
    from_date: string;
    to_date: string;
    login_by: string;
  }): Promise<any> {
    // Use AdminApiClient for this endpoint
    const { createAdminClient } = await import('./AdminApiClient');
    const adminClient = createAdminClient();
    const response = await adminClient.post('/api/merchantRefund/viewAllRefundHistory/', data);
    return response.data;
  }

  // ============= PART 2: 5 Remaining Report Features =============

  /**
   * 1. SETTLE PAISA REPORT
   * Get split settlement detail for a client
   * @param clientCode - Client code
   * @param data - Request body with startDate, endDate
   */
  static async getSplitSettlementDetail(
    clientCode: string,
    data: {
      startDate: string;
      endDate: string;
    }
  ): Promise<any[]> {
    const settleBase = (process.env.NEXT_PUBLIC_SETTLEPAISA_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '');
    return ApiService.post(`${settleBase}/settlepaisaApi/fetch/${clientCode}`, data);
  }

  /**
   * Split transactions by client code
   * @param clientCode - Client code
   * @param transactions - Array of transaction objects
   */
  static async splitTransactionsByClientCode(clientCode: string, transactions: any[]): Promise<any> {
    const settleBase = (process.env.NEXT_PUBLIC_SETTLEPAISA_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '');
    return ApiService.post(`${settleBase}/settlepaisaApi/splittTransByClientCode/${clientCode}`, transactions);
  }

  /**
   * 2. TID REPORT
   * Get mapping details for a client
   * @param clientCode - Client code
   */
  static async getTIDMappingDetails(clientCode: string): Promise<any[]> {
    return ApiService.get(`https://staging-apis.13-204-100-160.sslip.io/admin/api/MappingDetail/Mapping/${clientCode}`);
  }

  /**
   * 3. ANALYSIS REPORT
   * Get analysis report data
   * @param data - Request body with fromDate, endDate, pclientCode
   */
  static async getAnalysisReport(data: {
    fromDate: string;
    endDate: string;
    pclientCode: string;
  }): Promise<any[]> {
    return ApiService.post(
      'https://staging-apis.13-204-100-160.sslip.io/admin/api/REST/GetAnalysisReport',
      data
    );
  }

  /**
   * Get success transaction summary
   * @param data - Request body with fromdate, todate, clientcode
   */
  static async getSuccessTxnSummary(data: {
    fromdate: string;
    todate: string;
    clientcode: string;
  }): Promise<any[]> {
    // Note: This endpoint URL should be replaced with actual endpoint from environment
    return ApiService.post(
      'https://staging-apis.13-204-100-160.sslip.io/admin/api/SabPaisaAdmin/REST/SuccessTxnSummary',
      data
    );
  }

  /**
   * Get GMV data for analysis
   * @param data - Request body with fromdate, todate, clientcode
   */
  static async getAnalysisGMVData(data: {
    fromdate: string;
    todate: string;
    clientcode: string;
  }): Promise<any> {
    return ApiService.post(
      '/transactions/AdminSuccessSmallTxnSummary/',
      data
    );
  }

  /**
   * Save report file details for analysis
   * @param reportType - Report type ID
   * @param clientCode - Client code
   * @param fileName - File name
   * @param folderName - Folder name
   * @param subfolderName - Subfolder name
   */
  static async saveReportFileDetails(
    reportType: string,
    clientCode: string,
    fileName: string,
    folderName: string,
    subfolderName: string
  ): Promise<any> {
    const adminBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '');
    const inputData = `${reportType}/${clientCode}/${fileName}/${folderName}/${subfolderName}`;
    return ApiService.get(`${adminBase}/api/REST/SaveReportFiles/${inputData}`);
  }

  /**
   * 4. TSR REPORT
   * Get TSR monitoring data
   * @param data - Request body with minutes_values, pay_mode_id, p_client_code
   */
  static async getTSRMonitoring(data: {
    minutes_values: number;
    pay_mode_id: number;
    p_client_code: string;
  }): Promise<any[]> {
    return ApiService.post(
      '/api/transactions/GetTSRMonotoring/',
      data
    );
  }

  /**
   * Get client list for TSR filtering
   * @param data - Request body with payment_mode_id, ep_id, b_ctg_code
   */
  static async getClientListForTSR(data: {
    payment_mode_id: number;
    ep_id: number;
    b_ctg_code: string;
  }): Promise<any[]> {
    return ApiService.post(
      '/REST/GetClientDataModeAndEPWise',
      data
    );
  }

  /**
   * Get pipe list for TSR
   * @param data - Request body with minutes_val, pay_mode_id, s_ep_id, p_b_cat_code
   */
  static async getTSRPipeList(data: {
    minutes_val: number;
    pay_mode_id: number;
    s_ep_id: number;
    p_b_cat_code: string;
  }): Promise<any[]> {
    return ApiService.post(
      '/REST/GetTSRWithExistingMID',
      data
    );
  }

  /**
   * Change pipe for TSR
   * @param data - Request body with pipe change parameters
   */
  static async changeTSRPipe(data: {
    p_paymode_id: number;
    p_ep_id: number;
    p_client_id: number;
    p_business_ctg_code: string;
    old_ep_id: number;
  }): Promise<any> {
    const base =
      process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL ||
      process.env.NEXT_PUBLIC_REPORT_API_URL ||
      'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(`${String(base).replace(/\/$/, '')}/SabPaisaAdmin/REST/updatePipeInfo`, data);
  }

  /**
   * 5. RESELLER REPORT
   * Get reseller list
   */
  static async getResellerList(): Promise<any> {
    const cobKycBase = (process.env.NEXT_PUBLIC_COBKYC_URL || 'https://cobkyc.sabpaisa.in').replace(/\/$/, '');
    return ApiService.get(`${cobKycBase}/kyc/get-client-code-by-role/?role=reseller&null_client_codes=True`);
  }

  /**
   * Get reseller report data
   * @param data - Request body with referral_code, paymentStatus, fromDate, endDate
   */
  static async getResellerReport(data: {
    referral_code: string;
    paymentStatus: string;
    fromDate: string | null;
    endDate: string | null;
  }): Promise<any[]> {
    return ApiService.post('/reports/referral_summary/', data);
  }

  // ============= SETTLEMENT REPORT (View Settlement Report) =============

  /**
   * Get settlement report (View Settlement Report) — v6
   * Matches Angular getSettelmentReport method payload
   * @param data - Request body with clientCode, fromDate, endDate, noOfClient, rpttype, page, length, search
   */
  static async getSettlementReport(data: {
    clientCode: string;
    fromDate: string;
    endDate: string;
    noOfClient: number;
    rpttype: number;
    page?: number;
    length?: number;
    search?: string;
  }): Promise<any> {
    // v6 optimized path under same base
    const base = process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL || 'https://staging-apis.13-204-100-160.sslip.io/report';
    return ApiService.post(`${base.replace(/\/$/, '')}/v6/transactions/GetSettledTxnHistory/`, data);
  }

  /**
   * Get client code list for slave/report filtering
   * Matches Angular getClientCodeListUSP_Slave method
   * @returns List of client codes with names
   */
  static async getClientCodeListUSP_Slave(loginBy: string): Promise<any[]> {
    // Match Angular: GET report masters endpoint
    // Angular always provides login_by taken from localStorage userName
    const normalizedLogin = loginBy?.trim();

    if (!normalizedLogin) {
      throw new Error('login_by is required to fetch client codes');
    }

    const url = `/masters/clientDataMaster/?login_by=${encodeURIComponent(normalizedLogin)}`;

    return ApiService.get(url);
  }

  // Cached variant to avoid heavy client list on every open
  private static _clientListCache: { key: string; data: any[]; expiry: number } | null = null;
  static async getClientCodeListUSP_Cached(loginBy: string, ttlMs: number = 5 * 60 * 1000): Promise<any[]> {
    const normalizedLogin = loginBy?.trim();

    if (!normalizedLogin) {
      throw new Error('login_by is required to fetch client codes');
    }

    const cacheKey = normalizedLogin.toLowerCase();
    const now = Date.now();

    if (this._clientListCache && this._clientListCache.key === cacheKey && this._clientListCache.expiry > now) {
      return this._clientListCache.data;
    }

    const data = await this.getClientCodeListUSP_Slave(normalizedLogin);
    this._clientListCache = { key: cacheKey, data, expiry: now + ttlMs };
    return data;
  }

  // ==================== Templates (Admin API) ====================
  static async listTemplates(params: { created_by: string }): Promise<{ count: number; results: any[] }> {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    const qs = new URLSearchParams({ created_by: params.created_by });
    return ApiService.get(`${adminBase.replace(/\/$/, '')}/api/report-templates/?${qs.toString()}`);
  }

  static async createTemplate(data: {
    name: string;
    description?: string;
    report_type: 'transactions' | 'refunds' | 'chargebacks' | 'settlements';
    filters_json: any;
    visibility?: 'private' | 'shared' | 'public';
    created_by: string;
  }): Promise<{ id: number }> {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    return ApiService.post(`${adminBase.replace(/\/$/, '')}/api/report-templates/`, data);
  }

  static async getTemplate(id: number): Promise<any> {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    return ApiService.get(`${adminBase.replace(/\/$/, '')}/api/report-templates/${id}/`);
  }

  static async updateTemplate(id: number, updates: Partial<{ name: string; description: string; report_type: string; filters_json: any; visibility: string; is_active: boolean }>): Promise<{ updated: boolean }> {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    return ApiService.patch(`${adminBase.replace(/\/$/, '')}/api/report-templates/${id}/`, updates);
  }

  static async shareTemplate(id: number, shares: Array<{ shared_with: string; shared_type?: 'user' | 'role'; permission?: 'run' | 'edit' }>): Promise<{ updated: boolean }> {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    return ApiService.post(`${adminBase.replace(/\/$/, '')}/api/report-templates/${id}/share/`, { shares });
  }

  static async runTemplate(id: number, run_by: string, overrides?: any): Promise<{ detail: string; run_id?: number }> {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin';
    return ApiService.post(`${adminBase.replace(/\/$/, '')}/api/report-templates/${id}/run/`, { run_by, overrides });
  }
}

export default ReportApiService;
