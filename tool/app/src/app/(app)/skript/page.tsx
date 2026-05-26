'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useT, useLang } from '@/lib/lang-context'

const PLACEHOLDER = `Sehr geehrte Damen und Herren,

ich habe euer Geschäft gesehen und finde es sehr interessant. Ich bin ein motivierter Schüler aus [Wohnort] und suche eine Lehrstelle als [Beruf].

Ich bin pünktlich, zuverlässig und lerne schnell. In meiner Freizeit [Hobby/Interessen].

Ich würde mich sehr freuen wenn ich mehr über eure offene Stelle erfahren könnte.

Mit freundlichen Grüssen
[Dein Name]`

export default function SkriptPage() {
  const t = useT()
  const { lang } = useLang()
  const [script, setScript] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const isDemo = typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('abcdefgh'))

  useEffect(() => {
    async function load() {
      if (isDemo) {
        const saved = localStorage.getItem('ls_demo_script')
        if (saved) setScript(saved)
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('demo_script').eq('user_id', user.id).single()
      if (data?.demo_script) setScript(data.demo_script)
      setLoading(false)
    }
    load()
  }, [isDemo])

  async function handleSave() {
    setSaving(true)
    if (isDemo) {
      localStorage.setItem('ls_demo_script', script)
      setSaved(true); setSaving(false); setTimeout(() => setSaved(false), 2000); return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ user_id: user.id, demo_script: script }, { onConflict: 'user_id' })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">{t.script_title}</h1>
      <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>{t.script_subtitle}</p>
      <div className="flex items-center gap-2 text-xs mb-6 px-3 py-2 rounded-lg" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: 'var(--purple-light)' }}>
        <span>✦</span>
        <span>{t.script_hint}</span>
      </div>

      <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <p className="text-xs font-medium tracking-widest" style={{ color: 'var(--muted)' }}>{t.script_label}</p>
          <span className="text-xs" style={{ color: 'var(--muted-2)' }}>{script.length} {lang === 'de' ? 'Zeichen' : 'chars'}</span>
        </div>
        <textarea
          value={loading ? '' : script}
          onChange={e => setScript(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={20}
          className="w-full px-5 py-4 text-sm outline-none resize-none"
          style={{ background: 'var(--surface)', color: 'var(--text)', lineHeight: '1.8', fontFamily: 'var(--font-geist-mono, monospace)' }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !script.trim()}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50"
          style={{ background: 'var(--purple)', color: 'white' }}
        >
          {saving ? t.script_saving : saved ? t.script_saved : t.script_save}
        </button>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>{t.script_auto}</p>
      </div>
    </div>
  )
}