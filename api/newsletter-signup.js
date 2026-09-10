const RESEND_KEY = process.env.RESEND_API_KEY;
const LEVITATE_KEY = process.env.LEVITATE_API_KEY;

const TEAM = [
  'rj@decidedlywealth.com',
  'sanger@decidedlywealth.com'
];

async function notifyTeam(email, source) {
  if (!RESEND_KEY) return;

  const html = `
    <div style="font-family:sans-serif;max-width:560px">
      <h2 style="color:#1a2744;margin-bottom:4px">Newsletter Signup</h2>
      <p style="color:#666;margin-top:0">Someone just subscribed to Your Weekly Decision</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1a2744;width:100px">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333">${email}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:#1a2744">Source</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#333">${source}</td></tr>
      </table>
      <p style="color:#666;font-size:13px;margin-top:16px">Contact created in Levitate tagged: Website Lead, Newsletter Signup, ${source}. Full article + future newsletters sent automatically via Levitate.</p>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Decidedly Wealth <matt@stormbreakerdigital.com>',
      to: TEAM,
      reply_to: email,
      subject: `Newsletter Signup: ${email}`,
      html
    })
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  // Create contact in Levitate tagged as Newsletter Signup
  try {
    if (LEVITATE_KEY) {
      await fetch('https://api.levitate.ai/public/v1/Contacts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LEVITATE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: '',
          lastName: '',
          emailAddresses: [{ label: 'Primary', value: email }],
          tags: ['Website Lead', 'Your Weekly Decision Subscriber', source || 'blog-gate'],
          visibility: 'shared'
        })
      });
    }
  } catch (err) {
    console.error('Levitate error:', err.message);
  }

  // Notify RJ + Sanger
  try {
    await notifyTeam(email, source || 'blog-gate');
  } catch (err) {
    console.error('Notification error:', err.message);
  }

  return res.status(200).json({ ok: true });
};
