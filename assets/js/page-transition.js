/* ==========================================================================
   Page transition — intercept internal link clicks, run a quick ink sweep
   over the page, then navigate. On the new page, the overlay slides off.
   Skipped on touch + reduce-motion + keyboard modifier clicks.
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var html = document.documentElement;

  // Phase IN: on initial load, if the previous page set a flag, the body
  // starts faded/blurred and we let it settle in.
  try {
    if (sessionStorage.getItem('lx-page-in') === '1') {
      sessionStorage.removeItem('lx-page-in');
      html.classList.add('lx-page-entering');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          html.classList.remove('lx-page-entering');
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
    html.classList.add('lx-page-leaving');
    var dest = a.href;
    try { sessionStorage.setItem('lx-page-in', '1'); } catch (er) {}
    // Match the CSS transition duration on .lx-page-leaving (260ms).
    setTimeout(function () {
      window.location.href = dest;
    }, 260);
  });

  // Catch back/forward — pageshow runs even on bfcache restores.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      html.classList.remove('lx-page-entering', 'lx-page-leaving');
    }
  });
}());
