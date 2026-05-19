/* ==========================================================================
   Music page — generative ring oscillator (Lissajous + Perlin noise).
   Sits behind the vinyl SVG. Pure generative: a slow breathing waveform.
   Future upgrade: bind .targetA / .targetB / .energy to an AnalyserNode if
   a Spotify embed exposes audio in the future.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var host = document.getElementById('music-osc');
    if (!host || !window.p5) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.saveData) return;

    new p5(function (p) {
      var w, h;
      var t0;
      var paused = false;

      // Tunables — surface as instance fields so a future audio analyser
      // can patch them at runtime.
      var state = {
        targetA: 3.0,   // x frequency multiplier
        targetB: 2.0,   // y frequency multiplier
        energy: 0.6     // 0..1 — drives radius pulse
      };
      var a = state.targetA, b = state.targetB, energy = state.energy;

      p.setup = function () {
        w = host.clientWidth;
        h = host.clientHeight;
        var c = p.createCanvas(w, h);
        c.parent('music-osc');
        p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
        p.colorMode(p.HSB, 360, 100, 100, 1);
        p.noFill();
        t0 = p.millis();
        if (reduce) p.noLoop();
      };

      p.draw = function () {
        // Faint paper trail — creates afterimage halos.
        p.push();
        p.colorMode(p.RGB);
        p.fill(248, 245, 239, 16);
        p.noStroke();
        p.rect(0, 0, w, h);
        p.pop();

        // Smooth toward target values (would matter once audio drives them).
        a += (state.targetA - a) * 0.04;
        b += (state.targetB - b) * 0.04;
        energy += (state.energy - energy) * 0.06;

        var t = (p.millis() - t0) * 0.001;
        var cx = w * 0.5;
        var cy = h * 0.5;
        var rMax = Math.min(w, h) * 0.42;

        // Stack of waveforms with offset phases — creates the "breathing"
        // depth that a single ring would miss.
        var rings = 5;
        for (var r = 0; r < rings; r++) {
          var phase = r * 0.6;
          var pulse = 0.92 + 0.08 * Math.sin(t * 0.8 + r);
          var rad = rMax * (0.45 + r * 0.12) * pulse;

          // Hue rotates teal → gold → coral in HSB.
          var hueBase = 175 - r * 8 + Math.sin(t * 0.07 + r) * 12;
          var sat = 38 + r * 6;
          var bri = 60 + r * 4;
          var alpha = 0.18 + 0.12 * energy - r * 0.025;
          if (alpha <= 0) continue;

          p.stroke(hueBase, sat, bri, alpha);
          p.strokeWeight(1.1 + r * 0.18);
          p.beginShape();
          var steps = 280;
          for (var i = 0; i <= steps; i++) {
            var u = (i / steps) * p.TWO_PI;
            // Lissajous-ish with light noise jitter.
            var n = p.noise(Math.cos(u) * 0.9 + r, Math.sin(u) * 0.9 + r, t * 0.18 + phase);
            var wobble = 1 + (n - 0.5) * 0.32 * (0.6 + energy);
            var x = cx + Math.cos(a * u + phase) * rad * wobble;
            var y = cy + Math.sin(b * u + phase * 0.7 + t * 0.12) * rad * wobble;
            p.vertex(x, y);
          }
          p.endShape(p.CLOSE);
        }
      };

      p.windowResized = function () {
        w = host.clientWidth;
        h = host.clientHeight;
        p.resizeCanvas(w, h);
      };

      // Pause when the canvas is offscreen — saves battery on long pages.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (paused) { p.loop(); paused = false; }
            } else {
              if (!paused) { p.noLoop(); paused = true; }
            }
          });
        }, { threshold: 0.05 });
        io.observe(host);
      }

      // Public hook — anyone can tweak the oscillator at runtime via
      // window.lxMusicOsc.set({ targetA: 4, targetB: 3, energy: 0.9 }).
      window.lxMusicOsc = {
        state: state,
        set: function (next) { Object.assign(state, next); }
      };
    }, host);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
}());
