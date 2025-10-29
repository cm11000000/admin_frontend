import axios, { AxiosInstance } from 'axios';

// Interface definitions
export interface RoleListResponse {
  roleId: number;
  roleName: string;
}

export interface FormListResponse {
  Id: number;
  formName: string;
  clientId: number;
}

export interface MenuRightsResponse {
  result: number;
  message: string;
}

export interface DynamicMenuResponse {
  isExist: number;
  message: string;
}

export interface AccessPermission {
  id?: number;
  login_id: string;
  manage_client: boolean;
  manage_payment_mode: boolean;
  manage_mapping: boolean;
  manage_fee: boolean;
  manage_client_configuration: boolean;
  manage_feed_forwarded: boolean;
}

export interface TransactionLimitRequest {
  client_code: string;
  minimum_payment_amount: number;
  maximum_payment_amount: number;
}

export interface TransactionLimitResponse {
  client_code: string;
  minimum_payment_amount: number;
  maximum_payment_amount: number;
}

export interface ProductAssignRequest {
  client_code: string;
  app_code: string;
}

export interface ProductAssignResponse {
  message: string;
  status?: string;
}

export interface POCAndroidData {
  client_code: string;
  blockdirectlyforassets: boolean;
  blockdirectlyforplaystorepresence: boolean;
}

export interface POCHistoryResponse {
  data: any[];
}

export interface GenerateKeyRequest {
  clientId: number;
  clientCode: string;
  clientContact: string;
  clientEmail: string;
  address: string;
  clientLogoPath: string;
  clientName: string;
  clientLink: string;
  stateId: string;
  bid: string;
  stateName: string;
  bankName: string;
  client_username: string;
  client_password: string;
  appId: string;
  status: string;
  client_type: string;
  successUrl: string;
  failedUrl: string;
  subscriptionstatus: string;
  businessType: number;
  businessctgcode: string;
  referralcode: string;
  mesaagebypassflag: string;
  forcesuccessflag: string;
  clientMcc: string;
  masterName: string;
}

export interface GenerateKeyResponse {
  data: any;
  message?: string;
}

export interface ChangePasswordRequest {
  userLoginId: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  msg: string;
}

export interface ClientListResponse {
  clientCode: string;
  clientName: string;
  clientId: number;
}

class AdminApiService {
  private reportApi: AxiosInstance;
  private adminApi: AxiosInstance;
  private accessApi: AxiosInstance;
  private payLinkApi: AxiosInstance;
  private cobApi: AxiosInstance;
  private loginApi: AxiosInstance;
  private mobilePocApi: AxiosInstance;

