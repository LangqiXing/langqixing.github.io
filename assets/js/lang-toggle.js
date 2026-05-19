/* ==========================================================================
   Language toggle — EN / 中
   Sets html[lang] = en | zh and persists in localStorage.
   The CSS does the actual show/hide:
     html[lang="en"] [lang="zh"] { display: none; }
     html[lang="zh"] [lang="en"] { display: none; }
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'lx-lang';
  var DEFAULT = 'en';

  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function apply(lang) {
    document.documentElement.setAttribute('lang', lang);
  }

  // Initial state — the head inline script may have already set this.
  var initial = document.documentElement.getAttribute('lang');
  if (!initial || (initial !== 'en' && initial !== 'zh')) {
    var stored = getStored();
    if (stored) initial = stored;
    else if (/^zh/i.test(navigator.language || '')) initial = 'zh';
    else initial = DEFAULT;
    apply(initial);
  }

  function build() {
    var inner = document.querySelector('.masthead__inner-wrap') ||
                document.querySelector('.masthead');
    if (!inner) return null;
    var rail = inner.querySelector('.masthead-actions');
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'masthead-actions';
      inner.appendChild(rail);
    }

    var btn = document.createElement('button');
    btn.className = 'lang-toggle';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Switch language');
    btn.innerHTML = '<span class="lang-toggle__label" aria-hidden="true"></span>';
    rail.insertBefore(btn, rail.firstChild);

    function updateLabel() {
      var cur = document.documentElement.getAttribute('lang') || 'en';
      btn.querySelector('.lang-toggle__label').textContent = cur === 'zh' ? '中' : 'EN';
      btn.setAttribute('aria-pressed', cur === 'zh' ? 'true' : 'false');
      btn.title = cur === 'zh' ? '切到 English' : 'Switch to 中文';
    }
    updateLabel();

    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('lang') || 'en';
      var next = cur === 'zh' ? 'en' : 'zh';
      apply(next);
      store(next);
      updateLabel();
    });

    return btn;
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
}());
