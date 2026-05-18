'use client'

import { useEffect, useState } from 'react'

const THEMES = [
  { id: 'ocean',    label: 'Ocean',    description: 'Cyan & Teal',         color: '#06b6d4' },
  { id: 'purple',   label: 'Purple',   description: 'Violet & Indigo',     color: '#7c3aed' },
  { id: 'emerald',  label: 'Emerald',  description: 'Green & Mint',        color: '#059669' },
  { id: 'midnight', label: 'Midnight', description: 'Indigo & Lavender',   color: '#6366f1' },
]

export default function Einstellungen() {
  const [activeTheme, setActiveTheme] = useState('ocean')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ls_theme') || 'ocean'
      setActiveTheme(saved)
    } catch { /* */ }
  }, [])

  function applyTheme(id: string) {
    setActiveTheme(id)
    try {
      localStorage.setItem('ls_theme', id)
      document.documentElement.setAttribute('data-theme', id)
    } catch { /* */ }
  }

  return (
    <div style={{ padding: '36px 40px', minHeight: '100%' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Einstellungen</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '32px' }}>Passe das Erscheinungsbild an</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', maxWidth: '560px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Farbschema</p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Wähle deine bevorzugte Akzentfarbe</p>
        </div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {THEMES.map(theme => {
            const active = activeTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', borderRadius: '10px',
                  background: active ? 'var(--surface-3)' : 'var(--surface-2)',
                  border: `1.5px solid ${active ? theme.color : 'var(--border)'}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: theme.color, flexShrink: 0,
                  boxShadow: active ? `0 0 12px ${theme.color}88` : 'none',
                  transition: 'box-shadow 0.15s',
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{theme.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>{theme.description}</p>
                </div>
                {active && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="3" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}