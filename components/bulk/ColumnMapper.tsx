/**
 * ColumnMapper Component
 * Map CSV columns to system fields with validation
 */

'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { IColumnMapping } from '@/types/bulk';
import { cn } from '@/lib/utils';

interface ColumnMapperProps {
  csvColumns: string[];
  systemFields: { field: string; label: string; required: boolean; type: string }[];
  onMappingChange: (mappings: IColumnMapping[]) => void;
  className?: string;
}

export default function ColumnMapper({
  csvColumns,
  systemFields,
  onMappingChange,
  className,
}: ColumnMapperProps) {
  const [mappings, setMappings] = useState<IColumnMapping[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const initialMappings: IColumnMapping[] = systemFields.map((field) => {
      const matchingColumn = csvColumns.find(
        (col) => col.toLowerCase() === field.field.toLowerCase()
      );

      return {
        csvColumn: matchingColumn || '',
        systemField: field.field,
        required: field.required,
        dataType: field.type as 'string' | 'number' | 'date' | 'boolean' | 'email' | 'phone',
        format: undefined,
        defaultValue: undefined,
        transform: undefined,
      };
    });

    setMappings(initialMappings);
    onMappingChange(initialMappings);
  }, [csvColumns, systemFields, onMappingChange]);

  const handleMappingChange = (index: number, csvColumn: string) => {
    const newMappings = [...mappings];
    newMappings[index] = {
      ...newMappings[index],
      csvColumn,
    };
    setMappings(newMappings);
    onMappingChange(newMappings);
    validateMappings(newMappings);
  };

  const validateMappings = (currentMappings: IColumnMapping[]) => {
    const validationErrors: string[] = [];

    currentMappings.forEach((mapping) => {
      if (mapping.required && !mapping.csvColumn) {
        validationErrors.push(
          `Required field "${mapping.systemField}" is not mapped`
        );
      }
    });

    const usedColumns = currentMappings
      .map((m) => m.csvColumn)
      .filter((c) => c !== '');
    const duplicates = usedColumns.filter(
      (col, index) => usedColumns.indexOf(col) !== index
    );

    if (duplicates.length > 0) {
      validationErrors.push(
        `Column(s) "${duplicates.join(', ')}" mapped multiple times`
      );
    }

    setErrors(validationErrors);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          Map your CSV columns to system fields. Required fields are marked with
          an asterisk (*).
        </p>
      </div>

      {/* Mapping List */}
      <div className="space-y-3">
        {mappings.map((mapping, index) => {
          const systemField = systemFields[index];
          if (!systemField) return null;

          return (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 bg-white border border-gray-200 rounded-lg"
            >
              {/* CSV Column */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">CSV Column</Label>
                <select
                  value={mapping.csvColumn}
                  onChange={(e) => handleMappingChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select column...</option>
                  {csvColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              {/* Arrow */}
              <ArrowRight className="hidden md:block h-5 w-5 text-gray-400 mx-2" />

              {/* System Field */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">
                  System Field
                  {systemField.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                    {systemField.label}
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      systemField.type === 'number'
                        ? 'bg-blue-100 text-blue-700'
                        : systemField.type === 'date'
                        ? 'bg-purple-100 text-purple-700'
                        : systemField.type === 'email'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {systemField.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-2">
                Mapping Errors
              </p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Total Fields</p>
            <p className="text-lg font-semibold text-gray-900">
              {systemFields.length}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Mapped Fields</p>
            <p className="text-lg font-semibold text-gray-900">
              {mappings.filter((m) => m.csvColumn !== '').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
