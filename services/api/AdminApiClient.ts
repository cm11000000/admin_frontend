/**
 * Admin API Client for Django backend
 * Handles requests to https://adminapi.sabpaisa.in
 */

interface FetchClientConfig {
  baseURL: string;
  headers: Record<string, string>;
  timeout: number;
}

class SimpleFetchClient {
  private config: FetchClientConfig;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(config: FetchClientConfig) {
    this.config = config;
  }

  /**
   * Get auth token from localStorage (matches Angular implementation)
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Match Angular's token key exactly
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage (matches Angular implementation)
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Match Angular's token key exactly
    return localStorage.getItem('refreshToken');
  }

  /**
   * Get request headers with auto-injected auth token
   */
  private getRequestHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = {
      ...this.config.headers,
      ...additionalHeaders,
    };

    // Auto-inject Bearer token if available and not already set (matching Angular's AuthInterceptor)
    const token = this.getAuthToken();
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Refresh access token using refresh token (matches Angular's AuthService.refreshToken)
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const refresh = this.getRefreshToken();
    if (!refresh) {
      console.error('[AdminApiClient] No refresh token available');
      return null;
    }

    try {
      console.log('[AdminApiClient] Refreshing access token...');

      // Match Angular's exact endpoint and payload structure
      const cobBase = (process.env.NEXT_PUBLIC_COB_AWS_API_URL || process.env.NEXT_PUBLIC_COB_API_URL || 'https://stgcobapi.sabpaisa.in').replace(/\/$/, '');
      const response = await fetch(`${cobBase}/auth-service/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access || data.accessToken;

        if (newAccessToken) {
          // Store new token in localStorage (matching Angular behavior)
          localStorage.setItem('accessToken', newAccessToken);
          console.log('[AdminApiClient] Token refreshed successfully');
          return newAccessToken;
        } else {
          console.error('[AdminApiClient] Invalid token response:', data);
          return null;
        }
      } else {
        console.error('[AdminApiClient] Token refresh failed:', response.status);
        return null;
      }
    } catch (error) {
      console.error('[AdminApiClient] Token refresh error:', error);
      return null;
    }
  }

  /**
   * Notify all subscribers when token is refreshed
   */
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Add subscriber to wait for token refresh
   */
  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Handle 401 error with token refresh (matches Angular's AuthInterceptor)
   */
  private async handle401Error<T>(
    originalRequest: () => Promise<{ data: T; status: number; headers: Headers }>
  ): Promise<{ data: T; status: number; headers: Headers }> {
    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.addRefreshSubscriber((token: string) => {
          originalRequest()
            .then(resolve)
            .catch(reject);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshAccessToken();

      if (newToken) {
        // Notify all queued requests
        this.onRefreshed(newToken);
        this.isRefreshing = false;

        // Retry original request with new token
        return await originalRequest();
      } else {
        // Refresh failed — do NOT clear global auth here.
        // Admin API may use different auth than COB; let caller decide.
        this.isRefreshing = false;
        const error: any = new Error('Authentication failed for Admin API');
        error.response = { status: 401 };
        error.__normalizedMessage = 'Authentication failed for Admin API';
        throw error;
      }
    } catch (error: any) {
      this.isRefreshing = false;
      // Do not clear global auth here; propagate to caller
      throw error;
    }
  }

  /**
   * Clear auth data and redirect to login (matches Angular's logout behavior)
   */
  private clearAuthAndRedirect(): void {
    if (typeof window === 'undefined') return;

    console.log('[AdminApiClient] Clearing auth and redirecting to login');

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');

    // Redirect to login page
    window.location.href = '/login';
  }

  async request<T = any>(
    url: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<{ data: T; status: number; headers: Headers }> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Get headers with auto-injected token
      const headers = this.getRequestHeaders(options.headers as Record<string, string> || {});

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let responseData: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Handle non-ok responses
      if (!response.ok) {
        // Handle 401 Unauthorized with token refresh (matching Angular's AuthInterceptor)
        if (response.status === 401 && !isRetry) {
          console.log('[AdminApiClient] 401 Unauthorized - Attempting token refresh');
          return this.handle401Error(() => this.request<T>(url, options, true));
        }

        // Handle 403 Forbidden — propagate to caller; do not clear auth globally
        if (response.status === 403 && !isRetry) {
          console.error('[AdminApiClient] 403 Forbidden - Access denied');
        }

        const error: any = new Error(responseData?.message || 'Request failed');
        error.response = {
          data: responseData,
          status: response.status,
          headers: response.headers
        };
        error.__normalizedMessage = responseData?.message || responseData?.error || 'Request failed';
        throw error;
      }

      return {
        data: responseData,
        status: response.status,
        headers: response.headers,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error.name === 'AbortError') {
        const timeoutError: any = new Error('Request timeout');
        timeoutError.__normalizedMessage = 'Request timeout';
        throw timeoutError;
      }

      throw error;
    }
  }

  async get<T = any>(url: string, config?: RequestInit): Promise<{ data: T; status: number; headers: Headers }> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config?: RequestInit): Promise<{ data: T; status: number; headers: Headers }> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any, config?: RequestInit): Promise<{ data: T; status: number; headers: Headers }> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(url: string, data?: any, config?: RequestInit): Promise<{ data: T; status: number; headers: Headers }> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string, config?: RequestInit): Promise<{ data: T; status: number; headers: Headers }> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export const createAdminClient = (): SimpleFetchClient => {
  const base = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '');
  return new SimpleFetchClient({
    baseURL: base,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });
};
