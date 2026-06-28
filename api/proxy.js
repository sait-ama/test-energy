export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  let backendUrl = '';
  try {
    const binRes = await fetch('https://extendsclass.com/api/json-storage/bin/ffaabaf?nocache=' + Date.now());
    if (binRes.ok) {
      const data = await binRes.json();
      backendUrl = data.backendUrl;
    }
  } catch (err) {
    return res.status(500).json({ error: 'Не удалось получить адрес бэкенда из облака: ' + err.message });
  }

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
