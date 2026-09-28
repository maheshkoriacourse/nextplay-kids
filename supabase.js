/* NextPlay Kids — supabase.js · thin REST client for orders/waitlist/quiz_leads
   Uses the publishable (anon) key — safe for the browser. No secrets beyond anon. */
(function () {
  'use strict';
  var URL = 'https://mbymijjbjisrfjtgirka.supabase.co';
  var KEY = 'sb_publishable_PB6SPMmbycD6qGoKIIkZtA_-Bp7SIW-';

  function headers(extra) {
    var h = { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }

  function insert(table, row) {
    return fetch(URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(row)
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error((data && data.message) || ('HTTP ' + r.status));
        return data;
      });
    });
  }

  function select(table, query) {
    return fetch(URL + '/rest/v1/' + table + (query ? '?' + query : ''), {
      headers: headers()
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  window.NPSupabase = { insert: insert, select: select, URL: URL };
})();