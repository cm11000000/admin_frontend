/**
 * Authentication Helper Functions
 * Utilities for token management, session handling, and auth state
 */

export interface User {
  userName: string
  email?: string
  loginId?: string
  accessToken?: string
  refreshToken?: string
  [key: string]: any
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
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
 * Store access token
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', token)
}

/**
 * Store refresh token
 */
export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('refresh_token', token)
}

/**
 * Store user data
 */
export function setUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

/**
 * Clear all auth data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  localStorage.removeItem('userName')
  localStorage.removeItem('remember_me')
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  return !!token
}

/**
 * Check if token is expired (basic check)
 * Returns true if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true

  try {
    // JWT tokens are base64 encoded and have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) return true

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1] || ''))

    // Check if exp field exists
    if (!payload.exp) return false

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    // If we can't decode the token, consider it expired
    return true
  }
}

/**
 * Validate email format
 * Allows both standard emails (user@domain.com) and non-standard formats (user@sp)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+(\.[^\s@]+)?$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * Returns strength level: 0 (none), 1 (weak), 2 (medium), 3 (strong)
 */
export function getPasswordStrength(password: string): number {
  if (password.length === 0) return 0
  if (password.length < 6) return 1

  let strength = 1

  // Check for length
  if (password.length >= 8) strength++

  // Check for mixed case, numbers, and special characters
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const characteristics = [hasLowerCase, hasUpperCase, hasNumbers, hasSpecialChars].filter(Boolean).length

  if (characteristics >= 3) strength++

  return Math.min(strength, 3)
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
      return ''
    case 1:
      return 'Weak'
    case 2:
      return 'Medium'
    case 3:
      return 'Strong'
    default:
      return ''
  }
}

/**
 * Get password strength color class
 */
export function getPasswordStrengthColor(strength: number): string {
  switch (strength) {
    case 0:
      return ''
    case 1:
      return 'bg-red-500'
    case 2:
      return 'bg-yellow-500'
    case 3:
      return 'bg-green-500'
    default:
      return ''
  }
}

/**
 * Get password strength width class
 */
export function getPasswordStrengthWidth(strength: number): string {
  switch (strength) {
    case 0:
      return 'w-0'
    case 1:
      return 'w-1/3'
    case 2:
      return 'w-2/3'
    case 3:
      return 'w-full'
    default:
      return 'w-0'
  }
}

/**
 * Check if password meets minimum requirements
 * At least 8 characters, one uppercase, one lowercase, one number
 */
export function isPasswordValid(password: string): boolean {
  if (password.length < 8) return false

  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)

  return hasLowerCase && hasUpperCase && hasNumbers
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user) return 'U'

  const name = user.userName || user.email || 'User'
  const parts = name.split(' ')

  if (parts.length >= 2) {
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase();
  }

  return name.substring(0, 2).toUpperCase()
}

/**
 * Format error message for display
 */
export function formatAuthError(error: any): string {
  if (typeof error === 'string') return error

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.__normalizedMessage ||
    error?.message ||
    'An error occurred. Please try again.'
  )
}
