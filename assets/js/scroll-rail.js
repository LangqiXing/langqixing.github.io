/* ==========================================================================
   Scroll progress rail (right-side ink line) + kicker handwriting reveal.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Right-side ink progress rail ------------------------------ */
  function initRail() {
    if (window.innerWidth < 720) return;

    var rail = document.createElement('div');
    rail.className = 'lx-rail';
    rail.innerHTML = '<span class="lx-rail__fill"></span><span class="lx-rail__cap"></span>';
    document.body.appendChild(rail);
    var fill = rail.querySelector('.lx-rail__fill');
    var cap = rail.querySelector('.lx-rail__cap');

    var ticking = false;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0;
      fill.style.transform = 'scaleY(' + pct.toFixed(4) + ')';
      cap.style.transform = 'translateY(' + (pct * 100).toFixed(2) + '%)';
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ---------- Kicker handwriting reveal --------------------------------- */
  function initKickers() {
    var kickers = document.querySelectorAll('.film-kicker');
    if (!kickers.length) return;

    // Prepare each kicker: wrap text in a span we can clip via clip-path.
    // If the kicker already contains nested elements with a lang attribute
    // (the bilingual EN/ZH pairs), don't rewrap — textContent would flatten
    // those into plain text and break the i18n CSS hide rules. Fall back to
    // a simple fade-in for those kickers.
    kickers.forEach(function (k) {
      if (k.classList.contains('lx-handwrite') || k.classList.contains('lx-handwrite--simple')) return;
      if (k.querySelector('[lang]')) {
        k.classList.add('lx-handwrite--simple');
        return;
      }
      var text = k.textContent;
      k.textContent = '';
      var inner = document.createElement('span');
      inner.className = 'lx-handwrite__ink';
      inner.textContent = text;
      k.appendChild(inner);
      k.classList.add('lx-handwrite');
    });

    // Observe only those that actually got a reveal class (handwrite or simple).
    var watched = document.querySelectorAll('.lx-handwrite, .lx-handwrite--simple');

    if (reduce || !('IntersectionObserver' in window)) {
      watched.forEach(function (k) { k.classList.add('is-written'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-written');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    watched.forEach(function (k) { io.observe(k); });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    initRail();
    initKickers();
  });
}());
