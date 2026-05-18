'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { isDemoMode, demoSignIn } from '@/lib/mock-auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const demo = isDemoMode()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (demo) {
      const result = demoSignIn(email, password)
      if ('error' in result) setError(result.error)
      else router.push('/dashboard')
      setLoading(false)
      return
    }

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Bestätigungs-Email gesendet. Bitte E-Mail prüfen.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">LehrstellenSniper</span>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-semibold mb-1">{isRegister ? 'Konto erstellen' : 'Anmelden'}</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            {isRegister ? 'Finde deine Traumlehrstelle in der Schweiz' : 'Willkommen zurück'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'var(--muted)' }}>E-MAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="deine@email.ch"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: 'var(--muted)' }}>PASSWORT</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>

            {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
            {message && <p className="text-sm" style={{ color: 'var(--green)' }}>{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 cursor-pointer"
              style={{ background: 'var(--purple)', color: 'white' }}
            >
              {loading ? 'Laden...' : isRegister ? 'Konto erstellen' : 'Anmelden'}
            </button>
          </form>

          <p className="text-sm text-center mt-4" style={{ color: 'var(--muted)' }}>
            {isRegister ? 'Bereits ein Konto?' : 'Noch kein Konto?'}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="underline cursor-pointer" style={{ color: 'var(--purple-light)' }}>
              {isRegister ? 'Anmelden' : 'Registrieren'}
            </button>
          </p>
        </div>

        {demo && (
          <div className="mt-4 px-3 py-2 rounded-lg text-xs text-center" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--purple-light)' }}>
            Demo-Modus · beliebige Email · Passwort: <strong>test</strong>
          </div>
        )}
        <p className="text-xs text-center mt-3" style={{ color: 'var(--muted-2)' }}>
          100% legal · Schweiz · DSGVO-konform
        </p>
      </div>
    </div>
  )
}
