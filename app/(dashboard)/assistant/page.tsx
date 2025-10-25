"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import AssistantApiService, { AssistantResponse } from '@/services/api/AssistantApiService'

type Msg = { role: 'user' | 'assistant'; content: string; raw?: AssistantResponse }

function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('accessToken'))
    }
  }, [])
  return token
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [lang, setLang] = useState<'auto' | 'en' | 'hi'>('auto')
  const [busy, setBusy] = useState(false)
  const lastResponse = useRef<AssistantResponse | null>(null)
  const token = useAuthToken()

  const pendingNeeds = useMemo(() => lastResponse.current?.needs || [], [messages])

  const ask = async (question: string, extra?: Record<string, any>) => {
    setBusy(true)
    try {
      setMessages((prev) => [...prev, { role: 'user', content: question }])
      const payload: any = { question }
      if (lang !== 'auto') payload.lang = lang
      // carry slot-fills from extra
      Object.assign(payload, extra || {})
      const res = await AssistantApiService.ask(payload)
      lastResponse.current = res
      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer, raw: res }])
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: e?.message || 'Failed to ask assistant.' }])
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await ask(input.trim())
    setInput('')
  }

  const downloadFromSpec = async (spec: AssistantResponse['download']) => {
    if (!spec?.url) return
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const resp = await fetch(spec.url, {
        method: spec.method || 'POST',
        headers,
        body: spec.method === 'POST' ? JSON.stringify(spec.body || {}) : undefined,
        credentials: 'include',
      })
      if (!resp.ok) throw new Error(`Download failed (${resp.status})`)
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      // Try to derive a filename from headers
      const cd = resp.headers.get('Content-Disposition') || ''
      const m = /filename=\"?([^\";]+)\"?/i.exec(cd)
      const filename = (m?.[1] || 'report.xlsx').trim()
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e?.message || 'Download failed')
    }
  }

  // Themed message bubble
  const Bubble: React.FC<{ role: Msg['role']; children: React.ReactNode }> = ({ role, children }) => (
    <div className={`max-w-[85%] rounded-2xl px-4 py-3 mb-3 shadow-sm ${role === 'user' ? 'self-end bg-gradient-to-r from-[#FF9933]/15 to-[#5CBBF6]/15 text-gray-900' : 'self-start bg-white/90 text-gray-900 border border-gray-200/80'}`}>
      {children}
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 md:pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.02em' }}>
            Ops Assistant
          </h1>
          <p className="text-gray-600 text-xs md:text-sm mt-1.5 md:mt-2 font-light" style={{ letterSpacing: '-0.01em' }}>
            Ask in English or Hindi; export reports; check transaction status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs md:text-sm text-gray-600">Language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="min-h-[44px] px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-colors"
          >
            <option value="auto">Auto</option>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Refunds last 7 days', q: 'Show refunds last 7 days' },
            { label: 'Chargebacks prev week', q: 'Show chargebacks previous week' },
            { label: 'Settled today', q: 'Show settled today' },
            { label: 'Txn status (sample)', q: 'What is the status of QCCLI-SBI-TODAY?' },
            { label: 'Download settlements (7d)', q: 'Download settlement report last 7 days' },
          ].map((chip, idx) => (
            <button
              key={idx}
              disabled={busy}
              onClick={() => ask(chip.q)}
              className="min-h-[44px] touch-manipulation text-xs md:text-sm rounded-full border border-gray-200 bg-white/90 hover:bg-gray-50 px-3 md:px-4 py-2 shadow-sm disabled:opacity-50 transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div>
        <div className="bg-white/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-gray-200 shadow-xl">
          <div className="flex flex-col p-3 md:p-4 max-h-[62vh] overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">
                Examples: “Show refunds for QCCLI last 7 days”, “What’s the status of QCCLI-SBI-TODAY?”, “Download settlement report for QCCLI last week”.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className="animate-fadeUp">
                <Bubble role={m.role}>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  {m.role === 'assistant' && m.raw && (
                    <div className="mt-2 space-y-2">
                      {/* Download button */}
                      {m.raw.download?.url && (
                      <button
                        onClick={() => downloadFromSpec(m.raw!.download)}
                        className="text-sm rounded-lg bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-white px-3 py-1.5 shadow hover:opacity-95"
                      >
                        Download File
                      </button>
                    )}
                    {/* Deep links */}
                    {m.raw.deep_links && m.raw.deep_links.length > 0 && (
                      <div className="text-xs text-gray-600">
                        Quick links: {m.raw.deep_links.map((d, idx) => (
                          <a key={idx} href={d} className="underline hover:text-gray-900 mr-2">{d}</a>
                        ))}
                      </div>
                    )}
                    {/* Needs */}
                    {m.raw.needs && m.raw.needs.length > 0 && (
                      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                        Missing fields: {m.raw.needs.join(', ')}. Provide them in your next message.
                      </div>
                    )}
                    {/* Raw details toggle */}
                    {m.raw.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-600">Show details (JSON)</summary>
                        <pre className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto">{JSON.stringify(m.raw.details, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                )}
                </Bubble>
              </div>
            ))}
            {busy && (
              <div className="self-start animate-fadeUp">
                <Bubble role="assistant">
                  <div className="flex items-center gap-1">
                    <span className="typing-dot" />
                    <span className="typing-dot delay-150" />
                    <span className="typing-dot delay-300" />
                  </div>
                </Bubble>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t border-gray-200 px-3 md:px-4 py-3 bg-white/90 rounded-b-xl md:rounded-b-2xl">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pendingNeeds.length ? `Add missing: ${pendingNeeds.join(', ')}` : 'Type your question...'}
                className="flex-1 min-h-[44px] rounded-xl border border-gray-300 px-3 md:px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-white text-gray-900 transition-colors"
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy}
                className="min-h-[44px] rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs md:text-sm font-medium px-4 md:px-6 py-2.5 shadow-md hover:shadow-lg disabled:opacity-50 transition-all touch-manipulation"
              >
                {busy ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 180ms ease-out; }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 9999px; background: #9CA3AF;
          display: inline-block; animation: typing 1s infinite ease-in-out;
        }
        .typing-dot.delay-150 { animation-delay: 150ms; }
        .typing-dot.delay-300 { animation-delay: 300ms; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.66); opacity: 0.5; }
          40% { transform: scale(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
