// T25 (Kestra ACR 9236731, approved Nov 25 2026): RJ's four-email follow-up for website leads.
//   B = exit planning calculator leads: B1 right away, B2 day 3, B3 day 10, B4 day 21.
//   C = contact form leads: C1 right away, C2 day 3, C3 day 10, C4 day 21. C1 is skipped while Sanger's
//       same-minute contact reply (T31, LEAD_AUTOREPLY=on) is live, so nobody gets two "got your note" emails.
//   Book requests are not in T25 email (they get Sanger's T15 emails from book-drip.js).
// Wording is the approved packet, word for word (~/scripts/decidedly/t25-lead-followup/T25.html).
//
// Stops ("Every message stops automatically when the person replies or books a call"):
//   - a reply: Reply-To carries rj@decidedlywealth.com (RJ gets the reply in Outlook as normal) AND
//     rj@reply.decidedlywealth.com, which Resend receives; api/t25.js?a=inbound writes "Replied" to column X
//     and marks the lead finished in RJ's LinkedIn sequences.
//   - the unsubscribe link, a "stop" reply, a bounce or a spam complaint
//   - the team filling in Outcome (U) or Meeting date (V); a LinkedIn reply (lead-followup/run.py writes X)
// Sheet columns (Sheet1, same row as the lead): W = "RJ emails" (last step sent + date), X = "RJ emails stopped",
// Y = "Calculator range" (what the calculator showed, for B1).
// OFF unless the Vercel env var T25_START is an ISO time; only leads on or after it get emails.

const crypto = require('crypto');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const RESEND_KEY = process.env.RESEND_API_KEY;
const SECRET = process.env.DASHBOARD_KEY || '';
const START = process.env.T25_START ? new Date(process.env.T25_START) : null;
const T31_ON = process.env.LEAD_AUTOREPLY === 'on';

const FROM = 'RJ Finley <rj@decidedlywealth.com>';
const RJ = 'rj@decidedlywealth.com';
const CATCH_DOMAIN = 'reply.decidedlywealth.com';
const CATCH = `rj@${CATCH_DOMAIN}`;
const CAL = 'https://app.greminders.com/c/rj/decisionlabinit';
const SITE = 'https://decidedlywealth.com';
const TEST_TAB = 'T25 Test';
const TEST_TO = /@(stormbreakerdigital\.com|unleashstormbreaker\.com)$|^mcretzman@gmail\.com$/i;

const INTERNAL = ['matt@stormbreakerdigital.com', 'sanger@decidedlywealth.com', 'rj@decidedlywealth.com',
  'wyatt@decidedlywealth.com', 'dori@decidedlywealth.com', 'contact@decidedlywealth.com', 'morgan@decidedlymoney.com'];
// Already working with an advisor: never message (same list as book-drip.js DO_NOT_SEND and run.py DO_NOT_MESSAGE)
const DO_NOT_SEND = ['michael@keystonedental.org', 'danny.salas@me.com'];
// Vendor pitches through the contact form (same pattern as lead-followup/run.py PITCH)
const PITCH = /claim (it|your|the)|your listing|listing on|leads go directly|appointment setting|\bseo\b|rank(ing)? (higher|on google)|backlinks?|guest post|web ?design|redesign your|marketing agency|lead generation|generate (more )?leads|we (help|specialize)|our (agency|team) (can|helps)|partnership opportunit|sponsor(ed|ship)|data licens|virtual assistant|outsourc|someone is requesting|financial planner appointment/i;

const SCHEDULE = {
  calculator: [{ n: 1, day: 0 }, { n: 2, day: 3 }, { n: 3, day: 10 }, { n: 4, day: 21 }],
  contact: [{ n: 1, day: 0 }, { n: 2, day: 3 }, { n: 3, day: 10 }, { n: 4, day: 21 }]
};
const MIN_GAP_DAYS = 2; // never two T25 emails to one person within 2 days, even when catching up

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const a = (href, text) => `<a href="${href}" style="color:#1a2744">${esc(text)}</a>`;
const CAL_LINK = a(CAL, 'app.greminders.com/c/rj/decisionlabinit');
const BOOKS_LINK = a(`${SITE}/books.html`, 'decidedlywealth.com/books.html');

// Source (sheet column E) -> which series. Book-download sources return null (no T25 email).
function kindOf(source) {
  const s = String(source || '').toLowerCase().trim();
  if (s.startsWith('exit-calculator')) return 'calculator';
  if (!s || s === 'books-page' || s === 'blog-popup' || s.includes('books') || s.includes('plateau')) return null;
  if (s.startsWith('blog-gate') || s.startsWith('newsletter')) return null;
  return 'contact';
}

