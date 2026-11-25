// T25 RJ email follow-up: one function, three jobs (Vercel counts functions, so they share a file).
//   GET  /api/t25?a=drip&key=...            daily cron: send each lead the step it is due (see _t25.js)
//   POST /api/t25?a=inbound                  Resend webhook: replies to rj@reply.decidedlywealth.com, bounces, complaints
//   GET|POST /api/t25?a=unsub&e=...&t=...    unsubscribe link (POST = one-click from the mail app)
// Test mode: &tab=test works on the "T25 Test" tab only, which only ever mails Matt's own addresses.
const crypto = require('crypto');
const T = require('./_t25');

const DASHBOARD_KEY = process.env.DASHBOARD_KEY;
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET_DW;
const REPLY_KEY = process.env.REPLYIO_API_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
// RJ's LinkedIn sequences (T25 calculator/books/contact + the pre-T25 one). An email reply stops these too.
const LI_SEQS = [1829609, 1829610, 1829611, 1817051];
const STATUS_TAB = 'T25 Status';
const AUTO_REPLY = /out of (the )?office|automatic reply|auto.?reply|autoreply|away from (my|the) (desk|office)|on vacation|delivery status notification|undeliverable|mail delivery (failed|subsystem)/i;
const STOP_WORDS = /^\s*(stop|unsubscribe|remove me|opt out)\b/i;

const tabOf = (q) => (q.tab === 'test' ? T.TEST_TAB : 'Sheet1');
const ymd = (d) => d.toISOString().slice(0, 10);

async function readTab(sheets, tab) {
  const r = await sheets.spreadsheets.values.get({ spreadsheetId: T.SHEET_ID, range: `'${tab}'!A:Y` });
  return r.data.values || [];
}
async function setCell(sheets, tab, cell, value) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: T.SHEET_ID, range: `'${tab}'!${cell}`, valueInputOption: 'RAW', requestBody: { values: [[value]] }
  });
}
function rowObj(r, i) {
  r = r.concat(Array(25).fill('')).slice(0, 25);
  return { row: i + 1, ts: r[0], first: (r[1] || '').trim(), last: (r[2] || '').trim(), email: (r[3] || '').trim().toLowerCase(),
    source: (r[4] || '').trim(), message: r[17], outcome: r[20], meeting: r[21], w: r[22], x: r[23], range: r[24] };
}

// Write a stop reason into column X for every row with this email (blank X only). Returns rows touched.
async function stopEmail(sheets, tab, email, reason) {
  const rows = (await readTab(sheets, tab)).map(rowObj).slice(1).filter((l) => l.email === email.toLowerCase());
  let n = 0;
  for (const l of rows) {
    if (l.x) continue;
    await setCell(sheets, tab, `X${l.row}`, reason);
    n++;
  }
  return { matched: rows.length, written: n };
}

async function stopLinkedIn(email) {
  if (!REPLY_KEY) return 'no key';
  const out = [];
  for (const id of LI_SEQS) {
    try {
      const r = await fetch('https://api.reply.io/v1/actions/markAsFinished', {
        method: 'POST',
        headers: { 'x-api-key': REPLY_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, email })
      });
      out.push(`${id}:${r.status}`);
    } catch (e) { out.push(`${id}:err`); }
  }
  return out.join(' ');
}

