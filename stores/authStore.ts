import { create } from 'zustand'
import AuthApiService from '@/services/api/AuthApiService'

interface AuthState {
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<any>
  loginVerify: (verificationToken: string, otp: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await AuthApiService.login({
        clientUserId: email,
        userPassword: password,
        is_social: false,
      })
      set({ isLoading: false })
      return response
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Login failed' })
      throw error
    }
  },

  loginVerify: async (verificationToken: string, otp: string) => {
    set({ isLoading: true, error: null })
    try {
      const resp = await AuthApiService.loginVerify(verificationToken, otp)
      // Persist tokens and user data for subsequent requests
      AuthApiService.storeTokensFromVerify(resp)
      // Also store userName explicitly if present
      if (typeof window !== 'undefined') {
        const u = resp?.userName || resp?.email || resp?.userEmail || resp?.clientUserId
        if (u) localStorage.setItem('userName', u)
      }
      set({ isLoading: false })
      return resp as any
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Verification failed' })
      throw error
    }
  },

  clearError: () => set({ error: null })
}))
