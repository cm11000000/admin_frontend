'use client'

import React, { ReactNode } from 'react'
import { Save, X, RefreshCw } from 'lucide-react'

interface ConfigFormProps {
  title: string
  description?: string
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  loading?: boolean
  submitText?: string
  cancelText?: string
  className?: string
}

export default function ConfigForm({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Save Changes',
  cancelText = 'Cancel',
  className = ''
}: ConfigFormProps) {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && (
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <div className="p-6 space-y-4">
          {children}
        </div>

        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700/50 flex flex-col sm:flex-row justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              <span>{cancelText}</span>
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/25"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{submitText}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// Form Field Component
interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  required = false,
  error,
  children,
  className = ''
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

// Form Input Component
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function FormInput({ error, className = '', ...props }: FormInputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 bg-slate-900/60 border ${
        error ? 'border-red-500' : 'border-slate-600'
      } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
        error ? 'focus:ring-red-500/50' : 'focus:ring-orange-500/50'
      } transition-all ${className}`}
    />
  )
}

// Form Select Component
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: { value: string; label: string }[]
}

export function FormSelect({ error, options, className = '', ...props }: FormSelectProps) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 bg-slate-900/60 border ${
        error ? 'border-red-500' : 'border-slate-600'
      } rounded-lg text-white focus:outline-none focus:ring-2 ${
        error ? 'focus:ring-red-500/50' : 'focus:ring-orange-500/50'
      } transition-all ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

// Form Textarea Component
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function FormTextarea({ error, className = '', ...props }: FormTextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 bg-slate-900/60 border ${
        error ? 'border-red-500' : 'border-slate-600'
      } rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 ${
        error ? 'focus:ring-red-500/50' : 'focus:ring-orange-500/50'
      } transition-all ${className}`}
    />
  )
}
