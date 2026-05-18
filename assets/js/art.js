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

  /* ---------- Career trail ------------------------------------------ */
  function initTrail() {
    var trail = document.querySelector('[data-trail]');
    if (!trail) return;

    var stops = trail.querySelectorAll('[data-stop]');
    if (!stops.length) return;

    // Toggle expanded state on dot click.
    stops.forEach(function (stop) {
      var dot = stop.querySelector('.trail-stop__dot');
      if (!dot) return;
      dot.addEventListener('click', function () {
        var willOpen = !stop.classList.contains('is-open');
        // Close others first for a cleaner interaction.
        stops.forEach(function (s) {
          s.classList.remove('is-open');
          var d = s.querySelector('.trail-stop__dot');
          if (d) d.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          stop.classList.add('is-open');
          dot.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // Animate the teal "progress" path as the section scrolls into view.
    var fillPath = trail.querySelector('.trail__path-fill');
    if (!fillPath || prefersReducedMotion || !('IntersectionObserver' in window)) {
      if (fillPath) fillPath.style.strokeDasharray = 'none';
      return;
    }
    var len = fillPath.getTotalLength();
    fillPath.style.strokeDasharray = len;
    fillPath.style.strokeDashoffset = len;

    function updateFill() {
      var rect = trail.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.85;
      var end = vh * 0.25;
      var t = (start - rect.top) / (start - end);
      t = Math.max(0, Math.min(1, t));
      fillPath.style.strokeDashoffset = len * (1 - t);
    }

    var ticking = false;
    function onScrollFill() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateFill();
        ticking = false;
      });
    }

    updateFill();
    window.addEventListener('scroll', onScrollFill, { passive: true });
    window.addEventListener('resize', onScrollFill);
  }

  /* ---------- Splash entrance --------------------------------------- */
  function initSplash() {
    var splash = document.getElementById('lx-splash');
    if (!splash) return;

    // Skip if already shown in this session or user prefers reduced motion.
    var SEEN_KEY = 'lx-splash-seen-v1';
    var seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}

    if (seen || prefersReducedMotion) {
      splash.parentNode.removeChild(splash);
      return;
    }

    // Show
    splash.hidden = false;
    splash.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lx-splash-on');
    requestAnimationFrame(function () {
      splash.classList.add('is-in');
    });

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      splash.classList.remove('is-in');
      splash.classList.add('is-out');
      document.documentElement.classList.remove('lx-splash-on');
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
      setTimeout(function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('wheel', dismiss, { passive: true });
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('touchstart', dismiss, { passive: true });
      }, 700);
    }

    function onScroll() { dismiss(); }
    function onKey(e) {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') dismiss();
    }

    splash.addEventListener('click', dismiss);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('wheel', dismiss, { passive: true });
    window.addEventListener('touchstart', dismiss, { passive: true });
    window.addEventListener('keydown', onKey);

    // Auto-dismiss after the drawing finishes
    setTimeout(dismiss, 4200);
  }

  ready(function () {
    initSplash();
    initReveal();
    initGalleryTabs();
    initHeroBackdrop();
    initMarquee();
    initTrail();
  });
}());
