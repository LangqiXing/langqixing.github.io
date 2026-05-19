/* ==========================================================================
   Heading anchors — hover h2 / h3 in content to reveal a # button that
   copies the section's deep-link URL. Adds id's where missing.
   ========================================================================== */
(function () {
  'use strict';

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s一-鿿-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'lx-toast';
    t.innerHTML = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(function () { t.classList.remove('is-in'); }, 1800);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2400);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject();
  }

  function init() {
    // Target headings inside main content only — skip masthead, splash,
    // lightbox, etc. We pick anything inside .page__content / .archive
    // that's an h2 or h3.
    var sel = '.page__content h2, .page__content h3, .archive h2, .archive h3';
    document.querySelectorAll(sel).forEach(function (h) {
      // Skip cards' inner h3s (pub topic, music artist name) — they're not
      // navigation anchors.
      if (h.closest('.music-artist, .trail-stop__card, .art-card, .pub__cite')) return;
      // Ensure an id.
      if (!h.id) {
        var text = (h.textContent || '').trim();
        if (!text) return;
        var slug = slugify(text);
        // Avoid collisions on the same page.
        var base = slug, i = 1;
        while (slug && document.getElementById(slug) && document.getElementById(slug) !== h) {
          slug = base + '-' + (++i);
        }
        if (slug) h.id = slug;
      }
      if (!h.id) return;

      h.classList.add('lx-anchorable');
      var a = document.createElement('a');
      a.className = 'lx-anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', 'Copy link to this section');
      a.textContent = '#';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var url = window.location.origin + window.location.pathname + '#' + h.id;
        // Update the address bar without scrolling.
        try { history.replaceState(null, '', '#' + h.id); } catch (er) {}
        copy(url).then(function () {
          var lang = document.documentElement.getAttribute('lang') || 'en';
          toast(lang === 'zh' ? '链接已复制 ✓' : 'Link copied ✓');
        }).catch(function () {
          toast('Copy failed');
        });
      });
      h.appendChild(a);
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
