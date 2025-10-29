/**
 * Lightweight fetch client for COB endpoints, isolated from the app's
 * default apiClient (which injects Bearer tokens automatically).
 * This client allows per-request Authorization header (API key) as used by COB.
 * Now using native fetch instead of axios for better bundle size
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
   * Get auth token from localStorage (for protected COB endpoints)
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
   * Get request headers with proper authentication
   * COB endpoints can use either:
   * 1. API Key in Authorization header (for public endpoints like login)
   * 2. Bearer token (for protected endpoints after login)
   */
  private getRequestHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = {
      ...this.config.headers,
      ...additionalHeaders,
    };

    // If Authorization header is already set (e.g., API key passed explicitly), keep it
    if (headers.Authorization) {
      return headers;
    }

    // Otherwise, try to inject Bearer token for authenticated endpoints
    const token = this.getAuthToken();
    if (token) {
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
      console.error('[CobApiClient] No refresh token available');
      return null;
    }

    try {
      console.log('[CobApiClient] Refreshing access token...');

      // Match Angular's exact endpoint and payload structure
      const cobBaseUrl = process.env.NEXT_PUBLIC_COB_API_URL || 'https://cobapi.sabpaisa.in';
      const response = await fetch(`${cobBaseUrl}/auth-service/auth/refresh-token`, {
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
          console.log('[CobApiClient] Token refreshed successfully');
          return newAccessToken;
        } else {
          console.error('[CobApiClient] Invalid token response:', data);
          return null;
        }
      } else {
        console.error('[CobApiClient] Token refresh failed:', response.status);
        return null;
      }
    } catch (error) {
      console.error('[CobApiClient] Token refresh error:', error);
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
        // Refresh failed - clear auth and redirect
        this.isRefreshing = false;
        this.clearAuthAndRedirect();

        const error: any = new Error('Authentication required. Please log in again.');
        error.response = { status: 401 };
        error.__normalizedMessage = 'Authentication required. Please log in again.';
        throw error;
      }
    } catch (error: any) {
      this.isRefreshing = false;
      this.clearAuthAndRedirect();
      throw error;
    }
  }

  /**
   * Clear auth data and redirect to login (matches Angular's logout behavior)
   */
  private clearAuthAndRedirect(): void {
    if (typeof window === 'undefined') return;

    console.log('[CobApiClient] Clearing auth and redirecting to login');

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
      // Get headers with proper authentication
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
          console.log('[CobApiClient] 401 Unauthorized - Attempting token refresh');
          return this.handle401Error(() => this.request<T>(url, options, true));
        }

        // Handle 403 Forbidden (match Angular behavior)
        if (response.status === 403 && !isRetry) {
          console.error('[CobApiClient] 403 Forbidden - Access denied, clearing auth');
          this.clearAuthAndRedirect();
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

export const createCobClient = (): SimpleFetchClient => {
  const base = (process.env.NEXT_PUBLIC_COB_AWS_API_URL || process.env.NEXT_PUBLIC_COB_API_URL || 'https://cobawsapi.sabpaisa.in').replace(/\/$/, '');
  return new SimpleFetchClient({
    baseURL: base,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });
};

export const getCobApiKey = (): string => {
  return process.env.NEXT_PUBLIC_COB_AUTH_KEY || '2044c5ea-d46f-4e9e-8b7a-2aa73ce44e69';
};
