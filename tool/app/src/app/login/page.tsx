'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const MOCK_USERS = [
  { email: 'demo@blitzbewerbung.ch', password: 'demo123' },
  { email: 'test@test.com',           password: 'test123' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signin') {
      // Mock login bypass
      const mock = MOCK_USERS.find(u => u.email === email && u.password === password)
      if (mock) {
        localStorage.setItem('ls_preview_mode', '1')
        localStorage.setItem('ls_demo_session', JSON.stringify({ id: 'demo-user-123', email, created_at: new Date().toISOString() }))
        router.replace('/dashboard')
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.replace('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setSent(true)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-body, system-ui, sans-serif)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', margin: '0 16px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '36px 32px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>Blitzbewerbung</span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
          {mode === 'signin' ? 'Welcome back.' : 'Start applying smarter today.'}
        </p>

        {sent ? (
          <div style={{ padding: '16px', background: 'rgba(99,102,241,0.1)', border: '1px solid var(--accent)', borderRadius: '10px', color: 'var(--accent-light)', fontSize: '14px', lineHeight: 1.6 }}>
            Check your email — we sent you a confirmation link.
          </div>
        ) : (
          <>
            {/* Google */}
            <button onClick={handleGoogle} style={{
              width: '100%', padding: '11px', borderRadius: '9px', border: '1px solid var(--border-2)',
              background: 'var(--surface-2)', color: 'var(--text)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              marginBottom: '20px', transition: 'background 0.2s',
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} required
                style={{
                  padding: '11px 14px', borderRadius: '9px', border: '1px solid var(--border-2)',
                  background: 'var(--surface-2)', color: 'var(--text)', fontSize: '14px', outline: 'none',
                }}
              />
              <input
                type="password" placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} required
                style={{
                  padding: '11px 14px', borderRadius: '9px', border: '1px solid var(--border-2)',
                  background: 'var(--surface-2)', color: 'var(--text)', fontSize: '14px', outline: 'none',
                }}
              />

              {error && (
                <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
              )}

              <button type="submit" disabled={loading} style={{
                padding: '12px', borderRadius: '9px', border: 'none',
                background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                marginTop: '4px',
              }}>
                {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '20px', textAlign: 'center' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </>
        )}

        <div style={{ marginTop: '24px', padding: '12px', background: 'var(--surface-2)', borderRadius: '9px', border: '1px dashed var(--border-2)' }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mock logins</p>
          {MOCK_USERS.map(u => (
            <button key={u.email} onClick={() => { setEmail(u.email); setPassword(u.password) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', fontSize: '12px', color: 'var(--accent-light)' }}>
              {u.email} / {u.password}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        input::placeholder { color: var(--muted); }
        input:focus { border-color: var(--accent) !important; }
      `}</style>
    </div>
  )
}
