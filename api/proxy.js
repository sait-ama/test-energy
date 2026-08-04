export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedBackendUrl = 'https://patrina-unlusty-vince.ngrok-free.dev';
let cachedDuckBackendUrl = 'https://shiny-oranges-strive.loca.lt';
let lastFetchTime = 0;

async function refreshBackendUrls(now) {
  if (now - lastFetchTime < 2000) return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const binRes = await fetch('https://extendsclass.com/api/json-storage/bin/ffaabaf?nocache=' + now, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (binRes.ok) {
      const data = await binRes.json();
      if (data && data.backendUrl) {
        cachedBackendUrl = data.backendUrl.trim();
      }
      if (data && data.duckBackendUrl) {
        cachedDuckBackendUrl = data.duckBackendUrl.trim();
      }
      lastFetchTime = now;
    }
  } catch (err) {}
}

async function proxyToDuckBackend(req, res, duckUrl) {
  const targetUrl = duckUrl.replace(/\/$/, '') + req.url;
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': 'application/json, text/plain, */*',
      'bypass-tunnel-reminder': 'true',
      'Bypass-Tunnel-Reminder': 'true'
    };

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
      headers['Content-Type'] = req.headers['content-type'] || 'application/json';
    }

    const targetRes = await fetch(targetUrl, fetchOptions);

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
    res.status(500).json({ error: 'Duck backend proxy error: ' + err.message });
  }
}

export default async function handler(req, res) {
  const now = Date.now();
  const url = req.url || '';

  await refreshBackendUrls(now);

  const isDuckRoute = url.startsWith('/api/state') || url.startsWith('/api/scan_now') || url.startsWith('/api/toggle_avatar') || url.startsWith('/api/toggle_prize_sent') || url.startsWith('/api/target_posts') || url.startsWith('/api/reset_participant_posts');

  if (isDuckRoute) {
    const duckUrl = cachedDuckBackendUrl || cachedBackendUrl;
    if (duckUrl) {
      return proxyToDuckBackend(req, res, duckUrl);
    }
    return res.status(503).json({ error: 'Duck backend URL not configured yet' });
  }

  const backendUrl = cachedBackendUrl;

  if (!backendUrl) {
    return res.status(500).json({ error: 'Адрес бэкенда не опубликован' });
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
    const contentType = targetRes.headers.get('content-type') || '';

    targetRes.headers.forEach((value, key) => {
      if (key !== 'content-encoding' && key !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    res.status(targetRes.status);

    if (contentType.includes('application/json')) {
      const json = await targetRes.json();
      res.json(json);
    } else {
      const buffer = await targetRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    res.status(500).json({ error: 'Ошибка проксирования запроса к бэкенду: ' + err.message });
  }
}
