'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  AlertCircle,
  KeyRound,
  Fingerprint,
  Chrome,
  Github,
  Loader2,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import {
  getPasswordStrength,
} from '@/lib/auth'
import MenuApiService from '@/services/api/MenuApiService'

export default function LoginContent() {
  const router = useRouter()
  const { login, loginVerify, error, isLoading, clearError } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [verificationToken, setVerificationToken] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [localError, setLocalError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password))
  }, [password])

  // Check caps lock
  const checkCapsLock = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'))
  }

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i] || ''
    }
    setOtp(newOtp)
  }

  const shakeForm = () => {
    const form = document.getElementById('login-form')
    if (form) {
      form.classList.add('animate-shake')
      setTimeout(() => form.classList.remove('animate-shake'), 500)
    }
  }

  const showSuccessAnimation = () => {
    setShowSuccess(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    const userTrim = (username || '').trim()
    const passwordTrim = (password || '').trim()

    if (!userTrim) {
      setLocalError('Username is required')
      shakeForm()
      return
    }
    if (!passwordTrim) {
      setLocalError('Password is required')
      shakeForm()
      return
    }

    try {
      const response = await login(userTrim, passwordTrim)
      setVerificationToken(response.verification_token)

      if (rememberMe) {
        localStorage.setItem('remember_me', 'true')
      }

      if (!response.is_mfa_enabled) {
        await loginVerify(response.verification_token, '')
        await MenuApiService.getUserRights().catch(err =>
          console.error('[Login] Failed to fetch user rights:', err)
        )
        showSuccessAnimation()
        setTimeout(() => router.push('/dashboard'), 800)
      } else {
        setStep('otp')
      }
    } catch (err: any) {
      setLocalError(err.message)
      shakeForm()
    }
  }

  const handleOtpVerify = async () => {
    setLocalError('')
    clearError()

    const otpValue = otp.join('')

    if (!verificationToken) {
      setLocalError('Missing verification token. Please try again.')
      return
    }

    if (otpValue.length !== 6) {
      setLocalError('Please enter the complete 6-digit OTP')
      return
    }

    try {
      await loginVerify(verificationToken, otpValue)
      await MenuApiService.getUserRights().catch(err =>
        console.error('[Login] Failed to fetch user rights:', err)
      )
      showSuccessAnimation()
      setTimeout(() => router.push('/dashboard'), 800)
    } catch (err: any) {
      setLocalError(err.message)
      shakeForm()
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Premium Mesh Gradient Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right bottom,
                rgba(92, 187, 246, 0.03) 0%,
                rgba(255, 255, 255, 0) 30%,
                rgba(255, 153, 51, 0.03) 100%
              )
            `
          }}
        />

        {/* Animated mesh gradients */}
        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(92, 187, 246, 0.08) 0%, transparent 50%)',
            filter: 'blur(100px)',
          }}
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          className="absolute bottom-0 left-0 w-[800px] h-[800px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255, 153, 51, 0.08) 0%, transparent 50%)',
            filter: 'blur(100px)',
          }}
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Branding (Hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-8 xl:p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#5CBBF6]/5 via-transparent to-[#FF9933]/5" />

          <div className="max-w-lg relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-12">
                <motion.div className="relative inline-block" whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-[#5CBBF6]/20 to-[#FF9933]/20 rounded-2xl blur-2xl"
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <div
                    className="relative px-8 py-6 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <img src="/sabpaisa-logo.png" alt="SabPaisa" className="h-14 w-auto relative z-10" />
                  </div>
                </motion.div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.1]">
                Welcome to
                <br />
                <span className="bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] bg-clip-text text-transparent">modern</span>{' '}
                <span className="bg-gradient-to-r from-[#FF9933] to-[#FF7A00] bg-clip-text text-transparent">payments</span>
              </h1>

              <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed">
                Experience the next generation of payment processing with unmatched security and simplicity.
              </p>

              <div className="space-y-4">
                <motion.div className="group relative p-4 rounded-2xl transition-all duration-300" whileHover={{ x: 4 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5CBBF6]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start gap-4 relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5CBBF6]/10 to-[#5CBBF6]/5 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-[#5CBBF6]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Enterprise Security</p>
                      <p className="text-sm text-gray-600 leading-relaxed">Bank-grade 256-bit encryption with PCI DSS compliance</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="group relative p-4 rounded-2xl transition-all duration-300" whileHover={{ x: 4 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start gap-4 relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9933]/10 to-[#FF9933]/5 flex items-center justify-center flex-shrink-0">
                      <KeyRound className="w-6 h-6 text-[#FF9933]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Access Control</p>
                      <p className="text-sm text-gray-600 leading-relaxed">Role-based permissions with fine-grained controls</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="group relative p-4 rounded-2xl transition-all duration-300" whileHover={{ x: 4 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start gap-4 relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900/10 to-gray-900/5 flex items-center justify-center flex-shrink-0">
                      <Fingerprint className="w-6 h-6 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">MFA Ready</p>
                      <p className="text-sm text-gray-600 leading-relaxed">Optional OTP verification for enhanced security</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <motion.div
            className="w-full max-w-md sm:max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5CBBF6] to-[#4BA0D8] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sign in</h2>
                    <p className="text-sm text-gray-600">Access your admin dashboard</p>
                  </div>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {displayError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 p-3 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{displayError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <div className="relative">
                <div
                  className="absolute -top-10 right-0 w-24 h-24 rounded-full opacity-40"
                  style={{ background: 'radial-gradient(circle at center, rgba(92, 187, 246, 0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
                />

                <div className="mb-6 sm:mb-8 relative">
                  <motion.h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    Welcome back
                  </motion.h2>
                  <motion.p className="text-sm sm:text-base text-gray-600" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    Enter your credentials to continue
                  </motion.p>
                </div>

                <AnimatePresence mode="wait">
                  {step === 'login' ? (
                    <motion.form
                      key="login-form"
                      id="login-form"
                      onSubmit={handleSubmit}
                      className="space-y-5"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Username */}
                      <div className="relative">
                        <div className="relative group">
                          <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="peer w-full px-4 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#5CBBF6] focus:bg-white text-gray-900 placeholder-transparent transition-all duration-200 text-base"
                            placeholder="Username"
                            autoComplete="username"
                          />
                          <label
                            htmlFor="username"
                            className="absolute left-4 top-4 text-gray-600 transition-all duration-200 peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#5CBBF6] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2"
                          >
                            Username
                          </label>
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 peer-focus:text-[#5CBBF6] transition-colors duration-200" />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="relative">
                        <div className="relative group">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyUp={checkCapsLock}
                            className="peer w-full px-4 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#5CBBF6] focus:bg-white text-gray-900 placeholder-transparent transition-all duration-200 text-base"
                            placeholder="Password"
                            autoComplete="current-password"
                          />
                          <label
                            htmlFor="password"
                            className="absolute left-4 top-4 text-gray-600 transition-all duration-200 peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-[#5CBBF6] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2"
                          >
                            Password
                          </label>
                          <Lock className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 peer-focus:text-[#5CBBF6] transition-colors duration-200" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
                            {showPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
                          </button>
                        </div>

                        {/* Password Strength */}
                        <AnimatePresence>
                          {password && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-2">
                              <div className="flex gap-1 mb-1">
                                {[...Array(4)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-1 flex-1 rounded-full transition-all duration-300"
                                    style={{
                                      backgroundColor: i < passwordStrength
                                        ? passwordStrength <= 1
                                          ? '#ef4444'
                                          : passwordStrength <= 2
                                          ? '#f59e0b'
                                          : passwordStrength <= 3
                                          ? '#3b82f6'
                                          : '#10b981'
                                        : '#e5e7eb'
                                    }}
                                  />
                                ))}
                              </div>
                              <p className="text-xs" style={{
                                color: passwordStrength <= 1 ? '#ef4444' : passwordStrength <= 2 ? '#f59e0b' : passwordStrength <= 3 ? '#3b82f6' : '#10b981'
                              }}>
                                {passwordStrength === 0 ? 'Very Weak' : passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {capsLockOn && (
                            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs text-[#FF9933] mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Caps Lock is on
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Remember & Forgot */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer group">
                          <div className="relative">
                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only peer" />
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-[#5CBBF6] peer-checked:border-[#5CBBF6] transition-all duration-200" />
                          </div>
                          <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800">Remember me</span>
                        </label>
                        <a href="/login/forgot" className="text-sm text-[#5CBBF6] hover:text-[#4BA0D8]">Forgot password?</a>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="relative w-full py-4 px-6 bg-gradient-to-r from-[#5CBBF6] to-[#4BA0D8] text-white font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5CBBF6]/20 disabled:opacity-60 flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ boxShadow: '0 10px 25px -5px rgba(92, 187, 246, 0.4), 0 4px 14px rgba(0, 0, 0, 0.1)' }}
                      >
                        {isLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...</>) : (<><UserCheck className="mr-2 h-5 w-5" /> Sign in</>)}
                      </button>

                      {/* Social (placeholders) */}
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" className="w-full py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700">
                          <Chrome className="w-4 h-4" /> Google
                        </button>
                        <button type="button" className="w-full py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-700">
                          <Github className="w-4 h-4" /> GitHub
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div key="otp-form" className="space-y-5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email</p>
                      </div>

                      <div className="flex gap-2 sm:gap-3 justify-center">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            className="w-11 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-gray-50/50 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-[#5CBBF6] focus:bg-white text-gray-900 transition-all duration-200"
                          />
                        ))}
                      </div>

                      <div className="space-y-3 mt-6">
                        <button
                          onClick={handleOtpVerify}
                          disabled={isLoading || otp.join('').length !== 6}
                          className="relative w-full py-4 px-6 bg-gradient-to-r from-[#FF9933] to-[#FF7A00] text-white font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#FF9933]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                          style={{ boxShadow: isLoading || otp.join('').length !== 6 ? '0 4px 14px rgba(0, 0, 0, 0.1)' : '0 10px 25px -5px rgba(255, 153, 51, 0.4), 0 4px 14px rgba(0, 0, 0, 0.1)' }}
                        >
                          {isLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>) : showSuccess ? (<><AlertCircle className="mr-2 h-5 w-5" /> Success!</>) : (<>Verify Code <ArrowRight className="ml-2 h-5 w-5" /></>)}
                        </button>

                        <button
                          onClick={() => { setStep('login'); setOtp(['', '', '', '', '', '']); setLocalError(''); clearError() }}
                          className="w-full py-3 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          ← Back to sign in
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-6 sm:mt-8 text-center pb-safe-bottom">
                <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500">
                  <a href="/terms" className="hover:text-gray-700 transition-colors py-2">Terms</a>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <a href="/privacy" className="hover:text-gray-700 transition-colors py-2">Privacy</a>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <a href="/support" className="hover:text-gray-700 transition-colors py-2">Support</a>
                </div>
                <p className="mt-3 sm:mt-4 text-xs text-gray-400">© 2025 SabPaisa. All rights reserved.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}

