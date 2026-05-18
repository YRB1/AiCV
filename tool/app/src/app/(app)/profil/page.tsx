'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  vorname: string
  nachname: string
  schule: string
  jahrgang: string
  wunschberuf: string
  wohnort: string
  telefon: string
  email: string
}

const EMPTY: Profile = { vorname: '', nachname: '', schule: '', jahrgang: '', wunschberuf: '', wohnort: '', telefon: '', email: '' }

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (typeof window !== 'undefined' && (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes('abcdefgh')
      )) {
        const raw = localStorage.getItem('ls_demo_profile')
        const p = raw ? { vorname:'Max',nachname:'Muster',schule:'Oberstufe Zürich',jahrgang:'3. Sek',wunschberuf:'Polymechaniker EFZ',wohnort:'Zürich',telefon:'+41 79 123 45 67',email:'demo@lehrstellensniper.ch',...JSON.parse(raw) } : {vorname:'Max',nachname:'Muster',schule:'Oberstufe Zürich',jahrgang:'3. Sek',wunschberuf:'Polymechaniker EFZ',wohnort:'Zürich',telefon:'+41 79 123 45 67',email:'demo@lehrstellensniper.ch'}
        setProfile(p)
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (data) setProfile({
        vorname: data.vorname ?? '', nachname: data.nachname ?? '',
        schule: data.schule ?? '', jahrgang: data.jahrgang ?? '',
        wunschberuf: data.wunschberuf ?? '', wohnort: data.wohnort ?? '',
        telefon: data.telefon ?? '', email: data.email ?? user.email ?? '',
      })
      else setProfile(p => ({ ...p, email: user.email ?? '' }))
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    const isDemo = typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('abcdefgh'))
    if (isDemo) {
      localStorage.setItem('ls_demo_profile', JSON.stringify(profile))
      setSaved(true); setSaving(false); setTimeout(() => setSaved(false), 2000); return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ user_id: user.id, ...profile }, { onConflict: 'user_id' })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  function set(key: keyof Profile, value: string) {
    setProfile(p => ({ ...p, [key]: value }))
  }

  const fields: { key: keyof Profile; label: string; placeholder: string }[] = [
    { key: 'vorname', label: 'VORNAME', placeholder: 'Max' },
    { key: 'nachname', label: 'NACHNAME', placeholder: 'Muster' },
    { key: 'schule', label: 'SCHULE', placeholder: 'Oberstufe Zürich' },
    { key: 'jahrgang', label: 'JAHRGANG / KLASSE', placeholder: '3. Sek' },
    { key: 'wunschberuf', label: 'WUNSCHBERUF', placeholder: 'Polymechaniker EFZ' },
    { key: 'wohnort', label: 'WOHNORT', placeholder: 'Zürich' },
    { key: 'telefon', label: 'TELEFON', placeholder: '+41 79 123 45 67' },
    { key: 'email', label: 'EMAIL', placeholder: 'deine@email.ch' },
  ]

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Benutzerprofil</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
        Diese Daten werden automatisch in jede Bewerbung integriert.
      </p>

      <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--border)' }}>
        {fields.map((field, i) => (
          <div key={field.key} className="flex items-center" style={{ borderBottom: i < fields.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div className="w-44 px-5 py-3.5 shrink-0">
              <p className="text-xs font-medium tracking-widest" style={{ color: 'var(--muted)' }}>{field.label}</p>
            </div>
            <input
              value={loading ? '' : profile[field.key]}
              onChange={e => set(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="flex-1 px-5 py-3.5 text-sm outline-none"
              style={{ background: 'transparent', color: 'var(--text)', borderLeft: '1px solid var(--border)' }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
        style={{ background: 'var(--purple)', color: 'white' }}
      >
        {saving ? 'Speichern...' : saved ? '✓ Profil gespeichert' : 'Profil speichern'}
      </button>
    </div>
  )
}