// ---------- drip ----------
async function drip(req, res) {
  const q = req.query;
  if ((q.key || req.headers['x-cron-key']) !== DASHBOARD_KEY) return res.status(401).json({ error: 'Unauthorized' });
  const tab = tabOf(q);
  const test = tab === T.TEST_TAB;
  if (!test && !T.START) return res.status(200).json({ message: 'T25 email is off (T25_START not set)', sent: 0 });
  const now = test && q.now ? new Date(q.now) : new Date();
  const dry = q.dry === '1';
  const sheets = T.sheetsClient();
  const rows = (await readTab(sheets, tab)).map(rowObj).slice(1);
  const log = [];
  let sent = 0, failed = 0;
  const seen = new Set();
  for (const l of rows) {
    const kind = T.kindOf(l.source);
    if (!kind || !l.email || !l.ts) continue;
    if (!test && new Date(l.ts) < T.START) continue;
    if (seen.has(l.email + kind)) continue; // a second form fill never restarts or doubles the series
    seen.add(l.email + kind);
    const block = T.blockReason({ ...l, tab });
    if (block) continue;
    if (l.x) continue; // stopped
    if (l.outcome || l.meeting) {
      if (!dry) await setCell(sheets, tab, `X${l.row}`, `Stopped ${ymd(now)}: ${l.outcome || 'meeting date set'}`);
      log.push({ email: l.email, stopped: l.outcome || 'meeting' });
      continue;
    }
    const step = T.nextStep(kind, l.ts, l.w, now, l.range);
    if (!step) continue;
    if (dry) { log.push({ email: l.email, would: `${kind}-${step.n}` }); continue; }
    try {
      const id = await T.send({ kind, n: step.n, first: l.first, email: l.email, range: l.range, tab });
      await setCell(sheets, tab, `W${l.row}`, T.stamp(step.n, now));
      sent++;
      log.push({ email: l.email, sent: `${kind}-${step.n}`, id });
    } catch (e) {
      failed++;
      log.push({ email: l.email, step: `${kind}-${step.n}`, error: e.message });
      console.error(`T25 send failed ${l.email}: ${e.message}`);
    }
  }
  if (!dry && !test) {
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: T.SHEET_ID, range: `'${STATUS_TAB}'!A1:D2`, valueInputOption: 'RAW',
        requestBody: { values: [['Last drip run (UTC)', 'Sent', 'Failed', 'Note'], [now.toISOString(), sent, failed, 'RJ T25 emails: written by /api/t25 daily']] }
      });
    } catch (e) { console.error('T25 status write failed:', e.message); }
  }
  return res.status(200).json({ message: 'T25 drip run', tab, sent, failed, log });
}

// ---------- inbound (Resend webhook, Svix signature) ----------
function rawBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { d += c; });
    req.on('end', () => resolve(d));
    req.on('error', reject);
  });
}
function svixOk(headers, body) {
  if (!WEBHOOK_SECRET) return false;
  const id = headers['svix-id'], ts = headers['svix-timestamp'], sig = headers['svix-signature'];
  if (!id || !ts || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 600) return false;
  const key = Buffer.from(WEBHOOK_SECRET.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64');
  return String(sig).split(' ').some((s) => {
    const v = s.split(',')[1] || '';
    return v.length === expected.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(expected));
  });
}
const addr = (s) => ((String(s || '').match(/<([^>]+)>/) || [])[1] || String(s || '')).trim().toLowerCase();

async function getReceived(id) {
  const r = await fetch(`https://api.resend.com/emails/receiving/${id}`, { headers: { Authorization: `Bearer ${RESEND_KEY}` } });
  return r.ok ? r.json() : null;
}

