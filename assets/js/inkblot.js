/* ==========================================================================
   Click inkblot — emits a small irregular ink shape at the click point
   that grows + fades. Doesn't prevent default click behavior.
   Throttled so rapid clicks don't spam the screen.
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var COLORS = [
    'rgba(31,42,48,0.62)',     // ink
    'rgba(47,125,122,0.55)',   // teal
    'rgba(201,84,63,0.55)',    // coral
    'rgba(182,137,44,0.55)'    // gold
  ];

  var lastTime = 0;
  var MIN_INTERVAL = 90;   // ms — minimum gap between blots

  // Build one irregular blob SVG: rough polygon with N points perturbed by noise.
  function makeBlot(x, y) {
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];
    var r = 14 + Math.random() * 10;   // base radius
    var points = 11 + Math.floor(Math.random() * 4);
    var verts = [];
    for (var i = 0; i < points; i++) {
      var theta = (i / points) * Math.PI * 2;
      var jitter = 0.6 + Math.random() * 0.9; // 0.6..1.5
      var px = Math.cos(theta) * r * jitter;
      var py = Math.sin(theta) * r * jitter;
      verts.push(px.toFixed(2) + ',' + py.toFixed(2));
    }

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '-30 -30 60 60');
    svg.setAttribute('width', '80');
    svg.setAttribute('height', '80');
    svg.classList.add('lx-blot');

    var poly = document.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', verts.join(' '));
    poly.setAttribute('fill', color);
    svg.appendChild(poly);

    // A few smaller satellite dots around the main blot.
    var sats = 2 + Math.floor(Math.random() * 3);
    for (var s = 0; s < sats; s++) {
      var sa = Math.random() * Math.PI * 2;
      var sd = r * (1.1 + Math.random() * 0.8);
      var dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', (Math.cos(sa) * sd).toFixed(2));
      dot.setAttribute('cy', (Math.sin(sa) * sd).toFixed(2));
      dot.setAttribute('r', (1 + Math.random() * 2.4).toFixed(2));
      dot.setAttribute('fill', color);
      svg.appendChild(dot);
    }

    svg.style.cssText = [
      'position:fixed',
      'left:' + (x - 40) + 'px',
      'top:' + (y - 40) + 'px',
      'pointer-events:none',
      'z-index:997',
      'mix-blend-mode:multiply',
      'transform:scale(0.4) rotate(' + (Math.random() * 360) + 'deg)',
      'opacity:0.95',
      'transition:transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1),' +
                ' opacity 0.7s ease-out 0.1s'
    ].join(';');

    document.documentElement.appendChild(svg);
    requestAnimationFrame(function () {
      var s = 1 + Math.random() * 0.5;
      svg.style.transform = 'scale(' + s.toFixed(2) + ') rotate(' + (Math.random() * 360) + 'deg)';
      svg.style.opacity = '0';
    });
    setTimeout(function () { if (svg.parentNode) svg.parentNode.removeChild(svg); }, 900);
  }

  function onClick(e) {
    // Skip clicks inside lightbox / splash / the toggle buttons — those have
    // their own visual feedback.
    if (e.target.closest && e.target.closest('.lx-lightbox, .lx-splash, .theme-toggle, .lang-toggle')) return;
    var now = performance.now();
    if (now - lastTime < MIN_INTERVAL) return;
    lastTime = now;
    makeBlot(e.clientX, e.clientY);
  }

  // Use pointerdown so we react to the click point even before mouseup.
  window.addEventListener('pointerdown', onClick, { passive: true });

  // Re-sync blend on theme change so blots still read on dark canvas.
  function syncBlend() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('.lx-blot').forEach(function (el) {
      el.style.mixBlendMode = dark ? 'screen' : 'multiply';
    });
  }
  new MutationObserver(syncBlend).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}());
