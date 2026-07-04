'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types'
import Link from 'next/link'
import { isDemoMode, demoGetUser, demoGetLeads } from '@/lib/mock-auth'
import { useT, useLang } from '@/lib/lang-context'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (d > 0) return `${d}d`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', padding: '0 4px' }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', borderRadius: '4px 4px 0 0',
            height: `${Math.max(8, (v / max) * 64)}px`,
            background: i === data.length - 1 || i === data.length - 2
              ? 'var(--accent)'
              : 'rgba(99,102,241,0.35)',
            transition: 'height 0.4s ease',
            boxShadow: i === data.length - 1 ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
          }} />
          <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 500 }}>{days[i]}</span>
        </div>
      ))}
    </div>
  )
}

function CvGauge({ score }: { score: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ * 0.75
  const offset = circ * 0.125
  const label = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs work'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
          strokeDasharray={`${circ * 0.75} ${circ}`} strokeDashoffset={-offset}
          strokeLinecap="round" transform="rotate(135 65 65)" />
        <circle cx="65" cy="65" r={r} fill="none"
          stroke="url(#gaugeGrad)" strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`} strokeDashoffset={-offset}
          strokeLinecap="round" transform="rotate(135 65 65)"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>
        </defs>
        <text x="65" y="60" textAnchor="middle" fill="white" fontSize="24" fontWeight="800">{score}%</text>
        <text x="65" y="78" textAnchor="middle" fill="#8fa3bf" fontSize="10" fontWeight="500">{label}</text>
      </svg>
    </div>
  )
}

const DEMO_ACTIVITY = [4, 7, 5, 9, 12, 8, 11]

const TRENDING = [
  { beruf: 'Informatiker EFZ', count: '2.4k', hot: true },
  { beruf: 'Kaufmann/-frau EFZ', count: '1.8k', hot: true },
  { beruf: 'Polymechaniker EFZ', count: '1.1k', hot: false },
  { beruf: 'Fachmann Gesundheit', count: '980', hot: false },
  { beruf: 'Mediamatiker EFZ', count: '740', hot: false },
]

const card: React.CSSProperties = {
  background: 'linear-gradient(145deg, var(--surface) 0%, var(--surface-2) 100%)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const t = useT()
  const { lang } = useLang()

  const STATUS_LABELS: Record<Lead['status'], string> = {
    neu: t.status_neu, kontaktiert: t.status_sent,
    antwort: t.status_reply, absage: t.status_rejected, zusage: t.status_offer,
  }
  const STATUS_COLORS: Record<Lead['status'], { bg: string; text: string }> = {
    neu:         { bg: 'rgba(99,102,241,0.18)',  text: '#a5b4fc' },
    kontaktiert: { bg: 'rgba(34,211,238,0.15)',  text: '#22d3ee' },
    antwort:     { bg: 'rgba(245,158,11,0.18)',  text: '#fbbf24' },
    absage:      { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
    zusage:      { bg: 'rgba(16,185,129,0.18)',  text: '#34d399' },
  }

  useEffect(() => {
    async function load() {
      if (isDemoMode()) {
        setLeads(demoGetLeads() as Lead[])
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('leads').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      setLeads(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const gesendet   = leads.filter(l => ['kontaktiert','antwort','zusage'].includes(l.status)).length
  const antworten  = leads.filter(l => ['antwort','zusage'].includes(l.status)).length
  const zusagen    = leads.filter(l => l.status === 'zusage').length
  const replyRate  = gesendet > 0 ? Math.round((antworten / gesendet) * 100) : 0
  const cvScore    = isDemoMode() ? 94 : Math.min(100, 60 + leads.length * 2)
  const jobMatches = isDemoMode() ? 124 : leads.length * 8
  const recent     = leads.slice(0, 5)

  const stats = [
    { label: lang === 'de' ? 'BEWERBUNGEN' : 'APPLICATIONS SENT', value: loading ? '—' : String(leads.length),
      trend: '↑ 12 ' + (lang === 'de' ? 'diese Woche' : 'this week'), iconBg: 'var(--accent-glow-2)', iconColor: 'var(--accent)',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: 'INTERVIEWS', value: loading ? '—' : String(antworten),
      trend: '↑ 3 ' + (lang === 'de' ? 'neue' : 'new'), iconBg: 'rgba(250,204,21,0.12)', iconColor: '#facc15',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { label: lang === 'de' ? 'JOB-TREFFER' : 'JOB MATCHES', value: loading ? '—' : String(jobMatches),
      trend: '↑ 24 ' + (lang === 'de' ? 'heute' : 'today'), iconBg: 'rgba(52,211,153,0.12)', iconColor: '#34d399',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
    { label: lang === 'de' ? 'LB-SCORE' : 'CV SCORE', value: loading ? '—' : `${cvScore}%`,
      trend: 'Top 6%', iconBg: 'rgba(165,180,252,0.12)', iconColor: '#a5b4fc',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
  ]

  return (
    <div className="ls-page fade-in">
      {/* KPI cards */}
      <div className="ls-stats-grid" style={{ marginBottom: '14px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '38px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{s.value}</p>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, flexShrink: 0 }}>{s.icon}</div>
            </div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
            <p style={{ fontSize: '11px', color: '#34d399', marginTop: '4px', fontWeight: 600 }}>{s.trend}</p>
          </div>
        ))}
      </div>

      {/* Middle row: Activity chart + CV Score */}
      <div className="ls-dash-mid">

        {/* Activity chart */}
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              {lang === 'de' ? 'Aktivität — 7 Tage' : 'Activity — Last 7 Days'}
            </p>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-2)' }} />)}
            </div>
          </div>
          <BarChart data={isDemoMode() ? DEMO_ACTIVITY : Array(7).fill(0)} />
        </div>

        {/* CV Score */}
        <div style={{ ...card, padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '8px' }}>
            {lang === 'de' ? 'LB-Score' : 'CV Score'}
          </p>
          <CvGauge score={loading ? 0 : cvScore} />
        </div>
      </div>

      {/* Recent applications */}
      <div style={{ ...card, overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{t.dash_recent}</p>
          <Link href="/bewerbungen" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{t.dash_view_all}</Link>
        </div>
        {loading ? (
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '36px 18px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>🚀</p>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '14px' }}>{t.dash_empty}</p>
            <Link href="/suche" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '9px 20px', borderRadius: '9px', background: 'var(--accent)' }}>
              {t.dash_empty_cta}
            </Link>
          </div>
        ) : (
          recent.map((lead, i) => (
            <div key={lead.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none', gap: '12px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0, background: 'var(--accent-glow-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                {lead.firma[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.firma} — {lead.beruf}</p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', flexShrink: 0, background: STATUS_COLORS[lead.status].bg, color: STATUS_COLORS[lead.status].text }}>
                {STATUS_LABELS[lead.status]}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Bottom row: Quick start + Trending */}
      <div className="ls-2col">
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{t.dash_quickstart}</p>
          </div>
          <div style={{ padding: '10px' }}>
            {[
              { href: '/suche', label: t.dash_qs_search, sub: t.dash_qs_search_sub, c: 'var(--accent)', bg: 'var(--accent-glow-2)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
              { href: '/skript', label: 'Bewerbungs-Skript', sub: 'Vorlage bearbeiten', c: '#a78bfa', bg: 'rgba(124,58,237,0.15)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
              { href: '/interview', label: 'Interview Prep', sub: 'Fragen üben', c: '#fbbf24', bg: 'rgba(245,158,11,0.15)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
              { href: '/profil', label: t.dash_qs_profile, sub: t.dash_qs_profile_sub, c: '#34d399', bg: 'rgba(16,185,129,0.15)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '9px', textDecoration: 'none', background: 'transparent', marginBottom: '3px', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)') }
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent') }>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.c, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px' }}>🔥</span>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>Trending</p>
          </div>
          <div style={{ padding: '10px' }}>
            {TRENDING.map((item, i) => (
              <Link key={item.beruf} href={`/suche?q=${encodeURIComponent(item.beruf)}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', textDecoration: 'none', marginBottom: '2px', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-3)') }
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent') }>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-2)', width: '16px', flexShrink: 0 }}>#{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.beruf}</p>
                  <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{item.count} {lang === 'de' ? 'Stellen' : 'listings'}</p>
                </div>
                {item.hot && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.15)', color: '#f87171', flexShrink: 0 }}>HOT</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
