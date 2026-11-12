const { google } = require('googleapis');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
const RESEND_KEY = process.env.RESEND_API_KEY;
const LEVITATE_KEY = process.env.LEVITATE_API_KEY;
const YWD_TAG = 'Your Weekly Decision Subscriber';
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

// Book requesters who are already working with an advisor get no follow-ups.
const DO_NOT_SEND = [
  'michael@keystonedental.org' // Michael Martin: engagement meeting Oct 30, 2026 (Matt, Nov 2)
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

// After the last drip email, the reader joins RJ's Your Weekly Decision list (RJ, Nov 11 2026).
// Adds the tag to the existing Levitate contact (PATCH replaces tags, so merge), or creates the contact.
async function addToWeeklyDecision(email, firstName, lastName) {
  const headers = { 'Authorization': `Bearer ${LEVITATE_KEY}`, 'Content-Type': 'application/json' };
  const base = 'https://api.levitate.ai/public/v1/Contacts';
  const found = await fetch(`${base}?email=${encodeURIComponent(email)}`, { headers });
  if (!found.ok) throw new Error(`Levitate lookup ${found.status}`);
  const matches = ((await found.json()).value?.values || [])
    .filter(c => (c.primaryEmail || '').toLowerCase() === email.toLowerCase());

  if (matches.length) {
    for (const c of matches) {
      const tags = c.tags || [];
      if (tags.includes(YWD_TAG)) continue;
      const r = await fetch(`${base}/${c.id}`, {
        method: 'PATCH', headers, body: JSON.stringify({ tags: [...tags, YWD_TAG] })
      });
      if (!r.ok) throw new Error(`Levitate tag ${r.status}: ${(await r.text()).substring(0, 200)}`);
    }
    return 'tagged';
  }

  const r = await fetch(base, {
    method: 'POST', headers,
    body: JSON.stringify({
      firstName: firstName || '', lastName: lastName || '',
      emailAddresses: [{ label: 'Primary', value: email }],
      tags: ['Website Lead', 'Book Download', YWD_TAG],
      visibility: 'shared'
    })
  });
  if (!r.ok) throw new Error(`Levitate create ${r.status}: ${(await r.text()).substring(0, 200)}`);
  return 'created';
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

  // Read all rows: A=Timestamp, B=FirstName, C=LastName, D=Email, E=Source, J=Self-Attribution,
  // K-M=LinkedIn follow-up, N=Drips sent, O=Weekly Decision.
  // Drips used to be counted in J, which the thank-you page also writes (attribution answer), so they now live in N.
  const range = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:O'
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
    const lastName = row[2] || '';
    const legacyDrips = /^[12]$/.test((row[9] || '').trim()) ? parseInt(row[9], 10) : 0;
    let dripsSent = parseInt(row[13] || '', 10) || legacyDrips;
    const ywd = (row[14] || '').trim();

    if (!email || !timestamp) continue;
    if (INTERNAL_EMAILS.includes(email.toLowerCase())) continue;
    if (DO_NOT_SEND.includes(email.toLowerCase())) continue;
    // The contact form writes to this same sheet (phone in column E). Only book requests get the follow-ups.
    if (!BOOK_SOURCES.includes((row[4] || '').trim())) continue;

    const signupDate = new Date(timestamp);
    if (signupDate < CUTOVER) continue;

    if (dripsSent >= DRIP_SCHEDULE.length) {
      if (!ywd && LEVITATE_KEY) {
        try {
          const result = await addToWeeklyDecision(email, firstName, lastName);
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `Sheet1!O${i + 1}`,
            valueInputOption: 'RAW',
            requestBody: { values: [[`Added ${now.toISOString().slice(0, 10)}`]] }
          });
          log.push({ email, step: 'weekly-decision', status: result });
          console.log(`Weekly Decision: ${result} ${email}`);
        } catch (err) {
          log.push({ email, step: 'weekly-decision', status: 'error', error: err.message });
          console.error(`Weekly Decision error for ${email}: ${err.message}`);
        }
      }
      continue;
    }
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
        // Drips sent: column N
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `Sheet1!N${i + 1}`,
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
