/* ==========================================================================
   Beaker scroll-to-top — a small SVG lab beaker in the bottom-right.
   Liquid level inside the beaker rises as you scroll. Click to smooth-
   scroll back to top. Appears after 30% scrolled.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var btn = document.createElement('button');
    btn.className = 'lx-beaker';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = [
      '<svg viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
      '  <defs>',
      '    <clipPath id="lx-beaker-clip">',
      '      <path d="M14 22 L14 56 Q14 64, 22 64 L42 64 Q50 64, 50 56 L50 22 Z"/>',
      '    </clipPath>',
      '    <linearGradient id="lx-beaker-liquid" x1="0" y1="0" x2="0" y2="1">',
      '      <stop offset="0%" stop-color="#2f7d7a" stop-opacity="0.95"/>',
      '      <stop offset="100%" stop-color="#1f5f5d" stop-opacity="0.95"/>',
      '    </linearGradient>',
      '  </defs>',
      '  <g clip-path="url(#lx-beaker-clip)">',
      '    <rect class="lx-beaker__liquid" x="0" y="80" width="64" height="80" fill="url(#lx-beaker-liquid)"/>',
      // Bubbles
      '    <g class="lx-beaker__bubbles">',
      '      <circle class="lx-beaker__bubble" cx="22" cy="80" r="1.5" fill="rgba(255,255,255,0.65)"/>',
      '      <circle class="lx-beaker__bubble" cx="32" cy="80" r="1.2" fill="rgba(255,255,255,0.55)"/>',
      '      <circle class="lx-beaker__bubble" cx="42" cy="80" r="1.8" fill="rgba(255,255,255,0.55)"/>',
      '    </g>',
      '  </g>',
      // Beaker glass walls
      '  <path d="M14 22 L14 56 Q14 64, 22 64 L42 64 Q50 64, 50 56 L50 22"',
      '        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      // Top rim
      '  <path d="M10 22 L54 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      // Spout
      '  <path d="M50 22 L58 18 L56 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      // Volume marks
      '  <g stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.5">',
      '    <line x1="14" y1="34" x2="20" y2="34"/>',
      '    <line x1="14" y1="44" x2="18" y2="44"/>',
      '    <line x1="14" y1="54" x2="20" y2="54"/>',
      '  </g>',
      // Up-arrow inside the beaker (subtle)
      '  <path class="lx-beaker__arrow" d="M32 60 L32 38 M24 46 L32 38 L40 46"',
      '        fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
      '</svg>'
    ].join('');
    document.body.appendChild(btn);

    var liquid = btn.querySelector('.lx-beaker__liquid');
    var bubbles = btn.querySelectorAll('.lx-beaker__bubble');

    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? h.scrollTop / max : 0;
      pct = Math.max(0, Math.min(1, pct));
      // Beaker liquid container is clipped to y=22..64 (inner height ~42px).
      // We map pct [0..1] to translateY [42..0].
      var ty = 42 * (1 - pct);
      liquid.setAttribute('y', (22 + ty).toFixed(1));
      liquid.setAttribute('height', (42 - ty).toFixed(1));
      // Show only after 30% scroll
      if (pct > 0.30) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
      // When near top, hide.
      if (pct < 0.04) btn.classList.remove('is-visible');
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Bubble animation — drift up + reset.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var startTimes = Array.prototype.map.call(bubbles, function () {
        return performance.now() + Math.random() * 1800;
      });
      function bubbleTick(now) {
        bubbles.forEach(function (b, i) {
          var t = (now - startTimes[i]) * 0.0008;   // cycles every ~1.25s
          var phase = t % 1;
          // Bubble Y: starts at liquid top (read current y of rect), travels up by 30px.
          var liquidTop = parseFloat(liquid.getAttribute('y'));
          var by = liquidTop + 30 * (1 - phase) - 4;
          // Hide if liquid below this point hasn't risen yet
          var visible = liquidTop < 60 && phase < 0.92;
          b.setAttribute('cy', by.toFixed(1));
          b.setAttribute('opacity', visible ? (0.6 - phase * 0.55).toFixed(2) : '0');
        });
        requestAnimationFrame(bubbleTick);
      }
      requestAnimationFrame(bubbleTick);
    }
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
