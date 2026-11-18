/**
 * Decidedly Wealth Management: Microsoft Advertising (Bing) UET tag 97294196.
 * Loaded on every page with <script src="/uet.js" defer></script> before </head>.
 * Page views are automatic. Conversion events (match the goals in Microsoft Ads account G1202117):
 *   book_request    books-thank-you page load, or the blog popup "You're in!" success
 *   calculator_lead exit / value calculator unlock form (#gate) submitted
 *   contact_form    contact form swaps to its "Thank you" message
 *   phone_click     any tel: link clicked (tracked, not a goal)
 * Never fires on a plain link click to the books page (a click is not a request).
 */
(function (w, d, t, r, u) {
  var f, n, i;
  w[u] = w[u] || [];
  f = function () { var o = { ti: "97294196", enableAutoSpaLoad: true }; o.q = w[u]; w[u] = new UET(o); w[u].push("pageLoad"); };
  n = d.createElement(t); n.src = r; n.async = 1;
  n.onload = n.onreadystatechange = function () { var s = this.readyState; s && s !== "loaded" && s !== "complete" || (f(), n.onload = n.onreadystatechange = null); };
  i = d.getElementsByTagName(t)[0]; i.parentNode.insertBefore(n, i);
})(window, document, "script", "//bat.bing.com/bat.js", "uetq");

(function () {
  'use strict';
  function ev(action) { window.uetq = window.uetq || []; window.uetq.push('event', action, { event_category: 'lead', event_label: location.pathname }); }
  function once(el, test, action) {
    if (!el) return;
    var done = false, ob = new MutationObserver(function () { if (!done && test()) { done = true; ob.disconnect(); ev(action); } });
    ob.observe(el, { childList: true, subtree: true });
  }
  function init() {
    var p = location.pathname.replace(/\.html$/, '');
    if (p === '/books-thank-you') ev('book_request');
    var popup = document.getElementById('popup-form');
    once(popup, function () { return popup.textContent.indexOf("You're in") > -1; }, 'book_request');
    var gate = document.getElementById('gate');
    if (gate) gate.addEventListener('submit', function () { ev('calculator_lead'); });
    var cf = document.querySelector('.contact-form form');
    once(cf, function () { return cf.innerHTML.indexOf('Thank you') > -1; }, 'contact_form');
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.addEventListener('click', function () { ev('phone_click'); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
