export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedBackendUrl = '';
let cachedDuckBackendUrl = '';

async function refreshBackendUrls() {
  try {
    const binRes = await fetch('https://extendsclass.com/api/json-storage/bin/ffaabaf?nocache=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    });
    if (binRes.ok) {
      const data = await binRes.json();
      if (data) {
        if (data.backendUrl) cachedBackendUrl = data.backendUrl.trim();
        if (data.duckBackendUrl) cachedDuckBackendUrl = data.duckBackendUrl.trim();
      }
    }
  } catch (err) {}
}

export default async function handler(req, res) {
  const url = req.url || '';

  await refreshBackendUrls();

  const isDuckRoute = url.startsWith('/api/state') || url.startsWith('/api/scan_now') || url.startsWith('/api/toggle_scanner') || url.startsWith('/api/toggle_avatar') || url.startsWith('/api/toggle_prize_sent') || url.startsWith('/api/target_posts') || url.startsWith('/api/reset_participant_posts');

  const backendUrl = isDuckRoute ? (cachedDuckBackendUrl || cachedBackendUrl) : cachedBackendUrl;

  if (!backendUrl) {
    return res.status(503).json({ error: 'Адрес бэкенда не опубликован' });
  }

  const targetUrl = backendUrl.replace(/\/$/, '') + req.url;

  try {
    const headers = {};
    const ignoredHeaders = ['host', 'connection', 'content-length', 'accept-encoding'];
    for (const [key, value] of Object.entries(req.headers)) {
      if (!ignoredHeaders.includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    headers['ngrok-skip-browser-warning'] = 'true';
    headers['bypass-tunnel-reminder'] = 'true';

    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      fetchOptions.body = Buffer.concat(chunks);
      headers['content-length'] = fetchOptions.body.length.toString();
    }

    const targetRes = await fetch(targetUrl, fetchOptions);

    res.setHeader('Access-Control-Allow-Origin', '*');
    targetRes.headers.forEach((value, key) => {
      if (key !== 'content-encoding' && key !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    res.status(targetRes.status);

    const contentType = targetRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await targetRes.json();
      res.json(json);
    } else {
      const buffer = await targetRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка проксирования запроса к бэкенду: ' + err.message + (err.cause ? ' | Cause: ' + String(err.cause) : '') });
  }
}
