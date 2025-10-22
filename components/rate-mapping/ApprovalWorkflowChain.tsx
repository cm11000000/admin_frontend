'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn, formatDateTime } from '@/lib/utils'
import type { IApproval } from '@/types/rateMapping'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface ApprovalWorkflowChainProps {
  approvals: IApproval[]
  className?: string
}

export function ApprovalWorkflowChain({ approvals, className }: ApprovalWorkflowChainProps) {
  const sortedApprovals = [...approvals].sort((a, b) => a.level - b.level)

  return (
    <Card className={cn('p-6', className)}>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
        Approval Workflow
      </h3>

      <div className="relative">
        {sortedApprovals.map((approval, index) => (
          <ApprovalStep
            key={approval.id}
            approval={approval}
            isLast={index === sortedApprovals.length - 1}
            index={index}
          />
        ))}
      </div>
    </Card>
  )
}

interface ApprovalStepProps {
  approval: IApproval
  isLast: boolean
  index: number
}

function ApprovalStep({ approval, isLast, index }: ApprovalStepProps) {
  const getStatusColor = (status: IApproval['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      case 'changes_requested':
        return 'bg-yellow-500'
      case 'pending':
        return 'bg-slate-300 dark:bg-slate-600'
      default:
        return 'bg-slate-300'
    }
  }

  const getStatusIcon = (status: IApproval['status']) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'changes_requested':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: IApproval['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>
      case 'changes_requested':
        return <Badge variant="warning">Changes Requested</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pb-8"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full transition-all',
              getStatusColor(approval.status)
            )}
          >
            {getStatusIcon(approval.status)}
          </div>

          {!isLast && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-200 dark:bg-slate-700" />
          )}
        </div>

        <div className="flex-1 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Level {approval.level}: {approval.approverRole}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {approval.approverName}
              </p>
            </div>
            {getStatusBadge(approval.status)}
          </div>

          {approval.timestamp && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
              {formatDateTime(approval.timestamp)}
            </p>
          )}

          {approval.notes && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notes:
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{approval.notes}</p>
            </div>
          )}

          {approval.status === 'pending' && (
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 touch-manipulation">
                Approve
              </button>
              <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 touch-manipulation">
                Reject
              </button>
              <button className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 touch-manipulation">
                Request Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
