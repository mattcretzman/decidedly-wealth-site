const { google } = require('googleapis');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
const RESEND_KEY = process.env.RESEND_API_KEY;
const DASHBOARD_KEY = process.env.DASHBOARD_KEY;
const BOOKING_URL = 'https://app.greminders.com/c/sanger/decisionlabinit';

const INTERNAL_EMAILS = [
  'matt@stormbreakerdigital.com',
  'sanger@decidedlywealth.com',
  'rj@decidedlywealth.com',
  'wyatt@decidedlywealth.com',
  'dori@decidedlywealth.com',
  'contact@decidedlywealth.com',
  'morgan@decidedlymoney.com'
];

// Two-email follow-up (RJ, Oct 19 2026): one note at day 14, one at day 21, then done.
// Leads from before CUTOVER (old 8-week emails, mostly bots while the form bug was live) get nothing more.
const CUTOVER = new Date('2026-10-19T15:50:00Z'); // forms started accepting real visitors at 15:53 UTC Oct 19
const BOOK_SOURCES = ['books-page', 'blog-popup'];
const DRIP_SCHEDULE = [
  { week: 1, days: 14 },
  { week: 2, days: 21 }
];

function getDripEmail(week, firstName) {
  const name = firstName || 'there';
  const emails = {
    1: {
      subject: `${name}, what stood out to you?`,
      body: `<p>Hey ${name},</p>
<p>A couple of weeks ago you grabbed copies of both books. I wanted to check in and see if anything stuck with you.</p>
<p>I enjoy hearing about what people feel reading about our process and how you are working through the 5 Key Decisions in your own life.</p>
<p>If you want to talk, here's a link to grab 30 minutes on my calendar:</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>
<p>Either way, glad you're reading.</p>`
    },
    2: {
      subject: `Why I wrote the books`,
      body: `<p>${name},</p>
<p>When I wrote the books you downloaded, I knew two things.</p>
<p>First, the hardest financial decisions have almost nothing to do with investing. Second, transforming wealth to significance is an ongoing decision that must be made daily.</p>
<p>Would love to meet you and hear about your story. You can book a call with me here:</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>
<p>Best regards,</p>`
    }
  };
  return emails[week] || null;
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
  // Auth: cron key or dashboard key
  const key = req.query.key || req.headers['x-cron-key'];
  if (key !== DASHBOARD_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!SHEET_ID || !SA_KEY.client_email || !RESEND_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const auth = new google.auth.JWT(
    SA_KEY.client_email, null, SA_KEY.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  const sheets = google.sheets({ version: 'v4', auth });

  // Read all rows: A=Timestamp, B=FirstName, C=LastName, D=Email, ..., J=DripsSent
  const range = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:J'
  });
  const rows = range.data.values || [];
  if (rows.length <= 1) {
    return res.status(200).json({ message: 'No leads', sent: 0 });
  }

  const now = new Date();
  let sent = 0;
  const log = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const timestamp = row[0];
    const firstName = row[1] || '';
    const email = row[3] || '';
    const dripsSent = parseInt(row[9] || '0', 10);

    if (!email || !timestamp) continue;
    if (INTERNAL_EMAILS.includes(email.toLowerCase())) continue;
    // The contact form writes to this same sheet (phone in column E). Only book requests get the follow-ups.
    if (!BOOK_SOURCES.includes((row[4] || '').trim())) continue;
    if (dripsSent >= DRIP_SCHEDULE.length) continue;

    const signupDate = new Date(timestamp);
    if (signupDate < CUTOVER) continue;
    const daysSinceSignup = Math.floor((now - signupDate) / (1000 * 60 * 60 * 24));

    // Find the next drip to send
    const nextDrip = DRIP_SCHEDULE.find(d => d.week === dripsSent + 1);
    if (!nextDrip || daysSinceSignup < nextDrip.days) continue;

    // Send the email
    const emailContent = getDripEmail(nextDrip.week, firstName);
    if (!emailContent) continue;

    try {
      const sendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Sanger Smith <sanger@decidedlywealth.com>',
          reply_to: 'sanger@decidedlywealth.com',
          to: [email],
          subject: emailContent.subject,
          html: wrapEmail(emailContent.body)
        })
      });

      if (sendRes.ok) {
        // Update the DripsSent column (column J = index 9)
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!J${i + 1}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[nextDrip.week]] }
        });
        sent++;
        log.push({ email, week: nextDrip.week, status: 'sent' });
        console.log(`Drip ${nextDrip.week} sent to ${email}`);
      } else {
        const err = await sendRes.text();
        log.push({ email, week: nextDrip.week, status: 'failed', error: err });
        console.error(`Drip ${nextDrip.week} failed for ${email}: ${err}`);
      }
    } catch (err) {
      log.push({ email, week: nextDrip.week, status: 'error', error: err.message });
      console.error(`Drip error for ${email}: ${err.message}`);
    }
  }

  return res.status(200).json({ message: `Drip run complete`, sent, log });
};
