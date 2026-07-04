'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from '@/lib/lang-context'

interface Message { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'Welche Lehrstelle passt zu mir?',
  'Wie verbessere ich mein Bewerbungsschreiben?',
  'Was verdiene ich als Lehrling?',
  'Wie bereite ich mich auf das Interview vor?',
  'Was ist der Unterschied zwischen EFZ und EBA?',
  'Ich wurde abgelehnt — was jetzt?',
]

export default function AdvisorPage() {
  const { lang } = useLang()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    const next: Message[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: lang === 'de' ? 'Entschuldigung, ein Fehler ist aufgetreten. Versuche es nochmal.' : 'Sorry, something went wrong. Please try again.' }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="ls-page fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '3px' }}>
          {lang === 'de' ? '✦ KI-Karriereberater' : '✦ AI Career Advisor'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {lang === 'de'
            ? 'Frag mich alles über Lehrstellen, Bewerbungen und Karriere in der Schweiz.'
            : 'Ask me anything about apprenticeships, applications, and careers in Switzerland.'}
        </p>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px',
        padding: '4px 0 8px', minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ padding: '14px 16px', borderRadius: '14px 14px 14px 4px', background: 'var(--surface)', border: '1px solid var(--border)', maxWidth: '380px' }}>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                {lang === 'de'
                  ? 'Hallo! Ich bin dein KI-Karriereberater für Schweizer Lehrstellen. Was möchtest du wissen?'
                  : 'Hello! I\'m your AI career advisor for Swiss apprenticeships. What would you like to know?'}
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{
                  padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  background: 'var(--surface)', border: '1px solid var(--border-2)',
                  color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.15s, color 0.15s',
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              padding: '11px 14px',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              maxWidth: '80%',
              fontSize: '13px',
              lineHeight: 1.65,
              color: m.role === 'user' ? '#000' : 'var(--text-2)',
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px 16px', borderRadius: '14px 14px 14px 4px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(j => (
                <span key={j} style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: 'var(--muted)',
                  animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} style={{
            marginBottom: '8px', fontSize: '11px', color: 'var(--muted)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0',
          }}>
            {lang === 'de' ? '+ Neues Gespräch' : '+ New conversation'}
          </button>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={lang === 'de' ? 'Stell eine Frage…' : 'Ask a question…'}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
              outline: 'none', background: 'var(--surface)', border: '1px solid var(--border-2)',
              color: 'var(--text)', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5,
              maxHeight: '120px', overflowY: 'auto',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
              opacity: !input.trim() || loading ? 0.4 : 1, transition: 'opacity 0.15s',
            }}
          >
            ↑
          </button>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '6px' }}>
          {lang === 'de' ? 'Enter zum Senden · Shift+Enter für neue Zeile' : 'Enter to send · Shift+Enter for new line'}
        </p>
      </div>
    </div>
  )
}
