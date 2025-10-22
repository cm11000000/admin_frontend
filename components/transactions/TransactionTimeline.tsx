'use client';

import React, { useState } from 'react';
import { ITimelineEvent } from '@/services/api/TransactionApiService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  MapPin,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionTimelineProps {
  events: ITimelineEvent[];
  className?: string;
}

const statusIcons = {
  success: CheckCircle2,
  failed: XCircle,
  pending: Clock,
  warning: AlertTriangle,
};

const statusColors = {
  success: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  failed: 'text-red-500 bg-red-50 border-red-200',
  pending: 'text-amber-500 bg-amber-50 border-amber-200',
  warning: 'text-orange-500 bg-orange-50 border-orange-200',
};

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
  events,
  className,
}) => {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleEvent = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`;
    return `${(duration / 60000).toFixed(2)}m`;
  };

  const downloadTimeline = () => {
    const content = events
      .map(
        (event) =>
          `${event.timestamp} - ${event.title}\n${event.description}\nStatus: ${event.status}\n${
            event.errorMessage ? `Error: ${event.errorMessage}\n` : ''
          }\n`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-timeline-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!events || events.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center text-gray-500">
          No timeline events available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Transaction Timeline
            </CardTitle>
            <CardDescription>
              Detailed chronological history of all transaction events
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTimeline}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative pl-8 space-y-4">
          {events.map((event, index) => {
            const { date, time } = formatTimestamp(event.timestamp);
            const StatusIcon = statusIcons[event.status];
            const isExpanded = expandedEvents.has(event.id);
            const hasDetails =
              event.details ||
              event.gatewayLogs ||
              event.errorMessage ||
              event.ipAddress ||
              event.deviceInfo ||
              event.geolocation;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Timeline line */}
                <div
                  className={cn(
                    'absolute -left-8 top-1 h-4 w-4 rounded-full border-4 border-white shadow-md',
                    statusColors[event.status].split(' ')[0],
                    event.status === 'success' && 'bg-emerald-500',
                    event.status === 'failed' && 'bg-red-500',
                    event.status === 'pending' && 'bg-amber-500',
                    event.status === 'warning' && 'bg-orange-500'
                  )}
                />
                {index < events.length - 1 && (
                  <div className="absolute -left-6 top-5 w-0.5 h-full bg-gray-200" />
                )}

                <Collapsible open={isExpanded}>
                  <div
                    className={cn(
                      'border rounded-lg p-4 hover:shadow-md transition-shadow',
                      statusColors[event.status]
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className="h-4 w-4" />
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <span className="font-medium">{date}</span>
                          <span>{time}</span>
                          {event.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {formatDuration(event.duration)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {hasDetails && (
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleEvent(event.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>

                    <AnimatePresence>
                      {hasDetails && (
                        <CollapsibleContent>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t space-y-3"
                          >
                            {/* Error Message */}
                            {event.errorMessage && (
                              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <div className="flex items-start gap-2">
                                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-red-700 mb-1">
                                      Error Message
                                    </p>
                                    <p className="text-sm text-red-600">{event.errorMessage}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* IP Address & Device Info */}
                            {(event.ipAddress || event.deviceInfo) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {event.ipAddress && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Monitor className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">IP:</span>
                                    <span className="font-mono text-gray-900">
                                      {event.ipAddress}
                                    </span>
                                  </div>
                                )}
                                {event.deviceInfo && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Monitor className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">Device:</span>
                                    <span className="text-gray-900">{event.deviceInfo}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Geolocation */}
                            {event.geolocation && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-600">Location:</span>
                                <span className="text-gray-900">{event.geolocation}</span>
                              </div>
                            )}

                            {/* Gateway Logs */}
                            {event.gatewayLogs && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                  Gateway Logs
                                </p>
                                <pre className="bg-gray-900 text-green-400 p-3 rounded-md text-xs overflow-x-auto">
                                  {event.gatewayLogs}
                                </pre>
                              </div>
                            )}

                            {/* Additional Details */}
                            {event.details && Object.keys(event.details).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-2">
                                  Additional Details
                                </p>
                                <div className="bg-gray-50 border rounded-md p-3 space-y-1">
                                  {Object.entries(event.details).map(([key, value]) => (
                                    <div key={key} className="flex text-sm">
                                      <span className="text-gray-600 min-w-[120px]">
                                        {key.replace(/_/g, ' ')}:
                                      </span>
                                      <span className="text-gray-900 font-mono">
                                        {typeof value === 'object'
                                          ? JSON.stringify(value)
                                          : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </CollapsibleContent>
                      )}
                    </AnimatePresence>
                  </div>
                </Collapsible>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
