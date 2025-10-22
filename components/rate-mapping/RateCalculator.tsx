'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { IRateCalculationInput, IRateCalculationResult } from '@/types/rateMapping'
import toast from 'react-hot-toast'

interface RateCalculatorProps {
  onCalculate: (input: IRateCalculationInput) => Promise<IRateCalculationResult>
  gateways: { id: string; name: string }[]
  paymentModes: { id: string; name: string }[]
  subCategories?: { id: string; name: string }[]
  className?: string
}

export function RateCalculator({
  onCalculate,
  gateways,
  paymentModes,
  subCategories = [],
  className
}: RateCalculatorProps) {
  const [input, setInput] = useState<IRateCalculationInput>({
    amount: 1000,
    gateway: '',
    paymentMode: '',
    subCategory: undefined
  })

  const [result, setResult] = useState<IRateCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async () => {
    if (!input.gateway || !input.paymentMode) {
      toast.error('Please select gateway and payment mode')
      return
    }

    if (input.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    setIsCalculating(true)

    try {
      const calculationResult = await onCalculate(input)
      setResult(calculationResult)
      toast.success('Calculation completed successfully')
    } catch (error) {
      toast.error('Failed to calculate charges')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className={className}>
      <Card className="p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Transaction Simulator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Transaction Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={input.amount}
              onChange={(e) => setInput({ ...input, amount: parseFloat(e.target.value) })}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label>Gateway</Label>
            <Select value={input.gateway} onValueChange={(value) => setInput({ ...input, gateway: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gateway" />
              </SelectTrigger>
              <SelectContent>
                {gateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.id}>
                    {gateway.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select value={input.paymentMode} onValueChange={(value) => setInput({ ...input, paymentMode: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    {mode.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subCategories.length > 0 && (
            <div className="space-y-2">
              <Label>Sub Category (Optional)</Label>
              <Select value={input.subCategory} onValueChange={(value) => setInput({ ...input, subCategory: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sub category" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          onClick={handleCalculate}
          loading={isCalculating}
          variant="primary"
          fullWidth
          size="lg"
        >
          Calculate Charges
        </Button>
      </Card>

      {result && (
        <Card className="p-6 mt-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
            Calculation Results
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Transaction Amount
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(result.amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Settlement Cycle
                </p>
                <Badge variant="secondary" className="text-sm">
                  {result.settlementCycle} days
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Charge Breakdown
              </h5>

              {result.breakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-900 dark:text-slate-100">
                      {item.label}
                    </span>
                    {item.percentage !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {item.percentage}%
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-slate-300 dark:border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Charges
                </span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(result.totalCharges)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Net Amount
                </span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(result.netAmount)}
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h6 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Rate Configuration Used
              </h6>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Merchant MDR:</span>{' '}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {result.rateConfigUsed.merchantMDR}%
                  </span>
                </div>
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Gateway MDR:</span>{' '}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {result.rateConfigUsed.gatewayMDR}%
                  </span>
                </div>
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Fixed Charge:</span>{' '}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {formatCurrency(result.rateConfigUsed.fixedCharge)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-800 dark:text-blue-200">Priority:</span>{' '}
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    {result.rateConfigUsed.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
