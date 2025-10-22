'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRateMappingStore } from '@/stores/rateMappingStore'
import RateMappingApiService from '@/services/api/RateMappingApiService'
import { RateCalculator } from '@/components/rate-mapping/RateCalculator'
import { RateCalculatorSkeleton } from '@/components/rate-mapping/RateMappingSkeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { IRateCalculationInput, IRateCalculationResult } from '@/types/rateMapping'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RateCalculatorPage() {
  const { gateways, setGateways, paymentModes, setPaymentModes } = useRateMappingStore()
  const [isLoading, setIsLoading] = useState(true)
  const [gatewayComparison, setGatewayComparison] = useState<any[]>([])
  const [comparisonAmount, setComparisonAmount] = useState(1000)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)

    try {
      const [gatewaysData, paymentModesData] = await Promise.all([
        RateMappingApiService.getGateways(),
        RateMappingApiService.getPaymentModes()
      ])

      setGateways(gatewaysData)
      setPaymentModes(paymentModesData)
    } catch (error) {
      toast.error('Failed to load initial data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculate = async (input: IRateCalculationInput): Promise<IRateCalculationResult> => {
    try {
      const result = await RateMappingApiService.calculateCharges(input)
      return result
    } catch (error) {
      throw new Error('Calculation failed')
    }
  }

  const handleCompareGateways = async () => {
    if (!paymentModes[0]) {
      toast.error('No payment modes available')
      return
    }

    try {
      const comparison = await RateMappingApiService.compareGatewayRates(
        comparisonAmount,
        paymentModes[0].id
      )

      setGatewayComparison(comparison)
      toast.success('Gateway comparison completed')
    } catch (error) {
      toast.error('Failed to compare gateways')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Rate Calculator & Simulator
            </h1>
            <p className="text-gray-600">
              Calculate transaction charges and compare gateway rates
            </p>
          </div>

          <Link href="/config/rate-mapping">
            <Button variant="outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Configuration
            </Button>
          </Link>
        </motion.div>

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simulator">Transaction Simulator</TabsTrigger>
            <TabsTrigger value="comparison">Gateway Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            {isLoading ? (
              <RateCalculatorSkeleton />
            ) : (
              <RateCalculator
                onCalculate={handleCalculate}
                gateways={gateways.map((g) => ({ id: g.id, name: g.name }))}
                paymentModes={paymentModes.map((p) => ({ id: p.id, name: p.name }))}
              />
            )}
          </TabsContent>

          <TabsContent value="comparison">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Compare Rates Across Gateways
              </h3>

              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={comparisonAmount}
                    onChange={(e) => setComparisonAmount(parseFloat(e.target.value))}
                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-end">
                  <Button variant="primary" onClick={handleCompareGateways}>
                    Compare Gateways
                  </Button>
                </div>
              </div>

              {gatewayComparison.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Comparison Results
                  </h4>

                  <div className="grid gap-3">
                    {gatewayComparison
                      .sort((a, b) => a.ranking - b.ranking)
                      .map((item, index) => (
                        <motion.div
                          key={item.gateway}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            index === 0
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                                  index === 0
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <h5 className="text-lg font-bold text-gray-900">
                                {item.gatewayName}
                              </h5>
                            </div>

                            {index === 0 && (
                              <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                Best Rate
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">
                                Merchant MDR
                              </p>
                              <p className="font-semibold text-gray-900">
                                {item.merchantMDR}%
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-600 mb-1">
                                Gateway MDR
                              </p>
                              <p className="font-semibold text-gray-900">
                                {item.gatewayMDR}%
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-600 mb-1">
                                Total Charges
                              </p>
                              <p className="font-semibold text-red-600">
                                ₹{item.totalCharges.toFixed(2)}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-600 mb-1">
                                Net Amount
                              </p>
                              <p className="font-semibold text-green-600">
                                ₹{item.netAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="text-sm font-semibold text-blue-900 mb-2">
                      Comparison Summary
                    </h5>
                    <p className="text-xs text-blue-800">
                      Rankings are based on the lowest total charges for the merchant.
                      Gateway fees, merchant fees, and fixed charges are all included in the calculation.
                    </p>
                  </div>
                </div>
              )}

              {gatewayComparison.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg font-medium">
                    Click "Compare Gateways" to see rate comparison
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
