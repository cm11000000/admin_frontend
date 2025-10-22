import { adminAPI as apiClient } from '@/lib/api-client'

// Types
export interface Gateway {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'maintenance'
  environment: 'production' | 'sandbox'
  healthStatus: {
    status: 'healthy' | 'degraded' | 'down'
    responseTime: number
    lastCheck?: string
  }
  metrics: {
    successRate: number
    dailyVolume: number
    transactionCount: number
  }
  configuration?: {
    apiEndpoint?: string
    webhookUrl?: string
    supportsWebhook?: boolean
    timeoutSeconds?: number
    maxRetryAttempts?: number
    retryDelaySeconds?: number
  }
  credentials?: {
    apiKey?: string
    apiSecret?: string
  }
  code?: string
  createdAt?: string
  updatedAt?: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: string
  enabled: boolean
  priority: number
  fee_percentage: number
  min_amount?: number
  max_amount?: number
  configuration?: Record<string, any>
}

export interface FeeStructure {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'tiered'
  value: number
  min_fee?: number
  max_fee?: number
  applicable_to: string[]
  active: boolean
  tiers?: Array<{
    min_amount: number
    max_amount?: number
    value: number
  }>
}

export interface RoutingRule {
  id: string
  name: string
  priority: number
  conditions: string[]
  target_gateway: string
  fallback_gateway?: string
  enabled: boolean
  success_rate?: number
  created_at?: string
  updated_at?: string
}

export interface ConfigOverview {
  gateways: {
    total: number
    active: number
    inactive: number
    lastUpdated: string
  }
  fees: {
    totalStructures: number
    activeStructures: number
    lastModified: string
  }
  paymentMethods: {
    total: number
    enabled: number
    disabled: number
  }
  routing: {
    totalPolicies: number
    activePolicies: number
    successRate: number
  }
  templates: {
    total: number
    approved: number
    pending: number
  }
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    lastCheck: string
  }
}

export interface GatewayTestResult {
  success: boolean
  responseTime: number
  status: string
  message: string
  timestamp?: string
}

class ConfigApiService {
  // Gateway APIs
  async getGateways(params?: { limit?: number; offset?: number; status?: string }) {
    const response = await apiClient.get<{ items: Gateway[]; total: number }>('/api/config/gateways', { params })
    return response.data
  }

  async getGateway(id: string) {
    const response = await apiClient.get<Gateway>(`/api/config/gateways/${id}`)
    return response.data
  }

  async createGateway(data: Partial<Gateway>) {
    const response = await apiClient.post<Gateway>('/api/config/gateways', data)
    return response.data
  }

  async updateGateway(id: string, data: Partial<Gateway>) {
    const response = await apiClient.put<Gateway>(`/api/config/gateways/${id}`, data)
    return response.data
  }

  async deleteGateway(id: string) {
    const response = await apiClient.delete(`/api/config/gateways/${id}`)
    return response.data
  }

  async testGateway(id: string) {
    const response = await apiClient.post<GatewayTestResult>(`/api/config/gateways/${id}/test`)
    return response.data
  }

  // Payment Method APIs
  async getPaymentMethods(params?: { enabled?: boolean }) {
    const response = await apiClient.get<{ items: PaymentMethod[] }>('/api/config/payment-methods', { params })
    return response.data
  }

  async getPaymentMethod(id: string) {
    const response = await apiClient.get<PaymentMethod>(`/api/config/payment-methods/${id}`)
    return response.data
  }

  async updatePaymentMethod(id: string, data: Partial<PaymentMethod>) {
    const response = await apiClient.put<PaymentMethod>(`/api/config/payment-methods/${id}`, data)
    return response.data
  }

  async togglePaymentMethod(id: string, enabled: boolean) {
    const response = await apiClient.patch<PaymentMethod>(`/api/config/payment-methods/${id}/toggle`, { enabled })
    return response.data
  }

  // Fee Structure APIs
  async getFeeStructures(params?: { active?: boolean }) {
    const response = await apiClient.get<{ items: FeeStructure[] }>('/api/config/fees', { params })
    return response.data
  }

  async getFeeStructure(id: string) {
    const response = await apiClient.get<FeeStructure>(`/api/config/fees/${id}`)
    return response.data
  }

  async createFeeStructure(data: Partial<FeeStructure>) {
    const response = await apiClient.post<FeeStructure>('/api/config/fees', data)
    return response.data
  }

  async updateFeeStructure(id: string, data: Partial<FeeStructure>) {
    const response = await apiClient.put<FeeStructure>(`/api/config/fees/${id}`, data)
    return response.data
  }

  async deleteFeeStructure(id: string) {
    const response = await apiClient.delete(`/api/config/fees/${id}`)
    return response.data
  }

  // Routing Rule APIs
  async getRoutingRules(params?: { enabled?: boolean }) {
    const response = await apiClient.get<{ items: RoutingRule[] }>('/api/config/routing', { params })
    return response.data
  }

  async getRoutingRule(id: string) {
    const response = await apiClient.get<RoutingRule>(`/api/config/routing/${id}`)
    return response.data
  }

  async createRoutingRule(data: Partial<RoutingRule>) {
    const response = await apiClient.post<RoutingRule>('/api/config/routing', data)
    return response.data
  }

  async updateRoutingRule(id: string, data: Partial<RoutingRule>) {
    const response = await apiClient.put<RoutingRule>(`/api/config/routing/${id}`, data)
    return response.data
  }

  async deleteRoutingRule(id: string) {
    const response = await apiClient.delete(`/api/config/routing/${id}`)
    return response.data
  }

  async updateRoutingPriority(id: string, priority: number) {
    const response = await apiClient.patch<RoutingRule>(`/api/config/routing/${id}/priority`, { priority })
    return response.data
  }

  // Configuration Overview
  async getOverview() {
    const response = await apiClient.get<ConfigOverview>('/api/config/overview')
    return response.data
  }

  // Change History
  async getChangeHistory(params?: { limit?: number; module?: string }) {
    const response = await apiClient.get<{ items: any[] }>('/api/config/history', { params })
    return response.data
  }

  // Client Management APIs
  async getClients(params?: any) {
    const response = await apiClient.get<{ items: any[]; total: number }>('/api/clients', { params })
    return response.data
  }

  async getClient(id: string) {
    const response = await apiClient.get(`/api/clients/${id}`)
    return response.data
  }

  async createClient(data: any) {
    const response = await apiClient.post('/api/clients', data)
    return response.data
  }

  async updateClient(id: string, data: any) {
    const response = await apiClient.put(`/api/clients/${id}`, data)
    return response.data
  }

  async deleteClient(id: string) {
    const response = await apiClient.delete(`/api/clients/${id}`)
    return response.data
  }

  // User Management APIs
  async getUsers(params?: any) {
    const response = await apiClient.get<{ items: any[]; total: number }>('/api/admin/users', { params })
    return response.data
  }

  async getUser(id: string) {
    const response = await apiClient.get(`/api/admin/users/${id}`)
    return response.data
  }

  async createUser(data: any) {
    const response = await apiClient.post('/api/admin/users', data)
    return response.data
  }

  async updateUser(id: string, data: any) {
    const response = await apiClient.put(`/api/admin/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: string) {
    const response = await apiClient.delete(`/api/admin/users/${id}`)
    return response.data
  }

  // System Settings APIs
  async getSettings() {
    const response = await apiClient.get('/api/admin/settings')
    return response.data
  }

  async updateSettings(data: any) {
    const response = await apiClient.put('/api/admin/settings', data)
    return response.data
  }
}

export const configApiService = new ConfigApiService()
export default configApiService
