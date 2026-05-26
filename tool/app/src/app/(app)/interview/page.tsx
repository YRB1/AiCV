'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'

interface QA { question: string; answer: string; tip?: string }

const CATEGORIES = [
  { id: 'kaufmann',     label: 'Kaufmann / KV',      emoji: '💼', color: '#60a5fa' },
  { id: 'informatik',   label: 'Informatik / IT',     emoji: '💻', color: '#a78bfa' },
  { id: 'handwerk',     label: 'Handwerk / Technik',  emoji: '🔧', color: '#fbbf24' },
  { id: 'gesundheit',   label: 'Gesundheit / FaGe',   emoji: '🩺', color: '#34d399' },
  { id: 'gastronomie',  label: 'Gastronomie / Koch',  emoji: '🍽️', color: '#fb923c' },
  { id: 'detailhandel', label: 'Detailhandel',        emoji: '🛍️', color: '#f472b6' },
  { id: 'automechanic', label: 'Auto / KFZ',          emoji: '🚗', color: '#94a3b8' },
  { id: 'bau',          label: 'Bau / Maurer',        emoji: '🏗️', color: '#a3e635' },
]

const MOCK_QA: Record<string, QA[]> = {
  kaufmann: [
    { question: 'Warum möchten Sie eine kaufmännische Lehre absolvieren?', answer: 'Ich interessiere mich für wirtschaftliche Zusammenhänge und möchte lernen, wie Unternehmen funktionieren. Die Vielfalt der Aufgaben — von Buchhaltung bis Kundenkontakt — reizt mich besonders.', tip: 'Nenne konkrete Tätigkeiten, die dich ansprechen.' },
    { question: 'Wie würden Sie mit einem unzufriedenen Kunden umgehen?', answer: 'Ich würde dem Kunden aktiv zuhören, sein Problem verstehen und eine schnelle Lösung suchen. Falls nötig, würde ich einen Vorgesetzten hinzuziehen.', tip: 'Zeige Empathie und Lösungsorientierung.' },
    { question: 'Welche PC-Kenntnisse bringen Sie mit?', answer: 'Ich beherrsche Microsoft Office (Word, Excel, PowerPoint) und lerne schnell neue Software. In der Schule haben wir auch mit Google Workspace gearbeitet.', tip: 'Erwähne spezifische Programme, die du kennst.' },
    { question: 'Wo sehen Sie sich in 5 Jahren?', answer: 'Ich möchte die Lehre erfolgreich abschliessen und danach vielleicht die Berufsmaturität machen. Langfristig könnte ich mir eine Weiterbildung im Bereich Marketing oder Controlling vorstellen.', tip: 'Zeige Ambitionen, aber bleib realistisch.' },
    { question: 'Warum haben Sie sich für unser Unternehmen beworben?', answer: 'Ich habe Ihre Website besucht und war beeindruckt von den Ausbildungsmöglichkeiten. Besonders interessiert mich [spezifischer Bereich], weil...', tip: 'Bereite dich vor — recherchiere die Firma!' },
  ],
  informatik: [
    { question: 'Was motiviert Sie für eine IT-Lehre?', answer: 'Ich tüftle gerne an Computern und habe zuhause bereits erste Programmierprojekte gemacht. Technik ist meine Leidenschaft und ich möchte das zur Karriere machen.', tip: 'Zeige echtes Interesse — nenne eigene Projekte.' },
    { question: 'Welche Programmiersprachen kennen Sie?', answer: 'Ich habe erste Erfahrungen mit Python und HTML/CSS gemacht. Ich bin ein schneller Lerner und freue mich, in der Lehre strukturiert zu programmieren.', tip: 'Ehrlichkeit ist besser als Übertreiben.' },
    { question: 'Wie lösen Sie ein Problem, das Sie nicht sofort lösen können?', answer: 'Ich analysiere das Problem systematisch, recherchiere online, frage Kollegen um Rat und dokumentiere die Lösung für ähnliche Fälle.', tip: 'Betone Selbständigkeit und Dokumentation.' },
    { question: 'Was ist der Unterschied zwischen Hardware und Software?', answer: 'Hardware sind die physischen Komponenten eines Computers (CPU, RAM, Festplatte), Software sind die Programme und Betriebssysteme, die darauf laufen.', tip: 'Grundwissen zeigen — nicht overcomplizieren.' },
    { question: 'Wie halten Sie sich über neue Technologien auf dem Laufenden?', answer: 'Ich lese Tech-Blogs, schaue Tutorials und bin Mitglied in Online-Communities. Neulich habe ich mich mit KI-Tools beschäftigt.', tip: 'Zeige aktives Interesse an der Branche.' },
  ],
  handwerk: [
    { question: 'Warum interessiert Sie dieser Handwerksberuf?', answer: 'Ich arbeite gerne mit meinen Händen und bin stolz darauf, wenn ich am Ende des Tages etwas Greifbares geschaffen habe.', tip: 'Authentizität zählt hier besonders.' },
    { question: 'Können Sie körperlich anstrengende Arbeit leisten?', answer: 'Ja, ich bin sportlich aktiv und körperlich fit. Ich weiss, dass der Beruf fordernd ist und sehe das nicht als Problem.', tip: 'Zeige Bereitschaft, nenne Beispiele aus Sport.' },
    { question: 'Wie wichtig ist Sicherheit am Arbeitsplatz?', answer: 'Sehr wichtig! Ich respektiere alle Sicherheitsvorschriften und frage immer nach, wenn ich unsicher bin.', tip: 'Sicherheit ist im Handwerk nicht verhandelbar.' },
    { question: 'Haben Sie Erfahrung mit Werkzeugen?', answer: 'Ich helfe zuhause bei Reparaturen und bin mit Grundwerkzeug vertraut. Ich freue mich darauf, in der Lehre professionelle Werkzeuge kennenzulernen.', tip: 'Praktische Erfahrung, auch zuhause, ist wertvoll.' },
  ],
  gesundheit: [
    { question: 'Was hat Sie in den Pflegeberuf geführt?', answer: 'Ich helfe gerne anderen Menschen und finde es erfüllend, für jemanden da zu sein. Ein Praktikum hat meine Begeisterung bestätigt.', tip: 'Erzähle von echten Erfahrungen mit Menschen.' },
    { question: 'Wie gehen Sie mit schwierigen Situationen um?', answer: 'Ich versuche ruhig zu bleiben, das Problem zu analysieren und schnell zu handeln. Danach reflektiere ich, was ich besser machen kann.', tip: 'Resilienz und Reflexionsfähigkeit betonen.' },
    { question: 'Können Sie gut im Team arbeiten?', answer: 'Ja, Teamarbeit ist mir sehr wichtig. In der Schule leite ich oft Gruppenarbeiten und achte darauf, dass alle einbezogen werden.', tip: 'Nenne konkrete Beispiele aus Schule oder Alltag.' },
    { question: 'Wie reagieren Sie auf emotionale Belastung?', answer: 'Ich pflege einen gesunden Ausgleich durch Sport und Gespräche mit Freunden. Ich weiss, wie wichtig es ist, auf sich selbst zu achten.', tip: 'Zeige Selbstreflexion und gesunde Grenzen.' },
  ],
  gastronomie: [
    { question: 'Warum möchten Sie Koch/Köchin werden?', answer: 'Ich koche leidenschaftlich gerne und experimentiere oft mit neuen Rezepten. Die Kreativität in der Küche fasziniert mich.', tip: 'Begeisterung fürs Kochen zeigen!' },
    { question: 'Wie reagieren Sie unter Druck, z.B. bei Rush Hour?', answer: 'Ich priorisiere Aufgaben, arbeite fokussiert und kommuniziere klar mit dem Team. Stress spornt mich eher an.', tip: 'Stressresistenz ist in der Gastronomie essenziell.' },
    { question: 'Wie wichtig ist Hygiene für Sie?', answer: 'Extrem wichtig! Ich weiss, dass Lebensmittelhygiene oberste Priorität hat und nehme diese Vorschriften sehr ernst.', tip: 'HACCP-Grundlagen erwähnen, wenn bekannt.' },
  ],
  detailhandel: [
    { question: 'Wie gehen Sie auf Kunden zu?', answer: 'Ich lächle, grüsse freundlich und frage aktiv, ob ich helfen kann — ohne aufdringlich zu sein.', tip: 'Freundlichkeit und Eigeninitiative betonen.' },
    { question: 'Was würden Sie tun, wenn ein Artikel vergriffen ist?', answer: 'Ich entschuldige mich, prüfe Alternativen oder andere Filialen und biete an, den Artikel zu reservieren, sobald er verfügbar ist.', tip: 'Kundenzufriedenheit immer priorisieren.' },
    { question: 'Wie gehen Sie mit Kassenfehler um?', answer: 'Ich zähle Rückgeld sorgfältig und informiere sofort meine Vorgesetzte, wenn ich einen Fehler bemerke. Transparenz ist wichtig.', tip: 'Ehrlichkeit und Sorgfalt betonen.' },
  ],
  automechanic: [
    { question: 'Was fasziniert Sie an Autos?', answer: 'Ich bin fasziniert von der Technik — wie Motoren, Getriebe und Elektronik zusammenspielen. Ich habe schon bei einfachen Reparaturen mitgeholfen.', tip: 'Spezifisches Interesse zeigen.' },
    { question: 'Wie wichtig ist Präzision in Ihrem Arbeitsalltag?', answer: 'Sehr wichtig! Ein falscher Eingriff kann die Sicherheit gefährden. Ich arbeite immer sorgfältig und überprüfe meine Arbeit.', tip: 'Sicherheitsdenken ist entscheidend.' },
  ],
  bau: [
    { question: 'Warum interessiert Sie eine Lehre im Bau?', answer: 'Es gefällt mir, etwas zu erschaffen, das lange Bestand hat. Ich bin stolz, wenn ich an einem Gebäude vorbeigehe, das ich mitgebaut habe.', tip: 'Stolz auf greifbare Ergebnisse ausdrücken.' },
    { question: 'Wie gehen Sie mit Witterungsbedingungen um?', answer: 'Ich weiss, dass auf der Baustelle bei jedem Wetter gearbeitet wird. Ich bin robust und bereite mich durch Sport vor.', tip: 'Robustheit und Flexibilität betonen.' },
  ],
}

