/* ==========================================================================
   Read-time estimate badge — small "≈ X min read" pill on pages that
   benefit from it (Publications + Projects). Counts visible words in the
   chosen language only so it reads as honest.
   ========================================================================== */
(function () {
  'use strict';

  var path = window.location.pathname;
  // Only on Publications and Projects pages.
  if (!/\/(publications|projects)\/?$/.test(path)) return;

  function init() {
    // Where to mount: under the page title or the first hero heading.
    var anchor = document.querySelector('.page__title') ||
                 document.querySelector('.archive h1') ||
                 document.querySelector('.page__content h1');
    if (!anchor) {
      anchor = document.querySelector('.archive') || document.querySelector('.page__content');
    }
    if (!anchor) return;

    // Word counter: sum text from the visible-language span set + plain
    // text outside any lang-attribute element.
    var lang = document.documentElement.getAttribute('lang') || 'en';
    var content = document.querySelector('.archive') || document.querySelector('.page__content');
    if (!content) return;

    var words = countWords(content, lang);
    if (!words) return;

    // 200 wpm for English, ~340 cpm for Chinese (slow but readable).
    var minutes;
    if (lang === 'zh') {
      minutes = Math.max(1, Math.round(words / 340));
    } else {
      minutes = Math.max(1, Math.round(words / 200));
    }

    var badge = document.createElement('span');
    badge.className = 'lx-readtime';
    badge.innerHTML =
      '<span class="lx-readtime__dot" aria-hidden="true"></span>' +
      '<span lang="en">≈ ' + minutes + ' min read</span>' +
      '<span lang="zh">≈ ' + minutes + ' 分钟阅读</span>';

    // Mount just after the H1 (or at the top of the list if no h1).
    if (anchor.tagName === 'H1') {
      anchor.parentNode.insertBefore(badge, anchor.nextSibling);
    } else {
      anchor.insertBefore(badge, anchor.firstChild);
    }
  }

  function countWords(root, lang) {
    // Pull text from the currently-visible language. Spans with the wrong
    // lang attr are hidden in CSS — we still need to skip them when
    // counting, because they exist in the DOM.
    var clone = root.cloneNode(true);
    // Remove off-language elements.
    var others = clone.querySelectorAll(lang === 'zh' ? '[lang="en"]' : '[lang="zh"]');
    others.forEach(function (n) { n.parentNode.removeChild(n); });
    // Remove anything that's not really body copy: scripts, figures, svgs,
    // navs, decorative chips.
    var ignore = clone.querySelectorAll(
      'script, style, svg, .film-kicker, .pub__cite-btn, .project__link, .pub__link,' +
      ' .pub__figure, .project__figure, .music-link, .gallery-tab, .music-tab,' +
      ' nav, .lx-anchor, .lx-readtime'
    );
    ignore.forEach(function (n) { n.parentNode.removeChild(n); });
    var text = (clone.textContent || '').trim();
    if (lang === 'zh') {
      // Count CJK characters as 1 "word" each, plus latin word splits.
      var cjk = (text.match(/[一-鿿]/g) || []).length;
      var latin = (text.match(/[A-Za-z]+/g) || []).length;
      return cjk + latin;
    } else {
      return (text.match(/\b[A-Za-z][A-Za-z0-9'\-]*\b/g) || []).length;
    }
  }

  // Recount + re-render when the language toggles, since wpm differs.
  function refresh() {
    var existing = document.querySelector('.lx-readtime');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    init();
  }
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      if (m.attributeName === 'lang') refresh();
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
