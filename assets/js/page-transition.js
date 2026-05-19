/* ==========================================================================
   Page transition — intercept internal link clicks, run a quick ink sweep
   over the page, then navigate. On the new page, the overlay slides off.
   Skipped on touch + reduce-motion + keyboard modifier clicks.
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Build the overlay once and keep it persistent in the body.
  var overlay = document.createElement('div');
  overlay.className = 'lx-page-wipe';
  overlay.innerHTML = '<div class="lx-page-wipe__ink"></div>';
  document.body.appendChild(overlay);

  // Phase 1: on initial load, the page might have just been navigated TO.
  // If a sessionStorage flag was set on the OUT phase, run the IN sweep.
  try {
    if (sessionStorage.getItem('lx-wipe-in') === '1') {
      sessionStorage.removeItem('lx-wipe-in');
      overlay.classList.add('is-covering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.classList.add('is-leaving');
          overlay.classList.remove('is-covering');
          setTimeout(function () {
            overlay.classList.remove('is-leaving');
          }, 600);
        });
      });
    }
  } catch (e) {}

  function shouldIntercept(a, e) {
    if (!a) return false;
    if (e.defaultPrevented) return false;
    if (e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    var href = a.getAttribute('href');
    if (!href) return false;
    // Internal only — same origin, no protocol or starts with /.
    if (/^https?:\/\//.test(href)) {
      try {
        var u = new URL(href);
        if (u.origin !== window.location.origin) return false;
      } catch (er) { return false; }
    }
    // No-op for pure hashes (same-page anchors).
    if (href.indexOf('#') === 0) return false;
    // Skip downloads / new tabs.
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    // Skip when href matches the current path (no real navigation).
    try {
      var dest = new URL(href, window.location.href);
      if (dest.pathname === window.location.pathname && dest.search === window.location.search) return false;
    } catch (er) {}
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!shouldIntercept(a, e)) return;
    e.preventDefault();
    overlay.classList.remove('is-leaving');
    overlay.classList.add('is-covering');
    var dest = a.href;
    try { sessionStorage.setItem('lx-wipe-in', '1'); } catch (er) {}
    setTimeout(function () {
      window.location.href = dest;
    }, 360);
  });

  // Catch back/forward — pageshow runs even on bfcache restores.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      overlay.classList.remove('is-covering', 'is-leaving');
    }
  });
}());
