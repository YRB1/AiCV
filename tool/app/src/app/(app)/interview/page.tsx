'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Question {
  question: string
  category: string
  tip: string
}

interface PrepResult {
  questions: Question[]
  company_research: string[]
  what_to_wear: string
  opening_line: string
}

interface Lead {
  id: string; firma: string; beruf: string; beschreibung?: string
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Motivation:   { bg: 'rgba(6,182,212,0.12)',   color: '#67e8f9' },
  Personal:     { bg: 'rgba(124,58,237,0.12)',   color: '#a78bfa' },
  Technical:    { bg: 'rgba(5,150,105,0.12)',    color: '#34d399' },
  Situational:  { bg: 'rgba(217,119,6,0.12)',    color: '#fbbf24' },
}

function Avatar({ name }: { name: string }) {
  const colors = ['#6d28d9','#0891b2','#059669','#d97706','#dc2626','#7c3aed']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: '36px', height: '36px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, background: `${color}22`, color, border: `1px solid ${color}40` }}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

export default function InterviewPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [result, setResult] = useState<PrepResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedQ, setExpandedQ] = useState<number | null>(null)
  const [cvText, setCvText] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: leadsData }, { data: profile }] = await Promise.all([
        supabase.from('leads').select('id, firma, beruf').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('profiles').select('cv_text').eq('user_id', user.id).single(),
      ])
      setLeads(leadsData ?? [])
      setCvText(profile?.cv_text ?? '')
    }
    load()
  }, [])

  async function handlePrep(lead: Lead) {
    setSelected(lead)
    setResult(null)
    setError('')
    setLoading(true)
    setExpandedQ(null)
    try {
      const res = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firma: lead.firma, beruf: lead.beruf, cvText }),
      })
      const data = await res.json()
      if (res.ok) setResult(data)
      else setError(data.error ?? 'Failed to generate')
    } catch {
      setError('Failed to generate interview prep')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '960px' }} className="fade-in">
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>Interview Prep</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>AI-generated interview questions tailored to each company and role</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '280px 1fr' : '1fr', gap: '20px' }}>

        {/* Left: job list */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '10px' }}>YOUR APPLICATIONS</p>
          {leads.length === 0 ? (
            <div style={{ padding: '24px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Apply to jobs first to prep for interviews here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {leads.map(lead => (
                <button key={lead.id} onClick={() => handlePrep(lead)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                  borderRadius: '10px', textAlign: 'left', width: '100%',
                  background: selected?.id === lead.id ? 'var(--accent-glow)' : 'var(--surface)',
                  border: `1px solid ${selected?.id === lead.id ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                  <Avatar name={lead.firma} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.firma}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.beruf}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ))}
            </div>
          )}

          {/* Manual entry */}
          <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '8px' }}>PREP FOR ANY COMPANY</p>
            <input id="manual-firma" placeholder="Company name..." style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', fontSize: '12px', outline: 'none', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', marginBottom: '6px' }} />
            <input id="manual-beruf" placeholder="Role / apprenticeship..." style={{ width: '100%', padding: '8px 10px', borderRadius: '7px', fontSize: '12px', outline: 'none', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', marginBottom: '8px' }} />
            <button onClick={() => {
              const firma = (document.getElementById('manual-firma') as HTMLInputElement).value.trim()
              const beruf = (document.getElementById('manual-beruf') as HTMLInputElement).value.trim()
              if (firma && beruf) handlePrep({ id: 'manual', firma, beruf })
            }} style={{ width: '100%', padding: '8px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, background: 'var(--accent-glow-2)', color: 'var(--accent-light)', border: '1px solid var(--accent)', cursor: 'pointer', fontFamily: 'inherit' }}>
              ✦ Generate Questions
            </button>
          </div>
        </div>

        {/* Right: prep content */}
        {(loading || result || error) && (
          <div className="fade-in">
            {loading && (
              <div style={{ padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent-light)', animation: 'pulse 1.5s ease-in-out infinite' }}>✦ Generating your interview prep…</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>Tailoring questions for {selected?.firma}</p>
              </div>
            )}

            {error && (
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', fontSize: '13px' }}>
                ⚠ {error} — Make sure your Anthropic API key is set.
              </div>
            )}

            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Header */}
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar name={selected?.firma ?? '?'} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{selected?.firma}</p>
                    <p style={{ fontSize: '12px', color: 'var(--accent-light)' }}>{selected?.beruf}</p>
                  </div>
                </div>

                {/* Opening line */}
                {result.opening_line && (
                  <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '6px' }}>OPENING LINE</p>
                    <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic' }}>"{result.opening_line}"</p>
                  </div>
                )}

                {/* Questions */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Interview Questions ({result.questions?.length ?? 0})</p>
                  </div>
                  {result.questions?.map((q, i) => {
                    const cat = CATEGORY_COLORS[q.category] ?? { bg: 'var(--surface-2)', color: 'var(--muted)' }
                    const open = expandedQ === i
                    return (
                      <div key={i} onClick={() => setExpandedQ(open ? null : i)} style={{ padding: '12px 16px', borderBottom: i < result.questions.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s', background: open ? 'var(--surface-2)' : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: cat.bg, color: cat.color, flexShrink: 0, marginTop: '2px' }}>{q.category}</span>
                          <p style={{ fontSize: '13px', color: 'var(--text)', flex: 1, lineHeight: 1.5 }}>{q.question}</p>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', marginTop: '4px' }}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        {open && (
                          <div style={{ marginTop: '8px', marginLeft: '52px', padding: '8px 12px', borderRadius: '7px', background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                            <p style={{ fontSize: '11px', color: 'var(--accent-light)', fontWeight: 600, marginBottom: '3px' }}>TIP</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>{q.tip}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Research + dress code */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {result.company_research && (
                    <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '8px' }}>RESEARCH BEFORE INTERVIEW</p>
                      {result.company_research.map((r, i) => (
                        <p key={i} style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px' }}>• {r}</p>
                      ))}
                    </div>
                  )}
                  {result.what_to_wear && (
                    <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '8px' }}>WHAT TO WEAR</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6 }}>{result.what_to_wear}</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
