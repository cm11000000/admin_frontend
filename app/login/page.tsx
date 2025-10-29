"use client"

import React, { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import MenuApiService from '@/services/api/MenuApiService'

// Utility functions for input validation
function isDigitOnly(val: string): boolean {
  for (let i = 0; i < val.length; i++) {
    const code = val.charCodeAt(i)
    if (code < 48 || code > 57) return false
  }
  return true
}

function extractDigitsOnly(val: string): string {
  let result = ''
  for (let i = 0; i < val.length; i++) {
    const code = val.charCodeAt(i)
    if (code >= 48 && code <= 57) result += val[i]
  }
  return result
}

export default function LoginPage() {
  const router = useRouter()
  const { login, loginVerify, error, isLoading, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [verificationToken, setVerificationToken] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const [localError, setLocalError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)

  const formRef = useRef<HTMLFormElement | null>(null)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const checkCapsLock = useCallback((e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'))
  }, [])

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!isDigitOnly(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }, [otp])

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter' && otp.join('').length === 6) {
      e.preventDefault()
      handleOtpVerify()
    }
  }, [otp])

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = extractDigitsOnly(e.clipboardData.getData('text')).slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i] || ''
    }
    setOtp(newOtp)
    const lastIndex = Math.min(pastedData.length - 1, 5)
    if (lastIndex >= 0) otpRefs.current[lastIndex]?.focus()
  }, [otp])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    const emailTrim = email.trim()
    const passwordTrim = password.trim()

    if (!emailTrim) {
      setLocalError('Username is required')
      return
    }
    if (!passwordTrim) {
      setLocalError('Password is required')
      return
    }

    try {
      const response = await login(emailTrim, passwordTrim)
      setVerificationToken(response.verification_token)

      if (rememberMe) {
        localStorage.setItem('remember_me', 'true')
      }

      if (!response.is_mfa_enabled) {
        await loginVerify(response.verification_token, '')
        await MenuApiService.getUserRights().catch(err =>
          console.error('[Login] Failed to fetch user rights:', err)
        )
        setShowSuccess(true)
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        setStep('otp')
      }
    } catch (err: any) {
      setLocalError(err.message || 'Login failed')
    }
  }, [email, password, rememberMe, login, loginVerify, clearError, router])

  const handleOtpVerify = useCallback(async () => {
    setLocalError('')
    clearError()

    const otpValue = otp.join('')

    if (!verificationToken) {
      setLocalError('Missing verification token. Please try again.')
      return
    }

    if (otpValue.length !== 6) {
      setLocalError('Please enter the complete 6-digit code')
      return
    }

    try {
      await loginVerify(verificationToken, otpValue)
      await MenuApiService.getUserRights().catch(err =>
        console.error('[Login] Failed to fetch user rights:', err)
      )
      setShowSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (err: any) {
      setLocalError(err.message || 'Verification failed')
    }
  }, [otp, verificationToken, loginVerify, clearError, router])

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex">
      {/* Animated Background - Matching Dashboard */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30"></div>

        {/* Animated gradient orbs - More colorful */}
        <div className="absolute top-0 right-0 w-[36rem] h-[36rem] bg-gradient-to-br from-[#5CBBF6]/12 to-[#4BA0D8]/8 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[32rem] h-[32rem] bg-gradient-to-br from-[#FF9933]/12 to-[#FF6600]/8 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-gradient-to-br from-[#5CBBF6]/8 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        {/* Refined grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(148 163 184) 1px, transparent 1px),
                             linear-gradient(to bottom, rgb(148 163 184) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        ></div>
      </div>

      {/* Left Side - Professional Branding Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden z-10">
        {/* Refined gradient background with orange theme matching dashboard */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600" />

        {/* More vibrant animated orbs */}
        <div className="absolute top-32 right-24 w-[32rem] h-[32rem] bg-gradient-to-br from-[#FF9933]/20 to-[#FF6600]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] bg-gradient-to-br from-white/8 to-[#FFB366]/10 rounded-full blur-3xl" />

        {/* Refined grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                             linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }}
        />

        <div className="relative z-10 px-16 py-12 flex flex-col justify-between h-full">
          {/* Top Section - Logo and Header */}
          <div className="space-y-16">
            {/* Logo with dark background - matching sidebar style */}
            <div className="inline-block">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4 border border-slate-700/50 shadow-lg">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/5 via-transparent to-[#5CBBF6]/5"></div>
                <img
                  src="/sabpaisa-logo.png"
                  alt="SabPaisa"
                  decoding="async"
                  width="256"
                  height="64"
                  className="relative h-10 w-auto"
                />
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-8 max-w-xl">
              <h1 className="text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Streamline Your
                <span className="block mt-2 bg-gradient-to-r from-[#FFB366] via-[#FF9933] to-[#FF8C1A] bg-clip-text text-transparent">
                  Payment Operations
                </span>
              </h1>
              <p className="text-xl text-white/85 leading-relaxed font-light max-w-lg">
                Enterprise-grade admin portal for managing transactions, monitoring performance, and scaling your business with confidence.
              </p>
            </div>
          </div>

          {/* Bottom Section - Feature Cards */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div className="group bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/[0.12] transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF9933] to-[#FF6600] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#FF9933]/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-base font-semibold text-white mb-1.5">Real-time Analytics</div>
              <div className="text-sm text-white/70 font-light leading-relaxed">Monitor every transaction with live insights and detailed reports</div>
            </div>
            <div className="group bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/[0.12] transition-all duration-300">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-base font-semibold text-white mb-1.5">Lightning Fast</div>
              <div className="text-sm text-white/70 font-light leading-relaxed">Built for speed with optimized performance and instant updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Colorful Form Area */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="w-full max-w-md relative">
          {/* Decorative gradient orbs behind form */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#5CBBF6]/20 to-[#4BA0D8]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#FF9933]/20 to-[#FF6600]/10 rounded-full blur-3xl"></div>

          {/* Mobile Logo - Orange theme matching dashboard */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/30 ring-2 ring-white/50">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span className="text-sm font-bold text-white tracking-tight">SabPaisa Admin</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="relative inline-flex mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/50 ring-4 ring-white">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">Welcome back!</h2>
                <p className="text-gray-600 font-medium">Taking you to your dashboard...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Header - More colorful */}
                <div className="text-center relative">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                    {step === 'login' ? 'Sign in to your account' : 'Enter verification code'}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    {step === 'login'
                      ? 'Welcome back! Please enter your details.'
                      : 'Check your email for the 6-digit code'}
                  </p>
                  {/* Orange accent line matching dashboard theme */}
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full"></div>
                </div>

                {/* Error Alert */}
                <AnimatePresence>
                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl"
                    >
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      </div>
                      <p className="text-sm text-red-800 font-medium">{displayError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {step === 'login' ? (
                    <motion.form
                      key="login"
                      ref={formRef}
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-5"
                    >
                      {/* Username */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Username
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-orange-500/20 to-orange-600/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl"></div>
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="relative w-full pl-12 pr-4 py-3.5 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/20 transition-all text-gray-900 font-medium"
                            placeholder="Enter your username"
                            autoComplete="username"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Password
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-orange-500/20 to-orange-600/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl"></div>
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyUp={checkCapsLock}
                            className="relative w-full pl-12 pr-12 py-3.5 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/20 transition-all text-gray-900 font-medium"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors z-10"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {capsLockOn && (
                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            Caps Lock is on
                          </p>
                        )}
                      </div>

                      {/* Remember & Forgot */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-2 border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Remember me</span>
                        </label>
                        <a href="/login/forgot" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                          Forgot password?
                        </a>
                      </div>

                      {/* Submit - Orange theme matching dashboard */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white text-gray-500 font-medium">Secure login</span>
                        </div>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* OTP Icon - Orange theme */}
                      <div className="flex justify-center">
                        <div className="relative inline-flex">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                          <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/40 ring-4 ring-white">
                            <ShieldCheck className="w-10 h-10 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* OTP Inputs - Orange theme */}
                      <div className="flex gap-3 justify-center">
                        {otp.map((digit, index) => (
                          <div key={index} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-lg"></div>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={handleOtpPaste}
                              ref={(el) => (otpRefs.current[index] = el)}
                              className="relative w-14 h-16 text-center text-2xl font-bold bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/30 transition-all text-gray-900"
                              autoComplete="one-time-code"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Verify Button - Orange theme */}
                      <button
                        onClick={handleOtpVerify}
                        disabled={isLoading || otp.join('').length !== 6}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Code
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>

                      {/* Back Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setStep('login')
                          setOtp(['', '', '', '', '', ''])
                          setLocalError('')
                          clearError()
                        }}
                        className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 font-semibold hover:bg-gray-50 rounded-lg transition-all"
                      >
                        ← Back to sign in
                      </button>

                      {/* Resend */}
                      <div className="text-center pt-4 border-t border-gray-200">
                        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                          Didn't receive code? <span className="font-bold text-orange-500">Resend</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer - More colorful */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs text-gray-600 font-semibold bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 rounded-full border border-emerald-200/50 shadow-sm">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-4 h-4 bg-emerald-400 rounded-full animate-ping opacity-50"></div>
                <ShieldCheck className="relative w-4 h-4 text-emerald-600" />
              </div>
              256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
