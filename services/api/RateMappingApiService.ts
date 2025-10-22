/**
 * Rate Mapping API Service - Matches Angular Implementation
 * All endpoints match the Angular client-list.service.ts exactly
 */

import { adminAPI, reportAPI } from '@/lib/api-client'

// Environment URLs matching Angular service
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin/'
// Used for common-data endpoints (admin base)
const STG_REPORT_API = process.env.NEXT_PUBLIC_STG_REPORT_API || 'https://staging-apis.13-204-100-160.sslip.io/admin/api/'
const STAGING_URL = process.env.NEXT_PUBLIC_STAGING_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin/api/'

class RateMappingApiService {
  /**
   * =====================================================
   * CLIENT LISTING & MANAGEMENT APIs
   * =====================================================
   */

  /**
   * Get client list (from COB)
   * Matches: getClientListNew()
   */
  static async getClientList(appId: number = 10): Promise<any[]> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_NEW || 'https://stgcobapi.sabpaisa.in/'
    const response = await fetch(`${baseUrl}fetchAllRegisteredClients?appliactionId=${appId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to fetch clients')
    return response.json()
  }

  /**
   * Get client code list
   * Matches: getClientCodeListUSP()
   */
  static async getClientCodeList(): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}common-data/0/0/`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch client codes')
    return response.json()
  }

