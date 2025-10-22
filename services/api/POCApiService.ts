interface ClientRecord {
  id: number
  client_code: string
  package_name: string
  unique_assets: string
  blockdirectlyforassets: boolean
  blockdirectlyforplaystorepresence: boolean
}

interface ClientHistoryResponse {
  data: any
}

interface ClientListResponse {
  data: ClientRecord[]
}

class POCApiService {
  private baseUrl = (process.env.NEXT_PUBLIC_POC_BASE_URL || 'https://staging-apis.13-204-100-160.sslip.io/admin').replace(/\/$/, '');

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `POC API request failed (${response.status})`);
    }

    return response.json() as Promise<T>;
  }

  async getClients(platform: 'ANDROID' | 'IOS'): Promise<ClientRecord[]> {
    const result = await this.request<ClientListResponse>(
      `/getUniqueClientCode?version=1.0.0&platform=${platform}`
    );

    return Array.isArray(result?.data) ? result.data : [];
  }

  async updateBlocking(
    clientCode: string,
    assetsFlag: boolean,
    playstoreFlag: boolean
  ): Promise<any> {
    const url = `/updateClientLevelBlocking?clientid=${encodeURIComponent(clientCode)}&assetsFlag=${assetsFlag}&playstoreFlag=${playstoreFlag}`;
    return this.request<any>(url);
  }

  async getClientHistory(clientCode: string, platform: 'ANDROID' | 'IOS'): Promise<any> {
    const result = await this.request<ClientHistoryResponse>(
      `/getClientCodeHistory?client_code=${encodeURIComponent(clientCode)}&platform=${platform}`
    );

    return result?.data ?? [];
  }
}

export const pocApiService = new POCApiService();
export default pocApiService;
