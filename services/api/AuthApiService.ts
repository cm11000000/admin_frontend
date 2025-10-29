import { createCobClient, getCobApiKey } from './CobApiClient'
import { encryptGCM } from '@/lib/encryption'

export interface LoginPayload {
  clientUserId: string
  userPassword?: string
  is_social?: boolean
}

export interface LoginResponse {
  status: boolean
  verification_token: string
  is_mfa_enabled: boolean
}

export interface LoginVerifyResponse {
  accessToken: string
  refreshToken: string
  userName: string
  email?: string
  userEmail?: string
  loginId?: string
  password_updated_at?: string
  // plus many user fields; we keep as any for flexibility
  [key: string]: any
}

export interface ForgotPasswordPayload {
  email: string
  otp_type?: string
  otp_for?: string
}

export interface ForgotPasswordResponse {
  msg: string
  verification_token: string
}

export interface VerifyOtpPayload {
  verification_token: string
  otp: string
}

export interface VerifyOtpResponse {
  status: boolean
  message: string
}

export interface ResetPasswordPayload {
  email: string
  verification_token: string
  password: string
}

export interface ResetPasswordResponse {
  msg: string
  status: boolean
}

// Encryption keys for AES-256-GCM authentication
const AUTH_KEY = process.env.NEXT_PUBLIC_AUTH_KEY || 'JUtMpbgS8tjzGwDwbyQPIrGXe+9/YTOmrVpr5WmzFBg='
const AUTH_IV = process.env.NEXT_PUBLIC_AUTH_IV || 'ILeUg1bJPLa5fQ5DtB+VfwS28F+5Ee4tw+iDFMbvZwa7wDkR/u/G/oj1sRpb70kq'

// Feature flag for encryption - can be toggled via environment variable
// Set NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION='true' to enable AES-GCM encryption.
// By default, encryption is DISABLED to match adminportalfrontend behavior.
const ENABLE_LOGIN_ENCRYPTION = process.env.NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION === 'true'

class AuthApiService {
  private client = createCobClient()
  private apiKey = getCobApiKey()

  /**
   * Initiate login with COB. Server expects a field named `query` containing a JSON string.
   *
   * Encryption behavior (controlled by NEXT_PUBLIC_ENABLE_LOGIN_ENCRYPTION):
   * - Enabled by default: Uses AES-GCM with HMAC-SHA384 (matches backend encryption)
   * - Set to 'false' to disable: Sends plain JSON (backend accepts via fallback)
   *
   * Backend decryption: /cob_api/api/utils/data_masking.py:decrypt()
   * - Primary: AES-GCM with HMAC-SHA384 validation
   * - Fallback: Returns input as-is if decryption fails (line 131)
   */
  async login(payload: LoginPayload | string, maybePassword?: string): Promise<LoginResponse> {
    // Backward-compatible: allow call style login(email, password)
    let clientUserId = ''
    let userPassword = ''
    let is_social = false

    if (typeof payload === 'string') {
      clientUserId = payload
      userPassword = maybePassword ?? ''
    } else if (payload && typeof payload === 'object') {
      clientUserId = payload.clientUserId
      userPassword = payload.userPassword ?? ''
      is_social = !!payload.is_social
    }

    const loginBean = {
      clientUserId,
      userPassword,
      is_social,
    }

    const loginBeanString = JSON.stringify(loginBean)

    let query: string
    if (ENABLE_LOGIN_ENCRYPTION) {
      // Use AES-GCM encryption with HMAC-SHA384 (matches backend)
      try {
        query = await encryptGCM(loginBeanString, AUTH_KEY, AUTH_IV)
        console.log('[Auth] Successfully encrypted login data using AES-256-GCM with HMAC-SHA384')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[Auth] Encryption failed:', errorMessage)
        console.warn('[Auth] Falling back to plain JSON. THIS IS INSECURE!')
        query = loginBeanString
      }
    } else {
      // Use plain JSON (backend accepts via fallback)
      query = loginBeanString
      console.warn('[Auth] Encryption is disabled. Using plain JSON login. THIS IS INSECURE!')
    }

    const body = { query }

    // Optional debug (safe): log shape without sensitive data when enabled
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      try {
        const parsed = JSON.parse(loginBeanString)
        if (parsed && typeof parsed === 'object') {
          parsed.userPassword = parsed.userPassword ? '***' : ''
        }
        console.log('[Auth][DEBUG] login payload:', parsed)
      } catch {}
    }

