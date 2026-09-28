/* NextPlay Kids — shared header/footer/partials injection + utilities */
(function () {
  'use strict';
  var PAGES = [
    ['index.html', 'Home'],
    ['shop.html', 'Shop'],
    ['explorer.html', 'Find Their Sport'],
    ['ages.html', 'Ages'],
    ['programs.html', 'Programs'],
    ['camps.html', 'Camps'],
    ['schools.html', 'For Schools'],
    ['safety.html', 'Safety'],
    ['about.html', 'About'],
    ['contact.html', 'Contact']
  ];
  var cart = {
    get: function () {
      try { return JSON.parse(localStorage.getItem('np_cart') || '[]'); } catch (e) { return []; }
    },
    count: function () {
      return this.get().reduce(function (n, i) { return n + (i.qty || 0); }, 0);
    },
    save: function (items) {
      localStorage.setItem('np_cart', JSON.stringify(items));
      syncBadges();
    }
  };
  function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function stars(r) {
    var full = Math.round(r), out = '';
    for (var i = 1; i <= 5; i++) out += i <= full ? '★' : '☆';
    return out;
  }
  function syncBadges() {
    var n = cart.count();
    document.querySelectorAll('.cart-count').forEach(function (el) { el.textContent = n > 99 ? '99+' : n; });
  }
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 3000);
  }

  /* ---------- injected shell (header/footer) ---------- */
  function buildShell() {
    var h = document.getElementById('site-header');
    if (h && !h.dataset.built) {
      h.dataset.built = '1';
      var here = location.pathname.split('/').pop() || 'index.html';
      var nav = PAGES.map(function (p) {
        var cur = p[0] === here ? ' aria-current="page"' : '';
        return '<a href="' + p[0] + '"' + cur + '>' + p[1] + '</a>';
      }).join('');
      h.innerHTML =
        '<div class="container nav-wrap">' +
        '<a class="brand" href="index.html" aria-label="NextPlay Kids home"><span class="brand-logo" aria-hidden="true">⚡</span>Next<em>Play</em>&nbsp;Kids</a>' +
        '<nav class="main-nav" aria-label="Primary">' + nav + '</nav>' +
        '<div class="nav-actions">' +
        '<a class="cart-pill" href="cart.html" aria-label="Open cart">🛒 Cart <span class="cart-count">0</span></a>' +
        '<button class="hamburger" aria-expanded="false" aria-controls="mnav" aria-label="Menu"><span></span><span></span><span></span></button>' +
        '</div></div>' +
        '<nav id="mnav" class="mobile-nav" aria-label="Mobile">' + nav + '</nav>';
      var hb = h.querySelector('.hamburger');
      var mn = h.querySelector('.mobile-nav');
      hb.addEventListener('click', function () {
        var open = mn.classList.toggle('open');
        hb.setAttribute('aria-expanded', String(open));
      });
    }
    var f = document.getElementById('site-footer');
    if (f && !f.dataset.built) {
      f.dataset.built = '1';
      f.innerHTML =
        '<div class="container"><div class="footer-grid">' +
        '<div class="footer-brand"><a class="brand" href="index.html"><span class="brand-logo" aria-hidden="true">⚡</span>Next<em>Play</em>&nbsp;Kids</a>' +
        '<p>Every child deserves a place to play. Premium sport gear, programs and camps for ages 2–17 — designed with parents, coaches and physiotherapists.</p>' +
        '<div class="social-row">' +
        '<a href="#" aria-label="NextPlay on Instagram">📸</a><a href="#" aria-label="NextPlay on YouTube">▶️</a>' +
        '<a href="#" aria-label="NextPlay on WhatsApp">💬</a><a href="#" aria-label="NextPlay on Facebook">📘</a></div></div>' +
        '<div><h4>Shop</h4><a href="shop.html">Shop All</a><a href="shop.html?cat=G">Programs</a><a href="ages.html">Shop by Age</a><a href="shop.html?sport=Swimming">Swimming</a><a href="shop.html?sport=Football">Football</a><a href="camps.html">Camps &amp; Events</a></div>' +
        '<div><h4>Support</h4><a href="contact.html">Contact &amp; Help</a><a href="safety.html">Safety &amp; Sizing</a><a href="safety.html#returns">Returns &amp; Exchanges</a><a href="cart.html">Your Cart</a><a href="dashboard-parent.html">Parent Dashboard</a><a href="dashboard-coach.html">Coach Portal</a></div>' +
        '<div><h4>Trust &amp; Legal</h4><a href="privacy.html">Privacy Policy</a><a href="child-safety.html">Child Safety Policy</a><a href="about.html">About NextPlay</a><a href="schools.html">School Partnerships</a><a href="about.html#accessibility">Inclusive Sport</a></div>' +
        '</div><div class="footer-base">' +
        '<span>© 2026 NextPlay Kids · Mumbai, India · Every child deserves a place to play.</span>' +
        '<span class="trust-badges"><span>🛡 Safety-certified gear</span><span>👨‍👩‍👧 Parents are account holders</span><span>♿ Adaptive-friendly</span></span>' +
        '</div></div>';
    }
  }

  /* ---------- reveal-on-scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var i = 0, t = en.target;
          var group = t.closest('[data-stagger]') || t.parentElement;
          if (group && group.dataset.stagger !== undefined) {
            var kids = Array.prototype.slice.call(group.querySelectorAll(':scope > .reveal'));
            i = Math.max(0, kids.indexOf(t));
          }
          t.style.transitionDelay = Math.min(i * 70, 500) + 'ms';
          t.classList.add('in');
          io.unobserve(t);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- back-to-top ---------- */
  function initBackTop() {
    var b = document.querySelector('.back-top');
    if (!b) return;
    var onScroll = function () { b.classList.toggle('show', window.scrollY > 600); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- accordions ---------- */
  function initAccordions() {
    document.querySelectorAll('.acc-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.acc-item');
        var body = item.querySelector('.acc-body');
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
      });
    });
  }

  /* ---------- generic consent toggles (dashboards) ---------- */
  function initToggles() {
    document.querySelectorAll('.toggle').forEach(function (t) {
      t.addEventListener('click', function () {
        var on = t.getAttribute('aria-checked') === 'true';
        t.setAttribute('aria-checked', String(!on));
      });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t.click(); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildShell();
    syncBadges();
    initReveal();
    initBackTop();
    initAccordions();
    initToggles();
  });

  window.NP = {
    cart: cart,
    money: money,
    esc: esc,
    stars: stars,
    toast: toast,
    syncBadges: syncBadges
  };
})();