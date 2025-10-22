'use client'

import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { AlertTriangle } from 'lucide-react'

interface StatusToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  description?: string
  confirmationMessage?: string
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export default function StatusToggle({
  checked,
  onCheckedChange,
  label,
  description,
  confirmationMessage,
  disabled = false,
  loading = false,
  size = 'md',
  variant = 'default'
}: StatusToggleProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingValue, setPendingValue] = useState(false)

  const handleToggle = (newValue: boolean) => {
    if (confirmationMessage) {
      setPendingValue(newValue)
      setShowConfirmation(true)
    } else {
      onCheckedChange(newValue)
    }
  }

  const handleConfirm = () => {
    onCheckedChange(pendingValue)
    setShowConfirmation(false)
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  return (
    <>
      <div className="relative">
        <Switch
          checked={checked}
          onCheckedChange={handleToggle}
          disabled={disabled || loading}
          size={size}
          variant={variant}
          label={label}
          description={description}
          animate={!loading}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg">
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Confirm Change</h3>
            </div>
            <p className="text-slate-300 mb-6">{confirmationMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
