// Blitzbewerbung — DE/EN translation system
// Usage: add data-i18n="key" to any element; text will be swapped on lang change

const TRANSLATIONS = {
  // NAV
  'nav.features':   { en: 'Features',           de: 'Funktionen' },
  'nav.why':        { en: 'Why Blitzbewerbung',  de: 'Warum Blitzbewerbung' },
  'nav.how':        { en: 'How it works',        de: 'So funktioniert\'s' },
  'nav.demo':       { en: 'Demo',                de: 'Demo' },
  'nav.pricing':    { en: 'Pricing',             de: 'Preise' },
  'nav.faq':        { en: 'FAQ',                 de: 'FAQ' },
  'nav.blog':       { en: 'Blog',                de: 'Blog' },
  'nav.community':  { en: 'Community',           de: 'Community' },
  'nav.help':       { en: 'Help',                de: 'Hilfe' },
  'nav.signin':     { en: 'Sign in',             de: 'Anmelden' },
  'nav.signup':     { en: 'Sign up',             de: 'Registrieren' },

  // HERO
  'hero.badge':  { en: '50,000+ students · 40+ job boards · 24/7 AI', de: '50.000+ Lernende · 40+ Jobbörsen · 24/7 KI' },
  'hero.title1': { en: 'Get 10× More',                de: '10× mehr' },
  'hero.title2': { en: 'Apprenticeship Interviews',   de: 'Vorstellungsgespräche' },
  'hero.sub':    { en: 'Upload your CV once. AI scans 40+ job boards, tailors every application, and applies on your behalf — automatically, every day.', de: 'Lade deinen Lebenslauf einmal hoch. Die KI durchsucht 40+ Jobbörsen, passt jede Bewerbung an und sendet sie automatisch täglich in deinem Namen ab.' },
  'hero.cta1':   { en: 'Start Free — No Card Needed', de: 'Kostenlos starten — keine Karte nötig' },
  'hero.cta2':   { en: 'Watch Demo',                  de: 'Demo ansehen' },
  'hero.note':   { en: 'Free plan · No credit card · Cancel anytime', de: 'Kostenloser Plan · Keine Kreditkarte · Jederzeit kündbar' },

  // HERO STATS
  'stat.sent':   { en: 'Applications Sent',  de: 'Bewerbungen gesendet' },
  'stat.max':    { en: 'Max Applications',   de: 'Max. Bewerbungen' },
  'stat.boards': { en: 'Job Boards Scanned', de: 'Jobbörsen durchsucht' },
  'stat.ats':    { en: 'ATS Pass Rate',      de: 'ATS-Erfolgsrate' },

  // TRUSTED / PRESS BARS
  'trusted.label': { en: 'Students placed at', de: 'Lernende bei' },
  'press.label':   { en: 'As featured in',     de: 'In den Medien' },

  // FEATURES SECTION
  'feat.tag':   { en: 'Features',   de: 'Funktionen' },
  'feat.title': { en: 'Everything you need to apply smarter', de: 'Alles für eine klügere Bewerbung' },
  'feat.sub':   { en: 'Stop copy-pasting. Stop wasting evenings on applications. Let AI do the heavy lifting.', de: 'Schluss mit Copy-Paste. Schluss mit verschwendeten Abenden. Lass die KI die schwere Arbeit übernehmen.' },

  'feat1.title': { en: 'AI CV Matching',          de: 'KI-Lebenslauf-Matching' },
  'feat1.desc':  { en: 'Upload your CV once. Our AI reads every job description and rewrites your CV to highlight the most relevant skills — scored above ATS filters every time.', de: 'Lade deinen Lebenslauf einmal hoch. Unsere KI liest jede Stellenausschreibung und schreibt ihn so um, dass die relevantesten Fähigkeiten hervorgehoben werden — immer über den ATS-Filtern.' },
  'feat2.title': { en: 'Automated Applications',  de: 'Automatische Bewerbungen' },
  'feat2.desc':  { en: 'Set your preferences once and wake up to applications already submitted. AI monitors new listings 24/7 and applies on your behalf in under 60 seconds.', de: 'Leg deine Präferenzen einmal fest und wache auf mit bereits gesendeten Bewerbungen. Die KI überwacht neue Stellen rund um die Uhr und bewirbt sich in unter 60 Sekunden in deinem Namen.' },
  'feat3.title': { en: 'AI Cover Letters',         de: 'KI-Anschreiben' },
  'feat3.desc':  { en: 'Generate a unique, personalised cover letter for every role in seconds. No templates. No fluff. Just compelling letters that actually get read.', de: 'Erstelle in Sekunden ein einzigartiges, personalisiertes Anschreiben für jede Stelle. Keine Vorlagen. Kein Füllwerk. Nur überzeugende Briefe, die wirklich gelesen werden.' },
  'feat4.title': { en: 'Application Tracking',    de: 'Bewerbungs-Tracking' },
  'feat4.desc':  { en: 'Every application in one timeline — status updates, follow-up reminders, interview prep notes, and employer responses, all in one clean dashboard.', de: 'Alle Bewerbungen in einer Timeline — Statusupdates, Erinnerungen, Interview-Notizen und Arbeitgeberantworten, alles in einem übersichtlichen Dashboard.' },
  'feat5.title': { en: 'Smart Job Search',         de: 'Intelligente Jobsuche' },
  'feat5.desc':  { en: 'AI scans Indeed, LinkedIn, RateMyApprenticeship, and 40+ more sites simultaneously — filtering by your skills, location, and preferences in real time.', de: 'KI durchsucht Indeed, LinkedIn, RateMyApprenticeship und 40+ weitere Seiten gleichzeitig — gefiltert nach deinen Fähigkeiten, Standort und Präferenzen in Echtzeit.' },
  'feat6.title': { en: 'Interview Boosting',       de: 'Interview-Vorbereitung' },
  'feat6.desc':  { en: 'Practice with AI-generated interview questions tailored to each role. Get scored feedback, suggested answers, and tips to nail your next call.', de: 'Übe mit KI-generierten Interviewfragen, die auf jede Stelle zugeschnitten sind. Erhalte bewertetes Feedback, Antwortvorschläge und Tipps für dein nächstes Gespräch.' },
  'feat7.title': { en: 'AI Mock Interviews',       de: 'KI-Probeinterviews' },
  'feat7.desc':  { en: 'Simulate a full interview with our conversational AI before the real thing. It adapts questions based on your role, CV, and performance to sharpen your answers.', de: 'Simuliere ein vollständiges Interview mit unserer KI vor dem echten Gespräch. Sie passt Fragen basierend auf deiner Stelle, deinem Lebenslauf und deiner Leistung an.' },
  'feat8.title': { en: 'AI Career Advisor',        de: 'KI-Karriereberater' },
  'feat8.desc':  { en: 'Get personalised advice on which apprenticeships to target, which skills to build next, and how to position yourself for the roles you actually want.', de: 'Erhalte personalisierte Beratung darüber, welche Lehrstellen du anvisieren, welche Fähigkeiten du aufbauen und wie du dich für die gewünschten Stellen positionieren solltest.' },
  'feat9.title': { en: 'Contact Recruiters',       de: 'Recruiter kontaktieren' },
  'feat9.desc':  { en: 'AI identifies the right hiring manager at each company and drafts a personalised outreach message — so you get noticed before applications even close.', de: 'KI identifiziert den richtigen Hiring Manager bei jedem Unternehmen und verfasst eine personalisierte Kontaktaufnahme — damit du auffällst, bevor Bewerbungen schliessen.' },

  // WHY SECTION
  'why.title1': { en: 'More interviews.',  de: 'Mehr Interviews.' },
  'why.title2': { en: 'Less effort.',      de: 'Weniger Aufwand.' },
  'why.sub':    { en: 'Everything manual job searching gets wrong — we fix it with AI.', de: 'Alles, was bei der manuellen Jobsuche schiefläuft — wir lösen es mit KI.' },
  'why1.title': { en: 'More applications per day',  de: 'Mehr Bewerbungen pro Tag' },
  'why1.desc':  { en: 'The average applicant sends 2–3 applications a day. Blitzbewerbung sends up to 50 personalised applications daily — all tailored to the specific role, not a copy-paste blast.', de: 'Der durchschnittliche Bewerber sendet 2–3 Bewerbungen pro Tag. Blitzbewerbung sendet bis zu 50 personalisierte Bewerbungen täglich — alle auf die spezifische Stelle zugeschnitten, kein Copy-Paste.' },
  'why2.title': { en: 'Job boards scanned 24/7',    de: 'Jobbörsen rund um die Uhr' },
  'why2.desc':  { en: 'Most people only check one or two boards. Our AI monitors Indeed, LinkedIn, RateMyApprenticeship, Glassdoor, Reed, Totaljobs, and 35+ more — around the clock, every day.', de: 'Die meisten schauen nur auf ein oder zwei Jobbörsen. Unsere KI überwacht Indeed, LinkedIn, RateMyApprenticeship, Glassdoor, Reed, Totaljobs und 35+ weitere — rund um die Uhr, jeden Tag.' },
  'why3.title': { en: 'Saved every single week',    de: 'Jede Woche gespart' },
  'why3.desc':  { en: 'Researching roles, tailoring CVs, writing cover letters — all of that disappears. Students report saving 8 or more hours per week they\'d otherwise spend on manual applications.', de: 'Stellen recherchieren, Lebensläufe anpassen, Anschreiben verfassen — all das entfällt. Lernende berichten, dass sie 8+ Stunden pro Woche sparen, die sie sonst für manuelle Bewerbungen aufwenden würden.' },
  'why4.title': { en: 'ATS pass rate',               de: 'ATS-Erfolgsrate' },
  'why4.desc':  { en: 'Most CVs are filtered out before a human sees them. Blitzbewerbung rewrites your CV using the exact keywords from each job description, so you clear Applicant Tracking Systems every time.', de: 'Die meisten Lebensläufe werden herausgefiltert, bevor ein Mensch sie sieht. Blitzbewerbung schreibt deinen Lebenslauf mit den exakten Schlüsselwörtern jeder Stellenbeschreibung um, damit du ATS immer passierst.' },

  // HOW IT WORKS
  'how.tag':    { en: 'How it works', de: 'So funktioniert\'s' },
  'how.title1': { en: 'From CV to interview', de: 'Vom Lebenslauf zum Interview' },
  'how.title2': { en: 'in 4 steps',           de: 'in 4 Schritten' },
  'how.sub':    { en: 'No technical knowledge needed. If you can upload a file, you can land an apprenticeship with Blitzbewerbung.', de: 'Keine technischen Kenntnisse erforderlich. Wenn du eine Datei hochladen kannst, kannst du mit Blitzbewerbung eine Lehrstelle finden.' },
  'step1.title': { en: 'Upload Your CV',                  de: 'Lebenslauf hochladen' },
  'step1.desc':  { en: 'Drop in your existing CV — PDF, Word, or plain text. Our AI reads it, understands your skills, and builds your profile in seconds.', de: 'Lade deinen bestehenden Lebenslauf hoch — PDF, Word oder Nur-Text. Unsere KI liest ihn, versteht deine Fähigkeiten und erstellt dein Profil in Sekunden.' },
  'step2.title': { en: 'AI Finds Apprenticeships',        de: 'KI findet Lehrstellen' },
  'step2.desc':  { en: 'We scan 40+ job boards in real time, match listings to your profile, and show you a ranked shortlist every morning.', de: 'Wir durchsuchen 40+ Jobbörsen in Echtzeit, gleichen Stellen mit deinem Profil ab und zeigen dir jeden Morgen eine bewertete Auswahlliste.' },
  'step3.title': { en: 'Personalised Applications Sent',  de: 'Personalisierte Bewerbungen gesendet' },
  'step3.desc':  { en: 'For each role you approve, AI tailors your CV and writes a custom cover letter — then submits automatically on your behalf.', de: 'Für jede Stelle, die du genehmigst, passt die KI deinen Lebenslauf an und schreibt ein individuelles Anschreiben — dann sendet sie automatisch in deinem Namen.' },
  'step4.title': { en: 'Get Interview Responses',         de: 'Intervieweinladungen erhalten' },
  'step4.desc':  { en: 'Track responses in real time. When an interview comes in, Blitzbewerbung preps you with company research and predicted questions.', de: 'Verfolge Antworten in Echtzeit. Wenn ein Interview eintrifft, bereitet dich Blitzbewerbung mit Unternehmensrecherche und vorhergesagten Fragen vor.' },

  // DEMO
  'demo.tag':      { en: 'Product Demo',   de: 'Produkt-Demo' },
  'demo.title':    { en: 'See it in action', de: 'Sieh es in Aktion' },
  'demo.sub':      { en: 'Watch how students go from CV upload to interview invite in under 10 minutes.', de: 'Sieh wie Lernende in unter 10 Minuten vom Lebenslauf-Upload zur Intervieweinladung kommen.' },
  'demo.watchbtn': { en: 'Watch 2-min demo', de: '2-Minuten-Demo ansehen' },

  // TESTIMONIALS
  'testi.tag':   { en: 'Testimonials',                 de: 'Erfahrungsberichte' },
  'testi.title': { en: 'Students love Blitzbewerbung', de: 'Lernende lieben Blitzbewerbung' },
  'testi.sub':   { en: 'Real results from real people who were tired of applying manually.', de: 'Echte Ergebnisse von echten Menschen, die manuelle Bewerbungen satt hatten.' },

  // PRICING
  'pricing.tag':   { en: 'Pricing',  de: 'Preise' },
  'pricing.title': { en: 'Start free. Scale when ready.', de: 'Kostenlos starten. Upgraden wenn du bereit bist.' },
  'pricing.sub':   { en: 'No hidden fees. Cancel anytime.', de: 'Keine versteckten Kosten. Jederzeit kündbar.' },
  'billing.monthly': { en: 'Monthly', de: 'Monatlich' },
  'billing.annual':  { en: 'Annual',  de: 'Jährlich' },
  'billing.save':    { en: 'Save 20%', de: '20% sparen' },
  'popular.badge':   { en: 'POPULAR', de: 'BELIEBT' },
  'plan.free':          { en: 'Free',    de: 'Kostenlos' },
  'plan.free.desc':     { en: 'Perfect for getting started and landing your first few interviews.', de: 'Perfekt für den Einstieg und deine ersten Vorstellungsgespräche.' },
  'plan.pro':           { en: 'Pro',     de: 'Pro' },
  'plan.pro.desc':      { en: 'For serious applicants who want to maximise their chances fast.', de: 'Für ernsthafte Bewerber, die ihre Chancen schnell maximieren wollen.' },
  'plan.student':       { en: 'Student', de: 'Studierende' },
  'plan.student.desc':  { en: 'Everything in Pro at a discounted rate — verified students only.', de: 'Alles in Pro zu einem reduzierten Preis — nur für verifizierte Studierende.' },
  'price.free.cta':     { en: 'Get started free',      de: 'Kostenlos starten' },
  'price.pro.cta':      { en: 'Start Pro — £20/mo',    de: 'Pro starten — £20/Mt.' },
  'price.student.cta':  { en: 'Student Plan — £15/mo', de: 'Student-Plan — £15/Mt.' },
  'pfeat.free1': { en: '5 AI applications/month',  de: '5 KI-Bewerbungen/Monat' },
  'pfeat.free2': { en: 'Basic CV optimisation',     de: 'Basis-Lebenslauf-Optimierung' },
  'pfeat.free3': { en: 'Job board search',          de: 'Jobbörsen-Suche' },
  'pfeat.free4': { en: 'Application tracker',       de: 'Bewerbungs-Tracker' },
  'pfeat.free5': { en: 'AI cover letters',          de: 'KI-Anschreiben' },
  'pfeat.free6': { en: 'Auto-apply',                de: 'Auto-Bewerben' },
  'pfeat.pro1':  { en: 'Unlimited applications',   de: 'Unbegrenzte Bewerbungen' },
  'pfeat.pro2':  { en: 'Full AI CV tailoring',      de: 'Vollständige KI-Lebenslauf-Anpassung' },
  'pfeat.pro3':  { en: 'Unlimited cover letters',   de: 'Unbegrenzte Anschreiben' },
  'pfeat.pro4':  { en: 'Auto-apply to matches',     de: 'Auto-Bewerbung auf Matches' },
  'pfeat.pro5':  { en: 'Interview prep AI',         de: 'KI-Interviewvorbereitung' },
  'pfeat.pro6':  { en: 'Priority support',          de: 'Prioritätssupport' },
  'pfeat.s1':    { en: 'Everything in Pro',              de: 'Alles in Pro' },
  'pfeat.s2':    { en: 'Student verification',           de: 'Studierenden-Verifizierung' },
  'pfeat.s3':    { en: 'University job board access',    de: 'Zugang zu Uni-Jobbörsen' },
  'pfeat.s4':    { en: 'Graduate scheme matching',       de: 'Graduate-Scheme-Matching' },
  'pfeat.s5':    { en: 'Campus career fair alerts',      de: 'Campus-Karrieremesse-Alerts' },
  'pfeat.s6':    { en: 'Priority support',               de: 'Prioritätssupport' },

  // FAQ
  'faq.tag':   { en: 'FAQ',                  de: 'FAQ' },
  'faq.title': { en: 'Questions? Answered.', de: 'Fragen? Beantwortet.' },
  'faq1.q': { en: 'Is Blitzbewerbung free to start?', de: 'Ist Blitzbewerbung kostenlos?' },
  'faq1.a': { en: 'Yes — the Free plan lets you send up to 5 AI-assisted applications per month with no credit card required. Upgrade to Pro at any time to unlock unlimited applications, auto-apply, and cover letter generation.', de: 'Ja — der kostenlose Plan ermöglicht dir bis zu 5 KI-unterstützte Bewerbungen pro Monat ohne Kreditkarte. Upgrade jederzeit auf Pro für unbegrenzte Bewerbungen, Auto-Bewerben und Anschreiben-Generierung.' },
  'faq2.q': { en: 'How does the AI personalise my CV for each role?', de: 'Wie personalisiert die KI meinen Lebenslauf für jede Stelle?' },
  'faq2.a': { en: 'Our AI reads the job description and identifies the key skills, keywords, and requirements the employer is looking for. It then rewrites relevant sections of your CV to match — keeping your real experience intact. Nothing is invented.', de: 'Unsere KI liest die Stellenbeschreibung und identifiziert die wichtigsten Fähigkeiten, Schlüsselwörter und Anforderungen. Dann schreibt sie relevante Abschnitte deines Lebenslaufs entsprechend um — deine echte Erfahrung bleibt erhalten. Nichts wird erfunden.' },
  'faq3.q': { en: 'Will employers know I used AI?', de: 'Werden Arbeitgeber wissen, dass ich KI benutzt habe?' },
  'faq3.a': { en: 'No. Blitzbewerbung outputs clean, natural writing based entirely on your real experience. It sounds like you because it\'s built from your words and history — think of it as a personal career coach helping you communicate more clearly.', de: 'Nein. Blitzbewerbung erzeugt sauberes, natürliches Schreiben basierend auf deiner echten Erfahrung. Es klingt wie du, weil es aus deinen Worten und deiner Geschichte aufgebaut ist — denk daran wie an einen persönlichen Karrierecoach.' },
  'faq4.q': { en: 'Which job boards does Blitzbewerbung search?', de: 'Welche Jobbörsen durchsucht Blitzbewerbung?' },
  'faq4.a': { en: 'We pull listings from over 40 sources including Indeed, LinkedIn, RateMyApprenticeship, Glassdoor, Totaljobs, Reed, and direct employer portals. New sources are added monthly.', de: 'Wir holen Stellenangebote von über 40 Quellen, darunter Indeed, LinkedIn, RateMyApprenticeship, Glassdoor, Totaljobs, Reed und direkte Arbeitgeberportale. Monatlich werden neue Quellen hinzugefügt.' },
  'faq5.q': { en: 'Is my CV data kept private?', de: 'Sind meine Lebenslaufdaten privat?' },
  'faq5.a': { en: 'Absolutely. Your CV and personal data are encrypted at rest and in transit. We never sell your data, never share it without your explicit approval, and never use it to train our AI models.', de: 'Absolut. Dein Lebenslauf und persönliche Daten sind verschlüsselt. Wir verkaufen deine Daten nie, teilen sie nie ohne deine ausdrückliche Zustimmung und nutzen sie nie zum Training unserer KI-Modelle.' },
  'faq6.q': { en: 'Can I cancel my subscription at any time?', de: 'Kann ich mein Abo jederzeit kündigen?' },
  'faq6.a': { en: 'Yes — cancel from your account settings with one click, no questions asked. If you cancel mid-month you keep access until your billing period ends.', de: 'Ja — kündige in deinen Kontoeinstellungen mit einem Klick, keine Fragen gestellt. Wenn du mitten im Monat kündigst, behältst du den Zugang bis zum Ende deines Abrechnungszeitraums.' },

  // FINAL CTA
  'cta.final.title1': { en: 'Ready to Automate',           de: 'Bereit, deine' },
  'cta.final.title2': { en: 'Your Apprenticeship Search?', de: 'Lehrstellen-Suche zu automatisieren?' },
  'cta.final.sub':    { en: 'Join 50,000+ students already using Blitzbewerbung. Upload your CV today and start getting 10× more interviews — on autopilot.', de: 'Schliess dich 50.000+ Lernenden an, die Blitzbewerbung bereits nutzen. Lade deinen Lebenslauf heute hoch und erhalte 10× mehr Interviews — auf Autopilot.' },
  'cta.final.btn1':   { en: 'Get Started Free',            de: 'Kostenlos loslegen' },
  'cta.final.btn2':   { en: 'Already have an account?',    de: 'Bereits ein Konto?' },
  'cta.final.note':   { en: 'Free plan · No credit card · Takes 2 minutes to set up', de: 'Kostenloser Plan · Keine Kreditkarte · 2 Minuten zur Einrichtung' },

  // FOOTER
  'footer.desc':    { en: 'The AI-powered platform helping students and young people land apprenticeships faster than ever before.', de: 'Die KI-gestützte Plattform, die Jugendlichen hilft, schneller als je zuvor eine Lehrstelle zu finden.' },
  'footer.product': { en: 'Product',  de: 'Produkt' },
  'footer.company': { en: 'Company',  de: 'Unternehmen' },
  'footer.legal':   { en: 'Legal',    de: 'Rechtliches' },
  'footer.features':{ en: 'Features', de: 'Funktionen' },
  'footer.pricing': { en: 'Pricing',  de: 'Preise' },
  'footer.demo':    { en: 'Demo',     de: 'Demo' },
  'footer.blog':    { en: 'Blog',     de: 'Blog' },
  'footer.community':{ en: 'Community', de: 'Community' },
  'footer.help':    { en: 'Help',     de: 'Hilfe' },
  'footer.privacy': { en: 'Privacy Policy',    de: 'Datenschutz' },
  'footer.terms':   { en: 'Terms of Service',  de: 'Nutzungsbedingungen' },
  'footer.cookies': { en: 'Cookie Policy',     de: 'Cookie-Richtlinie' },
  'footer.bottom':  { en: '© 2025 Blitzbewerbung · Made with ❤️ in the UK', de: '© 2025 Blitzbewerbung · Mit ❤️ in der Schweiz' },

  // COMMUNITY PAGE
  'community.title': { en: 'The Blitzbewerbung Community', de: 'Die Blitzbewerbung Community' },
  'community.sub':   { en: 'Connect with students, share tips, and celebrate wins together.', de: 'Verbinde dich mit anderen Lernenden, teile Tipps und feiere Erfolge gemeinsam.' },

  // HELP PAGE
  'help.title':   { en: 'Help Centre',   de: 'Hilfe-Center' },
  'help.sub':     { en: 'Find answers, guides, and support.', de: 'Finde Antworten, Anleitungen und Support.' },
  'help.contact': { en: 'Contact us',    de: 'Kontakt' },
}

function setLang(l) {
  document.documentElement.lang = l
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    const t = TRANSLATIONS[key]
    if (t && t[l]) el.textContent = t[l]
  })
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder')
    const t = TRANSLATIONS[key]
    if (t && t[l]) el.placeholder = t[l]
  })
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title')
    const t = TRANSLATIONS[key]
    if (t && t[l]) el.title = t[l]
  })
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === l)
  })
  localStorage.setItem('site-lang', l)
  // notify same-tab listeners (chatbot, etc.)
  if (window._cb && window._cb.syncLang) window._cb.syncLang()
}

function initLang() {
  const saved = localStorage.getItem('site-lang') || localStorage.getItem('blog-lang') || 'en'
  setLang(saved)
}

document.addEventListener('DOMContentLoaded', initLang)
