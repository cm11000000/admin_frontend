'use client'

import React, { useState } from 'react'
import { Lock, Eye, EyeOff, Save, Shield, CheckCircle2, AlertCircle, Key } from 'lucide-react'

export default function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const passwordRequirements = [
    { id: 1, text: 'At least 8 characters long', met: formData.newPassword.length >= 8 },
    { id: 2, text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
    { id: 3, text: 'Contains lowercase letter', met: /[a-z]/.test(formData.newPassword) },
    { id: 4, text: 'Contains number', met: /[0-9]/.test(formData.newPassword) },
    { id: 5, text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (!passwordRequirements.every(req => req.met)) {
      newErrors.newPassword = 'Password does not meet all requirements'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      console.log('Password change submitted')
      setShowSuccess(true)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setErrors({})

      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    }
  }

  const getPasswordStrength = () => {
    const metRequirements = passwordRequirements.filter(req => req.met).length
    if (metRequirements === 0) return { label: '', color: '' }
    if (metRequirements <= 2) return { label: 'Weak', color: 'bg-red-500' }
    if (metRequirements <= 3) return { label: 'Fair', color: 'bg-yellow-500' }
    if (metRequirements <= 4) return { label: 'Good', color: 'bg-blue-500' }
    return { label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Change Password</h1>
            <p className="text-sm text-gray-400">Update your account password securely</p>
          </div>
        </div>

        {showSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-1">Password Changed Successfully!</h3>
                <p className="text-xs text-green-300">Your password has been updated. Please use your new password for future logins.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Change Password Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Key className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Update Password</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className={`w-full pl-10 pr-12 py-2.5 bg-gray-50/60 border ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-400 mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value })
                        if (errors.newPassword) {
                          setErrors({ ...errors, newPassword: '' })
                        }
                      }}
                      className={`w-full pl-10 pr-12 py-2.5 bg-gray-50/60 border ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-400 mt-1">{errors.newPassword}</p>
                  )}

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Password Strength:</span>
                        {passwordStrength.label && (
                          <span className={`text-xs font-medium ${
                            passwordStrength.color.replace('bg-', 'text-')
                          }`}>
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordRequirements.filter(req => req.met).length / passwordRequirements.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value })
                        if (errors.confirmPassword) {
                          setErrors({ ...errors, confirmPassword: '' })
                        }
                      }}
                      className={`w-full pl-10 pr-12 py-2.5 bg-gray-50/60 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all mt-6"
                >
                  <Save className="w-4 h-4" />
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* Password Requirements & Security Tips */}
          <div className="lg:col-span-1 space-y-4">
            {/* Password Requirements */}
            <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-semibold text-gray-900">Password Requirements</h3>
              </div>
              <ul className="space-y-2.5">
                {passwordRequirements.map((req) => (
                  <li key={req.id} className="flex items-start gap-2 text-xs">
                    {req.met ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={req.met ? 'text-green-400' : 'text-gray-400'}>
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security Tips */}
            <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-gray-900">Security Tips</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>Never share your password with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>Use a unique password for this account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>Change your password regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>Avoid using personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>Consider using a password manager</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