    try {
      const { data } = await this.client.post<LoginResponse>(
        '/auth-service/auth/login',
        body,
        { headers: { Authorization: this.apiKey } }
      )
      return data
    } catch (error) {
      console.error('[Auth] Login request failed:', error)
      throw error
    }
  }

  /**
   * Verify login with OTP (if MFA is enabled)
   */
  async loginVerify(verification_token: string, otp: string): Promise<LoginVerifyResponse> {
    const { data } = await this.client.post<LoginVerifyResponse>(
      '/auth-service/auth/login-verify',
      { verification_token, otp },
      { headers: { Authorization: this.apiKey } }
    )
    return data
  }

  /**
   * Logout - Clear tokens from localStorage
   */
  logout(): void {
    if (typeof window === 'undefined') return
    // Clear both token key formats
    localStorage.removeItem('access_token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userName')
    localStorage.removeItem('remember_me')
    console.log('[Auth] User logged out successfully')
  }

  /**
   * Forgot Password - Send OTP to user's email
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    const body = {
      email: payload.email,
      otp_type: payload.otp_type || 'both',
      otp_for: payload.otp_for || 'Forgot Password'
    }

    try {
      const { data } = await this.client.post<ForgotPasswordResponse>(
        '/auth-service/auth/forgot-password',
        body,
        { headers: { Authorization: this.apiKey } }
      )
      return data
    } catch (error) {
      console.error('[Auth] Forgot password request failed:', error)
      throw error
    }
  }

  /**
   * Verify OTP for forgot password flow
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    try {
      const { data } = await this.client.post<VerifyOtpResponse>(
        '/auth-service/auth/verify-otp',
        payload,
        { headers: { Authorization: this.apiKey } }
      )
      return data
    } catch (error) {
      console.error('[Auth] OTP verification failed:', error)
      throw error
    }
  }

  /**
   * Reset Password - Set new password after OTP verification
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    try {
      const { data } = await this.client.post<ResetPasswordResponse>(
        '/auth-service/auth/reset-password',
        payload,
        { headers: { Authorization: this.apiKey } }
      )
      return data
    } catch (error) {
      console.error('[Auth] Password reset failed:', error)
      throw error
    }
  }

  /**
   * Store tokens from login verification response
   */
  storeTokensFromVerify(resp: LoginVerifyResponse): void {
    if (typeof window === 'undefined') return
    const access = resp?.accessToken
    const refresh = resp?.refreshToken

    // Store in localStorage with BOTH key formats (matching Angular implementation)
    if (access) {
      localStorage.setItem('access_token', access)
      localStorage.setItem('accessToken', access)  // Angular uses this key
    }
    if (refresh) {
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('refreshToken', refresh)  // Angular uses this key
    }
    // Parity with Angular: persist loginId explicitly if provided
    if (resp?.loginId) {
      try { localStorage.setItem('loginId', String(resp.loginId)) } catch {}
    }
    // Parity: persist userName as well if provided
    if (resp?.userName) {
      try { localStorage.setItem('userName', String(resp.userName)) } catch {}
    }
    localStorage.setItem('user', JSON.stringify(resp))

    // Also store in cookies for middleware access
    // Persist cookies for 1 day to control frontend session window
    // Add Secure on HTTPS and set Domain for first-party prod domains to survive refresh and subdomain changes
    const oneDay = 24 * 60 * 60
    const isHttps = typeof location !== 'undefined' && location.protocol === 'https:'
    const secureAttr = isHttps ? '; Secure' : ''
    const host = (typeof location !== 'undefined' ? location.hostname : '') || ''
    // Only set Domain for known first-party domain to avoid Public Suffix issues (e.g., cloudfront.net)
    const domainAttr = host.endsWith('.sabpaisa.in') || host === 'sabpaisa.in' ? '; Domain=.sabpaisa.in' : ''
    if (access) {
      document.cookie = `access_token=${access}; Path=/; Max-Age=${oneDay}; SameSite=Lax${secureAttr}${domainAttr}`
    }
    if (refresh) {
      document.cookie = `refresh_token=${refresh}; Path=/; Max-Age=${oneDay}; SameSite=Lax${secureAttr}${domainAttr}`
    }

    // Store userName for Django backend API calls (matches Angular implementation)
    const userName = resp?.userName || resp?.email || resp?.userEmail || resp?.clientUserId
    if (userName) localStorage.setItem('userName', userName)

    console.log('[Auth] Tokens stored successfully in localStorage and cookies')
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  /**
   * Get current user
   */
  getUser(): LoginVerifyResponse | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export default new AuthApiService()
