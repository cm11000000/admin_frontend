"use client"

import React, { useMemo, useState } from 'react'
import { Key, Shield, AlertCircle, CheckCircle2, Loader2, Copy, Eye, EyeOff } from 'lucide-react'
import adminApiService from '@/services/api/AdminApiService'

type MessageType = 'success' | 'error'

type GenerateKeyForm = {
  clientId: number | string
  clientCode: string
  clientContact: string
  clientEmail: string
  address: string
  clientLogoPath: string
  clientName: string
  clientLink: string
  stateId: string
  bid: string
  stateName: string
  bankName: string
  client_username: string
  client_password: string
  appId: string
  status: string
  client_type: string
  successUrl: string
  failedUrl: string
  subscriptionstatus: string
  businessType: number | string
  businessctgcode: string
  referralcode: string
  mesaagebypassflag: string
  forcesuccessflag: string
  clientMcc: string
  masterName: string
}

type EncryptionKeyResponse = {
  clientCode?: string
  authkey?: string
  authiv?: string
  encData?: string
  authKey?: string
  authIv?: string
  authType?: string
  clientContact?: string
  clientEmail?: string
}

export default function GenerateKeyPage() {
  const [loading, setLoading] = useState(false)
  const [keyData, setKeyData] = useState<EncryptionKeyResponse | null>(null)
  const [showKeys, setShowKeys] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('success')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [form, setForm] = useState<GenerateKeyForm>({
    clientId: 437121111,
    clientCode: 'DO1O1NzmlklkpP11',
    clientContact: '8789542391',
    clientEmail: 'bhabesh.jha@srslive.in',
    address: 'Delhi',
    clientLogoPath: 'client/logopath',
    clientName: 'Doon Public School',
    clientLink: 'cltLink',
    stateId: '1',
    bid: '19',
    stateName: 'DELHI',
    bankName: 'SBI',
    client_username: 'bhabesh.jha_32@srslive.in',
    client_password: 'yuwteuwgdhw',
    appId: '10',
    status: 'Activate',
    client_type: 'normal Client',
    successUrl: 'https://sabpaisa.in/',
    failedUrl: 'https://sabpaisa.in/',
    subscriptionstatus: 'Subscribed',
    businessType: 2,
    businessctgcode: '1',
    referralcode: '1',
    mesaagebypassflag: '1',
    forcesuccessflag: '1',
    clientMcc: '1234',
    masterName: 'cm1234',
  })

  const authKey = useMemo(() => keyData?.authkey || keyData?.authKey || '', [keyData])
  const authIv = useMemo(() => keyData?.authiv || keyData?.authIv || '', [keyData])

  const generateEncryptionKey = async () => {
    setLoading(true)
    setMessage('')
    setKeyData(null)

    try {
      const result = await adminApiService.generateClientForm({
        ...form,
        clientId: Number(form.clientId),
        businessType: Number(form.businessType),
      } as any)

      setKeyData(result)
      setMessage('Encryption keys generated successfully!')
      setMessageType('success')
      setShowKeys(false)
    } catch (error) {
      console.error('Error generating keys:', error)
      setMessage('Failed to generate encryption keys. Please verify inputs and try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setMessage(`${label} copied to clipboard!`)
    setMessageType('success')
    setTimeout(() => setMessage(''), 3000)
  }

  const maskKey = (key: string) => {
    if (!key) return ''
    if (key.length <= 8) return '*'.repeat(key.length)
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

  const onChange = (field: keyof GenerateKeyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        {/* Section Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>Generate Encryption Keys</h1>
          <p className="text-sm md:text-base text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>Server-side generation of Auth Key and Auth IV for client encryption</p>
        </div>

        {/* Security Alert */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs md:text-sm text-gray-700 font-light" style={{ letterSpacing: '-0.01em' }}>
            <p className="font-extrabold mb-1">CRITICAL SECURITY NOTICE</p>
            <p>Encryption keys are generated server-side only via authenticated requests. Do not generate or store encryption keys in client code.</p>
          </div>
        </div>

        {/* Status Message */}
        {message && !loading && (
          <div className={`rounded-xl p-3 md:p-4 flex items-start gap-3 ${messageType === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            {messageType === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <p className={`text-xs md:text-sm text-gray-700 font-light`} style={{ letterSpacing: '-0.01em' }}>{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Client Details Form */}
          <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Key className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Client Details</h2>
                <p className="text-xs text-gray-500 font-light" style={{ letterSpacing: '-0.01em' }}>Enter client information for key generation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Field label="Client Code" value={form.clientCode} onChange={onChange('clientCode')} required />
              <Field label="Client Name" value={form.clientName} onChange={onChange('clientName')} required />
              <Field label="Client Email" value={form.clientEmail} onChange={onChange('clientEmail')} required />
              <Field label="Client Contact" value={form.clientContact} onChange={onChange('clientContact')} required />
              <Field label="Client ID" value={String(form.clientId)} onChange={onChange('clientId' as any)} />
              <Field label="App ID" value={form.appId} onChange={onChange('appId')} />
            </div>

            <button
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-xs md:text-sm text-gray-700 hover:text-gray-900 underline min-h-[44px] touch-manipulation flex items-center"
            >
              {showAdvanced ? 'Hide advanced fields' : 'Show advanced fields'}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <Field label="Address" value={form.address} onChange={onChange('address')} />
                <Field label="Logo Path" value={form.clientLogoPath} onChange={onChange('clientLogoPath')} />
                <Field label="Client Link" value={form.clientLink} onChange={onChange('clientLink')} />
                <Field label="State ID" value={form.stateId} onChange={onChange('stateId')} />
                <Field label="BID" value={form.bid} onChange={onChange('bid')} />
                <Field label="State Name" value={form.stateName} onChange={onChange('stateName')} />
                <Field label="Bank Name" value={form.bankName} onChange={onChange('bankName')} />
                <Field label="Client Username" value={form.client_username} onChange={onChange('client_username')} />
                <Field label="Client Password" value={form.client_password} onChange={onChange('client_password')} />
                <Field label="Status" value={form.status} onChange={onChange('status')} />
                <Field label="Client Type" value={form.client_type} onChange={onChange('client_type')} />
                <Field label="Success URL" value={form.successUrl} onChange={onChange('successUrl')} />
                <Field label="Failed URL" value={form.failedUrl} onChange={onChange('failedUrl')} />
                <Field label="Subscription Status" value={form.subscriptionstatus} onChange={onChange('subscriptionstatus')} />
                <Field label="Business Type" value={String(form.businessType)} onChange={onChange('businessType' as any)} />
                <Field label="Business Category Code" value={form.businessctgcode} onChange={onChange('businessctgcode')} />
                <Field label="Referral Code" value={form.referralcode} onChange={onChange('referralcode')} />
                <Field label="Message Bypass Flag" value={form.mesaagebypassflag} onChange={onChange('mesaagebypassflag')} />
                <Field label="Force Success Flag" value={form.forcesuccessflag} onChange={onChange('forcesuccessflag')} />
                <Field label="Client MCC" value={form.clientMcc} onChange={onChange('clientMcc')} />
                <Field label="Master Name" value={form.masterName} onChange={onChange('masterName')} />
              </div>
            )}

            <button
              onClick={generateEncryptionKey}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 md:py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm md:text-base rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] touch-manipulation font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  Generating Keys...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 md:w-5 md:h-5" />
                  Generate Encryption Keys →
                </>
              )}
            </button>
          </div>

          {/* Security Guidelines */}
          <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Security Guidelines</h2>
                <p className="text-xs text-gray-500 font-light" style={{ letterSpacing: '-0.01em' }}>Best practices for key management</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Encryption Key Types</h3>
                <ul className="space-y-2 text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                  <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span><strong className="font-extrabold">Auth Key:</strong> Primary encryption key for client authentication and data encryption</span></li>
                  <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span><strong className="font-extrabold">Auth IV:</strong> Initialization Vector used with the Auth Key for encryption operations</span></li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-extrabold text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>Key Management</h3>
                <ul className="space-y-2 text-xs text-gray-600 font-light" style={{ letterSpacing: '-0.01em' }}>
                  <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Use authenticated server APIs (not client-side generation)</span></li>
                  <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Never expose keys in code or logs</span></li>
                  <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Store keys in secure vaults, rotate periodically</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Keys Result */}
        {keyData && (
          <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>Generated Encryption Keys</h2>
                  <p className="text-xs text-gray-500 font-light" style={{ letterSpacing: '-0.01em' }}>Store these securely</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeys(!showKeys)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs md:text-sm min-h-[52px] touch-manipulation font-medium shrink-0"
              >
                {showKeys ? (<><EyeOff className="w-4 h-4" /> <span className="hidden sm:inline">Hide Keys</span></>) : (<><Eye className="w-4 h-4" /> <span className="hidden sm:inline">Show Keys</span></>)}
              </button>
            </div>

            {/* Mobile scroll hint */}
            <div className="md:hidden px-3 py-2 bg-gray-50/50 border-b border-gray-200">
              <p className="text-xs text-gray-500 text-center">Swipe left to see all columns</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">Field</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">Value</th>
                    <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs font-extrabold text-gray-600 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {keyData?.authType && (
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-700">Auth Type</td>
                      <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-900">{keyData.authType}</td>
                      <td className="px-3 md:px-4 py-3 md:py-4"></td>
                    </tr>
                  )}
                  {keyData?.clientCode && (
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-700">Client Code</td>
                      <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-900">{keyData.clientCode}</td>
                      <td className="px-3 md:px-4 py-3 md:py-4"></td>
                    </tr>
                  )}
                  <tr className="hover:bg-gray-50 transition-colors bg-green-500/5">
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-extrabold text-green-600">Auth Key</td>
                    <td className="px-3 md:px-4 py-3 md:py-4">
                      <code className="text-xs text-gray-900 font-mono bg-white px-2 py-1 rounded break-all">{showKeys ? authKey : maskKey(authKey)}</code>
                    </td>
                    <td className="px-3 md:px-4 py-3 md:py-4">
                      <button
                        onClick={() => copyToClipboard(authKey, 'Auth Key')}
                        className="inline-flex items-center gap-1 px-2 md:px-3 py-1.5 bg-green-500/20 text-green-600 border border-green-500/30 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors min-h-[52px] touch-manipulation"
                      >
                        <Copy className="w-3 h-3" /> <span className="hidden sm:inline">Copy</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors bg-blue-500/5">
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-extrabold text-blue-600">Auth IV</td>
                    <td className="px-3 md:px-4 py-3 md:py-4">
                      <code className="text-xs text-gray-900 font-mono bg-white px-2 py-1 rounded break-all">{showKeys ? authIv : maskKey(authIv)}</code>
                    </td>
                    <td className="px-3 md:px-4 py-3 md:py-4">
                      <button
                        onClick={() => copyToClipboard(authIv, 'Auth IV')}
                        className="inline-flex items-center gap-1 px-2 md:px-3 py-1.5 bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors min-h-[52px] touch-manipulation"
                      >
                        <Copy className="w-3 h-3" /> <span className="hidden sm:inline">Copy</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 md:p-4 bg-yellow-500/10 border-t border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs md:text-sm text-gray-700 font-light" style={{ letterSpacing: '-0.01em' }}>
                  <p className="font-extrabold mb-1">IMPORTANT: Save these keys securely!</p>
                  <p>These encryption keys are critical for client authentication and data security. Store them in a secure location immediately. They should be transmitted only over secure, encrypted channels.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, required }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs md:text-sm text-gray-700 font-extrabold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        onChange={onChange}
        className="w-full rounded-md bg-white border border-gray-300 px-3 py-2 md:py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors min-h-[44px] touch-manipulation"
        placeholder={label}
      />
    </div>
  )
}
