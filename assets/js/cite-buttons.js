/* ==========================================================================
   Cite buttons — copy BibTeX for each publication to clipboard.
   The pub entries declare their bib key via data-bibkey on the .pub element.
   ========================================================================== */
(function () {
  'use strict';

  var BIBS = {
    'xing2026controlling':
      '@article{xing2026controlling,\n' +
      '  title   = {Controlling particle dynamics in dead-end channels via boundary effects},\n' +
      '  author  = {Xing, Langqi and Tang, Xi},\n' +
      '  journal = {Nanoscale},\n' +
      '  year    = {2026},\n' +
      '  note    = {Advance Article},\n' +
      '  publisher = {Royal Society of Chemistry}\n' +
      '}',

    'sharma2024effects':
      '@article{sharma2024effects,\n' +
      '  title   = {The effects of interparticle cohesion on the collapse of granular columns},\n' +
      '  author  = {Sharma, Rahul Sai and Sarlin, Wladimir and Xing, Langqi and Morize, Cyprien and Gondret, Philippe and Sauret, Alban},\n' +
      '  journal = {Physical Review Fluids},\n' +
      '  volume  = {9},\n' +
      '  number  = {7},\n' +
      '  pages   = {074301},\n' +
      '  year    = {2024},\n' +
      '  publisher = {American Physical Society}\n' +
      '}',

    'jeong2023deposition':
      '@article{jeong2023deposition,\n' +
      '  title   = {Deposition and alignment of fiber suspensions by dip coating},\n' +
      '  author  = {Jeong, Deok-Hoon and Xing, Langqi and Lee, Marie Ka Ho and Vani, Nathalie and Sauret, Alban},\n' +
      '  journal = {Journal of Colloid and Interface Science},\n' +
      '  volume  = {650},\n' +
      '  pages   = {407--415},\n' +
      '  year    = {2023},\n' +
      '  publisher = {Elsevier}\n' +
      '}',

    'jeong2022particulate':
      '@article{jeong2022particulate,\n' +
      '  title   = {Particulate suspension coating of capillary tubes},\n' +
      '  author  = {Jeong, Deok-Hoon and Xing, Langqi and Boutin, Jean-Baptiste and Sauret, Alban},\n' +
      '  journal = {Soft Matter},\n' +
      '  volume  = {18},\n' +
      '  number  = {42},\n' +
      '  pages   = {8124--8133},\n' +
      '  year    = {2022},\n' +
      '  publisher = {Royal Society of Chemistry}\n' +
      '}'
  };

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
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); resolve(); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  }

  function init() {
    var pubs = document.querySelectorAll('.pub[data-bibkey]');
    if (!pubs.length) return;

    pubs.forEach(function (pub) {
      var key = pub.dataset.bibkey;
      var bib = BIBS[key];
      if (!bib) return;
      var cite = pub.querySelector('.pub__cite');
      if (!cite) return;
      // Avoid double-injection on hot reload.
      if (cite.querySelector('.pub__cite-btn')) return;

      var btn = document.createElement('button');
      btn.className = 'pub__cite-btn';
      btn.type = 'button';
      btn.innerHTML =
        '<span class="pub__cite-icon" aria-hidden="true">{ }</span>' +
        '<span lang="en">Cite</span><span lang="zh">引用</span>';
      btn.setAttribute('aria-label', 'Copy BibTeX');

      btn.addEventListener('click', function () {
        copy(bib).then(function () {
          var lang = document.documentElement.getAttribute('lang') || 'en';
          toast(lang === 'zh' ? 'BibTeX 已复制 ✓' : 'BibTeX copied ✓');
        }).catch(function () {
          toast('Copy failed');
        });
      });

      cite.appendChild(btn);
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
