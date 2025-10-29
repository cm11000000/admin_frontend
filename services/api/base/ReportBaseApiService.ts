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
}
