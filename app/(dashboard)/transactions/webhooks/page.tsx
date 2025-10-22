'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, RotateCcw, CheckCircle2, XCircle, Activity, Play } from 'lucide-react';
import { transactionService } from '@/services/api/TransactionApiService';
import { toast } from '@/lib/toast';
import { Textarea } from '@/components/ui/textarea';

export default function WebhooksPage() {
  if (typeof window === 'undefined') return null;
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [testTransactionId, setTestTransactionId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const mockWebhookLogs = [
    {
      id: '1',
      transactionId: 'TXN001',
      url: 'https://api.example.com/webhook',
      method: 'POST',
      statusCode: 200,
      responseTime: 245,
      attemptNumber: 1,
      status: 'success',
      sentAt: new Date().toISOString(),
    },
    {
      id: '2',
      transactionId: 'TXN002',
      url: 'https://api.example.com/webhook',
      method: 'POST',
      statusCode: 500,
      responseTime: 1203,
      attemptNumber: 3,
      status: 'failed',
      sentAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const handleTestWebhook = async () => {
    if (!testUrl || !testTransactionId) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsTesting(true);
    try {
      const result = await transactionService.testWebhook({
        url: testUrl,
        transactionId: testTransactionId,
        eventType: 'payment.success',
      });
      setTestResult(result);
      toast.success('Webhook test completed');
    } catch (error) {
      toast.error('Webhook test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRetryWebhook = async (webhookId: string) => {
    try {
      await transactionService.retryWebhook(webhookId);
      toast.success('Webhook retry initiated');
    } catch (error) {
      toast.error('Failed to retry webhook');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks & Callbacks</h1>
          <p className="text-gray-500 mt-1">Monitor and test webhook deliveries</p>
        </div>
        <Button onClick={() => setTestDialogOpen(true)}>
          <Play className="h-4 w-4 mr-2" />
          Test Webhook
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Sent</div>
                <div className="text-2xl font-bold">1,234</div>
              </div>
              <Send className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Successful</div>
                <div className="text-2xl font-bold text-emerald-600">1,189</div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Failed</div>
                <div className="text-2xl font-bold text-red-600">45</div>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Logs</CardTitle>
          <CardDescription>Recent webhook delivery attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWebhookLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.transactionId}</TableCell>
                  <TableCell className="text-sm truncate max-w-xs">{log.url}</TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <Badge variant="default">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {log.statusCode}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {log.statusCode}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{log.responseTime}ms</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.attemptNumber}</Badge>
                  </TableCell>
                  <TableCell>{new Date(log.sentAt).toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    {log.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetryWebhook(log.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>Send a test webhook to validate your endpoint</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="configure">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="result" disabled={!testResult}>Result</TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-4">
              <div>
                <Label htmlFor="webhookUrl">Webhook URL *</Label>
                <Input
                  id="webhookUrl"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
              <div>
                <Label htmlFor="txnId">Transaction ID *</Label>
                <Input
                  id="txnId"
                  value={testTransactionId}
                  onChange={(e) => setTestTransactionId(e.target.value)}
                  placeholder="Enter transaction ID to send"
                />
              </div>
            </TabsContent>

            <TabsContent value="result" className="space-y-4">
              {testResult && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-md p-3">
                      <div className="text-xs text-gray-600 mb-1">Status Code</div>
                      <div className="text-2xl font-bold">{testResult.statusCode}</div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-xs text-gray-600 mb-1">Response Time</div>
                      <div className="text-2xl font-bold">{testResult.responseTime}ms</div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-xs text-gray-600 mb-1">Status</div>
                      <div className="text-2xl font-bold">
                        {testResult.success ? (
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Response</Label>
                    <Textarea
                      value={JSON.stringify(testResult.response, null, 2)}
                      readOnly
                      rows={10}
                      className="font-mono text-xs"
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTestWebhook} disabled={isTesting}>
              <Send className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Send Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
