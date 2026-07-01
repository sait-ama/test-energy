process.env.TZ = 'Europe/Moscow';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initDb, runQuery, getQuery, allQuery } from './db.js';
import { startGuildScanner, runGuildScan } from './scanner.js';
import { spawn } from 'child_process';

try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.error(e);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`, req.method === 'POST' ? req.body : '');
  next();
});
app.use(express.static('public'));
app.use('/bosses', express.static(path.join(process.cwd(), 'Боссы')));

const onlineUsers = new Map();
const pendingAuthTokens = new Map();
let telegramPollingOffset = 0;
let telegramPollingActive = false;

function generateAuthToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function startTelegramPolling() {
  if (!TELEGRAM_BOT_TOKEN || telegramPollingActive) return;
  telegramPollingActive = true;

  async function poll() {
    if (!telegramPollingActive) return;
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${telegramPollingOffset}&timeout=30&allowed_updates=["message"]`;
      const resp = await fetch(url);
      if (!resp.ok) {
        setTimeout(poll, 5000);
        return;
      }
      const data = await resp.json();
      if (data.ok && data.result) {
        for (const update of data.result) {
          telegramPollingOffset = update.update_id + 1;
          if (update.message && update.message.text) {
            const text = update.message.text.trim();
            const match = text.match(/^\/start\s+auth_(.+)$/);
            if (match) {
              const token = match[1];
              const tgUser = update.message.from;
              if (pendingAuthTokens.has(token)) {
                pendingAuthTokens.set(token, {
                  status: 'completed',
                  tg_id: String(tgUser.id),
                  first_name: tgUser.first_name || '',
                  username: tgUser.username || '',
                  completedAt: Date.now()
                });

                try {
                  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: tgUser.id,
                      text: `✅ Авторизация успешна!\n\nДобро пожаловать, ${tgUser.first_name}! Вернитесь на сайт — вход выполнен автоматически.`
                    })
                  });
                } catch (e) {}
              } else {
                try {
                  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: tgUser.id,
                      text: `⚠️ Токен авторизации не найден или истёк.\nПожалуйста, нажмите кнопку "Войти через Telegram" на сайте заново.`
                    })
                  });
                } catch (e) {}
              }
            } else if (text === '/start') {
              const tgUser = update.message.from;
              try {
                await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: tgUser.id,
                    text: `👋 Привет, ${tgUser.first_name}!\n\nЭто бот авторизации для ивента Eternal Watchers.\nДля входа используйте кнопку "Войти через Telegram" на сайте.`
                  })
                });
              } catch (e) {}
            }
          }
        }
      }
    } catch (e) {}
    setTimeout(poll, 1000);
  }

  poll();
}

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of pendingAuthTokens.entries()) {
    const age = now - (data.createdAt || data.completedAt || now);
    if (age > 5 * 60 * 1000) {
      pendingAuthTokens.delete(token);
    }
  }
}, 60000);

async function broadcastPlayersList() {
  try {
    const users = await allQuery('SELECT id, tg_id, tg_username, tg_first_name, remanga_username, remanga_avatar, current_cell, character_data, wins, equipped_weapon, equipped_costume FROM users');
    const effects = await allQuery('SELECT * FROM active_effects');
    const now = new Date();

    const expired = effects.filter(e => new Date(e.expires_at) <= now);
    for (const e of expired) {
      await runQuery('DELETE FROM active_effects WHERE id = ?', [e.id]);
    }

    const activeEffects = effects.filter(e => new Date(e.expires_at) > now);

    const playersList = users.map(user => {
      let parsedChar = null;
      try {
        parsedChar = user.character_data ? JSON.parse(user.character_data) : null;
      } catch (e) {}
      
      const userEffects = activeEffects.filter(e => e.target_user_id === user.id);

      return {
        id: user.id,
        tg_id: user.tg_id,
        tg_username: user.tg_username,
        tg_first_name: user.tg_first_name,
        remanga_username: user.remanga_username,
        remanga_avatar: user.remanga_avatar,
        current_cell: user.current_cell,
        character_data: parsedChar,
        equipped_weapon: user.equipped_weapon || null,
        equipped_costume: user.equipped_costume || null,
        isOnline: onlineUsers.has(String(user.id)),
        effects: userEffects.map(e => ({ type: e.type, name: e.name, expires_at: e.expires_at }))
      };
    });

    io.emit('players_list', playersList);
  } catch (err) {
  }
}

async function broadcastCells() {
  try {
    const cells = await allQuery('SELECT * FROM cells ORDER BY cell_number ASC');
    io.emit('cells_update', cells);
  } catch (err) {
  }
}

io.on('connection', (socket) => {
  let userId = null;

  socket.on('authenticate', async (data) => {
    if (!data || !data.userId) return;
    userId = data.userId;
    socket.join(`user_${userId}`);
    
    const user = await getQuery('SELECT id, tg_id, tg_username, tg_first_name, remanga_username, remanga_avatar, current_cell, character_data FROM users WHERE id = ?', [userId]);
    if (user) {
      onlineUsers.set(String(userId), {
        id: user.id,
        tg_id: user.tg_id,
        tg_username: user.tg_username,
        tg_first_name: user.tg_first_name,
        remanga_username: user.remanga_username,
        remanga_avatar: user.remanga_avatar,
        current_cell: user.current_cell,
        character_data: user.character_data ? JSON.parse(user.character_data) : null,
        socketId: socket.id
      });
      await broadcastPlayersList();
    }
  });

  socket.on('disconnect', async () => {
    if (userId) {
      onlineUsers.delete(String(userId));
      await broadcastPlayersList();
    }
  });
});

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || '';

app.get('/api/config/telegram', (req, res) => {
  res.json({ botUsername: TELEGRAM_BOT_USERNAME });
});

