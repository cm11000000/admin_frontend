'use client';

import React, { useEffect, useState } from 'react';
import { transactionService } from '@/services/api/TransactionApiService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RotateCcw, TrendingUp, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/lib/toast';

export default function RetryManagementPage() {
  if (typeof window === 'undefined') return null;
  const [failedTransactions, setFailedTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txns, stats] = await Promise.all([
        transactionService.getFailedTransactions(1, 50),
        transactionService.getRetryAnalytics(),
      ]);
      setFailedTransactions(txns.transactions);
      setAnalytics(stats);
    } catch (error) {
      toast.error('Failed to load retry data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (transactionId: string) => {
    try {
      await transactionService.retryFailedTransaction(transactionId);
      toast.success('Transaction retry initiated');
      loadData();
    } catch (error) {
      toast.error('Failed to retry transaction');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction Retry Management</h1>
        <p className="text-gray-500 mt-1">Monitor and retry failed transactions</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Retries</div>
                  <div className="text-2xl font-bold">{analytics.totalRetries}</div>
                </div>
                <RotateCcw className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Success Rate</div>
                  <div className="text-2xl font-bold text-emerald-600">{analytics.successRate}%</div>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg Retry Time</div>
                  <div className="text-2xl font-bold">{analytics.averageRetryTime}s</div>
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Best Timing</div>
              <div className="text-2xl font-bold">{analytics.bestRetryTiming}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Failed Transactions</CardTitle>
          <CardDescription>Transactions eligible for retry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Failed At</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedTransactions.slice(0, 10).map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-sm">{txn.id}</TableCell>
                  <TableCell>{formatCurrency(txn.amount)}</TableCell>
                  <TableCell>{new Date(txn.updatedAt).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Payment Failed</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleRetry(txn.id)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {analytics?.gatewayWiseSuccess && analytics.gatewayWiseSuccess.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gateway-wise Success Rate</CardTitle>
            <CardDescription>Retry success rates by payment gateway</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.gatewayWiseSuccess.map((item: any) => (
                <div key={item.gateway} className="flex items-center justify-between p-3 border rounded-md">
                  <span className="font-medium">{item.gateway}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${item.successRate}%` }}
                      />
                    </div>
                    <span className="font-semibold text-emerald-600">{item.successRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
