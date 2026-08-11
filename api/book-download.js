const { google } = require('googleapis');

const SHEET_ID = process.env.DWM_BOOK_SHEET_ID;
const SA_KEY = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');

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

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Sheet append error:', err.message);
    return res.status(200).json({ ok: true }); // still redirect user even if sheet fails
  }
};
