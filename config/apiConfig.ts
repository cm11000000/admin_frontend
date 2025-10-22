/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 * Matches Angular environment.ts base URLs exactly
 */

export interface ApiConfig {
  baseURL: string;          // Admin API - matches Angular ADMIN_URL
  reportBaseURL: string;    // Report API - matches Angular ADMIN_URL_NEW
  cobBaseURL: string;       // COB API - matches Angular PRODUCT_COB
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  performance: {
    paginationSize: number;
    cacheTTL: number;
  };
}

export interface ApiEndpoint {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  timeout?: number;
}

/**
 * Get API configuration - Matches Angular environment.ts exactly
 * ADMIN_URL = 'https://adminapi.sabpaisa.in/api/' - For admin operations
 * ADMIN_URL_NEW = 'https://reportapi.sabpaisa.in/' - For reports and master data
 * PRODUCT_COB = 'https://cobawsapi.sabpaisa.in/' - For COB operations
 */
export function getApiConfig(): ApiConfig {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    // Admin API
    baseURL: isProd
      ? (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin/api/')
      : 'https://staging-apis.13-204-100-160.sslip.io/admin/api/',

    // Report API
    reportBaseURL: isProd
      ? (process.env.NEXT_PUBLIC_REPORT_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/report/')
      : 'https://staging-apis.13-204-100-160.sslip.io/report/',

    // COB API (Auth)
    cobBaseURL: process.env.NEXT_PUBLIC_COB_API_URL || 'https://stgcobapi.sabpaisa.in/',

    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    performance: {
      paginationSize: 20,
      cacheTTL: 300000, // 5 minutes
    },
  };
}

/**
 * API Endpoints registry
 */
const endpoints: Record<string, ApiEndpoint> = {
  // Auth endpoints
  login: { url: '/auth/login', method: 'POST' },
  logout: { url: '/auth/logout', method: 'POST' },
  refresh: { url: '/auth/refresh', method: 'POST' },
  forgotPassword: { url: '/auth/forgot-password', method: 'POST' },
  resetPassword: { url: '/auth/reset-password', method: 'POST' },

  // Transaction endpoints
  transactions: { url: '/transactions', method: 'GET' },
  transactionDetail: { url: '/transactions/:id', method: 'GET' },
  createTransaction: { url: '/transactions', method: 'POST' },
  updateTransaction: { url: '/transactions/:id', method: 'PUT' },

  // Client endpoints
  clients: { url: '/clients', method: 'GET' },
  clientDetail: { url: '/clients/:id', method: 'GET' },
  createClient: { url: '/clients', method: 'POST' },
  updateClient: { url: '/clients/:id', method: 'PUT' },

  // Report endpoints
  reports: { url: '/reports', method: 'GET' },
  reportTransactions: { url: '/reports/transactions', method: 'GET' },
  reportSettlements: { url: '/reports/settlements', method: 'GET' },
  reportChargebacks: { url: '/reports/chargebacks', method: 'GET' },
  reportRefunds: { url: '/reports/refunds', method: 'GET' },
  reportAnalytics: { url: '/reports/analytics', method: 'GET' },
  reportExport: { url: '/reports/export', method: 'POST' },

  // Settlement endpoints
  settlements: { url: '/settlements', method: 'GET' },
  settlementDetail: { url: '/settlements/:id', method: 'GET' },

  // User/Admin endpoints
  users: { url: '/users', method: 'GET' },
  userDetail: { url: '/users/:id', method: 'GET' },
  createUser: { url: '/users', method: 'POST' },
  updateUser: { url: '/users/:id', method: 'PUT' },
  deleteUser: { url: '/users/:id', method: 'DELETE' },

  // Configuration endpoints
  configs: { url: '/configs', method: 'GET' },
  configDetail: { url: '/configs/:id', method: 'GET' },
  updateConfig: { url: '/configs/:id', method: 'PUT' },

  // Fee endpoints
  fees: { url: '/fees', method: 'GET' },
  feeDetail: { url: '/fees/:id', method: 'GET' },
  createFee: { url: '/fees', method: 'POST' },
  updateFee: { url: '/fees/:id', method: 'PUT' },
  deleteFee: { url: '/fees/:id', method: 'DELETE' },

  // Zone endpoints
  zones: { url: '/zones', method: 'GET' },
  zoneDetail: { url: '/zones/:id', method: 'GET' },
  createZone: { url: '/zones', method: 'POST' },
  updateZone: { url: '/zones/:id', method: 'PUT' },
  deleteZone: { url: '/zones/:id', method: 'DELETE' },

  // Notification endpoints
  notifications: { url: '/notifications', method: 'GET' },
  markNotificationRead: { url: '/notifications/:id/read', method: 'POST' },

  // Dashboard endpoints
  dashboardStats: { url: '/dashboard/stats', method: 'GET' },
  dashboardCharts: { url: '/dashboard/charts', method: 'GET' },

  // Chargeback endpoints
  chargebacks: { url: '/api/chargebacks/list/', method: 'GET' },
  chargebackDetail: { url: '/api/chargebacks/:id/', method: 'GET' },
  chargebackUploadEvidence: { url: '/api/chargebacks/:id/upload-evidence/', method: 'POST', timeout: 60000 },
  chargebackSubmitEvidence: { url: '/api/chargebacks/:id/submit-evidence/', method: 'POST' },
  chargebackUpdateStatus: { url: '/api/chargebacks/:id/status/', method: 'PUT' },
  chargebackAccept: { url: '/api/chargebacks/:id/accept/', method: 'POST' },
  chargebackContest: { url: '/api/chargebacks/:id/contest/', method: 'POST' },
  chargebackClose: { url: '/api/chargebacks/:id/close/', method: 'POST' },
  chargebackAddNote: { url: '/api/chargebacks/:id/notes/', method: 'POST' },
  chargebackAnalytics: { url: '/api/chargebacks/analytics/', method: 'GET' },
  chargebackExport: { url: '/api/chargebacks/export/', method: 'POST' },
  chargebackWorkflow: { url: '/api/chargebacks/workflow/', method: 'GET' },
  chargebackMove: { url: '/api/chargebacks/:id/move/', method: 'PATCH' },
  chargebackBulkAssign: { url: '/api/chargebacks/bulk/assign/', method: 'POST' },
  chargebackEvidenceZip: { url: '/api/chargebacks/:id/evidence/download/', method: 'GET' },
  chargebackAutoAssignmentRules: { url: '/api/chargebacks/auto-assignment-rules/', method: 'GET' },
  chargebackDeleteEvidence: { url: '/api/chargebacks/:id/evidence/:evidenceId/', method: 'DELETE' },
};

/**
 * Get endpoint configuration by key
 */
export function getEndpoint(key: string): ApiEndpoint | null {
  return endpoints[key] || null;
}

/**
 * Build URL with path parameters
 * @example buildUrl('/users/:id', { id: '123' }) => '/users/123'
 */
export function buildUrl(template: string, params: Record<string, string> = {}): string {
  let url = template;

  // Replace path parameters
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  });

  return url;
}