export default function InterviewPage() {
  const { lang } = useLang()
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QA[]>([])
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [customBeruf, setCustomBeruf] = useState('')
  const [generating, setGenerating] = useState(false)

  function loadQuestions(catId: string) {
    setSelectedCat(catId)
    setRevealed(new Set())
    setQuestions(MOCK_QA[catId] ?? MOCK_QA.kaufmann)
  }

  async function generateCustom() {
    if (!customBeruf.trim()) return
    setGenerating(true)
    setSelectedCat('custom')
    setRevealed(new Set())
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beruf: customBeruf, userId: user?.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions ?? MOCK_QA.kaufmann)
      } else {
        setQuestions(MOCK_QA.kaufmann)
      }
    } catch {
      setQuestions(MOCK_QA.kaufmann)
    }
    setGenerating(false)
  }

  function toggleReveal(i: number) {
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  const cat = CATEGORIES.find(c => c.id === selectedCat)

  return (
    <div className="ls-page fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '3px' }}>
          {lang === 'de' ? 'Interview Vorbereitung' : 'Interview Preparation'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          {lang === 'de' ? 'Übe typische Vorstellungsgespräch-Fragen mit Musterantworten' : 'Practice typical interview questions with model answers'}
        </p>
      </div>

      {/* AI custom input */}
      <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-light)', letterSpacing: '0.07em', marginBottom: '8px', textTransform: 'uppercase' }}>
          ✦ {lang === 'de' ? 'KI-Fragen für deinen Beruf generieren' : 'Generate AI questions for your profession'}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={customBeruf}
            onChange={e => setCustomBeruf(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateCustom()}
            placeholder={lang === 'de' ? 'z.B. Mediamatiker EFZ, Logistiker EFZ...' : 'e.g. Mediamatiker EFZ, Logistiker EFZ...'}
            style={{ flex: 1, padding: '9px 12px', borderRadius: '9px', fontSize: '13px', outline: 'none', background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit' }}
          />
          <button
            onClick={generateCustom}
            disabled={!customBeruf.trim() || generating}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', opacity: !customBeruf.trim() || generating ? 0.5 : 1, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {generating
              ? <><span className="spinner" style={{ width: '13px', height: '13px', borderTopColor: '#000', borderColor: 'rgba(0,0,0,0.2)' }} />{lang === 'de' ? 'Generiert…' : 'Generating…'}</>
              : `✦ ${lang === 'de' ? 'Generieren' : 'Generate'}`}
          </button>
        </div>
      </div>

      {/* Category grid (shown when no category selected) */}
      {!selectedCat && !generating && (
        <>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
            {lang === 'de' ? 'Kategorie wählen' : 'Choose a category'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => loadQuestions(c.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 12px', borderRadius: '14px', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'center' }}>
                <span style={{ fontSize: '28px' }}>{c.emoji}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{c.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Generating spinner */}
      {generating && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '48px 0' }}>
          <span className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
          <p style={{ fontSize: '14px', color: 'var(--accent-light)', fontWeight: 600 }}>
            ✦ {lang === 'de' ? `KI generiert Fragen für "${customBeruf}"…` : `AI generating questions for "${customBeruf}"…`}
          </p>
        </div>
      )}

      {/* Questions view */}
      {selectedCat && questions.length > 0 && !generating && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <button onClick={() => { setSelectedCat(null); setQuestions([]) }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← {lang === 'de' ? 'Zurück' : 'Back'}
            </button>
            {cat && <span style={{ fontSize: '16px' }}>{cat.emoji}</span>}
            <h2 style={{ fontSize: '14px', fontWeight: 700 }}>
              {cat?.label ?? customBeruf} · {questions.length} {lang === 'de' ? 'Fragen' : 'questions'}
            </h2>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'var(--border-2)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: 'var(--accent)', width: `${questions.length > 0 ? (revealed.size / questions.length) * 100 : 0}%`, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {revealed.size}/{questions.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions.map((qa, i) => (
              <div key={i} style={{ borderRadius: '14px', background: 'var(--surface)', border: `1px solid ${revealed.has(i) ? 'var(--accent)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button onClick={() => toggleReveal(i)} style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: revealed.has(i) ? 'var(--accent)' : 'var(--surface-2)', border: `1px solid ${revealed.has(i) ? 'var(--accent)' : 'var(--border-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: revealed.has(i) ? '#000' : 'var(--muted)', flexShrink: 0, marginTop: '1px', transition: 'all 0.2s' }}>
                    {revealed.has(i) ? '✓' : i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{qa.question}</p>
                    {!revealed.has(i) && (
                      <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '5px', fontWeight: 500 }}>
                        {lang === 'de' ? '→ Antwort anzeigen' : '→ Tap to reveal answer'}
                      </p>
                    )}
                  </div>
                  <span style={{ color: 'var(--muted)', flexShrink: 0, fontSize: '12px', transition: 'transform 0.2s', transform: revealed.has(i) ? 'rotate(180deg)' : 'rotate(0)', marginTop: '2px' }}>▾</span>
                </button>
                {revealed.has(i) && (
                  <div style={{ padding: '0 16px 16px 50px' }} className="fade-in">
                    <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: qa.tip ? '8px' : '0' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.75 }}>{qa.answer}</p>
                    </div>
                    {qa.tip && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: 'var(--accent-glow)', border: '1px solid var(--accent)' }}>
                        <span style={{ fontSize: '12px' }}>💡</span>
                        <p style={{ fontSize: '11px', color: 'var(--accent-light)', lineHeight: 1.5 }}>{qa.tip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {revealed.size === questions.length && questions.length > 0 && (
            <div className="fade-in" style={{ marginTop: '16px', padding: '20px', borderRadius: '14px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', marginBottom: '8px' }}>🎉</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-light)', marginBottom: '4px' }}>
                {lang === 'de' ? 'Alle Fragen geübt!' : 'All questions practiced!'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
                {lang === 'de' ? 'Du bist bereit für dein Interview.' : 'You are ready for your interview.'}
              </p>
              <button onClick={() => setRevealed(new Set())} style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                {lang === 'de' ? 'Nochmal üben' : 'Practice again'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
