'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { IRateConfig } from '@/types/rateMapping'
import toast from 'react-hot-toast'

interface RateEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rate: IRateConfig | null
  onSave: (rate: Partial<IRateConfig>) => Promise<void>
  mode?: 'create' | 'edit'
}

interface ValidationErrors {
  merchantMDR?: string
  gatewayMDR?: string
  fixedCharge?: string
  minAmount?: string
  maxAmount?: string
  settlementCycle?: string
  priority?: string
  effectiveFrom?: string
  effectiveTo?: string
}

export function RateEditModal({
  open,
  onOpenChange,
  rate,
  onSave,
  mode = 'edit'
}: RateEditModalProps) {
  const [formData, setFormData] = useState<Partial<IRateConfig>>({
    merchantMDR: 0,
    gatewayMDR: 0,
    fixedCharge: 0,
    minAmount: 0,
    maxAmount: 0,
    settlementCycle: 1,
    isActive: true,
    priority: 1,
    effectiveFrom: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (rate && mode === 'edit') {
      setFormData({
        merchantMDR: rate.merchantMDR,
        gatewayMDR: rate.gatewayMDR,
        fixedCharge: rate.fixedCharge,
        minAmount: rate.minAmount,
        maxAmount: rate.maxAmount,
        settlementCycle: rate.settlementCycle,
        isActive: rate.isActive,
        priority: rate.priority,
        effectiveFrom: rate.effectiveFrom.split('T')[0],
        effectiveTo: rate.effectiveTo?.split('T')[0]
      })
      setHasChanges(false)
    }
  }, [rate, mode, open])

  const validateField = (field: keyof IRateConfig, value: any): string | undefined => {
    switch (field) {
      case 'merchantMDR':
        if (value < 0) return 'Merchant MDR cannot be negative'
        if (value > 100) return 'Merchant MDR cannot exceed 100%'
        if (formData.gatewayMDR && value > formData.gatewayMDR) {
          return 'Merchant MDR must be less than or equal to Gateway MDR'
        }
        return undefined

      case 'gatewayMDR':
        if (value < 0) return 'Gateway MDR cannot be negative'
        if (value > 100) return 'Gateway MDR cannot exceed 100%'
        if (formData.merchantMDR && value < formData.merchantMDR) {
          return 'Gateway MDR must be greater than or equal to Merchant MDR'
        }
        return undefined

      case 'fixedCharge':
        if (value < 0) return 'Fixed charge cannot be negative'
        return undefined

      case 'minAmount':
        if (value < 0) return 'Minimum amount cannot be negative'
        if (formData.maxAmount && value > formData.maxAmount) {
          return 'Minimum amount must be less than maximum amount'
        }
        return undefined

      case 'maxAmount':
        if (value < 0) return 'Maximum amount cannot be negative'
        if (formData.minAmount && value < formData.minAmount) {
          return 'Maximum amount must be greater than minimum amount'
        }
        return undefined

      case 'settlementCycle':
        if (value < 0) return 'Settlement cycle cannot be negative'
        if (value > 365) return 'Settlement cycle cannot exceed 365 days'
        return undefined

      case 'priority':
        if (value < 1) return 'Priority must be at least 1'
        if (value > 100) return 'Priority cannot exceed 100'
        return undefined

      case 'effectiveFrom':
        if (!value) return 'Effective from date is required'
        return undefined

      case 'effectiveTo':
        if (value && formData.effectiveFrom && new Date(value) <= new Date(formData.effectiveFrom)) {
          return 'Effective to date must be after effective from date'
        }
        return undefined

      default:
        return undefined
    }
  }

  const handleFieldChange = (field: keyof IRateConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)

    const error = validateField(field, value)
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }))

    if (field === 'merchantMDR' && formData.gatewayMDR) {
      const gatewayError = validateField('gatewayMDR', formData.gatewayMDR)
      setErrors((prev) => ({ ...prev, gatewayMDR: gatewayError }))
    }

    if (field === 'gatewayMDR' && formData.merchantMDR) {
      const merchantError = validateField('merchantMDR', formData.merchantMDR)
      setErrors((prev) => ({ ...prev, merchantMDR: merchantError }))
    }

    if (field === 'minAmount' && formData.maxAmount) {
      const maxError = validateField('maxAmount', formData.maxAmount)
      setErrors((prev) => ({ ...prev, maxAmount: maxError }))
    }

    if (field === 'maxAmount' && formData.minAmount) {
      const minError = validateField('minAmount', formData.minAmount)
      setErrors((prev) => ({ ...prev, minAmount: minError }))
    }

    if (field === 'effectiveFrom' && formData.effectiveTo) {
      const toError = validateField('effectiveTo', formData.effectiveTo)
      setErrors((prev) => ({ ...prev, effectiveTo: toError }))
    }
  }

  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const error = validateField(key as keyof IRateConfig, formData[key as keyof IRateConfig])
      if (error) {
        newErrors[key as keyof ValidationErrors] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateAll()) {
      toast.error('Please fix validation errors before saving')
      return
    }

    setIsSubmitting(true)

    try {
      await onSave(formData)
      toast.success(mode === 'create' ? 'Rate created successfully' : 'Rate updated successfully')
      onOpenChange(false)
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save rate configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onOpenChange(false)
        setHasChanges(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  const calculateExample = (amount: number = 1000) => {
    const merchantMDRAmount = (amount * (formData.merchantMDR || 0)) / 100
    const fixedChargeAmount = formData.fixedCharge || 0
    const totalCharges = merchantMDRAmount + fixedChargeAmount
    const netAmount = amount - totalCharges

    return { merchantMDRAmount, fixedChargeAmount, totalCharges, netAmount }
  }

  const example = calculateExample()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create' : 'Edit'} Rate Configuration
          </DialogTitle>
          <DialogDescription>
            Configure rate parameters for {rate?.gateway} - {rate?.paymentMode}
            {rate?.subCategory && ` - ${rate.subCategory}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="limits">Limits & Rules</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merchantMDR">
                  Merchant MDR (%)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="merchantMDR"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.merchantMDR}
                  onChange={(e) =>
                    handleFieldChange('merchantMDR', parseFloat(e.target.value))
                  }
                  error={errors.merchantMDR}
                />
                {errors.merchantMDR && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.merchantMDR}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gatewayMDR">
                  Gateway MDR (%)
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="gatewayMDR"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.gatewayMDR}
                  onChange={(e) =>
                    handleFieldChange('gatewayMDR', parseFloat(e.target.value))
                  }
                  error={errors.gatewayMDR}
                />
                {errors.gatewayMDR && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.gatewayMDR}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fixedCharge">Fixed Charge (₹)</Label>
                <Input
                  id="fixedCharge"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fixedCharge}
                  onChange={(e) =>
                    handleFieldChange('fixedCharge', parseFloat(e.target.value))
                  }
                  error={errors.fixedCharge}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settlementCycle">Settlement Cycle (days)</Label>
                <Input
                  id="settlementCycle"
                  type="number"
                  min="0"
                  max="365"
                  value={formData.settlementCycle}
                  onChange={(e) =>
                    handleFieldChange('settlementCycle', parseInt(e.target.value))
                  }
                  error={errors.settlementCycle}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.priority}
                  onChange={(e) =>
                    handleFieldChange('priority', parseInt(e.target.value))
                  }
                  error={errors.priority}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Higher priority rules are applied first
                </p>
              </div>

              <div className="space-y-2 flex items-center justify-between pt-6">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="limits" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minAmount}
                  onChange={(e) =>
                    handleFieldChange('minAmount', parseFloat(e.target.value))
                  }
                  error={errors.minAmount}
                />
                {errors.minAmount && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.minAmount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxAmount}
                  onChange={(e) =>
                    handleFieldChange('maxAmount', parseFloat(e.target.value))
                  }
                  error={errors.maxAmount}
                />
                {errors.maxAmount && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.maxAmount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">
                  Effective From
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => handleFieldChange('effectiveFrom', e.target.value)}
                  error={errors.effectiveFrom}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveTo">Effective To</Label>
                <Input
                  id="effectiveTo"
                  type="date"
                  value={formData.effectiveTo || ''}
                  onChange={(e) => handleFieldChange('effectiveTo', e.target.value)}
                  error={errors.effectiveTo}
                />
                {errors.effectiveTo && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.effectiveTo}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Validation Rules
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Merchant MDR must be ≤ Gateway MDR
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Minimum amount must be &lt; Maximum amount
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  All percentages must be between 0% and 100%
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Calculation Example (₹1,000 transaction)
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Transaction Amount
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    ₹1,000.00
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Merchant MDR ({formData.merchantMDR}%)
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    - ₹{example.merchantMDRAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Fixed Charge
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    - ₹{example.fixedChargeAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b-2 border-slate-300 dark:border-slate-600">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Total Charges
                  </span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    - ₹{example.totalCharges.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Net Amount
                  </span>
                  <span className="text-base font-bold text-green-600 dark:text-green-400">
                    ₹{example.netAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white dark:bg-slate-950 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Settlement in{' '}
                  <Badge variant="secondary" className="inline-block">
                    {formData.settlementCycle} days
                  </Badge>
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <h5 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Rate Configuration Summary
              </h5>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <dt className="text-yellow-800 dark:text-yellow-200">Gateway:</dt>
                <dd className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {rate?.gateway || 'N/A'}
                </dd>
                <dt className="text-yellow-800 dark:text-yellow-200">Payment Mode:</dt>
                <dd className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {rate?.paymentMode || 'N/A'}
                </dd>
                {rate?.subCategory && (
                  <>
                    <dt className="text-yellow-800 dark:text-yellow-200">Sub Category:</dt>
                    <dd className="font-semibold text-yellow-900 dark:text-yellow-100">
                      {rate.subCategory}
                    </dd>
                  </>
                )}
                <dt className="text-yellow-800 dark:text-yellow-200">Status:</dt>
                <dd>
                  <Badge variant={formData.isActive ? 'success' : 'secondary'}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </dd>
              </dl>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={Object.keys(errors).some((key) => errors[key as keyof ValidationErrors])}
          >
            {mode === 'create' ? 'Create' : 'Save'} Rate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
