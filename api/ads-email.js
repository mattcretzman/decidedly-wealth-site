const RESEND_KEY = process.env.RESEND_API_KEY;
const DASH_KEY = process.env.DASHBOARD_KEY || 'dwm-ops-2026';

module.exports = async function handler(req, res) {
  // Only allow cron or manual trigger with key
  const authHeader = req.headers['authorization'];
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = (req.query.key || req.headers['x-dashboard-key']) === DASH_KEY;
  if (!isVercelCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch ads data from our own endpoint
    const baseUrl = `https://${req.headers.host}`;
    const dataResp = await fetch(`${baseUrl}/api/ads-data?key=${DASH_KEY}`);
    const data = await dataResp.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const tw = data.thisWeek.totals;
    const lw = data.lastWeek.totals;
    const campaigns = data.thisWeek.campaigns;
    const leads = data.leads.filter(l => {
      const d = new Date(l.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    });

    function delta(curr, prev) {
      if (prev === 0) return curr > 0 ? '+new' : '-';
      const pct = Math.round(((curr - prev) / prev) * 100);
      return pct >= 0 ? `+${pct}%` : `${pct}%`;
    }

    function color(curr, prev, higherIsBetter) {
      if (prev === 0) return '#666';
      const better = higherIsBetter ? curr > prev : curr < prev;
      return better ? '#16a34a' : curr === prev ? '#666' : '#dc2626';
    }

    const campRows = Object.entries(campaigns).map(([name, c]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">$${c.cost.toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${c.clicks}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${c.impressions}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${c.ctr}%</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${c.conversions}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${c.cpc > 0 ? '$' + c.cpc.toFixed(2) : '-'}</td>
      </tr>
    `).join('');

    const leadRows = leads.length > 0 ? leads.map(l => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${l.firstName} ${l.lastName}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${l.email}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${l.source}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${new Date(l.date).toLocaleDateString()}</td>
      </tr>
    `).join('') : '<tr><td colspan="4" style="padding:12px;color:#999;text-align:center">No leads this week</td></tr>';

    // Search terms that need attention (high spend, no clicks or irrelevant-looking)
    const flaggedTerms = (data.searchTerms || []).filter(t => t.clicks === 0 && t.impressions > 5);
    const topTerms = (data.searchTerms || []).slice(0, 10);

    const searchTermRows = topTerms.map(t => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${t.term}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px">${t.campaign}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${t.impressions}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:right">${t.clicks}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;text-align:right">$${t.cost.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
    <div style="font-family:sans-serif;max-width:680px;margin:0 auto">
      <div style="background:#1a2744;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#d4a243;margin:0;font-size:20px">Decidedly Wealth - Weekly Ads Report</h1>
        <p style="color:#8899aa;margin:4px 0 0;font-size:13px">Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div style="background:#f8f9fa;padding:24px 32px;border:1px solid #e5e7eb">
        <h2 style="color:#1a2744;font-size:15px;margin:0 0 16px">This Week vs Last Week</h2>
        <table style="width:100%">
          <tr>
            <td style="text-align:center;padding:8px">
              <div style="font-size:24px;font-weight:700;color:#1a2744">$${tw.cost.toFixed(2)}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">Spend</div>
              <div style="font-size:12px;color:${color(tw.cost, lw.cost, false)}">${delta(tw.cost, lw.cost)}</div>
            </td>
            <td style="text-align:center;padding:8px">
              <div style="font-size:24px;font-weight:700;color:#1a2744">${tw.clicks}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">Clicks</div>
              <div style="font-size:12px;color:${color(tw.clicks, lw.clicks, true)}">${delta(tw.clicks, lw.clicks)}</div>
            </td>
            <td style="text-align:center;padding:8px">
              <div style="font-size:24px;font-weight:700;color:#1a2744">${tw.conversions}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">Leads</div>
              <div style="font-size:12px;color:${color(tw.conversions, lw.conversions, true)}">${delta(tw.conversions, lw.conversions)}</div>
            </td>
            <td style="text-align:center;padding:8px">
              <div style="font-size:24px;font-weight:700;color:#1a2744">${tw.costPerConv > 0 ? '$' + tw.costPerConv.toFixed(0) : '-'}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">Cost/Lead</div>
              <div style="font-size:12px;color:${color(tw.costPerConv, lw.costPerConv, false)}">${tw.costPerConv > 0 ? delta(tw.costPerConv, lw.costPerConv) : ''}</div>
            </td>
          </tr>
        </table>
      </div>

      <div style="background:white;padding:24px 32px;border:1px solid #e5e7eb;border-top:0">
        <h2 style="color:#1a2744;font-size:15px;margin:0 0 12px">Campaign Breakdown</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="background:#f0f1f3">
            <th style="padding:8px 12px;text-align:left">Campaign</th>
            <th style="padding:8px 12px;text-align:right">Spend</th>
            <th style="padding:8px 12px;text-align:right">Clicks</th>
            <th style="padding:8px 12px;text-align:right">Impr</th>
            <th style="padding:8px 12px;text-align:right">CTR</th>
            <th style="padding:8px 12px;text-align:right">Leads</th>
            <th style="padding:8px 12px;text-align:right">CPC</th>
          </tr>
          ${campRows}
        </table>
      </div>

      <div style="background:white;padding:24px 32px;border:1px solid #e5e7eb;border-top:0">
        <h2 style="color:#1a2744;font-size:15px;margin:0 0 12px">Leads This Week (${leads.length})</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="background:#f0f1f3">
            <th style="padding:6px 10px;text-align:left">Name</th>
            <th style="padding:6px 10px;text-align:left">Email</th>
            <th style="padding:6px 10px;text-align:left">Source</th>
            <th style="padding:6px 10px;text-align:left">Date</th>
          </tr>
          ${leadRows}
        </table>
      </div>

      <div style="background:white;padding:24px 32px;border:1px solid #e5e7eb;border-top:0">
        <h2 style="color:#1a2744;font-size:15px;margin:0 0 12px">Top Search Terms (30 days)</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="background:#f0f1f3">
            <th style="padding:6px 10px;text-align:left">Search Term</th>
            <th style="padding:6px 10px;text-align:left">Campaign</th>
            <th style="padding:6px 10px;text-align:right">Impr</th>
            <th style="padding:6px 10px;text-align:right">Clicks</th>
            <th style="padding:6px 10px;text-align:right">Cost</th>
          </tr>
          ${searchTermRows}
        </table>
        ${flaggedTerms.length > 0 ? `<p style="color:#dc2626;font-size:12px;margin-top:12px">* ${flaggedTerms.length} terms with impressions but zero clicks - review for negatives</p>` : ''}
      </div>

      <div style="background:#f8f9fa;padding:16px 32px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px">
        <p style="font-size:12px;color:#999;margin:0">
          <a href="https://decidedlywealth.com/ops/dashboard.html" style="color:#1a2744">Open Dashboard</a> |
          This report is for Matt only. Do not forward to client.
        </p>
      </div>
    </div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Decidedly Wealth Ops <matt@stormbreakerdigital.com>',
        to: ['matt@stormbreakerdigital.com'],
        subject: `DWM Ads: $${tw.cost.toFixed(0)} spent, ${tw.clicks} clicks, ${tw.conversions} leads this week`,
        html
      })
    });

    return res.status(200).json({ ok: true, sent: true });
  } catch (err) {
    console.error('Ads email error:', err);
    return res.status(500).json({ error: err.message });
  }
};
