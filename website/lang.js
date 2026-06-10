// Blitzbewerbung — DE/EN translation system for main pages
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
  'hero.badge':     { en: '50,000+ students · 40+ job boards · 24/7 AI', de: '50.000+ Lernende · 40+ Jobbörsen · 24/7 KI' },
  'hero.title1':    { en: 'Get 10× More',        de: '10× mehr' },
  'hero.title2':    { en: 'Apprenticeship Interviews', de: 'Vorstellungsgespräche' },
  'hero.sub':       { en: 'Upload your CV once. AI scans 40+ job boards, tailors every application, and applies on your behalf — automatically, every day.', de: 'Lade deinen Lebenslauf einmal hoch. Die KI durchsucht 40+ Jobbörsen, passt jede Bewerbung an und sendet sie automatisch täglich in deinem Namen ab.' },
  'hero.cta1':      { en: 'Start Free — No Card Needed', de: 'Kostenlos starten — keine Karte nötig' },
  'hero.cta2':      { en: 'Watch Demo',          de: 'Demo ansehen' },
  'hero.note':      { en: 'Free plan · No credit card · Cancel anytime', de: 'Kostenloser Plan · Keine Kreditkarte · Jederzeit kündbar' },

  // STATS
  'stat.sent':      { en: 'Applications Sent',  de: 'Bewerbungen gesendet' },
  'stat.max':       { en: 'Max Applications',   de: 'Max. Bewerbungen' },
  'stat.boards':    { en: 'Job Boards Scanned', de: 'Jobbörsen durchsucht' },
  'stat.ats':       { en: 'ATS Pass Rate',       de: 'ATS-Erfolgsrate' },

  // FEATURES
  'section.features':    { en: 'Everything you need to land your apprenticeship', de: 'Alles, was du für deine Lehrstelle brauchst' },
  'section.features.sub':{ en: 'Blitzbewerbung combines AI job matching, smart cover letters, and automated applications into one powerful platform.', de: 'Blitzbewerbung kombiniert KI-Jobmatching, smarte Bewerbungsschreiben und automatische Bewerbungen in einer leistungsstarken Plattform.' },

  // WHY
  'section.why':         { en: 'Why students choose Blitzbewerbung', de: 'Warum Lernende Blitzbewerbung wählen' },

  // HOW
  'section.how':         { en: 'How it works',  de: 'So funktioniert\'s' },
  'section.how.sub':     { en: 'Get started in minutes. No technical skills required.', de: 'In wenigen Minuten loslegen. Keine technischen Kenntnisse erforderlich.' },

  // PRICING
  'section.pricing':     { en: 'Simple, transparent pricing', de: 'Einfache, transparente Preise' },
  'section.pricing.sub': { en: 'Start free, upgrade when you\'re ready. No hidden fees.', de: 'Kostenlos starten, upgraden wenn du bereit bist. Keine versteckten Kosten.' },
  'price.free':          { en: 'Free',           de: 'Kostenlos' },
  'price.pro':           { en: 'Pro',            de: 'Pro' },
  'price.student':       { en: 'Student',        de: 'Student' },
  'price.month':         { en: '/mo',            de: '/Mt.' },
  'price.year':          { en: '/yr',            de: '/Jahr' },
  'price.free.cta':      { en: 'Get started free', de: 'Kostenlos starten' },
  'price.pro.cta':       { en: 'Start Pro',      de: 'Pro starten' },
  'price.student.cta':   { en: 'Student Plan',   de: 'Student-Plan' },

  // FAQ
  'section.faq':         { en: 'Frequently asked questions', de: 'Häufig gestellte Fragen' },

  // CTA SECTION
  'cta.title':           { en: 'Ready to land your apprenticeship?', de: 'Bereit, deine Lehrstelle zu finden?' },
  'cta.sub':             { en: 'Join 50,000+ students already using Blitzbewerbung.', de: 'Schliess dich 50.000+ Lernenden an, die Blitzbewerbung bereits nutzen.' },
  'cta.btn1':            { en: 'Get Started Free', de: 'Kostenlos loslegen' },
  'cta.btn2':            { en: 'Already have an account?', de: 'Bereits ein Konto?' },

  // FOOTER
  'footer.desc':         { en: 'The AI-powered platform helping students and young people land apprenticeships faster than ever before.', de: 'Die KI-gestützte Plattform, die Jugendlichen hilft, schneller als je zuvor eine Lehrstelle zu finden.' },
  'footer.product':      { en: 'Product',        de: 'Produkt' },
  'footer.company':      { en: 'Company',        de: 'Unternehmen' },
  'footer.legal':        { en: 'Legal',          de: 'Rechtliches' },
  'footer.features':     { en: 'Features',       de: 'Funktionen' },
  'footer.pricing':      { en: 'Pricing',        de: 'Preise' },
  'footer.demo':         { en: 'Demo',           de: 'Demo' },
  'footer.blog':         { en: 'Blog',           de: 'Blog' },
  'footer.community':    { en: 'Community',      de: 'Community' },
  'footer.help':         { en: 'Help',           de: 'Hilfe' },
  'footer.privacy':      { en: 'Privacy Policy', de: 'Datenschutz' },
  'footer.terms':        { en: 'Terms of Service', de: 'Nutzungsbedingungen' },
  'footer.cookies':      { en: 'Cookie Policy',  de: 'Cookie-Richtlinie' },

  // COMMUNITY PAGE
  'community.title':     { en: 'The Blitzbewerbung Community', de: 'Die Blitzbewerbung Community' },
  'community.sub':       { en: 'Connect with students, share tips, and celebrate wins together.', de: 'Verbinde dich mit anderen Lernenden, teile Tipps und feiere Erfolge gemeinsam.' },

  // HELP PAGE
  'help.title':          { en: 'Help Centre',    de: 'Hilfe-Center' },
  'help.sub':            { en: 'Find answers, guides, and support.', de: 'Finde Antworten, Anleitungen und Support.' },
  'help.contact':        { en: 'Contact us',     de: 'Kontakt' },
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
  // Update toggle button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === l)
  })
  localStorage.setItem('site-lang', l)
}

function initLang() {
  const saved = localStorage.getItem('site-lang') || localStorage.getItem('blog-lang') || 'en'
  setLang(saved)
}

document.addEventListener('DOMContentLoaded', initLang)
