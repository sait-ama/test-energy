export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedBackendUrl = '';
let cachedDuckBackendUrl = '';

const ALLOWED_IPS = [
  '89.219.20.15',
  '5.166.218.201',
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1'
];

function getClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const ips = String(xForwardedFor).split(',');
    return ips[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '';
}

function isIpAllowed(clientIp) {
  const cleanIp = clientIp.replace(/^::ffff:/, '');
  return ALLOWED_IPS.includes(cleanIp) || ALLOWED_IPS.includes(clientIp);
}

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
  const clientIp = getClientIp(req);
  const allowed = isIpAllowed(clientIp);

  // Защита страницы /duck по IP
  if (url === '/duck' || url.startsWith('/duck?') || url.startsWith('/duck/')) {
    if (!allowed) {
      res.status(403);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(`<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>403 Forbidden</title></head>
<body style="background:#0b0f19;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;background:rgba(22,30,49,0.9);padding:40px;border-radius:12px;border:1px solid rgba(239,68,68,0.3);max-width:480px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
    <div style="font-size:48px;margin-bottom:16px;">🚫</div>
    <h1 style="margin:0 0 10px 0;font-size:24px;">403 Forbidden</h1>
    <p style="color:#9ca3af;margin:0;font-size:14px;line-height:1.5;">Доступ к админ-панели запрещен.<br>Ваш IP-адрес: <strong style="color:#fbbf24;">${clientIp}</strong> не находится в списке разрешенных.</p>
  </div>
</body>
</html>`);
    }
  }

  // Защита административных POST действий по IP
  const isAdminPostAction = req.method === 'POST' && (
    url.startsWith('/api/scan_now') ||
    url.startsWith('/api/toggle_scanner') ||
    url.startsWith('/api/toggle_avatar') ||
    url.startsWith('/api/toggle_prize_sent') ||
    url.startsWith('/api/target_posts') ||
    url.startsWith('/api/reset_participant_posts')
  );

  if (isAdminPostAction && !allowed) {
    return res.status(403).json({
      error: '403 Forbidden: Ваш IP-адрес не имеет прав для выполнения административных действий',
      clientIp: clientIp
    });
  }

  await refreshBackendUrls();

  const isDuckRoute = url.startsWith('/duck') || url.startsWith('/api/state') || url.startsWith('/api/scan_now') || url.startsWith('/api/toggle_scanner') || url.startsWith('/api/toggle_avatar') || url.startsWith('/api/toggle_prize_sent') || url.startsWith('/api/target_posts') || url.startsWith('/api/reset_participant_posts');

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
    res.status(500).json({ error: 'Ошибка проксирования запроса к бэкенду: ' + err.message + ' | Target: ' + targetUrl + (err.cause ? ' | Cause: ' + String(err.cause.message || err.cause) : '') });
  }
}
