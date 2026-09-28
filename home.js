/* NextPlay Kids — homepage behaviours: best-sellers carousel, homepage quiz, newsletter */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var NPD = window.NPD, NP = window.NP, App = window.NPApp;

  /* ---------- best-sellers carousel ---------- */
  function initCarousel() {
    var track = $('#bs-track');
    if (!track) return;
    var best = NPD.PRODUCTS.filter(function (p) { return p.rating >= 4.6; }).sort(function (a, b) { return b.rc - a.rc; }).slice(0, 10);
    track.innerHTML = best.map(function (p) { return App.cardHTML(p).replace('class="product-card reveal"', 'class="product-card"'); }).join('');
    var wrap = track.parentElement;
    var step = 304;
    var prev = $('.car-btn.prev', wrap), next = $('.car-btn.next', wrap);
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step, behavior: 'smooth' }); });
    App.wireAdd(track);
  }

  /* ---------- homepage mini-quiz (recommendation tool) ---------- */
  var HQUIZ = [
    { q: 'Who are we shopping for?', key: 'who', opts: [['My child (2–7 yrs)', '🧒', 'little'], ['My child (8–11 yrs)', '🏃', 'rising'], ['My child (12–17 yrs)', '🏅', 'young'], ['A school / academy', '🏫', 'school']] },
    { q: 'What do they love doing?', key: 'love', opts: [['Team games with friends', '🤝', 'Football'], ['Racing & athletics', '⚡', 'Athletics'], ['Water & swimming', '🌊', 'Swimming'], ['Precision & focus', '🎯', 'Badminton'], ['Dance & movement', '💃', 'Dance & Cheer'], ['Outdoors & adventure', '🏕️', 'Adventure/Outdoor']] },
    { q: 'Experience level?', key: 'exp', opts: [['Just starting', '🌱', 'Beginner'], ['Some experience', '⚽', 'Intermediate'], ['Trains seriously', '🔥', 'Advanced']] }
  ];
  function initQuiz() {
    var shell = $('#quiz-shell');
    if (!shell) return;
    var step = 0, answers = {};
    var bar = $('#quiz-bar'), qEl = $('#quiz-q'), optsEl = $('#quiz-opts');
    function draw() {
      var qd = HQUIZ[step];
      bar.style.width = (step / HQUIZ.length * 100) + '%';
      qEl.textContent = qd.q;
      optsEl.innerHTML = qd.opts.map(function (o) {
        return '<button class="quiz-opt" data-v="' + o[2] + '"><span class="g" aria-hidden="true">' + o[1] + '</span>' + o[0] + '</button>';
      }).join('');
    }
    optsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.quiz-opt');
      if (!b) return;
      answers[HQUIZ[step].key] = { label: b.textContent.trim(), v: b.getAttribute('data-v') };
      b.classList.add('sel');
      setTimeout(function () {
        step++;
        if (step < HQUIZ.length) { draw(); }
        else { result(); }
      }, 240);
    });
    function result() {
      bar.style.width = '100%';
      var a = answers;
      var pool = NPD.PRODUCTS.filter(function (p) {
        var lvlOK = !a.exp || p.lvl === a.exp.v || p.lvl === 'All Levels';
        var ageOK = p.age[1] >= (a.who && a.who.v === 'tiny' ? 2 : 5) && p.age[0] <= (a.who && a.who.v === 'young' ? 17 : 11);
        return lvlOK && ageOK;
      });
      var love = a.love ? a.love.v : null;
      var picks = pool.filter(function (p) { return love && p.sport === love; }).slice(0, 2);
      pool.forEach(function (p) { if (picks.length < 3 && picks.indexOf(p) === -1 && (p.cat === 'A' || p.cat === 'B')) picks.push(p); });
      picks = picks.slice(0, 3);
      qEl.textContent = 'Their starter picks 🎉';
      optsEl.innerHTML = '';
      optsEl.insertAdjacentHTML('beforeend', '<div style="grid-column:1/-1" class="grid-3">' +
        picks.map(function (p) { return App.cardHTML(p).replace('class="product-card reveal"', 'class="product-card"'); }).join('') + '</div>' +
        '<div style="grid-column:1/-1;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
        '<a class="btn" href="explorer.html">Take the full quiz →</a>' +
        '<a class="btn-ghost btn" href="shop.html">Browse all gear</a></div>');
      App.wireAdd(optsEl);
      App.refreshReveal(optsEl);
    }
    draw();
  }

  /* ---------- newsletter ---------- */
  function initNews() {
    var f = $('#newsletter-form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var em = $('#nl-email');
      var ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim());
      var msg = $('#nl-msg');
      if (!ok) {
        em.classList.add('error');
        msg.textContent = 'Please enter a valid parent email address.';
        msg.style.color = 'var(--danger)';
        return;
      }
      em.classList.remove('error');
      msg.style.color = 'var(--green)';
      msg.textContent = '✓ You’re on the list! Play guides land every Friday. Unsubscribe anytime.';
      em.value = '';
      NP.toast('✓ Subscribed — welcome to the NextPlay family!');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
    initQuiz();
    initNews();
  });
})();