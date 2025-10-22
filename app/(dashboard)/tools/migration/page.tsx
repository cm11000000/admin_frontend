/**
 * Data Migration Tools Page
 * Manage data migrations with transformation rules
 */

'use client';

import { useState, useEffect } from 'react';
import { Database, Play, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkOperationsApiService from '@/services/api/BulkOperationsApiService';
import toast from 'react-hot-toast';
import type { IMigrationConfig, IMigrationResult } from '@/types/bulk';
import { cn } from '@/lib/utils';

export default function MigrationPage() {
  if (typeof window === 'undefined') return null;
  const [migrations, setMigrations] = useState<IMigrationConfig[]>([]);
  const [migrationHistory, setMigrationHistory] = useState<IMigrationResult[]>([]);

  useEffect(() => {
    loadMigrations();
    loadMigrationHistory();
  }, []);

  const loadMigrations = async () => {
    try {
      const configs = await BulkOperationsApiService.getMigrations();
      setMigrations(configs);
    } catch (error) {
      toast.error('Failed to load migrations');
    }
  };

  const loadMigrationHistory = async () => {
    try {
      const history = await BulkOperationsApiService.getMigrationHistory();
      setMigrationHistory(history);
    } catch (error) {
      toast.error('Failed to load migration history');
    }
  };

  const handleExecuteMigration = async (configId: string, dryRun: boolean) => {
    try {
      const { jobId } = await BulkOperationsApiService.executeMigration(configId, dryRun);
      toast.success(dryRun ? 'Dry run started' : 'Migration started');

      const pollInterval = setInterval(async () => {
        try {
          const result = await BulkOperationsApiService.getMigrationResult(jobId);
          if (result.status === 'completed' || result.status === 'failed') {
            clearInterval(pollInterval);
            loadMigrationHistory();
            toast.success(
              result.status === 'completed'
                ? 'Migration completed'
                : 'Migration failed'
            );
          }
        } catch (error) {
          clearInterval(pollInterval);
        }
      }, 3000);
    } catch (error) {
      toast.error('Failed to start migration');
    }
  };

  const handleRollback = async (jobId: string) => {
    if (!confirm('Are you sure you want to rollback this migration?')) return;

    try {
      await BulkOperationsApiService.rollbackMigration(jobId);
      toast.success('Rollback initiated');
      loadMigrationHistory();
    } catch (error) {
      toast.error('Failed to rollback migration');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Migration Tools</h1>
          <p className="text-slate-400 mt-1">
            Migrate and transform data between systems
          </p>
        </div>
      </div>

      <Tabs defaultValue="configurations" className="w-full">
        <TabsList>
          <TabsTrigger value="configurations">Migration Configurations</TabsTrigger>
          <TabsTrigger value="history">Migration History</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          {migrations.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-700/50 rounded-lg">
              <Database className="mx-auto h-16 w-16 text-slate-500 mb-4" />
              <p className="text-slate-400 mb-4">No migration configurations yet</p>
              <Button>Create Migration Configuration</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {migrations.map((migration) => (
                <div
                  key={migration.id}
                  className="p-6 bg-white border border-slate-700/50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {migration.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{migration.sourceSystem}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span>{migration.targetSystem}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteMigration(migration.id, true)}
                      >
                        Dry Run
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleExecuteMigration(migration.id, false)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Field Mappings</p>
                      <p className="font-medium">
                        {migration.fieldMappings.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Transformations</p>
                      <p className="font-medium">
                        {migration.transformationRules.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Options</p>
                      <div className="flex gap-2 mt-1">
                        {migration.skipDuplicates && (
                          <span className="px-2 py-0.5 bg-[#0077FF]/20 text-[#0077FF] border border-[#0077FF]/40 rounded text-xs">
                            Skip Dupes
                          </span>
                        )}
                        {migration.rollbackOnError && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded text-xs">
                            Rollback
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {migrationHistory.map((result) => (
              <div
                key={result.id}
                className="p-6 bg-white border border-slate-700/50 rounded-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-semibold">
                        {result.dryRun ? 'Dry Run' : 'Migration'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {new Date(result.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {result.rollbackAvailable && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRollback(result.id)}
                    >
                      Rollback
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600">Total Records</p>
                    <p className="text-lg font-bold text-blue-900">
                      {result.totalRecords}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-xs text-green-600">Migrated</p>
                    <p className="text-lg font-bold text-green-900">
                      {result.migratedRecords}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded">
                    <p className="text-xs text-red-600">Failed</p>
                    <p className="text-lg font-bold text-red-900">
                      {result.failedRecords}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded">
                    <p className="text-xs text-yellow-600">Skipped</p>
                    <p className="text-lg font-bold text-yellow-900">
                      {result.skippedRecords}
                    </p>
                  </div>
                </div>

                {result.integrityChecksPassed !== undefined && (
                  <div
                    className={cn(
                      'mt-4 p-3 rounded text-sm',
                      result.integrityChecksPassed
                        ? 'bg-green-50 text-green-900'
                        : 'bg-red-50 text-red-900'
                    )}
                  >
                    Integrity Checks:{' '}
                    {result.integrityChecksPassed ? 'Passed' : 'Failed'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border-2 border-slate-700/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Data Cleanup</h3>
              <p className="text-sm text-slate-400 mb-4">
                Remove duplicate records and clean invalid data
              </p>
              <Button variant="outline">Run Cleanup</Button>
            </div>

            <div className="p-6 bg-white border-2 border-slate-700/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Bulk Update</h3>
              <p className="text-sm text-slate-400 mb-4">
                Update multiple records based on conditions
              </p>
              <Button variant="outline">Configure Update</Button>
            </div>

            <div className="p-6 bg-white border-2 border-slate-700/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Data Transformation</h3>
              <p className="text-sm text-slate-400 mb-4">
                Transform data using custom rules
              </p>
              <Button variant="outline">Create Rule</Button>
            </div>

            <div className="p-6 bg-white border-2 border-slate-700/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Integrity Check</h3>
              <p className="text-sm text-slate-400 mb-4">
                Verify data consistency and relationships
              </p>
              <Button variant="outline">Run Check</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
