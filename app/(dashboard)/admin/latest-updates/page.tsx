'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  Plus,
  X,
  Search,
  Loader2,
} from 'lucide-react';

// Client-only page; safe for static export
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import adminPagesApiService, { type InformationBulletin } from '@/services/api/AdminPagesApiService';

interface BulletinForm {
  topic: string;
  description: string;
  url: string;
}

const normalizeBulletin = (item: InformationBulletin): InformationBulletin => ({
  ...item,
  topic: item.topic?.trim() || 'Untitled',
  description: item.description?.trim() || '',
  url: item.url?.trim() || ''
});

const LatestUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<InformationBulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<BulletinForm>({ topic: '', description: '', url: '' });
  const [publishing, setPublishing] = useState(false);

  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUpdates();
  }, []);

  const filteredUpdates = useMemo(() => {
    if (!search.trim()) {
      return updates;
    }
    const term = search.trim().toLowerCase();
    return updates.filter((item) =>
      `${item.topic} ${item.description}`.toLowerCase().includes(term)
    );
  }, [updates, search]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminPagesApiService.getLatestUpdates();
      setUpdates((data || []).map(normalizeBulletin));
    } catch (err: any) {
      console.error('Failed to load latest updates', err);
      setError(err?.message || 'Failed to load updates');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ topic: '', description: '', url: '' });
    setIsFormOpen(false);
  };

  const handlePublish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.topic.trim() || !form.description.trim()) {
      toast.error('Topic and description are required');
      return;
    }

    setPublishing(true);

    try {
      const payload = {
        topic: form.topic.trim(),
        description: form.description.trim(),
        url: form.url.trim()
      };

      await adminPagesApiService.createLatestUpdate(payload);
      toast.success('Information bulletin published');
      resetForm();
      loadUpdates();
    } catch (err: any) {
      console.error('Failed to publish update', err);
      toast.error(err?.message || 'Failed to publish update');
    } finally {
      setPublishing(false);
    }
  };

  const renderIcon = (topic: string) => {
    const normalized = topic.toLowerCase();
    if (normalized.includes('maintenance') || normalized.includes('downtime')) {
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
    if (normalized.includes('success') || normalized.includes('completed')) {
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    }
    if (normalized.includes('announcement') || normalized.includes('notice')) {
      return <Bell className="h-5 w-5 text-blue-500" />;
    }
    return <Info className="h-5 w-5 text-gray-600" />;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Section Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Latest Updates</h1>
          <p className="text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Information bulletins and system announcements</p>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
            <Input
              type="search"
              autoComplete="off"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search updates"
              className="pl-9 min-h-[44px] touch-manipulation"
            />
          </div>
          <Button
            onClick={() => setIsFormOpen((open) => !open)}
            className="min-h-[52px] touch-manipulation whitespace-nowrap"
          >
            {isFormOpen ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Publish update →
              </>
            )}
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-xl">
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Publish new update</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>
            Creates an information bulletin via POST /create-information-bulletin/
          </p>

          <form className="mt-4 space-y-4" onSubmit={handlePublish}>
            <div>
              <Label className="font-extrabold">Topic</Label>
              <Input
                type="text"
                autoCapitalize="words"
                autoComplete="off"
                value={form.topic}
                onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
                placeholder="Announcement title"
                className="min-h-[44px] touch-manipulation"
                required
              />
            </div>
            <div>
              <Label className="font-extrabold">Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Details of the update"
                rows={4}
                className="min-h-[44px] touch-manipulation resize-none"
                required
              />
            </div>
            <div>
              <Label className="font-extrabold">URL (optional)</Label>
              <Input
                type="url"
                autoCapitalize="none"
                autoComplete="url"
                value={form.url}
                onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
                placeholder="https://..."
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="min-h-[52px] touch-manipulation"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={publishing}
                className="min-h-[52px] touch-manipulation"
              >
                {publishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish →
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Updates List Section */}
      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map((placeholder) => (
              <div key={placeholder} className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-lg animate-pulse">
                <div className="h-6 w-1/3 rounded bg-gray-200" />
                <div className="mt-3 h-4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 md:p-6 text-sm text-red-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={loadUpdates}
                className="min-h-[52px] touch-manipulation"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 md:p-12 text-center shadow-lg">
            <Bell className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-sm text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
              No updates available. Use the publish action to add a new bulletin.
            </p>
          </div>
        ) : (
          <>
            {filteredUpdates.map((update) => (
              <div
                key={update.id || update.sno}
                className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0">{renderIcon(update.topic ?? '')}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base md:text-lg font-extrabold text-gray-900 break-words" style={{ letterSpacing: '-0.02em' }}>
                          {update.topic}
                        </h3>
                        {update.sno && (
                          <span className="rounded-full bg-gray-500/20 px-2 py-0.5 text-xs font-extrabold text-gray-600 flex-shrink-0">
                            #{update.sno}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 break-words font-light" style={{ letterSpacing: '-0.01em' }}>{update.description}</p>
                      {update.url && (
                        <a
                          href={update.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-xs font-medium text-blue-500 hover:text-blue-600 min-h-[44px] touch-manipulation"
                        >
                          View details
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 flex-shrink-0 md:ml-4">
                    <Clock className="h-4 w-4" />
                    <span className="whitespace-nowrap">{formatDate(update.created_at || update.updated_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Warning Banner */}
      <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 md:px-4 md:py-3 text-sm text-amber-700 font-light" style={{ letterSpacing: '-0.01em' }}>
        <div className="flex gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            Publishing a bulletin updates the production cobaws API (/create-information-bulletin/). Ensure the content is
            final before submitting.
          </span>
        </div>
      </div>
    </div>
  );
};

export default LatestUpdatesPage;
