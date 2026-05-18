'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Lehrstelle } from '@/types'

const IS_DEMO = typeof window !== 'undefined'
  ? (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('abcdefgh'))
  : false

function getMockResults(beruf: string, kanton: string): Lehrstelle[] {
  const k = kanton === 'Alle' ? 'ZH' : kanton
  return [
    { id: '1', firma: `${beruf}-Betrieb Muster AG`, beruf: `${beruf} EFZ`, kanton: k, stadt: 'Zürich', telefon: '+41 44 123 45 67', email: 'info@muster-ag.ch', website: 'https://example.com', beschreibung: `Führender Betrieb im Bereich ${beruf}.`, url: 'https://example.com', quelle: 'Demo' },
    { id: '2', firma: `Werkstatt ${beruf} Huber`, beruf: `${beruf} EFZ`, kanton: k, stadt: 'Winterthur', telefon: '+41 52 987 65 43', email: '', website: '', beschreibung: `Familienbetrieb mit 30 Jahren Erfahrung.`, url: 'https://example.com', quelle: 'Demo' },
    { id: '3', firma: `${beruf} Technik GmbH`, beruf: `${beruf} EFZ`, kanton: k, stadt: 'Bern', telefon: '+41 31 456 78 90', email: 'lehrstelle@technik.ch', website: 'https://example.com', beschreibung: `Moderner Betrieb mit neuesten Maschinen.`, url: 'https://example.com', quelle: 'Demo' },
    { id: '4', firma: `${k} ${beruf} Partner`, beruf: `${beruf} EFZ`, kanton: k, stadt: 'Basel', telefon: '+41 61 234 56 78', email: 'info@partner.ch', website: 'https://example.com', beschreibung: `Grossbetrieb mit eigener Lehrwerkstatt.`, url: 'https://example.com', quelle: 'Demo' },
    { id: '5', firma: `Lehrwerkstatt ${beruf} AG`, beruf: `${beruf} EFZ`, kanton: k, stadt: 'Luzern', telefon: '', email: 'ausbildung@lehrwerkstatt.ch', website: 'https://example.com', beschreibung: `Spezialisierte Lehrwerkstatt.`, url: 'https://example.com', quelle: 'Demo' },
  ]
}

const KANTONE = ['Alle','AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH']

