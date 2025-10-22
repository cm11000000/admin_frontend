/**
 * Settlement API Service for sabpaisa_admin_v5
 * Handles Settlement file uploads, Disbursement, and Import Batch management
 */
import { BaseApiService } from './base/BaseApiService';
import { adminAPI } from '@/lib/api-client';
import { resolveUserName } from '@/lib/utils';

// Settlement Interfaces
export interface SettlementUploadResponse {
  id: string;
  fileName: string;
  status: 'success' | 'failed';
  recordsProcessed: number;
  timestamp: string;
  message?: string;
}

export interface ImportBatch {
  id: string;
  batchId: string;
  fileName: string;
  uploadDate: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  status: 'completed' | 'processing' | 'failed';
  failures?: FailureDetail[];
}

export interface FailureDetail {
  id: string;
  recordId: string;
  reason: string;
  amount: number;
  accountNumber: string;
}

export interface BatchFilters {
  batchId?: string;
  uploadDate?: string;
  status?: string;
}

// Disbursement Interfaces
export interface Disbursement {
  id: string;
  batch_id: string;
  merchant_id: string;
  merchant_name: string;
  settlement_amount: number;
  fee_amount: number;
  tax_amount: number;
  net_amount: number;
  bank_account: string;
  ifsc_code: string;
  utr_number?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
  scheduled_date: string;
  disbursed_date?: string;
  transaction_count: number;
  remarks?: string;
}

export interface DisbursementRequest {
  fromDate?: string;
  toDate?: string;
  merchantId?: string;
  status?: string;
}

export interface DisbursementResponse {
  disbursements: Disbursement[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SettlementPostRequest {
  batchId: string;
  disbursements: string[];
}

export interface CSVGenerateRequest {
  fromDate: string;
  toDate: string;
  merchantIds?: string[];
}

export class SettlementApiService extends BaseApiService {
  public readonly serviceName = 'SettlementService';
  protected readonly endpoint = '/settlement';

  // Override baseURL to use Admin API
  constructor() {
    super((process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, ''));
  }

  private getLoginBy(): string {
    return resolveUserName();
  }

  private async registerSettlementUpload(fileName: string): Promise<any> {
    const encodedName = encodeURIComponent(fileName);
    const response = await adminAPI.get(`/api/REST/settlementReport/BulkUpload/${encodedName}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to register settlement upload');
    }

    return response.data;
  }

  /**
   * Upload settlement file
   * Matches Angular pushFileToStorage + saveFilesForSettelementReport
   */
  async uploadSettlementFile(file: File): Promise<SettlementUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      const loginBy = this.getLoginBy();
      if (loginBy) {
        formData.append('login_by', loginBy);
      }

      const fullUrl = this.buildFullUrl('api/file/upload');
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

      await response.json().catch(() => ({}));

      const registerResponse = await this.registerSettlementUpload(file.name);

      const resultArray = Array.isArray(registerResponse) ? registerResponse : [registerResponse];
      const result = resultArray?.[0] ?? {};
      const status = Number(result?.ID ?? result?.result) === 1 ? 'success' : 'failed';

      return {
        id: result?.batchId || Date.now().toString(),
        fileName: file.name,
        status,
        recordsProcessed: Number(result?.recordsProcessed || result?.count || 0),
        timestamp: new Date().toISOString(),
        message: result?.message || result?.msg || undefined,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get disbursements to be settled
   * POST https://adminapi.sabpaisa.in/settlement/to_be_settled/
   */
  async getDisbursements(request: {
    clientCode?: string;
    transDate?: string;
    pgPayMode?: string;
    paymentMode?: string;
  }): Promise<any[]> {
    try {
      const response = await this.post<any>('/to_be_settled/', request);

      // Return raw array from API
      return Array.isArray(response) ? response : (response.results || []);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CSV for disbursements
   * POST https://adminapi.sabpaisa.in/settlement/get_csv/
   * Returns CSV text content
   */
  async getDisbursementCSV(request: {
    clientCode?: string;
    transDate?: string;
    pgPayMode?: string;
    paymentMode?: string;
  }): Promise<string> {
    try {
      const fullUrl = this.buildFullUrl('/get_csv/');
      const headers = this.getRequestHeaders();

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response, {
          url: fullUrl,
          method: 'POST',
          startTime: Date.now()
        });
      }

      // Return as text (CSV content)
      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Post settlement confirmation
   * POST https://adminapi.sabpaisa.in/settlement/settlement_csv/
   */
  async postSettlement(request: {
    clientCode?: string;
    transDate?: string;
    pgPayMode?: string;
    paymentMode?: string;
  }): Promise<any> {
    try {
      const response = await this.post<any>('/settlement_csv/', request);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Post bulk settlement CSV (v2)
   * POST https://adminapi.sabpaisa.in/settlement/settlement_csv_v2/
   */
  async postBulkSettlementCSV(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file, 'test_files/settle_file.csv');

      // Hardcoded for testing
      const loginBy = this.getLoginBy();
      formData.append('login_by', loginBy);

      const fullUrl = this.buildFullUrl('/settlement_csv_v2/');
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

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get daily disbursement history
   * GET https://adminapi.sabpaisa.in/settlement/daily_disbursement/
   */
  async getDailyDisbursement(queryParams?: {
    date__start_date?: string;
    date__end_date?: string;
    search?: string;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (queryParams?.date__start_date) params.set('date__start_date', queryParams.date__start_date);
    if (queryParams?.date__end_date) params.set('date__end_date', queryParams.date__end_date);
    if (queryParams?.search) params.set('search', queryParams.search);

    const response = await adminAPI.get(`/settlement/daily_disbursement/${params.toString() ? `?${params.toString()}` : ''}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch disbursement history');
    }

    const payload = response.data as any;
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.results)) {
      return payload.results;
    }

    return [];
  }

