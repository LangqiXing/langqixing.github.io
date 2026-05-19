/* ==========================================================================
   Ink cursor trail — a fading hand-drawn line that follows the pointer.
   Vanilla canvas (no p5.js) to keep this < 2KB and fast.
   ========================================================================== */
(function () {
  'use strict';

  // Bail early on touch-primary devices and reduced-motion users.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 720) return;

  var INK = '31, 42, 48';        // matches $art-ink
  var GOLD = '182, 137, 44';     // $art-gold (subtle highlight every ~8th seg)
  var MAX_POINTS = 22;
  var LIFE = 700;                // ms a stroke is visible

  var canvas = document.createElement('canvas');
  canvas.id = 'lx-ink-cursor';
  canvas.style.cssText = [
    'position:fixed', 'inset:0',
    'pointer-events:none', 'z-index:998',
    'mix-blend-mode:multiply'
  ].join(';');
  document.documentElement.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  var pts = [];
  var lastMoveAt = 0;

  function sizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  sizeCanvas();
  window.addEventListener('resize', function () {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    sizeCanvas();
  });

  function onMove(e) {
    var t = performance.now();
    pts.push({ x: e.clientX, y: e.clientY, t: t });
    if (pts.length > MAX_POINTS) pts.shift();
    lastMoveAt = t;
  }
  window.addEventListener('mousemove', onMove, { passive: true });

  // Hide while a click is happening — the cursor is doing something else then.
  window.addEventListener('mousedown', function () { pts.length = 0; });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var now = performance.now();

    // Pause drawing entirely once idle for >1s — saves battery without
    // having to cancel rAF.
    if (now - lastMoveAt > LIFE + 200 && pts.length === 0) {
      requestAnimationFrame(draw);
      return;
    }

    // Drop expired points.
    while (pts.length && now - pts[0].t > LIFE) pts.shift();

    if (pts.length > 1) {
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1];
        var b = pts[i];
        var age = (now - b.t) / LIFE;        // 0 new → 1 old
        var alpha = (1 - age) * 0.55;
        var width = 1.6 + (1 - age) * 1.4;   // tapers thinner as it ages
        var hue = (i % 8 === 0) ? GOLD : INK;

        ctx.strokeStyle = 'rgba(' + hue + ',' + alpha.toFixed(3) + ')';
        ctx.lineWidth = width;
        ctx.beginPath();
        // Quadratic curve through mid-point for hand-drawn smoothness.
        var mx = (a.x + b.x) / 2;
        var my = (a.y + b.y) / 2;
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(a.x, a.y, mx, my);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}());
