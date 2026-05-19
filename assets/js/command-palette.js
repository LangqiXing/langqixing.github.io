/* ==========================================================================
   Command palette — ⌘K / Ctrl+K to open a quick-jump menu over the page.
   Items: pages, in-page anchors, genres, artists, publications.
   Fuzzy match: substring + initials match with simple score.
   ========================================================================== */
(function () {
  'use strict';

  // ---------- Index ---------------------------------------------------------
  // Each item: { titleEn, titleZh, hint, href }
  var INDEX = [
    // Pages
    { en: 'Home', zh: '主页', hint: 'About me', href: '/' },
    { en: 'Projects', zh: '项目', hint: 'UCSB undergrad projects', href: '/projects/' },
    { en: 'Publications', zh: '论文', hint: 'Research papers', href: '/publications/' },
    { en: 'Gallery', zh: '画廊', hint: 'Photography + paintings', href: '/gallery/' },
    { en: 'Music', zh: '音乐', hint: 'A personal mixtape', href: '/music/' },
    { en: 'CV', zh: '简历', hint: 'PDF resume', href: '/files/CV.pdf' },
    // Home anchors
    { en: 'News', zh: '动态', hint: 'Recent updates', href: '/#news' },
    { en: 'Trajectory', zh: '轨迹', hint: 'Career timeline', href: '/#trajectory' },
    { en: 'Selected Experience', zh: '部分经历', hint: 'Internships', href: '/#selected-experience' },
    // Gallery anchors
    { en: 'Film Photography', zh: '胶片摄影', hint: 'Gallery · film section', href: '/gallery/#film' },
    { en: 'Paintings & Art', zh: '画作与艺术', hint: 'Gallery · art section', href: '/gallery/#art' },
    // Music anchors / genres
    { en: 'Jazz', zh: '爵士', hint: 'Music · Chet Baker', href: '/music/#jazz' },
    { en: 'Rock', zh: '摇滚', hint: 'Music · King Crimson', href: '/music/#rock' },
    { en: 'Indie', zh: '独立', hint: 'Music · Radiohead', href: '/music/#indie' },
    { en: 'Reggae', zh: '雷鬼', hint: 'Music · Bob Marley etc.', href: '/music/#reggae' },
    { en: 'R&B / Soul', zh: 'R&B / 灵魂', hint: 'Music · Marvin Gaye etc.', href: '/music/#soul' },
    // Publications
    { en: 'Particle Delivery (Nanoscale 2026)', zh: '颗粒输运 (Nanoscale 2026)', hint: 'Dead-end channels', href: 'https://pubs.rsc.org/en/content/articlelanding/2026/nr/d6nr00004e' },
    { en: 'Granular Materials (PRF 2024)', zh: '颗粒物质 (PRF 2024)', hint: 'Column collapse', href: 'https://journals.aps.org/prfluids/abstract/10.1103/PhysRevFluids.9.074301' },
    { en: 'Dip Coating (JCIS 2023)', zh: '浸渍涂层 (JCIS 2023)', hint: 'Fiber suspensions', href: 'https://www.sciencedirect.com/science/article/pii/S0021979723012079?via%3Dihub' },
    { en: 'Particulate Suspension Coating (Soft Matter 2022)', zh: '颗粒悬浮液涂层 (Soft Matter 2022)', hint: 'Capillary tubes', href: 'https://pubs.rsc.org/en/content/articlelanding/2022/SM/D2SM01211A' }
  ];

  function lang() {
    return document.documentElement.getAttribute('lang') || 'en';
  }
  function label(item) {
    return lang() === 'zh' ? item.zh : item.en;
  }

  // ---------- Fuzzy match ---------------------------------------------------
  function score(item, q) {
    if (!q) return 1;
    var hay = (item.en + ' ' + item.zh + ' ' + (item.hint || '')).toLowerCase();
    var needle = q.toLowerCase();
    if (hay.indexOf(needle) !== -1) return 100 + (needle.length / hay.length) * 30;
    // initials match
    var initials = (item.en.match(/\b\w/g) || []).join('').toLowerCase();
    if (initials.indexOf(needle) === 0) return 80;
    // per-character order
    var i = 0, j = 0, hits = 0;
    while (i < needle.length && j < hay.length) {
      if (needle[i] === hay[j]) { hits++; i++; }
      j++;
    }
    if (i === needle.length) return 30 + hits;
    return 0;
  }

  // ---------- UI ------------------------------------------------------------
  var modal, input, list, items = [];
  var open = false;
  var selectedIdx = 0;

  function build() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'lx-cmdk';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = [
      '<div class="lx-cmdk__panel">',
      '  <div class="lx-cmdk__header">',
      '    <span class="lx-cmdk__icon" aria-hidden="true">⌘</span>',
      '    <input type="text" class="lx-cmdk__input" autocomplete="off" spellcheck="false" />',
      '    <kbd class="lx-cmdk__esc">esc</kbd>',
      '  </div>',
      '  <ul class="lx-cmdk__list" role="listbox"></ul>',
      '  <div class="lx-cmdk__footer">',
      '    <span><kbd>↑</kbd><kbd>↓</kbd> ',
      '      <span lang="en">navigate</span><span lang="zh">移动</span></span>',
      '    <span><kbd>↵</kbd> ',
      '      <span lang="en">open</span><span lang="zh">打开</span></span>',
      '    <span><kbd>esc</kbd> ',
      '      <span lang="en">close</span><span lang="zh">关闭</span></span>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);

    input = modal.querySelector('.lx-cmdk__input');
    list = modal.querySelector('.lx-cmdk__list');

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', onInputKey);
  }

  function render(q) {
    var scored = INDEX
      .map(function (it) { return { item: it, s: score(it, q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 12);
    items = scored.map(function (r) { return r.item; });
    selectedIdx = 0;
    var html = items.map(function (it, i) {
      return '<li class="lx-cmdk__item' + (i === 0 ? ' is-active' : '') + '" data-idx="' + i + '">' +
             '  <span class="lx-cmdk__title">' + escapeHtml(label(it)) + '</span>' +
             '  <span class="lx-cmdk__hint">' + escapeHtml(it.hint || '') + '</span>' +
             '</li>';
    }).join('');
    if (!items.length) {
      html = '<li class="lx-cmdk__empty">' +
             '<span lang="en">No matches</span><span lang="zh">没有匹配</span></li>';
    }
    list.innerHTML = html;
    list.querySelectorAll('.lx-cmdk__item').forEach(function (li) {
      li.addEventListener('mouseenter', function () { setSelected(parseInt(li.dataset.idx, 10)); });
      li.addEventListener('click', function () {
        setSelected(parseInt(li.dataset.idx, 10));
        confirm();
      });
    });
  }

  function setSelected(i) {
    if (i < 0 || i >= items.length) return;
    selectedIdx = i;
    list.querySelectorAll('.lx-cmdk__item').forEach(function (li, idx) {
      li.classList.toggle('is-active', idx === selectedIdx);
    });
    var active = list.querySelector('.is-active');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
  }

  function confirm() {
    if (!items.length) return;
    var item = items[selectedIdx];
    close();
    var href = item.href;
    if (/^https?:/.test(href)) {
      window.open(href, '_blank', 'noopener');
    } else {
      window.location.href = href;
    }
  }

  function openPalette() {
    build();
    open = true;
    document.documentElement.classList.add('lx-cmdk-on');
    modal.classList.add('is-open');
    render('');
    setTimeout(function () { input.value = ''; input.focus(); }, 30);
  }
  function close() {
    if (!open) return;
    open = false;
    document.documentElement.classList.remove('lx-cmdk-on');
    modal.classList.remove('is-open');
  }

  function onInputKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(Math.min(items.length - 1, selectedIdx + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(Math.max(0, selectedIdx - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); confirm(); }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- Hotkey --------------------------------------------------------
  window.addEventListener('keydown', function (e) {
    var isMod = e.metaKey || e.ctrlKey;
    if (isMod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      if (open) close(); else openPalette();
    } else if (e.key === '/' && !open) {
      // Slash anywhere outside an input also opens the palette.
      var t = e.target;
      var isField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (!isField) { e.preventDefault(); openPalette(); }
    }
  });

  // Expose for the button click.
  window.lxCmdK = { open: openPalette, close: close };

  // Inject a small ⌘K trigger into the masthead-actions rail so mobile
  // users can open the palette without a keyboard.
  function injectButton() {
    var rail = document.querySelector('.masthead-actions');
    if (!rail) {
      setTimeout(injectButton, 200);
      return;
    }
    if (rail.querySelector('.cmdk-trigger')) return;
    var btn = document.createElement('button');
    btn.className = 'cmdk-trigger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open command palette');
    btn.innerHTML = '<span class="cmdk-trigger__icon" aria-hidden="true">⌘K</span>';
    btn.title = 'Open menu (⌘K)';
    rail.insertBefore(btn, rail.firstChild);
    btn.addEventListener('click', openPalette);
  }
  if (document.readyState !== 'loading') injectButton();
  else document.addEventListener('DOMContentLoaded', injectButton);
}());
