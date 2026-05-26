(function(){
  'use strict';

  // ── Reading progress bar ─────────────────────────────────────────────────
  var bar = document.createElement('div');
  bar.id = 'read-progress';
  document.body.appendChild(bar);

  // ── Back-to-top button ───────────────────────────────────────────────────
  var topBtn = document.createElement('button');
  topBtn.id = 'back-to-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  topBtn.onclick = function(){ window.scrollTo({top:0, behavior:'smooth'}); };
  document.body.appendChild(topBtn);

  // ── Scroll handler ───────────────────────────────────────────────────────
  window.addEventListener('scroll', function(){
    var d = document.documentElement;
    var pct = d.scrollTop / (d.scrollHeight - d.clientHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
    topBtn.classList.toggle('visible', d.scrollTop > 400);
  }, {passive:true});
})();
