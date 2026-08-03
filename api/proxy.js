export const config = {
  api: {
    bodyParser: false,
  },
};

let duckSettings = {
  target_posts: [
    {
      post_url: "https://remanga.org/forum/obmen-f73a917a",
      post_slug: "obmen-f73a917a",
      post_id: 731690,
      header: "Обмен. Пост номер 731690 от DedWeil"
    }
  ]
};

let duckState = {
  scanner_is_running: false,
  last_scan_time: new Date().toLocaleString('ru-RU'),
  settings: duckSettings,
  participants: {
    "12762": {
      id: 12762,
      username: "Сайтама",
      avatar: "/media/users/12762/avatar_d3be61a526544f2c.webp",
      has_duck_avatar: false,
      prize_sent: false,
      duck_posts: [],
      duck_comments: [
        { id: 42583421, text: "Кррряяяяяя", post_header: "Обмен. Пост номер 731690 от DedWeil", post_dir: "obmen-f73a917a" },
        { id: 42582990, text: "Кряяяяяяяяяя", post_header: "Обмен. Пост номер 731690 от DedWeil", post_dir: "obmen-f73a917a" },
        { id: 42582282, text: "Кряяяяяяяяя", post_header: "Обмен. Пост номер 731690 от DedWeil", post_dir: "obmen-f73a917a" }
      ],
      last_processed_post_id: 635496,
      last_processed_comment_id: 0,
      points: 6
    },
    "616003": {
      id: 616003,
      username: "Rimuz-_-",
      avatar: "/media/users/616003/avatar_32d6e370b5074170.webp",
      has_duck_avatar: false,
      prize_sent: false,
      duck_posts: [],
      duck_comments: [],
      last_processed_post_id: 0,
      last_processed_comment_id: 0,
      points: 0
    }
  }
};

function normalizeDuckWord(text) {
  if (!text) return '';
  let cleaned = text.replace(/<[^>]+>/g, '').toLowerCase();
  cleaned = cleaned.replace(/к+/g, 'к').replace(/р+/g, 'р').replace(/я+/g, 'я');
  return cleaned;
}

function isDuckText(text) {
  if (!text) return false;
  const norm = normalizeDuckWord(text);
  if (norm.includes('кря') || norm.includes('quack') || norm.includes('утек') || norm.includes('уток') || norm.includes('утк')) {
    return true;
  }
  const pattern = /(?:к+[\s\-_]*р+[\s\-_]*я+|quack|кря|утек|уток|утк)/i;
  return pattern.test(text);
}

