/**
 * RefundTimeline Component
 * Displays refund status timeline/audit log
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefundTimeline as IRefundTimeline } from '@/services/api/RefundApiService';
import { RefundStatusBadge } from './RefundStatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface RefundTimelineProps {
  timeline: IRefundTimeline[];
  className?: string;
}

export function RefundTimeline({ timeline, className }: RefundTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No timeline data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {timeline.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div className="absolute left-[11px] top-8 h-full w-[2px] bg-border" />
              )}

              {/* Timeline dot */}
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2 pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <RefundStatusBadge status={event.status} />
                    <span className="text-sm font-medium">{event.user}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
                </div>

                {event.notes && (
                  <p className="text-sm text-muted-foreground">{event.notes}</p>
                )}

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 rounded-md bg-muted p-3">
                    <p className="text-xs font-medium">Additional Details</p>
                    <div className="mt-1 space-y-1">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
