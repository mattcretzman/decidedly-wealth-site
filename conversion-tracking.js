/**
 * Decidedly Wealth Management — Google Ads Conversion Tracking
 * Fires gtag conversion events for:
 *   1. Contact form submissions (AW-18360721058/XxZFCK3bqN8cEKK9ibNE)
 *   2. Phone call clicks (AW-18360721058/IfezCODhud8cEKK9ibNE)
 *   Book requests are counted on books-thank-you.html and after the blog popup succeeds,
 *   never on a link click (a click on a books link is not a request).
 *
 * Include this script on every page AFTER the gtag config snippet.
 * It hooks into existing DOM elements — no changes needed to page HTML.
 */
(function() {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    trackFormSubmissions();
    trackPhoneClicks();
  }

  // 1. Contact Form Submission
  function trackFormSubmissions() {
    var form = document.querySelector('.contact-form form');
    if (!form) return;

    // Intercept the existing fetch success — listen for the thank-you swap
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === 'childList' && form.innerHTML.indexOf('Thank you') > -1) {
          fireConversion('AW-18360721058/XxZFCK3bqN8cEKK9ibNE', 'contact_form');
          observer.disconnect();
        }
      });
    });
    observer.observe(form, { childList: true, subtree: true });
  }

  // 2. Phone Call Clicks
  function trackPhoneClicks() {
    var phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        fireConversion('AW-18360721058/IfezCODhud8cEKK9ibNE', 'phone_click');
      });
    });
  }

  function fireConversion(sendTo, label) {
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        'send_to': sendTo,
        'event_callback': function() {
          console.log('[DWM] Conversion fired: ' + label);
        }
      });
    }
  }
})();
