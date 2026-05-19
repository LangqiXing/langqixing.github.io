/* ==========================================================================
   Easter egg: type "love" anywhere on the page (outside inputs) and the
   home flow particles briefly snap into a heart shape. Also shows a small
   "you found it ♥" toast.
   ========================================================================== */
(function () {
  'use strict';

  var WORD = 'love';
  var buf = '';

  function onKey(e) {
    // Ignore typing inside form fields or contenteditable — the command
    // palette has its own input, and a real user typing "lovely" in a
    // form shouldn't fire the egg.
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    // Only single printable characters.
    if (e.key.length !== 1) {
      // Reset on most non-character keys so the user can't accumulate.
      if (e.key !== 'Shift' && e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Alt') buf = '';
      return;
    }
    buf += e.key.toLowerCase();
    if (buf.length > WORD.length) buf = buf.slice(-WORD.length);
    if (buf === WORD) {
      buf = '';
      trigger();
    }
  }

  function trigger() {
    // Toast.
    var toast = document.createElement('div');
    toast.className = 'lx-konami-toast';
    toast.innerHTML = '<span lang="en">you found it&nbsp;<span class="lx-konami-heart">♥</span></span>' +
                      '<span lang="zh">你发现了&nbsp;<span class="lx-konami-heart">♥</span></span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-in'); });
    setTimeout(function () { toast.classList.remove('is-in'); }, 3200);
    setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 4000);

    // Particle hijack: ask the home-flow sketch to attract toward a heart.
    var hijack = window.lxHomeFlow && window.lxHomeFlow.attract;
    if (hijack) hijack(3000);
  }

  window.addEventListener('keydown', onKey);
}());
