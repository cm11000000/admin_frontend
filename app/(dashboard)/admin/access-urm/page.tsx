'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Save, ShieldCheck, UserCog, Loader2 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Combobox } from '@/components/ui/combobox'
import { Switch } from '@/components/ui/switch'
import adminPagesApiService, { type RateMappingAuth, type UserLoginOption } from '@/services/api/AdminPagesApiService'

export default function AccessURMPage(): JSX.Element {
  const [users, setUsers] = useState<UserLoginOption[]>([])
  const [loginId, setLoginId] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [recordId, setRecordId] = useState<number | null>(null)

  const [flags, setFlags] = useState<RateMappingAuth>({
    login_id: '',
    manage_client: false,
    manage_payment_mode: false,
    manage_mapping: false,
    manage_fee: false,
    manage_client_configuration: false,
    manage_feed_forwarded: false,
  })

  useEffect(() => {
    // Load predefined users (Angular had a fixed list)
    setUsers(adminPagesApiService.getUserLoginOptions())
  }, [])

  const selectedUserEmail = useMemo(() => (
    users.find(u => u.id === loginId)?.email || ''
  ), [users, loginId])

  const loadPermissions = useCallback(async () => {
    if (!loginId) {
      toast.error('Select a user login')
      return
    }
    setLoading(true)
    try {
      const data = await adminPagesApiService.getRateMappingAuth(loginId)
      if (data) {
        setRecordId(data.id || null)
        setFlags({
          login_id: loginId,
          manage_client: !!data.manage_client,
          manage_payment_mode: !!data.manage_payment_mode,
          manage_mapping: !!data.manage_mapping,
          manage_fee: !!data.manage_fee,
          manage_client_configuration: !!data.manage_client_configuration,
          manage_feed_forwarded: !!data.manage_feed_forwarded,
        })
      } else {
        setRecordId(null)
        setFlags((prev) => ({
          ...prev,
          login_id: loginId,
          manage_client: false,
          manage_payment_mode: false,
          manage_mapping: false,
          manage_fee: false,
          manage_client_configuration: false,
          manage_feed_forwarded: false,
        }))
      }
      toast.success('Permissions loaded')
    } catch (error) {
      console.error('Failed to load permissions', error)
      toast.error('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }, [loginId])

  const handleSave = useCallback(async () => {
    if (!loginId) {
      toast.error('Select a user login')
      return
    }
    setSaving(true)
    try {
      const payload: RateMappingAuth = { ...flags, login_id: loginId }
      if (recordId) {
        await adminPagesApiService.updateRateMappingAuth(recordId, payload)
        toast.success('Permissions updated')
      } else {
        const created = await adminPagesApiService.createRateMappingAuth(payload)
        setRecordId(created?.id || null)
        toast.success('Permissions created')
      }
    } catch (error) {
      console.error('Failed to save permissions', error)
      toast.error('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }, [flags, loginId, recordId])

  const userOptions = useMemo(() => (
    users.map((u) => ({ value: u.id, label: `${u.email} (${u.id})` }))
  ), [users])

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-gray-200 p-2 transition-colors hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Authorization (Access URM)</h1>
            <p className="text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Manage rate mapping permissions for users</p>
          </div>
        </div>
      </div>

      {/* User Selection Section */}
      <Card className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Section Header */}
          <div className="pb-3 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>User Selection</h2>
            <p className="text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Select a user or enter a login ID to manage permissions</p>
          </div>

          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-gray-900 text-sm md:text-base font-extrabold">Select User</Label>
              <Combobox
                options={userOptions}
                value={loginId}
                onValueChange={(v) => setLoginId(v)}
                placeholder="Search users..."
                emptyText="No users found"
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 text-sm md:text-base font-extrabold">Or Enter Login ID</Label>
              <Input
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. 10250"
                className="min-h-[44px] touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 text-sm md:text-base font-extrabold">Selected</Label>
              <Input
                value={selectedUserEmail || ''}
                readOnly
                placeholder="User email (if in list)"
                className="min-h-[44px] bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={loadPermissions}
              disabled={!loginId || loading}
              className="min-h-[52px] touch-manipulation w-full sm:w-auto"
            >
              {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading</>) : 'Load Permissions →'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRecordId(null);
                setFlags(f => ({
                  ...f,
                  login_id: loginId,
                  manage_client: false,
                  manage_payment_mode: false,
                  manage_mapping: false,
                  manage_fee: false,
                  manage_client_configuration: false,
                  manage_feed_forwarded: false
                }));
              }}
              disabled={!loginId || loading}
              className="min-h-[52px] touch-manipulation w-full sm:w-auto"
            >
              Reset Flags
            </Button>
          </div>
        </div>
      </Card>

      {/* Permissions Section */}
      <Card className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <UserCog className="w-5 h-5 text-gray-700" />
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Permissions</h2>
              <p className="text-sm text-gray-600 mt-1 font-light" style={{ letterSpacing: '-0.01em' }}>Configure access rights for rate mapping modules</p>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FlagRow label="Manage Client" checked={flags.manage_client} onChange={(v) => setFlags((prev) => ({ ...prev, manage_client: v }))} />
            <FlagRow label="Manage Payment Mode" checked={flags.manage_payment_mode} onChange={(v) => setFlags((prev) => ({ ...prev, manage_payment_mode: v }))} />
            <FlagRow label="Manage Mapping" checked={flags.manage_mapping} onChange={(v) => setFlags((prev) => ({ ...prev, manage_mapping: v }))} />
            <FlagRow label="Manage Fee" checked={flags.manage_fee} onChange={(v) => setFlags((prev) => ({ ...prev, manage_fee: v }))} />
            <FlagRow label="Manage Client Configuration" checked={flags.manage_client_configuration} onChange={(v) => setFlags((prev) => ({ ...prev, manage_client_configuration: v }))} />
            <FlagRow label="Manage Feed Forwarded" checked={flags.manage_feed_forwarded} onChange={(v) => setFlags((prev) => ({ ...prev, manage_feed_forwarded: v }))} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-gray-200">
            <Button
              onClick={handleSave}
              disabled={!loginId || saving}
              className="min-h-[52px] touch-manipulation w-full sm:w-auto"
            >
              {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</>) : (<><Save className="h-4 w-4 mr-2" /> Save →</>)}
            </Button>
            {recordId ? (
              <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md">Record ID: {recordId}</div>
            ) : (
              <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md">New record will be created</div>
            )}
          </div>
        </div>
      </Card>

      {/* Info Notice */}
      <Card className="p-4 md:p-6 flex items-start gap-3 bg-blue-50 border-blue-200">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
        <p className="text-sm text-gray-700 font-light" style={{ letterSpacing: '-0.01em' }}>
          Changes take effect immediately across Rate Mapping modules. Use the same user login IDs as Angular.
        </p>
      </Card>
    </div>
  )
}

function FlagRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 md:p-4 min-h-[44px] touch-manipulation">
      <span className="text-sm md:text-base text-gray-900 font-extrabold">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

