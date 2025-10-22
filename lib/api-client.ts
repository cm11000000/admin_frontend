/**
 * API Client for making HTTP requests
 * Centralized configuration for all API calls
 */

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  method?: HTTPMethod;
  headers?: HeadersInit;
  body?: any;
  timeout?: number;
}

interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private timeout: number;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Remove authorization token
   */
  removeAuthToken() {
    const headers = { ...this.defaultHeaders };
    delete (headers as any).Authorization;
    this.defaultHeaders = headers;
  }

  /**
   * Get auth token from localStorage (matches Angular implementation)
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    // Match Angular's token key exactly
    return localStorage.getItem("accessToken");
  }

  /**
   * Get request headers with auto-injected auth token
   */
  private getRequestHeaders(additionalHeaders: Record<string, string> = {}): HeadersInit {
    const headers = { ...this.defaultHeaders, ...additionalHeaders };

    // Auto-inject Bearer token if available (matching Angular's AuthInterceptor)
    const token = this.getAuthToken();
    if (token && !headers.Authorization) {
      (headers as any).Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Refresh access token using refresh token (matches Angular implementation)
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;

    const refreshToken = localStorage.getItem("refreshToken") || localStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.error("[API Client] No refresh token available");
      return null;
    }

    try {
      const response = await fetch("https://stgcobapi.sabpaisa.in/auth-service/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access || data.accessToken;

        if (newAccessToken) {
          // Store new token in localStorage (matching Angular behavior)
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("access_token", newAccessToken);

          console.log("[API Client] Token refreshed successfully");
          return newAccessToken;
        }
      }

      console.error("[API Client] Token refresh failed:", response.status);
      return null;
    } catch (error) {
      console.error("[API Client] Token refresh error:", error);
      return null;
    }
  }

  /**
   * Handle 401 Unauthorized with token refresh (matches Angular's AuthInterceptor)
   */
  private async handle401Error<T>(
    originalRequest: () => Promise<APIResponse<T>>
  ): Promise<APIResponse<T>> {
    if (this.isRefreshing) {
      // Wait for token refresh to complete
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          originalRequest().then(resolve);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshAccessToken();

      if (newToken) {
        // Notify all subscribers
        this.refreshSubscribers.forEach((callback) => callback(newToken));
        this.refreshSubscribers = [];
        this.isRefreshing = false;

        // Retry original request with new token
        return await originalRequest();
      } else {
        // Refresh failed - redirect to login
        this.isRefreshing = false;
        this.clearAuthAndRedirect();

        return {
          status: 401,
          success: false,
          error: "Authentication required. Please log in again.",
        };
      }
    } catch (error: any) {
      this.isRefreshing = false;
      this.clearAuthAndRedirect();

      return {
        status: 401,
        success: false,
        error: error.message || "Authentication failed",
      };
    }
  }

  /**
   * Clear auth data and redirect to login (matches Angular's logout behavior)
   */
  private clearAuthAndRedirect(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");

    // Redirect to login page
    window.location.href = "/login";
  }

  /**
   * Make HTTP request with timeout
   */
  private async request<T = any>(
    endpoint: string,
    config: RequestConfig = {},
    isRetry: boolean = false
  ): Promise<APIResponse<T>> {
    const { method = "GET", headers = {}, body, timeout = this.timeout } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Check if endpoint is already a full URL
      const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');

      // Normalize base URL and endpoint to prevent double slashes
      let url: string;
      if (isFullUrl) {
        url = endpoint;
      } else {
        // Remove trailing slash from baseURL and leading slash from endpoint for clean joining
        const normalizedBase = this.baseURL.replace(/\/$/, '');
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        url = `${normalizedBase}${normalizedEndpoint}`;
      }

      const requestHeaders = this.getRequestHeaders(headers as Record<string, string>);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      // Handle 401 Unauthorized with token refresh (matching Angular's AuthInterceptor)
      if (response.status === 401 && !isRetry) {
        console.log("[API Client] 401 Unauthorized - Attempting token refresh");
        return this.handle401Error(() => this.request<T>(endpoint, config, true));
      }

      // Handle 403 Forbidden (match Angular behavior)
      if (response.status === 403 && !isRetry) {
        console.error("[API Client] 403 Forbidden - Access denied, clearing auth");
        this.clearAuthAndRedirect();
      }

      return {
        data: data,
        status: response.status,
        success: response.ok,
        error: !response.ok ? data?.message || data?.error || "Request failed" : undefined,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        return {
          status: 408,
          success: false,
          error: "Request timeout",
        };
      }

      return {
        status: 0,
        success: false,
        error: error.message || "Network error",
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "POST", body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "PUT", body });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    config?: RequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "PATCH", body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// API Client instances
const __adminBase = (process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin')
  : 'https://staging-apis.13-204-100-160.sslip.io/admin');
export const adminAPI = new APIClient(__adminBase);

const __reportBase = (process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_REPORT_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/report')
  : 'https://staging-apis.13-204-100-160.sslip.io/report');
export const reportAPI = new APIClient(__reportBase);

export const cobAPI = new APIClient(
  process.env.NEXT_PUBLIC_COB_API_URL || "https://stgcobapi.sabpaisa.in"
);

// Transaction History DB service (Angular's txnHistoryDbsUrl)
const __txnHistoryBase = (process.env.NODE_ENV === 'production'
  ? (process.env.NEXT_PUBLIC_TXN_HISTORY_DBS_URL || 'https://staging-apis.13-204-100-160.sslip.io/report')
  : 'https://staging-apis.13-204-100-160.sslip.io/report');
export const txnHistoryAPI = new APIClient(__txnHistoryBase);

// Dev-only base URL log to verify no production hosts are used
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[API BASES]', { admin: __adminBase, report: __reportBase, txnHistory: __txnHistoryBase, cob: process.env.NEXT_PUBLIC_COB_API_URL || 'https://stgcobapi.sabpaisa.in' })
}

export default APIClient;
