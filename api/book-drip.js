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

// 8-week drip: one email per week, starting week 1 (day 7)
const DRIP_SCHEDULE = [
  { week: 1, days: 7 },
  { week: 2, days: 14 },
  { week: 3, days: 21 },
  { week: 4, days: 28 },
  { week: 5, days: 35 },
  { week: 6, days: 42 },
  { week: 7, days: 49 },
  { week: 8, days: 56 }
];

function getDripEmail(week, firstName) {
  const name = firstName || 'there';
  const emails = {
    1: {
      subject: `${name}, what stood out to you?`,
      body: `<p>Hey ${name},</p>
<p>About a week ago you grabbed copies of both books. I wanted to check in and see if anything stuck with you.</p>
<p>Most people tell me the same thing: they didn't expect a book about wealth to make them think about their <em>life</em>. That's by design. Because in my experience, the money conversation only matters once you've had the purpose conversation first.</p>
<p>If something in there got you thinking, or raised a question you weren't expecting, I'd genuinely enjoy hearing about it. I spend most of my weeks talking with business owners about exactly this stuff, and the best conversations always start with a good question.</p>
<p>No pitch, no pressure. If you want to talk, here's a link to grab 30 minutes on my calendar:</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>
<p>Either way, glad you're reading.</p>`
    },
    2: {
      subject: `The question most owners never ask`,
      body: `<p>Hey ${name},</p>
<p>I've worked with business owners worth $5M, $50M, and everywhere in between. And there's one question almost none of them have asked themselves before we sit down together:</p>
<p><strong>"If I sold this business tomorrow, would I be ready for Monday?"</strong></p>
<p>Not financially. Personally. The identity part. The "who am I if I'm not the person who runs this thing" part.</p>
<p>Most owners spend years getting the business ready to sell and zero time getting <em>themselves</em> ready. Then the deal closes, the wire hits, and they wake up on a Tuesday with nowhere to be.</p>
<p>That's what the Decision Lab is built around. Not just the money. The five decisions that actually determine whether wealth turns into significance or just sits in an account.</p>
<p>If you're anywhere near a transition, even years out, one conversation now saves a lot of regret later.</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>`
    },
    3: {
      subject: `Do you actually know what your business is worth?`,
      body: `<p>Hey ${name},</p>
<p>Every business owner I've ever met has a number in their head. What they think their company is worth. And in 20 years of doing this, I can tell you: that number is almost always wrong.</p>
<p>Sometimes high, sometimes low. But almost never accurate. And the gap between what you think it's worth and what a buyer would actually pay? That's where bad decisions get made.</p>
<p>People take deals they shouldn't. Or they wait too long because they're anchored to a fantasy number. Or they don't plan at all because they assume the number will take care of everything.</p>
<p>A real valuation isn't about the math. It's about making the <em>right</em> decision with real information instead of a guess.</p>
<p>If you've never had that conversation with someone who isn't trying to buy your company or sell you something, that's exactly what the Decision Lab is for. Thirty minutes.</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>`
    },
    4: {
      subject: `What happens to your team when you leave?`,
      body: `<p>Hey ${name},</p>
<p>Here's a question that comes up in almost every planning conversation I have:</p>
<p><strong>"What happens to the people who helped me build this?"</strong></p>
<p>Your CFO who's been with you for 15 years. The ops manager who knows every vendor by first name. The assistant who keeps the whole thing from falling apart. What happens to them when you're gone?</p>
<p>Most buyers care about continuity, but "care" and "guarantee" are very different words. And most owners don't think about this until it's too late to protect the people who matter most.</p>
<p>Succession planning isn't just about who sits in your chair. It's about what you owe the people who helped you build something worth passing on.</p>
<p>This is one of the five decisions we walk through in the Decision Lab. If it's on your mind, even a little, let's talk.</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>`
    },
    5: {
      subject: `The 5 decisions that separate legacy from regret`,
      body: `<p>Hey ${name},</p>
<p>In the books, we talk about five key decisions. Every client I work with goes through the same framework, and it changes how they see everything. Here's the short version:</p>
<p><strong>1. Decide who you are.</strong> Before you can plan anything, you need to understand how you make decisions. Your values, your wiring, your blind spots.</p>
<p><strong>2. Decide where you are.</strong> Full financial picture. Not what you think you have. What you actually have, and whether it's enough to do what you want.</p>
<p><strong>3. Decide where you're going.</strong> What do you actually want your money to <em>do</em>? Not "grow." Do.</p>
<p><strong>4. Decide how you get there.</strong> Strategy, structure, risk. The boring stuff that makes everything else possible.</p>
<p><strong>5. Decide who matters.</strong> Estate planning, legacy, stewardship. Who gets what, and why.</p>
<p>Most advisors start at #4. We start at #1. That's why it works differently.</p>
<p>The Decision Lab is where we walk through all five in the context of your actual situation. Thirty minutes, no cost, no strings.</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>`
    },
    6: {
      subject: `The owners who plan early vs. the ones who don't`,
      body: `<p>Hey ${name},</p>
<p>I've been doing this long enough to see the pattern clearly. There are two kinds of business owners:</p>
<p>The ones who start planning 3-5 years before a transition. They get better deals, smoother exits, and they actually enjoy what comes next. They've thought about it. They're ready.</p>
<p>And the ones who wake up one day and realize they need to sell. A health scare, a partnership dispute, market shift, burnout. They scramble, take the first offer, and spend the next two years wondering if they left money on the table. Or worse, wondering who they are now.</p>
<p>The difference isn't luck. It's one conversation that happened years earlier.</p>
<p>If you're 2, 5, even 10 years out from any kind of transition, that's actually the perfect time to talk. Not because there's urgency. Because there's <em>still time to do it right.</em></p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>`
    },
    7: {
      subject: `Your wealth should outlive your business`,
      body: `<p>Hey ${name},</p>
<p>Most business owners have 80-90% of their net worth tied up in one asset: the business itself. That's a concentration of risk that would make any portfolio manager cringe.</p>
<p>But it's also the reality of building something. You pour everything in because that's what it takes.</p>
<p>The question is: when it's time to convert that business into the rest of your life, do you have a plan for what comes next? Not just financially. What does your week look like? What does your family look like? What does your legacy look like?</p>
<p>That's the work we do. Transforming wealth into significance. Making sure the thing you built doesn't just generate a number, but actually creates the life you wanted it to.</p>
<p>One conversation. Thirty minutes. No cost.</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>`
    },
    8: {
      subject: `Last note from me, ${name}`,
      body: `<p>Hey ${name},</p>
<p>This is the last email in this series, so I'll keep it simple.</p>
<p>Over the past couple months I've shared a lot about how we work with business owners here in Fort Worth. The five decisions. Exit planning. Succession. Valuation. All of it comes back to one thing:</p>
<p><strong>The best investors are the best decision makers.</strong></p>
<p>If any of it resonated, even a little, I'd love to have a real conversation. Not a pitch. Not a sales call. Just thirty minutes to talk about where you are, where you want to go, and whether we might be able to help.</p>
<p>The link below is open anytime.</p>
<p><a href="${BOOKING_URL}" style="color:#1a2744;font-weight:600">Book a Decision Lab Conversation</a></p>
<p>And if the timing isn't right, no hard feelings at all. You've got my number if anything changes down the road.</p>
<p>Glad you grabbed the books. Hope they made you think.</p>`
    }
  };
  return emails[week];
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
    if (dripsSent >= 8) continue;

    const signupDate = new Date(timestamp);
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
