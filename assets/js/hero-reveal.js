/* ==========================================================================
   Cinematic h1 reveal — split visible page hero h1's into per-character
   spans that slide up + skew on first paint. Different from kicker
   typewriter: this is a slot-machine letter cascade.
   ========================================================================== */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // We only want to split *visible-language* glyphs. Since the page may
  // contain both EN and ZH text inside a single h1 wrapped in <span lang>
  // pairs, we split each lang-span independently.
  function split(node) {
    if (!node || node.dataset.lxSplit) return;
    node.dataset.lxSplit = '1';

    var spans = node.querySelectorAll('span[lang]');
    if (spans.length) {
      spans.forEach(splitText);
    } else {
      splitText(node);
    }
    node.classList.add('lx-hero-letters');
  }

  function splitText(host) {
    var text = host.textContent;
    if (!text) return;
    host.textContent = '';
    var idx = 0;
    var graphemes = Array.from(text);
    graphemes.forEach(function (ch) {
      if (ch === ' ') {
        host.appendChild(document.createTextNode(' '));
        return;
      }
      var span = document.createElement('span');
      span.className = 'lx-letter';
      span.textContent = ch;
      span.style.transitionDelay = (idx * 0.04).toFixed(2) + 's';
      host.appendChild(span);
      idx++;
    });
  }

  function reveal(node) {
    // Defer one frame to allow the initial opacity:0 to land first.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        node.classList.add('is-shown');
      });
    });
  }

  function init() {
    // Page hero h1's — exclude pill-styled kickers and the page__title bubble.
    var heroes = document.querySelectorAll(
      '.film-hero h1, .music-hero__intro h1, .dead-end__title, .trail__header h2'
    );
    heroes.forEach(function (h) {
      split(h);
      // Use IntersectionObserver so off-screen h1s reveal on scroll.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              reveal(entry.target);
              io.unobserve(entry.target);
            }
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
        io.observe(h);
      } else {
        reveal(h);
      }
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
