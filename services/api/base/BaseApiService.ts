/**
 * Enhanced Base API Service implementing common HTTP operations
 * Following Open/Closed Principle - open for extension, closed for modification
 * Integrated with centralized API configuration
 * Now using native fetch instead of axios for better bundle size
 */
import { IService } from '@/interfaces/base/IService';
import { getApiConfig, getEndpoint, buildUrl, ApiEndpoint } from '@/config/apiConfig';

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Request configuration interface
 */
interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Base API Service abstract class
 * All API services should extend this class
 */
export abstract class BaseApiService implements IService {
  protected baseURL: string;
  protected abstract readonly endpoint: string;
  public abstract readonly serviceName: string;
  protected readonly config = getApiConfig();
  protected defaultHeaders: Record<string, string>;

  constructor(baseURL?: string) {
    // Normalize baseURL to always end with a trailing slash so relative paths resolve correctly
    const rawBase = baseURL || this.config.baseURL;
    this.baseURL = rawBase ? (rawBase.endsWith('/') ? rawBase : `${rawBase}/`) : '/';

    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * Compatibility getter for axios-style API
   * Returns an axios-like interface that wraps native fetch
   */
  protected get axiosInstance() {
    return {
      get: async (url: string, config?: any) => {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        const response = await this.request(fullUrl, 'GET', undefined, config);
        return { data: response, status: 200, headers: {} };
      },
      post: async (url: string, data?: any, config?: any) => {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        const response = await this.request(fullUrl, 'POST', data, config);
        return { data: response, status: 200, headers: {} };
      },
      put: async (url: string, data?: any, config?: any) => {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        const response = await this.request(fullUrl, 'PUT', data, config);
        return { data: response, status: 200, headers: {} };
      },
      patch: async (url: string, data?: any, config?: any) => {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        const response = await this.request(fullUrl, 'PATCH', data, config);
        return { data: response, status: 200, headers: {} };
      },
      delete: async (url: string, config?: any) => {
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
        const response = await this.request(fullUrl, 'DELETE', undefined, config);
        return { data: response, status: 200, headers: {} };
      },
    };
  }

  /**
   * Normalize and join endpoint + path into a relative URL that preserves baseURL path (e.g. /api)
   */
  private joinPath(endpoint: string, path?: string): string {
    const lhs = (endpoint || '').replace(/^\/+|\/+$/g, '');
    const rhs = (path || '').replace(/^\/+/, '');
    const joined = [lhs, rhs].filter(Boolean).join('/');
    return joined; // no leading slash so baseURL path segment is preserved
  }

  /**
   * Build full URL from parts
   */
  protected buildFullUrl(path: string): string {
    // If path is absolute URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Otherwise combine with baseURL
    return `${this.baseURL}${path}`;
  }

  /**
   * Get request headers with auth token
   */
  protected getRequestHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...additionalHeaders };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make fetch request with interceptor-like behavior
   */
  protected async request<T>(
    url: string,
    method: string = 'GET',
    body?: any,
    config?: RequestConfig
  ): Promise<T> {
    let fullUrl = this.buildFullUrl(url);
    // Ensure trailing slash for Admin/Report API hosts
    try {
      const cfg = this.config;
      const u = new URL(fullUrl);
      const adminHost = new URL(cfg.baseURL).host;
      const reportHost = new URL(cfg.reportBaseURL).host;
      if ((u.host === adminHost || u.host === reportHost) && !u.pathname.endsWith('/')) {
        u.pathname = `${u.pathname}/`;
        fullUrl = u.toString();
      }
    } catch {}
    const startTime = Date.now();

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = config?.timeout
      ? setTimeout(() => controller.abort(), config.timeout)
      : setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${method} ${fullUrl}`);
      }

      const headers = this.getRequestHeaders(config?.headers);

      const fetchConfig: RequestInit = {
        method,
        headers,
        signal: config?.signal || controller.signal,
      };

      // Add body for non-GET requests
      if (body && method !== 'GET' && method !== 'HEAD') {
        fetchConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(fullUrl, fetchConfig);

      clearTimeout(timeoutId);

      // Log response time in development
      if (process.env.NODE_ENV === 'development') {
        const duration = Date.now() - startTime;
        console.log(`[API Response] ${method} ${fullUrl} - ${response.status} (${duration}ms)`);
      }

      // Handle non-OK responses
      if (!response.ok) {
        await this.handleErrorResponse(response, { url: fullUrl, method, startTime });
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      // For non-JSON responses, return as text
      const text = await response.text();
      return text as any;

    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error.name === 'AbortError') {
        const apiError = new ApiError(408, 'Request timeout');
        (apiError as any).userMessage = 'The request took too long to complete. Please try again.';
        this.logErrorToService(apiError, { url: fullUrl, method });
        throw apiError;
      }

      // Handle network errors
      if (error.message?.toLowerCase().includes('fetch') ||
          error.message?.toLowerCase().includes('network')) {
        const apiError = new ApiError(0, 'Network error occurred');
        (apiError as any).userMessage = 'Unable to connect to the server. Please check your internet connection.';
        this.logErrorToService(apiError, { url: fullUrl, method });
        throw apiError;
      }

      // Re-throw if already an ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap unknown errors
      const apiError = new ApiError(500, error.message || 'An unexpected error occurred');
      (apiError as any).userMessage = 'Something went wrong. Please try again later.';
      this.logErrorToService(apiError, { url: fullUrl, method });
      throw apiError;
    }
  }

  /**
   * Handle error response
   */
  protected async handleErrorResponse(
    response: Response,
    context: { url: string; method: string; startTime: number }
  ): Promise<never> {
    const status = response.status;
    const duration = Date.now() - context.startTime;

    let data: any;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch {
      data = null;
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[API Error] ${context.method} ${context.url} - ${status} (${duration}ms)`,
        data
      );
    }

    // Handle 401 Unauthorized with token refresh
    if (status === 401) {
      await this.handleUnauthorized();

      // Retry request once with new token
      const token = this.getAuthToken();
      if (token) {
        // Retry logic would go here, but to avoid infinite loops,
        // we'll let the caller handle retry if needed
      }
    }

    // Transform error
    const message = this.extractErrorMessage(data);
    const userFriendlyMessage = this.getUserFriendlyMessage(status, message);

    const apiError = new ApiError(status, message, data);
    (apiError as any).userMessage = userFriendlyMessage;

    // Log to error tracking service
    this.logErrorToService(apiError, { url: context.url, method: context.method });

    throw apiError;
  }

  /**
   * Extract error message from response data
   */
  protected extractErrorMessage(data: any): string {
    // String bodies
    if (typeof data === 'string') {
      return data;
    }

    // Nested error object { error: { message, details, type, ... } }
    if (data && typeof data === 'object' && data.error) {
      const err = data.error;
      if (typeof err === 'string') {
        return err;
      } else if (err && typeof err === 'object') {
        let m: any = err.details ?? err.message ?? err.type ?? err.error;
        // If details is an object, flatten to human-readable lines
        if (m && typeof m === 'object') {
          try {
            const lines: string[] = [];
            for (const [field, val] of Object.entries(m)) {
              if (Array.isArray(val)) lines.push(`${field}: ${val.join(', ')}`);
              else if (val && typeof val === 'object') lines.push(`${field}: ${JSON.stringify(val)}`);
              else if (val != null) lines.push(`${field}: ${String(val)}`);
            }
            m = lines.join('\n');
          } catch {
            m = JSON.stringify(m);
          }
        }
        if (Array.isArray(m)) m = m.join(', ');
        return typeof m === 'string' ? m : JSON.stringify(err);
      }
    }

    // Flat keys { message } or { detail }
    if (data && typeof data === 'object') {
      const maybe = data.message || data.detail;
      if (maybe) return maybe;
    }

    return 'Request failed';
  }

  /**
   * Get auth token from storage
   * Matches Angular implementation - ONLY use 'accessToken' key
   */
  protected getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // Match Angular exactly - use 'accessToken' as the key
      return localStorage.getItem('accessToken') || null;
    }
    return null;
  }

  /**
   * Handle unauthorized response with token refresh (matches Angular's AuthService.refreshToken)
   */
  protected async handleUnauthorized(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Match Angular's token key exactly
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          console.log('[BaseApiService] Refreshing access token...');

          // Match Angular's exact endpoint and payload structure
          const ctrl = new AbortController();
          const tid = setTimeout(() => ctrl.abort(), this.config.timeout);
          const response = await fetch('https://stgcobapi.sabpaisa.in/auth-service/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
            signal: ctrl.signal,
          });
          clearTimeout(tid);

          if (response.ok) {
            const data: any = await response.json();
            const newAccessToken = data.access || data.accessToken;

            if (newAccessToken) {
              // Store new token in localStorage (matching Angular behavior)
              localStorage.setItem('accessToken', newAccessToken);
              console.log('[BaseApiService] Token refreshed successfully');
              return; // Token refreshed successfully
            } else {
              console.error('[BaseApiService] Invalid token response:', data);
            }
          } else {
            console.error('[BaseApiService] Token refresh failed:', response.status);
          }
        } catch (error) {
          console.error('[BaseApiService] Token refresh error:', error);
        }
      }

      // If refresh fails or no refresh token, clear storage and redirect
      console.log('[BaseApiService] Clearing auth and redirecting to login');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
  }

  /**
   * Get user-friendly error message based on status code
   */
  protected getUserFriendlyMessage(status: number, originalMessage: string): string {
    switch (status) {
      case 400:
        return 'The request was invalid. Please check your input and try again.';
      case 401:
        return 'You need to log in to access this resource.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource could not be found.';
      case 408:
        return 'The request took too long to complete. Please try again.';
      case 409:
        return 'This operation conflicts with an existing resource.';
      case 422:
        return originalMessage || 'The provided data is invalid.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'A server error occurred. Our team has been notified.';
      case 502:
        return 'The server is temporarily unavailable. Please try again in a moment.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      case 504:
        return 'The server took too long to respond. Please try again.';
      default:
        if (status >= 400 && status < 500) {
          return originalMessage || 'There was a problem with your request.';
        }
        if (status >= 500) {
          return 'A server error occurred. Please try again later.';
        }
        return originalMessage || 'An unexpected error occurred.';
    }
  }

  /**
   * Log error to external service
   */
  protected logErrorToService(error: ApiError, request: any): void {
    // Only log in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_LOG_ERRORS) {
      return;
    }

    // Prepare error context
    const errorContext = {
      serviceName: this.serviceName,
      endpoint: request.url,
      method: request.method?.toUpperCase(),
      statusCode: error.statusCode,
      message: error.message,
      userMessage: (error as any).userMessage,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).errorTracker) {
      try {
        (window as any).errorTracker.captureException(error, {
          context: errorContext,
          level: error.statusCode >= 500 ? 'error' : 'warning',
        });
      } catch (e) {
        console.error('Failed to log error to tracking service:', e);
      }
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.group('[API Error Details]');
      console.error('Service:', this.serviceName);
      console.error('Endpoint:', request.url);
      console.error('Status:', error.statusCode);
      console.error('Message:', error.message);
      console.error('User Message:', (error as any).userMessage);
      console.error('Full Error:', error);
      console.groupEnd();
    }
  }

  /**
   * Execute request with retry logic
   */
  protected async withRetry<T>(
    request: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await request();
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);

        if (!isRetryable || attempt >= retries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 500;
        const totalDelay = backoffDelay + jitter;

        console.warn(
          `[API Retry] Attempt ${attempt}/${retries} failed, retrying in ${Math.round(totalDelay)}ms...`
        );

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  protected isRetryableError(error: any): boolean {
    if (error instanceof ApiError) {
      const status = error.statusCode;

      // Retry on specific status codes
      if (status === 408) return true; // Request Timeout
      if (status === 429) return true; // Too Many Requests
      if (status === 502) return true; // Bad Gateway
      if (status === 503) return true; // Service Unavailable
      if (status === 504) return true; // Gateway Timeout

      // Don't retry client errors (4xx)
      if (status >= 400 && status < 500) {
        return false;
      }

      // Retry server errors (5xx)
      if (status >= 500) {
        return true;
      }
    }

    // Network errors are retryable
    if (!error.statusCode || error.statusCode === 0) {
      return true;
    }

    return false;
  }

  /**
   * Generic GET request
   */
  protected async get<T>(
    path: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    return this.request<T>(url, 'GET', undefined, config);
  }

  /**
   * Generic GET request with retry
   */
  protected async getWithRetry<T>(
    path: string,
    config?: RequestConfig,
    retries?: number
  ): Promise<T> {
    return this.withRetry(() => this.get<T>(path, config), retries);
  }

  /**
   * Generic POST request
   */
  protected async post<T>(
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    return this.request<T>(url, 'POST', data, config);
  }

  /**
   * Generic POST request with retry
   */
  protected async postWithRetry<T>(
    path: string,
    data?: any,
    config?: RequestConfig,
    retries?: number
  ): Promise<T> {
    return this.withRetry(() => this.post<T>(path, data, config), retries);
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    return this.request<T>(url, 'PUT', data, config);
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T>(
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    return this.request<T>(url, 'PATCH', data, config);
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(
    path: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    return this.request<T>(url, 'DELETE', undefined, config);
  }

  /**
   * Build query string from params object
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    return searchParams.toString();
  }

  /**
   * Normalize list responses to a plain array.
   * Accepts shapes: Array<T> | { results: T[] } | { data: T[] }
   */
  protected normalizeResults<T = any>(resp: any): T[] {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp as T[];
    if (Array.isArray(resp.results)) return resp.results as T[];
    if (Array.isArray(resp.data)) return resp.data as T[];
    return [];
  }

  /**
   * Normalize paginated responses to a canonical shape.
   * Accepts shapes commonly returned by DRF or custom adapters.
   */
  protected normalizePaginated<T = any>(resp: any): {
    results: T[];
    count?: number;
    next?: any;
    previous?: any;
  } {
    if (!resp) return { results: [] };
    if (Array.isArray(resp)) return { results: resp as T[] };
    if (resp.results) return { results: resp.results as T[], count: resp.count, next: resp.next, previous: resp.previous };
    if (resp.data && Array.isArray(resp.data)) return { results: resp.data as T[] };
    return { results: [] };
  }

  /**
   * Get endpoint configuration with parameters
   */
  protected getEndpointConfig(endpointKey: string, params: Record<string, string> = {}): string {
    const endpointConfig = getEndpoint(endpointKey);
    if (!endpointConfig) {
      throw new ApiError(500, `Endpoint configuration not found: ${endpointKey}`);
    }
    return buildUrl(endpointConfig.url, params);
  }

  /**
   * Make request with endpoint configuration
   */
  protected async requestWithConfig<T>(
    endpointKey: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: any,
    params: Record<string, string> = {},
    config?: RequestConfig
  ): Promise<T> {
    const endpointConfig = getEndpoint(endpointKey);
    if (!endpointConfig) {
      throw new ApiError(500, `Endpoint configuration not found: ${endpointKey}`);
    }

    const url = buildUrl(endpointConfig.url, params);
    const requestConfig: RequestConfig = {
      timeout: endpointConfig.timeout || this.config.timeout,
      ...config,
    };

    return this.request<T>(url, method, data, requestConfig);
  }

  /**
   * Upload file with progress tracking
   */
  protected async uploadFile<T>(
    endpointKey: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const endpointConfig = getEndpoint(endpointKey);
    if (!endpointConfig) {
      throw new ApiError(500, `Endpoint configuration not found: ${endpointKey}`);
    }

    let fullUrl = this.buildFullUrl(endpointConfig.url);
    try {
      const cfg = this.config;
      const u = new URL(fullUrl);
      const adminHost = new URL(cfg.baseURL).host;
      const reportHost = new URL(cfg.reportBaseURL).host;
      if ((u.host === adminHost || u.host === reportHost) && !u.pathname.endsWith('/')) {
        u.pathname = `${u.pathname}/`;
        fullUrl = u.toString();
      }
    } catch {}
    const headers = this.getRequestHeaders();
    // Remove Content-Type to let browser set it with boundary
    delete headers['Content-Type'];

    // Note: Fetch API doesn't support upload progress natively
    // For progress tracking, you'd need to use XMLHttpRequest or a library
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), this.config.timeout);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
      signal: ctrl.signal,
    });
    clearTimeout(tid);

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'POST',
        startTime: Date.now()
      });
    }

    return await response.json();
  }

  /**
   * Download file with progress tracking
   */
  protected async downloadFile(
    endpointKey: string,
    params: Record<string, string> = {},
    filename?: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const url = this.getEndpointConfig(endpointKey, params);
    let fullUrl = this.buildFullUrl(url);
    try {
      const cfg = this.config;
      const u = new URL(fullUrl);
      const adminHost = new URL(cfg.baseURL).host;
      const reportHost = new URL(cfg.reportBaseURL).host;
      if ((u.host === adminHost || u.host === reportHost) && !u.pathname.endsWith('/')) {
        u.pathname = `${u.pathname}/`;
        fullUrl = u.toString();
      }
    } catch {}
    const headers = this.getRequestHeaders();

    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), this.config.timeout);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      signal: ctrl.signal,
    });
    clearTimeout(tid);

    if (!response.ok) {
      await this.handleErrorResponse(response, {
        url: fullUrl,
        method: 'GET',
        startTime: Date.now()
      });
    }

    // Create download link
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Paginated request helper
   */
  protected async getPaginated<T>(
    path: string,
    page: number = 1,
    pageSize: number = this.config.performance.paginationSize,
    filters?: Record<string, any>
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters,
    };

    const queryString = this.buildQueryString(params);
    const url = `${this.endpoint}${path}${queryString ? `?${queryString}` : ''}`;

    return this.get(url);
  }

  /**
   * Initialize service (can be overridden)
   */
  public async initialize(): Promise<void> {
    // Override in derived classes if needed
  }

  /**
   * Dispose service (can be overridden)
   */
  public async dispose(): Promise<void> {
    // Override in derived classes if needed
  }
}
