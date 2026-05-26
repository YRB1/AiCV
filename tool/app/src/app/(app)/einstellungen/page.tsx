'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/lib/lang-context'

const MODES = [
  {
    id: 'black',
    label: 'Black',
    description: 'OLED',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    ),
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Navy',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    id: 'light',
    label: 'Light',
    description: 'White',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
  },
  {
    id: 'system',
    label: 'System',
    description: 'Auto',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
]

const THEMES = [
  { id: 'ocean',    label: 'Ocean',    description: 'Cyan & Teal',        color: '#06b6d4', glow: 'rgba(6,182,212,0.35)' },
  { id: 'purple',   label: 'Purple',   description: 'Violet & Indigo',    color: '#7c3aed', glow: 'rgba(124,58,237,0.35)' },
  { id: 'emerald',  label: 'Emerald',  description: 'Green & Mint',       color: '#059669', glow: 'rgba(5,150,105,0.35)' },
  { id: 'midnight', label: 'Midnight', description: 'Indigo & Lavender',  color: '#6366f1', glow: 'rgba(99,102,241,0.35)' },
  { id: 'rose',     label: 'Rose',     description: 'Red & Pink',         color: '#e11d48', glow: 'rgba(225,29,72,0.35)' },
  { id: 'amber',    label: 'Amber',    description: 'Gold & Orange',      color: '#d97706', glow: 'rgba(217,119,6,0.35)' },
]

export default function Einstellungen() {
  const [activeTheme, setActiveTheme] = useState('ocean')
  const [activeMode, setActiveMode] = useState('dark')
  const t = useT()

  useEffect(() => {
    try {
      setActiveTheme(localStorage.getItem('ls_theme') || 'ocean')
      setActiveMode(localStorage.getItem('ls_mode') || 'dark')
    } catch { /* */ }
  }, [])

  function applyTheme(id: string) {
    setActiveTheme(id)
    try {
      localStorage.setItem('ls_theme', id)
      document.documentElement.setAttribute('data-theme', id)
    } catch { /* */ }
  }

  function applyMode(id: string) {
    setActiveMode(id)
    try {
      localStorage.setItem('ls_mode', id)
      document.documentElement.setAttribute('data-mode', id)
    } catch { /* */ }
  }

  return (
    <div style={{ padding: '28px 32px', minHeight: '100%' }} className="fade-in">
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.settings_title}</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>{t.settings_subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '560px' }}>

        {/* ── Mode ──────────────────────────────────────────────────── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Brightness Mode</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Choose between dark, light, or follow system preference</p>
          </div>
          <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {MODES.map(mode => {
              const active = activeMode === mode.id
              return (
                <button key={mode.id} onClick={() => applyMode(mode.id)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 8px', borderRadius: '10px',
                  background: active ? 'var(--accent-glow-2)' : 'var(--surface-2)',
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  color: active ? 'var(--accent-light)' : 'var(--muted)',
                }}>
                  <span style={{ color: active ? 'var(--accent)' : 'var(--muted-2)' }}>{mode.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600 }}>{mode.label}</span>
                  {'description' in mode && <span style={{ fontSize: '10px', color: 'var(--muted-2)' }}>{(mode as { description?: string }).description}</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Accent Color ──────────────────────────────────────────── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{t.settings_color_title}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{t.settings_color_sub}</p>
          </div>
          <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {THEMES.map(theme => {
              const active = activeTheme === theme.id
              return (
                <button key={theme.id} onClick={() => applyTheme(theme.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  background: active ? 'var(--surface-3)' : 'var(--surface-2)',
                  border: `1.5px solid ${active ? theme.color : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: theme.color, flexShrink: 0,
                    boxShadow: active ? `0 0 14px ${theme.glow}` : 'none',
                    transition: 'box-shadow 0.15s',
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{theme.label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>{theme.description}</p>
                  </div>
                  {active && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="3" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Preview ───────────────────────────────────────────────── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Preview</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Live preview of your current theme</p>
          </div>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Fake card */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'var(--accent-glow-2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Informatiker EFZ — Muster AG</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Zürich · Full time</p>
              </div>
              <div style={{
                padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: 'var(--accent-glow-2)', color: 'var(--accent-light)',
                border: '1px solid var(--accent)',
              }}>
                Apply
              </div>
            </div>
            {/* Color swatches */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ height: '6px', flex: 1, borderRadius: '3px', background: 'var(--accent)' }} />
              <div style={{ height: '6px', flex: 1, borderRadius: '3px', background: 'var(--accent-light)', opacity: 0.6 }} />
              <div style={{ height: '6px', flex: 1, borderRadius: '3px', background: 'var(--surface-3)' }} />
              <div style={{ height: '6px', flex: 1, borderRadius: '3px', background: 'var(--border)' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
