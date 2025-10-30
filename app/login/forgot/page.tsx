'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import authApi from '@/services/api/AuthApiService'
import {
  isValidEmail,
  getPasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  isPasswordValid
} from '@/lib/auth'

type Step = 'email' | 'otp' | 'reset'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(newPassword))
  }, [newPassword])

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
    const form = document.getElementById('forgot-form')
    if (form) {
      form.classList.add('animate-shake')
      setTimeout(() => form.classList.remove('animate-shake'), 500)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      shakeForm()
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.forgotPassword({
        email,
        otp_type: 'both',
        otp_for: 'Forgot Password'
      })

      setVerificationToken(response.verification_token)
      setSuccess('OTP has been sent to your email')
      setStep('otp')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to send OTP. Please try again.'
      setError(errorMessage)
      shakeForm()
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const otpValue = otp.join('')

    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      shakeForm()
      return
    }

    setIsLoading(true)

    try {
      await authApi.verifyOtp({
        verification_token: verificationToken,
        otp: otpValue
      })

      setSuccess('OTP verified successfully')
      setStep('reset')
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'OTP verification failed. Please try again.'
      setError(errorMessage)
      shakeForm()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isPasswordValid(newPassword)) {
      setError('Password must be at least 8 characters and contain uppercase, lowercase, and numbers')
      shakeForm()
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      shakeForm()
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword({
        email,
        verification_token: verificationToken,
        password: newPassword
      })

      setSuccess('Password changed successfully!')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Password reset failed. Please try again.'
      setError(errorMessage)
      shakeForm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex">
      {/* Left Side - Professional Branding Panel (mirrors login) */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden z-10">
        {/* Refined gradient background with orange theme matching dashboard */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600" />

        {/* Vibrant animated orbs */}
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

        {/* Left-side content to match login */}
        <div className="relative z-10 px-16 py-12 flex flex-col justify-between h-full">
          <div className="space-y-16">
            {/* Logo card (same as login) */}
            <div className="inline-block">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4 border border-slate-700/50 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/5 via-transparent to-[#5CBBF6]/5"></div>
                <img
                  src="/sabpaisa-logo.png"
                  alt="SabPaisa"
                  decoding="async"
                  fetchpriority="high"
                  width="256"
                  height="64"
                  className="relative h-10 w-auto"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-8 max-w-xl">
              <h1 className="text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Account
                <span className="block mt-2 bg-gradient-to-r from-[#FFB366] via-[#FF9933] to-[#FF8C1A] bg-clip-text text-transparent">
                  Recovery
                </span>
              </h1>
              <p className="text-xl text-white/85 leading-relaxed font-light max-w-lg">
                Reset your password securely. You’ll receive a one‑time code to verify your identity.
              </p>
            </div>
          </div>

          {/* Feature cards (mirrors login) */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl">
            <div className="group bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/[0.12] transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF9933] to-[#FF6600] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#FF9933]/20"></div>
              <div className="text-base font-semibold text-white mb-1.5">Secure by design</div>
              <div className="text-sm text-white/70 font-light leading-relaxed">OTP verification protects your account</div>
            </div>
            <div className="group bg-white/[0.08] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/[0.12] transition-all duration-300">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4"></div>
              <div className="text-base font-semibold text-white mb-1.5">Fast recovery</div>
              <div className="text-sm text-white/70 font-light leading-relaxed">Reset and get back to work quickly</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form area (mirrors login spacing/feel) */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white/80 backdrop-blur-sm relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Premium glass card for logo - Same as login page */}
              <div className="relative inline-block">
                {/* Glowing backdrop */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#5CBBF6]/20 to-[#FF9933]/20 rounded-2xl blur-2xl"
                  style={{ transform: 'scale(1.2)' }}
                />
                {/* Premium glass card for logo */}
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
                  <img
                    src="/sabpaisa-logo.png"
                    alt="SabPaisa"
                    className="h-14 w-auto relative z-10"
                  />
                </div>
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Reset Password
            </h1>
            <p className="text-gray-600">
              {step === 'email' && "Enter your email to receive a verification code"}
              {step === 'otp' && "Enter the code sent to your email"}
              {step === 'reset' && "Create a new secure password"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {['email', 'otp', 'reset'].map((s, index) => (
              <React.Fragment key={s}>
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s === step
                      ? 'bg-[#5CBBF6] text-white'
                      : step === 'otp' && s === 'email'
                      ? 'bg-green-500 text-white'
                      : step === 'reset' && (s === 'email' || s === 'otp')
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  animate={{
                    scale: s === step ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: s === step ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  {index + 1}
                </motion.div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 ${
                    step === 'reset' || (step === 'otp' && index === 0)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                Secure password recovery
              </span>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            id="forgot-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Email */}
              {step === 'email' && (
                <motion.form
                  key="email-form"
                  onSubmit={handleEmailSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative group">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full px-4 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white text-gray-900 placeholder-transparent transition-all duration-200 text-base"
                        placeholder="name@company.com"
                        required
                        autoComplete="email"
                        style={{ minHeight: '44px' }}
                      />
                      <label
                        htmlFor="email"
                        className="pointer-events-none absolute left-4 top-4 text-gray-600 transition-all duration-200 peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white peer-focus:px-2 peer-focus:text-orange-500 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2"
                      >
                        Email Address
                      </label>
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 peer-focus:text-orange-500 transition-colors duration-200" />
                      <AnimatePresence>
                        {email && isValidEmail(email) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <CheckCircle className="absolute right-3.5 top-4 h-5 w-5 text-green-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Error/Success Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center space-x-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-green-900/20 border border-green-500/50 rounded-xl flex items-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-400">{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !email}
                    className="relative w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-60 flex items-center justify-center transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(255, 153, 51, 0.4), 0 4px 14px rgba(0, 0, 0, 0.1)',
                      minHeight: '52px'
                    }}
                  >
                    {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                  </motion.button>
                </motion.form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <motion.form
                  key="otp-form"
                  onSubmit={handleOtpSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="w-5 h-5 text-orange-500" />
                    <h3 className="text-slate-200 font-semibold text-lg">
                      Verification Code
                    </h3>
                  </div>

                  <p className="text-sm text-slate-400 mb-6">
                    We've sent a 6-digit code to <strong>{email}</strong>
                  </p>

                  {/* Error/Success Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center space-x-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-green-900/20 border border-green-500/50 rounded-xl flex items-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-400">{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* OTP Input */}
                  <div className="flex gap-2 justify-center">
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
                        className="w-12 h-14 text-center text-2xl font-bold bg-slate-900/60 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-white transition-all"
                        style={{ minWidth: '44px', minHeight: '52px' }}
                      />
                    ))}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
                    whileHover={!isLoading && otp.join('').length === 6 ? { scale: 1.02 } : undefined}
                    whileTap={!isLoading && otp.join('').length === 6 ? { scale: 0.98 } : undefined}
                    style={{ minHeight: '52px' }}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </motion.button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email')
                        setOtp(['', '', '', '', '', ''])
                        setError('')
                        setSuccess('')
                      }}
                      className="text-sm text-slate-400 hover:text-orange-500 transition-colors"
                    >
                      Use different email?
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Step 3: Reset Password */}
              {step === 'reset' && (
                <motion.form
                  key="reset-form"
                  onSubmit={handlePasswordReset}
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-semibold text-slate-200 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative group">
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-slate-900/60 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-white placeholder-slate-500 transition-all group-hover:border-slate-500"
                        placeholder="Enter new password"
                        required
                        style={{ minHeight: '44px' }}
                      />
                      <Lock className="absolute left-3.5 top-4 h-5 w-5 text-slate-500 group-hover:text-slate-400 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-4 text-slate-500 hover:text-slate-300 transition-colors"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <AnimatePresence>
                      {newPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2"
                        >
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                              initial={{ width: 0 }}
                              animate={{
                                width:
                                  passwordStrength === 0 ? '0%' :
                                  passwordStrength === 1 ? '33.33%' :
                                  passwordStrength === 2 ? '66.66%' : '100%'
                              }}
                            />
                          </div>
                          {passwordStrength > 0 && (
                            <p className="text-xs mt-1 text-slate-400">
                              Password strength: {getPasswordStrengthLabel(passwordStrength)}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-semibold text-slate-200 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-slate-900/60 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-white placeholder-slate-500 transition-all group-hover:border-slate-500"
                        placeholder="Confirm new password"
                        required
                        style={{ minHeight: '44px' }}
                      />
                      <Lock className="absolute left-3.5 top-4 h-5 w-5 text-slate-500 group-hover:text-slate-400 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-4 text-slate-500 hover:text-slate-300 transition-colors"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    <AnimatePresence>
                      {confirmPassword && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 flex items-center space-x-1"
                        >
                          {newPassword === confirmPassword ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <p className="text-xs text-green-500">Passwords match</p>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-red-500" />
                              <p className="text-xs text-red-500">Passwords do not match</p>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error/Success Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center space-x-2"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{error}</p>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3.5 bg-green-900/20 border border-green-500/50 rounded-xl flex items-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-400">{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password Requirements */}
                  <div className="p-3 bg-slate-900/60 rounded-xl">
                    <p className="text-xs text-slate-400 mb-2 font-semibold">Password must contain:</p>
                    <ul className="text-xs text-slate-500 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-slate-600'}`} />
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-600'}`} />
                        One uppercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-slate-600'}`} />
                        One lowercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${/\d/.test(newPassword) ? 'bg-green-500' : 'bg-slate-600'}`} />
                        One number
                      </li>
                    </ul>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25"
                    whileHover={!isLoading && newPassword && confirmPassword && newPassword === confirmPassword ? { scale: 1.02 } : undefined}
                    whileTap={!isLoading && newPassword && confirmPassword && newPassword === confirmPassword ? { scale: 0.98 } : undefined}
                    style={{ minHeight: '52px' }}
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <a
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </a>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
