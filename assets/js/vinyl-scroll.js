/* ==========================================================================
   Music page vinyl — JS-driven rotation that responds to scroll velocity.
   Idle baseline ≈ same speed as the old CSS animation (~20 deg/s); fast
   scrolling boosts it up to ~360 deg/s. Returns to baseline when scrolling
   stops. Skipped on reduce-motion (CSS keyframe animation continues then).
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {
    var vinyl = document.querySelector('.music-hero__vinyl');
    if (!vinyl) return;

    // Take over from the CSS keyframe animation.
    vinyl.style.animation = 'none';
    vinyl.style.willChange = 'transform';

    var rotation = 0;            // current accumulated degrees
    var velocity = 0;            // smoothed scroll velocity (px/ms)
    var lastY = window.scrollY;
    var lastT = performance.now();
    var paused = false;

    // Pause when offscreen to save battery.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { paused = !e.isIntersecting; });
      }, { threshold: 0.02 }).observe(vinyl);
    }
    document.addEventListener('visibilitychange', function () {
      // Reset velocity when coming back so we don't get a stale jump.
      if (!document.hidden) { lastT = performance.now(); lastY = window.scrollY; velocity = 0; }
    });

    var BASE = 0.022;            // deg/ms — baseline (≈ 20 deg/s, like the CSS rate)
    var SCROLL_GAIN = 6;         // multiplier on |scroll px/ms| → deg/ms bonus
    var MAX_RATE = 0.8;          // cap deg/ms so it doesn't go ridiculous

    function tick(now) {
      var dt = Math.min(64, now - lastT);  // clamp delta to avoid huge jumps on tab return
      lastT = now;

      if (!paused && !document.hidden) {
        var y = window.scrollY;
        var target = Math.abs(y - lastY) / Math.max(1, dt);  // px / ms
        lastY = y;
        // Lerp velocity toward target — quick to ramp up, slower decay.
        var alpha = target > velocity ? 0.45 : 0.06;
        velocity += (target - velocity) * alpha;

        var rate = Math.min(MAX_RATE, BASE + velocity * SCROLL_GAIN);
        rotation = (rotation + rate * dt) % 360;
        vinyl.style.transform = 'rotate(' + rotation.toFixed(2) + 'deg)';
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
