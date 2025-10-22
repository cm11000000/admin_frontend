/**
 * Admin Pages API Service
 * Handles API calls for Transaction Limit, Latest Updates, and Access URM pages
 * Matches Angular backend integration patterns
 */

import { cobAPI, adminAPI, reportAPI } from '@/lib/api-client'
import { resolveUserName } from '@/lib/utils'

// ==================== Transaction Limit Types ====================
export interface TransactionLimitData {
  transaction_limit_type?: 'Daily' | 'Monthly'
  transaction_limit_value?: number
  minimum_payment_amount?: number
  maximum_payment_amount?: number
  client_code: string
}

export interface PaymentAmountRange {
  minimum_payment_amount?: number
  maximum_payment_amount?: number
  client_code?: string
}

export interface TransactionLimitResponse {
  transaction_limit_type?: string
  transaction_limit_value?: number
  payment_amount_range?: PaymentAmountRange
  client_code?: string
}

export interface ClientCode {
  clientCode: string
  clientName?: string
  clientId?: number
}

// ==================== Latest Updates Types ====================
export interface InformationBulletin {
  sno?: number
  id?: number
  topic: string
  description: string
  url?: string
  created_at?: string
  updated_at?: string
}

export interface ProductAssignRequest {
  client_code: string
  app_code: string
}

export interface ProductAssignResponse {
  message?: string
  status?: string
}

// ==================== Access URM Types ====================
export interface RateMappingAuth {
  id?: number
  login_id: string
  manage_client: boolean
  manage_payment_mode: boolean
  manage_mapping: boolean
  manage_fee: boolean
  manage_client_configuration: boolean
  manage_feed_forwarded: boolean
}

export interface UserLoginOption {
  id: string
  email: string
}

class AdminPagesApiService {
  // ==================== Helper Methods ====================

  /**
   * Get auth token and api-key from localStorage (matching Angular pattern)
   */
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {}

    const token = localStorage.getItem('accessToken')
    const apiKey = localStorage.getItem('apikey')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (apiKey) {
      headers['api-key'] = apiKey
    }

