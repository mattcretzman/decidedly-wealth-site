/* Ad measurement for decidedlyvaluation.com (RJ's valuation tool).
   Loaded by ONE line in the tool's pages: <script src="https://decidedlywealth.com/valuation-tracking.js" defer></script>
   - Google Ads tag (AW-18360721058) + LinkedIn Insight tag (partner 10344852): page visits, for ad reporting and retargeting.
   - One Google Ads conversion "Valuation Tool Lead (decidedlyvaluation.com)" when the report opens (the tool adds body.rpt-open).
   Sends no answers, names or emails: only that a report opened. Owner: Stormbreaker Digital for Decidedly Wealth. */
(function () {
  if (window.__dwValTrk) return; window.__dwValTrk = 1;
  var AW = 'AW-18360721058', SEND_TO = 'AW-18360721058/7hhfCOGjmb4dEKK9ibNE', LI = '10344852';
  var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + AW;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { dataLayer.push(arguments); };
  gtag('js', new Date()); gtag('config', AW);
  window._linkedin_partner_id = LI; window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(LI);
  if (!window.lintrk) { window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); }; window.lintrk.q = []; }
  var l = document.createElement('script'); l.async = true; l.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(l);
  var fired = false;
  function check() {
    if (fired || !document.body || !document.body.classList.contains('rpt-open')) return;
    fired = true; gtag('event', 'conversion', { send_to: SEND_TO });
  }
  function watch() { check(); new MutationObserver(check).observe(document.body, { attributes: true, attributeFilter: ['class'] }); }
  if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch);
})();
