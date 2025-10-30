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

    const plainQuery = loginBeanString
    // Debug: show which key source is being used (env vs defaults) without exposing values
    if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true') {
      try {
        const usingEnvKey = !!process.env.NEXT_PUBLIC_AUTH_KEY
        const usingEnvIv = !!process.env.NEXT_PUBLIC_AUTH_IV
        const keyLen = (typeof atob === 'function') ? atob(AUTH_KEY).length : AUTH_KEY.length
        const ivLen = (typeof atob === 'function') ? atob(AUTH_IV).length : AUTH_IV.length
        console.info(`[Auth][DEBUG] Encryption key source: ${usingEnvKey ? 'env' : 'default'} (keyLen=${keyLen}), IV source: ${usingEnvIv ? 'env' : 'default'} (len=${ivLen})`)
      } catch {}
    }
    let body: any
    let triedPlainFallback = false
    if (ENABLE_LOGIN_ENCRYPTION) {
      // Use AES-GCM encryption with HMAC-SHA384 (matches backend)
      try {
        const enc = await encryptGCM(plainQuery, AUTH_KEY, AUTH_IV)
        console.log('[Auth] Encrypted login payload (AES-256-GCM + HMAC-SHA384)')
        body = { query: enc }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[Auth] Encryption failed:', errorMessage)
        console.warn('[Auth] Falling back to plain JSON. THIS IS INSECURE!')
        body = { query: plainQuery }
        triedPlainFallback = true
      }
    } else {
      // Use plain JSON (backend accepts via fallback)
      body = { query: plainQuery }
      console.warn('[Auth] Encryption is disabled. Using plain JSON login. THIS IS INSECURE!')
    }

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
    } catch (error: any) {
      // If encryption was enabled and we haven't tried plain JSON yet, retry once with plain
      if (ENABLE_LOGIN_ENCRYPTION && !triedPlainFallback) {
        console.warn('[Auth] Encrypted login failed, retrying with plain JSON payload once')
        const { data } = await this.client.post<LoginResponse>(
          '/auth-service/auth/login',
          { query: plainQuery },
          { headers: { Authorization: this.apiKey } }
        )
        return data
      }
      console.error('[Auth] Login request failed:', error?.__normalizedMessage || error?.message || error)
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
   * Logout - Clear tokens from localStorage and sessionStorage
   */
  logout(): void {
    if (typeof window === 'undefined') return

    // Clear localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userName')
    localStorage.removeItem('remember_me')
    localStorage.removeItem('loginId')

    // Clear sessionStorage
    try {
      sessionStorage.removeItem('bean')
      sessionStorage.removeItem('loginedUser')
      sessionStorage.removeItem('RatingUser')
    } catch {}

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
      // Parity with adminportalfrontend (Angular): use account/getotp endpoint
      const { data } = await this.client.post<ForgotPasswordResponse>(
        '/auth-service/account/getotp',
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
      // Parity with adminportalfrontend (Angular): use account/verify-otp endpoint
      const { data } = await this.client.post<VerifyOtpResponse>(
        '/auth-service/account/verify-otp',
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
      // Parity with adminportalfrontend (Angular): use account/forgot-password (PUT)
      const { data } = await this.client.put<ResetPasswordResponse>(
        '/auth-service/account/forgot-password',
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
    try {
      sessionStorage.setItem('bean', JSON.stringify(resp))
      sessionStorage.setItem('loginedUser', 'SabPaisa Admin')
      const ratingUser =
        resp?.userName || resp?.email || resp?.userEmail || resp?.clientUserId
      if (ratingUser) {
        sessionStorage.setItem('RatingUser', String(ratingUser))
      }
    } catch (sessionError) {
      console.warn('[Auth] Failed to persist session auth state', sessionError)
    }

    // Also store in cookies for middleware access
    // Persist cookies for 1 day to control frontend session window
    const oneDay = 24 * 60 * 60
    if (access) {
      document.cookie = `access_token=${access}; path=/; max-age=${oneDay}; SameSite=Lax`
    }
    if (refresh) {
      document.cookie = `refresh_token=${refresh}; path=/; max-age=${oneDay}; SameSite=Lax`
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
