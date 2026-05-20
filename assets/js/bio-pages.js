/* ==========================================================================
   Bio carousel — newspaper-style pageable widget for the four bio pages
   on the home page. Prev / next buttons, page dots, keyboard arrows when
   focused, and touch swipe. Smoothly slides translateX between pages.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var widget = document.querySelector('[data-bio-pages]');
    if (!widget) return;

    var track = widget.querySelector('.bio-pages__track');
    var pages = widget.querySelectorAll('[data-page]');
    var prevBtn = widget.querySelector('[data-page-prev]');
    var nextBtn = widget.querySelector('[data-page-next]');
    var dots = widget.querySelectorAll('[data-page-dot]');
    var counter = widget.querySelector('[data-page-current]');
    if (!track || !pages.length) return;

    var total = pages.length;
    var current = 0;

    function go(i, fromUser) {
      current = ((i % total) + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === current);
        d.setAttribute('aria-selected', idx === current ? 'true' : 'false');
      });
      if (counter) counter.textContent = (current + 1);
      // Update prev/next disabled state visually (we still wrap on click).
      if (prevBtn) prevBtn.classList.toggle('is-edge', current === 0);
      if (nextBtn) nextBtn.classList.toggle('is-edge', current === total - 1);
      // On programmatic page change after user interaction, briefly focus
      // the new page for screen readers.
      if (fromUser) {
        var page = pages[current];
        if (page && page.focus) {
          page.setAttribute('tabindex', '-1');
          page.focus({ preventScroll: true });
        }
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(current - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(current + 1, true); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        go(parseInt(d.dataset.pageDot, 10), true);
      });
    });

    // Keyboard arrows when focus is inside the widget.
    widget.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1, true); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1, true); }
      else if (e.key === 'Home') { e.preventDefault(); go(0, true); }
      else if (e.key === 'End') { e.preventDefault(); go(total - 1, true); }
    });

    // Touch swipe.
    var touchStartX = 0;
    var touchStartT = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
      touchStartT = performance.now();
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dt = performance.now() - touchStartT;
      // Fast or large swipe → advance one page.
      if (Math.abs(dx) > 50 || (Math.abs(dx) > 20 && dt < 250)) {
        go(current + (dx > 0 ? -1 : 1), true);
      }
    }, { passive: true });

    // Initial state.
    go(0);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
