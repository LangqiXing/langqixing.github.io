/* ==========================================================================
   Cursor halo — a soft glowing circle following the pointer that swells
   and shifts color when over interactive elements (links, buttons, frames).
   Sits BELOW the ink-cursor in z-order, so the ink line still reads.
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.innerWidth < 720) return;

  var halo = document.createElement('div');
  halo.id = 'lx-cursor-halo';
  halo.style.cssText = [
    'position:fixed', 'top:0', 'left:0',
    'width:42px', 'height:42px',
    'border-radius:50%',
    'pointer-events:none',
    'z-index:996',
    'transform:translate(-50%, -50%)',
    'mix-blend-mode:multiply',
    'transition:width 0.32s cubic-bezier(0.2, 0.7, 0.2, 1),' +
              ' height 0.32s cubic-bezier(0.2, 0.7, 0.2, 1),' +
              ' background 0.28s ease,' +
              ' opacity 0.3s ease',
    'background:radial-gradient(circle, rgba(47,125,122,0.28) 0%, rgba(47,125,122,0.10) 45%, rgba(47,125,122,0) 70%)',
    'opacity:0'
  ].join(';');
  document.documentElement.appendChild(halo);

  var x = 0, y = 0, tx = 0, ty = 0, raf = 0;
  var visible = false;

  function tick() {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    halo.style.left = x + 'px';
    halo.style.top = y + 'px';
    if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  }
  function ensureLoop() { if (!raf) raf = requestAnimationFrame(tick); }

  function isInteractive(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el.matches && el.matches('a, button, [role="button"], .film-frame, .pub__link, .music-link, .music-genre__launcher, .gallery-tab, .music-tab, .dead-end__back, .lang-toggle, .theme-toggle, .trail-stop__dot, input, textarea, select')) {
      return true;
    }
    return isInteractive(el.parentElement);
  }

  function applyMode(over) {
    if (over) {
      halo.style.width = '78px';
      halo.style.height = '78px';
      halo.style.background = 'radial-gradient(circle, rgba(201,84,63,0.30) 0%, rgba(201,84,63,0.12) 45%, rgba(201,84,63,0) 72%)';
    } else {
      halo.style.width = '42px';
      halo.style.height = '42px';
      halo.style.background = 'radial-gradient(circle, rgba(47,125,122,0.26) 0%, rgba(47,125,122,0.10) 45%, rgba(47,125,122,0) 70%)';
    }
  }

  var lastOver = null;
  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!visible) {
      halo.style.opacity = '1';
      x = tx; y = ty; // jump to first position to avoid sweep-in artifact
      visible = true;
    }
    ensureLoop();

    var over = isInteractive(e.target);
    if (over !== lastOver) {
      applyMode(over);
      lastOver = over;
    }
  }
  function onLeave() {
    halo.style.opacity = '0';
    visible = false;
  }

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', onLeave);
  document.addEventListener('mouseleave', onLeave);

  // In dark mode, switch to screen blend so the halo lifts pixels instead.
  function syncBlend() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    halo.style.mixBlendMode = dark ? 'screen' : 'multiply';
  }
  syncBlend();
  new MutationObserver(syncBlend).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Hide while lightbox or splash is on — they have their own visual focus.
  function syncHidden() {
    var hidden = document.documentElement.classList.contains('lx-lightbox-on') ||
                 document.documentElement.classList.contains('lx-splash-on');
    halo.style.display = hidden ? 'none' : 'block';
  }
  new MutationObserver(syncHidden).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}());
