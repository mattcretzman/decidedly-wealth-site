const RESEND_KEY = process.env.RESEND_API_KEY;
const LEVITATE_KEY = process.env.LEVITATE_API_KEY;

const TEAM = [
  'rj@decidedlywealth.com',
  'sanger@decidedlywealth.com'
];

const { isSpam } = require('./_spam-filter');

const usd = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function notifyTeam(firstName, email, answers, r) {
  if (!RESEND_KEY) return;
  const row = (k, v) => `<tr><td style="padding:7px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1a2744;width:220px">${k}</td><td style="padding:7px 12px;border-bottom:1px solid #eee;color:#333">${v}</td></tr>`;
  const qa = Object.entries(answers || {}).map(([k, v]) => row(esc(k), esc(v))).join('');
  const html = `
    <div style="font-family:sans-serif;max-width:600px">
      <h2 style="color:#1a2744;margin-bottom:4px">Exit Calculator Lead</h2>
      <p style="color:#666;margin-top:0">${esc(firstName)} (${esc(email)}) finished the exit planning calculator.</p>
      <table style="width:100%;border-collapse:collapse">
        ${row('Industry', esc(r.industry))}
        ${row('Revenue', usd(r.revenue))}
        ${row('Profit (before owner pay, ITDA)', usd(r.profit))}
        ${row('Exit timeline', esc(r.timeline) + ' years')}
        ${row('Readiness score', esc(r.score) + ' / 100')}
        ${row('Estimated value range', usd(r.vLo) + ' to ' + usd(r.vHi) + ' (' + Number(r.mid || 0).toFixed(1) + 'x)')}
        ${row('Debt at sale', usd(r.debt))}
        ${row('Needs after taxes', usd(r.need))}
        ${row('Estimated net after tax + debt', usd(r.net))}
        ${row('Wealth gap', r.gap > 0 ? usd(r.gap) + ' short' : 'None (clears goal)')}
      </table>
      <h3 style="color:#1a2744;margin:18px 0 6px;font-size:15px">Readiness answers</h3>
      <table style="width:100%;border-collapse:collapse">${qa}</table>
      <p style="color:#666;font-size:13px;margin-top:16px">Contact created in Levitate tagged: Website Lead, Exit Calculator.</p>
    </div>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Decidedly Wealth <matt@stormbreakerdigital.com>',
      to: TEAM,
      reply_to: email,
      subject: `Exit Calculator Lead: ${firstName || email} (score ${r.score}, ${usd(r.vLo)} to ${usd(r.vHi)})`,
      html
    })
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, email, answers, result } = req.body || {};
  if (!email || !result) {
    return res.status(400).json({ error: 'Email and result required' });
  }

  const spam = isSpam(req.body);
  if (spam.blocked) {
    console.log(`Spam blocked (${spam.reason}): ${email}`);
    return res.status(200).json({ ok: true });
  }

  try {
    if (LEVITATE_KEY) {
      const levRes = await fetch('https://api.levitate.ai/public/v1/Contacts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LEVITATE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName || '',
          lastName: '',
          emailAddresses: [{ label: 'Primary', value: email }],
          tags: ['Website Lead', 'Exit Calculator'],
          visibility: 'shared'
        })
      });
      console.log(`Levitate: ${levRes.status} for ${email}`);
    }
  } catch (err) {
    console.error('Levitate error:', err.message);
  }

  try {
    await notifyTeam(firstName, email, answers, result);
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  return res.status(200).json({ ok: true });
};
