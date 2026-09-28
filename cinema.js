/* NextPlay Kids — cinema.js · "THE FIRST ARENA" motion engine (vanilla, <10KB)
   Enhances index/shop/product only. Zero dependencies. All hooks additive:
   legacy app.js reveal + shop.js/home.js contracts keep working. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  doc.classList.add('np-layer', 'np-js');
  if (!RM) doc.classList.add('np-anim');

  /* ---------- theme (button auto-injected into the shared nav) ---------- */
  function initTheme() {
    var actions = document.querySelector('.site-header .nav-actions');
    var btn = document.querySelector('.np-theme-btn');
    if (!btn && actions) {
      btn = document.createElement('button');
      btn.className = 'np-theme-btn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Toggle light and dark theme');
      btn.innerHTML = '<span class="np-moon" aria-hidden="true">🌙</span><span class="np-sun" aria-hidden="true">☀️</span>';
      actions.insertBefore(btn, actions.firstChild);
    }
    if (!btn) return;
    var set = function (t, save) {
      if (t) doc.setAttribute('data-theme', t); else doc.removeAttribute('data-theme');
      if (save) { try { localStorage.setItem('np_theme', t || 'dark'); } catch (e) {} }
      btn.setAttribute('aria-pressed', String(!!t));
    };
    set(doc.getAttribute('data-theme'), false);
    btn.addEventListener('click', function () {
      set(doc.getAttribute('data-theme') === 'light' ? '' : 'light', true);
    });
  }

  /* ---------- boot sequence: visible via CSS, JS dismisses early ---------- */
  function initBoot() {
    var boot = $('.np-boot');
    if (!boot) return;
    if (RM) { boot.remove(); return; }
    doc.classList.add('np-fast');
    setTimeout(function () {
      if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    }, 1050);
  }

  /* ---------- scroll progress + nav shade + hero scrub (one rAF loop) ---------- */
  function initScroll() {
    var bar = $('.np-progress i');
    var header = $('.site-header');
    var heroCopy = $('.np-hero-copy');
    var beams = document.querySelectorAll('.np-beam');
    var buybar = $('.np-buybar');
    var bbAdd = $('#pd-add');
    var last = -1, ticking = false;
    function frame() {
      ticking = false;
      var y = window.scrollY || 0;
      if (y === last) return;
      last = y;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
      if (header) header.classList.toggle('np-scrolled', y > 8);
      if (RM) return;
      if (heroCopy && FINE && y < window.innerHeight) {
        var p = Math.min(1, y / window.innerHeight);
        heroCopy.style.transform = 'translateY(' + (p * -42) + 'px)';
        heroCopy.style.opacity = String(1 - p * 0.9);
      }
      if (beams.length && FINE && y < window.innerHeight * 1.2) {
        for (var i = 0; i < beams.length; i++) {
          beams[i].style.marginTop = (y * (0.12 + i * 0.05)) + 'px';
        }
      }
      if (buybar) {
        var show = false;
        if (bbAdd) {
          var r = bbAdd.getBoundingClientRect();
          show = (r.top > window.innerHeight || r.bottom < 0) && y > 400;
        }
        buybar.classList.toggle('show', show);
      }
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- count-up (finals already in DOM; no-JS safe) ---------- */
  function initCounts() {
    var els = document.querySelectorAll('.np-count');
    if (!els.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count') || '0');
      var suffix = el.getAttribute('data-suffix') || '';
      var dec = (el.getAttribute('data-count').indexOf('.') >= 0) ? 1 : 0;
      var t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 900);
        k = 1 - Math.pow(1 - k, 3);
        el.textContent = (target * k).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (RM || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        var v = el.getAttribute('data-count') || '';
        var dec = v.indexOf('.') >= 0 ? 1 : 0;
        var t = parseFloat(v) || 0;
        var sfx = el.getAttribute('data-suffix') || '';
        el.textContent = t.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + sfx;
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- upgrade legacy reveal into staggered v2 ---------- */
  function initRevealV2() {
    if (window.NPApp && window.NPApp.refreshReveal && !window.NPApp.__npV2) {
      window.NPApp.refreshReveal = function (root) {
        var els = (root || document).querySelectorAll('.reveal');
        if (RM || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              var group = en.target.closest('[data-stagger]') || en.target.parentElement;
              var kids = group ? Array.prototype.slice.call(group.querySelectorAll(':scope > .reveal')) : [];
              var i = Math.max(0, kids.indexOf(en.target));
              en.target.style.transitionDelay = Math.min(i * 60, 420) + 'ms';
              en.target.classList.add('in');
              io.unobserve(en.target);
            }
          });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
        els.forEach(function (e) { if (!e.classList.contains('in')) io.observe(e); });
      };
      window.NPApp.__npV2 = true;
    }
  }

  /* ---------- product gallery: accessible pan-zoom ---------- */
  function initZoom() {
    var wrap = $('#pd-main');
    if (!wrap) return;
    wrap.classList.add('np-zoom-wrap');
    var btn = document.createElement('button');
    btn.className = 'np-zoom-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Zoom product image. Toggle with button or double-click; press Escape to close.');
    btn.textContent = '🔍';
    wrap.appendChild(btn);
    var zoomed = false;
    var glyph = function () { return wrap.querySelector(':scope > span'); };
    function setZoom(on, cx, cy) {
      zoomed = on;
      wrap.classList.toggle('np-zoomed', on);
      btn.setAttribute('aria-pressed', String(on));
      var g = glyph();
      if (!g) return;
      if (on) {
        var r = wrap.getBoundingClientRect();
        var x = Math.min(1, Math.max(0, (cx - r.left) / r.width));
        var y = Math.min(1, Math.max(0, (cy - r.top) / r.height));
        g.style.transformOrigin = (x * 100) + '% ' + (y * 100) + '%';
      } else { g.style.transformOrigin = '50% 50%'; }
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); setZoom(!zoomed); });
    wrap.addEventListener('dblclick', function (e) {
      if (e.target.closest('.np-zoom-btn')) return;
      setZoom(!zoomed, e.clientX, e.clientY);
    });
    if (FINE) {
      wrap.addEventListener('pointermove', function (e) {
        if (!zoomed || e.target.closest('.np-zoom-btn')) return;
        var r = wrap.getBoundingClientRect();
        glyphOrigin(wrap, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      });
    }
    wrap.addEventListener('pointerleave', function () { if (zoomed) glyphOrigin(wrap, .5, .5); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && zoomed) setZoom(false);
    });
    function glyphOrigin(w, x, y) {
      var g = w.querySelector(':scope > span');
      if (g) g.style.transformOrigin = (x * 100) + '% ' + (y * 100) + '%';
    }
  }

  /* ---------- hero Ken Burns on reduced-motion is CSS; nothing here ---------- */
  function init() {
    initTheme();
    initBoot();
    initScroll();
    initCounts();
    initRevealV2();
    initZoom();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();