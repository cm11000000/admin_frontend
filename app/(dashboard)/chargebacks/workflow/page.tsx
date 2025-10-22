/**
 * Chargeback Workflow Kanban Board
 * Drag-and-drop workflow management for chargebacks
 */
'use client';
// Client-only page; safe for static export

import { useEffect } from 'react';
import { useChargebackStore } from '@/stores/chargebackStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChargebackStatusBadge, ChargebackPriorityBadge, OverdueBadge } from '@/components/chargebacks/ChargebackStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { RefreshCw, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { ChargebackStatus } from '@/types/chargeback';

export default function ChargebackWorkflowPage() {
  if (typeof window === 'undefined') return null;
  const {
    workflowColumns = [],
    isLoading = false,
    fetchWorkflowBoard = () => Promise.resolve(),
    moveToStatus = () => Promise.resolve(),
  } = useChargebackStore() as any;

  useEffect(() => {
    fetchWorkflowBoard();
  }, []);

  const handleMoveCard = async (chargebackId: string, newStatus: ChargebackStatus) => {
    try {
      await moveToStatus(chargebackId, newStatus);
      toast.success('Chargeback moved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to move chargeback');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chargeback Workflow</h1>
          <p className="text-muted-foreground">Kanban board view for chargeback management</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchWorkflowBoard()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/chargebacks">
            <Button variant="default">List View</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading workflow...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {(workflowColumns || []).map((column: any) => (
            <Card key={column.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{column.title}</CardTitle>
                  <Badge variant="secondary">{column.count}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {((column.chargebacks as any) || []).map((chargeback: any) => (
                  <Card key={chargeback.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/chargebacks/${chargeback.id}`}
                          className="font-medium text-sm hover:text-primary"
                        >
                          #{chargeback.chargebackId}
                        </Link>
                        {chargeback.isOverdue && <OverdueBadge />}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {chargeback.transactionId}
                      </div>

                      <div className="font-semibold text-lg">
                        {formatCurrency(chargeback.amount)}
                      </div>

                      <ChargebackPriorityBadge priority={chargeback.priority} />

                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span className={chargeback.isOverdue ? 'text-red-600 font-semibold' : ''}>
                          {formatDate(chargeback.dueDate)}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {chargeback.reasonCode}
                      </div>

                      <div className="flex gap-1 pt-2">
                        {column.id !== 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-7 text-xs"
                            onClick={() => {
                              const nextStatus: Record<string, ChargebackStatus> = {
                                new: 'under_review',
                                under_review: 'evidence_submitted',
                                evidence_submitted: 'won',
                                won: 'closed',
                                lost: 'closed',
                              };
                              if (nextStatus[column.id]) {
                                handleMoveCard(chargeback.id, nextStatus[column.id]);
                              }
                            }}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(((column.chargebacks as any) || []).length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No chargebacks
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
