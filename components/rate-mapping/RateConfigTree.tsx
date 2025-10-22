'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import type { IRateTreeNode } from '@/types/rateMapping'
import { useRateMappingStore } from '@/stores/rateMappingStore'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface RateConfigTreeProps {
  nodes: IRateTreeNode[]
  onNodeClick?: (node: IRateTreeNode) => void
  onNodeDoubleClick?: (node: IRateTreeNode) => void
  enableSelection?: boolean
  enableQuickEdit?: boolean
  className?: string
}

export function RateConfigTree({
  nodes,
  onNodeClick,
  onNodeDoubleClick,
  enableSelection = false,
  enableQuickEdit = false,
  className
}: RateConfigTreeProps) {
  const {
    expandedNodes,
    toggleNode,
    selectedRates,
    addSelectedRate,
    removeSelectedRate,
    bulkEditMode
  } = useRateMappingStore()

  const handleToggle = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toggleNode(nodeId)
  }

  const handleNodeClick = (node: IRateTreeNode, e: React.MouseEvent) => {
    e.stopPropagation()
    onNodeClick?.(node)
  }

  const handleNodeDoubleClick = (node: IRateTreeNode, e: React.MouseEvent) => {
    e.stopPropagation()
    if (enableQuickEdit) {
      onNodeDoubleClick?.(node)
    }
  }

  const handleCheckboxChange = (nodeId: string, checked: boolean) => {
    if (checked) {
      addSelectedRate(nodeId)
    } else {
      removeSelectedRate(nodeId)
    }
  }

  return (
    <div className={cn('space-y-1', className)}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          expanded={expandedNodes.has(node.id)}
          selected={selectedRates.includes(node.id)}
          onToggle={handleToggle}
          onClick={handleNodeClick}
          onDoubleClick={handleNodeDoubleClick}
          onCheckboxChange={handleCheckboxChange}
          enableSelection={enableSelection || bulkEditMode}
        />
      ))}
    </div>
  )
}

interface TreeNodeProps {
  node: IRateTreeNode
  level: number
  expanded: boolean
  selected: boolean
  onToggle: (nodeId: string, e: React.MouseEvent) => void
  onClick: (node: IRateTreeNode, e: React.MouseEvent) => void
  onDoubleClick: (node: IRateTreeNode, e: React.MouseEvent) => void
  onCheckboxChange: (nodeId: string, checked: boolean) => void
  enableSelection: boolean
}

function TreeNode({
  node,
  level,
  expanded,
  selected,
  onToggle,
  onClick,
  onDoubleClick,
  onCheckboxChange,
  enableSelection
}: TreeNodeProps) {
  const { expandedNodes } = useRateMappingStore()
  const hasChildren = node.children && node.children.length > 0
  const paddingLeft = level * 24

  const getLevelIcon = (level: 'gateway' | 'paymentMode' | 'subCategory') => {
    switch (level) {
      case 'gateway':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            G
          </div>
        )
      case 'paymentMode':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
            P
          </div>
        )
      case 'subCategory':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-semibold">
            S
          </div>
        )
    }
  }

  return (
    <div>
      <motion.div
        initial={false}
        animate={{
          backgroundColor: selected
            ? 'rgba(249, 115, 22, 0.1)'
            : 'rgba(0, 0, 0, 0)'
        }}
        className={cn(
          'group rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent',
          selected && 'border-orange-200 dark:border-orange-900/50'
        )}
      >
        <div
          className="flex items-center gap-3 p-3 cursor-pointer"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={(e) => onClick(node, e)}
          onDoubleClick={(e) => onDoubleClick(node, e)}
        >
          {hasChildren && (
            <button
              onClick={(e) => onToggle(node.id, e)}
              className="flex-shrink-0 w-6 h-6 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 touch-manipulation"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              <motion.svg
                className="w-4 h-4 text-slate-600 dark:text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </button>
          )}

          {!hasChildren && <div className="w-6" />}

          {enableSelection && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) =>
                onCheckboxChange(node.id, checked as boolean)
              }
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            />
          )}

          {getLevelIcon(node.level)}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {node.level === 'gateway' && node.gateway}
                {node.level === 'paymentMode' && node.paymentMode}
                {node.level === 'subCategory' && node.subCategory}
              </h4>
              <Badge
                variant={node.isActive ? 'success' : 'secondary'}
                className="flex-shrink-0"
              >
                {node.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Merchant MDR:</span>{' '}
                      <span className="text-slate-900 dark:text-slate-100">
                        {node.merchantMDR}%
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Merchant Discount Rate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Gateway MDR:</span>{' '}
                      <span className="text-slate-900 dark:text-slate-100">
                        {node.gatewayMDR}%
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gateway Discount Rate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-medium">Fixed:</span>{' '}
                <span className="text-slate-900 dark:text-slate-100">
                  {formatCurrency(node.fixedCharge)}
                </span>
              </div>

              <div className="text-slate-600 dark:text-slate-400">
                <span className="font-medium">Settlement:</span>{' '}
                <span className="text-slate-900 dark:text-slate-100">
                  {node.settlementCycle}d
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDoubleClick(node, e)
                    }}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 touch-manipulation"
                    aria-label="Edit"
                  >
                    <svg
                      className="w-4 h-4 text-slate-600 dark:text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Rate</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 touch-manipulation"
                    aria-label="More options"
                  >
                    <svg
                      className="w-4 h-4 text-slate-600 dark:text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More Options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-1">
              {node.children!.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  expanded={expandedNodes.has(child.id)}
                  selected={useRateMappingStore
                    .getState()
                    .selectedRates.includes(child.id)}
                  onToggle={onToggle}
                  onClick={onClick}
                  onDoubleClick={onDoubleClick}
                  onCheckboxChange={onCheckboxChange}
                  enableSelection={enableSelection}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
