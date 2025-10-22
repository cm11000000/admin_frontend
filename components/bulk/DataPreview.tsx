/**
 * DataPreview Component
 * Display table preview of uploaded data with column type detection
 */

'use client';

import { useMemo } from 'react';
import { Info } from 'lucide-react';
import type { IDataPreview } from '@/types/bulk';
import { cn } from '@/lib/utils';

interface DataPreviewProps {
  preview: IDataPreview;
  className?: string;
}

export default function DataPreview({ preview, className }: DataPreviewProps) {
  const { headers, rows, totalRows, previewRows, detectedTypes } = preview;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'number':
        return 'bg-blue-100 text-blue-700';
      case 'date':
        return 'bg-purple-100 text-purple-700';
      case 'email':
        return 'bg-green-100 text-green-700';
      case 'phone':
        return 'bg-orange-100 text-orange-700';
      case 'boolean':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'number':
        return '123';
      case 'date':
        return '📅';
      case 'email':
        return '📧';
      case 'phone':
        return '📞';
      case 'boolean':
        return '✓/✗';
      default:
        return 'Abc';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Preview: First {previewRows} of {totalRows.toLocaleString()} rows
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {headers.length} columns detected
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{header}</span>
                      <span
                        className={cn(
                          'inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium',
                          getTypeColor(detectedTypes[header] || 'string')
                        )}
                      >
                        {getTypeIcon(detectedTypes[header] || 'string')}{' '}
                        {detectedTypes[header] || 'string'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-3 text-xs text-gray-500 font-medium">
                    {rowIndex + 1}
                  </td>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-3 text-sm text-gray-900"
                    >
                      {cell === null || cell === undefined ? (
                        <span className="text-gray-400 italic">null</span>
                      ) : cell === '' ? (
                        <span className="text-gray-400 italic">empty</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {totalRows > previewRows && (
        <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            {(totalRows - previewRows).toLocaleString()} more rows not shown in
            preview
          </p>
        </div>
      )}
    </div>
  );
}
