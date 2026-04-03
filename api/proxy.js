const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxgNaOThQoqB9rPNQJeJLqxz9YEnkqyudJ2JCH6UgiyS4njcCn08ApxnhchDbVVyj_T/exec';

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

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: bodyStr,
      redirect: 'follow',
    });

    const text = await response.text();

    // Tenta parsear diretamente
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch(e) {
      // Retorna o texto bruto para debug
      return res.status(200).json({ 
        error: 'RAW: ' + text.substring(0, 800)
      });
    }

  } catch (err) {
    return res.status(500).json({ error: 'FETCH_ERR: ' + err.message });
  }
}
