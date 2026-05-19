/* ==========================================================================
   Home hero — a slow Perlin flow field in the site's palette.
   Instance-mode p5 so we don't pollute globals on the home page.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var host = document.getElementById('home-flow');
    if (!host || !window.p5) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    new p5(function (p) {
      var w, h;
      var particles = [];
      var COUNT = 90;
      var SCALE = 0.0035;     // noise spatial scale — smaller = smoother
      var DRIFT = 0.00045;    // noise temporal scale — slow drift
      var mx = 0.5, my = 0.5; // normalized mouse, parallax target
      var mxs = 0.5, mys = 0.5; // smoothed

      // Palette pulled from _sass/_art.scss
      var palette = [
        p.color('rgba(47,125,122,0.55)'),   // teal
        p.color('rgba(201,84,63,0.50)'),    // coral
        p.color('rgba(182,137,44,0.55)'),   // gold
        p.color('rgba(31,42,48,0.42)')      // ink (sparser)
      ];

      function spawn(part) {
        part.x = p.random(w);
        part.y = p.random(h);
        part.life = p.random(140, 320);
        part.age = 0;
        part.col = palette[p.floor(p.random(palette.length))];
      }

      p.setup = function () {
        w = host.clientWidth;
        h = host.clientHeight;
        var c = p.createCanvas(w, h);
        c.parent('home-flow');
        p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
        p.noStroke();
        p.background(248, 245, 239, 255);
        for (var i = 0; i < COUNT; i++) {
          var part = {};
          spawn(part);
          particles.push(part);
        }
        if (reduce) p.noLoop();
      };

      p.draw = function () {
        // Faint trail by drawing a translucent paper-toned rectangle.
        p.fill(248, 245, 239, 14);
        p.rect(0, 0, w, h);

        mxs += (mx - mxs) * 0.04;
        mys += (my - mys) * 0.04;
        var px = (mxs - 0.5) * 22;
        var py = (mys - 0.5) * 22;

        var t = p.frameCount * DRIFT;
        for (var i = 0; i < particles.length; i++) {
          var prt = particles[i];
          var n = p.noise(prt.x * SCALE, prt.y * SCALE, t);
          var ang = n * p.TWO_PI * 2.0;
          var spd = 0.55 + n * 0.7;
          prt.x += Math.cos(ang) * spd + px * 0.004;
          prt.y += Math.sin(ang) * spd + py * 0.004;
          prt.age++;

          // Respawn on edges or end-of-life.
          if (prt.x < -4 || prt.x > w + 4 || prt.y < -4 || prt.y > h + 4 || prt.age > prt.life) {
            spawn(prt);
          }

          var fade = 1 - prt.age / prt.life;
          p.fill(prt.col.levels[0], prt.col.levels[1], prt.col.levels[2], prt.col.levels[3] * fade);
          p.circle(prt.x, prt.y, 1.8);
        }
      };

      p.windowResized = function () {
        w = host.clientWidth;
        h = host.clientHeight;
        p.resizeCanvas(w, h);
        p.background(248, 245, 239, 255);
      };

      // Pointer parallax — works when pointer is anywhere on the host card.
      function onMove(e) {
        var r = host.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
          mx = x;
          my = y;
        }
      }
      window.addEventListener('mousemove', onMove, { passive: true });
    }, host);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
