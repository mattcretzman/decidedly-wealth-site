/**
 * Spam filter for Decidedly Wealth forms
 * - Honeypot field check (hidden field bots fill out)
 * - Time-based check (submissions under 3 seconds = bot)
 * - Disposable/junk email domain blocking
 * - Pattern-based email rejection
 */

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'guerrillamail.info', 'guerrillamail.net', 'guerrillamail.org', 'spam4.me',
  'trashmail.com', 'trashmail.me', 'trashmail.net', 'dispostable.com',
  'maildrop.cc', 'mailnesia.com', 'mintemail.com', 'temp-mail.org',
  'tempail.com', 'tempmailaddress.com', 'tmails.net', 'emailondeck.com',
  'fakeinbox.com', 'mailcatch.com', 'mailexpire.com', 'mailmoat.com',
  'mytemp.email', 'throwam.com', 'getnada.com', 'genmail.com',
  'inboxbear.com', 'mohmal.com', 'discard.email', 'crazymailing.com',
  'tmail.ws', 'harakirimail.com', 'eyepaste.com', 'correotemporal.org',
  'tempinbox.com', 'spamgourmet.com', 'mailforspam.com'
];

function isSpam(body) {
  // 1. Honeypot check — if the hidden "website" field has a value, it's a bot
  if (body.website && body.website.trim().length > 0) {
    return { blocked: true, reason: 'honeypot' };
  }

  // 2. Time check — form loaded timestamp vs now (under 3 seconds = bot)
  if (body._t) {
    const loadTime = parseInt(body._t, 10);
    const now = Date.now();
    if (!isNaN(loadTime) && (now - loadTime) < 3000) {
      return { blocked: true, reason: 'too_fast' };
    }
  }

  // 3. Email validation
  const email = (body.email || '').toLowerCase().trim();
  if (email) {
    const domain = email.split('@')[1] || '';

    // Block disposable domains
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return { blocked: true, reason: 'disposable_email' };
    }

    // Block all-number local parts (e.g. 123456@gmail.com)
    const local = email.split('@')[0] || '';
    if (/^\d+$/.test(local)) {
      return { blocked: true, reason: 'numeric_email' };
    }

    // Block obviously fake patterns
    if (/^(test|asdf|qwerty|aaa|bbb|xxx|spam|fake|noreply)@/i.test(email)) {
      return { blocked: true, reason: 'fake_pattern' };
    }

    // Block emails with no TLD or invalid format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return { blocked: true, reason: 'invalid_format' };
    }
  }

  // 4. Name check — block if name contains URLs or HTML
  const name = `${body.firstName || ''} ${body.lastName || ''}`;
  if (/<[^>]+>/.test(name) || /https?:\/\//i.test(name)) {
    return { blocked: true, reason: 'html_in_name' };
  }

  // 5. Message check — block if message is stuffed with URLs
  const message = body.message || '';
  const urlCount = (message.match(/https?:\/\//gi) || []).length;
  if (urlCount >= 3) {
    return { blocked: true, reason: 'url_stuffing' };
  }

  return { blocked: false };
}

module.exports = { isSpam };
