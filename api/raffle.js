const operations = new Map([
  ['state', 'GET'], ['login', 'POST'], ['reveal', 'POST'],
]);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const operation = req.query.operation;
  if (!operations.has(operation)) return res.status(404).json({ error: 'Страница не найдена.' });
  if (req.method !== operations.get(operation)) return res.status(405).json({ error: 'Метод недоступен.' });

  const origin = process.env.RAFFLE_BACKEND_URL;
  const secret = process.env.RAFFLE_BRIDGE_TOKEN;
  if (!origin || !secret) return res.status(503).json({ error: 'Сервер розыгрыша пока не подключён.' });

  try {
    const upstream = new URL('/' + operation, origin);
    if (upstream.protocol !== 'https:' || upstream.username || upstream.password) throw new Error('Invalid backend URL');
    const headers = { 'X-Raffle-Bridge': secret, Accept: 'application/json' };
    if (req.headers.authorization) headers.Authorization = req.headers.authorization;
    let body;
    if (req.method === 'POST') {
      headers['Content-Type'] = 'application/json';
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
      if (Buffer.byteLength(body) > 4096) return res.status(413).json({ error: 'Запрос слишком большой.' });
    }
    const result = await fetch(upstream, {
      method: req.method, headers, body, redirect: 'error', signal: AbortSignal.timeout(13000),
    });
    const data = await result.json();
    return res.status(result.status).json(data);
  } catch {
    return res.status(502).json({ error: 'Сервер розыгрыша временно недоступен.' });
  }
}
