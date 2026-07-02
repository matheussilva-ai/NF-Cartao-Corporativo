const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgGkCJ1WpM8wFkAHcuiIeCgd9LmQg8Y3cEWeDbSXG36J3MFbHlrDlgM2AHrri4pxot/exec';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    // Primeira chamada como POST sem seguir redirect
    let response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: bodyStr,
      redirect: 'manual',
    });

    // Se vier redirect, a URL de echo do Google só aceita GET
    if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
      const location = response.headers.get('location');
      if (location) {
        response = await fetch(location, {
          method: 'GET',
          redirect: 'follow',
        });
      }
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch(e) {
      return res.status(200).json({
        error: 'RAW: ' + text.substring(0, 2000),
        status: response.status,
        url: response.url
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'FETCH_ERR: ' + err.message });
  }
}
