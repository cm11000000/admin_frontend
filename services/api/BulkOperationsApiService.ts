/**
 * Bulk Operations API Service
 * Handle all bulk operations, export, and import API calls
 */

import ApiService from './ApiService';
import type {
  IBulkJob,
  IBulkJobProgress,
  IExportConfig,
  IScheduledExport,
  IImportResult,
  IUploadCSVRequest,
  IUploadCSVResponse,
  IValidateDataRequest,
  IValidateDataResponse,
  IProcessBulkActionRequest,
  IProcessBulkActionResponse,
  ICreateExportRequest,
  ICreateExportResponse,
  ICreateScheduledExportRequest,
  ICreateScheduledExportResponse,
  IImportDataRequest,
  IImportDataResponse,
  IBulkActionTemplate,
  IExportTemplate,
  IExportHistory,
  IExportExecution,
  IMigrationConfig,
  IMigrationResult,
} from '@/types/bulk';

class BulkOperationsApiService {
  private static readonly BASE_PATH = '/api/bulk';
  private static readonly EXPORT_PATH = '/api/export';
  private static readonly IMPORT_PATH = '/api/import';
  private static readonly MIGRATION_PATH = '/api/migration';

  /**
   * Upload CSV file for bulk operations
   */
  static async uploadCSV(
    file: File,
    type: string,
    onProgress?: (progress: number) => void
  ): Promise<IUploadCSVResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return ApiService.post<IUploadCSVResponse>(
      `${this.BASE_PATH}/upload`,
      formData
    );
  }

  /**
   * Validate uploaded data
   */
  static async validateData(
    request: IValidateDataRequest
  ): Promise<IValidateDataResponse> {
    return ApiService.post<IValidateDataResponse>(
      `${this.BASE_PATH}/validate`,
      request
    );
  }

  /**
   * Process bulk action
   */
  static async processBulkAction(
    request: IProcessBulkActionRequest
  ): Promise<IProcessBulkActionResponse> {
    return ApiService.post<IProcessBulkActionResponse>(
      `${this.BASE_PATH}/process`,
      request
    );
  }

  /**
   * Get job progress
   */
  static async getJobProgress(jobId: string): Promise<IBulkJobProgress> {
    return ApiService.get<IBulkJobProgress>(
      `${this.BASE_PATH}/progress/${jobId}`
    );
  }

  /**
   * Get job status
   */
  static async getJobStatus(jobId: string): Promise<IBulkJob> {
    return ApiService.get<IBulkJob>(`${this.BASE_PATH}/status/${jobId}`);
  }

  /**
   * Pause job
   */
  static async pauseJob(jobId: string): Promise<{ success: boolean }> {
    return ApiService.post<{ success: boolean }>(
      `${this.BASE_PATH}/${jobId}/pause`
    );
  }

  /**
   * Resume job
   */
  static async resumeJob(jobId: string): Promise<{ success: boolean }> {
    return ApiService.post<{ success: boolean }>(
      `${this.BASE_PATH}/${jobId}/resume`
    );
  }

  /**
   * Cancel job
   */
  static async cancelJob(jobId: string): Promise<{ success: boolean }> {
    return ApiService.post<{ success: boolean }>(
      `${this.BASE_PATH}/${jobId}/cancel`
    );
  }

  /**
   * Download job results
   */
  static async downloadResults(jobId: string): Promise<Blob> {
    return ApiService.get<Blob>(`${this.BASE_PATH}/${jobId}/results`);
  }

  /**
   * Download error report
   */
  static async downloadErrorReport(jobId: string): Promise<Blob> {
    return ApiService.get<Blob>(`${this.BASE_PATH}/${jobId}/errors`);
  }

  /**
   * Get all active jobs
   */
  static async getActiveJobs(): Promise<IBulkJob[]> {
    return ApiService.get<IBulkJob[]>(`${this.BASE_PATH}/jobs/active`);
  }

  /**
   * Get job history
   */
  static async getJobHistory(
    limit?: number,
    offset?: number
  ): Promise<{ jobs: IBulkJob[]; total: number }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    return ApiService.get<{ jobs: IBulkJob[]; total: number }>(
      `${this.BASE_PATH}/jobs/history?${params.toString()}`
    );
  }

  /**
   * Get bulk action templates
   */
  static async getTemplates(type?: string): Promise<IBulkActionTemplate[]> {
    const params = type ? `?type=${type}` : '';
    return ApiService.get<IBulkActionTemplate[]>(
      `${this.BASE_PATH}/templates${params}`
    );
  }

  /**
   * Download template
   */
  static async downloadTemplate(templateId: string): Promise<Blob> {
    return ApiService.get<Blob>(`${this.BASE_PATH}/templates/${templateId}/download`);
  }

  // ============================================
  // EXPORT OPERATIONS
  // ============================================

  /**
   * Create export job
   */
  static async createExport(
    request: ICreateExportRequest
  ): Promise<ICreateExportResponse> {
    return ApiService.post<ICreateExportResponse>(
      `${this.EXPORT_PATH}/create`,
      request
    );
  }

  /**
   * Get export status
   */
  static async getExportStatus(jobId: string): Promise<IBulkJob> {
    return ApiService.get<IBulkJob>(`${this.EXPORT_PATH}/${jobId}/status`);
  }

  /**
   * Download export file
   */
  static async downloadExport(jobId: string): Promise<Blob> {
    return ApiService.get<Blob>(`${this.EXPORT_PATH}/${jobId}/download`);
  }

  /**
   * Get export history
   */
  static async getExportHistory(
    limit?: number,
    offset?: number
  ): Promise<{ exports: IExportHistory[]; total: number }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    return ApiService.get<{ exports: IExportHistory[]; total: number }>(
      `${this.EXPORT_PATH}/history?${params.toString()}`
    );
  }

  /**
   * Get export templates
   */
  static async getExportTemplates(): Promise<IExportTemplate[]> {
    return ApiService.get<IExportTemplate[]>(`${this.EXPORT_PATH}/templates`);
  }

  /**
   * Save export as template
   */
  static async saveExportTemplate(
    template: Partial<IExportTemplate>
  ): Promise<IExportTemplate> {
    return ApiService.post<IExportTemplate>(
      `${this.EXPORT_PATH}/templates`,
      template
    );
  }

  /**
   * Delete export template
   */
  static async deleteExportTemplate(templateId: string): Promise<{ success: boolean }> {
    return ApiService.delete<{ success: boolean }>(
      `${this.EXPORT_PATH}/templates/${templateId}`
    );
  }

  // ============================================
  // SCHEDULED EXPORT OPERATIONS
  // ============================================

  /**
   * Create scheduled export
   */
  static async createScheduledExport(
    request: ICreateScheduledExportRequest
  ): Promise<ICreateScheduledExportResponse> {
    return ApiService.post<ICreateScheduledExportResponse>(
      `${this.EXPORT_PATH}/schedule`,
      request
    );
  }

  /**
   * Get all scheduled exports
   */
  static async getScheduledExports(): Promise<IScheduledExport[]> {
    return ApiService.get<IScheduledExport[]>(`${this.EXPORT_PATH}/schedule`);
  }

  /**
   * Get scheduled export by ID
   */
  static async getScheduledExport(id: string): Promise<IScheduledExport> {
    return ApiService.get<IScheduledExport>(`${this.EXPORT_PATH}/schedule/${id}`);
  }

  /**
   * Update scheduled export
   */
  static async updateScheduledExport(
    id: string,
    data: Partial<IScheduledExport>
  ): Promise<IScheduledExport> {
    return ApiService.put<IScheduledExport>(
      `${this.EXPORT_PATH}/schedule/${id}`,
      data
    );
  }

  /**
   * Delete scheduled export
   */
  static async deleteScheduledExport(id: string): Promise<{ success: boolean }> {
    return ApiService.delete<{ success: boolean }>(
      `${this.EXPORT_PATH}/schedule/${id}`
    );
  }

  /**
   * Enable/disable scheduled export
   */
  static async toggleScheduledExport(
    id: string,
    enabled: boolean
  ): Promise<{ success: boolean }> {
    return ApiService.patch<{ success: boolean }>(
      `${this.EXPORT_PATH}/schedule/${id}/toggle`,
      { enabled }
    );
  }

  /**
   * Run scheduled export now
   */
  static async runScheduledExportNow(id: string): Promise<{ jobId: string }> {
    return ApiService.post<{ jobId: string }>(
      `${this.EXPORT_PATH}/schedule/${id}/run`
    );
  }

  /**
   * Get scheduled export execution history
   */
  static async getScheduledExportHistory(
    id: string,
    limit?: number
  ): Promise<IExportExecution[]> {
    const params = limit ? `?limit=${limit}` : '';
    return ApiService.get<IExportExecution[]>(
      `${this.EXPORT_PATH}/schedule/${id}/history${params}`
    );
  }

  // ============================================
  // IMPORT OPERATIONS
  // ============================================

  /**
   * Process import
   */
  static async processImport(
    request: IImportDataRequest
  ): Promise<IImportDataResponse> {
    return ApiService.post<IImportDataResponse>(
      `${this.IMPORT_PATH}/process`,
      request
    );
  }

  /**
   * Get import result
   */
  static async getImportResult(jobId: string): Promise<IImportResult> {
    return ApiService.get<IImportResult>(`${this.IMPORT_PATH}/${jobId}/result`);
  }

  /**
   * Download import success report
   */
  static async downloadImportSuccessReport(jobId: string): Promise<Blob> {
    return ApiService.get<Blob>(`${this.IMPORT_PATH}/${jobId}/success`);
  }

  /**
   * Download import error report
   */
  static async downloadImportErrorReport(jobId: string): Promise<Blob> {
    return ApiService.get<Blob>(`${this.IMPORT_PATH}/${jobId}/errors`);
  }

  /**
   * Retry failed import items
   */
  static async retryFailedImport(
    jobId: string
  ): Promise<{ newJobId: string }> {
    return ApiService.post<{ newJobId: string }>(
      `${this.IMPORT_PATH}/${jobId}/retry`
    );
  }

  /**
   * Get import templates
   */
  static async getImportTemplates(
    importType?: string
  ): Promise<IBulkActionTemplate[]> {
    const params = importType ? `?type=${importType}` : '';
    return ApiService.get<IBulkActionTemplate[]>(
      `${this.IMPORT_PATH}/templates${params}`
    );
  }

  // ============================================
  // MIGRATION OPERATIONS
  // ============================================

  /**
   * Create migration configuration
   */
  static async createMigration(
    config: Partial<IMigrationConfig>
  ): Promise<IMigrationConfig> {
    return ApiService.post<IMigrationConfig>(
      `${this.MIGRATION_PATH}/config`,
      config
    );
  }

  /**
   * Get all migration configurations
   */
  static async getMigrations(): Promise<IMigrationConfig[]> {
    return ApiService.get<IMigrationConfig[]>(`${this.MIGRATION_PATH}/config`);
  }

  /**
   * Get migration configuration by ID
   */
  static async getMigration(id: string): Promise<IMigrationConfig> {
    return ApiService.get<IMigrationConfig>(
      `${this.MIGRATION_PATH}/config/${id}`
    );
  }

  /**
   * Update migration configuration
   */
  static async updateMigration(
    id: string,
    config: Partial<IMigrationConfig>
  ): Promise<IMigrationConfig> {
    return ApiService.put<IMigrationConfig>(
      `${this.MIGRATION_PATH}/config/${id}`,
      config
    );
  }

  /**
   * Delete migration configuration
   */
  static async deleteMigration(id: string): Promise<{ success: boolean }> {
    return ApiService.delete<{ success: boolean }>(
      `${this.MIGRATION_PATH}/config/${id}`
    );
  }

  /**
   * Execute migration
   */
  static async executeMigration(
    configId: string,
    dryRun: boolean = false
  ): Promise<{ jobId: string }> {
    return ApiService.post<{ jobId: string }>(
      `${this.MIGRATION_PATH}/execute`,
      { configId, dryRun }
    );
  }

  /**
   * Get migration result
   */
  static async getMigrationResult(jobId: string): Promise<IMigrationResult> {
    return ApiService.get<IMigrationResult>(
      `${this.MIGRATION_PATH}/${jobId}/result`
    );
  }

  /**
   * Rollback migration
   */
  static async rollbackMigration(
    jobId: string
  ): Promise<{ success: boolean; rollbackJobId: string }> {
    return ApiService.post<{ success: boolean; rollbackJobId: string }>(
      `${this.MIGRATION_PATH}/${jobId}/rollback`
    );
  }

  /**
   * Get migration history
   */
  static async getMigrationHistory(): Promise<IMigrationResult[]> {
    return ApiService.get<IMigrationResult[]>(
      `${this.MIGRATION_PATH}/history`
    );
  }

  /**
   * Run data integrity checks
   */
  static async runIntegrityChecks(
    jobId: string
  ): Promise<{ passed: boolean; checks: any[] }> {
    return ApiService.post<{ passed: boolean; checks: any[] }>(
      `${this.MIGRATION_PATH}/${jobId}/integrity-check`
    );
  }

  /**
   * Preview transformation
   */
  static async previewTransformation(
    configId: string,
    sampleData: any[]
  ): Promise<{ transformed: any[] }> {
    return ApiService.post<{ transformed: any[] }>(
      `${this.MIGRATION_PATH}/preview`,
      { configId, sampleData }
    );
  }
}

export default BulkOperationsApiService;
