/**
 * Decidedly Wealth: lead attribution.
 * Loaded on every page with <script src="/attribution.js"></script> (before uet.js).
 *
 * On landing it remembers, for 90 days in this browser:
 *   - the latest ad click id (gclid / gbraid / wbraid from Google, msclkid from Microsoft,
 *     li_fat_id from LinkedIn, fbclid from Meta) and when it was seen
 *   - first-touch UTMs, landing page and external referrer
 * Then every POST to a lead endpoint (/api/contact-form, /api/book-download,
 * /api/exit-calculator, /api/newsletter-signup) gets those fields added to its JSON body,
 * without overwriting anything the form already sent. The server writes them to the leads
 * sheet so a booked meeting can later be uploaded to Google Ads as an offline conversion.
 *
 * Never throws: storage can be blocked (private mode), and the forms must still work.
 */
(function () {
  'use strict';
  var KEY = 'dw_attr_v1', TTL = 90 * 864e5;
  var CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'li_fat_id', 'fbclid'];
  var UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var LEAD_PATHS = /^\/api\/(contact-form|book-download|exit-calculator|newsletter-signup)$/;

  function load() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || 'null');
      return a && a.ts && Date.now() - a.ts < TTL ? a : null;
    } catch (e) { return null; }
  }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }

  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; } }; }
  var a = load() || {};
  var now = Date.now();

  if (!a.landing_page) {
    a.landing_page = location.pathname;
    var ref = document.referrer || '';
    a.first_referrer = ref && ref.indexOf(location.host) === -1 ? ref : '';
    UTMS.forEach(function (k) { var v = q.get(k); if (v) a[k] = v; });
    a.ts = now;
  }
  // The newest paid click wins: that is the click Google/Microsoft will credit.
  CLICK_IDS.forEach(function (k) {
    var v = q.get(k);
    if (v) { a.click_id_type = k; a.click_id = v; a.click_ts = new Date(now).toISOString(); a.ts = now; }
  });
  save(a);

  window.dwAttribution = function () {
    var out = {};
    ['click_id', 'click_id_type', 'click_ts', 'landing_page', 'first_referrer'].concat(UTMS).forEach(function (k) {
      if (a[k]) out[k] = a[k];
    });
    return out;
  };

  if (!window.fetch) return;
  var orig = window.fetch;
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var path = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
      if (LEAD_PATHS.test(path) && init && String(init.method || '').toUpperCase() === 'POST' && typeof init.body === 'string') {
        var body = JSON.parse(init.body), extra = window.dwAttribution();
        Object.keys(extra).forEach(function (k) { if (body[k] == null || body[k] === '') body[k] = extra[k]; });
        init = Object.assign({}, init, { body: JSON.stringify(body) });
      }
    } catch (e) { /* send the original request untouched */ }
    return orig.call(this, input, init);
  };
})();
