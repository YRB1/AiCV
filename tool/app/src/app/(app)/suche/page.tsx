'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Lehrstelle } from '@/types'
import { useT, useLang } from '@/lib/lang-context'
import { useProfile } from '@/lib/profile-context'

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

const BERUFE = [
  'Kaufmann EFZ', 'Kauffrau EFZ',
  'Informatiker EFZ', 'Informatikerin EFZ',
  'Polymechaniker EFZ', 'Polymechanikerin EFZ',
  'Automobil-Mechatroniker EFZ', 'Automobil-Mechatronikerin EFZ',
  'Automobilfachmann EFZ', 'Automobilfachfrau EFZ',
  'Detailhandelsfachmann EFZ', 'Detailhandelsfachfrau EFZ',
  'Detailhandelsassistent EBA', 'Detailhandelsassistentin EBA',
  'Mediamatiker EFZ', 'Mediamatikerin EFZ',
  'Koch EFZ', 'Köchin EFZ',
  'Elektroinstallateur EFZ', 'Elektroinstallateurin EFZ',
  'Elektroplaner EFZ', 'Elektroplanerin EFZ',
  'Maurer EFZ', 'Maurerin EFZ',
  'Schreiner EFZ', 'Schreinerin EFZ',
  'Gärtner EFZ', 'Gärtnerin EFZ',
  'Coiffeur EFZ', 'Coiffeuse EFZ',
  'Logistiker EFZ', 'Logistikerin EFZ',
  'Fachmann Gesundheit EFZ', 'Fachfrau Gesundheit EFZ',
  'Laborant EFZ', 'Laborantin EFZ',
  'Hochbauzeichner EFZ', 'Hochbauzeichnerin EFZ',
  'Zeichner EFZ', 'Zeichnerin EFZ',
  'ICT-Fachmann EFZ', 'ICT-Fachfrau EFZ',
  'Produktionsmechaniker EFZ', 'Produktionsmechanikerin EFZ',
  'Mechaniker EFZ', 'Mechanikerin EFZ',
  'Bäcker-Konditor EFZ', 'Bäcker-Konditorin EFZ',
  'Sanitärinstallateur EFZ', 'Sanitärinstallateurin EFZ',
  'Heizungsinstallateur EFZ', 'Heizungsinstallateurin EFZ',
  'Maler EFZ', 'Malerin EFZ',
  'Carrossier EFZ',
  'Pharma-Assistent EFZ', 'Pharma-Assistentin EFZ',
  'Fachmann Betreuung EFZ', 'Fachfrau Betreuung EFZ',
  'Sozialassistent EBA', 'Sozialassistentin EBA',
  'Bodenleger EFZ',
  'Anlagen- und Apparatebauer EFZ',
  'Kochpraktiker EBA',
]

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
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const { canApply, canUseAi, dailyUsed, dailyLimit, aiUsed, aiLimit, refresh: refreshProfile } = useProfile()
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
  // apply status: null | 'generating' | 'review' | 'sending' | 'sent' | 'no-email' | 'error'
  const [applyStatus, setApplyStatus] = useState<'generating'|'review'|'sending'|'sent'|'no-email'|'error'|null>(null)
  const [applyError, setApplyError] = useState('')
  const [isAutoApply, setIsAutoApply] = useState(false)
  const [applyProfile, setApplyProfile] = useState<{ vorname: string; nachname: string; email: string; telefon: string; wohnort: string; schule: string; wunschberuf: string } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [reviewEdits, setReviewEdits] = useState<{ coverLetter: string; toEmail: string } | null>(null)
  const emailFetchRef = useRef<AbortController | null>(null)
  const [emailDone, setEmailDone] = useState<Set<string>>(new Set())

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [suggestionIdx, setSuggestionIdx] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestWrapRef = useRef<HTMLDivElement>(null)

  // Close suggestions on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (suggestWrapRef.current && !suggestWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Auto-fill and search from ?q= URL param (used by dashboard trending links)
  useEffect(() => {
    const q = searchParams.get('q')
    if (!q) return
    setBeruf(q)
    setLoading(true); setError(''); setResults([])
    const run = async () => {
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 800))
        setResults(getMockResults(q, 'Alle')); setLoading(false); return
      }
      const res = await fetch(`/api/lehrstellen?beruf=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Search error') } else { setResults(data.results ?? []) }
      setLoading(false)
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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

  function handleBerufChange(val: string) {
    setBeruf(val)
    if (val.length >= 2) {
      const filtered = BERUFE.filter(b => b.toLowerCase().includes(val.toLowerCase())).slice(0, 7)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
    setSuggestionIdx(-1)
  }

  function selectSuggestion(val: string) {
    setBeruf(val)
    setSuggestions([])
    setShowSuggestions(false)
    setSuggestionIdx(-1)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && suggestionIdx >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[suggestionIdx])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  async function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!beruf.trim()) return
    setShowSuggestions(false)
    setLoading(true); setError(''); setResults([])
    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 800))
      setResults(getMockResults(beruf, kanton)); setLoading(false); return
    }
    const params = new URLSearchParams({ beruf })
    if (kanton !== 'Alle') params.set('kanton', kanton)
    const res = await fetch(`/api/lehrstellen?${params}`)
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Search error')
    } else {
      setResults(data.results ?? [])
      if (data.warning) setError(data.warning)
    }
    setLoading(false)
  }

  async function handleGenerate(stelle: Lehrstelle, autoSend = false) {
    if (!canApply) { setError(t.error_daily_limit(dailyUsed ?? 0, dailyLimit ?? 0)); return }
    if (!canUseAi) { setError(t.error_ai_limit(aiUsed ?? 0, aiLimit ?? 0)); return }

    // Open drawer and start auto-apply pipeline
    setSelected(stelle)
    setGenerated(null)
    setSent(false)
    setApplyError('')
    setApplyStatus('generating')
    setApplyProfile(null)
    setIsAutoApply(autoSend)

    // Load profile data concurrently with AI generation
    if (!IS_DEMO) {
      setProfileLoading(true)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) { setProfileLoading(false); return }
        supabase.from('profiles')
          .select('vorname, nachname, email, telefon, wohnort, schule, wunschberuf')
          .eq('user_id', user.id).single()
          .then(({ data }) => {
            if (data) setApplyProfile({ vorname: data.vorname ?? '', nachname: data.nachname ?? '', email: data.email ?? '', telefon: data.telefon ?? '', wohnort: data.wohnort ?? '', schule: data.schule ?? '', wunschberuf: data.wunschberuf ?? '' })
            setProfileLoading(false)
          })
      })
    }

    // ── Step 1: Generate letter ─────────────────────────────────────────
    let generatedData: { message: string; fakten: string[]; email?: string; telefon?: string } | null = null

    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 1200))
      const script = localStorage.getItem('ls_demo_script') ?? ''
      generatedData = {
        fakten: [`${stelle.firma} has been operating for over 20 years`, `Located in ${stelle.stadt}`, `High-quality apprenticeship training`],
        message: script
          ? script.replace(/\[Firma\]/g, stelle.firma).replace(/\[Beruf\]/g, stelle.beruf).replace(/\[Ort\]/g, stelle.stadt)
          : `Dear ${stelle.firma} team,\n\nI am writing to express my strong interest in the apprenticeship position as ${stelle.beruf} in ${stelle.stadt}.\n\nI am a motivated student eager to begin my training at ${stelle.firma}.\n\nKind regards,\nMax Muster`,
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setApplyStatus('error'); setApplyError('Not signed in'); return }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lehrstelle: stelle, userId: user.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        setApplyStatus('error')
        setApplyError(data.error ?? 'Generation failed')
        return
      }
      generatedData = data
      // Update contact info from generation result
      if (data.email || data.telefon) {
        setSelected(prev => prev ? { ...prev, email: data.email ?? prev.email, telefon: data.telefon ?? prev.telefon } : prev)
        stelle = { ...stelle, email: data.email ?? stelle.email, telefon: data.telefon ?? stelle.telefon }
      }
    }

    setGenerated(generatedData)

    const emailToUse = generatedData?.email ?? stelle.email

    // ── Step 2a: Auto-apply — skip review and send immediately ──────────
    if (autoSend && emailToUse) {
      setApplyStatus('sending')
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 900))
        setApplyStatus('sent'); setSent(true); return
      }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not signed in')
        await new Promise(r => setTimeout(r, 200)) // wait for profile state
        const prof = applyProfile
        const name = prof ? `${prof.vorname} ${prof.nachname}`.trim() : ''
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            toEmail: emailToUse,
            subject: lang === 'de'
              ? `Bewerbung als ${stelle.beruf}${name ? ` – ${name}` : ''}`
              : `Application as ${stelle.beruf}${name ? ` – ${name}` : ''}`,
            message: generatedData!.message,
            vonName: name || 'Bewerber/in',
            replyTo: prof?.email || undefined,
            applicantInfo: prof ?? {},
          }),
        })
        if (res.ok) {
          setApplyStatus('sent'); setSent(true); refreshProfile()
        } else {
          const err = await res.json()
          setApplyStatus('error'); setApplyError(err.error ?? 'Send failed')
        }
      } catch (err) {
        setApplyStatus('error'); setApplyError(err instanceof Error ? err.message : 'Send failed')
      }
      return
    }

    // ── Step 2b: Manual review ──────────────────────────────────────────
    setReviewEdits({ coverLetter: generatedData!.message, toEmail: emailToUse ?? '' })
    setApplyStatus('review')
  }

  async function handleSendFromReview() {
    if (!reviewEdits || !selected) return
    const emailToUse = reviewEdits.toEmail
    if (!emailToUse) { setApplyStatus('no-email'); return }
    setApplyStatus('sending')

    if (IS_DEMO) {
      await new Promise(r => setTimeout(r, 900))
      setApplyStatus('sent')
      setSent(true)
      if (generated) setGenerated({ ...generated, message: reviewEdits.coverLetter })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const profile = applyProfile ?? null
      const name = profile ? `${profile.vorname} ${profile.nachname}`.trim() : ''

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          toEmail: emailToUse,
          subject: lang === 'de'
            ? `Bewerbung als ${selected.beruf}${name ? ` – ${name}` : ''}`
            : `Application as ${selected.beruf}${name ? ` – ${name}` : ''}`,
          message: reviewEdits.coverLetter,
          vonName: name || 'Bewerber/in',
          replyTo: profile?.email || undefined,
          applicantInfo: profile ?? {},
        }),
      })

      if (res.ok) {
        if (generated) setGenerated({ ...generated, message: reviewEdits.coverLetter })
        setApplyStatus('sent')
        setSent(true)
        refreshProfile()
      } else {
        const err = await res.json()
        setApplyStatus('error')
        setApplyError(err.error ?? 'Failed to send')
      }
    } catch (err) {
      setApplyStatus('error')
      setApplyError(err instanceof Error ? err.message : 'Send failed')
    }
  }

  async function handleSendEmail() {
    if (!generated || !selected?.email) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('vorname, nachname').eq('user_id', user.id).single()
    const name = `${profile?.vorname ?? ''} ${profile?.nachname ?? ''}`.trim()
    const res = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, toEmail: selected.email, subject: lang === 'de' ? `Bewerbung als ${selected.beruf} – ${name}` : `Application as ${selected.beruf} – ${name}`, message: generated.message, vonName: name }) })
    if (res.ok) { setSent(true); setApplyStatus('sent'); refreshProfile() }
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

  const emailFoundCount = results.filter(s => s.email).length

  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const TYPE_FILTERS = [
    { id: 'all', label: lang === 'de' ? 'Alle' : 'All' },
    { id: 'IT', label: 'IT' },
    { id: 'Kaufmann', label: lang === 'de' ? 'Kaufmann' : 'Business' },
    { id: 'Gesundheit', label: lang === 'de' ? 'Gesundheit' : 'Health' },
    { id: 'Handwerk', label: lang === 'de' ? 'Handwerk' : 'Trades' },
    { id: 'Gastronomie', label: lang === 'de' ? 'Gastronomie' : 'Gastro' },
    { id: 'Bau', label: lang === 'de' ? 'Bau' : 'Construction' },
  ]

  function toggleSave(id: string) {
    setSavedJobs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const filteredResults = typeFilter === 'all' ? results : results.filter(r =>
    r.beruf.toLowerCase().includes(typeFilter.toLowerCase()) ||
    r.firma.toLowerCase().includes(typeFilter.toLowerCase())
  )

  return (
    <div className="ls-page fade-in" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '3px' }}>{t.search_title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {results.length > 0
            ? `${results.length} results · ${emailFoundCount} emails found${emailDone.size < results.length ? ` · searching ${results.length - emailDone.size} more…` : ''}`
            : t.search_subtitle_empty}
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {/* Input with autocomplete */}
        <div ref={suggestWrapRef} style={{ flex: 1, position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', zIndex: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref={inputRef}
            value={beruf}
            onChange={e => handleBerufChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => beruf.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={t.search_placeholder}
            autoComplete="off"
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '14px', paddingTop: '10px', paddingBottom: '10px', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit' }}
          />
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="slide-up" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => selectSuggestion(s)}
                  onMouseEnter={() => setSuggestionIdx(i)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', background: i === suggestionIdx ? 'var(--accent-glow)' : 'transparent', color: i === suggestionIdx ? 'var(--accent-light)' : 'var(--text-2)', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none', fontFamily: 'inherit', transition: 'background 0.1s' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Canton select — "Alle" becomes "All" in EN */}
        <select value={kanton} onChange={e => setKanton(e.target.value)}
          style={{ width: '130px', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit' }}>
          {KANTONE.map(k => (
            <option key={k} value={k}>
              {k === 'Alle' ? t.search_all_cantons : k}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading || !beruf.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', opacity: loading || !beruf.trim() ? 0.5 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          {loading && <span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />}
          {loading ? t.search_btn_loading : t.search_btn}
        </button>
      </form>

      {/* Industry filter chips */}
      {results.length > 0 && (
        <div className="ls-filter-row" style={{ marginBottom: '12px' }}>
          {TYPE_FILTERS.map(f => (
            <button key={f.id} onClick={() => setTypeFilter(f.id)} style={{ flexShrink: 0, padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: `1px solid ${typeFilter === f.id ? 'var(--accent)' : 'var(--border)'}`, background: typeFilter === f.id ? 'var(--accent-glow-2)' : 'var(--surface)', color: typeFilter === f.id ? 'var(--accent-light)' : 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Loading skeleton with spinner header */}
      {loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '0 2px' }}>
            <span className="spinner" />
            <span style={{ fontSize: '13px', color: 'var(--accent-light)' }}>{t.search_btn_loading}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: '52px', borderRadius: '10px', background: 'var(--surface)', animation: `pulse 1.5s ease-in-out ${i * 0.12}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {!loading && filteredResults.length > 0 && (
        <>
          {/* ── Desktop table view ─────────────────────────────────── */}
          <div className="ls-table-view" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 0.4fr 1.6fr auto auto', fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', padding: '10px 16px', color: 'var(--muted)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <span>{t.search_col_company}</span><span>{t.search_col_position}</span><span>CT</span><span>EMAIL</span><span/><span/>
            </div>
            {filteredResults.map((stelle) => (
              <div key={stelle.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 0.4fr 1.6fr auto auto', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--border)', background: selected?.id === stelle.id ? 'var(--accent-glow)' : 'var(--surface)', transition: 'background 0.15s', gap: '4px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }} onClick={() => handleGenerate(stelle)}>
                  <Avatar name={stelle.firma} />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stelle.firma}</span>
                </button>
                <span style={{ fontSize: '12px', color: 'var(--text-2)', paddingRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stelle.beruf}</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--muted)' }}>{stelle.kanton}</span>
                <span style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                  {stelle.email
                    ? <span style={{ color: 'var(--green)' }}>{stelle.email}</span>
                    : emailDone.has(stelle.id)
                      ? <span style={{ color: 'var(--muted-2)' }}>—</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="spinner" style={{ width: '9px', height: '9px', borderWidth: '1.5px' }} /><span style={{ color: 'var(--accent)', fontSize: '10px' }}>…</span></span>}
                </span>
                {/* Bookmark */}
                <button onClick={() => toggleSave(stelle.id)} style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: savedJobs.has(stelle.id) ? 'rgba(245,158,11,0.15)' : 'transparent', border: 'none', cursor: 'pointer', color: savedJobs.has(stelle.id) ? '#fbbf24' : 'var(--muted-2)', flexShrink: 0, transition: 'all 0.15s' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={savedJobs.has(stelle.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </button>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button onClick={() => handleGenerate(stelle)} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 10px', borderRadius: '7px', fontWeight: 600, cursor: canApply && canUseAi ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', background: canApply && canUseAi ? 'var(--accent-glow-2)' : 'var(--surface-2)', color: canApply && canUseAi ? 'var(--accent-light)' : 'var(--muted)', border: `1px solid ${canApply && canUseAi ? 'var(--accent)' : 'var(--border)'}`, fontFamily: 'inherit', opacity: canApply && canUseAi ? 1 : 0.5 }}>
                    ✦ {t.search_apply}
                  </button>
                  <button onClick={() => handleGenerate(stelle, true)} title={lang === 'de' ? 'Automatisch bewerben – generiert und sendet sofort' : 'Auto-apply – generates and sends instantly'} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '6px 10px', borderRadius: '7px', fontWeight: 700, cursor: canApply && canUseAi ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', background: canApply && canUseAi ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'var(--surface-2)', color: canApply && canUseAi ? '#fff' : 'var(--muted)', border: 'none', fontFamily: 'inherit', opacity: canApply && canUseAi ? 1 : 0.5 }}>
                    ⚡ Auto
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Mobile card view ───────────────────────────────────── */}
          <div className="ls-cards-view">
            {filteredResults.map((stelle) => (
              <div key={stelle.id} style={{ borderRadius: '14px', background: 'var(--surface)', border: `1px solid ${selected?.id === stelle.id ? 'var(--accent)' : 'var(--border)'}`, padding: '14px', transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <Avatar name={stelle.firma} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stelle.firma}</p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{stelle.beruf} · {stelle.kanton} · {stelle.stadt}</p>
                  </div>
                  <button onClick={() => toggleSave(stelle.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: savedJobs.has(stelle.id) ? 'rgba(245,158,11,0.15)' : 'var(--surface-2)', border: 'none', cursor: 'pointer', color: savedJobs.has(stelle.id) ? '#fbbf24' : 'var(--muted)', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={savedJobs.has(stelle.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>
                {/* Contact info row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', minHeight: '20px' }}>
                  {stelle.email
                    ? <span style={{ fontSize: '11px', color: 'var(--green)' }}>✓ {stelle.email}</span>
                    : emailDone.has(stelle.id)
                      ? <span style={{ fontSize: '11px', color: 'var(--muted-2)' }}>No email found</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span className="spinner" style={{ width: '9px', height: '9px', borderWidth: '1.5px' }} /><span style={{ fontSize: '11px', color: 'var(--muted)' }}>{lang === 'de' ? 'Email wird gesucht…' : 'Searching email…'}</span></span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => handleGenerate(stelle)} disabled={!(canApply && canUseAi)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: canApply && canUseAi ? 'var(--surface-2)' : 'var(--surface-2)', color: canApply && canUseAi ? 'var(--accent-light)' : 'var(--muted)', border: `1px solid ${canApply && canUseAi ? 'var(--accent)' : 'var(--border)'}`, cursor: canApply && canUseAi ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: canApply && canUseAi ? 1 : 0.5 }}>
                    ✦ {lang === 'de' ? 'Bewerben' : 'Apply'}
                  </button>
                  <button onClick={() => handleGenerate(stelle, true)} disabled={!(canApply && canUseAi)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, background: canApply && canUseAi ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'var(--surface-2)', color: canApply && canUseAi ? '#fff' : 'var(--muted)', border: 'none', cursor: canApply && canUseAi ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: canApply && canUseAi ? 1 : 0.5 }}>
                    ⚡ Auto-Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && filteredResults.length === 0 && beruf && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '4px' }}>{t.search_none_title}</p>
          <p style={{ fontSize: '13px' }}>{t.search_none_sub}</p>
        </div>
      )}

      {/* Quick Apply Drawer */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.55)' }}
            onClick={() => { setSelected(null); setGenerated(null); setSent(false); setApplyStatus(null); setApplyProfile(null); setReviewEdits(null) }}
          />

          {/* Slide-in drawer */}
          <div className="ls-drawer">

            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <Avatar name={selected.firma} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '1px' }}>{selected.firma}</h2>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{selected.beruf} · {selected.kanton} · {selected.stadt}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setGenerated(null); setSent(false); setApplyStatus(null); setApplyProfile(null); setReviewEdits(null) }}
                style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', background: 'var(--surface-2)', border: 'none', fontSize: '14px', flexShrink: 0 }}>✕</button>
            </div>

            {/* Applicant profile card */}
            {(applyProfile || profileLoading) && (
              <div style={{ margin: '16px 20px 0', padding: '14px 16px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                  {lang === 'de' ? 'Dein Profil' : 'Your Profile'}
                </p>
                {profileLoading ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{lang === 'de' ? 'Lade Profil…' : 'Loading profile…'}</span>
                  </div>
                ) : applyProfile && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                    {[
                      [lang === 'de' ? 'Name' : 'Name', [applyProfile.vorname, applyProfile.nachname].filter(Boolean).join(' ')],
                      [lang === 'de' ? 'Email' : 'Email', applyProfile.email],
                      [lang === 'de' ? 'Telefon' : 'Phone', applyProfile.telefon],
                      [lang === 'de' ? 'Wohnort' : 'City', applyProfile.wohnort],
                      [lang === 'de' ? 'Schule' : 'School', applyProfile.schule],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k as string}>
                        <p style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '1px' }}>{k as string}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v as string}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status area */}
            <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Generating */}
              {applyStatus === 'generating' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '32px 0' }}>
                  <span className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '4px' }}>
                      {isAutoApply
                        ? (lang === 'de' ? '⚡ KI schreibt & sendet automatisch…' : '⚡ AI writing & sending automatically…')
                        : (lang === 'de' ? '✦ KI schreibt deine Bewerbung…' : '✦ AI is writing your application…')}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {lang === 'de' ? 'Personalisiert für ' : 'Personalised for '}<strong style={{ color: 'var(--text-2)' }}>{selected.firma}</strong>
                    </p>
                    {isAutoApply && (
                      <p style={{ fontSize: '11px', color: 'var(--muted-2)', marginTop: '6px' }}>
                        {lang === 'de' ? 'Kein Review nötig — wird direkt gesendet' : 'No review needed — sends directly'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Review */}
              {applyStatus === 'review' && reviewEdits && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {lang === 'de' ? 'Senden an' : 'Sending to'}
                    </p>
                    <input
                      value={reviewEdits.toEmail}
                      onChange={e => setReviewEdits(prev => prev ? { ...prev, toEmail: e.target.value } : prev)}
                      placeholder={lang === 'de' ? 'firma@beispiel.ch' : 'company@example.ch'}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '9px', fontSize: '13px', outline: 'none', background: 'var(--surface-2)', border: `1px solid ${reviewEdits.toEmail ? 'var(--green)' : 'rgba(245,158,11,0.5)'}`, color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                    {!reviewEdits.toEmail && (
                      <p style={{ fontSize: '11px', color: 'var(--yellow)', marginTop: '4px' }}>
                        {lang === 'de' ? '⚠ Keine Email gefunden – bitte manuell eingeben' : '⚠ No email found – enter manually'}
                      </p>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {lang === 'de' ? 'Anschreiben' : 'Cover Letter'}
                    </p>
                    <textarea
                      value={reviewEdits.coverLetter}
                      onChange={e => setReviewEdits(prev => prev ? { ...prev, coverLetter: e.target.value } : prev)}
                      rows={10}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', outline: 'none', resize: 'vertical', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', lineHeight: 1.8, fontFamily: 'var(--font-geist-mono, monospace)', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    onClick={handleSendFromReview}
                    disabled={!reviewEdits.toEmail}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, background: reviewEdits.toEmail ? 'var(--accent)' : 'var(--surface-2)', color: reviewEdits.toEmail ? '#000' : 'var(--muted)', border: 'none', cursor: reviewEdits.toEmail ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: reviewEdits.toEmail ? 1 : 0.5 }}>
                    ✦ {lang === 'de' ? 'Bewerbung absenden' : 'Send Application'}
                  </button>
                  <button
                    onClick={handleDownloadDocx}
                    disabled={downloading}
                    style={{ width: '100%', padding: '9px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', fontFamily: 'inherit' }}>
                    {downloading && <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />}
                    ⤓ {downloading ? t.search_downloading : t.search_download}
                  </button>
                </div>
              )}

              {/* Sending */}
              {applyStatus === 'sending' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '32px 0' }}>
                  <span className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '4px' }}>
                      {lang === 'de' ? '✉ Bewerbung wird gesendet…' : '✉ Sending your application…'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {lang === 'de' ? 'An ' : 'To '}<strong style={{ color: 'var(--green)' }}>{selected.email}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Sent success */}
              {applyStatus === 'sent' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '24px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>✓</div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green)', marginBottom: '6px' }}>
                      {lang === 'de' ? 'Bewerbung gesendet!' : 'Application sent!'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                      {lang === 'de' ? 'Deine Bewerbung wurde an ' : 'Your application was sent to '}
                      <strong style={{ color: 'var(--text-2)' }}>{selected.firma}</strong>
                      {lang === 'de' ? ' weitergeleitet.' : '.'}
                    </p>
                    {applyProfile?.email && (
                      <p style={{ fontSize: '11px', color: 'var(--muted-2)' }}>
                        {lang === 'de' ? 'Antworten gehen direkt an ' : 'Replies go directly to '}
                        <strong>{applyProfile.email}</strong>
                      </p>
                    )}
                  </div>
                  {generated && (
                    <details style={{ width: '100%' }}>
                      <summary style={{ fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', marginBottom: '8px', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>▸</span>
                        {lang === 'de' ? 'Gesendeten Brief anzeigen' : 'View sent letter'}
                      </summary>
                      <textarea value={generated.message} readOnly rows={10}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', outline: 'none', resize: 'none', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text-2)', lineHeight: 1.8, fontFamily: 'var(--font-geist-mono, monospace)' }} />
                      <button onClick={handleDownloadDocx} disabled={downloading}
                        style={{ marginTop: '8px', width: '100%', padding: '9px', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', fontFamily: 'inherit' }}>
                        {downloading && <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />}
                        ⤓ {downloading ? t.search_downloading : t.search_download}
                      </button>
                    </details>
                  )}
                </div>
              )}

              {/* No email found */}
              {applyStatus === 'no-email' && generated && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--yellow)', fontSize: '12px' }}>
                    ⚠ {lang === 'de' ? 'Keine Firmen-Email gefunden. Lade den Brief herunter und sende ihn manuell.' : 'No company email found. Download the letter and send it manually.'}
                  </div>
                  {generated.fakten?.length > 0 && (
                    <div style={{ marginBottom: '14px', padding: '12px', borderRadius: '10px', background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', marginBottom: '8px', color: 'var(--accent-light)' }}>{t.search_ai_facts}</p>
                      {generated.fakten.map((f, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '2px' }}>· {f}</p>)}
                    </div>
                  )}
                  <textarea value={generated.message} onChange={e => setGenerated({ ...generated, message: e.target.value })} rows={11}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'none', marginBottom: '10px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', lineHeight: 1.8, fontFamily: 'var(--font-geist-mono, monospace)' }} />
                  <button onClick={handleDownloadDocx} disabled={downloading}
                    style={{ width: '100%', padding: '10px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-2)', fontFamily: 'inherit' }}>
                    {downloading && <span className="spinner" style={{ width: '13px', height: '13px', borderWidth: '1.5px' }} />}
                    ⤓ {downloading ? t.search_downloading : t.search_download}
                  </button>
                </div>
              )}

              {/* Error */}
              {applyStatus === 'error' && (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', marginBottom: '10px' }}>⚠</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--red)', marginBottom: '6px' }}>
                    {lang === 'de' ? 'Fehler beim Senden' : 'Failed to send'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{applyError}</p>
                  {generated && (
                    <button onClick={() => setApplyStatus('no-email')}
                      style={{ marginTop: '14px', padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {lang === 'de' ? 'Brief anzeigen & herunterladen' : 'View letter & download'}
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  )
}