  constructor() {
    // Initialize different base URLs
    this.reportApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_REPORT_API_URL || 'https://d63eaznhkkse9.cloudfront.net',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.adminApi = axios.create({
      baseURL: (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://d18fssv9lb395v.cloudfront.net').replace(/\/$/, '') + '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.accessApi = axios.create({
      baseURL: (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://d18fssv9lb395v.cloudfront.net').replace(/\/$/, ''),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.payLinkApi = axios.create({
      baseURL: (process.env.NEXT_PUBLIC_PAYLINK_BASE_URL || (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://d18fssv9lb395v.cloudfront.net').replace(/\/$/, '')).replace(/\/$/, '') + '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.cobApi = axios.create({
      baseURL: 'https://cobawsapi.sabpaisa.in',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.loginApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_LOGIN_BASE_URL || '',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.mobilePocApi = axios.create({
      baseURL: (process.env.NEXT_PUBLIC_POC_BASE_URL || 'https://d18fssv9lb395v.cloudfront.net').replace(/\/$/, ''),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to add token if available
    [this.reportApi, this.adminApi, this.accessApi, this.payLinkApi, this.cobApi, this.loginApi, this.mobilePocApi].forEach(instance => {
      instance.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          const apiKey = localStorage.getItem('apikey');

          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
          if (apiKey && (config.baseURL?.includes('sendpaylink') || config.baseURL?.includes('reportapi'))) {
            config.headers['api-key'] = apiKey;
          }
        }
        return config;
      });
    });
  }

  // ============== MENU SETTINGS ==============
  async getRoleList(): Promise<RoleListResponse[]> {
    const response = await this.reportApi.get('/common-data/22/0');
    return response.data;
  }

  async getFormList(roleId: string): Promise<FormListResponse[]> {
    const response = await this.reportApi.get(`/common-data/23/${roleId}`);
    return response.data;
  }

  async setMenuRights(roleId: string, formIds: string, count: number): Promise<MenuRightsResponse[]> {
    const params = `${roleId}/${formIds}/${count}`;
    const response = await this.adminApi.get(`/REST/SetMenuRights/${params}`);
    return response.data;
  }

  // ============== DYNAMIC MENU ==============
  async setDynamicMenu(userName: string, menuType: string): Promise<DynamicMenuResponse[]> {
    const response = await this.adminApi.get(`/REST/SetMnu/${userName}/${menuType}`);
    return response.data;
  }

  // ============== ACCESS URM ==============
  async getRateMappingAuth(loginId: string): Promise<AccessPermission[]> {
    const response = await this.accessApi.get(`/auth_custom/routes/RateMappingAuth/?login_id=${loginId}`);
    return response.data;
  }

  async createAccess(data: AccessPermission): Promise<AccessPermission> {
    const response = await this.accessApi.post('/auth_custom/routes/RateMappingAuth/', data);
    return response.data;
  }

  async updateAccess(id: number, data: AccessPermission): Promise<AccessPermission> {
    const response = await this.accessApi.patch(`/auth_custom/routes/RateMappingAuth/${id}/`, data);
    return response.data;
  }

  // ============== TRANSACTION LIMIT ==============
  async setTransactionLimit(data: TransactionLimitRequest): Promise<any> {
    const response = await this.payLinkApi.post('/client-configuration/set-payment-amount-range/', data);
    return response.data;
  }

  async getTransactionLimit(clientCode: string): Promise<TransactionLimitResponse> {
    const response = await this.payLinkApi.get(`/client-configuration/get-payment-amount-range/?client_code=${clientCode}`);
    return response.data;
  }

  // ============== PRODUCT ==============
  async assignProduct(data: ProductAssignRequest): Promise<ProductAssignResponse> {
    const response = await this.cobApi.post('/application-master/assign-merchant/', data);
    return response.data;
  }

  async getClientList(): Promise<ClientListResponse[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    const { resolveUserName } = await import('@/lib/utils');
    const userName = resolveUserName();

    const response = await this.reportApi.get('/masters/clientDataMaster/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        login_by: userName
      }
    });
    return response.data;
  }

  // ============== POC (Mobile Blocking) ==============
  async getAndroidData(): Promise<POCAndroidData[]> {
    const response = await this.mobilePocApi.get('/getUniqueClientCode', {
      params: {
        version: '1.0.0',
        platform: 'ANDROID'
      }
    });
    return response.data.data;
  }

  async getIosData(): Promise<POCAndroidData[]> {
    const response = await this.mobilePocApi.get('/getUniqueClientCode', {
      params: {
        version: '1.0.0',
        platform: 'IOS'
      }
    });
    return response.data.data;
  }

  async updateClientBlocking(clientId: string, assetsFlag: boolean, playstoreFlag: boolean): Promise<any> {
    const response = await this.mobilePocApi.post('/updateClientLevelBlocking', null, {
      params: {
        clientid: clientId,
        assetsFlag: assetsFlag,
        playstoreFlag: playstoreFlag
      }
    });
    return response.data;
  }

  async getClientCodeHistory(clientCode: string, platform: string): Promise<POCHistoryResponse> {
    const response = await this.mobilePocApi.get('/getClientCodeHistory', {
      params: {
        client_code: clientCode,
        platform: platform
      }
    });
    return response.data;
  }

  // ============== GENERATE KEY ==============
  async generateClientForm(data: GenerateKeyRequest): Promise<GenerateKeyResponse> {
    const response = await this.adminApi.post('/rest/client_data/GenerateClientFormForCobManual/', data);
    return response.data;
  }

  // ============== CHANGE PASSWORD ==============
  async changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await this.loginApi.post('/changePassword', data);
    return response.data;
  }

  // Helper method to validate password
  validatePassword(password: string): boolean {
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    return regex.test(password);
  }

  // ============== MASTERS ==============
  async getAggregatorList(): Promise<any[]> {
    const response = await this.reportApi.get('/common-data/18/0');
    return response.data;
  }

  async manageAggregator(operation: 'S' | 'I' | 'U', id: number, code: string, name: string, userName: string, isActive: number): Promise<any[]> {
    let params: string;
    if (operation === 'S') {
      params = `S/0/0/0/0/0`;
    } else if (operation === 'I') {
      params = `I/0/${code}/${name}/${userName}/${isActive}`;
    } else {
      params = `U/${id}/${code}/${name}/${userName}/${isActive}`;
    }
    const response = await this.adminApi.get(`/REST/ManageAggMst/${params}`);
    return response.data;
  }

  async managePaymentStatus(operation: 'S' | 'I' | 'U', id: number, code: string, name: string, userName: string, isActive: number): Promise<any[]> {
    let params: string;
    if (operation === 'S') {
      params = `S/0/0/0/0/0`;
    } else if (operation === 'I') {
      params = `I/0/${code}/${name}/${userName}/${isActive}`;
    } else {
      params = `U/${id}/${code}/${name}/${userName}/${isActive}`;
    }
    const response = await this.adminApi.get(`/REST/ManagePaymentStatus/${params}`);
    return response.data;
  }

  async manageCategory(operation: 'S' | 'I' | 'U', id: number, aggCode: string, categoryCode: string, categoryName: string, userName: string, isActive: number): Promise<any[]> {
    let params: string;
    if (operation === 'S') {
      params = `S/0/0/0/0/0/0`;
    } else if (operation === 'I') {
      params = `I/0/${aggCode}/${categoryCode}/${categoryName}/${userName}/${isActive}`;
    } else {
      params = `U/${id}/${aggCode}/${categoryCode}/${categoryName}/${userName}/${isActive}`;
    }
    const response = await this.adminApi.get(`/REST/ManageCategory/${params}`);
    return response.data;
  }

  async managePaymentMode(operation: 'S' | 'I' | 'U', id: string, name: string, type: string): Promise<any[]> {
    let params: string;
    if (operation === 'S') {
      params = `S/0/0/0`;
    } else if (operation === 'I') {
      params = `I/${id}/${name}/${type}`;
    } else {
      params = `U/${id}/${name}/${type}`;
    }
    const response = await this.adminApi.get(`/REST/ManagePayModeMst/${params}`);
    return response.data;
  }

  // ============== MAPPERS ==============
  async getPaymentModeList(): Promise<any[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
    const response = await this.reportApi.get('/paymodemaster/paymentModeMaster/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getPaymodeAggregatorMapping(paymentMode: string): Promise<any[]> {
    const params = `S/${paymentMode}/0/0`;
    const response = await this.adminApi.get(`/REST/PaymodeAggregator/${params}`);
    return response.data;
  }

  async updatePaymodeAggregatorMapping(paymentMode: string, pcodes: string, count: number): Promise<any[]> {
    const params = `I/${paymentMode}/${pcodes}/${count}`;
    const response = await this.adminApi.get(`/REST/PaymodeAggregator/${params}`);
    return response.data;
  }

  // ============== FEES ==============
  async saveFee(feeData: any): Promise<any> {
    const adminBase = (process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://d18fssv9lb395v.cloudfront.net').replace(/\/$/, '');
    const response = await axios.post(`${adminBase}/REST/config/savefee`, feeData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async findFee(clientCode: string): Promise<any> {
    const response = await this.reportApi.get(`/rest/client_ep/Fee/${clientCode}`);
    return response.data;
  }

  async approveFee(feeData: any): Promise<any> {
    const response = await this.reportApi.post('/v2/REST/CheckFee/Approved/', feeData);
    return response.data;
  }

  // ============== REFUNDS ==============
  async getRefundRequested(clientCode: string, fromDate: string, endDate: string): Promise<any> {
    const response = await this.adminApi.get(`/AdminTxnReport/GetRefundRequested/${clientCode}/${fromDate}/${endDate}/1/`);
    return response.data;
  }

  async getCommonData(param1: number, param2: number): Promise<any> {
    const response = await this.adminApi.get(`/common-data/${param1}/${param2}/`);
    return response.data;
  }

  async processRefund(userName: string, txnId: string, bankRefId: string): Promise<any> {
    const myParam = `2/${userName}/${txnId}/${bankRefId}/0/0`;
    const response = await this.adminApi.get(`/REST/RefundProcess/Initiated/${myParam}/`);
    return response.data;
  }

  async getSbiCardData(filter: {
    clientCode: string;
    fromDate: string;
    endDate: string;
    page?: number;
    length?: number;
  }): Promise<any[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await this.reportApi.post('/transactions/getsbicarddata/', filter, {
      headers,
    });
    return response.data;
  }

  async postSbiRefund(body: {
    clientCode: string;
    clientTxnId: string;
    spTxnId: string;
    amount: number | string;
  }): Promise<any> {
    const response = await this.cobApi.post('/get-refund-status', body);
    return response.data;
  }
}

export default new AdminApiService();
