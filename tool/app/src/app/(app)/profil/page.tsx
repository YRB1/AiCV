'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useT } from '@/lib/lang-context'

type Tab = 'info' | 'cv' | 'skills'

interface Profile {
  vorname: string; nachname: string; schule: string; jahrgang: string
  wunschberuf: string; wohnort: string; telefon: string; email: string
  cv_text: string; cv_url: string; about_me: string
  skills: string[]; languages: string[]; hobbies: string
}

const EMPTY: Profile = {
  vorname: '', nachname: '', schule: '', jahrgang: '', wunschberuf: '',
  wohnort: '', telefon: '', email: '', cv_text: '', cv_url: '', about_me: '',
  skills: [], languages: [], hobbies: '',
}

export default function ProfilPage() {
  const [tab, setTab] = useState<Tab>('info')
  const [profile, setProfile] = useState<Profile>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cvAnalysis, setCvAnalysis] = useState<{
    skills?: string[]; improved_summary?: string; strengths?: string[]
    suggestions?: string[]; career_advice?: string
  } | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [langInput, setLangInput] = useState('')
  const [generatedCV, setGeneratedCV] = useState<Record<string, unknown> | null>(null)
  const [generatingCV, setGeneratingCV] = useState(false)
  const [downloadingCV, setDownloadingCV] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const t = useT()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    if (data) setProfile({
      vorname: data.vorname ?? '', nachname: data.nachname ?? '',
      schule: data.schule ?? '', jahrgang: data.jahrgang ?? '',
      wunschberuf: data.wunschberuf ?? '', wohnort: data.wohnort ?? '',
      telefon: data.telefon ?? '', email: data.email ?? user.email ?? '',
      cv_text: data.cv_text ?? '', cv_url: data.cv_url ?? '',
      about_me: data.about_me ?? '', skills: data.skills ?? [],
      languages: data.languages ?? [], hobbies: data.hobbies ?? '',
    })
    else setProfile(p => ({ ...p, email: user.email ?? '' }))
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({
      user_id: user.id, ...profile,
    }, { onConflict: 'user_id' })
    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upload to Supabase Storage
    const path = `${user.id}/${file.name}`
    const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(path)
      setProfile(p => ({ ...p, cv_url: publicUrl }))
    }

    // Extract text from file (txt/plain)
    if (file.type === 'text/plain') {
      const text = await file.text()
      setProfile(p => ({ ...p, cv_text: text }))
    }

    setUploading(false)
  }

  async function handleAnalyzeCV() {
    if (!profile.cv_text.trim()) return
    setAnalyzing(true)
    setCvAnalysis(null)
    try {
      const res = await fetch('/api/cv-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: profile.cv_text }),
      })
      const data = await res.json()
      if (res.ok) {
        setCvAnalysis(data)
        if (data.skills?.length) {
          setProfile(p => ({ ...p, skills: [...new Set([...p.skills, ...data.skills])] }))
        }
      }
    } catch { /* */ }
    setAnalyzing(false)
  }

  function addSkill() {
    const s = skillInput.trim()
    if (!s || profile.skills.includes(s)) return
    setProfile(p => ({ ...p, skills: [...p.skills, s] }))
    setSkillInput('')
  }

  function removeSkill(s: string) {
    setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))
  }

  function addLang() {
    const l = langInput.trim()
    if (!l || profile.languages.includes(l)) return
    setProfile(p => ({ ...p, languages: [...p.languages, l] }))
    setLangInput('')
  }

  function removeLang(l: string) {
    setProfile(p => ({ ...p, languages: p.languages.filter(x => x !== l) }))
  }

  const set = (key: keyof Profile, val: string) => setProfile(p => ({ ...p, [key]: val }))

  const infoFields = [
    { key: 'vorname' as const,     label: t.field_vorname,     placeholder: 'Max' },
    { key: 'nachname' as const,    label: t.field_nachname,    placeholder: 'Muster' },
    { key: 'email' as const,       label: t.field_email,       placeholder: 'your@email.com' },
    { key: 'telefon' as const,     label: t.field_telefon,     placeholder: '+41 79 123 45 67' },
    { key: 'wohnort' as const,     label: t.field_wohnort,     placeholder: 'Zürich' },
    { key: 'schule' as const,      label: t.field_schule,      placeholder: 'Oberstufe Zürich' },
    { key: 'jahrgang' as const,    label: t.field_jahrgang,    placeholder: '3. Sek' },
    { key: 'wunschberuf' as const, label: t.field_wunschberuf, placeholder: 'Informatiker EFZ' },
  ]

  async function handleGenerateCV() {
    setGeneratingCV(true)
    setGeneratedCV(null)
    try {
      const res = await fetch('/api/cv-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      const data = await res.json()
      if (res.ok) setGeneratedCV(data.cv)
    } catch { /* */ }
    setGeneratingCV(false)
  }

  async function handleDownloadCV() {
    setDownloadingCV(true)
    try {
      const res = await fetch('/api/cv-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, format: 'docx' }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `CV_${profile.vorname}_${profile.nachname}.docx`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch { /* */ }
    setDownloadingCV(false)
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'info',   label: 'Personal Info', icon: '👤' },
    { id: 'cv',     label: 'CV',            icon: '📄' },
    { id: 'skills', label: 'Skills',        icon: '⚡' },
  ]

  return (
    <div style={{ padding: '28px 32px', maxWidth: '680px' }} className="fade-in">
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.profile_title}</h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '22px' }}>{t.profile_subtitle}</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '22px', background: 'var(--surface)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)' }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, padding: '8px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
            background: tab === tb.id ? 'var(--accent-glow-2)' : 'transparent',
            color: tab === tb.id ? 'var(--accent-light)' : 'var(--muted)',
            border: tab === tb.id ? '1px solid var(--accent)' : '1px solid transparent',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            <span>{tb.icon}</span> {tb.label}
          </button>
        ))}
      </div>

      {/* ── PERSONAL INFO ──────────────────────────────────────────── */}
      {tab === 'info' && (
        <div className="fade-in">
          <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border)' }}>
            {infoFields.map((field, i) => (
              <div key={field.key} style={{ display: 'flex', alignItems: 'center', borderBottom: i < infoFields.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: '160px', padding: '12px 16px', flexShrink: 0 }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em' }}>{field.label}</p>
                </div>
                <input value={loading ? '' : profile[field.key] as string} onChange={e => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ flex: 1, padding: '12px 16px', fontSize: '13px', outline: 'none', background: 'transparent', color: 'var(--text)', borderLeft: '1px solid var(--border)', fontFamily: 'inherit' }} />
              </div>
            ))}
          </div>
          {/* About me */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: '6px' }}>ABOUT ME</p>
            <textarea value={profile.about_me} onChange={e => set('about_me', e.target.value)} rows={3}
              placeholder="A short intro about yourself, your interests and goals..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', resize: 'vertical', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', lineHeight: 1.6 }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: '6px' }}>HOBBIES & INTERESTS</p>
            <input value={profile.hobbies} onChange={e => set('hobbies', e.target.value)}
              placeholder="Football, Photography, Coding..."
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', outline: 'none', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit' }} />
          </div>
        </div>
      )}

      {/* ── CV ─────────────────────────────────────────────────────── */}
      {tab === 'cv' && (
        <div className="fade-in">
          {/* Upload zone */}
          <div onClick={() => fileRef.current?.click()} style={{
            border: '2px dashed var(--border-2)', borderRadius: '12px', padding: '28px',
            textAlign: 'center', cursor: 'pointer', marginBottom: '16px',
            background: 'var(--surface)', transition: 'border-color 0.15s',
          }}>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
            {uploading ? (
              <p style={{ fontSize: '13px', color: 'var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }}>Uploading…</p>
            ) : profile.cv_url ? (
              <>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green)', marginBottom: '3px' }}>✓ CV uploaded</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Click to replace</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>Upload your CV</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>PDF, DOCX or TXT · max 5MB</p>
              </>
            )}
          </div>

          {/* CV text paste */}
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: '6px' }}>OR PASTE CV TEXT</p>
          <textarea value={profile.cv_text} onChange={e => set('cv_text', e.target.value)} rows={10}
            placeholder="Paste the full text of your CV here..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', outline: 'none', resize: 'vertical', marginBottom: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-geist-mono, monospace)', lineHeight: 1.7 }} />

          {/* AI analyze */}
          {profile.cv_text.trim() && (
            <button onClick={handleAnalyzeCV} disabled={analyzing} style={{
              width: '100%', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: 'var(--accent-glow-2)', color: 'var(--accent-light)',
              border: '1px solid var(--accent)', cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: '16px', opacity: analyzing ? 0.6 : 1, transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {analyzing ? (
                <><span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>✦ Analysing CV…</span></>
              ) : '✦ Analyse with AI'}
            </button>
          )}

          {/* AI Results */}
          {cvAnalysis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="fade-in">
              {cvAnalysis.improved_summary && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--accent-light)', marginBottom: '6px' }}>✦ AI IMPROVED SUMMARY</p>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{cvAnalysis.improved_summary}</p>
                  <button onClick={() => set('about_me', cvAnalysis.improved_summary!)} style={{ marginTop: '8px', fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Use as About Me
                  </button>
                </div>
              )}
              {cvAnalysis.strengths && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--green)', marginBottom: '8px' }}>STRENGTHS</p>
                  {cvAnalysis.strengths.map((s, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '3px' }}>✓ {s}</p>)}
                </div>
              )}
              {cvAnalysis.suggestions && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--yellow)', marginBottom: '8px' }}>SUGGESTIONS TO IMPROVE</p>
                  {cvAnalysis.suggestions.map((s, i) => <p key={i} style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '3px' }}>→ {s}</p>)}
                </div>
              )}
              {cvAnalysis.career_advice && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: '6px' }}>CAREER ADVICE</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.7 }}>{cvAnalysis.career_advice}</p>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          {/* Generate CV section */}
          <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-light)', marginBottom: '4px' }}>✦ AI CV Generator</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>AI creates a complete, professional CV from your profile. Fill in Personal Info and Skills first for best results.</p>
          </div>

          <button onClick={handleGenerateCV} disabled={generatingCV} style={{
            width: '100%', padding: '13px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', marginBottom: '16px', opacity: generatingCV ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            {generatingCV ? <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>✦ Generating your CV…</span> : '✦ Generate CV with AI'}
          </button>

          {generatedCV && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="fade-in">
              <button onClick={handleDownloadCV} disabled={downloadingCV} style={{
                width: '100%', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                background: 'var(--green)', color: 'white', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: downloadingCV ? 0.6 : 1,
              }}>
                ⤓ {downloadingCV ? 'Downloading…' : 'Download CV as DOCX'}
              </button>

              {(generatedCV.summary as string) && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '6px' }}>PROFILE SUMMARY</p>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{generatedCV.summary as string}</p>
                </div>
              )}

              {((generatedCV.education as Array<{school:string;degree:string;year:string}>) ?? []).length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '10px' }}>EDUCATION</p>
                  {(generatedCV.education as Array<{school:string;degree:string;year:string;details?:string}>).map((e, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{e.school} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}>{e.year}</span></p>
                      <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>{e.degree}{e.details ? ` — ${e.details}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}

              {((generatedCV.skills as string[]) ?? []).length > 0 && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '8px' }}>SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(generatedCV.skills as string[]).map(s => (
                      <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: 'var(--accent-glow-2)', color: 'var(--accent-light)', border: '1px solid var(--accent)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {(generatedCV.interests as string) && (
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '6px' }}>INTERESTS</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>{generatedCV.interests as string}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SKILLS ─────────────────────────────────────────────────── */}
      {tab === 'skills' && (
        <div className="fade-in">
          {/* Skills */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: '10px' }}>SKILLS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', minHeight: '36px' }}>
              {profile.skills.map(s => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, background: 'var(--accent-glow-2)', color: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
                  {s}
                  <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '12px', padding: '0', lineHeight: 1 }}>×</button>
                </span>
              ))}
              {profile.skills.length === 0 && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>No skills added yet</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill (e.g. Microsoft Excel)..."
                style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit' }} />
              <button onClick={addSkill} style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
            </div>
          </div>

          {/* Languages */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: '10px' }}>LANGUAGES</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', minHeight: '36px' }}>
              {profile.languages.map(l => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                  {l}
                  <button onClick={() => removeLang(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a5b4fc', fontSize: '12px', padding: '0', lineHeight: 1 }}>×</button>
                </span>
              ))}
              {profile.languages.length === 0 && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>No languages added yet</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={langInput} onChange={e => setLangInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addLang()}
                placeholder="Add a language (e.g. German — C1)..."
                style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', fontSize: '12px', outline: 'none', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit' }} />
              <button onClick={addLang} style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
            </div>
          </div>

          {/* CV completeness */}
          {(() => {
            const filled = [profile.vorname, profile.nachname, profile.email, profile.wunschberuf, profile.cv_text, profile.skills.length > 0 ? 'x' : '', profile.languages.length > 0 ? 'x' : '', profile.about_me].filter(Boolean).length
            const pct = Math.round((filled / 8) * 100)
            return (
              <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Profile completeness</p>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: pct >= 80 ? 'var(--green)' : 'var(--accent)' }}>{pct}%</p>
                </div>
                <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: pct >= 80 ? 'var(--green)' : 'var(--accent)', transition: 'width 0.5s ease' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                  {pct < 100 ? 'Complete your profile to get better AI cover letters' : '✓ Profile complete — AI cover letters will be highly personalised'}
                </p>
              </div>
            )
          })()}
        </div>
      )}

      {/* Save */}
      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: '11px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginTop: '16px',
        background: saved ? 'var(--green)' : 'var(--accent)', color: 'white', border: 'none',
        cursor: 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit', transition: 'background 0.2s',
      }}>
        {saving ? t.profile_saving : saved ? t.profile_saved : t.profile_save}
      </button>
    </div>
  )
}