async function runDuckScanCycle() {
  if (duckState.scanner_is_running) return;
  duckState.scanner_is_running = true;
  try {
    const discovered_users = {};
    const target_comments_by_user = {};

    for (const tpost of duckSettings.target_posts) {
      const slug = tpost.post_slug;
      const post_id = tpost.post_id;
      const header = tpost.header || '';

      if (slug) {
        try {
          const resp = await fetch(`https://api.remanga.org/api/v2/forum/${slug}/reactions/?count=100&type=0&page=1`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (resp.ok) {
            const data = await resp.json();
            const results = data.results || [];
            for (const item of results) {
              if (item.type === 0 && item.user && item.user.id) {
                discovered_users[String(item.user.id)] = item.user;
              }
            }
          }
        } catch (e) {}
      }

      if (post_id) {
        try {
          const respTop = await fetch(`https://api.remanga.org/api/v2/activity/comments/?post_id=${post_id}&page=1`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (respTop.ok) {
            const topComms = await respTop.json();
            if (Array.isArray(topComms)) {
              for (const tc of topComms) {
                if (tc.user && tc.user.id) {
                  discovered_users[String(tc.user.id)] = tc.user;
                }
              }
            }
          }
        } catch (e) {}

        try {
          const respAll = await fetch(`https://api.remanga.org/api/v2/activity/comments/?comment_id=42581462&page=1`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (respAll.ok) {
            const replies = await respAll.json();
            if (Array.isArray(replies)) {
              for (const c of replies) {
                if (c.user && c.user.id) {
                  const uid = String(c.user.id);
                  const txt = c.text || '';
                  if (isDuckText(txt)) {
                    discovered_users[uid] = c.user;
                    if (!target_comments_by_user[uid]) target_comments_by_user[uid] = [];
                    target_comments_by_user[uid].push({
                      id: c.id,
                      text: txt.replace(/<[^>]+>/g, '').trim(),
                      post_header: header,
                      post_dir: slug,
                      date: c.date
                    });
                  }
                }
              }
            }
          }
        } catch (e) {}
      }
    }

    for (const [uid_str, user_info] of Object.entries(discovered_users)) {
      if (!duckState.participants[uid_str]) {
        duckState.participants[uid_str] = {
          id: parseInt(uid_str),
          username: user_info.username || `User ${uid_str}`,
          avatar: user_info.avatar && user_info.avatar.mid ? user_info.avatar.mid : '',
          has_duck_avatar: false,
          prize_sent: false,
          duck_posts: [],
          duck_comments: [],
          last_processed_post_id: 0,
          last_processed_comment_id: 0,
          points: 0
        };
      } else {
        if (user_info.username) duckState.participants[uid_str].username = user_info.username;
        if (user_info.avatar && user_info.avatar.mid) duckState.participants[uid_str].avatar = user_info.avatar.mid;
      }
    }

    for (const [uid_str, pdata] of Object.entries(duckState.participants)) {
      const existingIds = new Set((pdata.duck_comments || []).map(c => c.id));
      if (target_comments_by_user[uid_str]) {
        for (const tc of target_comments_by_user[uid_str]) {
          if (!existingIds.has(tc.id)) {
            pdata.duck_comments.push(tc);
            existingIds.add(tc.id);
          }
        }
      }

      const postsPts = (pdata.duck_posts || []).length * 5;
      const commsPts = (pdata.duck_comments || []).length * 2;
      const avatarPts = pdata.has_duck_avatar ? 10 : 0;
      pdata.points = postsPts + commsPts + avatarPts;
    }

    const cleaned = {};
    for (const [uid_str, pdata] of Object.entries(duckState.participants)) {
      if (discovered_users[uid_str] || pdata.points > 0 || (pdata.duck_comments && pdata.duck_comments.length > 0)) {
        cleaned[uid_str] = pdata;
      }
    }
    duckState.participants = cleaned;
    duckState.last_scan_time = new Date().toLocaleString('ru-RU');
  } catch (e) {
  } finally {
    duckState.scanner_is_running = false;
  }
}

let cachedBackendUrl = 'https://patrina-unlusty-vince.ngrok-free.dev';
let lastFetchTime = 0;

export default async function handler(req, res) {
  const now = Date.now();

  const url = req.url || '';

  if (url.startsWith('/api/state') || url.startsWith('/api/scan_now') || url.startsWith('/api/toggle_avatar') || url.startsWith('/api/toggle_prize_sent') || url.startsWith('/api/target_posts')) {
    if (url.startsWith('/api/state')) {
      const partsArray = Object.values(duckState.participants || {});
      partsArray.sort((a, b) => b.points - a.points);
      return res.status(200).json({
        settings: duckState.settings,
        participants: partsArray,
        scanner_is_running: duckState.scanner_is_running,
        last_scan_time: duckState.last_scan_time
      });
    }

    if (url.startsWith('/api/scan_now')) {
      runDuckScanCycle();
      return res.status(200).json({ success: true, message: 'Scan started' });
    }

    let body = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf-8');
        if (raw) body = JSON.parse(raw);
      } catch (e) {}
    }

    if (url.startsWith('/api/toggle_avatar')) {
      const { user_id, has_duck_avatar } = body;
      const uid = String(user_id);
      if (duckState.participants[uid]) {
        duckState.participants[uid].has_duck_avatar = !!has_duck_avatar;
        const p = duckState.participants[uid];
        p.points = ((p.duck_posts || []).length * 5) + ((p.duck_comments || []).length * 2) + (p.has_duck_avatar ? 10 : 0);
      }
      return res.status(200).json({ success: true });
    }

    if (url.startsWith('/api/toggle_prize_sent')) {
      const { user_id, prize_sent } = body;
      const uid = String(user_id);
      if (duckState.participants[uid]) {
        duckState.participants[uid].prize_sent = !!prize_sent;
      }
      return res.status(200).json({ success: true });
    }

    if (url.startsWith('/api/target_posts/add')) {
      const { url: postUrl } = body;
      if (postUrl) {
        const slug = postUrl.trim().replace(/\/$/, '').split('/').pop();
        if (!duckSettings.target_posts.some(p => p.post_slug === slug)) {
          duckSettings.target_posts.push({
            post_url: postUrl,
            post_slug: slug,
            post_id: 731690,
            header: `Пост ${slug}`
          });
        }
      }
      return res.status(200).json({ success: true });
    }

    if (url.startsWith('/api/target_posts/remove')) {
      const { post_id } = body;
      duckSettings.target_posts = duckSettings.target_posts.filter(p => p.post_id !== post_id);
      return res.status(200).json({ success: true });
    }
  }

  if (now - lastFetchTime > 15000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const binRes = await fetch('https://extendsclass.com/api/json-storage/bin/ffaabaf?nocache=' + now, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (binRes.ok) {
        const data = await binRes.json();
        if (data && data.backendUrl) {
          cachedBackendUrl = data.backendUrl.trim();
          lastFetchTime = now;
        }
      }
    } catch (err) {
    }
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
