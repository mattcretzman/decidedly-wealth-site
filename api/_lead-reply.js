// Same-minute reply to a contact-form lead, from Sanger, with the booking link.
// OFF until Kestra approves the wording: it only sends when the Vercel env var
// LEAD_AUTOREPLY is exactly 'on'. Wording reuses the approved book-email footer and
// booking line; the two new sentences are what goes to Kestra.

const RESEND_KEY = process.env.RESEND_API_KEY;
const BOOKING_URL = 'https://app.greminders.com/c/sanger/decisionlabinit';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function contactReplyHtml(firstName) {
  const name = esc(firstName || 'there');
  return `
    <div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a2744">
      <div style="text-align:center;padding:32px 0 24px">
        <img src="https://decidedlywealth.com/images/decidedly-logo.png" alt="Decidedly Wealth Management" style="height:40px">
      </div>
      <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:26px;text-align:center;margin-bottom:8px;color:#1a2744">Thank you for reaching out, ${name}.</h1>
      <p style="text-align:center;color:#666;font-size:16px;line-height:1.7;margin-bottom:28px">Your message came through, and I will be in touch soon.</p>
      <div style="border-top:1px solid #e5e5e5;padding-top:24px;text-align:center">
        <p style="color:#666;font-size:14px;line-height:1.7;margin-bottom:16px">If you would rather pick a time now, you can book a complimentary conversation here.</p>
        <a href="${BOOKING_URL}" style="display:inline-block;padding:14px 28px;background:#1a2744;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px">Book a Decision Lab Conversation &rarr;</a>
      </div>
      <div style="border-top:1px solid #e5e5e5;margin-top:32px;padding-top:16px;text-align:center">
        <p style="color:#999;font-size:11px;line-height:1.6">Decidedly Wealth Management<br>6100 Camp Bowie Blvd, Suite 24 &middot; Fort Worth, TX 76116<br>(817) 615-9711 &middot; contact@decidedlywealth.com</p>
        <p style="color:#bbb;font-size:10px;margin-top:8px">Securities offered through Kestra Investment Services, LLC (Kestra IS), member FINRA/SIPC. Investment Advisory Services offered through Kestra Advisory Services, LLC (Kestra AS), an affiliate of Kestra IS. Investor Disclosures: <a href="https://www.kestrafinancial.com/disclosures" style="color:#bbb">https://www.kestrafinancial.com/disclosures</a></p>
      </div>
    </div>`;
}

async function sendContactReply(firstName, email) {
  if (process.env.LEAD_AUTOREPLY !== 'on' || !RESEND_KEY || !email) return 'off';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sanger Smith <sanger@decidedlywealth.com>',
      reply_to: 'sanger@decidedlywealth.com',
      to: [email],
      subject: 'Thank you for reaching out',
      html: contactReplyHtml(firstName)
    })
  });
  return r.status;
}

module.exports = { sendContactReply, contactReplyHtml };
