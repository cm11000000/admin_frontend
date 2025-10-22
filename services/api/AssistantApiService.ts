import { reportAPI } from '@/lib/api-client'

export interface AssistantDownloadSpec {
  method: 'POST' | 'GET'
  url: string | null
  body?: any
  headers?: Record<string, string>
}

export interface AssistantResponse {
  intent: string
  answer: string
  params?: any
  details?: any
  curls?: string[]
  deep_links?: string[]
  needs?: string[]
  report_type?: string
  download?: AssistantDownloadSpec
}

class AssistantApiService {
  /**
   * Ask the backend assistant. The endpoint is exposed under the report base as
   * /report/reports/assistant/simple/, so we call it via `reports/assistant/simple/`
   * relative to the report base URL to preserve the gateway path prefix.
   */
  static async ask(payload: {
    question: string
    lang?: string
    clientCode?: string
    fromDate?: string
    endDate?: string
    login_by?: string
    txnId?: string
    clientTxnId?: string
    referral_code?: string
  }): Promise<AssistantResponse> {
    const res = await reportAPI.post<AssistantResponse>('reports/assistant/simple/', payload)
    if (!res.success) {
      throw new Error(res.error || 'Assistant request failed')
    }
    return res.data as AssistantResponse
  }
}

export default AssistantApiService