// The approved bodies. {FirstName} -> first name; {range} -> the calculator's range.
function content(kind, n, first, range) {
  const name = esc(first || 'there');
  const B = {
    1: ['Your exit planning numbers', [
      `Hi ${name},`,
      `Thanks for running the exit planning calculator. Your estimated range was ${esc(range)}.`,
      `That number is a starting point, not a valuation. The value of a business moves a lot with things the calculator can't see, like how the business runs without you and how your customers are spread out.`,
      `If you'd like to walk through what's behind your number, I'd be glad to. Pick any time that works: ${CAL_LINK}`]],
    2: ['Where exit planning really starts', [
      `Hi ${name},`,
      `Most owners think of an exit as a sale. In practice it starts years earlier, with what you want your life to look like after the business.`,
      `We wrote about that here: ${a(`${SITE}/blog/deciding-to-exit-your-business.html`, 'Exit Planning Starts With You')} (${a(`${SITE}/blog/deciding-to-exit-your-business.html`, 'decidedlywealth.com/blog/deciding-to-exit-your-business.html')})`,
      `If any of it hits close to home, my calendar is open: ${CAL_LINK}`]],
    3: ['Two free books for business owners', [
      `Hi ${name},`,
      `Our founder, Sanger Smith, wrote two short books for business owners thinking about what comes next. They're free, and you can grab both here: ${BOOKS_LINK}`]],
    4: ['One last note', [
      `Hi ${name},`,
      `I don't want to fill your inbox, so this is my last note for now.`,
      `Whenever the timing is right to talk through your exit, my calendar is here: ${CAL_LINK}`]]
  };
  const C = {
    1: ['Got your note', [
      `Hi ${name},`,
      `Thanks for reaching out to Decidedly. Your message came through, and one of us will be in touch.`,
      `If it's easier to grab a time now, here's my calendar: ${CAL_LINK}`]],
    2: ['Following up on your note', [
      `Hi ${name},`,
      `I wanted to make sure you heard back from us. If you'd still like to talk, pick any time that works: ${CAL_LINK}`]],
    3: B[3],
    4: B[4]
  };
  const e = (kind === 'calculator' ? B : C)[n];
  return e ? { subject: e[0], paras: e[1] } : null;
}

function token(email) {
  return crypto.createHmac('sha256', SECRET + ':t25').update(String(email).toLowerCase()).digest('hex').slice(0, 32);
}
function unsubUrl(email, tab) {
  return `${SITE}/api/t25?a=unsub&e=${encodeURIComponent(email)}&t=${token(email)}${tab === TEST_TAB ? '&tab=test' : ''}`;
}

function html(paras, email, tab) {
  const p = (t) => `<p style="margin:0 0 16px">${t}</p>`;
  return `<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;color:#1a2744;font-size:15px;line-height:1.6">
${paras.map(p).join('\n')}
<p style="margin:24px 0 0">RJ Finley<br>Private Wealth Advisor, Decidedly Wealth Management<br>(817) 615-9711</p>
<div style="border-top:1px solid #e5e5e5;margin-top:28px;padding-top:14px">
<p style="color:#888;font-size:11px;line-height:1.6;margin:0 0 8px">Decidedly Wealth Management<br>6100 Camp Bowie Blvd, Suite 24 &middot; Fort Worth, TX 76116</p>
<p style="color:#999;font-size:10px;line-height:1.6;margin:0 0 8px">Securities offered through Kestra Investment Services, LLC (Kestra IS), member FINRA/SIPC. Investment Advisory Services offered through Kestra Advisory Services, LLC (Kestra AS), an affiliate of Kestra IS. Decidedly Wealth Management, LLC is not affiliated with Kestra IS or Kestra AS. Investor Disclosures: <a href="https://www.kestrafinancial.com/disclosures" style="color:#999">https://www.kestrafinancial.com/disclosures</a></p>
<p style="color:#999;font-size:10px;line-height:1.6;margin:0">Unsubscribe: reply "stop" or use the <a href="${unsubUrl(email, tab)}" style="color:#999">unsubscribe link</a>.</p>
</div></div>`;
}

function text(paras, email, tab) {
  const strip = (s) => s.replace(/<a href="([^"]+)"[^>]*>([^<]*)<\/a>/g, (m, h, t) => (h.replace(/^https:\/\//, '') === t ? t : `${t}`)).replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  return [...paras.map(strip), '', 'RJ Finley', 'Private Wealth Advisor, Decidedly Wealth Management', '(817) 615-9711', '',
    'Decidedly Wealth Management', '6100 Camp Bowie Blvd, Suite 24 · Fort Worth, TX 76116', '',
    'Securities offered through Kestra Investment Services, LLC (Kestra IS), member FINRA/SIPC. Investment Advisory Services offered through Kestra Advisory Services, LLC (Kestra AS), an affiliate of Kestra IS. Decidedly Wealth Management, LLC is not affiliated with Kestra IS or Kestra AS. Investor Disclosures: https://www.kestrafinancial.com/disclosures',
    '', `Unsubscribe: reply "stop" or use the unsubscribe link: ${unsubUrl(email, tab)}`].join('\n');
}

