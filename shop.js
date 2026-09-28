/* NextPlay Kids — shared shop-grid engine + cart helpers (used by shop & product pages) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var NPD = window.NPD, NP = window.NP;
  var D = NPD.PRODUCTS;

  function hueTile(hue, glyph, alt, badges) {
    var h2 = (hue + 40) % 360;
    var style = 'background:linear-gradient(135deg,hsl(' + hue + ' 70% 26%),hsl(' + h2 + ' 80% 12%))';
    var b = badges || '';
    return '<div class="p-img" style="' + style + '" role="img" aria-label="' + NP.esc(alt) + '">' +
      '<span aria-hidden="true">' + glyph + '</span>' + b + '</div>';
  }
  function badgesOf(p) {
    var out = '<span class="badge badge-age" title="Recommended age">' + p.age[0] + '–' + p.age[1] + ' yrs</span>';
    if (p.safe && p.safe !== 'Digital' && p.safe !== 'Coached') out += '<span class="badge badge-safe" title="Safety certified">🛡 ' + NP.esc(p.safe) + '</span>';
    if (p.sustain) out += '<span class="badge badge-eco" title="Sustainable choice">♻ Sustainable</span>';
    return out;
  }
  function cardHTML(p) {
    var dots = (p.colors || []).map(function (c) { return '<span class="color-dot" style="background:' + c + '"></span>'; }).join('');
    var sizes = (p.sizes || []).slice(0, 3).map(function (s) { return '<span class="size-chip">' + NP.esc(s) + '</span>'; }).join('');
    return '<article class="product-card reveal">' +
      '<a class="p-link" href="product.html?id=' + p.id + '" aria-label="' + NP.esc(p.name) + ', ages ' + p.age[0] + ' to ' + p.age[1] + '">' +
      hueTile(p.hue, p.emoji, p.name + ' — ' + p.catName + ' product image', badgesOf(p)) +
      '</a><div class="p-body">' +
      '<div class="p-meta">' + NP.esc(p.catName) + ' · ' + NP.esc(p.sport) + '</div>' +
      '<h3><a class="p-link" style="color:var(--text);text-decoration:none" href="product.html?id=' + p.id + '">' + NP.esc(p.name) + '</a></h3>' +
      '<div class="rating"><span class="stars" aria-hidden="true">' + NP.stars(p.rating) + '</span> ' + p.rating.toFixed(1) + ' (' + p.rc + ')</div>' +
      '<div class="meta-row"><span>' + (p.ind === 'indoor' ? '🏠 Indoor' : p.ind === 'outdoor' ? '🌤 Outdoor' : '🔄 Indoor/Outdoor') + '</span><span>' + NP.esc(p.lvl) + '</span></div>' +
      '<div class="color-dots" aria-hidden="true">' + dots + '</div>' +
      '<div class="size-chips" aria-label="Available sizes">' + sizes + '</div>' +
      '<div class="price-row"><span class="price">' + NP.money(p.price) + '</span>' +
      (p.mrp > p.price ? '<span class="price-old">' + NP.money(p.mrp) + '</span>' : '') + '</div>' +
      '<button class="btn add-btn" data-add="' + p.id + '">Add to Cart</button>' +
      '</div></article>';
  }
  function skeletonHTML() {
    return '<div class="skeleton"><div class="sk-img sk-shimmer"></div><div class="sk-line w60"></div><div class="sk-line"></div><div class="sk-line w40"></div><div class="sk-line" style="width:30%;margin-bottom:20px"></div></div>';
  }
  function wireAdd(scope) {
    (scope || document).addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]');
      if (!b) return;
      e.preventDefault();
      addToCart(b.getAttribute('data-add'), 1, null, null);
    });
  }
  function addToCart(id, qty, size, color) {
    var p = D.find(function (x) { return x.id === id; });
    if (!p) return;
    var items = NP.cart.get();
    var key = id + '|' + (size || p.sizes[0] || '') + '|' + (color || (p.colors && p.colors[0]) || '');
    var ex = items.find(function (i) { return i.key === key; });
    if (ex) ex.qty += (qty || 1);
    else items.push({ key: key, id: id, qty: qty || 1, size: size || (p.sizes && p.sizes[0]) || '', color: color || (p.colors && p.colors[0]) || '' });
    NP.cart.save(items);
    NP.toast('✓ Added to cart — ' + p.name);
  }

  /* ================= SHOP PAGE ================= */
  var SHOP_STATE = {
    q: '', sport: 'All', cat: 'All', lvl: 'All', price: 7000, safe: false,
    ind: 'All', team: false, eco: false, sort: 'featured'
  };
  function readParams() {
    var usp = new URLSearchParams(location.search);
    if (usp.get('sport')) SHOP_STATE.sport = usp.get('sport');
    if (usp.get('cat')) SHOP_STATE.cat = usp.get('cat');
    if (usp.get('age')) { SHOP_STATE.age = usp.get('age'); }
    if (usp.get('q')) SHOP_STATE.q = usp.get('q');
  }
  function applyFilters() {
    var s = SHOP_STATE, t0 = performance.now();
    var list = D.filter(function (p) {
      if (s.q && (p.name + ' ' + p.sport + ' ' + p.catName).toLowerCase().indexOf(s.q.toLowerCase()) === -1) return false;
      if (s.sport !== 'All' && p.sport !== s.sport) return false;
      if (s.cat !== 'All' && p.cat !== s.cat) return false;
      if (s.lvl !== 'All' && !(p.lvl === s.lvl || p.lvl === 'All Levels')) return false;
      if (p.price > s.price) return false;
      if (s.safe && !/^(EN 71|CE|ISO|CPSC|BS 7928|FIH|ISO 12402)/.test(p.safe)) return false;
      if (s.ind !== 'All' && !(p.ind === s.ind || p.ind === 'both')) return false;
      if (s.team && !p.team) return false;
      if (s.eco && !p.sustain) return false;
      if (s.age && !(p.age[1] >= s.age[0] && p.age[0] <= s.age[1])) return false;
      return true;
    });
    if (s.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
    else if (s.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
    else if (s.sort === 'rating') list.sort(function (a, b) { return b.rating - a.rating; });
    else if (s.sort === 'new') list.sort(function (a, b) { return b.id.localeCompare(a.id); });
    else if (s.sort === 'featured') list.sort(function (a, b) { return (b.rating * 100 + b.rc / 50) - (a.rating * 100 + a.rc / 50); });
    render(list);
    var ms = Math.max(1, Math.round(performance.now() - t0));
    var nEl = $('#result-count');
    if (nEl) nEl.textContent = list.length + ' product' + (list.length === 1 ? '' : 's') + ' · ' + ms + ' ms';
    var eEl = $('#empty-state');
    if (eEl) eEl.style.display = list.length ? 'none' : '';
  }
  function render(list) {
    var grid = $('#shop-grid');
    if (!grid) return;
    grid.innerHTML = list.map(cardHTML).join('');
    var chips = $('#active-chips');
    if (chips) {
      var c = [];
      if (SHOP_STATE.q) c.push(['q', 'Search: “' + SHOP_STATE.q + '”']);
      if (SHOP_STATE.sport !== 'All') c.push(['sport', SHOP_STATE.sport]);
      if (SHOP_STATE.cat !== 'All') c.push(['cat', NPD.CATS[SHOP_STATE.cat] || SHOP_STATE.cat]);
      if (SHOP_STATE.lvl !== 'All') c.push(['lvl', SHOP_STATE.lvl]);
      if (SHOP_STATE.safe) c.push(['safe', '🛡 Certified only']);
      if (SHOP_STATE.ind !== 'All') c.push(['ind', SHOP_STATE.ind === 'indoor' ? '🏠 Indoor' : '🌤 Outdoor']);
      if (SHOP_STATE.team) c.push(['team', 'School/team use']);
      if (SHOP_STATE.eco) c.push(['eco', '♻ Sustainable']);
      if (SHOP_STATE.age) c.push(['age', SHOP_STATE.label]);
      chips.innerHTML = c.map(function (x) {
        return '<button class="chip-x" data-clear="' + x[0] + '" aria-label="Remove filter ' + NP.esc(x[1]) + '">' + NP.esc(x[1]) + ' ✕</button>';
      }).join('');
    }
    if (window.NPApp) window.NPApp.refreshReveal(grid);
  }
  function bindShop() {
    readParams();
    var grid = $('#shop-grid');
    if (!grid) return;
    /* skeletons first */
    grid.innerHTML = Array.apply(null, Array(8)).map(skeletonHTML).join('');
    /* sports */
    var sportBox = $('#f-sports');
    if (sportBox) {
      sportBox.innerHTML = ['All'].concat(NPD.SPORTS).map(function (s) {
        return '<label class="check"><input type="radio" name="fsport" value="' + s + '"' + (s === SHOP_STATE.sport ? ' checked' : '') + '> ' + s + '</label>';
      }).join('');
    }
    /* cats */
    var catBox = $('#f-cats');
    if (catBox) {
      catBox.innerHTML = Object.keys(NPD.CATS).map(function (k) {
        return '<label class="check"><input type="checkbox" data-cat="' + k + '"> ' + NPD.CATS[k] + '</label>';
      }).join('');
    }
    var $q = $('#shop-search'), $sort = $('#shop-sort'), $price = $('#f-price'), $priceOut = $('#f-price-out');
    if ($q) {
      $q.value = SHOP_STATE.q;
      var deb;
      $q.addEventListener('input', function () {
        clearTimeout(deb);
        deb = setTimeout(function () { SHOP_STATE.q = $q.value.trim(); applyShop(); }, 180);
      });
    }
    if ($sort) $sort.addEventListener('change', function () { SHOP_STATE.sort = $sort.value; applyShop(); });
    document.querySelectorAll('#f-sports input').forEach(function (r) {
      r.addEventListener('change', function () { SHOP_STATE.sport = r.value; applyShop(); });
    });
    document.querySelectorAll('[data-cat]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var sel = $$('[data-cat]').filter(function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-cat'); });
        SHOP_STATE.cat = sel.length === 1 ? sel[0] : 'All';
        if (sel.length > 1) { /* multi-cat: allow OR */
          SHOP_STATE.catList = sel;
        } else SHOP_STATE.catList = null;
        applyShop();
      });
    });
    if ($price) {
      $price.addEventListener('input', function () {
        SHOP_STATE.price = +$price.value;
        if ($priceOut) $priceOut.textContent = 'Up to ' + NP.money(SHOP_STATE.price);
        applyShop();
      });
    }
    var safeCb = $('#f-safe'), teamCb = $('#f-team'), ecoCb = $('#f-eco'), indSel = $('#f-indoor');
    if (safeCb) safeCb.addEventListener('change', function () { SHOP_STATE.safe = safeCb.checked; applyShop(); });
    if (teamCb) teamCb.addEventListener('change', function () { SHOP_STATE.team = teamCb.checked; applyShop(); });
    if (ecoCb) ecoCb.addEventListener('change', function () { SHOP_STATE.eco = ecoCb.checked; applyShop(); });
    if (indSel) indSel.addEventListener('change', function () { SHOP_STATE.ind = indSel.value; applyShop(); });
    var lvlSel = $('#f-lvl');
    if (lvlSel) lvlSel.addEventListener('change', function () { SHOP_STATE.lvl = lvlSel.value; applyShop(); });
    document.addEventListener('click', function (e) {
      var cx = e.target.closest('[data-clear]');
      if (!cx) return;
      var k = cx.getAttribute('data-clear');
      if (k === 'q') { SHOP_STATE.q = ''; if ($q) $q.value = ''; }
      if (k === 'sport') { SHOP_STATE.sport = 'All'; var r = document.querySelector('#f-sports input[value="All"]'); if (r) r.checked = true; }
      if (k === 'cat') { SHOP_STATE.cat = 'All'; SHOP_STATE.catList = null; $$('[data-cat]').forEach(function (x) { x.checked = false; }); }
      if (k === 'lvl') { SHOP_STATE.lvl = 'All'; if (lvlSel) lvlSel.value = 'All'; }
      if (k === 'safe') { SHOP_STATE.safe = false; if (safeCb) safeCb.checked = false; }
      if (k === 'ind') { SHOP_STATE.ind = 'All'; if (indSel) indSel.value = 'All'; }
      if (k === 'team') { SHOP_STATE.team = false; if (teamCb) teamCb.checked = false; }
      if (k === 'eco') { SHOP_STATE.eco = false; if (ecoCb) ecoCb.checked = false; }
      if (k === 'age') { SHOP_STATE.age = null; SHOP_STATE.label = null; }
      applyShop();
    });
    /* first paint with a short skeleton beat */
    setTimeout(function () {
      applyShop();
      wireAdd(grid);
    }, 550);
  }
  function applyShop() {
    if (SHOP_STATE.catList && SHOP_STATE.catList.length) {
      var tmp = SHOP_STATE.cat; SHOP_STATE.cat = 'All';
      var list = D.filter(function (p) { return SHOP_STATE.catList.indexOf(p.cat) !== -1; });
      SHOP_STATE.cat = tmp;
      /* run main filter then intersect by catList */
      applyBase();
      var grid = $('#shop-grid');
      var base = $$('#shop-grid .product-card').length;
      if (base && SHOP_STATE.catList) {
        /* re-render with catList applied */
        var shown = D.filter(function (p) {
          return SHOP_STATE.catList.indexOf(p.cat) !== -1 && baseFilter(p);
        });
        render(shown);
        var nEl = $('#result-count');
        if (nEl) nEl.textContent = shown.length + ' product' + (shown.length === 1 ? '' : 's');
        var eEl = $('#empty-state');
        if (eEl) eEl.style.display = shown.length ? 'none' : '';
      }
      return;
    }
    applyBase();
  }
  function baseFilter(p) {
    var s = SHOP_STATE;
    if (s.q && (p.name + ' ' + p.sport + ' ' + p.catName).toLowerCase().indexOf(s.q.toLowerCase()) === -1) return false;
    if (s.sport !== 'All' && p.sport !== s.sport) return false;
    if (s.cat !== 'All' && p.cat !== s.cat) return false;
    if (s.lvl !== 'All' && !(p.lvl === s.lvl || p.lvl === 'All Levels')) return false;
    if (p.price > s.price) return false;
    if (s.safe && !/^(EN 71|CE|ISO|CPSC|BS 7928|FIH|ISO 12402)/.test(p.safe)) return false;
    if (s.ind !== 'All' && !(p.ind === s.ind || p.ind === 'both')) return false;
    if (s.team && !p.team) return false;
    if (s.eco && !p.sustain) return false;
    if (s.age && !(p.age[1] >= s.age[0] && p.age[0] <= s.age[1])) return false;
    return true;
  }
  function applyBase() {
    var s = SHOP_STATE;
    var list = D.filter(baseFilter);
    var sortFns = {
      'price-asc': function (a, b) { return a.price - b.price; },
      'price-desc': function (a, b) { return b.price - a.price; },
      'rating': function (a, b) { return b.rating - a.rating; },
      'new': function (a, b) { return b.id.localeCompare(a.id); }
    };
    if (s.sort === 'featured') list.sort(function (a, b) { return (b.rating * 100 + b.rc / 50) - (a.rating * 100 + a.rc / 50); });
    else if (sortFns[s.sort]) list.sort(sortFns[s.sort]);
    render(list);
    var nEl = $('#result-count');
    if (nEl) nEl.textContent = list.length + ' product' + (list.length === 1 ? '' : 's');
    var eEl = $('#empty-state');
    if (eEl) eEl.style.display = list.length ? 'none' : '';
  }

  /* ================= PRODUCT PAGE ================= */
  function initProduct() {
    var usp = new URLSearchParams(location.search);
    var id = usp.get('id') || 'p01';
    var p = D.find(function (x) { return x.id === id; }) || D[0];
    document.title = p.name + ' — NextPlay Kids';
    var hue = p.hue, h2 = (hue + 40) % 360;
    var grad = 'linear-gradient(135deg,hsl(' + hue + ' 70% 26%),hsl(' + h2 + ' 80% 12%))';
    $('#pd-crumb-sport').textContent = p.sport;
    $('#pd-name').textContent = p.name;
    $('#pd-cat').textContent = p.catName + ' · ' + p.sport;
    var starsEl = $('#pd-stars'); if (starsEl) starsEl.textContent = NP.stars(p.rating) + ' ' + p.rating.toFixed(1) + ' (' + p.rc + ' reviews)';
    var ageEl = $('#pd-age'); if (ageEl) ageEl.textContent = 'Ages ' + p.age[0] + '–' + p.age[1] + ' yrs';
    $('#pd-price').textContent = NP.money(p.price);
    var old = $('#pd-mrp'); if (old) old.textContent = p.mrp > p.price ? NP.money(p.mrp) : '';
    var desc = $('#pd-desc'); if (desc) desc.textContent = p.desc;
    var notes = $('#pd-notes'); if (notes) notes.textContent = p.notes || 'Always check fit and certification guidance in our Safety & Sizing guide before first use.';
    var mainImg = $('#pd-main');
    mainImg.style.background = grad;
    mainImg.innerHTML = '<span aria-hidden="true">' + p.emoji + '</span>';
    mainImg.setAttribute('aria-label', p.name + ' — product image');
    var gwrap = $('#pd-glyphs'); if (gwrap) gwrap.textContent = p.emoji + ' ' + p.emoji + ' ' + p.emoji + ' ' + p.emoji;
    /* thumbs = 4 views */
    var thumbs = $('#pd-thumbs');
    if (thumbs) {
      thumbs.innerHTML = [0, 1, 2, 3].map(function (i) {
        var hh = (hue + i * 18) % 360;
        return '<button class="pd-thumb' + (i === 0 ? ' sel' : '') + '" style="background:linear-gradient(135deg,hsl(' + hh + ' 70% 26%),hsl(' + hh + ' 80% 12%))" data-hue="' + hh + '" aria-label="View ' + (i + 1) + ' of ' + p.name + '"><span aria-hidden="true">' + p.emoji + '</span></button>';
      }).join('');
      thumbs.addEventListener('click', function (e) {
        var b = e.target.closest('.pd-thumb'); if (!b) return;
        $$('.pd-thumb').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        var hh = +b.getAttribute('data-hue'), hh2 = (hh + 40) % 360;
        mainImg.style.background = 'linear-gradient(135deg,hsl(' + hh + ' 70% 26%),hsl(' + hh + ' 80% 12%))';
      });
    }
    /* sizes */
    var sWrap = $('#pd-sizes');
    if (sWrap) {
      sWrap.innerHTML = (p.sizes || []).map(function (s, i) {
        return '<button class="opt-btn' + (i === 0 ? ' sel' : '') + '" data-size="' + NP.esc(s) + '" aria-pressed="' + (i === 0) + '">' + NP.esc(s) + '</button>';
      }).join(' ') + ' <a class="size-link" href="safety.html#sizing">📏 Size chart</a>';
      sWrap.addEventListener('click', function (e) {
        var b = e.target.closest('.opt-btn'); if (!b) return;
        $$('.opt-btn', sWrap).forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
      });
    }
    /* colors */
    var cWrap = $('#pd-colors');
    if (cWrap) {
      cWrap.innerHTML = (p.colors || []).map(function (c, i) {
        return '<button class="opt-btn" style="padding:9px 12px" data-color="' + c + '" aria-label="Colour option ' + (i + 1) + '" aria-pressed="false"><span class="color-dot" style="background:' + c + ';display:inline-block;vertical-align:middle"></span></button>';
      }).join('');
      cWrap.addEventListener('click', function (e) {
        var b = e.target.closest('.opt-btn'); if (!b) return;
        $$('.opt-btn', cWrap).forEach(function (x) { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('sel'); b.setAttribute('aria-pressed', 'true');
      });
    }
    /* safety box */
    var sb = $('#pd-safety');
    if (sb) {
      sb.innerHTML = '🛡 <b>Safety first:</b> ' + (p.safe && p.safe !== 'Digital' ? 'Certified ' + NP.esc(p.safe) + '. ' : '') +
        'Recommended for ages ' + p.age[0] + '–' + p.age[1] + '. Adult setup check recommended before first use. ' +
        'Full guidance in our <a href="safety.html">Safety &amp; Sizing guide</a>.';
    }
    /* cart wiring */
    var addBtn = $('#pd-add'), buyBtn = $('#pd-buy');
    var chosen = function () {
      var s = $('.opt-btn.sel', $('#pd-sizes'));
      var c = $('.opt-btn.sel', $('#pd-colors'));
      return {
        size: s ? s.getAttribute('data-size') : (p.sizes && p.sizes[0]),
        color: c ? c.getAttribute('data-color') : (p.colors && p.colors[0])
      };
    };
    if (addBtn) addBtn.addEventListener('click', function () {
      var c = chosen();
      addToCart(p.id, 1, c.size, c.color);
    });
    if (buyBtn) buyBtn.addEventListener('click', function () {
      var c = chosen();
      addToCart(p.id, 1, c.size, c.color);
      location.href = 'cart.html';
    });
    /* related */
    var rel = $('#pd-related');
    if (rel) {
      var r = D.filter(function (x) { return x.id !== p.id && (x.sport === p.sport || x.cat === p.cat); }).slice(0, 4);
      rel.innerHTML = r.map(cardHTML).join('');
      if (window.NPApp) window.NPApp.refreshReveal(rel);
    }
    /* reviews sample */
    var rv = $('#pd-reviews');
    if (rv) {
      var names = [['Priya S.', 'Mumbai mama of two', 5], ['Rahul M.', 'Dad to a 9-year-old', 4], ['Coach Anita', 'NextPlay certified', 5]];
      rv.innerHTML = names.map(function (n) {
        return '<div class="review-item"><div class="quote-who"><span class="quote-avatar" aria-hidden="true">🙂</span><div><b>' + n[0] + '</b><span>' + n[1] + '</span></div><span class="stars" style="margin-left:auto" aria-label="' + n[2] + ' out of 5">' + NP.stars(n[2]) + '</span></div>' +
          '<p style="margin-top:8px">Held up beautifully through a full season of use. Sizing ran true for us and the safety certification gave us real peace of mind.</p></div>';
      }).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    if ($('#shop-grid')) bindShop();
    if ($('#pd-name')) initProduct();
  });

  /* exports for other page scripts */
  window.NPApp = {
    cardHTML: cardHTML,
    hueTile: hueTile,
    badgesOf: badgesOf,
    skeletonHTML: skeletonHTML,
    addToCart: addToCart,
    wireAdd: wireAdd,
    refreshReveal: function (root) {
      root.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); });
    }
  };
})();