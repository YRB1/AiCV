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
  'nav.contact':    { en: 'Contact',            de: 'Kontakt' },
  'nav.community':  { en: 'Community',           de: 'Community' },
  'nav.help':       { en: 'Help',                de: 'Hilfe' },
  'nav.signin':     { en: 'Sign in',             de: 'Anmelden' },
  'nav.signup':     { en: 'Sign up',             de: 'Registrieren' },

  // HERO
  'hero.badge':  { en: '40+ job portals · All 26 cantons · AI cover letters', de: '40+ Stellenportale · Alle 26 Kantone · KI-Anschreiben' },
  'hero.title1': { en: 'Get More',                    de: 'Mehr' },
  'hero.title2': { en: 'Apprenticeship Interviews',   de: 'Vorstellungsgespräche' },
  'hero.sub':    { en: 'Search 40+ Swiss job portals at once, get a personalised cover letter for each role, and send your application in one click — or let Auto-Apply do it for you.', de: 'Durchsuche über 40 Schweizer Stellenportale auf einmal, erhalte für jede Stelle ein personalisiertes Anschreiben und sende deine Bewerbung mit einem Klick — oder lass Auto-Bewerben es für dich erledigen.' },
  'hero.cta1':   { en: 'Start Free — No Card Needed', de: 'Kostenlos starten — keine Karte nötig' },
  'hero.cta2':   { en: 'Watch Demo',                  de: 'Demo ansehen' },
  'hero.blog':   { en: 'Read the Blog',               de: 'Zum Blog' },
  'hero.note':   { en: 'Free plan · No credit card · Cancel anytime', de: 'Kostenloser Plan · Keine Kreditkarte · Jederzeit kündbar' },

  // HERO STATS
  'stat.max':     { en: 'Max Applications (Pro)', de: 'Max. Bewerbungen (Pro)' },
  'stat.boards':  { en: 'Swiss Job Portals',      de: 'Schweizer Stellenportale' },
  'stat.cantons': { en: 'Cantons Covered',        de: 'Kantone abgedeckt' },
  'stat.speed':   { en: 'Per Application',        de: 'Pro Bewerbung' },

  // TRUSTED BAR
  'trusted.label': { en: 'Used by students applying to', de: 'Genutzt von Lernenden, die sich bewerben bei' },

  // FEATURES SECTION
  'feat.tag':   { en: 'Features',   de: 'Funktionen' },
  'feat.title': { en: 'Everything you need to apply smarter', de: 'Alles für eine klügere Bewerbung' },
  'feat.sub':   { en: 'Everything you need to find, apply, and prepare — in one place.', de: 'Alles was du brauchst, um zu suchen, dich zu bewerben und dich vorzubereiten — an einem Ort.' },

  'feat1.title': { en: 'CV Analysis',              de: 'Lebenslauf-Analyse' },
  'feat1.desc':  { en: 'Paste your CV and get an instant breakdown — strengths, weak spots, missing keywords, and a score. Know exactly what to improve before you start applying.', de: 'Füge deinen Lebenslauf ein und erhalte sofort eine Auswertung — Stärken, schwache Punkte, fehlende Schlüsselwörter und eine Bewertung. Weiss genau, was du vor dem Bewerben verbessern musst.' },
  'feat2.title': { en: 'Auto-Apply',               de: 'Auto-Bewerben' },
  'feat2.desc':  { en: 'Click ⚡ Auto-Apply on any listing. AI writes a personalised cover letter, finds the company email, and sends your application in one go — no copy-pasting, no tabs, no wasted time.', de: 'Klick auf ⚡ Auto-Bewerben bei einer Stelle. Die KI schreibt ein persönliches Anschreiben, findet die Firmen-Email und sendet deine Bewerbung auf einmal — kein Kopieren, keine Tabs, keine verschwendete Zeit.' },
  'feat3.title': { en: 'AI Cover Letters',         de: 'KI-Anschreiben' },
  'feat3.desc':  { en: 'Every cover letter is written from scratch for that specific company and role — using your script, your details, and the actual job listing. No generic templates.', de: 'Jedes Anschreiben wird neu für das jeweilige Unternehmen und die Stelle verfasst — mit deinem Skript, deinen Angaben und dem echten Inserat. Keine generischen Vorlagen.' },
  'feat4.title': { en: 'Application Tracker',      de: 'Bewerbungs-Tracker' },
  'feat4.desc':  { en: 'Every application you send gets tracked automatically — status, company, role, and contact info all in one place. Move applications through stages as you hear back.', de: 'Jede gesendete Bewerbung wird automatisch erfasst — Status, Unternehmen, Stelle und Kontaktdaten an einem Ort. Verschiebe Bewerbungen durch die Phasen, sobald du Rückmeldungen erhältst.' },
  'feat5.title': { en: 'Swiss Job Search',         de: 'Schweizer Jobsuche' },
  'feat5.desc':  { en: 'Search across gateway.one, berufsberatung.ch, company websites and Google Jobs simultaneously — covering all 26 cantons. Many listings never appear on Yousty.', de: 'Suche gleichzeitig auf gateway.one, berufsberatung.ch, Firmenwebseiten und Google Jobs — alle 26 Kantone abgedeckt. Viele Stellen erscheinen nie auf Yousty.' },
  'feat6.title': { en: 'Interview Preparation',    de: 'Interview-Vorbereitung' },
  'feat6.desc':  { en: 'Get a set of likely interview questions for any role or company. Practice your answers and go into the conversation knowing what to expect.', de: 'Erhalte eine Reihe wahrscheinlicher Interviewfragen für jede Stelle oder jedes Unternehmen. Übe deine Antworten und gehe vorbereitet ins Gespräch.' },
  'feat7.title': { en: 'Direct Contact Finder',    de: 'Direktkontakt-Finder' },
  'feat7.desc':  { en: 'For every job listing, we scrape the company website to find a direct email address — not just the generic HR inbox. Your application lands in the right hands.', de: 'Für jedes Stelleninserat suchen wir die Firmenwebseite nach einer direkten E-Mail-Adresse ab — nicht nur dem allgemeinen HR-Postfach. Deine Bewerbung landet bei den richtigen Personen.' },
  'feat8.title': { en: 'Bewerbungs-Skript',        de: 'Bewerbungs-Skript' },
  'feat8.desc':  { en: 'Write your personal pitch once — your strengths, goals, and why you want this type of apprenticeship. Every AI cover letter uses it as the foundation.', de: 'Schreibe einmal deine persönliche Pitch — deine Stärken, Ziele und warum du diese Lehrstelle willst. Jedes KI-Anschreiben baut darauf auf.' },
  'feat9.title': { en: 'Application Dashboard',    de: 'Bewerbungs-Dashboard' },
  'feat9.desc':  { en: 'One screen shows everything — how many you\'ve sent, reply rate, open interviews, and a 7-day activity chart. Know exactly where you stand at all times.', de: 'Ein Bildschirm zeigt alles — wie viele du gesendet hast, Antwortrate, offene Interviews und ein 7-Tage-Aktivitätsdiagramm. Weiss jederzeit genau, wo du stehst.' },

  // WHY SECTION
  'why.title1': { en: 'More interviews.',  de: 'Mehr Interviews.' },
  'why.title2': { en: 'Less effort.',      de: 'Weniger Aufwand.' },
  'why.sub':    { en: 'Manual applications take hours. Blitzbewerbung cuts that to minutes — without cutting corners on quality.', de: 'Manuelle Bewerbungen dauern Stunden. Blitzbewerbung verkürzt das auf Minuten — ohne Abstriche bei der Qualität.' },
  'why1.title': { en: 'More applications, same time',  de: 'Mehr Bewerbungen, gleiche Zeit' },
  'why1.desc':  { en: 'Writing one application by hand takes 45–60 minutes. With Blitzbewerbung, a personalised cover letter and send takes under 2 minutes — or under 60 seconds with Auto-Apply.', de: 'Eine Bewerbung von Hand zu schreiben dauert 45–60 Minuten. Mit Blitzbewerbung dauert ein personalisiertes Anschreiben und Senden unter 2 Minuten — oder unter 60 Sekunden mit Auto-Bewerben.' },
  'why2.title': { en: 'Swiss portals, all at once',    de: 'Schweizer Portale, alle auf einmal' },
  'why2.desc':  { en: 'Most people check Yousty and stop there. Blitzbewerbung searches gateway.one, berufsberatung.ch, Google Jobs, and 35+ company career pages in one search — including listings you\'d never find manually.', de: 'Die meisten schauen auf Yousty und hören dort auf. Blitzbewerbung durchsucht gateway.one, berufsberatung.ch, Google Jobs und 35+ Firmen-Karriereseiten in einer Suche — einschliesslich Stellen, die du manuell nie gefunden hättest.' },
  'why3.title': { en: 'Hours back every week',    de: 'Stunden zurück jede Woche' },
  'why3.desc':  { en: 'Searching for listings, writing cover letters, finding contact emails — Blitzbewerbung handles all three. What used to take a full evening now takes a few minutes.', de: 'Stellen suchen, Anschreiben verfassen, Kontakt-Emails finden — Blitzbewerbung erledigt alle drei. Was früher einen ganzen Abend gedauert hat, dauert jetzt ein paar Minuten.' },
  'why4.title': { en: 'Personalised, not generic',  de: 'Personalisiert, nicht generisch' },
  'why4.desc':  { en: 'Every cover letter is written around the actual job listing — company name, role details, and your personal pitch. Recruiters can immediately tell the difference between a real letter and a mass-blast template.', de: 'Jedes Anschreiben wird rund um das echte Inserat verfasst — Firmenname, Stellendetails und deine persönliche Pitch. Recruiter erkennen sofort den Unterschied zwischen einem echten Brief und einer Massen-Vorlage.' },

  // HOW IT WORKS
  'how.tag':    { en: 'How it works', de: 'So funktioniert\'s' },
  'how.title1': { en: 'From CV to interview', de: 'Vom Lebenslauf zum Interview' },
  'how.title2': { en: 'in 4 steps',           de: 'in 4 Schritten' },
  'how.sub':    { en: 'Takes 5 minutes to set up. Then applying takes seconds per role.', de: 'Das Einrichten dauert 5 Minuten. Danach dauert eine Bewerbung Sekunden.' },
  'step1.title': { en: 'Set Up Your Profile',             de: 'Profil einrichten' },
  'step1.desc':  { en: 'Enter your details and write a short personal pitch — your goals, strengths, and the type of apprenticeship you\'re after. Takes about 5 minutes.', de: 'Gib deine Daten ein und schreibe eine kurze persönliche Pitch — deine Ziele, Stärken und die Art der Lehrstelle, die du suchst. Dauert etwa 5 Minuten.' },
  'step2.title': { en: 'Search Swiss Apprenticeships',    de: 'Schweizer Lehrstellen suchen' },
  'step2.desc':  { en: 'Type a job title and canton. We search 40+ Swiss portals at once and return real listings with contact details — far more than Yousty alone.', de: 'Tippe eine Berufsbezeichnung und einen Kanton. Wir durchsuchen 40+ Schweizer Portale auf einmal und zeigen echte Stellen mit Kontaktdaten — viel mehr als Yousty allein.' },
  'step3.title': { en: 'Apply — or Auto-Apply',           de: 'Bewerben — oder Auto-Bewerben' },
  'step3.desc':  { en: 'Click Apply to review the AI-written cover letter first, or click Auto-Apply to have it sent immediately. Each letter is written specifically for that company and role.', de: 'Klicke auf Bewerben um das KI-geschriebene Anschreiben zuerst zu prüfen, oder auf Auto-Bewerben um es sofort zu senden. Jeder Brief wird speziell für das Unternehmen und die Stelle verfasst.' },
  'step4.title': { en: 'Track and Prepare',               de: 'Verfolgen und vorbereiten' },
  'step4.desc':  { en: 'Every sent application is tracked in your dashboard. When you get a reply, use the interview prep tool to practise questions for that specific role.', de: 'Jede gesendete Bewerbung wird in deinem Dashboard verfolgt. Wenn du eine Antwort erhältst, nutze das Interview-Vorbereitungs-Tool um Fragen für die spezifische Stelle zu üben.' },

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
  'price.free.cta':     { en: 'Get started free',       de: 'Kostenlos starten' },
  'price.pro.cta':      { en: 'Start Pro — £20/mo',     de: 'Pro starten — CHF 25/Mt.' },
  'price.student.cta':  { en: 'Student Plan — £15/mo',  de: 'Student-Plan — CHF 19/Mt.' },
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
  'faq1.a': { en: 'Yes — the Free plan lets you send up to 3 AI cover letters per day and track 15 applications, with no credit card required. Upgrade to Pro to unlock Auto-Apply, unlimited cover letters, and up to 100 applications per day.', de: 'Ja — der kostenlose Plan ermöglicht dir bis zu 3 KI-Anschreiben pro Tag und 15 Bewerbungen ohne Kreditkarte. Upgrade auf Pro für Auto-Bewerben, unbegrenzte Anschreiben und bis zu 100 Bewerbungen pro Tag.' },
  'faq2.q': { en: 'How does the AI write my cover letter?', de: 'Wie schreibt die KI mein Anschreiben?' },
  'faq2.a': { en: 'You write a personal pitch once — your goals, strengths, and what you\'re looking for. For each application, the AI combines your pitch with the specific job listing to write a unique cover letter for that company and role. Nothing is made up.', de: 'Du schreibst einmal eine persönliche Pitch — deine Ziele, Stärken und wonach du suchst. Für jede Bewerbung kombiniert die KI deine Pitch mit dem spezifischen Stelleninserat, um ein einzigartiges Anschreiben für dieses Unternehmen und diese Stelle zu verfassen. Nichts wird erfunden.' },
  'faq3.q': { en: 'Will employers know I used AI?', de: 'Werden Arbeitgeber wissen, dass ich KI benutzt habe?' },
  'faq3.a': { en: 'No. Blitzbewerbung outputs clean, natural writing based entirely on your real experience. It sounds like you because it\'s built from your words and history — think of it as a personal career coach helping you communicate more clearly.', de: 'Nein. Blitzbewerbung erzeugt sauberes, natürliches Schreiben basierend auf deiner echten Erfahrung. Es klingt wie du, weil es aus deinen Worten und deiner Geschichte aufgebaut ist — denk daran wie an einen persönlichen Karrierecoach.' },
  'faq4.q': { en: 'Which job boards does Blitzbewerbung search?', de: 'Welche Jobbörsen durchsucht Blitzbewerbung?' },
  'faq4.a': { en: 'We search gateway.one, berufsberatung.ch, Google Jobs, and 35+ Swiss company career pages — covering all 26 cantons. Results are fetched live when you search, so listings are always current.', de: 'Wir durchsuchen gateway.one, berufsberatung.ch, Google Jobs und 35+ Schweizer Firmen-Karriereseiten — alle 26 Kantone abgedeckt. Ergebnisse werden bei der Suche live abgerufen, damit Stellen immer aktuell sind.' },
  'faq5.q': { en: 'Is my CV data kept private?', de: 'Sind meine Lebenslaufdaten privat?' },
  'faq5.a': { en: 'Absolutely. Your CV and personal data are encrypted at rest and in transit. We never sell your data, never share it without your explicit approval, and never use it to train our AI models.', de: 'Absolut. Dein Lebenslauf und persönliche Daten sind verschlüsselt. Wir verkaufen deine Daten nie, teilen sie nie ohne deine ausdrückliche Zustimmung und nutzen sie nie zum Training unserer KI-Modelle.' },
  'faq6.q': { en: 'Can I cancel my subscription at any time?', de: 'Kann ich mein Abo jederzeit kündigen?' },
  'faq6.a': { en: 'Yes — cancel from your account settings with one click, no questions asked. If you cancel mid-month you keep access until your billing period ends.', de: 'Ja — kündige in deinen Kontoeinstellungen mit einem Klick, keine Fragen gestellt. Wenn du mitten im Monat kündigst, behältst du den Zugang bis zum Ende deines Abrechnungszeitraums.' },

  // FINAL CTA
  'cta.final.title1': { en: 'Ready to Automate',           de: 'Bereit, deine' },
  'cta.final.title2': { en: 'Your Apprenticeship Search?', de: 'Lehrstellen-Suche zu automatisieren?' },
  'cta.final.sub':    { en: 'Set up your profile in 5 minutes and start applying to Swiss apprenticeships faster than everyone else in your class.', de: 'Richte dein Profil in 5 Minuten ein und bewirb dich schneller auf Schweizer Lehrstellen als alle anderen in deiner Klasse.' },
  'cta.final.btn1':   { en: 'Get Started Free',            de: 'Kostenlos loslegen' },
  'cta.final.btn2':   { en: 'Already have an account?',    de: 'Bereits ein Konto?' },
  'cta.final.note':   { en: 'Free plan · No credit card · Takes 2 minutes to set up', de: 'Kostenloser Plan · Keine Kreditkarte · 2 Minuten zur Einrichtung' },

  // FOOTER
  // TECH STRIP
  'tech.built':   { en: 'Built on trusted infrastructure', de: 'Gebaut auf vertrauenswürdiger Infrastruktur' },
  'tech.apilink': { en: 'API providers & partners — view our business & use-case documentation →', de: 'API-Anbieter & Partner — Geschäfts- & Nutzungsdokumentation ansehen →' },

  // FOOTER
  'footer.business': { en: 'Business & API', de: 'Geschäft & API' },
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
  'footer.bottom':  { en: '© 2025 Blitzbewerbung · Built for Switzerland', de: '© 2025 Blitzbewerbung · Gebaut für die Schweiz' },

  // COMMUNITY PAGE
  'community.title': { en: 'The Blitzbewerbung Community', de: 'Die Blitzbewerbung Community' },
  'community.sub':   { en: 'Connect with students, share tips, and celebrate wins together.', de: 'Verbinde dich mit anderen Lernenden, teile Tipps und feiere Erfolge gemeinsam.' },

  // HELP PAGE
  'help.title':   { en: 'Help Centre',   de: 'Hilfe-Center' },
  'help.sub':     { en: 'Find answers, guides, and support.', de: 'Finde Antworten, Anleitungen und Support.' },
  'help.contact': { en: 'Contact us',    de: 'Kontakt' },

  // TESTIMONIALS
  'testi1.text': { en: '"I spent months applying manually and barely heard back. Within two weeks of using Blitzbewerbung I had three interviews lined up — and the cover letters actually sounded like me."', de: '„Ich habe monatelang manuell beworben und kaum Rückmeldungen bekommen. Innerhalb von zwei Wochen mit Blitzbewerbung hatte ich drei Interviews — und die Anschreiben klangen wirklich nach mir."' },
  'testi1.role': { en: 'Apprentice Informatiker EFZ, Swisscom', de: 'Lernender Informatiker EFZ, Swisscom' },
  'testi2.text': { en: '"The AI found open positions directly on company websites that never showed up on Yousty. That\'s where I got my offer — a listing I\'d have completely missed."', de: '„Die KI hat Stellen direkt auf Firmenwebseiten gefunden, die nie auf Yousty erschienen. Dort habe ich mein Angebot erhalten — ein Inserat, das ich komplett verpasst hätte."' },
  'testi2.role': { en: 'Apprentice Kauffrau EFZ, Migros', de: 'Lernende Kauffrau EFZ, Migros' },
  'testi3.text': { en: '"I was sceptical about AI cover letters, but my trainer told me mine stood out. She thought I\'d spent hours on it. The whole thing took me about 10 minutes."', de: '„Ich war skeptisch gegenüber KI-Anschreiben, aber meine Berufsbildnerin sagte, meines habe herausgestochen. Sie dachte, ich hätte stundenlang daran gearbeitet. Das Ganze dauerte etwa 10 Minuten."' },
  'testi3.role': { en: 'Apprentice Mediamatiker EFZ, Zühlke Engineering', de: 'Lernender Mediamatiker EFZ, Zühlke Engineering' },
  'testi4.text': { en: '"After getting rejected everywhere I nearly gave up. Blitzbewerbung helped me reach far more companies and finally strike the right tone. Now I\'m doing what I always wanted."', de: '„Nachdem ich überall abgelehnt wurde, wollte ich fast aufgeben. Blitzbewerbung half mir, viel mehr Betriebe zu erreichen und endlich den richtigen Ton zu treffen. Jetzt mache ich genau das, was ich immer wollte."' },
  'testi4.role': { en: 'Apprentice Fachfrau Gesundheit EFZ, Inselspital Bern', de: 'Lernende Fachfrau Gesundheit EFZ, Inselspital Bern' },
  'testi5.text': { en: '"In one week I reached 30+ companies — that would have taken me months before. Eight of them wrote back. The search alone is worth it."', de: '„In einer Woche habe ich über 30 Betriebe angeschrieben — früher hätte das Monate gedauert. Acht haben geantwortet. Die Suche allein ist es schon wert."' },
  'testi5.role': { en: 'Apprentice Polymechaniker EFZ, Bühler AG', de: 'Lernender Polymechaniker EFZ, Bühler AG' },
  'testi6.text': { en: '"The interview prep gave me questions that actually came up in my interview. I walked in calmer than I\'d ever been and it showed."', de: '„Die Interview-Vorbereitung gab mir Fragen, die wirklich im Gespräch kamen. Ich war ruhiger als je zuvor — und das hat man gesehen."' },
  'testi6.role': { en: 'Apprentice Kauffrau EFZ, PostFinance', de: 'Lernende Kauffrau EFZ, PostFinance' },

  // DEMO MODAL
  'demo.step1':       { en: 'Step 1 of 4 — Upload your CV',               de: 'Schritt 1 von 4 — Lebenslauf hochladen' },
  'demo.dropzone':    { en: 'Drop your CV here',                           de: 'Lebenslauf hier ablegen' },
  'demo.dropsub':     { en: 'Supports PDF, DOCX, and TXT',                 de: 'PDF, DOCX und TXT werden unterstützt' },
  'demo.profilebuilt':{ en: 'Profile built — 12 skills detected',          de: 'Profil erstellt — 12 Fähigkeiten erkannt' },
  'demo.step2':       { en: 'Step 2 of 4 — AI scans 40+ job boards',       de: 'Schritt 2 von 4 — KI durchsucht 40+ Jobbörsen' },
  'demo.yourskills':  { en: 'Your Skills',                                  de: 'Deine Fähigkeiten' },
  'demo.scanboards':  { en: 'Scanning Boards',                              de: 'Jobbörsen scannen' },
  'demo.matchesfound':{ en: '🎯 12 perfect matches found',                  de: '🎯 12 perfekte Treffer gefunden' },
  'demo.step3':       { en: 'Step 3 of 4 — Review your matches',            de: 'Schritt 3 von 4 — Treffer prüfen' },
  'demo.opportunities':{ en: '12 new opportunities',                        de: '12 neue Möglichkeiten' },
  'demo.ranked':      { en: 'Ranked by AI match score',                     de: 'Sortiert nach KI-Übereinstimmung' },
  'demo.step4':       { en: 'Step 4 of 4 — AI writes your application',     de: 'Schritt 4 von 4 — KI schreibt deine Bewerbung' },
  'demo.personalising':{ en: 'Personalising application',                   de: 'Bewerbung wird personalisiert' },
  'demo.submitted':   { en: 'Application submitted to Swisscom ✓',            de: 'Bewerbung bei Swisscom abgesendet ✓' },
  'demo.step5':       { en: 'Your dashboard — all applications tracked',    de: 'Dein Dashboard — alle Bewerbungen im Überblick' },
  'demo.kpi.apps':    { en: 'Applications',  de: 'Bewerbungen' },
  'demo.kpi.interviews':{ en: 'Interviews',  de: 'Interviews' },
  'demo.kpi.cvscore': { en: 'CV Score',      de: 'Lebenslauf-Score' },
  'demo.interview':   { en: '🎉 Interview booked with Swisscom — Monday 9am', de: '🎉 Interview bei Swisscom gebucht — Montag 9 Uhr' },
  'demo.nav1':        { en: '1. Upload',   de: '1. Hochladen' },
  'demo.nav2':        { en: '2. AI Scan',  de: '2. KI-Scan' },
  'demo.nav3':        { en: '3. Matches',  de: '3. Treffer' },
  'demo.nav4':        { en: '4. Apply',    de: '4. Bewerben' },
  'demo.nav5':        { en: 'Results',     de: 'Ergebnisse' },

  // FLOATING DASHBOARD (hero section)
  'dash.nav.overview':      { en: 'Overview',              de: 'Übersicht' },
  'dash.nav.mycv':          { en: 'My CV',                 de: 'Mein LS' },
  'dash.nav.matches':       { en: 'Matches',               de: 'Treffer' },
  'dash.nav.apps':          { en: 'Applications',          de: 'Bewerbungen' },
  'dash.nav.messages':      { en: 'Messages',              de: 'Nachrichten' },
  'dash.nav.profile':       { en: 'Profile',               de: 'Profil' },
  'dash.kpi.sent':          { en: 'Applications Sent',     de: 'Bewerbungen ges.' },
  'dash.kpi.sent.delta':    { en: '↑ 12 this week',        de: '↑ 12 diese Woche' },
  'dash.kpi.int.delta':     { en: '↑ 3 new',               de: '↑ 3 neue' },
  'dash.kpi.matches':       { en: 'Job Matches',           de: 'Job-Treffer' },
  'dash.kpi.matches.delta': { en: '↑ 24 today',            de: '↑ 24 heute' },
  'dash.kpi.cvscore':       { en: 'CV Score',              de: 'LB-Score' },
  'dash.card.activity':     { en: 'Activity — Last 7 Days', de: 'Aktivität — 7 Tage' },
  'dash.card.cvscore':      { en: 'CV Score',              de: 'LB-Score' },
  'dash.card.recent':       { en: 'Recent Applications',   de: 'Letzte Bewerbungen' },
  'dash.badge.interview':   { en: 'Interview',             de: 'Interview' },
  'dash.badge.applied':     { en: 'Applied',               de: 'Beworben' },
  'dash.badge.pending':     { en: 'Pending',               de: 'Ausstehend' },
  'dash.excellent':         { en: 'Excellent',             de: 'Ausgezeichnet' },

  // DEMO THUMBNAIL
  'dt.nav.overview':    { en: 'Overview',    de: 'Übersicht' },
  'dt.nav.mycv':        { en: 'My CV',        de: 'Mein LS' },
  'dt.nav.matches':     { en: 'Matches',      de: 'Treffer' },
  'dt.nav.apps':        { en: 'Applications', de: 'Bewerbungen' },
  'dt.nav.messages':    { en: 'Messages',     de: 'Nachrichten' },
  'dt.nav.settings':    { en: 'Settings',     de: 'Einstellungen' },
  'dt.kpi.apps':        { en: 'Applications', de: 'Bewerbungen' },
  'dt.kpi.cvscore':     { en: 'CV Score',      de: 'LB-Score' },
  'dt.badge.interview': { en: 'Interview',    de: 'Interview' },
  'dt.badge.applied':   { en: 'Applied',      de: 'Beworben' },
  'dt.badge.pending':   { en: 'Pending',      de: 'Ausstehend' },
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
  // Handle .de/.en class-based visibility (used on help.html and similar pages)
  document.querySelectorAll('.de').forEach(el => { el.style.display = l === 'de' ? '' : 'none' })
  document.querySelectorAll('.en').forEach(el => { el.style.display = l === 'en' ? '' : 'none' })
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === l)
  })
  localStorage.setItem('site-lang', l)
  localStorage.setItem('blog-lang', l)
  // update pricing currency if on index page
  if (typeof switchBilling === 'function') switchBilling()
  // notify same-tab listeners (chatbot, etc.)
  if (window._cb && window._cb.syncLang) window._cb.syncLang()
}

function initLang() {
  const saved = localStorage.getItem('site-lang') || localStorage.getItem('blog-lang') || 'en'
  setLang(saved)
}

document.addEventListener('DOMContentLoaded', initLang)
