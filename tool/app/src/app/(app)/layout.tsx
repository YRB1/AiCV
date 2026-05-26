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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      href: '/interview', label: 'Interview',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
    {
      href: '/skript', label: 'Skript',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
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

  // Bottom nav (condensed for mobile)
  const bottomNavItems = [
    {
      href: '/dashboard', label: 'Home',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
    },
    {
      href: '/suche', label: 'Search',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    },
    {
      href: '/bewerbungen', label: 'Applied',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    },
    {
      href: '/interview', label: 'Prep',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
    {
      href: '/profil', label: 'Profile',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
      if (!data.user) { window.location.href = 'https://yrb1.github.io/AiCV/signin.html'; return }
      const e = data.user.email ?? ''
      setEmail(e)
      setInitials(e.slice(0, 2).toUpperCase())
    })
  }, [router])

  // Close sidebar when navigating
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  async function handleLogout() {
    if (isDemoMode()) { demoSignOut(); router.push('/'); return }
    await supabase.auth.signOut()
    router.push('/')
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 16px 18px', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'var(--accent-glow-2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px var(--accent-glow)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)', lineHeight: 1.2 }}>LehrstellenSniper</p>
          <p style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '1px', fontWeight: 600, letterSpacing: '0.04em' }}>AI Platform</p>
        </div>
      </Link>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 10px', borderRadius: '8px',
              fontSize: '13px', fontWeight: 500, textDecoration: 'none',
              background: active ? 'var(--accent-glow-2)' : 'transparent',
              color: active ? 'var(--accent-light)' : 'var(--muted)',
              borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ color: active ? 'var(--accent)' : 'var(--muted-2)', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
              {item.href === '/suche' && (
                <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--accent)', color: '#000', letterSpacing: '0.04em' }}>NEW</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--border)' }}>
        {/* Tier badge */}
        {tier !== 'free' && (
          <div style={{ margin: '0 0 8px', padding: '6px 10px', borderRadius: '8px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-light)' }}>
              {tier === 'pro' ? '⚡ Pro' : '🎓 Student'}
            </span>
          </div>
        )}

        {/* Language toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', marginBottom: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <div style={{ display: 'flex', borderRadius: '6px', border: '1px solid var(--border)', overflow: 'hidden', flex: 1 }}>
            {(['en', 'de'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                flex: 1, padding: '4px 0', fontSize: '11px', fontWeight: 600,
                background: lang === l ? 'var(--accent-glow-2)' : 'transparent',
                color: lang === l ? 'var(--accent-light)' : 'var(--muted)',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', marginBottom: '2px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'var(--accent-glow-2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--accent-light)' }}>
            {initials}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--muted-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{email}</p>
        </div>

        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--red)', fontFamily: 'inherit', transition: 'background 0.15s' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          {t.nav_signout}
        </button>
      </div>
    </>
  )

  return (
    <div className="ls-shell">
      {/* Mobile overlay */}
      <div className={`ls-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`ls-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Main */}
      <main className="ls-main">
        {/* Topbar */}
        <div className="ls-topbar">
          {/* Mobile: hamburger */}
          <button className="ls-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          {/* Mobile: brand */}
          <Link href="/dashboard" className="ls-mobile-brand">
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'var(--accent-glow-2)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            LehrstellenSniper
          </Link>

          {/* Desktop: usage stats */}
          <div className="ls-desktop" style={{ gap: '8px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tier === 'free' ? 'var(--yellow)' : 'var(--accent)', display: 'inline-block' }} />
              <span style={{ fontWeight: 600, color: tier === 'free' ? 'var(--muted)' : 'var(--accent-light)' }}>
                {tier === 'student' ? 'Student' : tier === 'pro' ? 'Pro' : 'Free'}
              </span>
              {dailyLimit !== null && (
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-2)', fontSize: '11px', color: dailyUsed >= dailyLimit ? 'var(--red)' : 'var(--muted)' }}>
                  {dailyUsed}/{dailyLimit}
                </span>
              )}
            </div>
            {tier === 'free' && (
              <Link href="/upgrade" style={{ padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: 'var(--accent-glow-2)', color: 'var(--accent-light)', border: '1px solid var(--accent)', textDecoration: 'none' }}>
                Upgrade ↑
              </Link>
            )}
          </div>

          {/* Mobile: upgrade + usage in topbar */}
          <div className="ls-mobile-brand" style={{ flex: 0, marginLeft: 'auto', gap: '8px' }}>
            {dailyLimit !== null && (
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px', background: 'var(--surface-2)', color: dailyUsed >= dailyLimit ? 'var(--red)' : 'var(--muted)', fontWeight: 600 }}>
                {dailyUsed}/{dailyLimit}
              </span>
            )}
            {tier === 'free' && (
              <Link href="/upgrade" style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'var(--accent)', color: '#000', textDecoration: 'none' }}>
                Pro ↑
              </Link>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="ls-content">
          {children}
        </div>

        {/* Bottom navigation (mobile only) */}
        <nav className="ls-bottom-nav">
          {bottomNavItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={`ls-bottom-item ${active ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </main>
    </div>
  )
}
