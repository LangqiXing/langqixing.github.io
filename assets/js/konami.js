/* ==========================================================================
   Konami easter egg: ↑↑↓↓←→←→BA → home flow particles briefly form a
   heart, then disperse. Also flashes a small note "you found it ♥".
   ========================================================================== */
(function () {
  'use strict';

  var SEQ = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
             'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
             'b', 'a'];
  var buf = [];

  function onKey(e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    buf.push(k);
    if (buf.length > SEQ.length) buf.shift();
    if (buf.length === SEQ.length && SEQ.every(function (s, i) { return s === buf[i]; })) {
      buf = [];
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

    // Particle hijack: ask the home-flow sketch to attract toward heart shape.
    var hijack = window.lxHomeFlow && window.lxHomeFlow.attract;
    if (hijack) hijack(3000);
  }

  window.addEventListener('keydown', onKey);
}());
