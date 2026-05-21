'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { isDemoMode, demoGetUser, demoSignOut } from '@/lib/mock-auth'
import { useLang, useT } from '@/lib/lang-context'
import { useProfile } from '@/lib/profile-context'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [initials, setInitials] = useState('')
  const { lang, setLang } = useLang()
  const t = useT()
  const { tier, dailyUsed, dailyLimit, aiUsed, aiLimit } = useProfile()

  const navItems = [
    {
      href: '/dashboard', label: t.nav_dashboard,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
    },
    {
      href: '/suche', label: t.nav_search,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    },
    {
      href: '/bewerbungen', label: t.nav_applications,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    },
    {
      href: '/interview', label: 'Interview Prep',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    {
      href: '/profil', label: t.nav_profile,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    {
      href: '/einstellungen', label: t.nav_settings,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    },
  ]

  useEffect(() => {
    if (isDemoMode()) {
      const user = demoGetUser()
      if (!user) { router.push('/'); return }
      setEmail(user.email)
      setInitials(user.email.slice(0, 2).toUpperCase())
      return
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = 'http://localhost:3001/signin.html'; return }
      const e = data.user.email ?? ''
      setEmail(e)
      setInitials(e.slice(0, 2).toUpperCase())
    })
  }, [router])

  async function handleLogout() {
    if (isDemoMode()) { demoSignOut(); router.push('/'); return }
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', transition: 'background 0.25s ease' }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}>

        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '22px 18px 20px', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '9px',
            background: 'var(--accent-glow-2)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 0 16px var(--accent-glow)',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', lineHeight: 1.2 }}>LehrstellenSniper</p>
            <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '1px' }}>AI</p>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                background: active ? 'var(--accent-glow-2)' : 'transparent',
                color: active ? 'var(--accent-light)' : 'var(--muted)',
                borderLeft: active ? `2px solid var(--accent)` : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
                <span style={{ color: active ? 'var(--accent)' : 'var(--muted-2)', flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '10px 10px 14px', borderTop: '1px solid var(--border)' }}>

          {/* Language toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', marginBottom: '8px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <div style={{ display: 'flex', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden', flex: 1 }}>
              {(['en', 'de'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  flex: 1, padding: '4px 0', fontSize: '11px', fontWeight: 600,
                  background: lang === l ? 'var(--accent-glow-2)' : 'transparent',
                  color: lang === l ? 'var(--accent-light)' : 'var(--muted)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* User row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', marginBottom: '4px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent-glow-2)', border: '1px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: 'var(--accent-light)',
            }}>
              {initials}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--muted-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{email}</p>
          </div>

          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: '8px', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: 'var(--red)', fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t.nav_signout}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          height: '52px', flexShrink: 0,
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 28px', gap: '12px',
          background: 'var(--surface)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tier === 'free' ? 'var(--yellow)' : 'var(--green)', display: 'inline-block' }} />
            <span style={{ fontWeight: 600, color: tier === 'free' ? 'var(--muted)' : 'var(--accent-light)' }}>
              {tier === 'student' ? 'Student' : tier === 'pro' ? 'Pro' : 'Free'}
            </span>
            {dailyLimit !== null && (
              <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-2)', fontSize: '11px', color: dailyUsed >= dailyLimit ? 'var(--red)' : 'var(--muted)' }}>
                {dailyUsed}/{dailyLimit} Bewerbungen
              </span>
            )}
            {aiLimit !== null && (
              <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-2)', fontSize: '11px', color: aiUsed >= aiLimit ? 'var(--red)' : 'var(--muted)' }}>
                {aiUsed}/{aiLimit} KI
              </span>
            )}
          </div>
          {tier === 'free' && (
            <Link href="/upgrade" style={{
              padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              background: 'var(--accent-glow-2)', color: 'var(--accent-light)',
              border: '1px solid var(--accent)', textDecoration: 'none',
            }}>
              Upgrade ↑
            </Link>
          )}
        </div>

        <div style={{ flex: 1, padding: '0' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
