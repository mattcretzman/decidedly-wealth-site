const { google } = require('googleapis');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
const RESEND_KEY = process.env.RESEND_API_KEY;
const LEVITATE_KEY = process.env.LEVITATE_API_KEY;

const TEAM = [
  'sanger@decidedlywealth.com',
  'rj@decidedlywealth.com',
  'wyatt@decidedlywealth.com',
  'dori@decidedlywealth.com'
];

async function notifyTeam(firstName, lastName, email, source) {
  if (!RESEND_KEY) return;
  const name = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
  const label = source === 'blog-popup' ? 'Newsletter Signup' : 'Book Download';

  const html = `
    <div style="font-family:sans-serif;max-width:560px">
      <h2 style="color:#1a2744;margin-bottom:4px">${label}</h2>
      <p style="color:#666;margin-top:0">Someone just signed up on decidedlywealth.com</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1a2744;width:100px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333">${name}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1a2744">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333">${email}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1a2744">Source</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333">${source}</td></tr>
      </table>
      <p style="color:#999;font-size:12px;margin-top:16px">Reply directly to ${email} to follow up.</p>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Decidedly Wealth <matt@stormbreakerdigital.com>',
      to: TEAM,
      reply_to: email,
      subject: `${label}: ${name}`,
      html
    })
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, source } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const auth = new google.auth.JWT(
      SA_KEY.client_email,
      null,
      SA_KEY.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          firstName || '',
          lastName || '',
          email,
          source || 'books-page'
        ]]
      }
    });
  } catch (err) {
    console.error('Sheet append error:', err.message);
  }

  try {
    await notifyTeam(firstName, lastName, email, source || 'books-page');
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  try {
    if (LEVITATE_KEY) {
      const tag = source === 'blog-popup' ? 'Newsletter Signup' : 'Book Download';
      await fetch('https://api.levitate.ai/public/v1/Contacts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LEVITATE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName || '',
          lastName: lastName || '',
          emailAddresses: [{ label: 'Primary', value: email }],
          tags: ['Website Lead', tag],
          visibility: 'shared'
        })
      });
    }
  } catch (err) {
    console.error('Levitate error:', err.message);
  }

  return res.status(200).json({ ok: true });
};
