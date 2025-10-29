/**
 * Report Base API Service for reportapi.sabpaisa.in
 * Extends BaseApiService to use Report API base URL
 *
 * All services that need to call reportapi.sabpaisa.in should extend this class
 * Matches Angular ADMIN_URL_NEW (reportBaseURL) = 'https://reportapi.sabpaisa.in/'
 */
import { BaseApiService } from './BaseApiService';
import { getApiConfig } from '@/config/apiConfig';

export abstract class ReportBaseApiService extends BaseApiService {
  constructor() {
    const config = getApiConfig();
    super(config.reportBaseURL);
  }

  // Do not inject Authorization for report endpoints (parity with Angular)
  protected getRequestHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...additionalHeaders,
    };
    return headers;
  }

  // Skip global logout on report 401s; let UI decide
  protected async handleUnauthorized(): Promise<void> {
    console.warn('[ReportBaseApiService] 401 encountered; skipping refresh/global logout');
    return;
  }
}
