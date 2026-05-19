/* ==========================================================================
   Cursor-physics interactions: magnetic links + 3D card tilt.
   Skipped on touch / reduce-motion / small screens.
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 720) return;

  /* ---------- Magnetic nav links ---------------------------------------- */
  function initMagnetic() {
    var nodes = document.querySelectorAll('.masthead__menu-item > a');
    var STRENGTH = 0.32;   // 0..1, how much the link follows the cursor
    var RADIUS = 80;       // px from link center where the magnet activates
    var ease = 0.18;       // lerp speed back to rest

    nodes.forEach(function (link) {
      var state = { x: 0, y: 0, tx: 0, ty: 0, raf: 0, active: false };
      link.style.willChange = 'transform';
      link.style.transition = 'transform 0.18s cubic-bezier(0.2, 0.7, 0.2, 1)';

      function tick() {
        state.x += (state.tx - state.x) * ease;
        state.y += (state.ty - state.y) * ease;
        link.style.transform = 'translate(' + state.x.toFixed(2) + 'px, ' + state.y.toFixed(2) + 'px)';
        if (Math.abs(state.tx - state.x) > 0.05 || Math.abs(state.ty - state.y) > 0.05) {
          state.raf = requestAnimationFrame(tick);
        } else {
          state.raf = 0;
        }
      }
      function ensureLoop() {
        if (!state.raf) state.raf = requestAnimationFrame(tick);
      }

      function onMove(e) {
        var r = link.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.hypot(dx, dy);
        if (dist < RADIUS) {
          state.tx = dx * STRENGTH;
          state.ty = dy * STRENGTH * 0.65;
          state.active = true;
          ensureLoop();
        } else if (state.active) {
          state.tx = 0;
          state.ty = 0;
          state.active = false;
          ensureLoop();
        }
      }
      function onLeave() {
        if (state.active) {
          state.tx = 0;
          state.ty = 0;
          state.active = false;
          ensureLoop();
        }
      }

      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('blur', onLeave);
    });
  }

  /* ---------- 3D photo tilt --------------------------------------------- */
  function initTilt() {
    var targets = document.querySelectorAll('[data-tilt]');
    // Always auto-tag the home-intro photo so its tilt picks up the larger
    // parent (.home-intro) zone. data-tilt-zone="parent" preserves the
    // original behavior even when other cards are in the [data-tilt] set.
    var photo = document.querySelector('.home-intro__photo');
    if (photo && !photo.hasAttribute('data-tilt')) {
      photo.setAttribute('data-tilt', '');
      photo.setAttribute('data-tilt-zone', 'parent');
      targets = document.querySelectorAll('[data-tilt]');
    }

    targets.forEach(function (el) {
      var parent = el.parentElement;
      var img = el.querySelector('img');
      var MAX = parseFloat(el.dataset.tiltMax) ||
                (el.dataset.tiltZone === 'parent' ? 9 : 5);
      var GLARE = parseFloat(el.dataset.tiltGlare) ||
                  (el.dataset.tiltZone === 'parent' ? 0.28 : 0.16);
      var state = { rx: 0, ry: 0, tx: 0, ty: 0, gx: 50, gy: 50, ga: 0, gaT: 0, raf: 0 };

      el.style.willChange = 'transform';
      if (img) {
        img.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1)';
      }

      // Glare layer — adds the feeling of a real glossy surface.
      var glare = document.createElement('div');
      glare.className = 'lx-tilt-glare';
      glare.style.cssText = [
        'position:absolute', 'inset:0',
        'pointer-events:none', 'border-radius:inherit',
        'mix-blend-mode:soft-light',
        'opacity:0', 'transition:opacity 0.32s ease',
        'background:radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95), rgba(255,255,255,0) 55%)'
      ].join(';');
      // Make sure tilt host can position glare.
      var existingPos = window.getComputedStyle(el).position;
      if (existingPos === 'static') el.style.position = 'relative';
      el.appendChild(glare);

      function tick() {
        state.rx += (state.tx - state.rx) * 0.18;
        state.ry += (state.ty - state.ry) * 0.18;
        state.ga += (state.gaT - state.ga) * 0.16;

        el.style.transform = 'perspective(900px) rotateX(' + state.rx.toFixed(2) + 'deg) rotateY(' + state.ry.toFixed(2) + 'deg)';
        glare.style.opacity = state.ga.toFixed(3);
        glare.style.backgroundPosition = state.gx + '% ' + state.gy + '%';

        if (Math.abs(state.tx - state.rx) > 0.03 ||
            Math.abs(state.ty - state.ry) > 0.03 ||
            Math.abs(state.gaT - state.ga) > 0.003) {
          state.raf = requestAnimationFrame(tick);
        } else {
          state.raf = 0;
          // When settled at rest, hand the transform back to CSS so any
          // static rotation (e.g. .home-intro__photo's rotate(1.2deg)) returns.
          if (state.tx === 0 && state.ty === 0 && state.gaT === 0) {
            el.style.transform = '';
            glare.style.opacity = '0';
          }
        }
      }
      function ensureLoop() { if (!state.raf) state.raf = requestAnimationFrame(tick); }

      function onMove(e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1
        var py = (e.clientY - r.top) / r.height;   // 0..1
        state.tx = (0.5 - py) * MAX;
        state.ty = (px - 0.5) * MAX;
        state.gx = px * 100;
        state.gy = py * 100;
        state.gaT = GLARE;
        ensureLoop();
      }
      function onLeave() {
        state.tx = 0;
        state.ty = 0;
        state.gaT = 0;
        ensureLoop();
      }

      // For grid cards (pub / art / music-artist), listen on the element
      // itself so neighboring cards don't all tilt together. For the
      // home-intro photo we keep the larger parent zone by opting in.
      var zone = el.dataset.tiltZone === 'parent' ? (parent || el) : el;
      zone.addEventListener('mousemove', onMove, { passive: true });
      zone.addEventListener('mouseleave', onLeave);
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    initMagnetic();
    initTilt();
  });
}());
