/**
 * ScheduleExportForm Component
 * Form for creating/editing scheduled exports
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { IScheduledExport, IExportConfig } from '@/types/bulk';

interface ScheduleExportFormProps {
  initialData?: Partial<IScheduledExport>;
  exportTemplates?: IExportConfig[];
  onSubmit: (data: Partial<IScheduledExport>) => void;
  onCancel: () => void;
}

export default function ScheduleExportForm({
  initialData,
  exportTemplates = [],
  onSubmit,
  onCancel,
}: ScheduleExportFormProps) {
  const [formData, setFormData] = useState<Partial<IScheduledExport>>(
    initialData || {
      schedule: '0 0 * * *',
      timezone: 'UTC',
      enabled: true,
    }
  );

  const schedulePresets = [
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at 9 AM', value: '0 9 * * *' },
    { label: 'Weekly (Monday)', value: '0 0 * * 1' },
    { label: 'Monthly (1st)', value: '0 0 1 * *' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="exportConfig">Export Configuration</Label>
        <select
          id="exportConfig"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
          value={formData.exportConfigId || ''}
          onChange={(e) =>
            setFormData({ ...formData, exportConfigId: e.target.value })
          }
          required
        >
          <option value="">Select export configuration...</option>
          {exportTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="schedule">Schedule</Label>
        <select
          id="schedule"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
          value={formData.schedule}
          onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
          required
        >
          {schedulePresets.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
          <option value="custom">Custom cron expression...</option>
        </select>
        {formData.schedule === 'custom' && (
          <input
            type="text"
            placeholder="* * * * *"
            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
          />
        )}
      </div>

      <div>
        <Label htmlFor="timezone">Timezone</Label>
        <select
          id="timezone"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          required
        >
          <option value="UTC">UTC</option>
          <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
          <option value="America/New_York">EST (America/New_York)</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={(e) =>
              setFormData({ ...formData, enabled: e.target.checked })
            }
            className="h-4 w-4"
          />
          <span className="text-sm">Enable schedule</span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
}
