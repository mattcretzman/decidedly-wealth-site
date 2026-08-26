const { google } = require('googleapis');

const CID = '8793593741';
const DEV_TOKEN = process.env.GOOGLE_ADS_DEV_TOKEN;
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
const DASH_KEY = process.env.DASHBOARD_KEY || 'dwm-ops-2026';

async function getAccessToken() {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  const data = await resp.json();
  if (!data.access_token) {
    throw new Error('Token exchange failed: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function gaqlQuery(token, query) {
  const resp = await fetch(
    `https://googleads.googleapis.com/v23/customers/${CID}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'developer-token': DEV_TOKEN,
        'login-customer-id': CID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    }
  );
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error('Google Ads API ' + resp.status + ': ' + text.substring(0, 200));
  }
  const data = JSON.parse(text);
  if (!data || !data[0] || !data[0].results) return [];
  return data[0].results;
}

async function getAdsData(token, dateFrom, dateTo) {
  const results = await gaqlQuery(token, `
    SELECT campaign.name, metrics.impressions, metrics.clicks, metrics.cost_micros,
           metrics.conversions, metrics.cost_per_conversion
    FROM campaign
    WHERE campaign.id IN (24108492197, 24102844221, 24108492677)
      AND segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
  `);

  const campaigns = {};
  let totals = { impressions: 0, clicks: 0, cost: 0, conversions: 0 };

  for (const r of results) {
    const name = r.campaign.name.replace('DWM | ', '');
    const m = r.metrics;
    const cost = (m.costMicros || 0) / 1000000;
    const imp = parseInt(m.impressions || 0);
    const clk = parseInt(m.clicks || 0);
    const conv = parseFloat(m.conversions || 0);

    campaigns[name] = {
      impressions: imp,
      clicks: clk,
      cost: Math.round(cost * 100) / 100,
      conversions: Math.round(conv * 10) / 10,
      ctr: imp > 0 ? Math.round((clk / imp) * 10000) / 100 : 0,
      cpc: clk > 0 ? Math.round((cost / clk) * 100) / 100 : 0,
      costPerConv: conv > 0 ? Math.round((cost / conv) * 100) / 100 : 0
    };
    totals.impressions += imp;
    totals.clicks += clk;
    totals.cost += cost;
    totals.conversions += conv;
  }

  totals.cost = Math.round(totals.cost * 100) / 100;
  totals.ctr = totals.impressions > 0 ? Math.round((totals.clicks / totals.impressions) * 10000) / 100 : 0;
  totals.cpc = totals.clicks > 0 ? Math.round((totals.cost / totals.clicks) * 100) / 100 : 0;
  totals.costPerConv = totals.conversions > 0 ? Math.round((totals.cost / totals.conversions) * 100) / 100 : 0;
  totals.conversions = Math.round(totals.conversions * 10) / 10;

  return { campaigns, totals };
}

async function getSearchTerms(token, dateFrom, dateTo) {
  const results = await gaqlQuery(token, `
    SELECT search_term_view.search_term, metrics.impressions, metrics.clicks, metrics.cost_micros,
           campaign.name
    FROM search_term_view
    WHERE campaign.id IN (24108492197, 24102844221, 24108492677)
      AND segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
    ORDER BY metrics.impressions DESC
    LIMIT 30
  `);

  return results.map(r => ({
    term: r.searchTermView.searchTerm,
    campaign: r.campaign.name.replace('DWM | ', ''),
    impressions: parseInt(r.metrics.impressions || 0),
    clicks: parseInt(r.metrics.clicks || 0),
    cost: Math.round((r.metrics.costMicros || 0) / 10000) / 100
  }));
}

async function getLeads() {
  try {
    const auth = new google.auth.JWT(SA_KEY.client_email, null, SA_KEY.private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const sheets = google.sheets({ version: 'v4', auth });
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:H'
    });
    const rows = resp.data.values || [];
    return rows.slice(-20).reverse().map(r => ({
      date: r[0] || '',
      firstName: r[1] || '',
      lastName: r[2] || '',
      email: r[3] || '',
      phone: r[4] || '',
      interest: r[5] || '',
      message: r[6] || '',
      source: r[7] || r[4] || ''
    }));
  } catch (e) {
    return [];
  }
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

module.exports = async function handler(req, res) {
  const key = req.query.key || req.headers['x-dashboard-key'];
  if (key !== DASH_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = await getAccessToken();
    const now = new Date();

    // This week (Mon-today)
    const today = new Date(now);
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    // Last week
    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);
    const lastSunday = new Date(monday);
    lastSunday.setDate(monday.getDate() - 1);

    // Last 30 days
    const thirtyAgo = new Date(today);
    thirtyAgo.setDate(today.getDate() - 30);

    const [thisWeek, lastWeek, last30, searchTerms, leads] = await Promise.all([
      getAdsData(token, dateStr(monday), dateStr(today)),
      getAdsData(token, dateStr(lastMonday), dateStr(lastSunday)),
      getAdsData(token, dateStr(thirtyAgo), dateStr(today)),
      getSearchTerms(token, dateStr(thirtyAgo), dateStr(today)),
      getLeads()
    ]);

    return res.status(200).json({
      generated: now.toISOString(),
      thisWeek,
      lastWeek,
      last30,
      searchTerms,
      leads
    });
  } catch (err) {
    console.error('Ads data error:', err);
    return res.status(500).json({ error: err.message });
  }
};
