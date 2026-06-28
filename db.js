import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

export function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tg_id TEXT UNIQUE,
          tg_username TEXT,
          tg_first_name TEXT,
          remanga_user_id INTEGER UNIQUE,
          remanga_username TEXT,
          remanga_avatar TEXT,
          balance INTEGER DEFAULT 0,
          character_data TEXT,
          current_cell INTEGER DEFAULT 0,
          dice_cooldown_until TEXT,
          wins INTEGER DEFAULT 0,
          is_admin INTEGER DEFAULT 0,
          guild_tax_required INTEGER DEFAULT 0,
          guild_tax_paid INTEGER DEFAULT 0
        )
      `);

      db.run(`ALTER TABLE users ADD COLUMN guild_tax_required INTEGER DEFAULT 0`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN guild_tax_paid INTEGER DEFAULT 0`, () => {});

      db.run(`
        CREATE TABLE IF NOT EXISTS cells (
          cell_number INTEGER PRIMARY KEY,
          type TEXT DEFAULT 'normal',
          value INTEGER DEFAULT 0,
          reward_type TEXT DEFAULT 'none',
          reward_name TEXT DEFAULT '',
          reward_detail TEXT DEFAULT ''
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS guild_scans (
          guild_dir TEXT,
          remanga_user_id INTEGER,
          coins_spent INTEGER,
          scanned_at TEXT,
          PRIMARY KEY (guild_dir, remanga_user_id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          item_type TEXT,
          name TEXT,
          description TEXT,
          duration INTEGER,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS active_effects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          target_user_id INTEGER,
          source_user_id INTEGER,
          type TEXT,
          name TEXT,
          expires_at TEXT,
          FOREIGN KEY(target_user_id) REFERENCES users(id),
          FOREIGN KEY(source_user_id) REFERENCES users(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);

      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('dice_cooldown', '1800')`);
      db.run(`ALTER TABLE cells ADD COLUMN claimed_by_user_id INTEGER DEFAULT NULL`, () => {});
      db.run(`ALTER TABLE cells ADD COLUMN claimed_by_username TEXT DEFAULT NULL`, () => {});
      db.run(`ALTER TABLE inventory ADD COLUMN origin_cell_number INTEGER DEFAULT NULL`, () => {});
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('price_remove_reward', '100')`);

      db.run(`
        CREATE TABLE IF NOT EXISTS history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT,
          detail TEXT,
          timestamp TEXT,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) return reject(err);
        
        db.get("SELECT COUNT(*) as count FROM cells", (err, row) => {
          if (err) return reject(err);
          if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO cells (cell_number, type, value, reward_type, reward_name, reward_detail) VALUES (?, ?, ?, ?, ?, ?)");
            for (let i = 0; i < 300; i++) {
              let type = 'normal';
              let value = 0;
              let reward_type = 'none';
              let reward_name = '';
              let reward_detail = '';

              if (i > 0 && i < 299) {
                if (i % 17 === 0) {
                  type = 'forward';
                  value = 3 + (i % 5);
                } else if (i % 23 === 0) {
                  type = 'backward';
                  value = 2 + (i % 4);
                } else if (i % 29 === 0) {
                  type = 'obstacle';
                  value = 7200; 
                }

                if (i % 15 === 0) {
                  reward_type = 'currency';
                  reward_name = 'Валюта';
                  reward_detail = String(50 + (i % 10) * 10);
                } else if (i % 45 === 0) {
                  reward_type = 'card';
                  reward_name = 'Случайная карта';
                  reward_detail = 'Ранг B-A';
                } else if (i % 99 === 0) {
                  reward_type = 'premium';
                  reward_name = 'Подписка 1 месяц';
                  reward_detail = 'Remanga Premium';
                }
              }

              stmt.run(i, type, value, reward_type, reward_name, reward_detail);
            }
            stmt.finalize(() => {
              resolve();
            });
          } else {
            resolve();
          }
        });
      });
    });
  });
}

export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
