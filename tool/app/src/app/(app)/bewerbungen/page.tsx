'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/types'
import { useT } from '@/lib/lang-context'

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  neu:         { bg: 'rgba(99,102,241,0.12)',  color: '#a5b4fc', label: 'New' },
  kontaktiert: { bg: 'rgba(6,182,212,0.12)',   color: '#67e8f9', label: 'Contacted' },
  antwort:     { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', label: 'Reply' },
  absage:      { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5', label: 'Rejected' },
  zusage:      { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', label: 'Offer!' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

function Avatar({ name }: { name: string }) {
  const colors = ['#6d28d9','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#0284c7']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: '36px', height: '36px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0, background: `${color}22`, color, border: `1px solid ${color}40` }}>
      {name[0]?.toUpperCase()}
    </div>
  )
}

const STATUSES = ['neu', 'kontaktiert', 'antwort', 'absage', 'zusage'] as const

export default function BewerbungenPage() {
  const t = useT()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setLeads(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Lead['status'] } : prev)
    setUpdatingId(null)
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }} className="fade-in">
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.nav_applications}</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{leads.length} total · track your application pipeline</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
          background: filter === 'all' ? 'var(--accent-glow-2)' : 'var(--surface)',
          color: filter === 'all' ? 'var(--accent-light)' : 'var(--muted)',
          border: `1px solid ${filter === 'all' ? 'var(--accent)' : 'var(--border)'}`,
          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
        }}>
          All ({leads.length})
        </button>
        {STATUSES.map(s => {
          const st = STATUS_COLORS[s]
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              background: filter === s ? st.bg : 'var(--surface)',
              color: filter === s ? st.color : 'var(--muted)',
              border: `1px solid ${filter === s ? st.color + '60' : 'var(--border)'}`,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
              {st.label} {counts[s] > 0 ? `(${counts[s]})` : ''}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '64px', borderRadius: '10px', background: 'var(--surface)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <p style={{ fontSize: '36px', marginBottom: '10px' }}>📋</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-2)', marginBottom: '4px' }}>
            {leads.length === 0 ? 'No applications yet' : 'No applications match this filter'}
          </p>
          <p style={{ fontSize: '13px' }}>
            {leads.length === 0 ? 'Search for jobs and apply to see them here' : 'Try a different filter'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(lead => {
            const st = STATUS_COLORS[lead.status]
            return (
              <div key={lead.id} onClick={() => setSelected(lead)} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto auto',
                alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '12px',
                background: selected?.id === lead.id ? 'var(--surface-2)' : 'var(--surface)',
                border: `1px solid ${selected?.id === lead.id ? 'var(--border-2)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <Avatar name={lead.firma} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.firma}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{lead.beruf} · {lead.kanton} · {timeAgo(lead.created_at)}</p>
                </div>
                {lead.email && (
                  <span style={{ fontSize: '11px', color: 'var(--green)', whiteSpace: 'nowrap' }}>✓ {lead.email}</span>
                )}
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div style={{ width: '100%', maxWidth: '520px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border-2)', maxHeight: '85vh', overflowY: 'auto' }} className="fade-in-scale">

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <Avatar name={selected.firma} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{selected.firma}</h2>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>{selected.beruf} · {selected.kanton} · {selected.stadt}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', background: 'var(--surface-2)', border: 'none', fontSize: '14px' }}>✕</button>
            </div>

            <div style={{ padding: '18px 20px' }}>
              {/* Contact info */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {selected.email && <div style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '7px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--green)' }}>✉ {selected.email}</div>}
                {selected.telefon && <div style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '7px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: 'var(--blue)' }}>📞 {selected.telefon}</div>}
                {selected.url && <a href={selected.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '7px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)', textDecoration: 'none' }}>🔗 View listing</a>}
              </div>

              {/* Status update */}
              <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '8px' }}>UPDATE STATUS</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {STATUSES.map(s => {
                  const st = STATUS_COLORS[s]
                  const active = selected.status === s
                  return (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updatingId === selected.id}
                      style={{
                        padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        background: active ? st.bg : 'var(--surface-2)',
                        color: active ? st.color : 'var(--muted)',
                        border: `1px solid ${active ? st.color + '60' : 'var(--border)'}`,
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        opacity: updatingId === selected.id ? 0.5 : 1,
                      }}>
                      {st.label}
                    </button>
                  )
                })}
              </div>

              {/* Cover letter */}
              {selected.generated_message && (
                <>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '8px' }}>COVER LETTER</p>
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: '220px', overflowY: 'auto', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                    {selected.generated_message}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
