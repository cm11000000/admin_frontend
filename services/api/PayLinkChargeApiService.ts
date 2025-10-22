/**
 * PayLink Charge API Service for sabpaisa_admin_v5
 * Handles PayLink charges management - Save, View, Update, and Bill Generation
 */
import { BaseApiService } from './base/BaseApiService';

// Request/Response Interfaces
export interface SaveChargeRequest {
  clientCode: string;
  chargeType: 'SMS' | 'LNK' | 'EMAIL';
  amount: number;
}

export interface SaveChargeResponse {
  id?: string;
  msg?: string;
  success: boolean;
  clientCode: string;
  chargeType: string;
  amount: number;
}

export interface PayLinkCharge {
  id: string;
  clientCode: string;
  clientName?: string;
  chargeType: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export interface UpdateChargeRequest {
  clientCode: string;
  type: string;
  chargeAmount: number;
}

export interface UpdateChargeResponse {
  msg?: string;
  success: boolean;
}

export interface GenerateBillRequest {
  clientCode: string;
  fromDate: string;
  endDate: string;
  billingTypes: ('SMS' | 'Email' | 'Link')[];
}

export interface GenerateBillResponse {
  message?: string;
  totalAmount: number;
  totalSms: number;
  totalLink: number;
  totalEmail: number;
  fromDate: string;
  endDate: string;
  clientCode: string;
  details: {
    type: string;
    count: number;
    amount: number;
  }[];
}

export class PayLinkChargeApiService extends BaseApiService {
  public readonly serviceName = 'PayLinkChargeService';
  protected readonly endpoint = '/paylinkCharges';

  // Override baseURL to use PayLink API, but avoid hardcoded production host
  constructor() {
    const base =
      process.env.NEXT_PUBLIC_PAYLINK_BASE_URL ||
      (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin');
    super(String(base).replace(/\/$/, ''));
  }

  /**
   * Save new PayLink charge
   * POST https://sendpaylink.sabpaisa.in/paylinkCharges/save
   */
  async saveCharge(data: SaveChargeRequest): Promise<SaveChargeResponse> {
    try {
      const requestData = {
        clientCode: data.clientCode,
        type: data.chargeType,
        chargeAmount: data.amount,
      };

      const response = await this.post<any>('/save', requestData);

      return {
        id: response.id,
        msg: response.msg,
        success: !response.msg, // If no error message, it's successful
        clientCode: data.clientCode,
        chargeType: data.chargeType,
        amount: data.amount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all PayLink charges
   * GET https://sendpaylink.sabpaisa.in/paylinkCharges/all
   */
  async getAllCharges(clientCode?: string): Promise<PayLinkCharge[]> {
    try {
      const response = await this.get<PayLinkCharge[]>('/all');

      // Filter by client code if provided
      if (clientCode && clientCode !== 'ALL' && clientCode !== 'undefined') {
        return response.filter(charge => charge.clientCode === clientCode);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update PayLink charge
   * PUT https://sendpaylink.sabpaisa.in/paylinkCharges/updateCharges
   */
  async updateCharge(data: UpdateChargeRequest): Promise<UpdateChargeResponse> {
    try {
      const response = await this.put<any>('/updateCharges', data);

      return {
        msg: response.msg,
        success: !response.msg, // If no error message, it's successful
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate bill for PayLink charges
   * POST https://sendpaylink.sabpaisa.in/billing/generateBill
   */
  async generateBill(data: GenerateBillRequest): Promise<GenerateBillResponse> {
    try {
      const requestData = {
        from: data.fromDate,
        to: data.endDate,
        clientCode: data.clientCode,
        type: data.billingTypes.map(t => t === 'Email' ? 'EML' : t),
      };

      const response = await this.post<any>('/billing/generateBill', requestData);

      return {
        message: response.message,
        totalAmount: response.totalAmount || 0,
        totalSms: response.totalSms || 0,
        totalLink: response.totalLink || 0,
        totalEmail: response.totalEmail || 0,
        fromDate: data.fromDate,
        endDate: data.endDate,
        clientCode: data.clientCode,
        details: response.details || [],
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get charges by client code
   */
  async getChargesByClient(clientCode: string): Promise<PayLinkCharge[]> {
    try {
      const allCharges = await this.getAllCharges();
      return allCharges.filter(charge => charge.clientCode === clientCode);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get charges summary statistics
   */
  async getChargesSummary(): Promise<{
    totalCharges: number;
    totalAmount: number;
    activeCount: number;
    inactiveCount: number;
    byType: Record<string, number>;
  }> {
    try {
      const charges = await this.getAllCharges();

      const byType: Record<string, number> = {};
      let totalAmount = 0;
      let activeCount = 0;
      let inactiveCount = 0;

      charges.forEach(charge => {
        totalAmount += charge.amount;
        if (charge.status === 'active') {
          activeCount++;
        } else {
          inactiveCount++;
        }

        if (!byType[charge.chargeType]) {
          byType[charge.chargeType] = 0;
        }
        byType[charge.chargeType]++;
      });

      return {
        totalCharges: charges.length,
        totalAmount,
        activeCount,
        inactiveCount,
        byType,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate charge data before saving
   */
  validateChargeData(data: SaveChargeRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.clientCode || data.clientCode === 'ALL') {
      errors.push('Client code is required');
    }

    if (!data.chargeType || data.chargeType === 'ALL' as any) {
      errors.push('Charge type is required');
    }

    if (!data.amount || data.amount <= 0) {
      errors.push('Charge amount must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate bill generation data
   */
  validateBillData(data: GenerateBillRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.clientCode) {
      errors.push('Client code is required');
    }

    if (!data.fromDate) {
      errors.push('From date is required');
    }

    if (!data.endDate) {
      errors.push('End date is required');
    }

    if (!data.billingTypes || data.billingTypes.length === 0) {
      errors.push('At least one billing type is required');
    }

    if (data.fromDate && data.endDate && new Date(data.fromDate) > new Date(data.endDate)) {
      errors.push('From date cannot be after end date');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const payLinkChargeService = new PayLinkChargeApiService();
