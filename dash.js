/* NextPlay Kids — parent dashboard interactions: child tabs, toggles, reorder */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var NPD = window.NPD, NP = window.NP, App = window.NPApp;

  var KIDS = {
    arjun: {
      name: 'Aarav, 9', glyph: '⚽', age: [8, 11], sport: 'Football',
      progress: [42, 58, 66, 74, 81, 88],
      ach: ['⚽ First goal', '🛡 Safety star', '🏃 100 m PB', '🤝 Team captain (1 match)'],
      recSports: ['Football', 'Athletics', 'Swimming']
    },
    zoya: {
      name: 'Zoya, 6', glyph: '🤸', age: [5, 7], sport: 'Gymnastics',
      progress: [30, 44, 52, 60, 71, 78],
      ach: ['🌟 Cartwheel done!', '🤸 Beam walk', '🏊 5 m swim'],
      recSports: ['Gymnastics', 'Dance & Cheer', 'Athletics']
    }
  };
  var current = 'arjun';

  function initDash() {
    if (!$('.pd-dash')) return;
    /* child tabs */
    $$('.child-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.child-tab').forEach(function (x) { x.classList.remove('sel'); });
        t.classList.add('sel');
        current = t.getAttribute('data-child');
        renderChild();
      });
    });
    renderChild();
    /* quick reorder */
    App.wireAdd($('#reorder-grid'));
    if ($('#reorder-grid')) App.refreshReveal($('#reorder-grid'));
    /* animate bars */
    $$('.bar-col i').forEach(function (bar) {
      var w = bar.getAttribute('data-h');
      bar.style.height = '0%';
      setTimeout(function () { bar.style.height = w + '%'; }, 120);
    });
  }

  function renderChild() {
    var k = KIDS[current];
    var head = $('#child-head');
    if (head) head.textContent = k.name + ' · ' + k.sport;
    var headP = $('#child-head-progress');
    if (headP) headP.textContent = k.name.split(',')[0];
    /* progress bars */
    var pc = $('#progress-chart');
    if (pc) {
      var labels = ['Sep W1', 'Sep W2', 'Sep W3', 'Sep W4', 'Oct W1', 'Oct W2'];
      pc.innerHTML = k.progress.map(function (v, i) {
        return '<div class="bar-col"><b>' + v + '%</b><i data-h="' + v + '" style="height:' + v + '%"></i><small>' + labels[i] + '</small></div>';
      }).join('');
      $$('#progress-chart .bar-col i').forEach(function (bar, i) {
        bar.style.height = '0%';
        setTimeout(function () { bar.style.height = k.progress[i] + '%'; }, 60 * i);
      });
    }
    /* achievements */
    var ach = $('#ach-row');
    if (ach) ach.innerHTML = k.ach.map(function (a) { return '<span class="ach">' + a + '</span>'; }).join('');
    /* recommended sports chips */
    var rs = $('#rec-sports');
    if (rs) rs.innerHTML = k.recSports.map(function (s) {
      return '<a class="chip-x" style="cursor:pointer;text-decoration:none" href="shop.html?sport=' + encodeURIComponent(s) + '">' + s + ' →</a>';
    }).join('');
    /* recommended products */
    var grid = $('#rec-products');
    if (grid) {
      var picks = NPD.PRODUCTS.filter(function (p) {
        return p.sport === k.sport && p.age[0] <= k.age[1] && p.age[1] >= k.age[0];
      }).slice(0, 3);
      if (picks.length < 3) {
        NPD.PRODUCTS.forEach(function (p) {
          if (picks.length < 3 && p.age[0] <= k.age[1] && p.age[1] >= k.age[0] && picks.indexOf(p) === -1) picks.push(p);
        });
      }
      grid.innerHTML = picks.map(function (p) { return App.cardHTML(p).replace('class="product-card reveal"', 'class="product-card"'); }).join('');
      App.wireAdd(grid);
    }
  }

  document.addEventListener('DOMContentLoaded', initDash);
})();