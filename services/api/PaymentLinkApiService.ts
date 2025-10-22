/**
 * Payment Link API Service for sabpaisa_admin_v5
 * Comprehensive payment link and QR code management
 */
import { BaseApiService } from './base/BaseApiService';

export interface PaymentLink {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'paid' | 'cancelled';
  linkUrl: string;
  qrCodeUrl?: string;
  shortUrl?: string;

  // Customer details
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  // Payment configuration
  paymentMethods?: string[];
  acceptPartialPayments: boolean;
  minPartialAmount?: number;

  // Expiry
  expiresAt?: string;
  isExpired: boolean;

  // Custom fields
  customFields?: Record<string, any>;

  // Metadata
  clientId: string;
  clientName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Transaction info
  paidAt?: string;
  paidAmount?: number;
  transactionId?: string;

  // Analytics
  views: number;
  clicks: number;
  shareCount: number;
}

export interface PaymentLinkTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  amount?: number;
  customFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select';
    required: boolean;
    options?: string[];
  }>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLinkCreateRequest {
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethods?: string[];
  acceptPartialPayments?: boolean;
  minPartialAmount?: number;
  expiresAt?: string;
  customFields?: Record<string, any>;
  sendNotification?: boolean;
  notificationChannels?: ('email' | 'sms' | 'whatsapp')[];
  templateId?: string;
}

export interface PaymentLinkUpdateRequest {
  title?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  expiresAt?: string;
  customFields?: Record<string, any>;
}

