(function(){
  'use strict';
  if(localStorage.getItem('cookie-consent')) return;

  const inBlog = /\/blog\//.test(window.location.pathname);
  const base   = inBlog ? '../' : '';

  const css = `
#ck-banner{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(120px);
  z-index:9998;width:min(600px,calc(100vw - 32px));
  background:#0f0f18;border:1px solid rgba(100,130,255,0.28);
  border-radius:20px;padding:22px 24px;
  box-shadow:0 24px 60px rgba(0,0,0,0.65),0 0 0 1px rgba(91,127,255,0.06),0 0 48px rgba(91,127,255,0.08);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  font-family:'Inter',sans-serif;
  transition:transform .5s cubic-bezier(.34,1.3,.64,1),opacity .4s ease;
  opacity:0;
}
#ck-banner.ck-show{transform:translateX(-50%) translateY(0);opacity:1}
#ck-banner.ck-hide{transform:translateX(-50%) translateY(130px);opacity:0}
.ck-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}
.ck-icon{width:36px;height:36px;background:rgba(91,127,255,0.12);border:1px solid rgba(91,127,255,0.22);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1.1rem}
.ck-text{flex:1}
.ck-title{font-weight:700;font-size:14px;color:#f0f0fa;margin-bottom:5px}
.ck-desc{font-size:12.5px;color:#8888aa;line-height:1.55}
.ck-desc a{color:#a0b0ff;text-decoration:underline}
.ck-btns{display:flex;gap:10px;flex-wrap:wrap}
.ck-accept{padding:10px 22px;border-radius:10px;background:linear-gradient(135deg,#7b9fff,#3a5ce0);color:#fff;font-weight:700;font-size:13px;border:none;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;box-shadow:0 0 20px rgba(91,127,255,0.3)}
.ck-accept:hover{transform:translateY(-1px);box-shadow:0 0 32px rgba(91,127,255,0.5)}
.ck-reject{padding:10px 18px;border-radius:10px;background:transparent;color:#8888aa;font-weight:600;font-size:13px;border:1px solid rgba(100,130,255,0.22);cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.ck-reject:hover{color:#f0f0fa;border-color:rgba(255,255,255,0.28);background:rgba(255,255,255,0.04)}
@media(max-width:500px){#ck-banner{bottom:16px;padding:18px}.ck-btns{flex-direction:column}.ck-accept,.ck-reject{text-align:center}}
`;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const l = localStorage.getItem('site-lang') || localStorage.getItem('blog-lang') || 'en';
  const isDE = l === 'de';

  const banner = document.createElement('div');
  banner.id = 'ck-banner';
  banner.innerHTML = `
    <div class="ck-top">
      <div class="ck-icon">🍪</div>
      <div class="ck-text">
        <div class="ck-title">${isDE ? 'Wir nutzen Cookies' : 'We use cookies'}</div>
        <div class="ck-desc">
          ${isDE
            ? `Wir verwenden notwendige Cookies für die Anmeldung und deine Spracheinstellung sowie Zahlungsverarbeitung über Stripe. Keine Tracking-Cookies ohne deine Zustimmung. Mehr in unserer <a href="${base}privacy.html">Datenschutzerklärung</a>.`
            : `We use essential cookies for login, language preferences and payment processing via Stripe. No tracking cookies without your consent. More in our <a href="${base}privacy.html">Privacy Policy</a>.`
          }
        </div>
      </div>
    </div>
    <div class="ck-btns">
      <button class="ck-accept" id="ck-accept">${isDE ? 'Alle akzeptieren' : 'Accept all'}</button>
      <button class="ck-reject" id="ck-reject">${isDE ? 'Nur notwendige' : 'Essential only'}</button>
    </div>`;

  document.body.appendChild(banner);
  requestAnimationFrame(()=>requestAnimationFrame(()=>banner.classList.add('ck-show')));

  function dismiss(val){
    localStorage.setItem('cookie-consent', val);
    banner.classList.add('ck-hide');
    setTimeout(()=>banner.remove(), 500);
  }

  document.getElementById('ck-accept').onclick = ()=>dismiss('all');
  document.getElementById('ck-reject').onclick = ()=>dismiss('essential');
})();
