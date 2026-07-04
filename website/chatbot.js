(function(){
  'use strict';
  const inBlog = /\/blog\//.test(window.location.pathname);
  const base   = inBlog ? '../' : '';
  const bbase  = inBlog ? ''    : 'blog/';
  const r = p  => base  + p;
  const b = p  => bbase + p;

  /* ── Knowledge base ─────────────────────────────────────────────────── */
  function KB(){
    return {
      de:[
        {k:['hallo','hi','hey','guten','morgen','tag','servus','grüezi','was kann'],a:`Hallo! 👋 Ich bin <strong>Blitz Bot</strong> — ich beantworte Fragen zu Blitzbewerbung sofort. Was möchtest du wissen?`},
        {k:['kostenlos','gratis','preis','kosten','abo','plan','pro','zahlen','bezahl','teuer','günstig','rabatt','upgrade'],a:`Es gibt einen <strong>kostenlosen Einstieg</strong>. Das volle Feature-Set (unlimitierte Suchen, KI-Bewerbungen, direkte Kontakte) ist im Pro-Abo. Schau dir die <a href="${r('index.html')}#pricing">Preise</a> an.`},
        {k:['kündigen','kündigung','cancel','abo beenden','abo stopp','deaktivieren'],a:`Du kannst dein Abo <strong>jederzeit</strong> in den Kontoeinstellungen kündigen — kein Formular, keine Wartezeit. Du behältst alle Features bis Ablauf der bezahlten Periode.`},
        {k:['passwort','password','vergessen','reset','einloggen','login','anmeld','anmelde'],a:`Klick auf der <a href="${r('signin.html')}">Anmeldeseite</a> auf <strong>"Passwort vergessen?"</strong> — du bekommst sofort einen Reset-Link per E-Mail.`},
        {k:['konto','registrieren','sign up','erstellen','account','anmelden','neu'],a:`Klick oben rechts auf <strong>Sign up</strong> und gib deine E-Mail ein — fertig in unter einer Minute.`},
        {k:['suche','stellen','jobs','finden','resultate','quellen','lehrstell','inserat','ausschreibung'],a:`Blitzbewerbung durchsucht gleichzeitig <strong>Google Jobs, Firmenwebsites und kantonale Portale</strong>. So findest du auch Stellen, die nie auf Yousty erscheinen.`},
        {k:['filter','kanton','beruf','umkreis','radius','region'],a:`Du kannst nach <strong>Beruf, Kanton und Umkreis</strong> filtern — die Suche deckt alle 26 Kantone ab.`},
        {k:['wie viele','anzahl','wie oft','täglich','pro tag','resultate kommen','aktuell'],a:`Die Resultate werden <strong>in Echtzeit</strong> geladen — du siehst immer die aktuellsten Stellen. Neue Inserate erscheinen oft Tage früher als auf anderen Plattformen.`},
        {k:['ki','ai','gpt','chatgpt','motivationsschreiben','bewerbungsschreiben','automatisch','generier','schreib'],a:`Für jede Stelle wird <strong>automatisch ein personalisiertes Motivationsschreiben</strong> auf Deutsch oder Englisch generiert — du kannst es danach bearbeiten und versenden.`},
        {k:['merkt','erkennt','auffällig','ki text','erkenn','echt','original','klingt'],a:`Die KI-Texte sind auf Authentizität optimiert. Lies das Schreiben nochmals durch, ergänze persönliche Details — dann klingt es <strong>wirklich nach dir</strong>.`},
        {k:['email adresse','direktkontakt','hr','firma kontakt','ansprechperson'],a:`Blitzbewerbung sucht automatisch nach <strong>direkten Kontaktadressen</strong> — nicht nur dem allgemeinen HR-Postfach. So wird deine Bewerbung wahrscheinlicher gelesen.`},
        {k:['englisch','sprache','language','deutsch','bilingual'],a:`Blitzbewerbung ist auf <strong>Deutsch und Englisch</strong> verfügbar — Suche, Bewerbungsschreiben und die ganze App.`},
        {k:['zahlung','payment','kreditkarte','twint','stripe','visa','mastercard'],a:`Wir akzeptieren <strong>Visa, Mastercard, Amex und TWINT</strong>. Zahlung sicher über Stripe.`},
        {k:['yousty','vergleich','unterschied','besser','alternativen'],a:`Yousty zeigt nur bezahlte Inserate. Wir finden zusätzlich Stellen auf Firmenwebsites — <strong>über 40% der Lehrstellen erscheinen nie auf Yousty</strong>. Lies den <a href="${b('blitzbewerbung-vs-yousty.html')}">Vergleich</a>.`},
        {k:['datenschutz','daten','privacy','dsgvo','gdpr','sicher','sicherheit'],a:`Deine Daten werden <strong>nicht an Firmen weitergegeben</strong>. Wir speichern nur was nötig ist. Du kannst dein Konto jederzeit vollständig löschen. Lies unsere <a href="${r('privacy.html')}">Datenschutzerklärung</a>.`},
        {k:['cookie','cookies','zustimmung'],a:`Wir nutzen nur notwendige Cookies für die Anmeldung und deine Spracheinstellung. Details in der <a href="${r('privacy.html')}">Datenschutzerklärung</a>.`},
        {k:['zürich','bern','basel','zug','luzern','st. gallen','thurgau','aargau','züri'],a:`Die Suche ist <strong>schweizweit — alle 26 Kantone</strong>. Wir haben auch Kantons-Guides: <a href="${b('lehrstellen-zuerich.html')}">Zürich</a>, <a href="${b('lehrstellen-bern.html')}">Bern</a>, <a href="${b('lehrstellen-basel.html')}">Basel</a>, <a href="${b('lehrstellen-zug.html')}">Zug</a>.`},
        {k:['informatiker','informatik','efz','eba','mediamatiker','kaufmann','kauffrau','kv','berufswahl'],a:`Wir haben Ratgeber zu vielen Berufen: <a href="${b('informatik-lohn.html')}">Informatiker EFZ</a>, <a href="${b('mediamatiker-efz.html')}">Mediamatiker</a>, <a href="${b('kv-vs-informatiker.html')}">KV vs. Informatik</a>. Schau dich im <a href="${b('index.html')}">Blog</a> um!`},
        {k:['schnupperlehre','schnupper','probearbeiten'],a:`Dazu haben wir einen ganzen Artikel: <a href="${b('schnupperlehre-organisieren.html')}">Schnupperlehre organisieren</a>.`},
        {k:['lebenslauf','cv','curriculum','vitae'],a:`Dazu haben wir einen Guide: <a href="${b('lebenslauf-vorlage-lernende.html')}">Lebenslauf Vorlage für Lernende</a>.`},
        {k:['interview','vorstellungsgespräch','gespräch','vorbereitung','fragen'],a:`Lies unseren Ratgeber: <a href="${b('interview-tipps.html')}">10 Interview-Tipps für die Lehrstelle</a>.`},
        {k:['absage','abgelehnt','keine antwort','nicht geklappt','was jetzt','weiter'],a:`Eine Absage ist nicht das Ende! Lies: <a href="${b('nach-absage-lehrstelle.html')}">Nach der Absage — was tun?</a> und <a href="${b('ueberall-abgelehnt.html')}">Überall abgelehnt?</a>`},
        {k:['noten','schule','zeugnis','schlechte','weniger gut','noten nicht'],a:`Schlechte Noten schliessen eine Lehrstelle nicht aus! Lies: <a href="${b('schlechte-noten-lehrstelle.html')}">Lehrstelle trotz schlechter Noten</a>.`},
        {k:['eltern','papa','mama','vater','mutter','familie','unterstütz'],a:`Für Eltern: <a href="${b('eltern-helfen.html')}">So können Eltern beim Lehrstellensuchen helfen</a>.`},
        {k:['wann','zeitpunkt','früh','rechtzeitig','wie lange','monat','lehrstart','sommer'],a:`Die besten Chancen hast du, wenn du <strong>12–18 Monate vor Lehrbeginn</strong> mit der Suche beginnst. Lies unseren <a href="${b('lehrstellenguide-2025.html')}">Lehrstellenguide 2025</a>.`},
        {k:['wie geht','wie gehts','wie geht\'s','alles gut','gut?','mir geht','was machst du','was bist du','wer bist du'],a:`Mir geht's bestens, danke! 😊 Ich bin <strong>Blitz Bot</strong> — dein KI-Assistent für Lehrstellenbewerbungen in der Schweiz. Wie kann ich dir helfen?`},
        {k:['ich brauche hilfe','kannst du mir helfen','hilf mir','unterstütze mich','hilfe bitte'],a:`Klar helfe ich dir! 🙌 Ich kann dir bei folgenden Themen helfen:<br>• <strong>Lehrstellen suchen</strong><br>• <strong>KI-Bewerbungsschreiben</strong><br>• <strong>Konto & Abo-Fragen</strong><br>• <strong>Interview-Tipps</strong><br>Was möchtest du wissen?`},
        {k:['kontakt','email','mail','hilfe','support','frage'],a:`Schreib uns an <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> — wir antworten innerhalb von <strong>24 Stunden</strong>. 📧`},
        {k:['danke','thanks','super','top','toll','perfekt','prima','klasse'],a:`Freut mich! 😊 Noch weitere Fragen? Ich bin hier.`},
        {k:['agb','nutzungsbedingungen','terms'],a:`Unsere <a href="${r('terms.html')}">Nutzungsbedingungen</a> findest du hier.`},
        {k:['blog','ratgeber','artikel','tipps','guide'],a:`Schau in unseren <a href="${b('index.html')}">Blog</a> — dort findest du Ratgeber zu Bewerbung, Berufen, Kantonen und mehr.`},
        {k:['community','forum','austausch','andere lernende'],a:`In der <a href="${r('community.html')}">Community</a> kannst du dich mit anderen Lernenden austauschen und Tipps teilen.`},
        {k:['funktioniert nicht','fehler','bug','problem','kaputt','laden'],a:`Tut uns leid! Bitte schreib uns an <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> mit einer kurzen Beschreibung des Problems — wir kümmern uns sofort darum.`},
      ],
      en:[
        {k:['hello','hi','hey','good','what can','greet'],a:`Hi! 👋 I'm <strong>Blitz Bot</strong> — I instantly answer questions about Blitzbewerbung. What would you like to know?`},
        {k:['free','cost','price','plan','pro','pay','subscription','cheap','expensive','discount','upgrade'],a:`There's a <strong>free tier</strong> with limited searches. The full feature set is in the Pro subscription. Check <a href="${r('index.html')}#pricing">pricing</a>.`},
        {k:['cancel','cancellation','stop subscription','end plan'],a:`You can cancel <strong>any time</strong> in account settings — no forms, no waiting. You keep all features until the paid period ends.`},
        {k:['password','forgot','reset','login','sign in','log in'],a:`Click <strong>"Forgot password?"</strong> on the <a href="${r('signin.html')}">sign-in page</a> — you'll get a reset link instantly.`},
        {k:['account','register','signup','sign up','create','new user'],a:`Click <strong>Sign up</strong> top right and enter your email — done in under a minute.`},
        {k:['search','jobs','find','results','sources','listings','apprenticeship','where'],a:`Blitzbewerbung searches <strong>Google Jobs, company websites and cantonal portals simultaneously</strong>. You find positions that never appear on Yousty.`},
        {k:['filter','canton','profession','radius','location','area'],a:`You can filter by <strong>profession, canton and radius</strong> — the search covers all 26 cantons in Switzerland.`},
        {k:['how many','how often','daily','real time','up to date','current','fresh'],a:`Results are fetched <strong>in real time</strong> — you always see the most current positions. New listings often appear days before other platforms.`},
        {k:['ai','gpt','chatgpt','cover letter','application','automatic','generate','write'],a:`For every position, a <strong>personalised cover letter is automatically generated</strong> in German or English — edit and send directly.`},
        {k:['notice','detect','sound','authentic','real','obvious','ai text'],a:`Our AI texts are optimised for authenticity. Read it through, add personal details — it'll genuinely sound <strong>like you</strong>.`},
        {k:['direct email','contact person','hr email','company contact','recruiter'],a:`Blitzbewerbung automatically finds <strong>direct contact addresses</strong> — not just the general HR inbox. Your application is more likely to be read.`},
        {k:['english','language','bilingual','german'],a:`Blitzbewerbung is available in <strong>German and English</strong> — search, cover letters and the entire app.`},
        {k:['payment','credit card','twint','stripe','visa','mastercard'],a:`We accept <strong>Visa, Mastercard, Amex and TWINT</strong>, processed securely via Stripe.`},
        {k:['yousty','compare','difference','better','alternative'],a:`Yousty only shows paid listings. We additionally find positions on company websites — <strong>over 40% of apprenticeships never appear on Yousty</strong>. Read the <a href="${b('blitzbewerbung-vs-yousty.html')}">comparison</a>.`},
        {k:['privacy','data','gdpr','secure','security','store'],a:`Your data is <strong>never shared with companies</strong>. We only store what's necessary. You can fully delete your account at any time. Read our <a href="${r('privacy.html')}">Privacy Policy</a>.`},
        {k:['cookie','cookies'],a:`We only use essential cookies for login and language preference. Details in our <a href="${r('privacy.html')}">Privacy Policy</a>.`},
        {k:['zurich','bern','basel','zug','lucerne','st gallen','canton','swiss','switzerland'],a:`The search is <strong>nationwide — all 26 cantons</strong>. We also have regional guides: <a href="${b('lehrstellen-zuerich.html')}">Zurich</a>, <a href="${b('lehrstellen-bern.html')}">Bern</a>, <a href="${b('lehrstellen-basel.html')}">Basel</a>, <a href="${b('lehrstellen-zug.html')}">Zug</a>.`},
        {k:['it','computer science','commercial','kv','profession','which job','career'],a:`We have guides for many professions. Browse the <a href="${b('index.html')}">Blog</a> for career advice and comparisons.`},
        {k:['trial day','schnupperlehre','work experience'],a:`We have a full guide: <a href="${b('schnupperlehre-organisieren.html')}">Organising a Trial Day</a>.`},
        {k:['cv','resume','curriculum vitae'],a:`Check our guide: <a href="${b('lebenslauf-vorlage-lernende.html')}">CV Template for Apprentices</a>.`},
        {k:['interview','tips','prepare','questions','nervou'],a:`Read our guide: <a href="${b('interview-tipps.html')}">10 Interview Tips for Apprenticeships</a>.`},
        {k:['rejection','rejected','no response','no reply','denied','what now'],a:`A rejection isn't the end! Read: <a href="${b('nach-absage-lehrstelle.html')}">After a rejection — what to do?</a>`},
        {k:['grades','marks','school','bad grades','poor results'],a:`Bad grades don't close the door! Read: <a href="${b('schlechte-noten-lehrstelle.html')}">Apprenticeship despite bad grades</a>.`},
        {k:['parents','mum','dad','family','help from'],a:`For parents: <a href="${b('eltern-helfen.html')}">How parents can help with the apprenticeship search</a>.`},
        {k:['when','timing','early','how long','months','start date','summer'],a:`Best chances come from starting <strong>12–18 months before your intended start date</strong>. Read our <a href="${b('lehrstellenguide-2025.html')}">Apprenticeship Guide 2025</a>.`},
        {k:['how are','how r u','how\'s it','doing well','feeling','good morning','good evening','good afternoon','what\'s up','whats up','who are you','what are you'],a:`Doing great, thanks for asking! 😊 I'm <strong>Blitz Bot</strong> — your AI assistant for apprenticeship applications in Switzerland. What can I help you with?`},
        {k:['i need help','can you help','help me','need assistance','assist me','help please','need support'],a:`Of course, I'm here to help! 🙌 Here's what I can assist with:<br>• <strong>Finding apprenticeships</strong><br>• <strong>AI cover letters</strong><br>• <strong>Account & subscription questions</strong><br>• <strong>Interview preparation</strong><br>What would you like to know?`},
        {k:['contact','email','support','help','question','reach'],a:`Write to <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> — we reply within <strong>24 hours</strong>. 📧`},
        {k:['thanks','thank','great','perfect','awesome','brilliant'],a:`Glad I could help! 😊 Any other questions? I'm right here.`},
        {k:['terms','terms of service','legal'],a:`Find our <a href="${r('terms.html')}">Terms of Service</a> here.`},
        {k:['blog','guide','article','tips','advice'],a:`Browse our <a href="${b('index.html')}">Blog</a> — guides on applications, professions, cantons and more.`},
        {k:['community','forum','other students','chat'],a:`The <a href="${r('community.html')}">Community</a> is where students share tips and support each other.`},
        {k:['not working','broken','error','bug','problem','loading','issue'],a:`Sorry to hear that! Write to <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> with a short description — we'll fix it right away.`},
      ]
    };
  }

  const QUICK = {
    de:['Ist es kostenlos?','Wie funktioniert die KI?','Wo finde ich Stellen?','Kontakt'],
    en:['Is it free?','How does the AI work?','Where do I find positions?','Contact']
  };
  const QUICK_KEYS = {
    de:['kostenlos','ki','stellen','kontakt'],
    en:['free','ai','find','contact']
  };

  const CHAT_API = 'https://app.blitzbewerbung.ch/api/chat';

  /* ── CSS ─────────────────────────────────────────────────────────────── */
  const css = `
#chatbot-wrap{position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:'Inter',sans-serif}
#chat-toggle{display:flex;align-items:center;gap:8px;padding:12px 20px 12px 16px;border-radius:50px;background:linear-gradient(135deg,#7b9fff,#3a5ce0);color:#fff;border:none;cursor:pointer;font-weight:700;font-size:14px;box-shadow:0 4px 24px rgba(91,127,255,0.45);transition:transform .2s,box-shadow .2s;position:relative;animation:cbPulse 3s 2.5s ease infinite}
#chat-toggle:hover{transform:translateY(-2px);box-shadow:0 8px 36px rgba(91,127,255,0.6)}
#chat-toggle svg{width:18px;height:18px;flex-shrink:0}
.cb-label{font-size:13.5px;font-family:'Inter',sans-serif}
.cb-unread{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#f04;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #060609;animation:cbBadge .3s ease}
.cb-unread.hidden{display:none!important}
@keyframes cbPulse{0%,100%{box-shadow:0 4px 24px rgba(91,127,255,0.45),0 0 0 0 rgba(91,127,255,0.35)}60%{box-shadow:0 4px 24px rgba(91,127,255,0.45),0 0 0 10px rgba(91,127,255,0)}}
@keyframes cbBadge{from{transform:scale(0)}to{transform:scale(1)}}
#chat-panel{width:360px;background:#0f0f18;border:1px solid rgba(100,130,255,0.22);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.6),0 0 0 1px rgba(91,127,255,0.08);transform:scale(0.9) translateY(16px);transform-origin:bottom right;opacity:0;pointer-events:none;transition:transform .28s cubic-bezier(.34,1.56,.64,1),opacity .2s ease;max-height:520px}
#chat-panel.cb-open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
.cb-header{display:flex;align-items:center;gap:12px;padding:16px 18px;background:rgba(91,127,255,0.08);border-bottom:1px solid rgba(100,130,255,0.12);flex-shrink:0}
.cb-avatar{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#7b9fff,#3a5ce0);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 14px rgba(91,127,255,0.35)}
.cb-avatar svg{width:18px;height:18px}
.cb-hname{font-weight:700;font-size:14px;color:#f0f0fa;font-family:'Inter',sans-serif}
.cb-hstatus{font-size:11.5px;color:#8888aa;display:flex;align-items:center;gap:5px;margin-top:1px;font-family:'Inter',sans-serif}
.cb-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;flex-shrink:0;animation:cbDotPulse 2s ease infinite}
@keyframes cbDotPulse{0%,100%{opacity:1}50%{opacity:.5}}
.cb-close{margin-left:auto;background:none;border:none;cursor:pointer;color:#4a4a66;padding:4px;border-radius:6px;transition:color .2s,background .2s;display:flex;line-height:1}
.cb-close:hover{color:#f0f0fa;background:rgba(255,255,255,0.07)}
.cb-close svg{width:16px;height:16px}
.cb-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(91,127,255,0.25) transparent}
.cb-msg{display:flex;gap:8px;max-width:90%;animation:cbMsgIn .3s ease}
.cb-msg.bot{align-self:flex-start}
.cb-msg.usr{align-self:flex-end;flex-direction:row-reverse}
@keyframes cbMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.cb-msg-av{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#7b9fff,#3a5ce0);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
.cb-msg-av svg{width:12px;height:12px}
.cb-bubble{padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.55;font-family:'Inter',sans-serif}
.cb-msg.bot .cb-bubble{background:#15151f;border:1px solid rgba(100,130,255,0.12);color:#8888aa;border-radius:4px 14px 14px 14px}
.cb-msg.usr .cb-bubble{background:linear-gradient(135deg,#7b9fff,#3a5ce0);color:#fff;border-radius:14px 4px 14px 14px}
.cb-bubble a{color:#a0b0ff;text-decoration:underline}
.cb-msg.usr .cb-bubble a{color:rgba(255,255,255,0.85)}
.cb-bubble strong{color:#f0f0fa}
.cb-msg.usr .cb-bubble strong{color:#fff}
.cb-typing{display:flex;align-items:center;gap:4px;padding:12px 14px}
.cb-tdot{width:7px;height:7px;border-radius:50%;background:#4a4a66;animation:cbBounce 1.2s ease infinite}
.cb-tdot:nth-child(2){animation-delay:.2s}
.cb-tdot:nth-child(3){animation-delay:.4s}
@keyframes cbBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
.cb-chips{padding:0 12px 10px;display:flex;flex-wrap:wrap;gap:6px;flex-shrink:0}
.cb-chip{padding:6px 13px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(91,127,255,0.1);border:1px solid rgba(91,127,255,0.25);color:#a0b0ff;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;white-space:nowrap}
.cb-chip:hover{background:rgba(91,127,255,0.2);border-color:rgba(91,127,255,0.5);transform:translateY(-1px)}
.cb-input-row{display:flex;align-items:center;gap:8px;padding:12px 14px;border-top:1px solid rgba(100,130,255,0.12);flex-shrink:0}
.cb-input{flex:1;padding:10px 14px;border-radius:10px;background:#060609;border:1px solid rgba(100,130,255,0.22);color:#f0f0fa;font-size:13.5px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s}
.cb-input:focus{border-color:rgba(91,127,255,0.45)}
.cb-input::placeholder{color:#4a4a66}
.cb-send{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#7b9fff,#3a5ce0);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;transition:all .2s;box-shadow:0 0 14px rgba(91,127,255,0.35)}
.cb-send:hover{transform:scale(1.08);box-shadow:0 0 24px rgba(91,127,255,0.5)}
.cb-send svg{width:15px;height:15px}
@media(max-width:500px){#chatbot-wrap{bottom:16px;right:16px}#chat-panel{width:calc(100vw - 32px);max-height:460px}}
`;

  /* ── Inject styles ───────────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── Inject HTML ─────────────────────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.id = 'chatbot-wrap';
  wrap.innerHTML = `
    <button id="chat-toggle" onclick="window._cb.toggle()" aria-label="Chat">
      <span id="cb-icon-open"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
      <span id="cb-icon-close" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
      <span class="cb-label" id="cb-label">Hilfe?</span>
      <span class="cb-unread" id="cb-unread">1</span>
    </button>
    <div id="chat-panel">
      <div class="cb-header">
        <div class="cb-avatar"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/></svg></div>
        <div>
          <div class="cb-hname">Blitz Bot</div>
          <div class="cb-hstatus"><span class="cb-dot"></span><span id="cb-status-txt">Online — antwortet sofort</span></div>
        </div>
        <button class="cb-close" onclick="window._cb.toggle()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="cb-msgs" id="cb-msgs"></div>
      <div class="cb-chips" id="cb-chips"></div>
      <div class="cb-input-row">
        <input class="cb-input" id="cb-inp" placeholder="Frage stellen..." onkeydown="if(event.key==='Enter')window._cb.send()"/>
        <button class="cb-send" onclick="window._cb.send()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  /* ── Logic ───────────────────────────────────────────────────────────── */
  let open = false, initiated = false;
  const SESSION_KEY = 'cb-history';
  const L = () => localStorage.getItem('site-lang') || localStorage.getItem('blog-lang') || 'en';

  function syncLang(){
    const l = L();
    document.getElementById('cb-label').textContent = l==='de' ? 'Hilfe?' : 'Help?';
    document.getElementById('cb-status-txt').textContent = l==='de' ? 'Online — antwortet sofort' : 'Online — replies instantly';
    document.getElementById('cb-inp').placeholder = l==='de' ? 'Frage stellen…' : 'Ask a question…';
  }

  function toggle(){
    open = !open;
    document.getElementById('chat-panel').classList.toggle('cb-open', open);
    document.getElementById('cb-icon-open').style.display = open ? 'none' : '';
    document.getElementById('cb-icon-close').style.display = open ? '' : 'none';
    document.getElementById('cb-unread').classList.add('hidden');
    syncLang();
    if(open && !initiated){ initiated=true; initChat(); }
    if(open) setTimeout(()=>document.getElementById('cb-inp').focus(), 300);
  }

  // Close on outside click
  document.addEventListener('click', function(e){
    if(!open) return;
    const wrap = document.getElementById('chatbot-wrap');
    if(wrap && !wrap.contains(e.target)) toggle();
  });

  function saveHistory(role, html){
    try{
      const h = JSON.parse(sessionStorage.getItem(SESSION_KEY)||'[]');
      h.push({role, html});
      if(h.length > 40) h.splice(0, h.length - 40);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(h));
    }catch(e){}
  }

  function loadHistory(){
    try{
      const h = JSON.parse(sessionStorage.getItem(SESSION_KEY)||'[]');
      const msgs = document.getElementById('cb-msgs');
      h.forEach(({role, html})=>{
        const d = document.createElement('div');
        if(role==='bot'){
          d.className='cb-msg bot';
          d.innerHTML=`<div class="cb-msg-av"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/></svg></div><div class="cb-bubble">${html}</div>`;
        } else {
          d.className='cb-msg usr';
          d.innerHTML=`<div class="cb-bubble">${html}</div>`;
        }
        msgs.appendChild(d);
      });
      scroll();
      return h.length > 0;
    }catch(e){ return false; }
  }

  function initChat(){
    const hasHistory = loadHistory();
    if(hasHistory){ renderChips(); return; }
    const l = L();
    const greet = l==='de'
      ? `Hallo! 👋 Ich bin <strong>Blitz Bot</strong>. Ich beantworte sofort Fragen zu Blitzbewerbung — Suche, Bewerbung, Konto, Datenschutz und mehr.`
      : `Hi! 👋 I'm <strong>Blitz Bot</strong>. I instantly answer questions about Blitzbewerbung — search, applications, account, privacy and more.`;
    saveHistory('bot', greet);
    addBot(greet, 350);
    setTimeout(renderChips, 800);
  }

  function renderChips(){
    const l = L();
    const el = document.getElementById('cb-chips');
    el.innerHTML = '';
    QUICK[l].forEach((label,i)=>{
      const btn = document.createElement('button');
      btn.className = 'cb-chip';
      btn.textContent = label;
      btn.onclick = ()=>{
        addUsr(label);
        el.innerHTML='';
        const ans = findAns(QUICK_KEYS[l][i]);
        addBot(ans, 650);
      };
      el.appendChild(btn);
    });
  }

  async function askGemini(text){
    const res = await fetch(CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    if(!res.ok) throw new Error('Chat API ' + res.status);
    const data = await res.json();
    if(!data.reply) throw new Error('empty');
    return data.reply;
  }

  async function addBotAI(promise){
    const msgs = document.getElementById('cb-msgs');
    const t = document.createElement('div');
    t.className='cb-msg bot';
    t.innerHTML=`<div class="cb-msg-av"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/></svg></div><div class="cb-bubble"><div class="cb-typing"><span class="cb-tdot"></span><span class="cb-tdot"></span><span class="cb-tdot"></span></div></div>`;
    msgs.appendChild(t); scroll();
    try{
      const raw = await promise;
      t.remove();
      const safeHtml = esc(raw).replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
      const d = document.createElement('div');
      d.className='cb-msg bot';
      d.innerHTML=`<div class="cb-msg-av"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/></svg></div><div class="cb-bubble">${safeHtml}</div>`;
      msgs.appendChild(d);
      saveHistory('bot', safeHtml);
      scroll();
    }catch(e){
      t.remove();
      const l=L();
      const fallback = l==='de'
        ? `Entschuldigung, ich konnte diese Frage gerade nicht beantworten. Schreib uns direkt: <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> 📧`
        : `Sorry, I couldn't answer that right now. Email us: <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> 📧`;
      addBot(fallback, 0);
    }
  }

  async function send(){
    const inp = document.getElementById('cb-inp');
    const val = inp.value.trim();
    if(!val) return;
    inp.value = '';
    inp.disabled = true;
    document.getElementById('cb-chips').innerHTML = '';
    addUsr(val);
    const kwAns = findAns(val);
    // Only call Gemini for the generic "no answer" fallback — identified by "24h" (the contact KB uses "24 Stunden"/"24 hours")
    const isGenericFallback = kwAns.includes('24h') && kwAns.includes('mailto:hallo@blitzbewerbung.ch');
    if(isGenericFallback){
      addBotAI(askGemini(val));
    } else {
      addBot(kwAns, 750);
    }
    inp.disabled = false;
  }

  function findAns(text){
    const l = L();
    const t = text.toLowerCase();
    const kb = KB()[l];
    for(const e of kb){ if(e.k.some(k=>t.includes(k))) return e.a; }
    return l==='de'
      ? `Gute Frage! Dazu habe ich leider keine Antwort. Schreib uns direkt an <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> — wir helfen innerhalb von 24h. 📧`
      : `Good question! I don't have an answer for that. Write to <a href="mailto:hallo@blitzbewerbung.ch">hallo@blitzbewerbung.ch</a> — we reply within 24h. 📧`;
  }

  function addUsr(text){
    const d = document.createElement('div');
    d.className='cb-msg usr';
    d.innerHTML=`<div class="cb-bubble">${esc(text)}</div>`;
    document.getElementById('cb-msgs').appendChild(d);
    saveHistory('usr', esc(text));
    scroll();
  }

  function addBot(html, delay, showChipsAfter){
    const msgs = document.getElementById('cb-msgs');
    const t = document.createElement('div');
    t.className='cb-msg bot';
    t.innerHTML=`<div class="cb-msg-av"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/></svg></div><div class="cb-bubble"><div class="cb-typing"><span class="cb-tdot"></span><span class="cb-tdot"></span><span class="cb-tdot"></span></div></div>`;
    msgs.appendChild(t); scroll();
    setTimeout(()=>{
      t.remove();
      const d = document.createElement('div');
      d.className='cb-msg bot';
      d.innerHTML=`<div class="cb-msg-av"><svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="white"/></svg></div><div class="cb-bubble">${html}</div>`;
      msgs.appendChild(d);
      saveHistory('bot', html);
      scroll();
      if(showChipsAfter) setTimeout(renderChips, 400);
    }, delay||700);
  }

  function scroll(){ const m=document.getElementById('cb-msgs'); setTimeout(()=>m.scrollTop=m.scrollHeight,50); }
  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // sync label on load + whenever lang changes
  document.addEventListener('DOMContentLoaded', syncLang);
  window.addEventListener('storage', e => { if(e.key==='site-lang'||e.key==='blog-lang') syncLang(); });

  window._cb = { toggle, send, syncLang };
})();
