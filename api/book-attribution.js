const { google } = require('googleapis');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, attribution } = req.body;
  if (!email || !attribution) {
    return res.status(400).json({ error: 'Email and attribution required' });
  }

  try {
    const auth = new google.auth.JWT(
      SA_KEY.client_email,
      null,
      SA_KEY.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth });

    // Find the row with this email and update the attribution column
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J'
    });

    const rows = result.data.values || [];
    let rowIndex = -1;
    // Search from bottom up (most recent entry for this email)
    for (let i = rows.length - 1; i >= 1; i--) {
      if (rows[i][3] === email) {
        rowIndex = i + 1; // Sheets is 1-indexed
        break;
      }
    }

    if (rowIndex > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!J${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[attribution]]
        }
      });
    }
  } catch (err) {
    console.error('Attribution update error:', err.message);
  }

  return res.status(200).json({ ok: true });
};
