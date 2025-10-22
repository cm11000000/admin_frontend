/**
 * Chargeback Card Component
 * Display chargeback summary in card format
 */
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IChargeback } from '@/types/chargeback';
import { ChargebackStatusBadge, ChargebackPriorityBadge, OverdueBadge } from './ChargebackStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Clock, FileText, User } from 'lucide-react';
import Link from 'next/link';

interface ChargebackCardProps {
  chargeback: IChargeback;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export function ChargebackCard({ chargeback, onSelect, isSelected }: ChargebackCardProps) {
  const daysText = chargeback.daysUntilDue !== undefined
    ? chargeback.daysUntilDue < 0
      ? `${Math.abs(chargeback.daysUntilDue)} days overdue`
      : `${chargeback.daysUntilDue} days remaining`
    : '';

  return (
    <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/chargebacks/${chargeback.id}`}
                className="font-semibold text-lg hover:text-primary"
              >
                #{chargeback.chargebackId}
              </Link>
              {chargeback.isOverdue && <OverdueBadge />}
            </div>
            <p className="text-sm text-muted-foreground">
              Transaction: {chargeback.transactionId}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <ChargebackStatusBadge status={chargeback.status} />
            <ChargebackPriorityBadge priority={chargeback.priority} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrency(chargeback.amount)}</p>
            <p className="text-sm text-muted-foreground">{chargeback.currency}</p>
          </div>
          {chargeback.daysUntilDue !== undefined && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span className={chargeback.isOverdue ? 'text-red-600 font-semibold' : ''}>
                  {daysText}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Due: {formatDate(chargeback.dueDate)}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{chargeback.reasonCode}</p>
              <p className="text-muted-foreground">{chargeback.reasonDescription}</p>
            </div>
          </div>

          {chargeback.customer && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{chargeback.customer.email}</p>
                {chargeback.customer.name && (
                  <p className="text-xs text-muted-foreground">{chargeback.customer.name}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            <p>Evidence: {chargeback.evidence.length} files</p>
            <p>Created: {formatDate(chargeback.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/chargebacks/${chargeback.id}`}>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </Link>
            {onSelect && (
              <Button
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => onSelect(chargeback.id)}
              >
                {isSelected ? 'Selected' : 'Select'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
