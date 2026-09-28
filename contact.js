/* NextPlay Kids — contact page: form validation + FAQ accordions are handled by app.js */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };

  function initContact() {
    var f = $('#contact-form');
    if (!f) return;
    var ok = true;
    var checks = [
      ['#c-name', function (v) { return v.trim().length >= 2; }, 'Please tell us your name'],
      ['#c-email', function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()); }, 'Enter a valid email'],
      ['#c-phone', function (v) { return v === '' || /^[6-9]\d{9}$/.test(v.trim()); }, '10-digit Indian mobile, or leave blank'],
      ['#c-msg', function (v) { return v.trim().length >= 10; }, 'A few more words helps us help you (10+ chars)']
    ];
    checks.forEach(function (c) {
      var el = $(c[0]);
      var err = el.closest('.field').querySelector('.err-msg');
      if (err) err.textContent = c[2];
      el.addEventListener('blur', function () {
        var good = c[1](el.value);
        el.classList.toggle('error', !good);
        el.closest('.field').classList.toggle('invalid', !good);
      });
      el.addEventListener('input', function () {
        if (el.classList.contains('error') && c[1](el.value)) {
          el.classList.remove('error');
          el.closest('.field').classList.remove('invalid');
        }
      });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      ok = true;
      checks.forEach(function (c) {
        var el = $(c[0]);
        var good = c[1](el.value);
        el.classList.toggle('error', !good);
        el.closest('.field').classList.toggle('invalid', !good);
        if (!good) ok = false;
      });
      var topic = $('#c-topic');
      if (topic && !topic.value) ok = false;
      if (!ok) { NP.toast('Please fix the highlighted fields'); return; }
      $('#contact-done').style.display = '';
      f.style.display = 'none';
      NP.toast('✓ Message sent — we reply within 1 working day');
    });
  }

  document.addEventListener('DOMContentLoaded', initContact);
})();