async function inbound(req, res) {
  const body = await rawBody(req);
  if (!svixOk(req.headers, body)) return res.status(401).json({ error: 'bad signature' });
  const ev = JSON.parse(body || '{}');
  const d = ev.data || {};
  const sheets = T.sheetsClient();

  if (ev.type === 'email.received') {
    const to = [].concat(d.to || []).map(addr);
    if (!to.some((t) => t.endsWith('@' + T.CATCH_DOMAIN))) return res.status(200).json({ ignored: 'not ours' });
    const from = addr(d.from);
    const full = d.email_id ? await getReceived(d.email_id) : null;
    const subject = (full && full.subject) || d.subject || '';
    const textBody = (full && (full.text || '')) || '';
    if (AUTO_REPLY.test(subject)) {
      console.log(`T25 inbound auto-reply ignored from ${from}: ${subject}`);
      return res.status(200).json({ ignored: 'auto-reply' });
    }
    const asked = STOP_WORDS.test(textBody) || /^\s*stop\s*$/i.test(subject);
    const reason = `${asked ? 'Asked to stop' : 'Replied'} ${ymd(new Date())}`;
    const result = { from, reason };
    for (const tab of ['Sheet1', T.TEST_TAB]) {
      try { result[tab] = await stopEmail(sheets, tab, from, reason); } catch (e) { result[tab] = e.message; }
    }
    if (result.Sheet1 && result.Sheet1.matched) result.linkedin = await stopLinkedIn(from);
    // RJ normally has the reply already (Reply-To includes his address). If the mail app dropped him, forward it.
    const cc = [].concat((full && full.cc) || d.cc || []).map(addr);
    const reachedRJ = to.concat(cc).includes(T.RJ);
    if (!reachedRJ && RESEND_KEY) {
      const fwd = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Decidedly Wealth <matt@stormbreakerdigital.com>',
          to: result[T.TEST_TAB] && result[T.TEST_TAB].matched && !(result.Sheet1 && result.Sheet1.matched) ? [from] : [T.RJ],
          reply_to: from,
          subject: `Reply from ${from}: ${subject}`.slice(0, 200),
          html: `<p style="font-family:sans-serif;color:#666;font-size:13px">${from} replied to your follow-up email. Their emails have stopped. Reply to this message to answer them.</p><hr>${(full && full.html) || `<pre>${String(textBody).replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;'))}</pre>`}`
        })
      });
      result.forwarded = fwd.status;
    }
    console.log('T25 inbound', JSON.stringify(result));
    return res.status(200).json(result);
  }

  if (ev.type === 'email.bounced' || ev.type === 'email.complained') {
    const tags = d.tags || {};
    const isT25 = Array.isArray(tags) ? tags.some((t) => t.name === 't25') : !!tags.t25;
    if (!isT25 || addr(d.from) !== T.RJ) return res.status(200).json({ ignored: 'not T25' });
    const testTag = Array.isArray(tags) ? tags.some((t) => t.name === 'tab' && t.value === 'test') : tags.tab === 'test';
    if (ev.type === 'email.bounced' && /transient/i.test((d.bounce && d.bounce.type) || '')) return res.status(200).json({ ignored: 'transient' });
    const reason = `${ev.type === 'email.bounced' ? 'Bounced' : 'Marked as spam'} ${ymd(new Date())}`;
    const out = {};
    for (const to of [].concat(d.to || []).map(addr)) out[to] = await stopEmail(sheets, testTag ? T.TEST_TAB : 'Sheet1', to, reason);
    console.log('T25 bounce/complaint', JSON.stringify(out));
    return res.status(200).json(out);
  }
  return res.status(200).json({ ignored: ev.type });
}

// ---------- unsubscribe ----------
async function unsub(req, res) {
  const q = req.query;
  const email = String(q.e || '').toLowerCase().trim();
  const ok = email && q.t && q.t.length === 32 && crypto.timingSafeEqual(Buffer.from(String(q.t)), Buffer.from(T.token(email)));
  if (!ok) return res.status(400).send('This unsubscribe link is not valid. Reply "stop" to the email instead.');
  const tab = tabOf(q);
  const sheets = T.sheetsClient();
  const r = await stopEmail(sheets, tab, email, `Unsubscribed ${ymd(new Date())}`);
  if (tab === 'Sheet1' && r.matched) await stopLinkedIn(email);
  console.log('T25 unsubscribe', email, JSON.stringify(r));
  if (req.method === 'POST') return res.status(200).json({ ok: true });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Unsubscribed</title>
<div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:80px auto;padding:0 16px;color:#1a2744;text-align:center">
<img src="/images/decidedly-logo.png" alt="Decidedly Wealth Management" style="height:40px"><h1 style="font-family:Georgia,serif;font-size:24px;margin-top:32px">You're unsubscribed.</h1>
<p style="color:#666;line-height:1.6">You won't get any more of these emails.</p></div>`);
}

module.exports = async function handler(req, res) {
  const a = req.query.a;
  try {
    if (a === 'drip') return await drip(req, res);
    if (a === 'inbound' && req.method === 'POST') return await inbound(req, res);
    if (a === 'unsub') return await unsub(req, res);
    return res.status(404).json({ error: 'unknown action' });
  } catch (e) {
    console.error('T25 error', a, e.message);
    return res.status(500).json({ error: e.message });
  }
};
