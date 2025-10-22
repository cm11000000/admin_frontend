/**
 * BulkRefundUploader Component
 * CSV upload for bulk refund processing
 */
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { BulkRefundResponse } from '@/services/api/RefundApiService';

interface BulkRefundUploaderProps {
  onUpload: (refunds: any[]) => Promise<BulkRefundResponse>;
  onDownloadTemplate: () => Promise<void>;
  className?: string;
}

interface ParsedRefund {
  transactionId: string;
  amount: number;
  reason: string;
  error?: string;
}

export function BulkRefundUploader({
  onUpload,
  onDownloadTemplate,
  className,
}: BulkRefundUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRefund[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkRefundResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const parseCSV = (text: string): ParsedRefund[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['transactionid', 'amount', 'reason'];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const refunds: ParsedRefund[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const refund: ParsedRefund = {
        transactionId: row.transactionid || '',
        amount: parseFloat(row.amount) || 0,
        reason: row.reason || '',
      };

      // Validation
      if (!refund.transactionId) {
        refund.error = 'Transaction ID is required';
      } else if (!refund.amount || refund.amount <= 0) {
        refund.error = 'Valid amount is required';
      } else if (!refund.reason) {
        refund.error = 'Reason is required';
      }

      refunds.push(refund);
    }

    return refunds;
  };

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setIsParsing(true);

    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setParsedData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        handleFileChange(droppedFile);
      } else {
        setError('Please upload a CSV file');
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    const validRefunds = parsedData.filter(r => !r.error);

    if (validRefunds.length === 0) {
      setError('No valid refunds to process');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await onUpload(validRefunds);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process bulk refunds');
    } finally {
      setIsProcessing(false);
    }
  };

  const validCount = parsedData.filter(r => !r.error).length;
  const errorCount = parsedData.filter(r => r.error).length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Bulk Refund Upload</CardTitle>
        <CardDescription>
          Upload a CSV file with refund details. Download the template to see the required format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        {/* Download Template */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
            Download Template
          </Button>
        </div>

        {/* File Upload */}
        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed p-8 transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-border',
            'hover:border-primary hover:bg-primary/5'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div className="text-center">
            <p className="text-sm font-medium">
              {file ? file.name : 'Drag and drop CSV file here, or click to select'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Only CSV files are supported
            </p>
          </div>
        </div>

        {/* Parsing Progress */}
        {isParsing && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Parsing CSV file...</p>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Preview Table */}
        {parsedData.length > 0 && !isParsing && (
          <>
            <div className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Total: {parsedData.length} | Valid: {validCount} | Errors: {errorCount}
                  </p>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing || validCount === 0}
                >
                  {isProcessing ? 'Processing...' : `Process ${validCount} Refunds`}
                </Button>
              </div>

              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((refund, index) => (
                      <TableRow key={index} className={refund.error ? 'bg-destructive/10' : ''}>
                        <TableCell className="font-mono text-sm">{refund.transactionId}</TableCell>
                        <TableCell>{refund.amount.toFixed(2)}</TableCell>
                        <TableCell>{refund.reason}</TableCell>
                        <TableCell>
                          {refund.error ? (
                            <span className="text-xs text-destructive">{refund.error}</span>
                          ) : (
                            <span className="text-xs text-green-600">Valid</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* Processing Progress */}
        {isProcessing && result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing refunds...</span>
              <span>
                {result.processedItems} / {result.totalItems}
              </span>
            </div>
            <Progress
              value={(result.processedItems / result.totalItems) * 100}
              className="w-full"
            />
          </div>
        )}

        {/* Results */}
        {result && result.status === 'completed' && (
          <Alert>
            <div className="space-y-2">
              <p className="text-sm font-medium">Bulk processing completed!</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{result.totalItems}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Success</p>
                  <p className="text-lg font-bold text-green-600">{result.successCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Failed</p>
                  <p className="text-lg font-bold text-destructive">{result.failureCount}</p>
                </div>
              </div>

              {result.failureCount > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Failed Items:</p>
                  <div className="max-h-40 overflow-auto space-y-1">
                    {result.results
                      .filter(r => !r.success)
                      .map((r, i) => (
                        <p key={i} className="text-xs text-destructive">
                          {r.transactionId}: {r.error}
                        </p>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
