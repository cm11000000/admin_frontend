'use client'
// Client-only page; safe for static export

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRateMappingStore } from '@/stores/rateMappingStore'
import RateMappingApiService from '@/services/api/RateMappingApiService'
import { RateCompareView } from '@/components/rate-mapping/RateCompareView'
import { ImpactAnalysisCard } from '@/components/rate-mapping/ImpactAnalysisCard'
import { ApprovalWorkflowChain } from '@/components/rate-mapping/ApprovalWorkflowChain'
import { RateComparisonSkeleton, ImpactAnalysisSkeleton } from '@/components/rate-mapping/RateMappingSkeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import type { IRateUpdateRequest, IRateComparison, UpdateRequestStatus } from '@/types/rateMapping'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RateUpdateWorkflowPage() {
  const store = useRateMappingStore() as any
  const updateRequests = Array.isArray(store?.updateRequests) ? store.updateRequests : []
  const setUpdateRequests = (store?.setUpdateRequests as any) || (() => {})
  const selectedUpdateRequest = store?.selectedUpdateRequest || null
  const setSelectedUpdateRequest = (store?.setSelectedUpdateRequest as any) || (() => {})
  const updateRequestsLoading = !!store?.updateRequestsLoading
  const setUpdateRequestsLoading = (store?.setUpdateRequestsLoading as any) || (() => {})
  const updateRequestFilter = (store?.updateRequestFilter as any) || 'all'
  const setUpdateRequestFilter = (store?.setUpdateRequestFilter as any) || (() => {})

  const [comparisons, setComparisons] = useState<IRateComparison[]>([])

  useEffect(() => {
    loadUpdateRequests()
  }, [updateRequestFilter])

  useEffect(() => {
    if (selectedUpdateRequest) {
      generateComparisons(selectedUpdateRequest)
    }
  }, [selectedUpdateRequest])

  const loadUpdateRequests = async () => {
    setUpdateRequestsLoading(true)

    try {
      const { data } = await RateMappingApiService.getUpdateRequests(updateRequestFilter)
      setUpdateRequests(data)
    } catch (error) {
      toast.error('Failed to load update requests')
    } finally {
      setUpdateRequestsLoading(false)
    }
  }

  const generateComparisons = (request: IRateUpdateRequest) => {
    const comparisonData: IRateComparison[] = request.proposedRates.map((proposed, index) => {
      const current = request.currentRates[index]

      const merchantMDRDiff = proposed.merchantMDR - current.merchantMDR
      const gatewayMDRDiff = proposed.gatewayMDR - current.gatewayMDR
      const fixedChargeDiff = proposed.fixedCharge - current.fixedCharge

      return {
        rateId: proposed.id,
        gateway: proposed.gateway,
        paymentMode: proposed.paymentMode,
        subCategory: proposed.subCategory,
        current: {
          merchantMDR: current.merchantMDR,
          gatewayMDR: current.gatewayMDR,
          fixedCharge: current.fixedCharge,
          isActive: current.isActive
        },
        proposed: {
          merchantMDR: proposed.merchantMDR,
          gatewayMDR: proposed.gatewayMDR,
          fixedCharge: proposed.fixedCharge,
          isActive: proposed.isActive
        },
        difference: {
          merchantMDR: merchantMDRDiff,
          gatewayMDR: gatewayMDRDiff,
          fixedCharge: fixedChargeDiff
        },
        percentageChange: {
          merchantMDR: current.merchantMDR !== 0 ? (merchantMDRDiff / current.merchantMDR) * 100 : 0,
          gatewayMDR: current.gatewayMDR !== 0 ? (gatewayMDRDiff / current.gatewayMDR) * 100 : 0,
          fixedCharge: current.fixedCharge !== 0 ? (fixedChargeDiff / current.fixedCharge) * 100 : 0
        }
      }
    })

    setComparisons(comparisonData)
  }

  const handleApprove = async (requestId: string) => {
    try {
      await RateMappingApiService.approveUpdateRequest(requestId)
      toast.success('Update request approved successfully')
      await loadUpdateRequests()
    } catch (error) {
      toast.error('Failed to approve update request')
    }
  }

  const handleReject = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      await RateMappingApiService.rejectUpdateRequest(requestId, reason)
      toast.success('Update request rejected')
      await loadUpdateRequests()
    } catch (error) {
      toast.error('Failed to reject update request')
    }
  }

  const getStatusBadge = (status: IRateUpdateRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'applied':
        return <Badge variant="secondary">Applied</Badge>
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>
      default:
        return null
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
              Rate Update Workflow
            </h1>
            <p className="text-gray-600">
              Review and approve rate configuration changes
            </p>
          </div>

          <div className="flex items-center gap-2">
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

            <Button variant="primary">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Update Request
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Update Requests
                </h3>
                <Select value={updateRequestFilter} onValueChange={(value) => setUpdateRequestFilter(value as UpdateRequestStatus)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {updateRequestsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-100 rounded mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : updateRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-sm">
                      No update requests found
                    </p>
                  </div>
                ) : (
                  updateRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedUpdateRequest(request)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedUpdateRequest?.id === request.id
                          ? 'bg-orange-50 border-2 border-orange-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {request.proposedRates.length} Rate Changes
                        </h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {request.reason.substring(0, 50)}...
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDateTime(request.createdAt)}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedUpdateRequest ? (
              <Tabs defaultValue="comparison" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
                  <TabsTrigger value="approval">Approval</TabsTrigger>
                </TabsList>

                <TabsContent value="comparison" className="space-y-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Rate Comparison
                        </h3>
                        <p className="text-sm text-gray-600">
                          Current vs Proposed Rates
                        </p>
                      </div>
                      {selectedUpdateRequest.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(selectedUpdateRequest.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(selectedUpdateRequest.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Reason:</span>
                          <p className="font-medium text-gray-900">
                            {selectedUpdateRequest.reason}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Effective Date:</span>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(selectedUpdateRequest.effectiveDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Apply To:</span>
                          <p className="font-medium text-gray-900 capitalize">
                            {selectedUpdateRequest.applyTo}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Created By:</span>
                          <p className="font-medium text-gray-900">
                            {selectedUpdateRequest.createdBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {comparisons.length > 0 ? (
                    <RateCompareView comparisons={comparisons} />
                  ) : (
                    <RateComparisonSkeleton />
                  )}
                </TabsContent>

                <TabsContent value="impact">
                  {selectedUpdateRequest.impactAnalysis ? (
                    <ImpactAnalysisCard analysis={selectedUpdateRequest.impactAnalysis} />
                  ) : (
                    <ImpactAnalysisSkeleton />
                  )}
                </TabsContent>

                <TabsContent value="approval">
                  <ApprovalWorkflowChain approvals={selectedUpdateRequest.approvalChain} />

                  {selectedUpdateRequest.supportingDocuments &&
                    selectedUpdateRequest.supportingDocuments.length > 0 && (
                      <Card className="p-6 mt-4">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">
                          Supporting Documents
                        </h4>
                        <div className="space-y-2">
                          {selectedUpdateRequest.supportingDocuments.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {doc.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {formatDateTime(doc.uploadedAt)} by {doc.uploadedBy}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  View
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="p-12 text-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 text-lg font-medium">
                  Select an update request to view details
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
