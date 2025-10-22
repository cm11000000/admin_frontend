/**
 * ValidationErrors Component
 * Display validation errors with row/column details
 */

'use client';

import { AlertTriangle, Download, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { IValidationResult } from '@/types/bulk';
import { cn } from '@/lib/utils';

interface ValidationErrorsProps {
  validationResult: IValidationResult;
  onDownloadErrorReport?: () => void;
  className?: string;
}

export default function ValidationErrors({
  validationResult,
  onDownloadErrorReport,
  className,
}: ValidationErrorsProps) {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning'>('all');
  const { errors, warnings, totalRows, validRows, invalidRows } = validationResult;

  const filteredErrors = errors.filter((err) =>
    filterSeverity === 'all' ? true : err.severity === filterSeverity
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-600 font-medium">Valid Rows</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {validRows.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600 font-medium">Invalid Rows</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {invalidRows.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">Total Rows</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {totalRows.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filterSeverity === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSeverity('all')}
          >
            All ({errors.length})
          </Button>
          <Button
            variant={filterSeverity === 'error' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSeverity('error')}
          >
            Errors ({errors.filter((e) => e.severity === 'error').length})
          </Button>
          <Button
            variant={filterSeverity === 'warning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterSeverity('warning')}
          >
            Warnings ({warnings.length})
          </Button>
        </div>
        {onDownloadErrorReport && (
          <Button variant="outline" size="sm" onClick={onDownloadErrorReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>

      {/* Error List */}
      {filteredErrors.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Row
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Column
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredErrors.map((error, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {error.row}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {error.column}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                            error.severity === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          )}
                        >
                          {error.severity}
                        </span>
                        <span className="text-gray-900">{error.error}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {String(error.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">No errors found</p>
        </div>
      )}
    </div>
  );
}