/**
 * Export all endpoint keys for reference
 */
export const ENDPOINTS = Object.keys(endpoints);

/**
 * Export specific endpoint groups for convenience
 */
export const AUTH_ENDPOINTS = ['login', 'logout', 'refresh', 'forgotPassword', 'resetPassword'];
export const REPORT_ENDPOINTS = ['reports', 'reportTransactions', 'reportSettlements', 'reportChargebacks', 'reportRefunds', 'reportAnalytics', 'reportExport'];
export const CLIENT_ENDPOINTS = ['clients', 'clientDetail', 'createClient', 'updateClient'];
export const TRANSACTION_ENDPOINTS = ['transactions', 'transactionDetail', 'createTransaction', 'updateTransaction'];
export const CHARGEBACK_ENDPOINTS = ['chargebacks', 'chargebackDetail', 'chargebackUploadEvidence', 'chargebackSubmitEvidence', 'chargebackUpdateStatus', 'chargebackAccept', 'chargebackContest', 'chargebackClose', 'chargebackAddNote', 'chargebackAnalytics', 'chargebackExport', 'chargebackWorkflow', 'chargebackMove', 'chargebackBulkAssign', 'chargebackEvidenceZip', 'chargebackAutoAssignmentRules', 'chargebackDeleteEvidence'];

export { endpoints as ApiEndpoint };
