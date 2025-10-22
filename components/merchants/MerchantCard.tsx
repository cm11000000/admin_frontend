'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IMerchant } from '@/types/merchant';
import { formatDistanceToNow } from 'date-fns';

interface MerchantCardProps {
  merchant: IMerchant;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  suspended: 'bg-red-500',
  pending_approval: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  rejected: 'bg-red-700',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  pending_approval: 'Pending Approval',
  under_review: 'Under Review',
  rejected: 'Rejected',
};

export function MerchantCard({ merchant, onClick }: MerchantCardProps) {
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {merchant.businessName}
          </h3>
          <p className="text-sm text-gray-500">{merchant.merchantCode}</p>
        </div>
        <Badge
          className={`${statusColors[merchant.status]} text-white`}
        >
          {statusLabels[merchant.status]}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Category:</span>
          <span className="font-medium">{merchant.category}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Business Type:</span>
          <span className="font-medium">{merchant.businessType}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Onboarded:</span>
          <span className="font-medium">
            {formatDistanceToNow(new Date(merchant.onboardingDate), { addSuffix: true })}
          </span>
        </div>
      </div>

      {merchant.totalTransactions !== undefined && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Transactions</p>
            <p className="text-lg font-semibold">{merchant.totalTransactions?.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Volume</p>
            <p className="text-lg font-semibold">{formatCurrency(merchant.totalVolume)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Success Rate</p>
            <p className="text-lg font-semibold">{merchant.successRate?.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {merchant.tags && merchant.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {merchant.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {merchant.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{merchant.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
    </Card>
  );
}
