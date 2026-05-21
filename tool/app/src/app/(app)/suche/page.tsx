'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Lehrstelle } from '@/types'
import { useT } from '@/lib/lang-context'
import { useProfile } from '@/lib/profile-context'
import Link from 'next/link'

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
    <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, background: `${color}25`, color, border: `1px solid ${color}40` }}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function SuchePage() {
  const t = useT()
  const { canApply, canUseAi, dailyUsed, dailyLimit, aiUsed, aiLimit, tier, refresh: refreshProfile } = useProfile()
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

  useEffect(() => {
    if (IS_DEMO || results.length === 0) return
    emailFetchRef.current?.abort()
    const controller = new AbortController()
    emailFetchRef.current = controller
    setEmailDone(new Set())
    results.forEach((stelle) => {
      if (stelle.email) { setEmailDone(prev => new Set([...prev, stelle.id])); return }
      const params = new URLSearchParams({ firma: stelle.firma })
      if (stelle.url) params.set('url', stelle.url)
      fetch(`/api/email?${params}`, { signal: controller.signal })
        .then(r => r.json())
        .then(({ email, telefon }) => {
          setEmailDone(prev => new Set([...prev, stelle.id]))
          setResults(prev => prev.map(r => r.id === stelle.id ? { ...r, email: email ?? r.email, telefon: telefon ?? r.telefon } : r))
        })
        .catch(() => {})
    })
    return () => controller.abort()
  }, [results.map(r => r.id).join(',')])

  async function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!beruf.trim()) return
    setLoading(true); setError(''); setResults([])
    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 800))
      setResults(getMockResults(beruf, kanton)); setLoading(false); return
    }
    const params = new URLSearchParams({ beruf })
    if (kanton !== 'Alle') params.set('kanton', kanton)
    const res = await fetch(`/api/lehrstellen?${params}`)
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Search error')
    else setResults(data.results ?? [])
    setLoading(false)
  }

  async function handleGenerate(stelle: Lehrstelle) {
    if (!canApply) { setError(`Tageslimit erreicht (${dailyUsed}/${dailyLimit} heute). Upgrade auf Pro für 100 Bewerbungen/Tag.`); return }
    if (!canUseAi) { setError(`KI-Limit erreicht (${aiUsed}/${aiLimit} heute). Upgrade auf Pro für unbegrenzte KI-Briefe.`); return }
    setSelected(stelle); setGenerated(null); setSent(false); setGenerating(true)
    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 1200))
      const script = localStorage.getItem('ls_demo_script') ?? ''
      setGenerated({
        fakten: [`${stelle.firma} has been operating for over 20 years`, `Located in ${stelle.stadt}`, `High-quality apprenticeship training`],
        message: script
          ? script.replace(/\[Firma\]/g, stelle.firma).replace(/\[Beruf\]/g, stelle.beruf).replace(/\[Ort\]/g, stelle.stadt)
          : `Dear ${stelle.firma} team,\n\nI am writing to express my strong interest in the apprenticeship position as ${stelle.beruf} in ${stelle.stadt}.\n\nI am a motivated student eager to begin my training at ${stelle.firma}.\n\nKind regards,\nMax Muster`,
      })
      setGenerating(false); return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lehrstelle: stelle, userId: user.id }) })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? 'Error')
    else {
      setGenerated(data)
      if (data.email || data.telefon) setSelected(prev => prev ? { ...prev, email: data.email ?? prev.email, telefon: data.telefon ?? prev.telefon } : prev)
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
    const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, toEmail: selected.email, subject: `Application as ${selected.beruf} – ${name}`, message: generated.message, vonName: name }) })
    if (res.ok) { setSent(true); refreshProfile() }
    setSending(false)
  }

  async function handleDownloadDocx() {
    if (!generated || !selected) return
    setDownloading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/export-docx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firma: selected.firma, beruf: selected.beruf, bewerbungstext: generated.message, userId: user.id }) })
    if (res.ok) {
      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') ?? ''
      const filename = cd.match(/filename="(.+)"/)?.[1] ?? 'Application.docx'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    }
    setDownloading(false)
  }

  const visibleResults = results
  const emailFoundCount = results.filter(s => s.email).length

  return (
    <div style={{ padding: '28px 32px', maxWidth: '960px' }} className="fade-in">
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '3px' }}>{t.search_title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {results.length > 0
            ? `${results.length} results · ${emailFoundCount} emails found${emailDone.size < results.length ? ` · searching ${results.length - emailDone.size} more…` : ''}`
            : t.search_subtitle_empty}
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={beruf} onChange={e => setBeruf(e.target.value)} placeholder={t.search_placeholder}
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit' }} />
        </div>
        <select value={kanton} onChange={e => setKanton(e.target.value)}
          style={{ width: '130px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit' }}>
          {KANTONE.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button type="submit" disabled={loading || !beruf.trim()}
          style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', opacity: loading || !beruf.trim() ? 0.5 : 1, fontFamily: 'inherit' }}>
          {loading ? t.search_btn_loading : t.search_btn}
        </button>
      </form>

      {error && (
        <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)' }}>
          ⚠ {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '52px', borderRadius: '10px', background: 'var(--surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {!loading && visibleResults.length > 0 && (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 0.4fr 1.6fr 1.6fr auto', fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', padding: '10px 16px', color: 'var(--muted)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <span>{t.search_col_company}</span><span>{t.search_col_position}</span><span>CT</span><span>EMAIL</span><span>PHONE</span><span/>
          </div>
          {visibleResults.map((stelle) => (
            <div key={stelle.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 0.4fr 1.6fr 1.6fr auto', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', background: selected?.id === stelle.id ? 'var(--accent-glow)' : 'var(--surface)', transition: 'background 0.15s' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} onClick={() => handleGenerate(stelle)}>
                <Avatar name={stelle.firma} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-light)' }}>{stelle.firma}</span>
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-2)', paddingRight: '8px' }}>{stelle.beruf}</span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--muted)' }}>{stelle.kanton}</span>
              {/* Email column */}
              <span style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                {stelle.email
                  ? <span style={{ color: 'var(--green)' }}>{stelle.email}</span>
                  : emailDone.has(stelle.id)
                    ? <span style={{ color: 'var(--muted-2)' }}>—</span>
                    : <span style={{ color: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }}>searching…</span>
                }
              </span>
              {/* Phone column */}
              <span style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                {stelle.telefon
                  ? <span style={{ color: 'var(--blue)' }}>{stelle.telefon}</span>
                  : emailDone.has(stelle.id)
                    ? <span style={{ color: 'var(--muted-2)' }}>—</span>
                    : <span style={{ color: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }}>searching…</span>
                }
              </span>
              <button onClick={() => handleGenerate(stelle)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', borderRadius: '7px', fontWeight: 600, cursor: canApply && canUseAi ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', background: canApply && canUseAi ? 'var(--accent-glow-2)' : 'var(--surface-2)', color: canApply && canUseAi ? 'var(--accent-light)' : 'var(--muted)', border: `1px solid ${canApply && canUseAi ? 'var(--accent)' : 'var(--border)'}`, fontFamily: 'inherit', opacity: canApply && canUseAi ? 1 : 0.5 }}>
                ✦ {t.search_apply}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && beruf && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '4px' }}>{t.search_none_title}</p>
          <p style={{ fontSize: '13px' }}>{t.search_none_sub}</p>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) { setSelected(null); setGenerated(null); setSent(false) } }}>
          <div style={{ width: '100%', maxWidth: '560px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border-2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <Avatar name={selected.firma} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.firma}</h2>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>{selected.beruf} · {selected.kanton} · {selected.stadt}</p>
              </div>
              <button onClick={() => { setSelected(null); setGenerated(null); setSent(false) }}
                style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', background: 'var(--surface-2)', border: 'none', fontSize: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {selected.email
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '7px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--green)' }}>✉ {selected.email}</div>
                  : <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '6px 10px', borderRadius: '7px', background: 'var(--surface-2)', color: 'var(--muted)', animation: emailDone.has(selected.id) ? undefined : 'pulse 1.5s ease-in-out infinite' }}>{emailDone.has(selected.id) ? '✉ No email found' : '✉ Finding email…'}</div>
                }
                {selected.telefon
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '7px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--blue)' }}>📞 {selected.telefon}</div>
                  : <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '6px 10px', borderRadius: '7px', background: 'var(--surface-2)', color: 'var(--muted)', animation: emailDone.has(selected.id) ? undefined : 'pulse 1.5s ease-in-out infinite' }}>{emailDone.has(selected.id) ? '📞 No phone found' : '📞 Finding phone…'}</div>
                }
              </div>

              {generated?.fakten && generated.fakten.length > 0 && (
                <div style={{ marginBottom: '14px', padding: '12px', borderRadius: '10px', background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', marginBottom: '8px', color: 'var(--accent-light)' }}>{t.search_ai_facts}</p>
                  {generated.fakten.map((f, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '2px' }}>· {f}</p>)}
                </div>
              )}

              {generating ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--accent-light)', animation: 'pulse 1.5s ease-in-out infinite' }}>{t.search_ai_generating}</p>
                </div>
              ) : generated ? (
                <>
                  <textarea value={generated.message} onChange={e => setGenerated({ ...generated, message: e.target.value })} rows={12}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'none', marginBottom: '12px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', lineHeight: 1.8, fontFamily: 'var(--font-geist-mono, monospace)' }} />
                  {sent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '10px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)' }}>
                      {t.search_email_sent}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleDownloadDocx} disabled={downloading}
                      style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', fontFamily: 'inherit', opacity: downloading ? 0.5 : 1 }}>
                      ⤓ {downloading ? t.search_downloading : t.search_download}
                    </button>
                    {selected.email ? (
                      <button onClick={handleSendEmail} disabled={sending || sent}
                        style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: sent ? 'var(--green)' : 'var(--accent)', color: 'white', border: 'none', fontFamily: 'inherit', opacity: sending ? 0.5 : 1 }}>
                        ✉ {sending ? t.search_sending : sent ? t.search_sent : t.search_send_email}
                      </button>
                    ) : (
                      <div style={{ flex: 1, padding: '10px', borderRadius: '9px', fontSize: '13px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                        {t.search_no_email}
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
