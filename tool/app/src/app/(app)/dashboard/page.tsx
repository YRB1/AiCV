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

const TRENDING = [
  { beruf: 'Informatiker EFZ', count: '2.4k', hot: true },
  { beruf: 'Kaufmann/-frau EFZ', count: '1.8k', hot: true },
  { beruf: 'Polymechaniker EFZ', count: '1.1k', hot: false },
  { beruf: 'Fachmann Gesundheit', count: '980', hot: false },
  { beruf: 'Mediamatiker EFZ', count: '740', hot: false },
]

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const t = useT()
  const { lang } = useLang()

  const STATUS_LABELS: Record<Lead['status'], string> = {
    neu: t.status_neu,
    kontaktiert: t.status_sent,
    antwort: t.status_reply,
    absage: t.status_rejected,
    zusage: t.status_offer,
  }

  const STATUS_COLORS: Record<Lead['status'], { bg: string; text: string }> = {
    neu:         { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
    kontaktiert: { bg: 'rgba(6,182,212,0.15)',   text: '#67e8f9' },
    antwort:     { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24' },
    absage:      { bg: 'rgba(239,68,68,0.15)',   text: '#f87171' },
    zusage:      { bg: 'rgba(16,185,129,0.15)',  text: '#34d399' },
  }

  useEffect(() => {
    async function load() {
      if (isDemoMode()) {
        const user = demoGetUser()
        if (!user) return
        setLeads(demoGetLeads() as Lead[])
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('leads').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(50)
      setLeads(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const gesendet = leads.filter(l => ['kontaktiert', 'antwort', 'zusage'].includes(l.status)).length
  const antworten = leads.filter(l => ['antwort', 'zusage'].includes(l.status)).length
  const zusagen = leads.filter(l => l.status === 'zusage').length
  const recent = leads.slice(0, 5)
  const replyRate = gesendet > 0 ? Math.round((antworten / gesendet) * 100) : 0

  const stats = [
    {
      label: t.dash_stat_applications, value: leads.length,
      iconColor: 'var(--accent)', iconBg: 'var(--accent-glow-2)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    },
    {
      label: t.dash_stat_sent, value: gesendet,
      iconColor: '#60a5fa', iconBg: 'rgba(59,130,246,0.15)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    },
    {
      label: t.dash_stat_replies, value: antworten,
      iconColor: '#fbbf24', iconBg: 'rgba(245,158,11,0.15)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
    {
      label: t.dash_stat_offers, value: zusagen,
      iconColor: '#34d399', iconBg: 'rgba(16,185,129,0.15)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
    },
  ]

  return (
    <div className="ls-page fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '3px' }}>{t.nav_dashboard}</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{t.dash_subtitle}</p>
      </div>

      {/* Stats grid */}
      <div className="ls-stats-grid">
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px', transition: 'border-color 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor }}>
                {s.icon}
              </div>
            </div>
            <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Reply rate banner (only show when there's data) */}
      {!loading && gesendet >= 3 && (
        <div style={{ marginBottom: '18px', padding: '14px 18px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-glow), var(--accent-glow-2))', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '24px' }}>{replyRate >= 30 ? '🔥' : '📈'}</div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-light)' }}>
              {replyRate}% {lang === 'de' ? 'Antwortrate' : 'reply rate'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>
              {replyRate >= 30
                ? (lang === 'de' ? 'Ausgezeichnet! Du bist auf Kurs.' : 'Excellent! You are on track.')
                : (lang === 'de' ? 'Sende mehr Bewerbungen für bessere Chancen.' : 'Send more applications to improve your chances.')}
            </p>
          </div>
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>

        {/* Recent applications */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: 600 }}>{t.dash_recent}</p>
            <Link href="/bewerbungen" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>{t.dash_view_all}</Link>
          </div>
          {loading ? (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : recent.length === 0 ? (
            <div style={{ padding: '36px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: '36px', marginBottom: '10px' }}>🚀</p>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '10px' }}>{t.dash_empty}</p>
              <Link href="/suche" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none', padding: '9px 18px', borderRadius: '9px', background: 'var(--accent)' }}>
                {t.dash_empty_cta}
              </Link>
            </div>
          ) : (
            recent.map(lead => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', padding: '11px 18px', borderBottom: '1px solid var(--border)', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>
                  {lead.firma[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.firma}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>{lead.beruf}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', flexShrink: 0, background: STATUS_COLORS[lead.status].bg, color: STATUS_COLORS[lead.status].text }}>
                  {STATUS_LABELS[lead.status]}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--muted-2)', flexShrink: 0 }}>
                  {lead.created_at ? timeAgo(lead.created_at) : ''}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Bottom row: Quick start + Trending */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

          {/* Quick start */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{t.dash_quickstart}</p>
            </div>
            <div style={{ padding: '10px' }}>
              {[
                { href: '/suche', label: t.dash_qs_search, sub: t.dash_qs_search_sub, iconBg: 'var(--accent-glow-2)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
                { href: '/skript', label: 'Bewerbungs-Skript', sub: 'Vorlage bearbeiten', iconBg: 'rgba(124,58,237,0.15)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
                { href: '/interview', label: 'Interview Prep', sub: 'Fragen üben', iconBg: 'rgba(245,158,11,0.15)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                { href: '/profil', label: t.dash_qs_profile, sub: t.dash_qs_profile_sub, iconBg: 'rgba(16,185,129,0.15)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
              ].map(item => (
                <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', textDecoration: 'none', background: 'var(--surface-2)', marginBottom: '5px', transition: 'background 0.15s' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending this week */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>🔥</span>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{lang === 'de' ? 'Trending' : 'Trending'}</p>
            </div>
            <div style={{ padding: '10px' }}>
              {TRENDING.map((item, i) => (
                <Link key={item.beruf} href={`/suche?q=${encodeURIComponent(item.beruf)}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.15s', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-2)', width: '16px', flexShrink: 0 }}>#{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.beruf}</p>
                    <p style={{ fontSize: '10px', color: 'var(--muted)' }}>{item.count} {lang === 'de' ? 'Stellen' : 'listings'}</p>
                  </div>
                  {item.hot && <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', background: 'rgba(239,68,68,0.15)', color: '#f87171', flexShrink: 0 }}>HOT</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