// Who never gets T25 email. Returns a reason string, or '' when the lead is eligible.
function blockReason({ email, first, last, message, tab }) {
  const e = String(email || '').toLowerCase().trim();
  if (!e || !e.includes('@')) return 'no email';
  if (tab === TEST_TAB) return TEST_TO.test(e) ? '' : 'test tab only sends to Matt';
  if (INTERNAL.includes(e)) return 'internal';
  if (DO_NOT_SEND.includes(e)) return 'already working with an advisor';
  if (/@(stormbreakerdigital|unleashstormbreaker)\.com$/.test(e)) return 'internal';
  if (/\btest\b/i.test(`${first || ''} ${last || ''}`)) return 'test name';
  if (PITCH.test(message || '')) return 'vendor pitch';
  return '';
}

function firstStep(kind) {
  if (kind === 'contact' && T31_ON) return 2; // T31 already answered the same minute
  return 1;
}

async function send({ kind, n, first, email, range, tab }) {
  const c = content(kind, n, first, range);
  if (!c) throw new Error(`no content ${kind} ${n}`);
  if (kind === 'calculator' && n === 1 && !range) throw new Error('B1 needs the calculator range');
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      reply_to: [RJ, CATCH],
      subject: c.subject,
      html: html(c.paras, email, tab),
      text: text(c.paras, email, tab),
      headers: {
        'List-Unsubscribe': `<${unsubUrl(email, tab)}&m=oneclick>, <mailto:${CATCH}?subject=stop>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      tags: [{ name: 't25', value: `${kind === 'calculator' ? 'B' : 'C'}${n}` }, { name: 'tab', value: tab === TEST_TAB ? 'test' : 'live' }]
    })
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok || !body.id) throw new Error(`Resend ${r.status}: ${JSON.stringify(body).slice(0, 200)}`);
  return body.id;
}

const stamp = (n, d) => `${n} @${d.toISOString()}`; // column W
function parseW(w) {
  const m = String(w || '').match(/^(\d)\s*@(\S+)/);
  return m ? { n: parseInt(m[1], 10), at: new Date(m[2]) } : { n: 0, at: null };
}

// What the drip owes this row right now: the next step, or null. now is a Date.
function nextStep(kind, ts, w, now, range) {
  const sched = SCHEDULE[kind];
  if (!sched) return null;
  const last = parseW(w);
  const days = (now - new Date(ts)) / 86400000;
  const step = sched.find((s) => s.n > last.n && s.n >= firstStep(kind));
  if (!step || days < step.day) return null;
  if (last.at && (now - last.at) / 86400000 < MIN_GAP_DAYS && step.n > 1) return null;
  // B1 quotes the calculator's range: without it, or once it is stale, the series starts at B2 when that is due
  if (kind === 'calculator' && step.n === 1 && (!range || days > 2)) return sched.find((s) => s.n === 2 && days >= s.day) || null;
  return step;
}

// The same-minute first email, sent by the form endpoint itself. Returns the column W value ('' if nothing sent).
// Never throws: the lead still gets its sheet row, and the daily drip picks up anything missed.
async function sendFirst({ sheets, kind, email, first, last, message, range }) {
  try {
    if (!START || !kind || !RESEND_KEY) return '';
    if (blockReason({ email, first, last, message })) return '';
    const step = firstStep(kind);
    if (step !== 1) return '';
    if (kind === 'calculator' && !range) return '';
    // One series per person: if this email already has a row of the same kind since START, the drip owns it.
    const r = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: 'Sheet1!A:E' });
    const e = String(email).toLowerCase().trim();
    const dup = (r.data.values || []).slice(1).some((row) => String(row[3] || '').toLowerCase().trim() === e
      && kindOf(row[4]) === kind && new Date(row[0]) >= START);
    if (dup) return '';
    const now = new Date();
    await send({ kind, n: 1, first, email: e, range, tab: 'Sheet1' });
    return stamp(1, now);
  } catch (err) {
    console.error(`T25 first email failed for ${email}: ${err.message}`);
    return '';
  }
}

function sheetsClient() {
  const { google } = require('googleapis');
  const SA = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
  const auth = new google.auth.JWT(SA.client_email, null, SA.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
  return google.sheets({ version: 'v4', auth });
}

module.exports = { sendFirst, kindOf, content, html, text, token, unsubUrl, blockReason, firstStep, send, stamp, parseW, nextStep,
  sheetsClient, SHEET_ID, START, CATCH, CATCH_DOMAIN, RJ, TEST_TAB, TEST_TO, SCHEDULE };
