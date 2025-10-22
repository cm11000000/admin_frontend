'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Search, Filter, Building2, TrendingUp, Activity, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/reports/DateRangePicker';
import type { DateRange } from '@/types/reports';
import toast from 'react-hot-toast';

interface TIDRecord {
  tid: string;
  merchantName: string;
  merchantId: string;
  gateway: string;
  status: 'active' | 'inactive' | 'suspended';
  totalTransactions: number;
  successfulTransactions: number;
  totalVolume: number;
  successRate: number;
  lastTransaction: string;
  category: string;
}

export default function TIDReportPage() {
  if (typeof window === 'undefined') return null;
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');

  const { data: tidData, isLoading } = useQuery({
    queryKey: ['tid-report', dateRange, statusFilter, gatewayFilter],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const mockData: TIDRecord[] = [
        {
          tid: 'TID001234567',
          merchantName: 'ABC Retail Pvt Ltd',
          merchantId: 'MER001',
          gateway: 'HDFC',
          status: 'active',
          totalTransactions: 15234,
          successfulTransactions: 14890,
          totalVolume: 45678900,
          successRate: 97.7,
          lastTransaction: new Date().toISOString(),
          category: 'Retail',
        },
        {
          tid: 'TID001234568',
          merchantName: 'XYZ Electronics',
          merchantId: 'MER002',
          gateway: 'ICICI',
          status: 'active',
          totalTransactions: 8965,
          successfulTransactions: 8542,
          totalVolume: 23456780,
          successRate: 95.3,
          lastTransaction: new Date(Date.now() - 86400000).toISOString(),
          category: 'Electronics',
        },
        {
          tid: 'TID001234569',
          merchantName: 'PQR Services',
          merchantId: 'MER003',
          gateway: 'Paytm',
          status: 'inactive',
          totalTransactions: 3421,
          successfulTransactions: 3187,
          totalVolume: 8934560,
          successRate: 93.2,
          lastTransaction: new Date(Date.now() - 172800000).toISOString(),
          category: 'Services',
        },
        {
          tid: 'TID001234570',
          merchantName: 'LMN Hospitality',
          merchantId: 'MER004',
          gateway: 'HDFC',
          status: 'active',
          totalTransactions: 12456,
          successfulTransactions: 12089,
          totalVolume: 67890123,
          successRate: 97.1,
          lastTransaction: new Date().toISOString(),
          category: 'Hospitality',
        },
        {
          tid: 'TID001234571',
          merchantName: 'RST Healthcare',
          merchantId: 'MER005',
          gateway: 'Axis',
          status: 'suspended',
          totalTransactions: 5678,
          successfulTransactions: 5234,
          totalVolume: 15678900,
          successRate: 92.2,
          lastTransaction: new Date(Date.now() - 259200000).toISOString(),
          category: 'Healthcare',
        },
      ];

      return {
        records: mockData,
        summary: {
          totalTIDs: mockData.length,
          activeTIDs: mockData.filter(t => t.status === 'active').length,
          totalTransactions: mockData.reduce((sum, t) => sum + t.totalTransactions, 0),
          totalVolume: mockData.reduce((sum, t) => sum + t.totalVolume, 0),
          avgSuccessRate: mockData.reduce((sum, t) => sum + t.successRate, 0) / mockData.length,
        },
      };
    },
  });

  const filteredRecords = tidData?.records.filter((record) => {
    const matchesSearch =
      record.tid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.merchantId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesGateway = gatewayFilter === 'all' || record.gateway === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    toast.loading(`Exporting to ${format.toUpperCase()}...`, { id: 'export' });

    setTimeout(() => {
      toast.success('Export completed successfully', { id: 'export' });
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      case 'suspended':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

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
              TID Report
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Terminal ID performance and analytics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} variant="orange" />
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {tidData?.summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total TIDs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tidData.summary.totalTIDs}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active TIDs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tidData.summary.activeTIDs}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tidData.summary.totalTransactions.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(tidData.summary.totalVolume)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by TID, Merchant Name, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Gateway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gateways</SelectItem>
              <SelectItem value="HDFC">HDFC</SelectItem>
              <SelectItem value="ICICI">ICICI</SelectItem>
              <SelectItem value="Paytm">Paytm</SelectItem>
              <SelectItem value="Axis">Axis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* TID Table */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            TID Details ({filteredRecords.length} records)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  TID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Merchant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Gateway
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-600">
                  Transactions
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-600">
                  Success Rate
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-600">
                  Volume
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-600">
                  Last Transaction
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-600">
                    No TID records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.tid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {record.tid}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {record.merchantName}
                        </div>
                        <div className="text-gray-500">
                          {record.merchantId}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.gateway}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {record.totalTransactions.toLocaleString()}
                        </div>
                        <div className="text-gray-500">
                          {record.successfulTransactions.toLocaleString()} success
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          record.successRate >= 95
                            ? 'text-green-600'
                            : record.successRate >= 90
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {record.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(record.totalVolume)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(record.lastTransaction).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
