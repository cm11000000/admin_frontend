/**
 * API Service - Wrapper for HTTP requests
 * Used by ReportApiService and other API services
 */

import { reportAPI } from '@/lib/api-client';

class ApiService {
  /**
   * GET request
   */
  static async get<T = any>(endpoint: string): Promise<T> {
    const response = await reportAPI.get(endpoint);

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data as T;
  }

  /**
   * POST request
   */
  static async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await reportAPI.post(endpoint, data);

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data as T;
  }

  /**
   * PUT request
   */
  static async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await reportAPI.put(endpoint, data);

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data as T;
  }

  /**
   * PATCH request
   */
  static async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await reportAPI.patch(endpoint, data);

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data as T;
  }

  /**
   * DELETE request
   */
  static async delete<T = any>(endpoint: string): Promise<T> {
    const response = await reportAPI.delete(endpoint);

    if (!response.success) {
      throw new Error(response.error || 'Request failed');
    }

    return response.data as T;
  }
}

export default ApiService;
