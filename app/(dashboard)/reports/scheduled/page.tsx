'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit, Trash2, Play, Pause, Clock, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useReportStore } from '@/stores/reportStore';
import ReportApiService from '@/services/api/ReportApiService';
import toast from 'react-hot-toast';
import type { IScheduledReport, IReportExecution } from '@/types/reports';

export default function ScheduledReportsPage() {
  if (typeof window === 'undefined') return null;
  const queryClient = useQueryClient();
  const {
    scheduledReports,
    reportExecutions,
    setScheduledReports,
    setReportExecutions,
    updateScheduledReport,
    deleteScheduledReport,
  } = useReportStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<IScheduledReport | null>(null);

  const [formData, setFormData] = useState({
    reportName: '',
    reportType: 'custom' as 'custom' | 'template',
    reportId: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    schedule: '0 9 * * *',
    recipients: '',
    format: 'excel' as 'csv' | 'excel' | 'pdf',
    timezone: 'Asia/Kolkata',
    isActive: true,
    expiryDate: '',
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => ReportApiService.getScheduledReports(),
    onSuccess: (data) => setScheduledReports(data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ReportApiService.createScheduledReport(data),
    onSuccess: () => {
      toast.success('Report scheduled successfully');
      setShowCreateDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule report');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ReportApiService.updateScheduledReport(id, data),
    onSuccess: (data) => {
      updateScheduledReport(data.id, data);
      toast.success('Schedule updated successfully');
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update schedule');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ReportApiService.deleteSchedule(id),
    onSuccess: (_, id) => {
      deleteScheduledReport(id);
      toast.success('Schedule deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete schedule');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      ReportApiService.toggleSchedule(id, isActive),
    onSuccess: (data) => {
      updateScheduledReport(data.id, data);
      toast.success(`Schedule ${data.isActive ? 'activated' : 'paused'}`);
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to toggle schedule');
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (id: string) => ReportApiService.triggerScheduledReport(id),
    onSuccess: () => {
      toast.success('Report execution triggered');
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to trigger report');
    },
  });

  const { data: executionHistory } = useQuery({
    queryKey: ['execution-history', selectedSchedule?.id],
    queryFn: () => ReportApiService.getExecutionHistory(selectedSchedule!.id, 10),
    enabled: !!selectedSchedule && showHistoryDialog,
    onSuccess: (data) => {
      if (selectedSchedule) {
        setReportExecutions(selectedSchedule.id, data);
      }
    },
  });

  const resetForm = () => {
    setFormData({
      reportName: '',
      reportType: 'custom',
      reportId: '',
      frequency: 'daily',
      schedule: '0 9 * * *',
      recipients: '',
      format: 'excel',
      timezone: 'Asia/Kolkata',
      isActive: true,
      expiryDate: '',
    });
  };

  const handleCreate = () => {
    if (!formData.reportName || !formData.recipients) {
      toast.error('Please fill in all required fields');
      return;
    }

    createMutation.mutate({
      reportName: formData.reportName,
      reportType: formData.reportType,
      reportId: formData.reportId || 'default',
      frequency: formData.frequency,
      schedule: formData.schedule,
      recipients: formData.recipients.split(',').map((e) => e.trim()),
      format: formData.format,
      timezone: formData.timezone,
      isActive: formData.isActive,
      expiryDate: formData.expiryDate || undefined,
      createdBy: 'current_user',
    });
  };

  const handleEdit = (schedule: IScheduledReport) => {
    setSelectedSchedule(schedule);
    setFormData({
      reportName: schedule.reportName,
      reportType: schedule.reportType,
      reportId: schedule.reportId,
      frequency: schedule.frequency,
      schedule: schedule.schedule,
      recipients: schedule.recipients.join(', '),
      format: schedule.format,
      timezone: schedule.timezone,
      isActive: schedule.isActive,
      expiryDate: schedule.expiryDate || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedSchedule) return;

    updateMutation.mutate({
      id: selectedSchedule.id,
      data: {
        reportName: formData.reportName,
        frequency: formData.frequency,
        schedule: formData.schedule,
        recipients: formData.recipients.split(',').map((e) => e.trim()),
        format: formData.format,
        timezone: formData.timezone,
        isActive: formData.isActive,
        expiryDate: formData.expiryDate || undefined,
      },
    });
  };

  const handleViewHistory = (schedule: IScheduledReport) => {
    setSelectedSchedule(schedule);
    setShowHistoryDialog(true);
  };

  const getFrequencyCron = (frequency: string) => {
    const crons: Record<string, string> = {
      daily: '0 9 * * *',
      weekly: '0 9 * * 1',
      monthly: '0 9 1 * *',
    };
    return crons[frequency] || formData.schedule;
  };

  const getStatusBadge = (schedule: IScheduledReport) => {
    if (!schedule.isActive) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    if (schedule.lastRun?.status === 'failed') {
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30">Failed</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const renderScheduleForm = () => (
    <div className="space-y-4 py-4">
      <div>
        <Label>Report Name *</Label>
        <Input
          value={formData.reportName}
          onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
          placeholder="Enter report name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Frequency *</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value: any) => {
              const schedule = getFrequencyCron(value);
              setFormData({ ...formData, frequency: value, schedule });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="custom">Custom (Cron)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Format *</Label>
          <Select
            value={formData.format}
            onValueChange={(value: any) => setFormData({ ...formData, format: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.frequency === 'custom' && (
        <div>
          <Label>Cron Expression</Label>
          <Input
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            placeholder="0 9 * * *"
          />
          <p className="text-xs text-gray-600 mt-1">
            Format: minute hour day month weekday
          </p>
        </div>
      )}

      <div>
        <Label>Recipients (Email) *</Label>
        <Input
          value={formData.recipients}
          onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
          placeholder="email1@example.com, email2@example.com"
        />
        <p className="text-xs text-gray-600 mt-1">
          Comma-separated email addresses
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Timezone</Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => setFormData({ ...formData, timezone: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Expiry Date (Optional)</Label>
          <Input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label>Enable schedule immediately</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Scheduled Reports
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Automate report generation and delivery
            </p>
          </div>
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      {/* Scheduled Reports Table */}
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </Card>
      ) : schedules && schedules.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Report Name
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Schedule
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Next Run
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Last Run
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <motion.tr
                    key={schedule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {schedule.reportName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {schedule.frequency.toUpperCase()} • {schedule.format.toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {schedule.schedule}
                      </code>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {formatDate(schedule.nextRun)}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {schedule.lastRun ? (
                        <button
                          onClick={() => handleViewHistory(schedule)}
                          className="text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          {formatDate(schedule.lastRun.executedAt)}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4">{getStatusBadge(schedule)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => triggerMutation.mutate(schedule.id)}
                          title="Run Now"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleMutation.mutate({ id: schedule.id, isActive: !schedule.isActive })
                          }
                          title={schedule.isActive ? 'Pause' : 'Resume'}
                        >
                          {schedule.isActive ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(schedule)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this schedule?')) {
                              deleteMutation.mutate(schedule.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            No scheduled reports yet
          </p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Schedule
          </Button>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Report</DialogTitle>
            <DialogDescription>
              Configure automatic report generation and delivery
            </DialogDescription>
          </DialogHeader>
          {renderScheduleForm()}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Create Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update schedule configuration
            </DialogDescription>
          </DialogHeader>
          {renderScheduleForm()}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              Update Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Execution History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Execution History</DialogTitle>
            <DialogDescription>
              {selectedSchedule?.reportName} - Last 10 executions
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {executionHistory && executionHistory.length > 0 ? (
              <div className="space-y-3">
                {executionHistory.map((execution) => (
                  <Card key={execution.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              execution.status === 'success'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                : execution.status === 'failed'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                            }
                          >
                            {execution.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatDate(execution.executedAt)}
                          </span>
                        </div>
                        {execution.error && (
                          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {execution.error}
                          </p>
                        )}
                        {execution.recordCount && (
                          <p className="text-xs text-gray-600">
                            {execution.recordCount} records • {execution.duration}ms
                          </p>
                        )}
                      </div>
                      {execution.fileUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(execution.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                No execution history available
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
