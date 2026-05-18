/* ==========================================================================
   Langqi custom interactions
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal --------------------------------------------- */
  function autoTagSections() {
    // Auto-add reveal hooks to markdown-generated sections we can't edit inline.
    var ids = ['news', 'selected-experience'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.setAttribute('data-reveal', '');
      // Tag the immediate sibling block that visually belongs to the heading.
      var sib = el.nextElementSibling;
      while (sib && (sib.tagName === 'P' || sib.tagName === 'UL' ||
        sib.tagName === 'H2' || sib.tagName === 'TABLE')) {
        sib.setAttribute('data-reveal', '');
        // Stop at next h1.
        sib = sib.nextElementSibling;
        if (sib && sib.tagName === 'H1') break;
      }
    });

    // Tag every h2 under page content for staggered section reveal.
    var subs = document.querySelectorAll('.page__content h2, .archive h2');
    subs.forEach(function (h) { h.setAttribute('data-reveal', ''); });

    // Tag film frames individually for nice cascading reveal.
    var frames = document.querySelectorAll('.film-frame');
    frames.forEach(function (f) { f.setAttribute('data-reveal', ''); });
  }

  function initReveal() {
    autoTagSections();
    var nodes = document.querySelectorAll('[data-reveal]');
    if (!nodes.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    nodes.forEach(function (n, i) {
      n.style.setProperty('--reveal-delay', (i % 6) * 60 + 'ms');
      io.observe(n);
    });
  }

  /* ---------- Gallery tab navigation ------------------------------------ */
  function initGalleryTabs() {
    var tabs = document.querySelectorAll('.gallery-tab');
    if (!tabs.length) return;

    function activate(target) {
      tabs.forEach(function (t) {
        t.classList.toggle('is-active', t.dataset.tab === target);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.dataset.tab);
      });
    });

    // Highlight tab matching the section currently in view.
    var sections = document.querySelectorAll('.gallery-section');
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          activate(entry.target.id);
        }
      });
    }, { threshold: [0.2, 0.5] });

    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- Home hero photo backdrop ---------------------------------- */
  function initHeroBackdrop() {
    var hero = document.querySelector('.home-intro');
    if (!hero) return;

    // 4 slides chosen from the film roll; loop with a slow crossfade.
    var slides = [3, 8, 14, 22, 27].map(function (n) {
      var pad = n < 10 ? '0' + n : '' + n;
      return '/images/film/slide-' + pad + '.jpg';
    });

    var backdrop = document.createElement('div');
    backdrop.className = 'home-intro__backdrop';
    hero.insertBefore(backdrop, hero.firstChild);

    slides.forEach(function (src, i) {
      var layer = document.createElement('div');
      layer.className = 'home-intro__backdrop-layer' + (i === 0 ? ' is-active' : '');
      layer.style.backgroundImage = 'url(' + src + ')';
      backdrop.appendChild(layer);
    });

    if (prefersReducedMotion) return;

    var idx = 0;
    var layers = backdrop.querySelectorAll('.home-intro__backdrop-layer');
    setInterval(function () {
      layers[idx].classList.remove('is-active');
      idx = (idx + 1) % layers.length;
      layers[idx].classList.add('is-active');
    }, 6500);
  }

  /* ---------- Film strip marquee --------------------------------------- */
  function initMarquee() {
    var host = document.querySelector('[data-marquee]');
    if (!host) return;

    var slides = host.querySelectorAll('.marquee-frame');
    if (!slides.length) return;

    // Duplicate the strip once so the CSS animation can loop seamlessly.
    var track = host.querySelector('.marquee-track');
    if (!track) return;
    track.innerHTML += track.innerHTML;
  }

  /* ---------- Init ------------------------------------------------------ */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initReveal();
    initGalleryTabs();
    initHeroBackdrop();
    initMarquee();
  });
}());
