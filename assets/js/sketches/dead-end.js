/* ==========================================================================
   404 page — particles trying to escape a dead-end channel.
   Echoes the research: the channel has one open end (left) and one closed
   end (right). Particles drift in, bounce off the dead end, get stuck.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var host = document.getElementById('dead-end-sketch');
    if (!host || !window.p5) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    new p5(function (p) {
      var w, h;
      var particles = [];
      var COUNT = 60;
      // Channel geometry (in fractions of canvas).
      var CHAN_TOP = 0.34;
      var CHAN_BOT = 0.66;
      var CHAN_RIGHT = 0.86;

      function spawn(part, fromLeft) {
        if (fromLeft || part === undefined) {
          part = part || {};
          part.x = p.random(-20, 10);
          part.y = p.random(h * CHAN_TOP + 12, h * CHAN_BOT - 12);
        }
        part.vx = p.random(0.6, 1.4);
        part.vy = p.random(-0.18, 0.18);
        part.age = 0;
        part.life = p.random(360, 700);
        part.size = p.random(2.4, 4.2);
        part.col = p.random([
          p.color('rgba(47,125,122,0.78)'),  // teal
          p.color('rgba(201,84,63,0.72)'),   // coral
          p.color('rgba(182,137,44,0.7)')    // gold
        ]);
        return part;
      }

      p.setup = function () {
        w = host.clientWidth;
        h = Math.max(280, host.clientHeight || 360);
        var c = p.createCanvas(w, h);
        c.parent('dead-end');
        c.parent('dead-end-sketch');
        p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
        for (var i = 0; i < COUNT; i++) particles.push(spawn({}, true));
        if (reduce) p.noLoop();
      };

      function drawChannel() {
        var top = h * CHAN_TOP;
        var bot = h * CHAN_BOT;
        var right = w * CHAN_RIGHT;

        // Paper fill inside channel.
        p.noStroke();
        p.fill(248, 245, 239, 230);
        p.rect(0, top, right, bot - top);

        // Channel walls + dead-end (right cap).
        p.stroke(31, 42, 48, 220);
        p.strokeWeight(2.2);
        p.line(0, top, right, top);
        p.line(0, bot, right, bot);
        p.line(right, top, right, bot);

        // Flow-arrow at the open (left) end.
        p.stroke(47, 125, 122, 200);
        p.strokeWeight(1.4);
        p.line(8, (top + bot) / 2, 28, (top + bot) / 2);
        p.line(20, (top + bot) / 2 - 5, 28, (top + bot) / 2);
        p.line(20, (top + bot) / 2 + 5, 28, (top + bot) / 2);

        // "Dead end" label tag.
        p.noStroke();
        p.fill(31, 42, 48, 180);
        p.textFont('Georgia, serif');
        p.textStyle(p.ITALIC);
        p.textSize(11);
        p.text('dead end', right + 8, (top + bot) / 2 + 4);
      }

      p.draw = function () {
        // Faint paper trail.
        p.noStroke();
        p.fill(248, 245, 239, 22);
        p.rect(0, 0, w, h);

        drawChannel();

        var top = h * CHAN_TOP;
        var bot = h * CHAN_BOT;
        var right = w * CHAN_RIGHT;

        for (var i = 0; i < particles.length; i++) {
          var prt = particles[i];

          // Brownian wiggle on top of drift.
          var wiggle = p.random(-0.12, 0.12);
          prt.vy += wiggle * 0.5;

          // Outside the channel? Apply tiny gravitational pull toward the
          // channel midline.
          if (prt.x > 0 && prt.x < right) {
            var mid = (top + bot) / 2;
            prt.vy += (mid - prt.y) * 0.0006;
          }

          // Slow the drift exponentially as we approach the dead end — the
          // simulation is supposed to FEEL stuck.
          var stuckness = p.constrain((prt.x - right * 0.5) / (right * 0.5), 0, 1);
          var damping = 1 - stuckness * 0.04;
          prt.vx *= damping;
          prt.vy *= 0.985;

          prt.x += prt.vx;
          prt.y += prt.vy;

          // Wall collisions.
          if (prt.y < top + prt.size) { prt.y = top + prt.size; prt.vy *= -0.55; }
          if (prt.y > bot - prt.size) { prt.y = bot - prt.size; prt.vy *= -0.55; }
          if (prt.x > right - prt.size) {
            prt.x = right - prt.size;
            prt.vx *= -0.4;
          }

          prt.age++;
          if (prt.age > prt.life || prt.x < -20) {
            spawn(prt, true);
          }

          // Draw particle.
          var fade = 1 - prt.age / prt.life;
          var col = prt.col;
          p.noStroke();
          p.fill(col.levels[0], col.levels[1], col.levels[2], col.levels[3] * fade);
          p.circle(prt.x, prt.y, prt.size);
        }
      };

      p.windowResized = function () {
        w = host.clientWidth;
        h = Math.max(280, host.clientHeight || 360);
        p.resizeCanvas(w, h);
      };
    }, host);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
