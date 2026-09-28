/* NextPlay Kids — Sports Explorer: multi-step quiz → 3 sport recommendations */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var NPD = window.NPD, NP = window.NP, App = window.NPApp;

  var QUESTIONS = [
    { q: 'Child’s age group', key: 'age', opts: [['2–4 yrs · Tiny Movers', '🧒', 0], ['5–7 yrs · Little Athletes', '🏃', 1], ['8–11 yrs · Rising Players', '🤾', 2], ['12–14 yrs · Young Competitors', '🏅', 3], ['15–17 yrs · Future Champions', '🏆', 4]] },
    { q: 'What excites them most?', key: 'interest', opts: [['Team games & friends', '🤝', 'team'], ['Solo challenge & mastery', '🎯', 'solo'], ['Creative movement & rhythm', '💃', 'creative'], ['Fast-paced & racing', '⚡', 'fast'], ['Outdoors & adventure', '🏕️', 'outdoors'], ['Strategy & focus', '🧠', 'strategy'], ['Strength & power', '💪', 'strength'], ['Water & swimming', '🌊', 'water']] },
    { q: 'Experience so far', key: 'exp', opts: [['Total beginner', '🌱', 'Beginner'], ['Has played casually', '⚽', 'Intermediate'], ['Trains regularly', '🔥', 'Advanced']] },
    { q: 'Time available each week', key: 'time', opts: [['1–2 hours', '🕐', 'light'], ['3–5 hours', '🕑', 'medium'], ['6+ hours', '🕒', 'serious']] },
    { q: 'Monthly budget for play', key: 'budget', opts: [['Under ₹2,000', '🪙', 'low'], ['₹2,000–5,000', '💵', 'mid'], ['₹5,000+', '💎', 'high']] },
    { q: 'Any accessibility needs?', key: 'access', opts: [['No specific needs', '✅', 'none'], ['Needs seated options', '🦽', 'seated'], ['Sensory-friendly settings', '🧩', 'sensory'], ['Not sure — guide us', '🤲', 'unsure']] }
  ];

  /* sport profiles: interest affinity, age sweet spots, indoor, cost tier, glyph */
  var SPORT_PROFILES = {
    'Football': { i: ['team', 'fast', 'outdoors'], ages: [5, 15], cost: 'mid', glyph: '⚽', why: 'Constant teamwork, big open spaces, and a place for every body type on the pitch.' },
    'Cricket': { i: ['strategy', 'team', 'solo'], ages: [5, 16], cost: 'mid', glyph: '🏏', why: 'Deep-focus skill play with rich Indian coaching tradition everywhere around you.' },
    'Basketball': { i: ['team', 'fast'], ages: [7, 17], cost: 'mid', glyph: '🏀', why: 'Fast indoor-friendly team play that grows confidence in every single session.' },
    'Tennis': { i: ['solo', 'fast', 'strategy'], ages: [4, 17], cost: 'high', glyph: '🎾', why: 'A lifetime sport — individual mastery with clear stages that reward patience.' },
    'Badminton': { i: ['solo', 'fast', 'strategy'], ages: [5, 17], cost: 'low', glyph: '🏸', why: 'Best value start in racquet sports; terrace rallies cost almost nothing.' },
    'Volleyball': { i: ['team', 'outdoors'], ages: [7, 17], cost: 'low', glyph: '🏐', why: 'Pure team energy with minimal gear — one ball, a net, and friends.' },
    'Baseball/Softball': { i: ['team', 'strategy'], ages: [4, 14], cost: 'mid', glyph: '⚾', why: 'Patience, positions and tee-ball entry that keeps early swings safe and fun.' },
    'Hockey': { i: ['team', 'fast'], ages: [8, 16], cost: 'mid', glyph: '🏑', why: 'India’s field-hockey heritage makes academy pathways genuinely strong.' },
    'Rugby': { i: ['team', 'strength', 'outdoors'], ages: [7, 17], cost: 'low', glyph: '🏉', why: 'Tag format keeps early years safe while building fearless ball-carrying.' },
    'Athletics': { i: ['fast', 'solo', 'outdoors'], ages: [5, 17], cost: 'low', glyph: '🏃', why: 'Run-jump-throw is the foundation of every other sport — start anywhere.' },
    'Swimming': { i: ['water', 'solo'], ages: [3, 17], cost: 'high', glyph: '🏊', why: 'The safety skill for life, plus gentle joints and calm, focused effort.' },
    'Cycling': { i: ['outdoors', 'fast', 'solo'], ages: [4, 16], cost: 'mid', glyph: '🚲', why: 'Family-friendly freedom with a clear skill ladder from lane to track.' },
    'Skating': { i: ['solo', 'fast', 'creative'], ages: [5, 15], cost: 'mid', glyph: '🛼', why: 'Balance artistry with adjustable boots that grow through three sizes.' },
    'Martial Arts': { i: ['strength', 'solo', 'strategy'], ages: [5, 17], cost: 'mid', glyph: '🥋', why: 'Confidence, discipline and anti-bullying skills in structured, safe progressions.' },
    'Gymnastics': { i: ['creative', 'strength', 'solo'], ages: [3, 14], cost: 'mid', glyph: '🤸', why: 'Total-body control and flexibility that transfers to every other sport.' },
    'Dance & Cheer': { i: ['creative', 'team'], ages: [4, 17], cost: 'low', glyph: '💃', why: 'Rhythm, expression and team spirit with zero appearance scoring.' },
    'Table Tennis': { i: ['strategy', 'fast', 'solo'], ages: [6, 17], cost: 'low', glyph: '🏓', why: 'Lightning reflexes, tiny footprint, monsoon-proof indoor play.' },
    'Archery': { i: ['strategy', 'solo', 'strength'], ages: [8, 17], cost: 'high', glyph: '🏹', why: 'Calm, precise focus — a rare meditative competitive sport for kids.' },
    'Adventure/Outdoor': { i: ['outdoors', 'strength', 'team'], ages: [5, 17], cost: 'mid', glyph: '🏕️', why: 'Nature plus nerve: trekking, ropes and camp-craft build real resilience.' }
  };

  var BUDGET_MAP = { low: 1500, mid: 4000, high: 99999 };

  var state = { step: 0, answers: {} };

  function initQuiz() {
    var shell = $('#xq-shell');
    if (!shell) return;
    try { var saved = JSON.parse(sessionStorage.getItem('np_quiz_state') || 'null'); if (saved && saved.step) { state = saved; } } catch (e) { }
    var bar = $('#xq-bar'), qEl = $('#xq-q'), opts = $('#xq-opts'), back = $('#xq-back'), prog = $('#xq-prog');
    function save() { sessionStorage.setItem('np_quiz_state', JSON.stringify(state)); }
    function draw() {
      var qd = QUESTIONS[state.step];
      prog.textContent = 'Question ' + (state.step + 1) + ' of ' + QUESTIONS.length;
      bar.style.width = (state.step / QUESTIONS.length * 100) + '%';
      qEl.textContent = qd.q;
      var ans = state.answers[qd.key];
      opts.innerHTML = qd.opts.map(function (o) {
        var sel = ans && ans.v === (typeof o[2] === 'number' ? NPD.AGES[o[2]].id : o[2]);
        return '<button class="quiz-opt' + (sel ? ' sel' : '') + '" data-i="' + o[2] + '"><span class="g" aria-hidden="true">' + o[1] + '</span>' + o[0] + '</button>';
      }).join('');
      back.style.visibility = state.step > 0 ? 'visible' : 'hidden';
    }
    opts.addEventListener('click', function (e) {
      var b = e.target.closest('.quiz-opt');
      if (!b) return;
      var qd = QUESTIONS[state.step];
      var idx = b.getAttribute('data-i');
      var opt = qd.opts.find(function (o) { return String(o[2]) === String(idx); });
      state.answers[qd.key] = {
        label: opt[0],
        v: typeof opt[2] === 'number' ? NPD.AGES[opt[2]].id : opt[2],
        idx: opt[2]
      };
      save();
      b.classList.add('sel');
      setTimeout(function () {
        state.step++;
        if (state.step < QUESTIONS.length) { draw(); }
        else { result(); }
      }, 220);
    });
    back.addEventListener('click', function () {
      if (state.step > 0) { state.step--; save(); draw(); }
    });
    if (state.step >= QUESTIONS.length) result(); else draw();
    var rst = $('#xq-restart');
    if (rst) rst.addEventListener('click', function () {
      state = { step: 0, answers: {} };
      sessionStorage.removeItem('np_quiz_state');
      $('#xq-results').style.display = 'none';
      $('#xq-quiz').style.display = '';
      draw();
    });

    function result() {
      var a = state.answers;
      /* score sports */
      var ageIdx = typeof a.age.idx === 'number' ? a.age.idx : 2;
      var age = NPD.AGES[ageIdx];
      var scores = {};
      Object.keys(SPORT_PROFILES).forEach(function (sp) {
        var pr = SPORT_PROFILES[sp];
        var s = 0;
        if (a.interest && pr.i.indexOf(a.interest.v) !== -1) s += 3;
        if (a.age && age.num[0] <= pr.ages[1] && age.num[1] >= pr.ages[0]) s += 2;
        if (a.budget) {
          var cap = BUDGET_MAP[a.budget.v] || 99999;
          var entryCost = pr.cost === 'low' ? 1200 : pr.cost === 'mid' ? 3000 : 5500;
          if (entryCost <= cap) s += 2; else s -= 1;
        }
        if (a.time) {
          if (a.time.v === 'light' && pr.cost === 'low') s += 1;
          if (a.time.v === 'serious' && (pr.cost === 'mid' || pr.cost === 'high')) s += 1;
        }
        if (a.exp && a.exp.v === 'Beginner' && pr.cost !== 'high') s += 1;
        if (a.access && a.access.v === 'seated') {
          if (['Swimming', 'Table Tennis', 'Archery', 'Athletics'].indexOf(sp) !== -1) s += 3; else s -= 1;
        }
        scores[sp] = s;
      });
      var ranked = Object.keys(scores).sort(function (x, y) { return scores[y] - scores[x]; }).slice(0, 3);
      var max = Math.max(scores[ranked[0]], 1);
      /* render */
      $('#xq-quiz').style.display = 'none';
      var res = $('#xq-results');
      res.style.display = '';
      var sum = $('#xq-summary');
      sum.innerHTML = ['age', 'interest', 'exp', 'time', 'budget', 'access'].map(function (k) {
        return a[k] ? '<span class="chip-x" style="cursor:default">' + NP.esc(a[k].label) + '</span>' : '';
      }).join(' ');
      var cards = $('#xq-cards');
      cards.innerHTML = ranked.map(function (sp, i) {
        var pr = SPORT_PROFILES[sp];
        var pct = Math.round(60 + (scores[sp] / max) * 40);
        var hh = (i * 90 + 140) % 360;
        return '<article class="card rec-card reveal">' +
          '<span class="rec-rank">Match ' + (i + 1) + '</span>' +
          '<div style="font-size:2.6rem;margin:6px 0" aria-hidden="true">' + pr.glyph + '</div>' +
          '<h3>' + sp + '</h3>' +
          '<div class="match-bar" role="img" aria-label="Match strength ' + pct + ' percent"><i style="width:' + pct + '%"></i></div>' +
          '<small style="color:var(--muted)">' + pct + '% match · ' + pr.cost + ' entry cost</small>' +
          '<p style="margin-top:10px;font-size:.9rem">' + NP.esc(pr.why) + '</p>' +
          '<p style="margin-top:8px;font-size:.8rem"><b style="color:var(--text)">Great because:</b> ' +
          (a.interest ? NP.esc(a.interest.label) : 'their curiosity') + ' + ages ' + age.range + ' is a proven sweet spot.</p>' +
          '</article>';
      }).join('');
      /* starter products for top match */
      var top = ranked[0];
      var starters = NPD.PRODUCTS.filter(function (p) { return p.sport === top; }).slice(0, 3);
      var bundle = $('#xq-bundle');
      if (bundle) {
        bundle.innerHTML = starters.map(function (p) { return App.cardHTML(p).replace('class="product-card reveal"', 'class="product-card"'); }).join('');
        App.wireAdd(bundle);
        App.refreshReveal(bundle.parentElement);
      }
      var prog2 = $('#xq-program');
      if (prog2) {
        var pr = NPD.PROGRAMS.filter(function (g) {
          return g.title.toLowerCase().indexOf(top.toLowerCase().split('/')[0]) !== -1 || top === 'Adventure/Outdoor' && g.id === 'g11';
        })[0] || NPD.PROGRAMS[0];
        prog2.innerHTML = '<div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">' +
          '<span style="font-size:2.4rem" aria-hidden="true">' + pr.glyph + '</span>' +
          '<div><b>' + pr.title + '</b><div class="meta-row"><span>📍 ' + pr.venue + '</span><span>🕐 ' + pr.when + '</span><span>👥 ' + pr.ratio + '</span></div></div>' +
          '<a class="btn btn-sm" style="margin-left:auto" href="programs.html">View program →</a></div>';
      }
      App.refreshReveal(cards);
      /* log quiz completion as a lead (answers + top recommendation) */
      if (window.NPSupabase) {
        window.NPSupabase.insert('quiz_leads', {
          answers: {
            age: a.age ? a.age.label : null,
            interest: a.interest ? a.interest.label : null,
            experience: a.exp ? a.exp.label : null,
            time: a.time ? a.time.label : null,
            budget: a.budget ? a.budget.label : null,
            access: a.access ? a.access.label : null
          },
          recommended_sport: ranked.join(', '),
          phone: null
        }).catch(function () { /* silent */ });
      }
    }
  }

  document.addEventListener('DOMContentLoaded', initQuiz);
})();