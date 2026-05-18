'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types'
import Link from 'next/link'
import { isDemoMode, demoGetUser, demoGetLeads } from '@/lib/mock-auth'

const STATUS_LABELS: Record<Lead['status'], string> = {
  neu: 'Neu',
  kontaktiert: 'Gesendet',
  antwort: 'Antwort',
  absage: 'Absage',
  zusage: 'Zusage',
}

const STATUS_COLORS: Record<Lead['status'], { bg: string; text: string }> = {
  neu: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  kontaktiert: { bg: 'rgba(6,182,212,0.15)', text: '#67e8f9' },
  antwort: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  absage: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  zusage: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (d > 0) return `vor ${d}d`
  if (h > 0) return `vor ${h}h`
  return `vor ${m}m`
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

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
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setLeads(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const gesendet = leads.filter(l => ['kontaktiert', 'antwort', 'zusage'].includes(l.status)).length
  const antworten = leads.filter(l => ['antwort', 'zusage'].includes(l.status)).length
  const zusagen = leads.filter(l => l.status === 'zusage').length
  const recent = leads.slice(0, 5)

  const stats = [
    {
      label: 'Bewerbungen',
      value: leads.length,
      iconColor: 'var(--accent)',
      iconBg: 'var(--accent-glow-2)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    {
      label: 'Gesendet',
      value: gesendet,
      iconColor: '#60a5fa',
      iconBg: 'rgba(59,130,246,0.15)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      ),
    },
    {
      label: 'Antworten',
      value: antworten,
      iconColor: '#fbbf24',
      iconBg: 'rgba(245,158,11,0.15)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      label: 'Zusagen',
      value: zusagen,
      iconColor: '#34d399',
      iconBg: 'rgba(16,185,129,0.15)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ padding: '36px 40px', minHeight: '100%' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Dashboard</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>Willkommen zurück — hier ist dein Überblick</p>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)' }}>{s.label}</p>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor }}>
                {s.icon}
              </div>
            </div>
            <p style={{ fontSize: '36px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px' }}>
        {/* Letzte Bewerbungen */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Letzte Bewerbungen</p>
            <Link href="/bewerbungen" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Alle anzeigen →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '24px 20px', color: 'var(--muted)', fontSize: '13px' }}>Laden...</div>
          ) : recent.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '10px' }}>Noch keine Bewerbungen.</p>
              <Link href="/suche" style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                Jetzt Lehrstellen suchen →
              </Link>
            </div>
          ) : (
            recent.map(lead => (
              <div key={lead.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.firma}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{lead.beruf}</p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, padding: '3px 8px', borderRadius: '6px', flexShrink: 0, background: STATUS_COLORS[lead.status].bg, color: STATUS_COLORS[lead.status].text }}>
                  {STATUS_LABELS[lead.status]}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--muted-2)', flexShrink: 0 }}>
                  {lead.created_at ? timeAgo(lead.created_at) : ''}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Schnellstart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Schnellstart</p>
          </div>
          <div style={{ padding: '12px' }}>
            <Link href="/suche" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '8px', textDecoration: 'none', background: 'var(--surface-2)', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-glow-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Lehrstellen suchen</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>Finde neue Stellen</p>
              </div>
            </Link>
            <Link href="/profil" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '8px', textDecoration: 'none', background: 'var(--surface-2)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Profil einrichten</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>Persönliche Angaben</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}