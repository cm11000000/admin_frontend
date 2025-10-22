/**
 * Analytics API Service for SabPaisa Admin V5
 * Wraps the new report analytics endpoints mounted under /report/analytics/*
 */

import { reportAPI } from '@/lib/api-client'

export type GroupByTime = 'day' | 'week' | 'month'

function getLoginBy(): string {
  if (typeof window === 'undefined') return ''
  try {
    const u = localStorage.getItem('userName') || localStorage.getItem('loginId') || ''
    return u || ''
  } catch {
    return ''
  }
}

class AnalyticsApiService {
  static async successTrends(body: {
    clientCode?: string
    fromDate: string
    endDate: string
    groupBy?: GroupByTime
    paymentMode?: string
  }) {
    return (await reportAPI.post('/analytics/success_trends/', body)).data
  }

  static async modeMix(body: {
    clientCode?: string
    fromDate: string
    endDate: string
    groupBy?: 'payment_mode' | 'pg_pay_mode'
  }) {
    return (await reportAPI.post('/analytics/mode_mix/', body)).data
  }

  static async failureReasons(body: {
    clientCode?: string
    fromDate: string
    endDate: string
    groupBy: 'resp' | 'bank' | 'mode'
    top?: number
  }) {
    return (await reportAPI.post('/analytics/failure_reasons/', body)).data
  }

  static async refundSla(body: { clientCode?: string; fromDate: string; endDate: string; csv_flag?: boolean }) {
    return (await reportAPI.post('/analytics/refund_sla/', body)).data
  }

  static async chargebackSla(body: { clientCode?: string; fromDate: string; endDate: string; csv_flag?: boolean }) {
    return (await reportAPI.post('/analytics/chargeback_sla/', body)).data
  }

  static async settlementAging(body: { clientCode: string; asOfDate?: string; csv_flag?: boolean }) {
    return (await reportAPI.post('/analytics/settlement_aging/', body)).data
  }

  static async endpointHealth(body: { clientCode?: string; fromDate: string; endDate: string }) {
    return (await reportAPI.post('/analytics/endpoint_health/', body)).data
  }

  static async zonePerformance(body: { fromDate: string; endDate: string; loginBy?: string }) {
    const payload = { ...body, loginBy: body.loginBy || getLoginBy() }
    return (await reportAPI.post('/analytics/zone_performance/', payload)).data
  }

  static async clientLeaderboard(body: { fromDate: string; endDate: string; metric: 'gmv' | 'txn'; top?: number }) {
    return (await reportAPI.post('/analytics/client_leaderboard/', body)).data
  }

  static async referralTrends(body: { referral_code: string; fromDate: string; endDate: string; groupBy?: 'day' | 'month' }) {
    return (await reportAPI.post('/analytics/referral_trends/', body)).data
  }

  static async funnel(body: { clientCode?: string; fromDate: string; endDate: string; by?: 'mode' | 'bank' }) {
    return (await reportAPI.post('/analytics/funnel/', body)).data
  }

  static async sbiCardSummary(body: { clientCode?: string; fromDate: string; endDate: string }) {
    return (await reportAPI.post('/analytics/sbicard_summary/', body)).data
  }

  // Generic CSV downloader for analytics endpoints
  static async downloadCsv(path: string, body: Record<string, any>, filename: string) {
    const base = (process.env.NEXT_PUBLIC_REPORT_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/report').replace(/\/$/, '')
    const url = `${base}${path.startsWith('/') ? path : '/' + path}`
    const token = (typeof window !== 'undefined') ? (localStorage.getItem('accessToken') || localStorage.getItem('access_token') || '') : ''
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...body, csv_flag: true }),
    })
    if (!res.ok) throw new Error(`CSV export failed (${res.status})`)
    const blob = await res.blob()
    const a = document.createElement('a')
    const urlObj = URL.createObjectURL(blob)
    a.href = urlObj
    a.download = filename
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(urlObj)
    document.body.removeChild(a)
  }
}

export default AnalyticsApiService