  /**
   * Get client code list for mapping
   * Matches: getClientCodeListMapping()
   */
  static async getClientCodeListMapping(): Promise<any[]> {
    const response = await adminAPI.get('/api/common-data/0/0/')

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch client codes')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * Get client ID by client code
   * Matches: getClientId(cltCode)
   */
  static async getClientId(clientCode: string): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}common-data/4/${clientCode}/`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch client ID')
    return response.json()
  }

  /**
   * Get client details for update
   * Matches: geClientForUpdate(cltID)
   */
  static async getClientForUpdate(clientId: string): Promise<any> {
    const clientApiURL = process.env.NEXT_PUBLIC_CLIENT_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/report/rest/client_data/'
    const response = await fetch(`${clientApiURL}${clientId}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch client details')
    return response.json()
  }

  /**
   * Update client data table
   * Matches: updateClientDataTable(inputData, Ids)
   */
  static async updateClientDataTable(clientId: string, data: any): Promise<any> {
    const response = await fetch(`${STG_REPORT_API}rest/client_data/update_custom/${clientId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to update client')
    return response.json()
  }

  /**
   * =====================================================
   * PAYMENT MODE APIs
   * =====================================================
   */

  /**
   * Get payment mode list (master data)
   * Matches: getPaymentModeList()
   */
  static async getPaymentModeList(): Promise<any[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const apikey = typeof window !== 'undefined' ? localStorage.getItem('apikey') : null

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_RATE_MAPPING2 || 'https://staging-apis.13-204-100-160.sslip.io/admin/api/'
    const response = await fetch(`${baseUrl}paymentModeMaster/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch payment modes')
    return response.json()
  }

  /**
   * Get payment mode list (test)
   * Matches: getPaymentModeListTest()
   */
  static async getPaymentModeListTest(): Promise<any[]> {
    const response = await fetch('https://staging-apis.13-204-100-160.sslip.io/admin/api/rest/payment_mode', {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch payment modes')
    return response.json()
  }

  /**
   * Get assigned payment modes for a client
   * Matches: getAssignedPaymenMode(cltID)
   */
  static async getAssignedPaymentMode(clientCode: string): Promise<any[]> {
    const response = await adminAPI.get(`/api/common-data/3/${clientCode}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch assigned payment modes')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * Get payment modes for add new rate
   * Matches: getPaymodeForAddNewRate(cltCode)
   */
  static async getPaymodeForAddNewRate(clientCode: string): Promise<any[]> {
    const response = await adminAPI.get(`/api/common-data/14/${clientCode}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch payment modes')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * Update client payment mode
   * Matches: updateClientPaymode(input1, input2)
   */
  static async updateClientPaymode(clientPaymodeId: string, data: { payModeFlag: boolean }): Promise<any> {
    const response = await fetch(`${STAGING_URL}config/updateClientPaymode/${clientPaymodeId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to update payment mode')
    return response.json()
  }

  /**
   * Add new payment mode to client
   * Matches: AddNewPMode endpoint
   */
  static async addNewPaymentMode(clientCode: string, paymodeId: string, userName: string): Promise<any> {
    const response = await fetch(`${ADMIN_URL}REST/AddNewPMode/${clientCode}/${paymodeId}/${userName}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to add payment mode')
    return response.json()
  }

  /**
   * =====================================================
   * ENDPOINT APIs
   * =====================================================
   */

  /**
   * Get endpoint list by mapping ID
   * Matches: getEndPointListUSP(mappingId)
   */
  static async getEndpointList(mappingId: string): Promise<any[]> {
    const response = await adminAPI.get(`/api/common-data/10/${mappingId}/`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch endpoints')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * Get endpoint list by payment mode ID
   * Matches: getEndPointListPaymodeIdWiseUSP(PaymodeId)
   */
  static async getEndpointListByPaymode(paymodeId: string): Promise<any[]> {
    const response = await adminAPI.get(`/api/common-data/11/${paymodeId}/`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch endpoints')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * Get endpoint for add new rate
   * Matches: getEndpointForAddNewRate(payModeId)
   */
  static async getEndpointForAddNewRate(paymodeId: string): Promise<any[]> {
    const response = await adminAPI.get(`/api/common-data/18/${paymodeId}/`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch endpoints')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * =====================================================
   * MAPPING APIs
   * =====================================================
   */

  /**
   * Get mapping details for a client
   * Matches: getMappingDetail(cltCode)
   */
  static async getMappingDetail(clientCode: string): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}MappingDetail/Mapping/${clientCode}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch mapping details')
    return response.json()
  }

  /**
   * Update mapping details
   * Matches: updateMappingDetail(body)
   */
  static async updateMappingDetail(data: {
    mappingid: number
    epmrchntid: string
    epusername: string
    eppassword: string
  }): Promise<any> {
    const response = await fetch(`${STAGING_URL}v2/REST/UpdateMapping/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to update mapping')
    return response.json()
  }

  /**
   * Update mapping by ID
   * Matches: updateMappingByID(inputData, Ids)
   */
  static async updateMappingByID(ids: string, data: any): Promise<any> {
    const response = await fetch(`${STAGING_URL}REST/client/updateMapping/${ids}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to update mapping')
    return response.json()
  }

  /**
   * Save payment mode and endpoint (3-step wizard)
   * Matches: SavepModeAndendPoint(inputData)
   */
  static async saveClientDetails(data: any): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_RATE_MAPPING || 'https://staging-apis.13-204-100-160.sslip.io/admin/'
    const response = await fetch(`${baseUrl}REST/config/saveClientDetails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to save client details')
    return response.json()
  }

  /**
   * Update mapping list
   * Matches: updateMapping(inputData)
   */
  static async updateMapping(data: any): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_RATE_MAPPING || 'https://staging-apis.13-204-100-160.sslip.io/admin/'
    const response = await fetch(`${baseUrl}REST/config/updateMappingList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to update mapping')
    return response.json()
  }

  /**
   * =====================================================
   * FEE APIs
   * =====================================================
   */

  /**
   * Get fee details for update
   * Matches: geFeeForUpdate(cltCode)
   */
  static async getFeeForUpdate(clientCode: string): Promise<any[]> {
    const response = await adminAPI.get(`/SabPaisaAdmin/rest/client_ep/FeeDetail2/${clientCode}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch fee details')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * Update fee by fee ID
   * Matches: updateFeByFeeID(inputData, Ids)
   */
  static async updateFeeByID(feeId: string, data: any): Promise<any> {
    const response = await adminAPI.post(`/SabPaisaAdmin/REST/client/updateFee/${feeId}/`, data)

    if (!response.success) {
      throw new Error(response.error || 'Failed to update fee')
    }

    return response.data
  }

  /**
   * Save fees (3-step wizard)
   * Matches: SaveFees(inputData)
   */
  static async saveFees(data: any): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_RATE_MAPPING || 'https://staging-apis.13-204-100-160.sslip.io/admin/'
    const response = await fetch(`${baseUrl}REST/config/savefee`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to save fees')
    return response.json()
  }

  /**
   * Add new slab
   * Matches: AddNewSlab(body)
   */
  static async addNewSlab(data: {
    FeeId: number
    ConvChargesType: string
    ConvCharges: number
    EPChargesTypes: string
    EPCharges: number
    GstType: string
    GstValue: number
    SlabFloor: number
    SlabCeiling: number
    AddedBy: string
  }): Promise<any> {
    const response = await adminAPI.post('/SabPaisaAdmin/v2/AddSlab/', data)

    if (!response.success) {
      throw new Error(response.error || 'Failed to add slab')
    }

    return response.data
  }

  /**
   * Delete slab
   * Matches: deleteSlab(feeID, loginId, remarks)
   */
  static async deleteSlab(feeId: number, loginId: string, remarks: string): Promise<any> {
    const response = await adminAPI.get(`/SabPaisaAdmin/ManageFalg/Flag/${encodeURIComponent(remarks)}/${encodeURIComponent('deleteslab')}/${feeId}/${encodeURIComponent(loginId)}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete slab')
    }

    return response.data
  }

  /**
   * Add fee for new payment mode
   * Matches: AddFeeForNewPMode endpoint
   */
  static async addFeeForNewPaymentMode(
    clientCode: string,
    paymodeId: string,
    epid: string,
    amountFrom: number,
    amountTo: number,
    rate: number,
    commType: string,
    convFee: number,
    convFeeType: string,
    userName: string,
    gstper: number
  ): Promise<any> {
    const parts = [
      clientCode,
      paymodeId,
      epid,
      amountFrom,
      amountTo,
      rate,
      commType,
      convFee,
      convFeeType,
      userName,
      gstper
    ].map((part) => encodeURIComponent(String(part)));

    const response = await adminAPI.get(`/SabPaisaAdmin/REST/AddFeeForNewPMode/${parts.join('/')}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to add fee for new payment mode')
    }

    return response.data
  }

  /**
   * Get fee forwarded details
   * Matches: getFeeForwardeDetail(input)
   */
  static async getFeeForwardedDetail(input: string): Promise<any[]> {
    const response = await fetch(`${STAGING_URL}common-data/${input}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch fee forwarded details')
    return response.json()
  }

  /**
   * Update fee forwarded
   * Matches: UpdateFeeForwarded(body)
   */
  static async updateFeeForwarded(data: {
    p_client_id: number
    p_paymode_id: number
    p_updatedBy: string
  }): Promise<any> {
    const response = await fetch(`${STAGING_URL}v2/getDataByCommonProc/UpdateFeeForwarded/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to update fee forwarded')
    return response.json()
  }

  /**
   * Check fee
   * Matches: findCheckFee(clientCode)
   */
  static async findCheckFee(clientCode: string): Promise<any[]> {
    const paths = [
      `/api/rest/client_ep/Fee/${clientCode}/`,
      `/SabPaisaAdmin/rest/client_ep/Fee/${clientCode}`
    ]

    let lastError: string | undefined
    let lastStatus: number | undefined

    for (const path of paths) {
      const response = await adminAPI.get(path)

      if (response.success) {
        const payload = response.data as any

        if (Array.isArray(payload)) {
          return payload
        }

        if (Array.isArray(payload?.results)) {
          return payload.results
        }

        return []
      }

      lastError = response.error
      lastStatus = response.status

      if (response.status && response.status !== 404) {
        break
      }
    }

    throw new Error(
      lastError ||
        (lastStatus === 404
          ? 'Rate configuration not found for the provided client code'
          : 'Failed to load fee configurations')
    )
  }

  /**
   * Get remarks data
   * Matches: getReamksData(cltcode)
   */
  static async getRemarksData(feeId: number): Promise<any[]> {
    const response = await adminAPI.get(`/api/common-data/101/${feeId}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch remarks')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * =====================================================
   * FLAG & CONFIGURATION APIs
   * =====================================================
   */

  /**
   * Get flag details
   * Matches: getFlagDetail(body)
   */
  static async getFlagDetail(data: {
    CltCode: string
    pType: string
    TypeValue: string
    upDateBy: string
  }): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}v2/ManageFalg/Flag/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch flag details')
    return response.json()
  }

  /**
   * =====================================================
   * CLONE & SWAP APIs
   * =====================================================
   */

  /**
   * Clone rate mapping
   * Matches: CloneRateMapping(inputVal)
   */
  static async cloneRateMapping(clientCodeFrom: string, clientCodeTo: string, loginBy: string): Promise<any[]> {
    const parts = [clientCodeFrom, clientCodeTo, loginBy].map((part) => encodeURIComponent(part));
    const response = await adminAPI.get(`/SabPaisaAdmin/clone/${parts.join('/')}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to clone rate mapping')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (payload) {
      return [payload]
    }

    return []
  }

  /**
   * Get aggregator names for swap
   * Matches: getAggNameForSwap(paymodeid)
   */
  static async getAggNameForSwap(paymodeId: string): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}common-data/17/${paymodeId}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch aggregators')
    return response.json()
  }

  /**
   * Get aggregator name (for view and update)
   * Matches: getAggName(udParam)
   * Format: S/{clientCode}/{paymentMode}/0/NA/NA/NA/NA/0 (Select)
   * Format: U/{clientCode}/{paymentMode}/{aggName}/{merchantId}/{pwd}/{url}/{username}/{oldEpId} (Update)
   */
  static async getAggName(params: string): Promise<any[]> {
    const response = await fetch(`${ADMIN_URL}REST/ViewAggName/${params}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to get/update aggregator name')
    return response.json()
  }

  /**
   * Get aggregator list
   * Matches: getAggregatorList()
   */
  static async getAggregatorList(): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}common-data/18/0`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch aggregator list')
    return response.json()
  }

  /**
   * =====================================================
   * PARTNER BANK & APP APIs
   * =====================================================
   */

  /**
   * Get partner bank list
   * Matches: getPartnerBankUSP()
   */
  static async getPartnerBankList(): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}common-data/1/0`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch partner banks')
    return response.json()
  }

  /**
   * Get app name list
   * Matches: getAppNameUSP()
   */
  static async getAppNameList(): Promise<any[]> {
    const response = await fetch(`${STG_REPORT_API}common-data/8/0`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch app names')
    return response.json()
  }

  /**
   * =====================================================
   * RATE MAPPING SEARCH APIs
   * =====================================================
   */

  /**
   * Get rate configurations with filters (including client code)
   * Matches: getRateConfigs with clientCode parameter
   */
  static async getRateConfigs(filters: {
    clientCode?: string
    gateway?: string[]
    paymentMode?: string[]
    isActive?: boolean
    search?: string
  }): Promise<{ data: any[] }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin'

    const response = await fetch(`${baseUrl}/api/rateMapping/getRateConfigs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(filters),
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to fetch rate configurations')
    return response.json()
  }

  /**
   * Get gateways list
   * Matches: getGateways endpoint
   */
  static async getGateways(): Promise<any[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin'

    const response = await fetch(`${baseUrl}/api/rateMapping/getGateways/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to fetch gateways')
    return response.json()
  }

  /**
   * Get payment modes list
   * Matches: getPaymentModes endpoint
   */
  static async getPaymentModes(): Promise<any[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const baseUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin'

    const response = await fetch(`${baseUrl}/api/rateMapping/getPaymentModes/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Failed to fetch payment modes')
    return response.json()
  }

  /**
   * =====================================================
   * APPROVAL & HISTORY APIs
   * =====================================================
   */

  /**
   * Check in approve table
   * Matches: checkinApprovetable(cltcode)
   */
  static async checkInApproveTable(clientCode: string): Promise<any[]> {
    const response = await adminAPI.get(`/api/common-data/5/${clientCode}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to check approval status')
    }

    const payload = response.data as any

    if (Array.isArray(payload)) {
      return payload
    }

    if (Array.isArray(payload?.results)) {
      return payload.results
    }

    return []
  }

  /**
   * Approve fee
   * Matches: ApprovedFee(body)
   */
  static async approveFee(data: {
    approved_by: string
    client_code: string
    approvedfor: string
  }): Promise<any> {
    const response = await adminAPI.post('/api/v2/REST/CheckFee/Approved/', data)

    if (!response.success) {
      throw new Error(response.error || 'Failed to log approval')
    }

    return response.data
  }

  /**
   * Get rate mapping auth/permissions
   * Matches: getRateMappingAuth(url)
   */
  static async getRateMappingAuth(loginId: string): Promise<any> {
    const accessApi = process.env.NEXT_PUBLIC_ACCESS_API || 'https://staging-apis.13-204-100-160.sslip.io/admin/'
    const response = await fetch(`${accessApi}auth_custom/routes/RateMappingAuth/?login_id=${loginId}`, {
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch permissions')
    const data = await response.json()
    return Array.isArray(data) ? data[0] : data
  }

  /**
   * Post access/permissions
   * Matches: postAccess(body)
   */
  static async postAccess(data: any): Promise<any> {
    const accessApi = process.env.NEXT_PUBLIC_ACCESS_API || 'https://staging-apis.13-204-100-160.sslip.io/admin/'
    const response = await fetch(`${accessApi}auth_custom/routes/RateMappingAuth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to post access')
    return response.json()
  }

  /**
   * Update access/permissions
   * Matches: updateAccess(id, body)
   */
  static async updateAccess(id: string, data: any): Promise<any> {
    const accessApi = process.env.NEXT_PUBLIC_ACCESS_API || 'https://staging-apis.13-204-100-160.sslip.io/admin/'
    const response = await fetch(`${accessApi}auth_custom/routes/RateMappingAuth/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to update access')
    return response.json()
  }

  /**
   * View PDF agreement
   * Matches: viewpdf(cltCode)
   */
  static async viewPDF(clientCode: string): Promise<any> {
    const cobkycUrl = (process.env.NEXT_PUBLIC_COBKYC_URL || 'https://staging-apis.13-204-100-160.sslip.io').replace(/\/$/, '/')
    const response = await fetch(`${cobkycUrl}kyc/upload-merchant-document/get-merchant-agreement-by-client-code/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client_code: clientCode }),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to fetch PDF')
    return response.json()
  }

  /**
   * Generate client form for COB
   * Matches: GenerateClientFormForCob(inputData)
   */
  static async generateClientFormForCob(data: any): Promise<any> {
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL_RATE_MAPPING || (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin')).replace(/\/$/, '')
    const response = await fetch(`${baseUrl}/rest/client_data/GenerateClientFormForCob`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    if (!response.ok) throw new Error('Failed to generate client form')
    return response.json()
  }
}

export default RateMappingApiService
