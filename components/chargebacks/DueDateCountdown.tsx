/**
 * Due Date Countdown Component
 * Real-time countdown timer for chargeback due dates
 */
'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DueDateCountdownProps {
  dueDate: string;
  className?: string;
}

export function DueDateCountdown({ dueDate, className = '' }: DueDateCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const due = new Date(dueDate).getTime();
      const difference = due - now;

      if (difference < 0) {
        const absDiff = Math.abs(difference);
        return {
          days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((absDiff % (1000 * 60)) / 1000),
          isOverdue: true,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isOverdue: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  const isCritical = !timeLeft.isOverdue && timeLeft.days < 3;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {timeLeft.isOverdue ? (
        <AlertTriangle className="h-5 w-5 text-red-600 animate-pulse" />
      ) : (
        <Clock className="h-5 w-5 text-muted-foreground" />
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {timeLeft.isOverdue ? 'Overdue by:' : 'Time Remaining:'}
          </span>
          {timeLeft.isOverdue && (
            <Badge variant="destructive" className="animate-pulse">
              Overdue
            </Badge>
          )}
          {isCritical && (
            <Badge variant="destructive">
              Critical
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <div className={`text-2xl font-bold ${
            timeLeft.isOverdue ? 'text-red-600' : isCritical ? 'text-orange-600' : ''
          }`}>
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          Due: {new Date(dueDate).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