  /**
   * Get payment mode list
   * GET https://adminapi.sabpaisa.in/masters/paymentModeMaster/
   */
  async getPaymentModeList(): Promise<any[]> {
    const response = await adminAPI.get('/masters/paymentModeMaster/');

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch payment modes');
    }

    const payload = response.data as any;
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.results)) {
      return payload.results;
    }

    return [];
  }

  async getDisbursements(body: {
    clientCode?: string;
    transDate?: string;
    pgPayMode?: string;
    paymentMode?: string;
  }): Promise<any[]> {
    const response = await adminAPI.post('/settlement/to_be_settled/', body);

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch disbursements');
    }

    const payload = response.data as any;
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.results)) {
      return payload.results;
    }

    return [];
  }

  async getDisbursementCSV(body: {
    clientCode?: string;
    transDate?: string;
    pgPayMode?: string;
    paymentMode?: string;
  }): Promise<string> {
    const fullUrl = this.buildFullUrl('settlement/get_csv/');
    const headers = this.getRequestHeaders();

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'POST',
        startTime: Date.now()
      });
    }

    return await response.text();
  }

  async postSettlement(body: {
    clientCode?: string;
    transDate?: string;
    pgPayMode?: string;
    paymentMode?: string;
  }): Promise<any> {
    const response = await adminAPI.post('/settlement/settlement_csv/', body);

    if (!response.success) {
      throw new Error(response.error || 'Failed to confirm settlement');
    }

    return response.data;
  }

  async postBulkSettlementCSV(file: File): Promise<any> {
    const fullUrl = this.buildFullUrl('settlement/settlement_csv_v2/');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('login_by', this.getLoginBy());

    const headers = this.getRequestHeaders();
    delete headers['Content-Type'];

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'POST',
        startTime: Date.now()
      });
    }

    return await response.json().catch(() => ({}));
  }

  /**
   * Normalize import batch data
   */
  private normalizeImportBatch(data: any): ImportBatch {
    return {
      id: data.id || data._id,
      batchId: data.batch_id || data.batchId || data.id,
      fileName: data.file_name || data.fileName,
      uploadDate: data.upload_date || data.uploadDate || data.created_at,
      totalRecords: Number(data.total_records || data.totalRecords || 0),
      successRecords: Number(data.success_records || data.successRecords || 0),
      failedRecords: Number(data.failed_records || data.failedRecords || 0),
      status: data.status || 'completed',
      failures: (data.failures || []).map((f: any) => ({
        id: f.id,
        recordId: f.record_id || f.recordId,
        reason: f.reason || f.error_message,
        amount: Number(f.amount || 0),
        accountNumber: f.account_number || f.accountNumber || '',
      })),
    };
  }

  /**
   * Normalize disbursement data
   */
  private normalizeDisbursement(data: any): Disbursement {
    return {
      id: data.id || data._id,
      batch_id: data.batch_id || data.batchId,
      merchant_id: data.merchant_id || data.merchantId,
      merchant_name: data.merchant_name || data.merchantName,
      settlement_amount: Number(data.settlement_amount || data.settlementAmount || 0),
      fee_amount: Number(data.fee_amount || data.feeAmount || 0),
      tax_amount: Number(data.tax_amount || data.taxAmount || 0),
      net_amount: Number(data.net_amount || data.netAmount || 0),
      bank_account: data.bank_account || data.bankAccount || '',
      ifsc_code: data.ifsc_code || data.ifscCode || '',
      utr_number: data.utr_number || data.utrNumber,
      status: data.status || 'pending',
      scheduled_date: data.scheduled_date || data.scheduledDate,
      disbursed_date: data.disbursed_date || data.disbursedDate,
      transaction_count: Number(data.transaction_count || data.transactionCount || 0),
      remarks: data.remarks,
    };
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only XLSX, XLS, and CSV files are allowed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const settlementService = new SettlementApiService();
export default settlementService;
