/* ==========================================================================
   Lightbox — full-screen photo viewer for .film-frame links.
   Keyboard: ← → to navigate, ESC to close. Click backdrop to close.
   ========================================================================== */
(function () {
  'use strict';

  var frames = document.querySelectorAll('.film-frame');
  if (!frames.length) return;

  var items = Array.prototype.map.call(frames, function (a) {
    var img = a.querySelector('img');
    return {
      href: a.getAttribute('href'),
      alt: img ? img.getAttribute('alt') : '',
      camera: a.dataset.camera || '',
      film: a.dataset.film || '',
      date: a.dataset.date || '',
      location: a.dataset.location || '',
      note: a.dataset.note || ''
    };
  });

  // Build the lightbox once, lazily on first open.
  var lb = null;
  var stage, imgEl, captionEl, metaEl, prevBtn, nextBtn, counterEl;
  var index = 0;
  var lastFocus = null;

  function build() {
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'lx-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = [
      '<button class="lx-lightbox__close" type="button" aria-label="Close">×</button>',
      '<button class="lx-lightbox__nav lx-lightbox__nav--prev" type="button" aria-label="Previous photo">‹</button>',
      '<button class="lx-lightbox__nav lx-lightbox__nav--next" type="button" aria-label="Next photo">›</button>',
      '<figure class="lx-lightbox__stage">',
      '  <img class="lx-lightbox__img" alt="">',
      '  <figcaption class="lx-lightbox__caption"></figcaption>',
      '  <dl class="lx-lightbox__meta" hidden></dl>',
      '</figure>',
      '<div class="lx-lightbox__counter" aria-live="polite"></div>'
    ].join('');
    document.body.appendChild(lb);

    stage = lb.querySelector('.lx-lightbox__stage');
    imgEl = lb.querySelector('.lx-lightbox__img');
    captionEl = lb.querySelector('.lx-lightbox__caption');
    metaEl = lb.querySelector('.lx-lightbox__meta');
    prevBtn = lb.querySelector('.lx-lightbox__nav--prev');
    nextBtn = lb.querySelector('.lx-lightbox__nav--next');
    counterEl = lb.querySelector('.lx-lightbox__counter');

    lb.querySelector('.lx-lightbox__close').addEventListener('click', close);
    prevBtn.addEventListener('click', function () { go(-1); });
    nextBtn.addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) {
      // Click on backdrop (the lb itself, not its children) closes.
      if (e.target === lb) close();
    });
    // Swipe gesture on touch
    var touchStartX = 0;
    stage.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
    }, { passive: true });
  }

  function render(i) {
    var item = items[i];
    if (!item) return;
    imgEl.classList.add('is-loading');
    imgEl.src = item.href;
    imgEl.alt = item.alt || '';
    imgEl.onload = function () { imgEl.classList.remove('is-loading'); };
    captionEl.textContent = item.note || item.alt || '';
    counterEl.textContent = (i + 1) + ' / ' + items.length;

    // Metadata block — only render fields that are actually present.
    var rows = [];
    var lang = document.documentElement.getAttribute('lang') || 'en';
    var labels = lang === 'zh'
      ? { camera: '相机', film: '胶片', date: '日期', location: '地点' }
      : { camera: 'Camera', film: 'Film', date: 'Date', location: 'Where' };
    ['camera', 'film', 'date', 'location'].forEach(function (k) {
      if (item[k]) {
        rows.push(
          '<dt>' + labels[k] + '</dt>' +
          '<dd>' + escapeHtml(item[k]) + '</dd>'
        );
      }
    });
    if (rows.length) {
      metaEl.innerHTML = rows.join('');
      metaEl.hidden = false;
    } else {
      metaEl.innerHTML = '';
      metaEl.hidden = true;
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function open(i) {
    build();
    index = i;
    render(index);
    lastFocus = document.activeElement;
    document.documentElement.classList.add('lx-lightbox-on');
    lb.classList.add('is-open');
    document.addEventListener('keydown', onKey);
    // Focus the close button for keyboard a11y.
    setTimeout(function () {
      var c = lb.querySelector('.lx-lightbox__close');
      if (c) c.focus();
    }, 50);
  }

  function close() {
    lb.classList.remove('is-open');
    document.documentElement.classList.remove('lx-lightbox-on');
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function go(delta) {
    index = (index + delta + items.length) % items.length;
    render(index);
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  }

  // Attach click handlers to film frames.
  Array.prototype.forEach.call(frames, function (frame, i) {
    frame.addEventListener('click', function (e) {
      e.preventDefault();
      open(i);
    });
  });
}());
