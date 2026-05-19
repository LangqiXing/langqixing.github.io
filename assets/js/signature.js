/* ==========================================================================
   Footer LX signature — draws itself the first time the footer scrolls
   into view, then stays inked. Once-per-page-load.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var sign = document.querySelector('[data-reveal-sign]');
    if (!sign) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var strokes = sign.querySelectorAll('.lx-sign__stroke');
    if (!strokes.length) return;

    // Measure each path so the dasharray exactly matches its length.
    strokes.forEach(function (path) {
      try {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
      } catch (e) {}
    });

    function reveal() {
      sign.classList.add('is-inked');
    }

    if (reduce || !('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          reveal();
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.3 });
    io.observe(sign);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