export interface PaymentLinkSearchFilter {
  id?: string;
  title?: string;
  status?: PaymentLink['status'][];
  customerEmail?: string;
  customerPhone?: string;
  amountFrom?: number;
  amountTo?: number;
  dateFrom?: string;
  dateTo?: string;
  clientId?: string[];
  createdBy?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'amount' | 'status' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentLinkSearchResponse {
  links: PaymentLink[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  summary: {
    totalAmount: number;
    activeCount: number;
    paidCount: number;
    expiredCount: number;
    totalViews: number;
    conversionRate: number;
  };
}

export interface QRCode {
  id: string;
  name: string;
  type: 'static' | 'dynamic';
  format: 'upi' | 'payment_link';
  qrCodeUrl: string;
  qrCodeData: string;

  // UPI specific
  upiId?: string;
  merchantName?: string;

  // Payment link reference
  paymentLinkId?: string;

  // Analytics
  scanCount: number;
  conversionCount: number;
  lastScannedAt?: string;

  // Customization
  logoUrl?: string;
  foregroundColor?: string;
  backgroundColor?: string;
  size?: number;

  createdAt: string;
  updatedAt: string;
}

export interface QRCodeGenerateRequest {
  name: string;
  type: 'static' | 'dynamic';
  format: 'upi' | 'payment_link';

  // UPI data
  upiId?: string;
  merchantName?: string;
  amount?: number;

  // Payment link data
  paymentLinkId?: string;

  // Customization
  logoUrl?: string;
  foregroundColor?: string;
  backgroundColor?: string;
  size?: number;
}

export interface PaymentLinkAnalytics {
  overview: {
    totalLinks: number;
    activeLinks: number;
    paidLinks: number;
    totalAmount: number;
    totalPaidAmount: number;
    averageAmount: number;
    conversionRate: number;
    totalViews: number;
    totalClicks: number;
  };

  statusBreakdown: {
    status: PaymentLink['status'];
    count: number;
    amount: number;
    percentage: number;
  }[];

  timeSeriesData: {
    date: string;
    linksCreated: number;
    linksPaid: number;
    amount: number;
    views: number;
    clicks: number;
  }[];

  topPerformingLinks: {
    link: PaymentLink;
    views: number;
    clicks: number;
    conversionRate: number;
  }[];

  paymentMethodBreakdown: {
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }[];

  channelPerformance: {
    channel: 'email' | 'sms' | 'whatsapp' | 'direct';
    sent: number;
    opened: number;
    clicked: number;
    paid: number;
    conversionRate: number;
  }[];
}

export interface ShareRequest {
  linkId: string;
  channels: ('email' | 'sms' | 'whatsapp')[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  message?: string;
}

export interface ShareResponse {
  success: boolean;
  channels: {
    channel: string;
    status: 'sent' | 'failed';
    sentAt?: string;
    error?: string;
  }[];
}

export class PaymentLinkApiService extends BaseApiService {
  public readonly serviceName = 'PaymentLinkService';
  protected readonly endpoint = '/payment-links';

  // Payment Link CRUD Operations
  async createPaymentLink(data: PaymentLinkCreateRequest): Promise<PaymentLink> {
    return this.post<PaymentLink>('/create/', data);
  }

  async getPaymentLinks(filter: PaymentLinkSearchFilter = {}): Promise<PaymentLinkSearchResponse> {
    const queryString = this.buildQueryString(filter as any);
    return this.get<PaymentLinkSearchResponse>(`/list/?${queryString}`);
  }

  async getPaymentLink(id: string): Promise<PaymentLink> {
    return this.get<PaymentLink>(`/${id}/`);
  }

  async updatePaymentLink(id: string, data: PaymentLinkUpdateRequest): Promise<PaymentLink> {
    return this.put<PaymentLink>(`/${id}/update/`, data);
  }

  async deactivatePaymentLink(id: string, reason?: string): Promise<PaymentLink> {
    return this.post<PaymentLink>(`/${id}/deactivate/`, { reason });
  }

  async deletePaymentLink(id: string): Promise<void> {
    return this.delete<void>(`/${id}/`);
  }

  // Share & Notification
  async sharePaymentLink(data: ShareRequest): Promise<ShareResponse> {
    return this.post<ShareResponse>(`/${data.linkId}/share/`, data);
  }

  async resendNotification(linkId: string, channels: string[]): Promise<ShareResponse> {
    return this.post<ShareResponse>(`/${linkId}/resend/`, { channels });
  }

  // Templates
  async getTemplates(): Promise<PaymentLinkTemplate[]> {
    const response = await this.get<any>('/templates/');
    return this.normalizeResults<PaymentLinkTemplate>(response);
  }

  async getTemplate(id: string): Promise<PaymentLinkTemplate> {
    return this.get<PaymentLinkTemplate>(`/templates/${id}/`);
  }

  async createTemplate(data: Omit<PaymentLinkTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentLinkTemplate> {
    return this.post<PaymentLinkTemplate>('/templates/', data);
  }

  async updateTemplate(id: string, data: Partial<PaymentLinkTemplate>): Promise<PaymentLinkTemplate> {
    return this.put<PaymentLinkTemplate>(`/templates/${id}/`, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.delete<void>(`/templates/${id}/`);
  }

  // QR Code Operations
  async generateQRCode(data: QRCodeGenerateRequest): Promise<QRCode> {
    return this.post<QRCode>('/qr-codes/generate/', data);
  }

  async getQRCodes(filter: {
    page?: number;
    pageSize?: number;
    type?: 'static' | 'dynamic';
    format?: 'upi' | 'payment_link';
  } = {}): Promise<{
    qrCodes: QRCode[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const queryString = this.buildQueryString(filter as any);
    return this.get<any>(`/qr-codes/?${queryString}`);
  }

  async getQRCode(id: string): Promise<QRCode> {
    return this.get<QRCode>(`/qr-codes/${id}/`);
  }

  async updateQRCode(id: string, data: Partial<QRCodeGenerateRequest>): Promise<QRCode> {
    return this.put<QRCode>(`/qr-codes/${id}/`, data);
  }

  async deleteQRCode(id: string): Promise<void> {
    return this.delete<void>(`/qr-codes/${id}/`);
  }

  async downloadQRCode(id: string, format: 'png' | 'svg' | 'pdf' = 'png'): Promise<void> {
    await this.downloadFile(
      'qrCodeDownload',
      { id, format },
      `qr-code-${id}.${format}`
    );
  }

  async bulkGenerateQRCodes(data: {
    count: number;
    type: 'static' | 'dynamic';
    format: 'upi' | 'payment_link';
    baseData: Partial<QRCodeGenerateRequest>;
  }): Promise<{
    qrCodes: QRCode[];
    successCount: number;
    failedCount: number;
  }> {
    return this.post<any>('/qr-codes/bulk-generate/', data);
  }

  // Analytics
  async getAnalytics(filter: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    range?: '7d' | '30d' | '90d' | 'all';
  } = {}): Promise<PaymentLinkAnalytics> {
    const queryString = this.buildQueryString(filter as any);
    return this.get<PaymentLinkAnalytics>(`/analytics/?${queryString}`);
  }

  async getLinkAnalytics(linkId: string): Promise<{
    views: number;
    clicks: number;
    shareCount: number;
    conversionRate: number;
    viewsByDate: { date: string; count: number }[];
    clicksByDate: { date: string; count: number }[];
    deviceBreakdown: { device: string; count: number }[];
    locationBreakdown: { location: string; count: number }[];
  }> {
    return this.get<any>(`/${linkId}/analytics/`);
  }

  async getQRAnalytics(qrCodeId: string): Promise<{
    scanCount: number;
    conversionCount: number;
    conversionRate: number;
    scansByDate: { date: string; count: number }[];
    deviceBreakdown: { device: string; count: number }[];
    locationBreakdown: { location: string; count: number }[];
  }> {
    return this.get<any>(`/qr-codes/${qrCodeId}/analytics/`);
  }

  // Export
  async exportPaymentLinks(
    filter: PaymentLinkSearchFilter & { format: 'csv' | 'xlsx' | 'pdf' },
    filename?: string
  ): Promise<void> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([k, v]) => {
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
      'paymentLinkExport',
      params,
      filename || `payment-links-${new Date().toISOString().split('T')[0]}.${filter.format}`
    );
  }

  async exportQRCodes(
    format: 'zip' | 'pdf',
    qrCodeIds: string[]
  ): Promise<void> {
    await this.downloadFile(
      'qrCodeBulkExport',
      { format, ids: qrCodeIds.join(',') },
      `qr-codes-${new Date().toISOString().split('T')[0]}.${format}`
    );
  }

  // Utility Methods
  async validateCustomerDetails(data: {
    email?: string;
    phone?: string;
  }): Promise<{
    emailValid: boolean;
    phoneValid: boolean;
    errors: string[];
  }> {
    return this.post<any>('/validate-customer/', data);
  }

  async checkLinkAvailability(shortCode: string): Promise<{
    available: boolean;
    suggestion?: string;
  }> {
    return this.get<any>(`/check-availability/?shortCode=${shortCode}`);
  }

  async getPaymentMethodsForLink(linkId: string): Promise<{
    methods: string[];
    recommended: string[];
  }> {
    return this.get<any>(`/${linkId}/payment-methods/`);
  }
}

export const paymentLinkService = new PaymentLinkApiService();
