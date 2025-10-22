/**
 * Merchant API Service
 * Handles all merchant-related API operations
 */

import { BaseApiService } from './base/BaseApiService';
import type {
  IMerchant,
  IOnboardingDraft,
  IApprovalRequest,
  IActivityLog,
  IMerchantNote,
  IMerchantStats,
  IMerchantFilters,
  IMerchantListResponse,
  IDocument,
  IDocumentUploadRequest,
  IDocumentUploadResponse,
  IComplianceDashboard,
  IMerchantTransaction,
  IMerchantSettlement,
  IApiKeyPair,
  IBulkActionRequest,
  IBulkActionResponse,
  IMerchantAgreement,
  IBusinessType,
  IBusinessCategory,
  IRateTemplate,
  IComment,
} from '@/types/merchant';

class MerchantApiService extends BaseApiService {
  protected readonly endpoint = 'merchants';
  public readonly serviceName = 'MerchantApiService';

  /**
   * Get list of merchants with filters and pagination
   */
  async getMerchants(filters?: IMerchantFilters): Promise<IMerchantListResponse> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString ? `list/?${queryString}` : 'list/';
    return this.get<IMerchantListResponse>(url);
  }

  /**
   * Get merchant details by ID
   */
  async getMerchantById(id: string): Promise<IMerchant> {
    return this.get<IMerchant>(`${id}/`);
  }

  /**
   * Create new merchant
   */
  async createMerchant(data: Partial<IMerchant>): Promise<IMerchant> {
    return this.post<IMerchant>('create/', data);
  }

  /**
   * Update merchant
   */
  async updateMerchant(id: string, data: Partial<IMerchant>): Promise<IMerchant> {
    return this.put<IMerchant>(`${id}/update/`, data);
  }

  /**
   * Delete merchant
   */
  async deleteMerchant(id: string): Promise<{ success: boolean; message: string }> {
    return this.delete<{ success: boolean; message: string }>(`${id}/`);
  }

  /**
   * Save onboarding draft
   */
  async saveDraft(data: IOnboardingDraft): Promise<IOnboardingDraft> {
    return this.post<IOnboardingDraft>('draft/', data);
  }

  /**
   * Get onboarding draft
   */
  async getDraft(draftId?: string): Promise<IOnboardingDraft | null> {
    const url = draftId ? `draft/${draftId}/` : 'draft/';
    try {
      return await this.get<IOnboardingDraft>(url);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete draft
   */
  async deleteDraft(draftId: string): Promise<void> {
    await this.delete(`draft/${draftId}/`);
  }

  /**
   * Submit merchant for approval
   */
  async submitForApproval(id: string): Promise<IApprovalRequest> {
    return this.post<IApprovalRequest>(`${id}/submit/`, {});
  }

  /**
   * Get pending approvals
   */
  async getPendingApprovals(filters?: {
    page?: number;
    pageSize?: number;
    priority?: string;
    assignedTo?: string;
  }): Promise<{
    approvals: IApprovalRequest[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString ? `approvals/pending/?${queryString}` : 'approvals/pending/';
    return this.get(url);
  }

  /**
   * Get approval details
   */
  async getApprovalDetails(approvalId: string): Promise<IApprovalRequest> {
    return this.get<IApprovalRequest>(`approvals/${approvalId}/`);
  }

  /**
   * Approve merchant
   */
  async approveMerchant(
    id: string,
    data: {
      notes?: string;
      verificationChecklist?: Partial<Record<string, boolean>>;
    }
  ): Promise<{ success: boolean; message: string; merchant: IMerchant }> {
    return this.post(`${id}/approve/`, data);
  }

  /**
   * Reject merchant
   */
  async rejectMerchant(
    id: string,
    data: { reason: string; notes?: string }
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`${id}/reject/`, data);
  }

  /**
   * Request changes for merchant
   */
  async requestChanges(
    id: string,
    data: { changes: string[]; notes?: string }
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`${id}/request-changes/`, data);
  }

  /**
   * Update merchant status
   */
  async updateStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; merchant: IMerchant }> {
    return this.put(`${id}/status/`, { status, reason });
  }

  /**
   * Assign account manager
   */
  async assignAccountManager(
    id: string,
    managerId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`${id}/assign-manager/`, { managerId });
  }

  /**
   * Add tags to merchant
   */
  async addTags(id: string, tags: string[]): Promise<{ success: boolean; message: string }> {
    return this.post(`${id}/tags/add/`, { tags });
  }

  /**
   * Remove tags from merchant
   */
  async removeTags(id: string, tags: string[]): Promise<{ success: boolean; message: string }> {
    return this.post(`${id}/tags/remove/`, { tags });
  }

  /**
   * Upload document
   */
  async uploadDocument(
    merchantId: string,
    request: IDocumentUploadRequest
  ): Promise<IDocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('type', request.type);
    formData.append('category', request.category);
    if (request.expiryDate) {
      formData.append('expiryDate', request.expiryDate);
    }
    if (request.notes) {
      formData.append('notes', request.notes);
    }

    const url = this.buildFullUrl(`${this.endpoint}/${merchantId}/documents/upload/`);
    const headers = this.getRequestHeaders();
    delete headers['Content-Type']; // Let browser set with boundary

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url,
        method: 'POST',
        startTime: Date.now(),
      });
    }

    return await response.json();
  }

  /**
   * Get merchant documents
   */
  async getDocuments(
    merchantId: string,
    filters?: { category?: string; status?: string }
  ): Promise<IDocument[]> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString
      ? `${merchantId}/documents/?${queryString}`
      : `${merchantId}/documents/`;
    return this.get<IDocument[]>(url);
  }

  /**
   * Verify document
   */
  async verifyDocument(
    merchantId: string,
    docId: string,
    data: { status: 'verified' | 'rejected'; notes?: string; rejectionReason?: string }
  ): Promise<{ success: boolean; message: string; document: IDocument }> {
    return this.post(`${merchantId}/documents/${docId}/verify/`, data);
  }

  /**
   * Delete document
   */
  async deleteDocument(
    merchantId: string,
    docId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.delete(`${merchantId}/documents/${docId}/`);
  }

  /**
   * Download document
   */
  async downloadDocument(merchantId: string, docId: string): Promise<void> {
    const url = `${merchantId}/documents/${docId}/download/`;
    await this.downloadFile(url);
  }

  /**
   * Download all documents as ZIP
   */
  async downloadAllDocuments(merchantId: string): Promise<void> {
    const url = `${merchantId}/documents/download-all/`;
    await this.downloadFile(url);
  }

  /**
   * Get compliance dashboard
   */
  async getComplianceDashboard(merchantId: string): Promise<IComplianceDashboard> {
    return this.get<IComplianceDashboard>(`${merchantId}/compliance/`);
  }

  /**
   * Get activity log
   */
  async getActivityLog(
    merchantId: string,
    filters?: { page?: number; pageSize?: number; actionType?: string }
  ): Promise<{ activities: IActivityLog[]; total: number }> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString
      ? `${merchantId}/activity/?${queryString}`
      : `${merchantId}/activity/`;
    return this.get(url);
  }

  /**
   * Get merchant notes
   */
  async getNotes(
    merchantId: string,
    filters?: { category?: string }
  ): Promise<IMerchantNote[]> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString ? `${merchantId}/notes/?${queryString}` : `${merchantId}/notes/`;
    return this.get<IMerchantNote[]>(url);
  }

  /**
   * Add note
   */
  async addNote(
    merchantId: string,
    data: {
      note: string;
      category: string;
      isPinned?: boolean;
      isPrivate?: boolean;
    }
  ): Promise<IMerchantNote> {
    return this.post<IMerchantNote>(`${merchantId}/notes/`, data);
  }

  /**
   * Update note
   */
  async updateNote(
    merchantId: string,
    noteId: string,
    data: Partial<IMerchantNote>
  ): Promise<IMerchantNote> {
    return this.put<IMerchantNote>(`${merchantId}/notes/${noteId}/`, data);
  }

  /**
   * Delete note
   */
  async deleteNote(
    merchantId: string,
    noteId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.delete(`${merchantId}/notes/${noteId}/`);
  }

  /**
   * Generate API keys
   */
  async generateApiKeys(
    merchantId: string,
    environment: 'test' | 'production'
  ): Promise<IApiKeyPair> {
    return this.post<IApiKeyPair>(`${merchantId}/generate-keys/`, { environment });
  }

  /**
   * Get API keys
   */
  async getApiKeys(merchantId: string): Promise<IApiKeyPair[]> {
    return this.get<IApiKeyPair[]>(`${merchantId}/api-keys/`);
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(
    merchantId: string,
    keyId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`${merchantId}/api-keys/${keyId}/revoke/`, {});
  }

  /**
   * Get merchant transactions
   */
  async getTransactions(
    merchantId: string,
    filters?: {
      page?: number;
      pageSize?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{
    transactions: IMerchantTransaction[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString
      ? `${merchantId}/transactions/?${queryString}`
      : `${merchantId}/transactions/`;
    return this.get(url);
  }

  /**
   * Get merchant settlements
   */
  async getSettlements(
    merchantId: string,
    filters?: { page?: number; pageSize?: number; status?: string }
  ): Promise<{
    settlements: IMerchantSettlement[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString
      ? `${merchantId}/settlements/?${queryString}`
      : `${merchantId}/settlements/`;
    return this.get(url);
  }

  /**
   * Get merchant statistics
   */
  async getMerchantStats(): Promise<IMerchantStats> {
    return this.get<IMerchantStats>('stats/');
  }

  /**
   * Bulk actions on merchants
   */
  async bulkAction(request: IBulkActionRequest): Promise<IBulkActionResponse> {
    return this.post<IBulkActionResponse>('bulk-action/', request);
  }

  /**
   * Export merchants to CSV
   */
  async exportMerchants(filters?: IMerchantFilters): Promise<void> {
    const queryString = filters ? this.buildQueryString(filters as any) : '';
    const url = queryString ? `export/?${queryString}` : 'export/';
    await this.downloadFile(url);
  }

  /**
   * Get merchant agreement
   */
  async getAgreement(merchantId: string): Promise<IMerchantAgreement | null> {
    try {
      return await this.get<IMerchantAgreement>(`${merchantId}/agreement/`);
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Generate merchant agreement
   */
  async generateAgreement(
    merchantId: string,
    templateId: string
  ): Promise<IMerchantAgreement> {
    return this.post<IMerchantAgreement>(`${merchantId}/agreement/generate/`, { templateId });
  }

  /**
   * Send agreement for signature
   */
  async sendAgreement(
    merchantId: string,
    agreementId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`${merchantId}/agreement/${agreementId}/send/`, {});
  }

  /**
   * Get business types
   */
  async getBusinessTypes(): Promise<IBusinessType[]> {
    return this.get<IBusinessType[]>('business-types/');
  }

  /**
   * Get business categories
   */
  async getBusinessCategories(parentId?: string): Promise<IBusinessCategory[]> {
    const url = parentId ? `business-categories/?parentId=${parentId}` : 'business-categories/';
    return this.get<IBusinessCategory[]>(url);
  }

  /**
   * Get rate templates
   */
  async getRateTemplates(): Promise<IRateTemplate[]> {
    return this.get<IRateTemplate[]>('rate-templates/');
  }

  /**
   * Add comment to approval
   */
  async addComment(
    approvalId: string,
    comment: string,
    isInternal: boolean = false
  ): Promise<IComment> {
    return this.post<IComment>(`approvals/${approvalId}/comments/`, { comment, isInternal });
  }

  /**
   * Get comments for approval
   */
  async getComments(approvalId: string): Promise<IComment[]> {
    return this.get<IComment[]>(`approvals/${approvalId}/comments/`);
  }

  /**
   * Assign approval to reviewer
   */
  async assignApproval(
    approvalId: string,
    reviewerId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`approvals/${approvalId}/assign/`, { reviewerId });
  }

  /**
   * Update approval priority
   */
  async updateApprovalPriority(
    approvalId: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<{ success: boolean; message: string }> {
    return this.put(`approvals/${approvalId}/priority/`, { priority });
  }

  /**
   * Check merchant code availability
   */
  async checkMerchantCodeAvailability(code: string): Promise<{ available: boolean }> {
    return this.get<{ available: boolean }>(`check-code/?code=${code}`);
  }

  /**
   * Validate GST number
   */
  async validateGST(gstNumber: string): Promise<{ valid: boolean; details?: any }> {
    return this.post<{ valid: boolean; details?: any }>('validate-gst/', { gstNumber });
  }

  /**
   * Validate PAN number
   */
  async validatePAN(panNumber: string): Promise<{ valid: boolean; details?: any }> {
    return this.post<{ valid: boolean; details?: any }>('validate-pan/', { panNumber });
  }

  /**
   * Validate IFSC code
   */
  async validateIFSC(ifscCode: string): Promise<{ valid: boolean; bankDetails?: any }> {
    return this.post<{ valid: boolean; bankDetails?: any }>('validate-ifsc/', { ifscCode });
  }

  /**
   * Test gateway credentials
   */
  async testGatewayCredentials(
    merchantId: string,
    gatewayId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`${merchantId}/gateways/${gatewayId}/test/`, {});
  }

  /**
   * Send notification to merchant
   */
  async sendNotification(
    merchantId: string,
    data: {
      type: 'email' | 'sms' | 'push';
      subject?: string;
      message: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    return this.post(`${merchantId}/notify/`, data);
  }
}

// Export singleton instance
const merchantApiService = new MerchantApiService();
export default merchantApiService;
