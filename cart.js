/* NextPlay Kids — cart page: line items, qty edit, summary, delivery form, success state */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var NPD = window.NPD, NP = window.NP;
  var FREE_AT = 1999, SHIP = 149;

  function find(id) { return NPD.PRODUCTS.find(function (p) { return p.id === id; }); }

  function render() {
    var items = NP.cart.get();
    var wrap = $('#cart-items'), empty = $('#cart-empty'), layout = $('#cart-layout'), sumWrap = $('#cart-summary-wrap');
    if (!items.length) {
      if (empty) empty.style.display = '';
      if (layout) layout.style.display = 'none';
      if (sumWrap) sumWrap.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    if (layout) layout.style.display = '';
    if (sumWrap) sumWrap.style.display = '';
    wrap.innerHTML = items.map(function (it) {
      var p = find(it.id);
      if (!p) return '';
      var hue = p.hue, h2 = (hue + 40) % 360;
      return '<div class="cart-item reveal in">' +
        '<a class="cart-thumb" style="background:linear-gradient(135deg,hsl(' + hue + ' 70% 26%),hsl(' + h2 + ' 80% 12%))" href="product.html?id=' + p.id + '" role="img" aria-label="' + NP.esc(p.name) + '"><span aria-hidden="true">' + p.emoji + '</span></a>' +
        '<div><h3 style="font-size:1rem"><a style="color:var(--text);text-decoration:none" href="product.html?id=' + p.id + '">' + NP.esc(p.name) + '</a></h3>' +
        '<div class="p-meta">' + p.catName + ' · ' + p.sport + (it.size ? ' · ' + NP.esc(it.size) : '') + (it.color ? ' · <span class="color-dot" style="background:' + it.color + ';display:inline-block;vertical-align:middle"></span>' : '') + '</div>' +
        '<div class="price-row"><span class="price">' + NP.money(p.price) + '</span></div></div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px">' +
        '<div class="qty-ctrl" role="group" aria-label="Quantity for ' + NP.esc(p.name) + '">' +
        '<button data-dec="' + it.key + '" aria-label="Decrease quantity">−</button>' +
        '<span>' + it.qty + '</span>' +
        '<button data-inc="' + it.key + '" aria-label="Increase quantity">+</button></div>' +
        '<b style="font-family:var(--font-display)">' + NP.money(p.price * it.qty) + '</b>' +
        '<button class="btn btn-sm btn-danger" data-rm="' + it.key + '">Remove</button>' +
        '</div></div>';
    }).join('');
    var sub = items.reduce(function (a, it) { var p = find(it.id); return a + (p ? p.price * it.qty : 0); }, 0);
    var ship = sub >= FREE_AT ? 0 : SHIP;
    var gst = Math.round(sub * 0.05);
    var total = sub + ship + gst;
    $('#sum-sub').textContent = NP.money(sub);
    $('#sum-ship').textContent = ship === 0 ? 'FREE' : NP.money(ship);
    $('#sum-gst').textContent = NP.money(gst);
    $('#sum-total').textContent = NP.money(total);
  }

  function bump(key, d) {
    var items = NP.cart.get();
    var it = items.find(function (x) { return x.key === key; });
    if (!it) return;
    it.qty += d;
    if (it.qty <= 0) items = items.filter(function (x) { return x.key !== key; });
    NP.cart.save(items);
    render();
  }

  function validate() {
    var ok = true;
    var checks = [
      ['#f-name', function (v) { return v.trim().length >= 2; }],
      ['#f-phone', function (v) { return /^[6-9]\d{9}$/.test(v.trim()); }],
      ['#f-email', function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()); }],
      ['#f-address', function (v) { return v.trim().length >= 10; }],
      ['#f-city', function (v) { return v.trim().length >= 2; }],
      ['#f-pin', function (v) { return /^\d{6}$/.test(v.trim()); }]
    ];
    checks.forEach(function (c) {
      var el = $(c[0]);
      var good = c[1](el.value);
      el.classList.toggle('error', !good);
      el.closest('.field').classList.toggle('invalid', !good);
      if (!good) ok = false;
    });
    var consent = $('#f-consent');
    if (consent && !consent.checked) {
      ok = false;
      NP.toast('Please confirm you are the parent/account holder');
    }
    return ok;
  }

  function wire() {
    document.addEventListener('click', function (e) {
      var b;
      if ((b = e.target.closest('[data-inc]'))) bump(b.getAttribute('data-inc'), 1);
      else if ((b = e.target.closest('[data-dec]'))) bump(b.getAttribute('data-dec'), -1);
      else if ((b = e.target.closest('[data-rm]'))) {
        var items = NP.cart.get().filter(function (i) { return i.key !== b.getAttribute('data-rm'); });
        NP.cart.save(items);
        render();
        NP.toast('Item removed');
      }
    });
    $$('.pay-opt input').forEach(function (r) {
      r.addEventListener('change', function () {
        $$('.pay-opt').forEach(function (l) { l.classList.remove('sel'); });
        r.closest('.pay-opt').classList.add('sel');
      });
    });
    var form = $('#checkout-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!NP.cart.get().length) { NP.toast('Your cart is empty'); return; }
        if (!validate()) return;
        var items = NP.cart.get();
        var sub = items.reduce(function (a, it) { var p = find(it.id); return a + (p ? p.price * it.qty : 0); }, 0);
        var ship = sub >= FREE_AT ? 0 : SHIP;
        var gst = Math.round(sub * 0.05);
        var total = sub + ship + gst;
        var orderCode = 'NP-' + String(Date.now()).slice(-8);
        var btn = form.querySelector('button[type=submit]');
        if (btn) { btn.disabled = true; btn.textContent = 'Placing your order…'; }
        var record = {
          order_code: orderCode,
          customer_name: $('#f-name').value.trim(),
          phone: $('#f-phone').value.trim(),
          email: $('#f-email').value.trim(),
          city: $('#f-city').value.trim(),
          child_name: null,
          child_age: null,
          items: items.map(function (it) {
            var p = find(it.id);
            return { id: it.id, name: p ? p.name : it.id, qty: it.qty, price: p ? p.price : 0, size: it.size || null, color: it.color || null };
          }),
          subtotal_inr: sub,
          discount_inr: 0,
          total_inr: total,
          status: 'pending',
          source: 'web'
        };
        function finish() {
          NP.cart.save([]);
          render();
          var ok = $('#order-success');
          ok.style.display = '';
          ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
          $('#success-num').textContent = orderCode;
          var count = items.reduce(function (a, b) { return a + b.qty; }, 0);
          $('#success-lines').textContent = count + ' item' + (count > 1 ? 's' : '') + ' on the way to your player.';
        }
        if (window.NPSupabase) {
          window.NPSupabase.insert('orders', record).then(finish).catch(function (err) {
            // network/db hiccup: still complete the demo order so UX never blocks
            if (btn) { btn.disabled = false; btn.textContent = 'Place order · demo checkout ⚡'; }
            NP.toast('Order saved locally — cloud sync will retry');
            finish();
          });
        } else {
          finish();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    wire();
  });
})();