function Avatar({ name }: { name: string }) {
  const colors = ['#6d28d9','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#0284c7']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
      style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function SuchePage() {
  const [beruf, setBeruf] = useState('')
  const [kanton, setKanton] = useState('Alle')
  const [results, setResults] = useState<Lehrstelle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Lehrstelle | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<{ message: string; fakten: string[]; email?: string; telefon?: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const emailFetchRef = useRef<AbortController | null>(null)
  const [emailDone, setEmailDone] = useState<Set<string>>(new Set())

  // After results load, fetch emails per row — only keep rows with email once done
  useEffect(() => {
    if (IS_DEMO || results.length === 0) return
    emailFetchRef.current?.abort()
    const controller = new AbortController()
    emailFetchRef.current = controller
    setEmailDone(new Set())

    results.forEach((stelle) => {
      if (stelle.email) {
        setEmailDone(prev => new Set([...prev, stelle.id]))
        return
      }
      const params = new URLSearchParams({ firma: stelle.firma })
      if (stelle.url) params.set('url', stelle.url)
      fetch(`/api/email?${params}`, { signal: controller.signal })
        .then(r => r.json())
        .then(({ email }) => {
          setEmailDone(prev => new Set([...prev, stelle.id]))
          if (email) {
            setResults(prev => prev.map(r =>
              r.firma === stelle.firma ? { ...r, email } : r
            ))
          }
        })
        .catch(() => {})
    })
    return () => controller.abort()
  }, [results.map(r => r.id).join(',')])

  async function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!beruf.trim()) return
    setLoading(true)
    setError('')
    setResults([])

    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 800))
      setResults(getMockResults(beruf, kanton))
      setLoading(false)
      return
    }

    const params = new URLSearchParams({ beruf })
    if (kanton !== 'Alle') params.set('kanton', kanton)

    const res = await fetch(`/api/lehrstellen?${params}`)
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Fehler bei der Suche')
    else setResults(data.results ?? [])
    setLoading(false)
  }

  async function handleGenerate(stelle: Lehrstelle) {
    setSelected(stelle)
    setGenerated(null)
    setSent(false)
    setGenerating(true)

    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 1200))
      const script = localStorage.getItem('ls_demo_script') ?? ''
      setGenerated({
        fakten: [`${stelle.firma} ist seit über 20 Jahren tätig`, `Standort in ${stelle.stadt}`, `Qualitativ hochwertige Ausbildung`],
        message: script
          ? script.replace(/\[Firma\]/g, stelle.firma).replace(/\[Beruf\]/g, stelle.beruf).replace(/\[Ort\]/g, stelle.stadt)
          : `Sehr geehrte Damen und Herren von ${stelle.firma},\n\nmit grossem Interesse habe ich Ihre Lehrstelle als ${stelle.beruf} in ${stelle.stadt} entdeckt.\n\nIch bin ein motivierter Schüler und möchte meine Ausbildung bei ${stelle.firma} absolvieren.\n\nMit freundlichen Grüssen\nMax Muster`,
      })
      setGenerating(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lehrstelle: stelle, userId: user.id }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Fehler')
    else {
      setGenerated(data)
      if (data.email || data.telefon) {
        setSelected(prev => prev ? { ...prev, email: data.email ?? prev.email, telefon: data.telefon ?? prev.telefon } : prev)
      }
    }
    setGenerating(false)
  }

  async function handleSendEmail() {
    if (!generated || !selected?.email) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('vorname, nachname').eq('user_id', user.id).single()
    const name = `${profile?.vorname ?? ''} ${profile?.nachname ?? ''}`.trim()
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, toEmail: selected.email, subject: `Bewerbung als ${selected.beruf} – ${name}`, message: generated.message, vonName: name }),
    })
    if (res.ok) setSent(true)
    setSending(false)
  }

  async function handleDownloadDocx() {
    if (!generated || !selected) return
    setDownloading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/export-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firma: selected.firma, beruf: selected.beruf, bewerbungstext: generated.message, userId: user.id }),
    })
    if (res.ok) {
      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') ?? ''
      const filename = cd.match(/filename="(.+)"/)?.[1] ?? 'Bewerbung.docx'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    }
    setDownloading(false)
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-0.5">Lehrstellen suchen</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {results.length > 0
            ? `${results.filter(s => !emailDone.has(s.id) || s.email).length} Stellen mit Email gefunden`
            : 'Finde offene Lehrstellen in der Schweiz'}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={beruf}
            onChange={e => setBeruf(e.target.value)}
            placeholder="Beruf suchen — z.B. Kaufmann, Informatiker, Polymechaniker..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)' }}
          />
        </div>
        <select
          value={kanton}
          onChange={e => setKanton(e.target.value)}
          className="w-36 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)' }}
        >
          {KANTONE.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button
          type="submit"
          disabled={loading || !beruf.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 cursor-pointer"
          style={{ background: 'var(--purple)', color: 'white' }}
        >
          {loading ? 'Suche...' : 'Suchen'}
        </button>
      </form>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)' }}>
          <span>⚠</span> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="rounded-xl overflow-hidden fade-in" style={{ border: '1px solid var(--border)' }}>
          {/* Table header */}
          <div className="grid text-xs font-semibold tracking-widest px-4 py-3"
            style={{ gridTemplateColumns: '2.5fr 2fr 0.6fr 2fr auto', color: 'var(--muted)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <span>FIRMA</span><span>STELLE</span><span>KT</span><span>EMAIL</span><span></span>
          </div>

          {results.filter(s => !emailDone.has(s.id) || s.email).map((stelle) => (
            <div key={stelle.id}
              className="grid items-center px-4 py-3 text-sm transition-colors"
              style={{
                gridTemplateColumns: '2.5fr 2fr 0.6fr 2fr auto',
                borderBottom: '1px solid var(--border)',
                background: selected?.id === stelle.id ? 'var(--purple-glow)' : 'var(--surface)',
              }}
            >
              <button className="flex items-center gap-2.5 text-left cursor-pointer group" onClick={() => handleGenerate(stelle)}>
                <Avatar name={stelle.firma} />
                <span className="font-medium group-hover:text-purple-400 transition-colors" style={{ color: 'var(--purple-light)' }}>
                  {stelle.firma}
                </span>
              </button>
              <span className="text-xs leading-tight pr-2" style={{ color: 'var(--text-2)' }}>{stelle.beruf}</span>
              <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{stelle.kanton}</span>
              <span className="text-xs truncate pr-2" style={{ color: stelle.email ? 'var(--green)' : 'var(--muted)' }}>
                {stelle.email || <span className="animate-pulse">·····</span>}
              </span>
              <button
                onClick={() => handleGenerate(stelle)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer whitespace-nowrap"
                style={{ background: 'var(--purple-glow-2)', color: 'var(--purple-light)', border: '1px solid rgba(109,40,217,0.3)' }}
              >
                <span>✦</span> Bewerben
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && beruf && !error && (
        <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium mb-1" style={{ color: 'var(--text-2)' }}>Keine Stellen gefunden</p>
          <p className="text-sm">Versuche einen anderen Beruf oder Kanton</p>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setGenerated(null); setSent(false) } }}>
          <div className="w-full max-w-xl rounded-2xl fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <Avatar name={selected.firma} />
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base truncate">{selected.firma}</h2>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{selected.beruf} · {selected.kanton} · {selected.stadt}</p>
              </div>
              <button onClick={() => { setSelected(null); setGenerated(null); setSent(false) }}
                className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-70"
                style={{ color: 'var(--muted)', background: 'var(--surface-2)' }}>✕</button>
            </div>

            <div className="p-5">
              {/* Contact info */}
              {(selected.telefon || selected.email) && (
                <div className="flex gap-3 mb-4">
                  {selected.telefon && (
                    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                      <span>📞</span> {selected.telefon}
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--surface-2)', color: 'var(--green)' }}>
                      <span>✉</span> {selected.email}
                    </div>
                  )}
                </div>
              )}

              {/* Facts */}
              {generated?.fakten && generated.fakten.length > 0 && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--purple-glow)', border: '1px solid rgba(109,40,217,0.2)' }}>
                  <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--purple-light)' }}>✦ KI-FAKTEN</p>
                  <div className="space-y-1">
                    {generated.fakten.map((f, i) => (
                      <p key={i} className="text-xs" style={{ color: 'var(--text-2)' }}>· {f}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Generating */}
              {generating ? (
                <div className="py-12 text-center">
                  <p className="animate-pulse text-sm" style={{ color: 'var(--purple-light)' }}>✦ KI schreibt deine Bewerbung...</p>
                </div>
              ) : generated ? (
                <>
                  <textarea
                    value={generated.message}
                    onChange={e => setGenerated({ ...generated, message: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', lineHeight: '1.8', fontFamily: 'var(--font-geist-mono, monospace)' }}
                  />

                  {sent && (
                    <div className="flex items-center gap-2 text-sm mb-3 px-3 py-2 rounded-lg" style={{ background: 'var(--green-glow)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)' }}>
                      ✓ Email erfolgreich gesendet!
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadDocx}
                      disabled={downloading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)' }}
                    >
                      <span>⤓</span> {downloading ? 'Erstellt...' : 'Word (.docx)'}
                    </button>
                    {selected.email ? (
                      <button
                        onClick={handleSendEmail}
                        disabled={sending || sent}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: sent ? 'var(--green)' : 'var(--purple)', color: 'white' }}
                      >
                        <span>✉</span> {sending ? 'Sendet...' : sent ? 'Gesendet' : 'Email senden'}
                      </button>
                    ) : (
                      <div className="flex-1 py-2.5 rounded-xl text-sm text-center flex items-center justify-center" style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        Keine Email hinterlegt
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}