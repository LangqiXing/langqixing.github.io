/* ==========================================================================
   Counters — count-up animation on viewport entry for [data-counter].
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var nodes = document.querySelectorAll('[data-counter]');
    if (!nodes.length) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(el) {
      var target = parseFloat(el.dataset.counter);
      if (isNaN(target)) return;
      if (reduce) { el.textContent = String(target); return; }

      var duration = 1100 + Math.random() * 400;
      var start = performance.now();
      var from = 0;
      var prefix = el.dataset.counterPrefix || '';
      var suffix = el.dataset.counterSuffix || '';

      function tick(now) {
        var t = Math.min(1, (now - start) / duration);
        // Ease-out cubic for a satisfying snap at the end.
        var eased = 1 - Math.pow(1 - t, 3);
        var val = from + (target - from) * eased;
        // Show integers if target is whole, else 1 decimal.
        var s = (target % 1 === 0) ? Math.floor(val).toString() : val.toFixed(1);
        el.textContent = prefix + s + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