app.post('/api/auth/telegram-start', (req, res) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_BOT_USERNAME) {
    return res.status(500).json({ error: 'Telegram бот не настроен' });
  }
  const token = generateAuthToken();
  pendingAuthTokens.set(token, { status: 'pending', createdAt: Date.now() });
  const botLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=auth_${token}`;
  res.json({ token, botLink });
});

app.get('/api/auth/telegram-check/:token', async (req, res) => {
  const { token } = req.params;
  const data = pendingAuthTokens.get(token);

  if (!data) {
    return res.json({ status: 'expired' });
  }

  if (data.status !== 'completed') {
    return res.json({ status: 'pending' });
  }

  pendingAuthTokens.delete(token);

  const tg_id = data.tg_id;
  const username = data.username;
  const first_name = data.first_name;

  try {
    let user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);
    const isOwner = (username && username.toLowerCase() === 'saitama01010');

    if (!user) {
      const isFirst = (await getQuery('SELECT COUNT(*) as count FROM users')).count === 0;
      const isAdmin = (isFirst || isOwner) ? 1 : 0;

      await runQuery(
        'INSERT INTO users (tg_id, tg_username, tg_first_name, is_admin) VALUES (?, ?, ?, ?)',
        [tg_id, username, first_name, isAdmin]
      );
      user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [user.id, 'registration', 'Регистрация через Telegram бот', new Date().toISOString()]
      );
    } else {
      if (isOwner && !user.is_admin) {
        await runQuery('UPDATE users SET is_admin = 1, tg_username = ?, tg_first_name = ? WHERE id = ?', [username, first_name, user.id]);
      } else {
        await runQuery('UPDATE users SET tg_username = ?, tg_first_name = ? WHERE id = ?', [username, first_name, user.id]);
      }
      user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);
    }

    res.json({
      status: 'completed',
      user: {
        ...user,
        character_data: user.character_data ? JSON.parse(user.character_data) : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/telegram', async (req, res) => {
  const userData = req.body;
  const { id, first_name, username } = userData;
  
  if (!id || !first_name) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  const isValid = verifyTelegramAuth(userData, TELEGRAM_BOT_TOKEN);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid hash signature' });
  }
  
  const tg_id = String(id);
  
  try {
    let user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);
    const isOwner = (username && username.toLowerCase() === 'saitama01010');
    
    if (!user) {
      const isFirst = (await getQuery('SELECT COUNT(*) as count FROM users')).count === 0;
      const isAdmin = (isFirst || isOwner) ? 1 : 0;
      
      await runQuery(
        'INSERT INTO users (tg_id, tg_username, tg_first_name, is_admin) VALUES (?, ?, ?, ?)',
        [tg_id, username || '', first_name, isAdmin]
      );
      user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);
      
      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [user.id, 'registration', 'Регистрация на сайте через Telegram', new Date().toISOString()]
      );
    } else {
      if (isOwner && !user.is_admin) {
        await runQuery('UPDATE users SET is_admin = 1, tg_username = ?, tg_first_name = ? WHERE id = ?', [username || '', first_name, user.id]);
      } else {
        await runQuery('UPDATE users SET tg_username = ?, tg_first_name = ? WHERE id = ?', [username || '', first_name, user.id]);
      }
      user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);
    }
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/telegram-demo', async (req, res) => {
  const { tg_id, username, first_name } = req.body;
  if (!tg_id || !first_name) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    let user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);
    const isOwner = (username && username.toLowerCase() === 'saitama01010');
    
    if (!user) {
      const isFirst = (await getQuery('SELECT COUNT(*) as count FROM users')).count === 0;
      const isAdmin = (isFirst || isOwner) ? 1 : 0;

      await runQuery(
        'INSERT INTO users (tg_id, tg_username, tg_first_name, is_admin) VALUES (?, ?, ?, ?)',
        [tg_id, username || '', first_name, isAdmin]
      );
      user = await getQuery('SELECT * FROM users WHERE tg_id = ?', [tg_id]);
      
      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [user.id, 'registration', 'Регистрация на сайте', new Date().toISOString()]
      );
    } else {
      if (isOwner && !user.is_admin) {
        await runQuery('UPDATE users SET is_admin = 1, tg_username = ? WHERE id = ?', [username || '', user.id]);
        user = await getQuery('SELECT * FROM users WHERE id = ?', [user.id]);
      } else if (username && username !== user.tg_username) {
        await runQuery('UPDATE users SET tg_username = ? WHERE id = ?', [username, user.id]);
        user = await getQuery('SELECT * FROM users WHERE id = ?', [user.id]);
      }
    }

    res.json({
      user: {
        ...user,
        character_data: user.character_data ? JSON.parse(user.character_data) : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tg-avatar/:tgId', async (req, res) => {
  try {
    const tgId = req.params.tgId;
    if (!tgId) {
      return res.status(400).send('Missing tgId');
    }

    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    const localPath = path.join(avatarsDir, `tg_${tgId}.jpg`);
    let useCache = false;
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      const ageMs = Date.now() - stats.mtimeMs;
      if (ageMs < 86400000) {
        useCache = true;
      }
    }

    if (useCache) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(localPath);
    }

    if (!TELEGRAM_BOT_TOKEN) {
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }
      return res.status(500).send('Bot token not configured');
    }

    const photosUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUserProfilePhotos?user_id=${tgId}&limit=1`;
    const photosResp = await fetch(photosUrl);
    if (!photosResp.ok) {
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }
      return res.status(404).send('Avatar not found');
    }

    const photosData = await photosResp.json();
    if (photosData.ok && photosData.result && photosData.result.total_count > 0) {
      const photos = photosData.result.photos[0];
      const photo = photos[0];
      
      const fileUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.file_id}`;
      const fileResp = await fetch(fileUrl);
      if (fileResp.ok) {
        const fileData = await fileResp.json();
        if (fileData.ok && fileData.result && fileData.result.file_path) {
          const imgUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
          const imgResp = await fetch(imgUrl);
          if (imgResp.ok) {
            const buffer = await imgResp.arrayBuffer();
            const nodeBuffer = Buffer.from(buffer);
            fs.writeFileSync(localPath, nodeBuffer);
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(nodeBuffer);
          }
        }
      }
    }

    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }
    return res.status(404).send('No photos found');
  } catch (err) {
    console.error(err);
    const localPath = path.join(process.cwd(), 'public', 'avatars', `tg_${req.params.tgId}.jpg`);
    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
    }
    res.status(500).send(err.message);
  }
});


app.get('/api/profile/:id', async (req, res) => {
  try {
    let user = await getQuery('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.tg_username && user.tg_username.toLowerCase() === 'saitama01010' && !user.is_admin) {
      await runQuery('UPDATE users SET is_admin = 1 WHERE id = ?', [user.id]);
      user = await getQuery('SELECT * FROM users WHERE id = ?', [user.id]);
    }

    const inventory = await allQuery('SELECT * FROM inventory WHERE user_id = ?', [user.id]);
    const activeEffects = await allQuery('SELECT * FROM active_effects WHERE target_user_id = ?', [user.id]);
    const history = await allQuery('SELECT * FROM history WHERE user_id = ? ORDER BY id DESC LIMIT 50', [user.id]);

    let pendingBoss = null;
    if (user.pending_boss_cell !== null && user.pending_boss_cell !== undefined) {
      const pBoss = await getQuery('SELECT * FROM bosses WHERE cell_number = ?', [user.pending_boss_cell]);
      if (pBoss) {
        pendingBoss = {
          cellNumber: pBoss.cell_number,
          bossName: pBoss.name,
          bossHp: pBoss.max_hp,
          bossDmg: pBoss.dmg,
          bossWeakness: pBoss.weakness,
          bossReward: pBoss.reward_coins,
          bossRewardType: pBoss.reward_type || 'coins',
          bossRewardDetail: pBoss.reward_detail || '',
          defeated: pBoss.defeated,
          currentFighterId: pBoss.current_fighter_id,
          currentFighterName: pBoss.current_fighter_username,
          remainingSteps: user.pending_boss_remaining || 0
        };
        if (pBoss.defeated) {
          await runQuery('UPDATE users SET pending_boss_cell = NULL, pending_boss_remaining = 0 WHERE id = ?', [user.id]);
          pendingBoss = null;
        }
      } else {
        await runQuery('UPDATE users SET pending_boss_cell = NULL, pending_boss_remaining = 0 WHERE id = ?', [user.id]);
      }
    }

    res.json({
      user: {
        ...user,
        character_data: user.character_data ? JSON.parse(user.character_data) : null
      },
      inventory,
      activeEffects,
      history,
      pendingBoss
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile/link-remanga', async (req, res) => {
  const { userId, remangaUrl } = req.body;
  if (!userId || !remangaUrl) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const match = remangaUrl.match(/user\/(\d+)/);
  if (!match) {
    return res.status(400).json({ error: 'Неверный формат ссылки. Ссылка должна быть вида https://remanga.org/user/12762/about' });
  }

  const remUserId = parseInt(match[1]);

  try {
    const checkDup = await getQuery('SELECT id FROM users WHERE remanga_user_id = ? AND id != ?', [remUserId, userId]);
    if (checkDup) {
      return res.status(400).json({ error: 'Этот профиль Remanga уже привязан к другому аккаунту' });
    }

    const remRes = await fetch(`https://api.remanga.org/api/v2/users/${remUserId}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://remanga.org/'
      }
    });

    if (!remRes.ok) {
      return res.status(400).json({ error: 'Не удалось получить данные профиля из API Remanga' });
    }

    const remData = await remRes.json();
    if (!remData || !remData.username) {
      return res.status(400).json({ error: 'Профиль не найден в Remanga' });
    }

    const username = remData.username;
    const avatar = remData.avatar?.high || remData.avatar?.mid || '';

    await runQuery(
      'UPDATE users SET remanga_user_id = ?, remanga_username = ?, remanga_avatar = ? WHERE id = ?',
      [remUserId, username, avatar, userId]
    );

    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [userId, 'link_remanga', `Привязан профиль Remanga: ${username} (ID: ${remUserId})`, new Date().toISOString()]
    );

    const updatedUser = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    res.json({
      user: {
        ...updatedUser,
        character_data: updatedUser.character_data ? JSON.parse(updatedUser.character_data) : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/character/save', async (req, res) => {
  const { userId, characterData } = req.body;
  if (!userId || !characterData) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const existingUser = await getQuery('SELECT character_data, is_admin FROM users WHERE id = ?', [userId]);
    if (existingUser && existingUser.character_data && !existingUser.is_admin) {
      return res.status(400).json({ error: 'Персонаж уже создан и его нельзя изменить!' });
    }

    const charString = JSON.stringify(characterData);
    await runQuery('UPDATE users SET character_data = ? WHERE id = ?', [charString, userId]);
    
    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [userId, 'customize', 'Создан 3D-персонаж (изменение заблокировано)', new Date().toISOString()]
    );

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (onlineUsers.has(String(userId))) {
      const cached = onlineUsers.get(String(userId));
      cached.character_data = characterData;
    }
    await broadcastPlayersList();

    res.json({ success: true, user: { ...user, character_data: characterData } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/board/config', async (req, res) => {
  try {
    const cells = await allQuery('SELECT * FROM cells ORDER BY cell_number ASC');
    res.json({ cells });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/board/roll', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.guild_tax_required && user.guild_tax_required > (user.guild_tax_paid || 0)) {
      const remaining = user.guild_tax_required - (user.guild_tax_paid || 0);
      return res.status(400).json({ error: `Вы не можете бросить кубик, пока не оплатите налог гильдии! Осталось внести: ${remaining} молний.` });
    }

    const activeFight = await getQuery('SELECT * FROM bosses WHERE current_fighter_id = ?', [user.id]);
    if (activeFight) {
      return res.status(400).json({ error: 'Вы не можете бросить кубик, пока сражаетесь с боссом!' });
    }

    if (user.pending_boss_cell !== null && user.pending_boss_cell !== undefined) {
      return res.status(400).json({ error: 'Вы стоите перед боссом! Сначала примите решение: сразиться или пройти мимо.' });
    }

    if (user.current_cell >= 299) {
      return res.status(400).json({ error: 'Вы уже дошли до финиша!' });
    }

    const now = new Date();

    const rawEffects = await allQuery('SELECT * FROM active_effects WHERE target_user_id = ?', [user.id]);
    const activeEffects = [];
    for (const e of rawEffects) {
      const expiresAt = new Date(e.expires_at);
      if (expiresAt <= now) {
        await runQuery('DELETE FROM active_effects WHERE id = ?', [e.id]);
      } else {
        activeEffects.push(e);
      }
    }

    const freezeEffect = activeEffects.find(e => e.type === 'freeze');
    if (freezeEffect) {
      const minutesLeft = Math.ceil((new Date(freezeEffect.expires_at) - now) / 60000);
      return res.status(400).json({ error: `Вы заморожены другим игроком! Вы сможете бросить кубик через ${minutesLeft} мин.` });
    }

    if (user.dice_cooldown_until) {
      const cooldown = new Date(user.dice_cooldown_until);
      if (cooldown > now) {
        const minutesLeft = Math.ceil((cooldown - now) / 60000);
        return res.status(400).json({ error: `Кубик перезаряжается. Подождите еще ${minutesLeft} мин.` });
      }
    }

    let roll = Math.floor(Math.random() * 6) + 1;
    const baseRoll = roll;
    let rollModifierText = '';

    const doubleRoll = activeEffects.find(e => e.type === 'double_roll');
    if (doubleRoll) {
      roll = roll * 2;
      rollModifierText = ' (Крылья Ветра x2!)';
      await runQuery('DELETE FROM active_effects WHERE id = ?', [doubleRoll.id]);
    }

    const slowness = activeEffects.find(e => e.type === 'slowness');
    if (slowness) {
      roll = Math.ceil(roll / 2);
      rollModifierText += ' (Магические Оковы /2)';
    }

    let path = [];
    let startCell = user.current_cell;
    let endCell = startCell + roll;

    const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
    const allBosses = await allQuery('SELECT * FROM bosses');
    let bossEncounter = null;
    let stoppedAtBoss = false;

    for (let i = startCell + 1; i <= Math.min(endCell, 299); i++) {
      path.push(i);
      if (bossCells.includes(i)) {
        const bossOnCell = allBosses.find(b => b.cell_number === i);
        if (bossOnCell && !bossOnCell.defeated) {
          const remainingSteps = Math.min(endCell, 299) - i;
          await runQuery('UPDATE users SET pending_boss_cell = ?, pending_boss_remaining = ? WHERE id = ?', [i, remainingSteps, user.id]);
          endCell = i;
          bossEncounter = {
            cellNumber: i,
            bossName: bossOnCell.name,
            bossHp: bossOnCell.max_hp,
            bossDmg: bossOnCell.dmg,
            bossWeakness: bossOnCell.weakness,
            bossReward: bossOnCell.reward_coins,
            currentFighterId: bossOnCell.current_fighter_id,
            currentFighterName: bossOnCell.current_fighter_username,
            remainingSteps: remainingSteps
          };
          stoppedAtBoss = true;
          path = path.slice(0, path.indexOf(i) + 1);
          break;
        }
      }
    }

    let win = false;
    let rewardTriggered = null;
    let specialEffect = null;
    let finalCell = endCell;

    if (stoppedAtBoss) {
      finalCell = endCell;
    } else if (finalCell >= 299) {
      finalCell = 299;
      win = true;
    } else {
      const cell = await getQuery('SELECT * FROM cells WHERE cell_number = ?', [finalCell]);
      if (cell) {
        if (cell.type === 'forward') {
          const jump = cell.value;
          const target = Math.min(299, finalCell + jump);
          for (let i = finalCell + 1; i <= target; i++) {
            path.push(i);
          }
          finalCell = target;
          specialEffect = { type: 'forward', value: jump };
          if (finalCell >= 299) {
            win = true;
          }
        } else if (cell.type === 'backward') {
          const jump = cell.value;
          const target = Math.max(0, finalCell - jump);
          for (let i = finalCell - 1; i >= target; i--) {
            path.push(i);
          }
          finalCell = target;
          specialEffect = { type: 'backward', value: jump };
        } else if (cell.type === 'obstacle') {
          specialEffect = { type: 'obstacle', value: cell.value };
        } else if (cell.type === 'guild_tax') {
          specialEffect = { type: 'guild_tax', value: cell.value };
        }

        const actualCell = await getQuery('SELECT * FROM cells WHERE cell_number = ?', [finalCell]);
        if (actualCell && !win && actualCell.reward_type && actualCell.reward_type !== 'none') {
          if (actualCell.reward_type === 'currency') {
            rewardTriggered = {
              type: actualCell.reward_type,
              name: actualCell.reward_name,
              detail: actualCell.reward_detail
            };
          } else if ((actualCell.reward_type === 'card' || actualCell.reward_type === 'premium') && actualCell.claimed_by_user_id === null) {
            rewardTriggered = {
              type: actualCell.reward_type,
              name: actualCell.reward_name,
              detail: actualCell.reward_detail,
              originCell: finalCell
            };
          }
        }
      }
    }

    let newBalance = user.balance;
    let winsCount = user.wins;

    if (win) {
      winsCount += 1;
      newBalance += 500;
      finalCell = 299;
    } else if (rewardTriggered && rewardTriggered.type === 'currency') {
      newBalance += parseInt(rewardTriggered.detail) || 0;
    }

    let cooldownSeconds = 1800;
    const cooldownRow = await getQuery("SELECT value FROM settings WHERE key = 'dice_cooldown'");
    if (cooldownRow) {
      cooldownSeconds = parseInt(cooldownRow.value) || 1800;
    }
    if (specialEffect && specialEffect.type === 'obstacle') {
      cooldownSeconds = specialEffect.value * 60;
    }

    const nextCooldown = new Date(now.getTime() + cooldownSeconds * 1000).toISOString();
    
    let nextRequired = user.guild_tax_required || 0;
    let nextPaid = user.guild_tax_paid || 0;
    if (specialEffect && specialEffect.type === 'guild_tax') {
      nextRequired = specialEffect.value;
      nextPaid = 0;
    }

    await runQuery(
      'UPDATE users SET current_cell = ?, balance = ?, wins = ?, dice_cooldown_until = ?, guild_tax_required = ?, guild_tax_paid = ? WHERE id = ?',
      [finalCell, newBalance, winsCount, nextCooldown, nextRequired, nextPaid, user.id]
    );

    let detailMsg = `Выпало: ${roll}${rollModifierText}. Перемещение на ячейку ${finalCell}.`;
    if (win) {
      detailMsg += ' Победа! Вы завершили круг и получили 500 монет.';
    } else {
      if (specialEffect) {
        if (specialEffect.type === 'forward') detailMsg += ` Портал переместил вперед на ${specialEffect.value} ячеек.`;
        if (specialEffect.type === 'backward') detailMsg += ` Ловушка откинула назад на ${specialEffect.value} ячеек.`;
        if (specialEffect.type === 'obstacle') detailMsg += ` Трясина заблокировала кубик на ${specialEffect.value} мин.`;
        if (specialEffect.type === 'guild_tax') detailMsg += ` Наложен налог гильдии в размере ${specialEffect.value} молний.`;
      }
      if (rewardTriggered) {
        detailMsg += ` Получена награда: ${rewardTriggered.name} (${rewardTriggered.detail}).`;
      }
    }

    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [user.id, 'roll', detailMsg, now.toISOString()]
    );

    const broadcastData = {
      userId: user.id,
      tg_username: user.tg_username,
      baseRoll,
      roll,
      path,
      startCell,
      endCell: finalCell,
      specialEffect,
      rewardTriggered,
      win,
      cooldownUntil: nextCooldown
    };

    io.emit('player_move', broadcastData);

    if (onlineUsers.has(String(user.id))) {
      onlineUsers.get(String(user.id)).current_cell = finalCell;
    }
    await broadcastPlayersList();

    res.json({
      baseRoll,
      roll,
      path,
      endCell: finalCell,
      balance: newBalance,
      wins: winsCount,
      cooldownUntil: nextCooldown,
      specialEffect,
      rewardTriggered,
      win,
      bossEncounter
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function getShopPrices() {
  const defaults = {
    price_shield: 150,
    price_freeze: 250,
    price_pusher: 200,
    price_cure: 100,
    price_slowness: 180,
    price_double_roll: 300
  };
  try {
    const rows = await allQuery("SELECT key, value FROM settings WHERE key LIKE 'price_%'");
    const prices = { ...defaults };
    rows.forEach(row => {
      prices[row.key] = parseInt(row.value) || defaults[row.key];
    });
    return prices;
  } catch (err) {
    return defaults;
  }
}

function getPlayerBattleStats(user) {
  let charData = {};
  try {
    charData = typeof user.character_data === 'string' ? JSON.parse(user.character_data) : (user.character_data || {});
  } catch (e) {
    charData = {};
  }
  const baseHp = 100;
  const baseDmg = 10;
  let bonusHp = 0;
  let bonusDmg = 0;

  const weapon = charData.weapon || 'none';
  if (weapon === 'sword') bonusDmg += 20;
  else if (weapon === 'staff') { bonusDmg += 10; bonusHp += 10; }
  else if (weapon === 'shield') { bonusDmg += 5; bonusHp += 30; }
  else if (weapon === 'axe') bonusDmg += 40;
  else if (weapon === 'bow') { bonusDmg += 20; bonusHp += 50; }
  else if (weapon === 'scythe') { bonusDmg += 30; bonusHp += 20; }
  else if (weapon === 'hammer') { bonusDmg += 80; bonusHp += 100; }

  const costume = charData.costume || 'normal';
  if (costume === 'armor') bonusHp += 100;
  else if (costume === 'robe') { bonusHp += 20; bonusDmg += 10; }
  else if (costume === 'cyber') { bonusHp += 30; bonusDmg += 5; }
  else if (costume === 'steampunk') { bonusHp += 55; bonusDmg += 10; }
  else if (costume === 'ninja_suit') { bonusHp += 200; bonusDmg += 30; }

  return {
    maxHp: baseHp + bonusHp,
    dmg: baseDmg + bonusDmg,
    element: charData.element || 'water'
  };
}

app.get('/api/bosses', async (req, res) => {
  try {
    const rows = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boss/skip', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const bossCellsList = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
    const hasPending = user.pending_boss_cell !== null && user.pending_boss_cell !== undefined;
    const isOnBossCell = bossCellsList.includes(user.current_cell);

    if (!hasPending && !isOnBossCell) {
      return res.status(400).json({ error: 'Нет ожидающего босса для пропуска' });
    }

    if (!hasPending && isOnBossCell) {
      await runQuery('UPDATE users SET pending_boss_cell = NULL, pending_boss_remaining = 0 WHERE id = ?', [user.id]);
      return res.json({ path: [], endCell: user.current_cell, win: false, balance: user.balance });
    }

    const remaining = user.pending_boss_remaining || 0;
    const startCell = user.current_cell;
    let finalCell = startCell + remaining;
    let path = [];
    let win = false;
    let specialEffect = null;
    let rewardTriggered = null;

    const bossCells = [30, 60, 90, 120, 150, 180, 210, 240, 270, 299];
    const allBosses = await allQuery('SELECT * FROM bosses');
    let newBossEncounter = null;

    for (let i = startCell + 1; i <= Math.min(finalCell, 299); i++) {
      path.push(i);
      if (bossCells.includes(i)) {
        const bossOnCell = allBosses.find(b => b.cell_number === i);
        if (bossOnCell && !bossOnCell.defeated) {
          const newRemaining = Math.min(finalCell, 299) - i;
          await runQuery('UPDATE users SET current_cell = ?, pending_boss_cell = ?, pending_boss_remaining = ? WHERE id = ?', [i, i, newRemaining, user.id]);
          path = path.slice(0, path.indexOf(i) + 1);
          newBossEncounter = {
            cellNumber: i,
            bossName: bossOnCell.name,
            bossHp: bossOnCell.max_hp,
            bossDmg: bossOnCell.dmg,
            bossWeakness: bossOnCell.weakness,
            bossReward: bossOnCell.reward_coins,
            currentFighterId: bossOnCell.current_fighter_id,
            currentFighterName: bossOnCell.current_fighter_username,
            remainingSteps: newRemaining
          };

          if (onlineUsers.has(String(user.id))) {
            onlineUsers.get(String(user.id)).current_cell = i;
          }
          io.emit('player_move', {
            userId: user.id,
            tg_username: user.tg_username,
            path,
            startCell,
            endCell: i,
            specialEffect: null,
            rewardTriggered: null,
            win: false
          });
          await broadcastPlayersList();
          return res.json({ path, endCell: i, bossEncounter: newBossEncounter, win: false });
        }
      }
    }

    if (finalCell >= 299) {
      finalCell = 299;
      win = true;
    } else {
      const cell = await getQuery('SELECT * FROM cells WHERE cell_number = ?', [finalCell]);
      if (cell) {
        if (cell.type === 'forward') {
          const jump = cell.value;
          const target = Math.min(299, finalCell + jump);
          for (let i = finalCell + 1; i <= target; i++) path.push(i);
          finalCell = target;
          specialEffect = { type: 'forward', value: jump };
          if (finalCell >= 299) win = true;
        } else if (cell.type === 'backward') {
          const jump = cell.value;
          const target = Math.max(0, finalCell - jump);
          for (let i = finalCell - 1; i >= target; i--) path.push(i);
          finalCell = target;
          specialEffect = { type: 'backward', value: jump };
        } else if (cell.type === 'obstacle') {
          specialEffect = { type: 'obstacle', value: cell.value };
        } else if (cell.type === 'guild_tax') {
          specialEffect = { type: 'guild_tax', value: cell.value };
        }

        const actualCell = await getQuery('SELECT * FROM cells WHERE cell_number = ?', [finalCell]);
        if (actualCell && !win && actualCell.reward_type && actualCell.reward_type !== 'none') {
          if (actualCell.reward_type === 'currency') {
            rewardTriggered = { type: actualCell.reward_type, name: actualCell.reward_name, detail: actualCell.reward_detail };
          } else if ((actualCell.reward_type === 'card' || actualCell.reward_type === 'premium') && actualCell.claimed_by_user_id === null) {
            rewardTriggered = { type: actualCell.reward_type, name: actualCell.reward_name, detail: actualCell.reward_detail, originCell: finalCell };
          }
        }
      }
    }

    let newBalance = user.balance;
    if (win) {
      newBalance += 500;
      await runQuery('UPDATE users SET wins = wins + 1 WHERE id = ?', [user.id]);
    } else if (rewardTriggered && rewardTriggered.type === 'currency') {
      newBalance += parseInt(rewardTriggered.detail) || 0;
    }

    let nextRequired = user.guild_tax_required || 0;
    let nextPaid = user.guild_tax_paid || 0;
    if (specialEffect && specialEffect.type === 'guild_tax') {
      nextRequired = specialEffect.value;
      nextPaid = 0;
    }

    await runQuery(
      'UPDATE users SET current_cell = ?, balance = ?, pending_boss_cell = NULL, pending_boss_remaining = 0, guild_tax_required = ?, guild_tax_paid = ? WHERE id = ?',
      [finalCell, newBalance, nextRequired, nextPaid, user.id]
    );

    const now = new Date();
    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [user.id, 'boss_skip', `Пропустил босса и прошёл дальше на ячейку ${finalCell}.`, now.toISOString()]
    );

    if (onlineUsers.has(String(user.id))) {
      onlineUsers.get(String(user.id)).current_cell = finalCell;
    }

    io.emit('player_move', {
      userId: user.id,
      tg_username: user.tg_username,
      path,
      startCell,
      endCell: finalCell,
      specialEffect,
      rewardTriggered,
      win
    });
    await broadcastPlayersList();

    res.json({ path, endCell: finalCell, specialEffect, rewardTriggered, win, balance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boss/start-fight', async (req, res) => {
  const { userId, cellNumber } = req.body;
  if (!userId || !cellNumber) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.current_cell !== parseInt(cellNumber)) {
      return res.status(400).json({ error: 'Вы не находитесь на ячейке с боссом!' });
    }
    
    const boss = await getQuery('SELECT * FROM bosses WHERE cell_number = ?', [cellNumber]);
    if (!boss) return res.status(404).json({ error: 'Boss not found' });
    
    if (boss.defeated) {
      return res.status(400).json({ error: 'Этот босс уже побежден!' });
    }
    
    if (boss.current_fighter_id && boss.current_fighter_id !== user.id) {
      return res.status(400).json({ error: `С боссом уже сражается другой игрок: ${boss.current_fighter_username}` });
    }
    
    const stats = getPlayerBattleStats(user);
    
    await runQuery('UPDATE users SET pending_boss_cell = NULL, pending_boss_remaining = 0 WHERE id = ?', [user.id]);

    await runQuery(
      'UPDATE bosses SET current_fighter_id = ?, current_fighter_username = ?, current_fighter_hp = ?, hp = ? WHERE cell_number = ?',
      [user.id, user.tg_first_name || user.tg_username || 'Неизвестно', stats.maxHp, boss.max_hp, cellNumber]
    );
    
    const updatedBosses = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
    io.emit('bosses_update', updatedBosses);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boss/attack', async (req, res) => {
  const { userId, cellNumber } = req.body;
  if (!userId || !cellNumber) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const boss = await getQuery('SELECT * FROM bosses WHERE cell_number = ?', [cellNumber]);
    if (!boss) return res.status(404).json({ error: 'Boss not found' });
    
    if (boss.current_fighter_id !== user.id) {
      return res.status(400).json({ error: 'Вы не сражаетесь с этим боссом!' });
    }
    
    const now = new Date();
    if (user.last_boss_attack_time) {
      const lastAttack = new Date(user.last_boss_attack_time);
      const elapsedSeconds = (now.getTime() - lastAttack.getTime()) / 1000;
      const cdSeconds = boss.attack_cooldown_seconds || 300;
      if (elapsedSeconds < cdSeconds) {
        const remain = Math.ceil(cdSeconds - elapsedSeconds);
        return res.status(400).json({ error: `Кулдаун удара! Подождите ещё ${remain} секунд.` });
      }
    }
    
    const stats = getPlayerBattleStats(user);
    
    let dmgDealt = stats.dmg;
    let elementMatch = false;
    if (stats.element === boss.weakness) {
      dmgDealt = Math.floor(dmgDealt * 1.5);
      elementMatch = true;
    }
    
    const newBossHp = Math.max(0, boss.hp - dmgDealt);
    
    await runQuery('UPDATE users SET last_boss_attack_time = ? WHERE id = ?', [now.toISOString(), user.id]);
    user.last_boss_attack_time = now.toISOString();
    
    if (newBossHp <= 0) {
      const reward = boss.reward_coins || 500;
      const newBalance = user.balance + reward;
      
      await runQuery(
        'UPDATE bosses SET hp = 0, defeated = 1, defeated_by_username = ?, current_fighter_id = NULL, current_fighter_username = NULL, current_fighter_hp = 0 WHERE cell_number = ?',
        [user.tg_first_name || user.tg_username || 'Неизвестно', cellNumber]
      );
      
      await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, user.id]);

      let historyDetail = `Побежден босс ${boss.name}! Получено ${reward} монет.`;
      let rewardCardName = null;

      if (boss.reward_type === 'card' && boss.reward_detail) {
        const parts = boss.reward_detail.split('|');
        const cardCover = parts[0] || '';
        const cardName = parts[1] || boss.name + ' — Карта';
        const cardChar = parts[2] || '';

        await runQuery(
          'INSERT INTO inventory (user_id, item_type, name, description, duration, origin_cell_number) VALUES (?, ?, ?, ?, ?, ?)',
          [user.id, 'remanga_card', cardName, cardCover, 0, cellNumber]
        );

        rewardCardName = cardName;
        historyDetail = `Побежден босс ${boss.name}! Получено ${reward} монет и карта: ${cardName}.`;
      }
      
      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [user.id, 'boss_victory', historyDetail, now.toISOString()]
      );
      
      const updatedBosses = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
      io.emit('bosses_update', updatedBosses);
      
      io.to(`user_${user.id}`).emit('balance_update', { balance: newBalance });
      
      return res.json({
        status: 'victory',
        dmgDealt,
        bossHp: 0,
        reward,
        elementMatch,
        rewardCard: rewardCardName
      });
    }
    
    const bossDmg = boss.dmg;
    const newPlayerHp = Math.max(0, boss.current_fighter_hp - bossDmg);
    
    if (newPlayerHp <= 0) {
      const loss = 300;
      const newBalance = user.balance - loss;
      const newCell = Math.max(0, user.current_cell - 5);
      
      const path = [];
      for (let c = user.current_cell - 1; c >= newCell; c--) {
        path.push(c);
      }
      
      await runQuery(
        'UPDATE bosses SET current_fighter_id = NULL, current_fighter_username = NULL, current_fighter_hp = 0, hp = max_hp WHERE cell_number = ?',
        [cellNumber]
      );
      
      await runQuery(
        'UPDATE users SET current_cell = ?, balance = ? WHERE id = ?',
        [newCell, newBalance, user.id]
      );
      
      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [user.id, 'boss_defeat', `Поражение от босса ${boss.name}! Потеряно ${loss} монет, откат на ячейку ${newCell}.`, now.toISOString()]
      );
      
      const updatedBosses = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
      io.emit('bosses_update', updatedBosses);
      
      if (onlineUsers.has(String(user.id))) {
        const cached = onlineUsers.get(String(user.id));
        cached.current_cell = newCell;
      }
      
      io.emit('player_move', {
        userId: user.id,
        tg_username: user.tg_username,
        path,
        startCell: user.current_cell,
        endCell: newCell,
        specialEffect: null,
        rewardTriggered: null,
        win: false
      });
      
      await broadcastPlayersList();
      
      io.to(`user_${user.id}`).emit('balance_update', { balance: newBalance });
      
      return res.json({
        status: 'defeat',
        dmgDealt,
        bossDmg,
        playerHp: 0,
        newCell,
        newBalance,
        path,
        elementMatch
      });
    }
    
    await runQuery(
      'UPDATE bosses SET hp = ?, current_fighter_hp = ? WHERE cell_number = ?',
      [newBossHp, newPlayerHp, cellNumber]
    );
    
    const updatedBosses = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
    io.emit('bosses_update', updatedBosses);
    
    res.json({
      status: 'active',
      dmgDealt,
      bossDmg,
      playerHp: newPlayerHp,
      bossHp: newBossHp,
      elementMatch
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/boss/forfeit', async (req, res) => {
  const { userId, cellNumber } = req.body;
  if (!userId || !cellNumber) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const boss = await getQuery('SELECT * FROM bosses WHERE cell_number = ?', [cellNumber]);
    if (!boss) return res.status(404).json({ error: 'Boss not found' });
    
    if (boss.current_fighter_id !== user.id) {
      return res.status(400).json({ error: 'Вы не сражаетесь с этим боссом!' });
    }
    
    const loss = 300;
    const newBalance = user.balance - loss;
    const newCell = Math.max(0, user.current_cell - 5);
    
    const path = [];
    for (let c = user.current_cell - 1; c >= newCell; c--) {
      path.push(c);
    }
    
    await runQuery(
      'UPDATE bosses SET current_fighter_id = NULL, current_fighter_username = NULL, current_fighter_hp = 0, hp = max_hp WHERE cell_number = ?',
      [cellNumber]
    );
    
    await runQuery(
      'UPDATE users SET current_cell = ?, balance = ? WHERE id = ?',
      [newCell, newBalance, user.id]
    );
    
    const now = new Date();
    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [user.id, 'boss_forfeit', `Побег от босса ${boss.name}! Потеряно ${loss} монет, откат на ячейку ${newCell}.`, now.toISOString()]
    );
    
    const updatedBosses = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
    io.emit('bosses_update', updatedBosses);
    
    if (onlineUsers.has(String(user.id))) {
      const cached = onlineUsers.get(String(user.id));
      cached.current_cell = newCell;
    }
    
    io.emit('player_move', {
      userId: user.id,
      tg_username: user.tg_username,
      path,
      startCell: user.current_cell,
      endCell: newCell,
      specialEffect: null,
      rewardTriggered: null,
      win: false
    });
    
    await broadcastPlayersList();
    
    io.to(`user_${user.id}`).emit('balance_update', { balance: newBalance });
    
    res.json({
      status: 'defeat',
      newCell,
      newBalance,
      path
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/boss-models', async (req, res) => {
  try {
    const modelsDir = path.join(process.cwd(), 'Боссы');
    const files = await import('fs').then(fs => fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb')));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/boss/update', checkAdmin, async (req, res) => {
  const { cellNumber, hp, dmg, cooldown, reward, rewardType, rewardDetail, name, modelFile } = req.body;
  if (!cellNumber || hp === undefined || dmg === undefined || cooldown === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    await runQuery(
      'UPDATE bosses SET name = ?, max_hp = ?, hp = ?, dmg = ?, attack_cooldown_seconds = ?, reward_coins = ?, reward_type = ?, reward_detail = ?, model_file = ? WHERE cell_number = ?',
      [name || '', hp, hp, dmg, cooldown, reward || 0, rewardType || 'coins', rewardDetail || '', modelFile || '', cellNumber]
    );
    
    const updatedBosses = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
    io.emit('bosses_update', updatedBosses);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/boss/position', checkAdmin, async (req, res) => {
  const { cellNumber, offsetX, offsetY, offsetZ, rotation, scale } = req.body;
  if (!cellNumber) {
    return res.status(400).json({ error: 'Missing cellNumber' });
  }
  try {
    await runQuery(
      'UPDATE bosses SET position_offset_x = ?, position_offset_y = ?, position_offset_z = ?, custom_rotation = ?, custom_scale = ? WHERE cell_number = ?',
      [offsetX || 0, offsetY || 0, offsetZ || 0, rotation !== undefined && rotation !== null ? rotation : null, scale !== undefined && scale !== null ? scale : 1.0, cellNumber]
    );
    
    const updatedBosses = await allQuery('SELECT * FROM bosses ORDER BY cell_number ASC');
    io.emit('bosses_update', updatedBosses);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/shop', async (req, res) => {
  const prices = await getShopPrices();
  const items = [
    {
      id: 'shield',
      name: 'Энергетический Щит',
      description: 'Защищает от вредоносных способностей (замораживание, отталкивание) на 12 часов. Действует до первого применения, после сгорает.',
      cost: prices.price_shield,
      item_type: 'shield',
      duration: 43200
    },
    {
      id: 'freeze',
      name: 'Ледяной Свиток',
      description: 'Замораживает выбранного игрока на 2 часа (пользователь должен быть онлайн).',
      cost: prices.price_freeze,
      item_type: 'freeze',
      duration: 7200
    },
    {
      id: 'pusher',
      name: 'Гравитационный Импульс',
      description: 'Отталкивает выбранного игрока на 3 ячейки назад.',
      cost: prices.price_pusher,
      item_type: 'pusher',
      duration: 0
    },
    {
      id: 'cure',
      name: 'Очищающее Зелье',
      description: 'Снимает все действующие негативные эффекты (примененные к вам от других игроков заморозка, замедление).',
      cost: prices.price_cure,
      item_type: 'cure',
      duration: 0
    },
    {
      id: 'slowness',
      name: 'Магические Оковы',
      description: 'Замедляет выбранного игрока на 4 часа (выпавшее число делится на 2).',
      cost: prices.price_slowness,
      item_type: 'slowness',
      duration: 14400
    },
    {
      id: 'double_roll',
      name: 'Крылья Ветра',
      description: 'Удваивает результат вашего следующего броска кубика (действует 1 час). Действует до первого применения, после сгорает.',
      cost: prices.price_double_roll,
      item_type: 'double_roll',
      duration: 3600
    }
  ];
  res.json({ items });
});

app.get('/api/equipment/shop', async (req, res) => {
  const prices = await getShopPrices();
  const items = [
    { id: 'eq_axe', category: 'weapon', key: 'axe', name: 'Боевой топор', description: '+40 DMG', bonusHp: 0, bonusDmg: 40, cost: prices.price_eq_axe || 500 },
    { id: 'eq_bow', category: 'weapon', key: 'bow', name: 'Лук', description: '+50 HP, +20 DMG', bonusHp: 50, bonusDmg: 20, cost: prices.price_eq_bow || 600 },
    { id: 'eq_scythe', category: 'weapon', key: 'scythe', name: 'Коса смерти', description: '+20 HP, +30 DMG', bonusHp: 20, bonusDmg: 30, cost: prices.price_eq_scythe || 700 },
    { id: 'eq_hammer', category: 'weapon', key: 'hammer', name: 'Молот Тора', description: '+100 HP, +80 DMG', bonusHp: 100, bonusDmg: 80, cost: prices.price_eq_hammer || 2000 },
    { id: 'eq_cyber', category: 'costume', key: 'cyber', name: 'Кибер-костюм', description: '+30 HP, +5 DMG', bonusHp: 30, bonusDmg: 5, cost: prices.price_eq_cyber || 400 },
    { id: 'eq_steampunk', category: 'costume', key: 'steampunk', name: 'Стимпанк жилет', description: '+55 HP, +10 DMG', bonusHp: 55, bonusDmg: 10, cost: prices.price_eq_steampunk || 800 },
    { id: 'eq_ninja', category: 'costume', key: 'ninja_suit', name: 'Костюм шиноби', description: '+200 HP, +30 DMG', bonusHp: 200, bonusDmg: 30, cost: prices.price_eq_ninja || 3000 }
  ];
  res.json({ items });
});

app.post('/api/equipment/buy', async (req, res) => {
  const { userId, itemId } = req.body;
  if (!userId || !itemId) return res.status(400).json({ error: 'Missing parameters' });

  const allItems = {
    eq_axe: { key: 'axe', category: 'weapon', name: 'Боевой топор', bonusHp: 0, bonusDmg: 40, cost: 500 },
    eq_bow: { key: 'bow', category: 'weapon', name: 'Лук', bonusHp: 50, bonusDmg: 20, cost: 600 },
    eq_scythe: { key: 'scythe', category: 'weapon', name: 'Коса смерти', bonusHp: 20, bonusDmg: 30, cost: 700 },
    eq_hammer: { key: 'hammer', category: 'weapon', name: 'Молот Тора', bonusHp: 100, bonusDmg: 80, cost: 2000 },
    eq_cyber: { key: 'cyber', category: 'costume', name: 'Кибер-костюм', bonusHp: 30, bonusDmg: 5, cost: 400 },
    eq_steampunk: { key: 'steampunk', category: 'costume', name: 'Стимпанк жилет', bonusHp: 55, bonusDmg: 10, cost: 800 },
    eq_ninja: { key: 'ninja_suit', category: 'costume', name: 'Костюм шиноби', bonusHp: 200, bonusDmg: 30, cost: 3000 }
  };

  const prices = await getShopPrices();
  const item = allItems[itemId];
  if (!item) return res.status(400).json({ error: 'Товар не найден' });

  const priceKey = `price_${itemId}`;
  const cost = prices[priceKey] || item.cost;

  try {
    const user = await getQuery('SELECT balance FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.balance < cost) return res.status(400).json({ error: 'Недостаточно монет' });

    const existing = await getQuery('SELECT id FROM equipment_inventory WHERE user_id = ? AND item_key = ?', [userId, item.key]);
    if (existing) return res.status(400).json({ error: 'У вас уже есть этот предмет' });

    const newBalance = user.balance - cost;
    await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);
    await runQuery(
      'INSERT INTO equipment_inventory (user_id, item_key, item_category, name, bonus_hp, bonus_dmg) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, item.key, item.category, item.name, item.bonusHp, item.bonusDmg]
    );
    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [userId, 'buy_equipment', `Куплено: ${item.name} за ${cost} монет`, new Date().toISOString()]
    );

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/equipment/inventory', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  try {
    const items = await allQuery('SELECT * FROM equipment_inventory WHERE user_id = ?', [userId]);
    const user = await getQuery('SELECT equipped_weapon, equipped_costume FROM users WHERE id = ?', [userId]);
    res.json({ items, equippedWeapon: user ? user.equipped_weapon : null, equippedCostume: user ? user.equipped_costume : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipment/equip', async (req, res) => {
  const { userId, itemKey, category } = req.body;
  if (!userId || !category) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    let charData = {};
    try { charData = user.character_data ? JSON.parse(user.character_data) : {}; } catch(e) { charData = {}; }

    const starterWeapons = ['none', 'sword', 'staff', 'shield'];
    const starterCostumes = ['normal', 'armor', 'robe'];

    if (category === 'weapon') {
      if (itemKey && !starterWeapons.includes(itemKey)) {
        const owned = await getQuery('SELECT id FROM equipment_inventory WHERE user_id = ? AND item_key = ?', [userId, itemKey]);
        if (!owned) return res.status(400).json({ error: 'У вас нет этого оружия' });
      }
      charData.weapon = itemKey || 'none';
      await runQuery('UPDATE users SET equipped_weapon = ?, character_data = ? WHERE id = ?', [itemKey || null, JSON.stringify(charData), userId]);
    } else if (category === 'costume') {
      if (itemKey && !starterCostumes.includes(itemKey)) {
        const owned = await getQuery('SELECT id FROM equipment_inventory WHERE user_id = ? AND item_key = ?', [userId, itemKey]);
        if (!owned) return res.status(400).json({ error: 'У вас нет этого костюма' });
      }
      charData.costume = itemKey || 'normal';
      await runQuery('UPDATE users SET equipped_costume = ?, character_data = ? WHERE id = ?', [itemKey || null, JSON.stringify(charData), userId]);
    } else {
      return res.status(400).json({ error: 'Неверная категория' });
    }

    if (onlineUsers.has(String(userId))) {
      const cached = onlineUsers.get(String(userId));
      cached.character_data = charData;
    }
    await broadcastPlayersList();

    res.json({ success: true, character_data: charData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/casino/spin', async (req, res) => {
  const { userId, bet, color } = req.body;
  if (!userId || !bet || !color) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  const betAmount = parseInt(bet);
  if (isNaN(betAmount) || betAmount < 1) {
    return res.status(400).json({ error: 'Некорректная ставка' });
  }
  if (!['red', 'black', 'green'].includes(color)) {
    return res.status(400).json({ error: 'Некорректный цвет' });
  }

  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Недостаточно монет' });
    }

    await runQuery('UPDATE users SET balance = balance - ? WHERE id = ?', [betAmount, userId]);

    const rand = Math.random() * 100;
    let resultColor;
    if (rand < 2) {
      resultColor = 'green';
    } else if (rand < 51) {
      resultColor = 'red';
    } else {
      resultColor = 'black';
    }

    let winAmount = 0;
    let multiplier = 0;
    if (resultColor === color) {
      if (color === 'green') {
        multiplier = 50;
      } else {
        multiplier = 2;
      }
      winAmount = betAmount * multiplier;
      await runQuery('UPDATE users SET balance = balance + ? WHERE id = ?', [winAmount, userId]);
    }

    const updatedUser = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);

    res.json({
      resultColor,
      betColor: color,
      bet: betAmount,
      won: resultColor === color,
      winAmount,
      multiplier,
      newBalance: updatedUser.balance
    });
  } catch (err) {
    console.error('Casino error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/shop/buy', async (req, res) => {
  const { userId, itemId } = req.body;
  if (!userId || !itemId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const prices = await getShopPrices();
  const items = {
    shield: { name: 'Энергетический Щит', cost: prices.price_shield, desc: 'Защищает от вредоносных способностей (замораживание, отталкивание) на 12 часов. Действует до первого применения, после сгорает.', type: 'shield', duration: 43200 },
    freeze: { name: 'Ледяной Свиток', cost: prices.price_freeze, desc: 'Замораживает выбранного игрока на 2 часа (пользователь должен быть онлайн).', type: 'freeze', duration: 7200 },
    pusher: { name: 'Гравитационный Импульс', cost: prices.price_pusher, desc: 'Отталкивает игрока на 3 ячейки назад', type: 'pusher', duration: 0 },
    cure: { name: 'Очищающее Зелье', cost: prices.price_cure, desc: 'Снимает все действующие негативные эффекты (примененные к вам от других игроков заморозка, замедление).', type: 'cure', duration: 0 },
    slowness: { name: 'Магические Оковы', cost: prices.price_slowness, desc: 'Замедляет игрока на 4 часа', type: 'slowness', duration: 14400 },
    double_roll: { name: 'Крылья Ветра', cost: prices.price_double_roll, desc: 'Удваивает результат вашего следующего броска кубика (действует 1 час). Действует до первого применения, после сгорает.', type: 'double_roll', duration: 3600 }
  };

  const item = items[itemId];
  if (!item) {
    return res.status(400).json({ error: 'Товар не найден' });
  }

  try {
    const user = await getQuery('SELECT balance FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.balance < item.cost) {
      return res.status(400).json({ error: 'Недостаточно валюты' });
    }

    const newBalance = user.balance - item.cost;
    await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);

    await runQuery(
      'INSERT INTO inventory (user_id, item_type, name, description, duration) VALUES (?, ?, ?, ?, ?)',
      [userId, item.type, item.name, item.desc, item.duration]
    );

    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [userId, 'buy_item', `Куплен предмет: ${item.name} за ${item.cost} монет`, new Date().toISOString()]
    );

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shop/use', async (req, res) => {
  const { userId, inventoryId, targetUserId } = req.body;
  if (!userId || !inventoryId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const item = await getQuery('SELECT * FROM inventory WHERE id = ? AND user_id = ?', [inventoryId, userId]);
    if (!item) {
      return res.status(400).json({ error: 'Предмет не найден в вашем инвентаре' });
    }

    const sourceUser = await getQuery('SELECT tg_username, tg_first_name FROM users WHERE id = ?', [userId]);

    if (item.item_type === 'shield') {
      const expiresAt = new Date(Date.now() + item.duration * 1000).toISOString();
      await runQuery(
        'INSERT INTO active_effects (target_user_id, source_user_id, type, name, expires_at) VALUES (?, ?, ?, ?, ?)',
        [userId, userId, 'shield', item.name, expiresAt]
      );

      await runQuery('DELETE FROM inventory WHERE id = ?', [inventoryId]);
      
      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [userId, 'use_item', `Активирован Энергетический Щит на 12 часов`, new Date().toISOString()]
      );

      await broadcastPlayersList();
      return res.json({ success: true, message: 'Энергетический Щит успешно активирован!' });
    }

    if (item.item_type === 'cure') {
      await runQuery('DELETE FROM active_effects WHERE target_user_id = ? AND type IN ("freeze", "slowness")', [userId]);
      await runQuery('DELETE FROM inventory WHERE id = ?', [inventoryId]);
      
      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [userId, 'use_item', `Использовано Очищающее Зелье: все негативные эффекты сняты`, new Date().toISOString()]
      );

      await broadcastPlayersList();
      return res.json({ success: true, message: 'Все негативные эффекты успешно сняты!' });
    }

    if (item.item_type === 'double_roll') {
      const expiresAt = new Date(Date.now() + item.duration * 1000).toISOString();
      await runQuery(
        'INSERT INTO active_effects (target_user_id, source_user_id, type, name, expires_at) VALUES (?, ?, ?, ?, ?)',
        [userId, userId, 'double_roll', item.name, expiresAt]
      );

      await runQuery('DELETE FROM inventory WHERE id = ?', [inventoryId]);
      
      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [userId, 'use_item', `Активированы Крылья Ветра на 1 час`, new Date().toISOString()]
      );

      await broadcastPlayersList();
      return res.json({ success: true, message: 'Крылья Ветра успешно активированы! Следующий бросок будет удвоен.' });
    }

    if (!targetUserId) {
      return res.status(400).json({ error: 'Для этого предмета нужно выбрать цель' });
    }

    if (parseInt(targetUserId) === parseInt(userId)) {
      return res.status(400).json({ error: 'Вы не можете применить эту способность к себе' });
    }

    const targetUser = await getQuery('SELECT id, tg_username, tg_first_name, current_cell, balance FROM users WHERE id = ?', [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Цель не найдена' });
    }

    if (targetUser.current_cell >= 299) {
      return res.status(400).json({ error: 'Игрок уже закончил игру!' });
    }

    const targetShield = await getQuery('SELECT id FROM active_effects WHERE target_user_id = ? AND type = "shield"', [targetUser.id]);
    if (targetShield) {
      await runQuery('DELETE FROM active_effects WHERE id = ?', [targetShield.id]);
      await runQuery('DELETE FROM inventory WHERE id = ?', [inventoryId]);

      const sourceMsg = `Игрок ${targetUser.tg_first_name || targetUser.tg_username} отразил вашу атаку с помощью Энергетического Щита!`;
      const targetMsg = `Вы успешно отразили атаку (${item.name}) от ${sourceUser.tg_first_name || sourceUser.tg_username}!`;

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [userId, 'use_blocked', `Ваша способность ${item.name} была заблокирована щитом игрока ${targetUser.tg_first_name || targetUser.tg_username}`, new Date().toISOString()]
      );

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [targetUser.id, 'shield_blocked', `Ваш щит заблокировал способность ${item.name} от игрока ${sourceUser.tg_first_name || sourceUser.tg_username}`, new Date().toISOString()]
      );

      io.to(`user_${targetUser.id}`).emit('effect_notification', { message: targetMsg });
      return res.json({ success: true, blocked: true, message: sourceMsg });
    }

    if (item.item_type === 'freeze') {
      const expiresAt = new Date(Date.now() + item.duration * 1000).toISOString();
      await runQuery(
        'INSERT INTO active_effects (target_user_id, source_user_id, type, name, expires_at) VALUES (?, ?, ?, ?, ?)',
        [targetUser.id, userId, 'freeze', item.name, expiresAt]
      );

      await runQuery('DELETE FROM inventory WHERE id = ?', [inventoryId]);

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [userId, 'use_item', `Заморожен кубик игрока ${targetUser.tg_first_name || targetUser.tg_username} на 2 часа`, new Date().toISOString()]
      );

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [targetUser.id, 'effect_received', `Ваш кубик заморожен игроком ${sourceUser.tg_first_name || sourceUser.tg_username} на 2 часа`, new Date().toISOString()]
      );

      const targetMsg = `Вы были заморожены игроком ${sourceUser.tg_first_name || sourceUser.tg_username} на 2 часа!`;
      io.to(`user_${targetUser.id}`).emit('effect_notification', { message: targetMsg });

      await broadcastPlayersList();
      return res.json({ success: true, message: `Игрок ${targetUser.tg_first_name || targetUser.tg_username} успешно заморожен!` });
    }

    if (item.item_type === 'slowness') {
      const expiresAt = new Date(Date.now() + item.duration * 1000).toISOString();
      await runQuery(
        'INSERT INTO active_effects (target_user_id, source_user_id, type, name, expires_at) VALUES (?, ?, ?, ?, ?)',
        [targetUser.id, userId, 'slowness', item.name, expiresAt]
      );

      await runQuery('DELETE FROM inventory WHERE id = ?', [inventoryId]);

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [userId, 'use_item', `Наложен дебафф замедления на игрока ${targetUser.tg_first_name || targetUser.tg_username} на 4 часа`, new Date().toISOString()]
      );

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [targetUser.id, 'effect_received', `Ваш кубик замедлен игроком ${sourceUser.tg_first_name || sourceUser.tg_username} на 4 часа`, new Date().toISOString()]
      );

      const targetMsg = `Вы были замедлены игроком ${sourceUser.tg_first_name || sourceUser.tg_username} на 4 часа!`;
      io.to(`user_${targetUser.id}`).emit('effect_notification', { message: targetMsg });

      await broadcastPlayersList();
      return res.json({ success: true, message: `Игрок ${targetUser.tg_first_name || targetUser.tg_username} успешно замедлен!` });
    }

    if (item.item_type === 'pusher') {
      const oldCell = targetUser.current_cell;
      const newCell = Math.max(0, oldCell - 3);

      await runQuery('UPDATE users SET current_cell = ? WHERE id = ?', [newCell, targetUser.id]);
      await runQuery('DELETE FROM inventory WHERE id = ?', [inventoryId]);

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [userId, 'use_item', `Игрок ${targetUser.tg_first_name || targetUser.tg_username} отброшен на 3 ячейки назад`, new Date().toISOString()]
      );

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [targetUser.id, 'effect_received', `Вы были отброшены назад на 3 ячейки игроком ${sourceUser.tg_first_name || sourceUser.tg_username}`, new Date().toISOString()]
      );

      const targetMsg = `Игрок ${sourceUser.tg_first_name || sourceUser.tg_username} отбросил вас на 3 ячейки назад!`;
      io.to(`user_${targetUser.id}`).emit('effect_notification', { message: targetMsg });

      let path = [];
      for (let i = oldCell - 1; i >= newCell; i--) {
        path.push(i);
      }

      io.emit('player_move', {
        userId: targetUser.id,
        tg_username: targetUser.tg_username,
        roll: 0,
        path,
        startCell: oldCell,
        endCell: newCell,
        specialEffect: { type: 'backward', value: 3 },
        forced: true
      });

      if (onlineUsers.has(String(targetUser.id))) {
        onlineUsers.get(String(targetUser.id)).current_cell = newCell;
      }
      await broadcastPlayersList();

      return res.json({ success: true, message: `Игрок ${targetUser.tg_first_name || targetUser.tg_username} отброшен назад!` });
    }

    res.status(400).json({ error: 'Неизвестный тип предмета' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function checkAdmin(req, res, next) {
  const requesterUserId = req.method === 'GET' ? req.query.requesterUserId : req.body.requesterUserId;
  if (!requesterUserId) {
    return res.status(401).json({ error: 'Требуется идентификатор администратора' });
  }
  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [requesterUserId]);
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    const isOwner = (user.tg_username && user.tg_username.toLowerCase() === 'saitama01010');
    if (isOwner) {
      req.requester = user;
      return next();
    }
    if (!user.is_admin) {
      return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    req.requester = user;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.get('/api/admin/users', checkAdmin, async (req, res) => {
  try {
    const users = await allQuery('SELECT * FROM users ORDER BY balance DESC');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users/update', checkAdmin, async (req, res) => {
  const { userId, balance, currentCell, isAdmin, guildTaxRequired, guildTaxPaid } = req.body;
  try {
    const requester = req.requester;
    const isOwner = (requester.tg_username && requester.tg_username.toLowerCase() === 'saitama01010');

    const targetUser = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'Целевой игрок не найден' });
    }

    const targetIsOwner = (targetUser.tg_username && targetUser.tg_username.toLowerCase() === 'saitama01010');
    let finalIsAdmin = isAdmin;
    if (targetIsOwner) {
      finalIsAdmin = 1;
    }

    if (targetUser.is_admin !== finalIsAdmin) {
      if (!isOwner) {
        return res.status(403).json({ error: 'Только главный администратор @saitama01010 может выдавать или забирать права администратора!' });
      }
    }

    let nextRequired = parseInt(guildTaxRequired) || 0;
    let nextPaid = parseInt(guildTaxPaid) || 0;
    if (nextRequired > 0 && nextPaid >= nextRequired) {
      nextRequired = 0;
      nextPaid = 0;
    }

    await runQuery(
      'UPDATE users SET balance = ?, current_cell = ?, is_admin = ?, guild_tax_required = ?, guild_tax_paid = ? WHERE id = ?',
      [balance, currentCell, finalIsAdmin, nextRequired, nextPaid, userId]
    );

    if (onlineUsers.has(String(userId))) {
      const cached = onlineUsers.get(String(userId));
      cached.current_cell = currentCell;
    }
    await broadcastPlayersList();

    if (io) {
      io.to(`user_${userId}`).emit('balance_update', {
        balance: balance,
        guild_tax_required: nextRequired,
        guild_tax_paid: nextPaid
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/settings', checkAdmin, async (req, res) => {
  try {
    const settings = await allQuery('SELECT * FROM settings');
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/settings/update', checkAdmin, async (req, res) => {
  const { dice_cooldown, price_shield, price_freeze, price_pusher, price_cure, price_slowness, price_double_roll, price_remove_reward } = req.body;
  try {
    if (dice_cooldown !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('dice_cooldown', ?)", [String(dice_cooldown)]);
    }
    if (price_shield !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('price_shield', ?)", [String(price_shield)]);
    }
    if (price_freeze !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('price_freeze', ?)", [String(price_freeze)]);
    }
    if (price_pusher !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('price_pusher', ?)", [String(price_pusher)]);
    }
    if (price_cure !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('price_cure', ?)", [String(price_cure)]);
    }
    if (price_slowness !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('price_slowness', ?)", [String(price_slowness)]);
    }
    if (price_double_roll !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('price_double_roll', ?)", [String(price_double_roll)]);
    }
    if (price_remove_reward !== undefined) {
      await runQuery("INSERT OR REPLACE INTO settings (key, value) VALUES ('price_remove_reward', ?)", [String(price_remove_reward)]);
    }
    if (io) {
      io.emit('settings_update');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/cells/update', checkAdmin, async (req, res) => {
  const { cellNumber, type, value, rewardType, rewardName, rewardDetail } = req.body;
  try {
    await runQuery(
      'UPDATE cells SET type = ?, value = ?, reward_type = ?, reward_name = ?, reward_detail = ? WHERE cell_number = ?',
      [type, value, rewardType, rewardName, rewardDetail, cellNumber]
    );
    await broadcastCells();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/simulate-donation', async (req, res) => {
  const { remangaUserId, coinsToAdd } = req.body;
  if (!remangaUserId || !coinsToAdd) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const guildDir = 'eternal-watchers-5fdc5a3d';
  const timestamp = new Date().toISOString();

  try {
    const prevScan = await getQuery(
      'SELECT coins_spent FROM guild_scans WHERE guild_dir = ? AND remanga_user_id = ?',
      [guildDir, remangaUserId]
    );

    const oldCoins = prevScan ? prevScan.coins_spent : 1000;
    const newCoins = oldCoins + parseInt(coinsToAdd);

    await runQuery(
      'INSERT OR REPLACE INTO guild_scans (guild_dir, remanga_user_id, coins_spent, scanned_at) VALUES (?, ?, ?, ?)',
      [guildDir, remangaUserId, newCoins, timestamp]
    );

    const user = await getQuery('SELECT id, balance, guild_tax_required, guild_tax_paid FROM users WHERE remanga_user_id = ?', [remangaUserId]);
    let responseMsg = `Запись в guild_scans обновлена: было ${oldCoins}, стало ${newCoins} молний.`;

    if (user) {
      const diff = parseInt(coinsToAdd);
      const newBalance = user.balance + diff;
      let newPaid = user.guild_tax_paid || 0;
      let newRequired = user.guild_tax_required || 0;
      let taxMsg = '';

      if (newRequired > newPaid) {
        const remaining = newRequired - newPaid;
        const applied = Math.min(remaining, diff);
        newPaid += applied;
        
        taxMsg = ` (в счет налога внесено: ${applied} молний`;
        if (newPaid >= newRequired) {
          newRequired = 0;
          newPaid = 0;
          taxMsg += `, налог полностью оплачен!)`;
        } else {
          taxMsg += `, осталось внести: ${newRequired - newPaid} молний)`;
        }
      }

      await runQuery(
        'UPDATE users SET balance = ?, guild_tax_required = ?, guild_tax_paid = ? WHERE id = ?',
        [newBalance, newRequired, newPaid, user.id]
      );

      const detailText = `[Симуляция] Получено +${diff} монет за вклад в гильдию ${guildDir} (+${diff} молний)${taxMsg}`;

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [
          user.id,
          'donation',
          detailText,
          timestamp
        ]
      );

      if (io) {
        io.to(`user_${user.id}`).emit('balance_update', {
          balance: newBalance,
          guild_tax_required: newRequired,
          guild_tax_paid: newPaid,
          historyEntry: {
            action: 'donation',
            detail: detailText,
            timestamp
          }
        });
      }
      responseMsg += ` Пользователю ${user.id} начислен баланс.`;
    }

    res.json({ success: true, message: responseMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/admin/fetch-card', checkAdmin, async (req, res) => {
  const { cardUrl } = req.body;
  if (!cardUrl) {
    return res.status(400).json({ error: 'Missing cardUrl' });
  }

  const match = cardUrl.match(/cards?\/(\d+)/);
  if (!match) {
    return res.status(400).json({ error: 'Неверный формат ссылки на карту' });
  }

  const cardId = match[1];
  try {
    const apiRes = await fetch(`https://api.remanga.org/api/inventory/cards/${cardId}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://remanga.org/'
      }
    });

    if (!apiRes.ok) {
      return res.status(400).json({ error: 'Карта не найдена на Remanga' });
    }

    const data = await apiRes.json();
    const coverPath = data.cover?.mid || data.cover?.high || '';
    const fullCover = coverPath.startsWith('http') ? coverPath : `https://api.remanga.org${coverPath}`;
    
    res.json({
      id: data.id,
      title: data.title?.main_name || '',
      characterName: data.character?.name || '',
      cover: fullCover
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post('/api/board/claim-reward', async (req, res) => {
  const { userId, cellNumber, claim } = req.body;
  if (!userId || cellNumber === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(400).json({ error: 'Игрок не найден' });
    }

    if (user.current_cell !== cellNumber) {
      return res.status(400).json({ error: 'Вы находитесь на другой ячейке!' });
    }

    const cell = await getQuery('SELECT * FROM cells WHERE cell_number = ?', [cellNumber]);
    if (!cell) {
      return res.status(400).json({ error: 'Ячейка не найдена' });
    }

    if (cell.reward_type !== 'card' && cell.reward_type !== 'premium') {
      return res.status(400).json({ error: 'На этой ячейке нет ценной награды' });
    }

    if (cell.claimed_by_user_id !== null) {
      return res.status(400).json({ error: 'Эта награда уже забрана другим игроком!' });
    }

    if (claim) {
      const invCountRow = await getQuery(
        "SELECT COUNT(*) as count FROM inventory WHERE user_id = ? AND item_type IN ('remanga_card', 'premium_subscription')",
        [userId]
      );
      const count = invCountRow ? invCountRow.count : 0;
      if (count >= 10) {
        return res.status(400).json({ error: 'Ваш инвентарь наград заполнен! Максимум можно иметь 10 наград.' });
      }

      const itemType = cell.reward_type === 'card' ? 'remanga_card' : 'premium_subscription';
      await runQuery(
        'INSERT INTO inventory (user_id, item_type, name, description, duration, origin_cell_number) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, itemType, cell.reward_name, cell.reward_detail, 0, cellNumber]
      );

      const displayName = user.tg_first_name || user.tg_username || `Игрок ${user.id}`;
      await runQuery(
        'UPDATE cells SET claimed_by_user_id = ?, claimed_by_username = ? WHERE cell_number = ?',
        [userId, displayName, cellNumber]
      );

      await runQuery(
        'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
        [
          userId,
          'claim_reward',
          `Забрана награда с ячейки ${cellNumber}: ${cell.reward_name}`,
          new Date().toISOString()
        ]
      );

      await broadcastPlayersList();
      await broadcastCells();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/remove-reward', async (req, res) => {
  const { userId, itemId } = req.body;
  if (!userId || !itemId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const user = await getQuery('SELECT balance FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(400).json({ error: 'Игрок не найден' });
    }

    const item = await getQuery(
      "SELECT * FROM inventory WHERE id = ? AND user_id = ? AND item_type IN ('remanga_card', 'premium_subscription')",
      [itemId, userId]
    );
    if (!item) {
      return res.status(400).json({ error: 'Награда не найдена в вашем инвентаре' });
    }

    if (item.origin_cell_number === null) {
      return res.status(400).json({ error: 'Эта награда не связана с ячейкой карты' });
    }

    let removePrice = 100;
    const priceRow = await getQuery("SELECT value FROM settings WHERE key = 'price_remove_reward'");
    if (priceRow) {
      removePrice = parseInt(priceRow.value) || 100;
    }

    if (user.balance < removePrice) {
      return res.status(400).json({ error: `Недостаточно монет для удаления награды. Требуется: ${removePrice} монет.` });
    }

    const newBalance = user.balance - removePrice;
    await runQuery('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);

    await runQuery('DELETE FROM inventory WHERE id = ?', [itemId]);

    await runQuery(
      'UPDATE cells SET claimed_by_user_id = NULL, claimed_by_username = NULL WHERE cell_number = ?',
      [item.origin_cell_number]
    );

    await runQuery(
      'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
      [
        userId,
        'remove_reward',
        `Удалена награда: ${item.name} за ${removePrice} монет (возвращена на ячейку ${item.origin_cell_number})`,
        new Date().toISOString()
      ]
    );

    await broadcastPlayersList();
    await broadcastCells();

    if (io) {
      io.to(`user_${userId}`).emit('balance_update', {
        balance: newBalance
      });
    }

    res.json({ success: true, balance: newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

let lastPublishedUrl = '';
let cloudflaredUrl = '';
let cloudflaredProcess = null;

function startCloudflareTunnel() {
  if (cloudflaredProcess) {
    try {
      cloudflaredProcess.kill();
    } catch (e) {}
  }

  const logFile = path.resolve(process.cwd(), 'cloudflared.log');
  if (fs.existsSync(logFile)) {
    try {
      fs.unlinkSync(logFile);
    } catch (e) {}
  }

  cloudflaredProcess = spawn('cloudflared', ['tunnel', '--url', 'http://127.0.0.1:3000', '--logfile', logFile]);

  const interval = setInterval(() => {
    if (!fs.existsSync(logFile)) return;
    try {
      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes('trycloudflare.com')) {
          const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
          if (match) {
            cloudflaredUrl = match[0];
            clearInterval(interval);
            break;
          }
        }
      }
    } catch (e) {}
  }, 1000);

  cloudflaredProcess.on('close', () => {
    clearInterval(interval);
    cloudflaredUrl = '';
    setTimeout(startCloudflareTunnel, 5000);
  });
}

async function publishBackendUrl() {
  let backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    try {
      const res = await fetch('http://127.0.0.1:4040/api/tunnels');
      if (res.ok) {
        const data = await res.json();
        const tunnel = data.tunnels.find(t => t.proto === 'https');
        if (tunnel) {
          backendUrl = tunnel.public_url;
        }
      }
    } catch (e) {}
  }

  if (!backendUrl) {
    backendUrl = cloudflaredUrl;
  }

  if (backendUrl && backendUrl !== lastPublishedUrl) {
    try {
      const res = await fetch('https://extendsclass.com/api/json-storage/bin/ffaabaf', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ backendUrl: backendUrl })
      });
      const data = await res.json();
      if (data && data.status === 0) {
        lastPublishedUrl = backendUrl;
      }
    } catch (err) {}
  }
}

function startPublishingLoop() {
  startCloudflareTunnel();
  publishBackendUrl();
  setInterval(publishBackendUrl, 10000);
}

const PORT = 3000;
initDb().then(() => {
  server.listen(PORT, () => {
    startGuildScanner(io);
    startTelegramPolling();
    startPublishingLoop();
  });
}).catch(err => {
  process.exit(1);
});
