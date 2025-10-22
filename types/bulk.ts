/**
 * Bulk Operations TypeScript Interfaces
 * Comprehensive types for bulk operations, export, and import features
 */

export type BulkJobType = 'refund' | 'update' | 'export' | 'import' | 'delete' | 'tag';

export type BulkJobStatus =
  | 'queued'
  | 'validating'
  | 'processing'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export type DeliveryMethod = 'download' | 'email' | 'ftp' | 's3';

export type ImportType =
  | 'merchant_onboarding'
  | 'rate_configuration'
  | 'user_creation'
  | 'payment_link'
  | 'settlement_adjustment';

export interface IBulkJob {
  id: string;
  type: BulkJobType;
  fileName: string;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  skippedCount?: number;
  status: BulkJobStatus;
  progress: number; // 0-100
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number; // seconds
  resultsUrl?: string;
  errorReportUrl?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface IBulkJobProgress {
  jobId: string;
  progress: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  currentBatch?: number;
  totalBatches?: number;
  status: BulkJobStatus;
  message?: string;
  estimatedTimeRemaining?: number;
}

export interface IExportConfig {
  id: string;
  name: string;
  dataType: string;
  columns: string[];
  filters: IExportFilters;
  format: ExportFormat;
  splitBy?: string;
  compress: boolean;
  encrypt: boolean;
  encryptionPassword?: string;
  schedule?: string; // cron expression
  deliveryMethod: DeliveryMethod;
  recipients?: string[];
  ftpConfig?: IFTPConfig;
  s3Config?: IS3Config;
  isTemplate: boolean;
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

export interface IExportFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  status?: string[];
  gateway?: string[];
  amount?: {
    min?: number;
    max?: number;
  };
  merchantId?: string;
  clientId?: string[];
  customFilters?: Record<string, any>;
}

export interface IFTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  path: string;
  secure: boolean;
}

export interface IS3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  path: string;
}

export interface IScheduledExport {
  id: string;
  exportConfigId: string;
  exportConfig: IExportConfig;
  schedule: string; // cron expression
  timezone: string;
  enabled: boolean;
  nextRunTime: string;
  lastRunTime?: string;
  lastRunStatus?: BulkJobStatus;
  lastRunFileSize?: number;
  lastRunRowCount?: number;
  executionHistory: IExportExecution[];
  createdAt: string;
  updatedAt: string;
}

export interface IExportExecution {
  id: string;
  scheduledExportId: string;
  startTime: string;
  endTime?: string;
  status: BulkJobStatus;
  fileSize?: number;
  rowCount?: number;
  downloadUrl?: string;
  errorMessage?: string;
}

export interface IImportResult {
  jobId: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  warnings: IImportWarning[];
  errors: IImportError[];
  successFileUrl?: string;
  errorFileUrl?: string;
  processingTimeMs: number;
}

export interface IImportError {
  row: number;
  column: string;
  error: string;
  value: any;
  severity: 'error' | 'warning';
}

export interface IImportWarning {
  row: number;
  column: string;
  warning: string;
  value: any;
}

export interface IColumnMapping {
  csvColumn: string;
  systemField: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone';
  format?: string;
  defaultValue?: any;
  transform?: string; // transformation rule
}

export interface IValidationResult {
  isValid: boolean;
  errors: IImportError[];
  warnings: IImportWarning[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
}

export interface IFileUploadProgress {
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface IBulkActionTemplate {
  id: string;
  type: BulkJobType;
  name: string;
  description: string;
  requiredColumns: string[];
  optionalColumns: string[];
  sampleData: Record<string, any>[];
  validationRules: IValidationRule[];
  templateUrl: string;
}

export interface IValidationRule {
  field: string;
  rule: 'required' | 'email' | 'phone' | 'number' | 'date' | 'regex' | 'min' | 'max' | 'in' | 'custom';
  value?: any;
  message: string;
}

export interface IMigrationConfig {
  id: string;
  name: string;
  sourceSystem: string;
  targetSystem: string;
  fieldMappings: IFieldMapping[];
  transformationRules: ITransformationRule[];
  dryRun: boolean;
  skipDuplicates: boolean;
  rollbackOnError: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  defaultValue?: any;
}

export interface ITransformationRule {
  field: string;
  type: 'regex' | 'formula' | 'conditional' | 'lookup';
  rule: string;
  params?: Record<string, any>;
}

export interface IMigrationResult {
  id: string;
  configId: string;
  status: BulkJobStatus;
  totalRecords: number;
  migratedRecords: number;
  failedRecords: number;
  skippedRecords: number;
  startTime: string;
  endTime?: string;
  errors: IImportError[];
  dryRun: boolean;
  rollbackAvailable: boolean;
  integrityChecksPassed: boolean;
}

export interface IDataPreview {
  headers: string[];
  rows: any[][];
  totalRows: number;
  previewRows: number;
  detectedTypes: Record<string, string>;
}

export interface IBatchProcessingConfig {
  batchSize: number;
  concurrentBatches: number;
  delayBetweenBatches: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

export interface IExportTemplate {
  id: string;
  name: string;
  description: string;
  dataType: string;
  config: Partial<IExportConfig>;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface IExportHistory {
  id: string;
  configId?: string;
  configName: string;
  format: ExportFormat;
  fileSize: number;
  rowCount: number;
  status: BulkJobStatus;
  downloadUrl: string;
  expiresAt: string;
  createdAt: string;
  downloadCount: number;
}

// API Request/Response Types

export interface IUploadCSVRequest {
  file: File;
  type: BulkJobType;
  metadata?: Record<string, any>;
}

export interface IUploadCSVResponse {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalRows: number;
  preview: IDataPreview;
}

export interface IValidateDataRequest {
  uploadId: string;
  columnMappings: IColumnMapping[];
  validationRules?: IValidationRule[];
}

export interface IValidateDataResponse {
  validationId: string;
  result: IValidationResult;
}

export interface IProcessBulkActionRequest {
  uploadId: string;
  validationId: string;
  actionType: BulkJobType;
  columnMappings: IColumnMapping[];
  batchConfig?: IBatchProcessingConfig;
  options?: Record<string, any>;
}

export interface IProcessBulkActionResponse {
  jobId: string;
  status: BulkJobStatus;
  estimatedDuration?: number; // seconds
}

export interface ICreateExportRequest {
  config: Partial<IExportConfig>;
  executeNow: boolean;
}

export interface ICreateExportResponse {
  jobId: string;
  status: BulkJobStatus;
  estimatedDuration?: number;
}

export interface ICreateScheduledExportRequest {
  exportConfig: Partial<IExportConfig>;
  schedule: string; // cron expression
  timezone: string;
  enabled: boolean;
}

export interface ICreateScheduledExportResponse {
  scheduledExportId: string;
  nextRunTime: string;
}

export interface IImportDataRequest {
  uploadId: string;
  validationId: string;
  importType: ImportType;
  columnMappings: IColumnMapping[];
  options?: {
    partialSuccess?: boolean;
    skipDuplicates?: boolean;
    rollbackOnError?: boolean;
  };
}

export interface IImportDataResponse {
  jobId: string;
  result: IImportResult;
}
