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

    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      apply(next);
      store(next);
      updateIcon();
    });

    return btn;
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
}());