    return headers
  }

  /**
   * Get username - hardcoded for testing
   */
  private getUserName(): string {
    return resolveUserName()
  }

  // ==================== Transaction Limit APIs ====================

  /**
   * Get client code list
   * Angular: getClientCodeListUSP_Slave()
   * Endpoint: GET /masters/clientDataMaster/
   */
  async getClientCodeList(): Promise<ClientCode[]> {
    const userName = this.getUserName()
    const query = new URLSearchParams()
    if (userName) {
      query.append('login_by', userName)
    }

    const response = await reportAPI.get<ClientCode[]>(`/masters/clientDataMaster/?${query.toString()}`, {
      headers: this.getAuthHeaders()
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch client codes')
    }

    const payload = response.data
    if (Array.isArray(payload)) {
      return payload
    }

    return []
  }

  /**
   * Get API key for a client code
   * Angular: getApiKey(clientCode)
   * Endpoint: GET /api/client-configuration/get-api-key-by-client-code/
   */
  async getApiKey(clientCode: string): Promise<{ api_key: string }> {
    const baseUrl = (process.env.NEXT_PUBLIC_PAYLINK_BASE_URL || (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin')).replace(/\/$/, '')
    const endpoint = `/api/client-configuration/get-api-key-by-client-code/?client_code=${encodeURIComponent(clientCode)}`

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch API key')
    }

    const data = await response.json()

    // Store api key in localStorage for future use
    if (typeof window !== 'undefined' && data.api_key) {
      localStorage.setItem('apikey', data.api_key)
    }

    return data
  }

  /**
   * Get transaction limit for a client
   * Angular: getTransactionLimit(clientCode)
   * Endpoint: GET /api/client-configuration/get-payment-amount-range/
   */
  async getTransactionLimit(clientCode: string): Promise<TransactionLimitResponse> {
    const baseUrl = (process.env.NEXT_PUBLIC_PAYLINK_BASE_URL || (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin')).replace(/\/$/, '')
    const endpoint = `/api/client-configuration/get-payment-amount-range/?client_code=${encodeURIComponent(clientCode)}`

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}))
      throw new Error(detail?.detail || `Failed to fetch transaction limit for client ${clientCode}`)
    }

    return await response.json()
  }

  /**
   * Post/Set transaction limit
   * Angular: postTransactionLimit(body)
   * Endpoint: POST /api/client-configuration/set-payment-amount-range/
   */
  async setTransactionLimit(data: TransactionLimitData): Promise<any> {
    const baseUrl = (process.env.NEXT_PUBLIC_PAYLINK_BASE_URL || (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin')).replace(/\/$/, '')
    const endpoint = '/api/client-configuration/set-payment-amount-range/'

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (response.status === 204) {
      return {}
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || 'Failed to set transaction limit')
    }

    return await response.json().catch(() => ({}))
  }

  /**
   * Set payment amount range (min/max)
   * Angular: setPaymentAmountRange(minAmount, maxAmount, clientCode)
   * Endpoint: POST /api/client-configuration/set-payment-amount-range/
   */
  async setPaymentAmountRange(
    minAmount: number,
    maxAmount: number,
    clientCode: string
  ): Promise<any> {
    const data = {
      minimum_payment_amount: minAmount,
      maximum_payment_amount: maxAmount,
      client_code: clientCode
    }

    return this.setTransactionLimit(data)
  }

  // ==================== Latest Updates APIs ====================

  /**
   * Get latest information bulletins/updates
   * Angular: getLatestUpdatee()
   * Endpoint: GET /get-information-bulletin/?order_by=-id
   */
  async getLatestUpdates(): Promise<InformationBulletin[]> {
    const response = await cobAPI.get(`/get-information-bulletin/?order_by=-id`, {
      headers: this.getAuthHeaders()
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch latest updates')
    }

    const data = response.data as any
    if (Array.isArray(data)) {
      return data
    }

    return []
  }

  async createLatestUpdate(data: InformationBulletin): Promise<any> {
    const response = await cobAPI.post('/create-information-bulletin/', data, {
      headers: this.getAuthHeaders()
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to publish latest update')
    }

    return response.data
  }

  async assignProduct(data: ProductAssignRequest): Promise<ProductAssignResponse> {
    const response = await cobAPI.post('/application-master/assign-merchant/', data, {
      headers: this.getAuthHeaders()
    })

    if (!response.success) {
      throw new Error(response.error || 'Failed to assign product')
    }

    return response.data as ProductAssignResponse
  }

  // ==================== Access URM APIs ====================

  /**
   * Get Rate Mapping Authorization for a user
   * Angular: getRateMappingAuth(url)
   * Endpoint: GET /auth_custom/routes/RateMappingAuth/?login_id={loginId}
   */
  async getRateMappingAuth(loginId: string): Promise<RateMappingAuth | null> {
    const baseUrl = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '')
    const endpoint = `/auth_custom/routes/RateMappingAuth/?login_id=${loginId}`

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch rate mapping authorization')
    }

    const data = await response.json()

    // Angular returns array, take first item if exists
    if (Array.isArray(data) && data.length > 0) {
      return data[0]
    }

    // Empty array means no permissions exist yet
    if (Array.isArray(data) && data.length === 0) {
      return null
    }

    return data
  }

  /**
   * Create Rate Mapping Authorization
   * Angular: postAccess(body)
   * Endpoint: POST /auth_custom/routes/RateMappingAuth/
   */
  async createRateMappingAuth(data: RateMappingAuth): Promise<any> {
    const baseUrl = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '')
    const endpoint = '/auth_custom/routes/RateMappingAuth/'

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to create rate mapping authorization')
    }

    return await response.json()
  }

  /**
   * Update Rate Mapping Authorization
   * Angular: updateAccess(id, body)
   * Endpoint: PATCH /auth_custom/routes/RateMappingAuth/{id}/
   */
  async updateRateMappingAuth(id: number, data: RateMappingAuth): Promise<any> {
    const baseUrl = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '')
    const endpoint = `/auth_custom/routes/RateMappingAuth/${id}/`

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to update rate mapping authorization')
    }

    return await response.json()
  }

  /**
   * Get hardcoded user login options (matching Angular's loginOptions)
   * In production, this should come from an API endpoint
   */
  getUserLoginOptions(): UserLoginOption[] {
    return [
      { id: '9830', email: 'vivek.kumar@sabpaisa.in' },
      { id: '10250', email: 'admin@sabpaisa.in' },
      { id: '26705', email: 'armeen.qayoom@sabpaisa.in' },
      { id: '28003', email: 'vipin.srivastav@sabpaisa.in' },
      { id: '30464', email: 'nishant.kumar@sabpaisa.in' },
      { id: '30639', email: 'amit.tyagi@sabpaisa.in' },
      { id: '30645', email: 'vimal.vishwakarma@sabpaisa.in' },
      { id: '30647', email: 'kanak.kumar@sabpaisa.in' },
      { id: '30715', email: 'mohit.saxena@sabpaisa.in' },
      { id: '30716', email: 'rahul.yadav@sabpaisa.in' }
    ]
  }
}

// Export singleton instance
export const adminPagesApiService = new AdminPagesApiService()
export default adminPagesApiService
