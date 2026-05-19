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
  // EN → ZH substitution table for the document title.
  var TITLE_MAP = [
    ["Langqi's Homepage", "邢朗齐的主页"],
    ['Langqi Xing',       '邢朗齐'],
    ['Publications',      '论文'],
    ['Projects',          '项目'],
    ['Gallery',           '画廊'],
    ['Music',             '音乐'],
    ['CV',                '简历'],
    ['Page Not Found',    '页面未找到']
  ];

  function applyTitle(lang) {
    var t = document.title || '';
    TITLE_MAP.forEach(function (pair) {
      var en = pair[0], zh = pair[1];
      if (lang === 'zh') {
        if (t.indexOf(en) !== -1) t = t.split(en).join(zh);
      } else {
        if (t.indexOf(zh) !== -1) t = t.split(zh).join(en);
      }
    });
    document.title = t;
  }

  function apply(lang) {
    document.documentElement.setAttribute('lang', lang);
    applyTitle(lang);
  }

  // Initial state — the head inline script may have already set this.
  var initial = document.documentElement.getAttribute('lang');
  if (!initial || (initial !== 'en' && initial !== 'zh')) {
    var stored = getStored();
    if (stored) initial = stored;
    else if (/^zh/i.test(navigator.language || '')) initial = 'zh';
    else initial = DEFAULT;
  }
  // Always apply so the title is in sync with the current language, even
  // when the head pre-script already set [lang] before paint.
  apply(initial);

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
