/* NextPlay Kids — schools page: partnership inquiry form */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var f = document.getElementById('school-form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('s-name');
      var email = document.getElementById('s-email');
      var org = document.getElementById('s-org');
      var ok = name.value.trim().length >= 2 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim()) && org.value.trim().length >= 2;
      [name, email, org].forEach(function (el) {
        var good = el === name ? name.value.trim().length >= 2 : el === email ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim()) : org.value.trim().length >= 2;
        el.classList.toggle('error', !good);
        el.closest('.field').classList.toggle('invalid', !good);
      });
      if (!ok) { NP.toast('Please complete the highlighted fields'); return; }
      document.getElementById('school-done').style.display = '';
      f.style.display = 'none';
      NP.toast('✓ Inquiry received — our schools team will call within 2 days');
    });
  });
})();