const { google } = require('googleapis');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
const RESEND_KEY = process.env.RESEND_API_KEY;
const LEVITATE_KEY = process.env.LEVITATE_API_KEY;

const TEAM = [
  'rj@decidedlywealth.com',
  'sanger@decidedlywealth.com',
  'wyatt@decidedlywealth.com'
];

// Industry calculators: page key -> Levitate tag and label for the alert subject.
// Unknown or missing keys fall back to the generic calculator.
const INDUSTRY_TAGS = {
  hvac: 'HVAC',
  dental: 'Dental'
};

const { isSpam } = require('./_spam-filter');

const usd = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function notifyTeam(firstName, email, phone, answers, r, industryTag, tags) {
  if (!RESEND_KEY) return;
  const row = (k, v) => `<tr><td style="padding:7px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1a2744;width:220px">${k}</td><td style="padding:7px 12px;border-bottom:1px solid #eee;color:#333">${v}</td></tr>`;
  // Industry pages send [question, answer] pairs; older clients sent { id: answer }
  const pairs = Array.isArray(answers) ? answers : Object.entries(answers || {});
  const qa = pairs.map((p) => row(esc(p && p[0]), esc(p && p[1]))).join('');
  const label = industryTag ? industryTag + ' Exit Calculator' : 'Exit Calculator';
  const html = `
    <div style="font-family:sans-serif;max-width:600px">
      <h2 style="color:#1a2744;margin-bottom:4px">${label} Lead</h2>
      <p style="color:#666;margin-top:0">${esc(firstName)} (${esc(email)}) finished the ${industryTag ? esc(industryTag) + ' ' : ''}exit planning calculator.</p>
      <table style="width:100%;border-collapse:collapse">
        ${row('Phone', phone ? esc(phone) : 'Not given')}
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
      <p style="color:#666;font-size:13px;margin-top:16px">Contact created in Levitate tagged: ${esc(tags.join(', '))}.</p>
    </div>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Decidedly Wealth <matt@stormbreakerdigital.com>',
      to: TEAM,
      reply_to: email,
      subject: `${label} Lead: ${firstName || email} (score ${r.score}, ${usd(r.vLo)} to ${usd(r.vHi)})`,
      html
    })
  });
}

// The owner's own copy of their results. The page promises "Where we'll send your results".
const DECISION_LAB = 'https://app.greminders.com/c/sanger/decisionlabinit';
async function sendReport(firstName, email, r) {
  if (!RESEND_KEY) return;
  const band = r.score >= 80 ? 'Buyer ready' : r.score >= 55 ? 'Getting there' : 'Early stage';
  const li = (items) => (items || []).map((t) => `<li style="margin-bottom:8px">${esc(t)}</li>`).join('');
  const row = (k, v) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;color:#555">${k}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600">${v}</td></tr>`;
  const cover = r.need > 0 ? Math.max(0, Math.min(100, Math.round(Math.max(0, r.net) / r.need * 100))) : 100;
  const pillars = r.you == null ? '' : `
    <h3 style="font-size:17px;margin:28px 0 6px">Your four pillars</h3>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${row('Business readiness', esc(r.score) + '%')}
      ${row('Financial independence', cover + '%')}
      ${row('Your next chapter', esc(r.you) + '%')}
      ${row('Family and successor', esc(r.family) + '%')}
    </table>`;
  const body = `
    <p>Hi ${esc(firstName) || 'there'},</p>
    <p>Here are your results from the exit planning calculator, so you have them in one place.</p>
    <p style="font-size:20px;margin:24px 0 4px"><strong>Exit Readiness Score: ${esc(r.score)} of 100</strong></p>
    <p style="margin-top:0;color:#555">${band}</p>
    ${pillars}
    ${(r.gapTexts || []).length ? `<h3 style="font-size:17px;margin:28px 0 6px">Where buyers will push on price</h3><ul style="padding-left:20px">${li(r.gapTexts)}</ul>` : ''}
    ${(r.pgaps || []).length ? `<h3 style="font-size:17px;margin:28px 0 6px">On the personal side</h3><ul style="padding-left:20px">${li(r.pgaps)}</ul>` : ''}
    <h3 style="font-size:17px;margin:28px 0 6px">Your numbers</h3>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${row('Estimated value range', usd(r.vLo) + ' to ' + usd(r.vHi))}
      ${row('What you keep after taxes and debt', usd(Math.max(0, r.net)))}
      ${row('Your wealth gap', r.gap > 0 ? usd(r.gap) + ' short of your goal' : 'None, you clear your goal')}
    </table>
    <p style="margin-top:28px">If you want to walk through these numbers with us, a free Decision Lab session is the next step. We pressure-test the value and map what exiting on your terms looks like.</p>
    <p><a href="${DECISION_LAB}" style="display:inline-block;background:#1a2744;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px">Book a Decision Lab session</a></p>
    <p style="color:#888;font-size:12px;line-height:1.6;margin-top:28px">This calculator gives a rough, educational estimate based on the answers you entered and general market ranges. It is not an appraisal, a formal business valuation, or tax, legal or investment advice. Actual sale prices depend on buyers, deal terms, timing and many factors a short questionnaire can't capture. Tax estimates assume most of the sale is taxed as a long-term capital gain and are simplified. Talk to a qualified professional before making decisions.</p>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sanger Smith <sanger@decidedlywealth.com>',
      to: [email],
      reply_to: 'sanger@decidedlywealth.com',
      subject: 'Your Exit Readiness Results',
      html: wrapEmail(body)
    })
  });
}

function wrapEmail(bodyHtml) {
  return `<div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2744;font-size:16px;line-height:1.7">
  <div style="text-align:center;padding:32px 0 24px">
    <img src="https://decidedlywealth.com/images/decidedly-logo.png" alt="Decidedly Wealth Management" style="height:40px">
  </div>
  ${bodyHtml}
  <p style="margin-top:32px">Sanger Smith, CEPA<br>
  <span style="color:#666;font-size:14px">Decidedly Wealth Management</span><br>
  <span style="color:#666;font-size:14px">(817) 615-9711</span></p>
  <div style="border-top:1px solid #e5e5e5;margin-top:32px;padding-top:16px;text-align:center">
    <p style="color:#999;font-size:11px;line-height:1.6">Decidedly Wealth Management<br>6100 Camp Bowie Blvd, Suite 24 &middot; Fort Worth, TX 76116</p>
    <p style="color:#bbb;font-size:10px;margin-top:8px">Securities offered through Kestra Investment Services, LLC (Kestra IS), member FINRA/SIPC. Investment Advisory Services offered through Kestra Advisory Services, LLC (Kestra AS), an affiliate of Kestra IS.</p>
  </div>
</div>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, email, phone, answers, result, industry } = req.body || {};
  const industryTag = Object.prototype.hasOwnProperty.call(INDUSTRY_TAGS, industry) ? INDUSTRY_TAGS[industry] : '';
  const tags = ['Website Lead', 'Exit Calculator'].concat(industryTag ? [industryTag] : []);
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
          ...(phone ? { phoneNumbers: [{ label: 'Primary', value: phone }] } : {}),
          tags,
          visibility: 'shared'
        })
      });
      console.log(`Levitate: ${levRes.status} for ${email}`);
    }
  } catch (err) {
    console.error('Levitate error:', err.message);
  }

  // Every lead gets a row in the leads sheet, so the follow-up job sees it.
  // Source goes in column E like book requests; book-drip only mails books-page/blog-popup rows.
  try {
    if (SHEET_ID && SA_KEY.client_email) {
      const auth = new google.auth.JWT(SA_KEY.client_email, null, SA_KEY.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:J',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[
          new Date().toISOString(), firstName || '', '', email,
          'exit-calculator' + (industryTag ? '-' + industry : ''), '', '', '', '',
          phone ? 'Phone: ' + phone : ''
        ]] }
      });
    }
  } catch (err) {
    console.error('Sheet append error:', err.message);
  }

  try {
    await notifyTeam(firstName, email, phone, answers, result, industryTag, tags);
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  try {
    await sendReport(firstName, email, result);
  } catch (err) {
    console.error('Report email error:', err.message);
  }

  return res.status(200).json({ ok: true });
};
