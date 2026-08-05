export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedBackendUrl = '';
let cachedDuckBackendUrl = '';
let lastFetchTime = 0;

async function refreshBackendUrls() {
  const now = Date.now();
  if (now - lastFetchTime < 10000 && (cachedDuckBackendUrl || cachedBackendUrl)) {
    return;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const binRes = await fetch('https://extendsclass.com/api/json-storage/bin/ffaabaf?nocache=' + now, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (binRes.ok) {
      const data = await binRes.json();
      if (data) {
        if (data.backendUrl) cachedBackendUrl = data.backendUrl.trim();
        if (data.duckBackendUrl) cachedDuckBackendUrl = data.duckBackendUrl.trim();
        lastFetchTime = Date.now();
      }
    }
  } catch (err) {
    if (!cachedDuckBackendUrl && !cachedBackendUrl) {
      lastFetchTime = 0;
    }
  }
}

export default async function handler(req, res) {
  const url = req.url || '';

  await refreshBackendUrls();

  const isDuckRoute = url.startsWith('/api/state') || url.startsWith('/api/scan_now') || url.startsWith('/api/toggle_scanner') || url.startsWith('/api/toggle_avatar') || url.startsWith('/api/toggle_prize_sent') || url.startsWith('/api/target_posts') || url.startsWith('/api/reset_participant_posts');

  const backendUrl = isDuckRoute ? (cachedDuckBackendUrl || cachedBackendUrl) : cachedBackendUrl;

  if (!backendUrl) {
    return res.status(503).json({ error: 'Адрес бэкенда не опубликован' });
  }

  const cleanUrl = req.url.replace(/([?&])path=[^&]*&?/, '$1').replace(/[?&]$/, '');
  const targetUrl = backendUrl.replace(/\/$/, '') + cleanUrl;

  try {
    const headers = {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'accept': 'application/json, text/plain, */*',
      'bypass-tunnel-reminder': 'true'
    };

    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'];
    }

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
      headers['content-type'] = req.headers['content-type'] || 'application/json';
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
    lastFetchTime = 0;
    res.status(500).json({ error: 'Ошибка проксирования запроса к бэкенду: ' + err.message + ' | Target: ' + targetUrl + (err.cause ? ' | Cause: ' + String(err.cause.message || err.cause) : '') });
  }
}
