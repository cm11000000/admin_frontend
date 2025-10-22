'use client'

import React, { useState } from 'react'
import { Settings, Bell, Shield, Mail, Key, Save } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatusToggle from '@/components/config/StatusToggle'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      company_name: 'SabPaisa Admin',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      date_format: 'DD/MM/YYYY'
    },
    security: {
      two_factor_auth: true,
      session_timeout: 30,
      password_expiry: 90,
      ip_whitelist_enabled: false
    },
    email: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_username: 'admin@sabpaisa.com',
      smtp_from_name: 'SabPaisa Admin'
    },
    notifications: {
      email_notifications: true,
      sms_notifications: false,
      webhook_notifications: true,
      transaction_alerts: true
    },
    api: {
      rate_limit: 1000,
      api_version: 'v1',
      webhook_retry: 3,
      webhook_timeout: 30
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">System Settings</h1>
            <p className="text-sm text-gray-400">Configure system-wide settings and preferences</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-gray-900 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-xl border border-gray-200/50 overflow-hidden">
          <Tabs defaultValue="general" className="w-full">
            <div className="border-b border-gray-200/50 px-4">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-2 overflow-x-auto">
                <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3">
                  <Settings className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="email" className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:border-b-2 data-[state=active]:border-orange-400 rounded-none px-4 py-3">
                  <Key className="w-4 h-4 mr-2" />
                  API
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="general" className="mt-0 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={settings.general.company_name}
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option>Asia/Kolkata</option>
                      <option>Asia/Dubai</option>
                      <option>America/New_York</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                    <select
                      value={settings.general.currency}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option>INR</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-4">
                <StatusToggle
                  checked={settings.security.two_factor_auth}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, two_factor_auth: checked }
                  }))}
                  label="Two-Factor Authentication"
                  description="Require 2FA for all user logins"
                  variant="success"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.session_timeout}
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password Expiry (days)</label>
                  <input
                    type="number"
                    value={settings.security.password_expiry}
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.email.smtp_host}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                    <input
                      type="number"
                      value={settings.email.smtp_port}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={settings.email.smtp_username}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">From Name</label>
                    <input
                      type="text"
                      value={settings.email.smtp_from_name}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-4">
                <StatusToggle
                  checked={settings.notifications.email_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email_notifications: checked }
                  }))}
                  label="Email Notifications"
                  description="Send email notifications for important events"
                  variant="success"
                />
                <StatusToggle
                  checked={settings.notifications.sms_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, sms_notifications: checked }
                  }))}
                  label="SMS Notifications"
                  description="Send SMS for critical alerts"
                  variant="success"
                />
                <StatusToggle
                  checked={settings.notifications.webhook_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, webhook_notifications: checked }
                  }))}
                  label="Webhook Notifications"
                  description="Send webhook callbacks for events"
                  variant="success"
                />
              </TabsContent>

              <TabsContent value="api" className="mt-0 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rate Limit (requests/hour)</label>
                  <input
                    type="number"
                    value={settings.api.rate_limit}
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Version</label>
                  <select
                    value={settings.api.api_version}
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option>v1</option>
                    <option>v2</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Webhook Retry Attempts</label>
                    <input
                      type="number"
                      value={settings.api.webhook_retry}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Webhook Timeout (seconds)</label>
                    <input
                      type="number"
                      value={settings.api.webhook_timeout}
                      className="w-full px-3 py-2 bg-gray-50/60 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
