const { google } = require('googleapis');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
const RESEND_KEY = process.env.RESEND_API_KEY;
const LEVITATE_KEY = process.env.LEVITATE_API_KEY;
const PROSPEO_KEY = process.env.PROSPEO_API_KEY;
const REPLYIO_KEY = process.env.REPLYIO_API_KEY;
const REPLYIO_BOOK_SEQUENCE_ID = 1762565;

const TEAM = [
  'sanger@decidedlywealth.com',
  'rj@decidedlywealth.com',
  'wyatt@decidedlywealth.com',
  'dori@decidedlywealth.com'
];

const BOOK_URLS = {
  wealthy: 'https://decidedlywealth.com/Decidedly-Wealthy.pdf',
  significance: 'https://decidedlywealth.com/A-Life-Rich-with-Significance.pdf'
};

async function sendBooksToLead(firstName, email) {
  if (!RESEND_KEY) return;
  const name = firstName || 'there';

  const html = `
    <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2744">
      <div style="text-align:center;padding:32px 0 24px">
        <img src="https://decidedlywealth.com/images/decidedly-logo.png" alt="Decidedly Wealth Management" style="height:40px">
      </div>
      <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:28px;text-align:center;margin-bottom:8px;color:#1a2744">Your books are ready, ${name}.</h1>
      <p style="text-align:center;color:#666;font-size:16px;line-height:1.7;margin-bottom:32px">Click below to download your free copies. We hope they help you think differently about wealth, purpose, and legacy.</p>
      <div style="text-align:center;margin-bottom:16px">
        <a href="${BOOK_URLS.wealthy}" style="display:inline-block;padding:16px 32px;background:#1a2744;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px">Download "Decidedly Wealthy"</a>
      </div>
      <div style="text-align:center;margin-bottom:40px">
        <a href="${BOOK_URLS.significance}" style="display:inline-block;padding:16px 32px;background:#1a2744;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px">Download "A Life Rich with Significance"</a>
      </div>
      <div style="border-top:1px solid #e5e5e5;padding-top:24px;text-align:center">
        <p style="color:#666;font-size:14px;line-height:1.7;margin-bottom:16px">Want to talk about what you read? I offer a complimentary conversation for business owners exploring exit planning.</p>
        <a href="https://app.greminders.com/c/sanger/decisionlabinit" style="color:#1a2744;font-weight:600;text-decoration:none;font-size:14px">Book a Decision Lab Conversation &rarr;</a>
      </div>
      <div style="border-top:1px solid #e5e5e5;margin-top:32px;padding-top:16px;text-align:center">
        <p style="color:#999;font-size:11px;line-height:1.6">Decidedly Wealth Management<br>6100 Camp Bowie Blvd, Suite 24 &middot; Fort Worth, TX 76116<br>(817) 615-9711 &middot; contact@decidedlywealth.com</p>
        <p style="color:#bbb;font-size:10px;margin-top:8px">Securities offered through Kestra Investment Services, LLC (Kestra IS), member FINRA/SIPC. Investment Advisory Services offered through Kestra Advisory Services, LLC (Kestra AS), an affiliate of Kestra IS.</p>
      </div>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sanger Smith <sanger@decidedlywealth.com>',
      reply_to: 'sanger@decidedlywealth.com',
      to: [email],
      subject: `Your free books are ready, ${name}`,
      html
    })
  });
}

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

  const { firstName, lastName, email, source, referrer, utm_source, utm_medium, utm_campaign } = req.body;
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
      range: 'Sheet1!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          firstName || '',
          lastName || '',
          email,
          source || 'books-page',
          referrer || '',
          utm_source || '',
          utm_medium || '',
          utm_campaign || ''
        ]]
      }
    });
  } catch (err) {
    console.error('Sheet append error:', err.message);
  }

  // Send books to the lead via email
  try {
    await sendBooksToLead(firstName, email);
  } catch (err) {
    console.error('Book delivery error:', err.message);
  }

  // Notify team
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

  // Enrich via Prospeo + enroll in Reply.io LinkedIn sequence (non-blocking)
  enrichAndEnroll(firstName, lastName, email).catch(err => {
    console.error('Enrich/enroll error:', err.message);
  });

  return res.status(200).json({ ok: true });
};

// Emails that should NEVER be enriched or enrolled in LinkedIn outreach
const INTERNAL_EMAILS = [
  'matt@stormbreakerdigital.com',
  'sanger@decidedlywealth.com',
  'rj@decidedlywealth.com',
  'wyatt@decidedlywealth.com',
  'dori@decidedlywealth.com',
  'contact@decidedlywealth.com',
  'morgan@decidedlymoney.com'
];

async function enrichAndEnroll(firstName, lastName, email) {
  if (!PROSPEO_KEY || !REPLYIO_KEY) return;

  // Skip internal/test emails
  const lowerEmail = email.toLowerCase();
  if (INTERNAL_EMAILS.some(e => lowerEmail === e)) {
    console.log(`Skipping enrichment for internal email: ${email}`);
    return;
  }

  // Step 1: Enrich email via Prospeo to find LinkedIn URL
  const prospeoRes = await fetch('https://api.prospeo.io/enrich-person', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-KEY': PROSPEO_KEY },
    body: JSON.stringify({ data: { email } })
  });
  const prospeoData = await prospeoRes.json();
  const linkedInUrl = prospeoData?.person?.linkedin_url;

  if (!linkedInUrl) {
    console.log(`Prospeo: no LinkedIn found for ${email}`);
    return;
  }

  console.log(`Prospeo: found LinkedIn for ${email}: ${linkedInUrl}`);

  // Step 2: Import contact into Reply.io book download sequence
  // Use Prospeo-enriched name if we don't have one from the form
  const enrichedFirst = firstName || prospeoData?.person?.first_name || '';
  const enrichedLast = lastName || prospeoData?.person?.last_name || '';

  const replyRes = await fetch('https://api.reply.io/v3/contacts/import', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLYIO_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items: [{
        email,
        firstName: enrichedFirst,
        lastName: enrichedLast,
        linkedInUrl
      }],
      options: {
        sequenceId: REPLYIO_BOOK_SEQUENCE_ID,
        duplicateAction: 'skip'
      }
    })
  });
  const replyData = await replyRes.json();
  console.log(`Reply.io: imported ${email} into book sequence`, JSON.stringify(replyData));
}
