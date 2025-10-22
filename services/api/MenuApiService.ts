import { createCobClient, getCobApiKey } from './CobApiClient'
import { resolveUserName } from '@/lib/utils'

export interface MenuItem {
  id: number
  name: string
  icon: string
  url: string
  order: number
  submenus?: SubMenuItem[]
}

export interface SubMenuItem {
  id: number
  name: string
  url: string
  order: number
}

export interface MenuResponse {
  status: boolean
  message: string
  menu_list: MenuItem[]
}

class MenuApiService {
  private client = createCobClient()
  private apiKey = getCobApiKey()

  /**
   * Fetch dynamic menu list from COB API
   * Matches Angular implementation: getNavUSP()
   * API: https://cobawsapi.sabpaisa.in/get-menu-list/
   */
  async getMenuList(): Promise<MenuResponse> {
    try {
      const { data } = await this.client.get<MenuResponse>(
        '/get-menu-list/',
        { headers: { Authorization: this.apiKey } }
      )
      console.log('[Menu] Menu list fetched successfully:', data)
      return data
    } catch (error) {
      console.error('[Menu] Failed to fetch menu list:', error)
      throw error
    }
  }

  /**
   * Get user rights from Admin API
   * Matches Angular implementation: getRightUSP()
   * API: https://adminapi.sabpaisa.in/api/common-data/20/0
   */
  async getUserRights(): Promise<boolean> {
    try {
      // Use Admin API client for rights check
      const adminClient = (await import('./AdminApiClient')).createAdminClient()
      const { data } = await adminClient.get<any[]>('/common-data/20/0')

      // Resolve current username (uppercased to match server data casing)
      const resolved = resolveUserName()
      const userName = (resolved || '').toUpperCase().trim()

      if (!userName) {
        localStorage.setItem('rights', '0')
        return false
      }

      // Check if user exists in rights list
      const hasRights = Array.isArray(data) && data.some(
        (item: any) => String(item.clientName || '').toUpperCase().trim() === userName
      )

      // Store rights flag for permission checks
      localStorage.setItem('rights', hasRights ? '1' : '0')

      console.log(`[Menu] User ${userName} rights check:`, hasRights)
      return hasRights
    } catch (error) {
      console.error('[Menu] Failed to fetch user rights:', error)
      if (typeof window !== 'undefined') {
        localStorage.setItem('rights', '0')
      }
      return false
    }
  }
}

export default new MenuApiService()
