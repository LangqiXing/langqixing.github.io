/* ==========================================================================
   Theme toggle — Manuscript (light) / Vellum (dark).
   Persists choice in localStorage. Respects prefers-color-scheme on first
   visit. Inline script in <head> handles initial paint to avoid flashing.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'lx-theme';

  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function apply(theme) {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.setAttribute('data-theme', 'light');
  }

  // The early <head> script may already have applied a theme. Sync any
  // stored value just in case.
  var initial = document.documentElement.getAttribute('data-theme');
  if (!initial) {
    var stored = getStored();
    if (stored) initial = stored;
    else initial = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    apply(initial);
  }

  function build() {
    // Always mount at the masthead's right edge so the toggle is reachable
    // on mobile too (the .visible-links list gets hidden under hamburger).
    var inner = document.querySelector('.masthead__inner-wrap') ||
                document.querySelector('.masthead');
    if (!inner) return null;

    // Create a wrapper for the action chips that floats to the right.
    var rail = inner.querySelector('.masthead-actions');
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'masthead-actions';
      inner.appendChild(rail);
    }

    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Toggle day / night');
    btn.innerHTML = '<span class="theme-toggle__icon" aria-hidden="true"></span>';
    rail.appendChild(btn);

    function updateIcon() {
      var cur = document.documentElement.getAttribute('data-theme');
      btn.querySelector('.theme-toggle__icon').textContent = cur === 'dark' ? '☾' : '☀';
      btn.setAttribute('aria-pressed', cur === 'dark' ? 'true' : 'false');
    }
    updateIcon();

    btn.addEventListener('click', function (e) {
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      var next = cur === 'dark' ? 'light' : 'dark';

      // Compute the click origin so the ripple expands from the button.
      var r = btn.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var radius = Math.hypot(
        Math.max(cx, window.innerWidth - cx),
        Math.max(cy, window.innerHeight - cy)
      );

      // Prefer View Transition API for a smooth atomic ripple if supported.
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce && document.startViewTransition) {
        document.documentElement.style.setProperty('--lx-ripple-x', cx + 'px');
        document.documentElement.style.setProperty('--lx-ripple-y', cy + 'px');
        document.documentElement.style.setProperty('--lx-ripple-r', radius + 'px');
        document.documentElement.classList.add('lx-theme-rippling');
        var t = document.startViewTransition(function () {
          apply(next);
          store(next);
          updateIcon();
        });
        t.finished.then(function () {
          document.documentElement.classList.remove('lx-theme-rippling');
        }).catch(function () {
          document.documentElement.classList.remove('lx-theme-rippling');
        });
      } else if (!reduce) {
        // Fallback ripple using a fixed circle overlay that expands.
        var ripple = document.createElement('div');
        ripple.className = 'lx-theme-ripple';
        ripple.style.left = cx + 'px';
        ripple.style.top = cy + 'px';
        ripple.style.setProperty('--r', radius + 'px');
        ripple.style.background = next === 'dark' ? '#15191c' : '#f8f5ef';
        document.body.appendChild(ripple);
        requestAnimationFrame(function () { ripple.classList.add('is-out'); });
        setTimeout(function () {
          apply(next);
          store(next);
          updateIcon();
        }, 340);
        setTimeout(function () {
          if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 800);
      } else {
        apply(next);
        store(next);
        updateIcon();
      }
    });

    return btn;
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
}());
