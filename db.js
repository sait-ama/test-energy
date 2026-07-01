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
      db.run(`ALTER TABLE users ADD COLUMN equipped_weapon TEXT DEFAULT NULL`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN equipped_costume TEXT DEFAULT NULL`, () => {});

      db.run(`
        CREATE TABLE IF NOT EXISTS equipment_inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          item_key TEXT,
          item_category TEXT,
          name TEXT,
          bonus_hp INTEGER DEFAULT 0,
          bonus_dmg INTEGER DEFAULT 0,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

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
      db.run(`ALTER TABLE users ADD COLUMN last_boss_attack_time TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN pending_boss_cell INTEGER DEFAULT NULL`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN pending_boss_remaining INTEGER DEFAULT 0`, () => {});
      db.run(`
        CREATE TABLE IF NOT EXISTS bosses (
          cell_number INTEGER PRIMARY KEY,
          name TEXT,
          hp INTEGER,
          max_hp INTEGER,
          dmg INTEGER,
          weakness TEXT,
          defeated INTEGER DEFAULT 0,
          defeated_by_username TEXT,
          current_fighter_id INTEGER DEFAULT NULL,
          current_fighter_username TEXT,
          current_fighter_hp INTEGER DEFAULT 0,
          reward_coins INTEGER DEFAULT 500,
          attack_cooldown_seconds INTEGER DEFAULT 300
        )
      `, () => {
        db.run(`ALTER TABLE bosses ADD COLUMN reward_type TEXT DEFAULT 'coins'`, () => {});
        db.run(`ALTER TABLE bosses ADD COLUMN reward_detail TEXT DEFAULT ''`, () => {});
        db.run(`ALTER TABLE bosses ADD COLUMN position_offset_x REAL DEFAULT 0`, () => {});
        db.run(`ALTER TABLE bosses ADD COLUMN position_offset_y REAL DEFAULT 0`, () => {});
        db.run(`ALTER TABLE bosses ADD COLUMN position_offset_z REAL DEFAULT 0`, () => {});
        db.run(`ALTER TABLE bosses ADD COLUMN custom_rotation REAL DEFAULT NULL`, () => {});
        db.run(`ALTER TABLE bosses ADD COLUMN custom_scale REAL DEFAULT 1.0`, () => {});
        db.run(`ALTER TABLE bosses ADD COLUMN model_file TEXT DEFAULT ''`, () => {
          db.run(`UPDATE bosses SET model_file = 'Duck.glb' WHERE cell_number = 30 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'aion_boss_rigged_character_3d_model.glb' WHERE cell_number = 60 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'caine_-_boss_form_tadc___hh.glb' WHERE cell_number = 90 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'frog_boss_from_dragon_land.glb' WHERE cell_number = 120 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'haishan_boss.glb' WHERE cell_number = 150 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'lowpoly_boss_with_huge_sword_spear.glb' WHERE cell_number = 180 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'metal_slug_-_boss_organic.glb' WHERE cell_number = 210 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'ps2_monster_house_boss.glb' WHERE cell_number = 240 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'slasher_castom_boss.glb' WHERE cell_number = 270 AND (model_file IS NULL OR model_file = '')`, () => {});
          db.run(`UPDATE bosses SET model_file = 'gold_sandworm.glb' WHERE cell_number = 299 AND (model_file IS NULL OR model_file = '')`, () => {});
        });
        db.get("SELECT COUNT(*) as count FROM bosses", (err, row) => {
          if (!err && row && row.count === 0) {
            const bossesData = [
              { cell: 30, name: "Телец", hp: 100, dmg: 10, weakness: "wind", reward: 500 },
              { cell: 60, name: "Близнецы", hp: 150, dmg: 15, weakness: "earth", reward: 600 },
              { cell: 90, name: "Рак", hp: 200, dmg: 20, weakness: "fire", reward: 700 },
              { cell: 120, name: "Лев", hp: 250, dmg: 25, weakness: "water", reward: 800 },
              { cell: 150, name: "Дева", hp: 300, dmg: 30, weakness: "wind", reward: 900 },
              { cell: 180, name: "Весы", hp: 350, dmg: 35, weakness: "earth", reward: 1000 },
              { cell: 210, name: "Скорпион", hp: 400, dmg: 40, weakness: "fire", reward: 1100 },
              { cell: 240, name: "Стрелец", hp: 450, dmg: 45, weakness: "water", reward: 1200 },
              { cell: 270, name: "Козерог", hp: 500, dmg: 50, weakness: "wind", reward: 1300 },
              { cell: 299, name: "Водолей", hp: 600, dmg: 60, weakness: "earth", reward: 1500 }
            ];
            const stmt = db.prepare("INSERT INTO bosses (cell_number, name, hp, max_hp, dmg, weakness, reward_coins) VALUES (?, ?, ?, ?, ?, ?, ?)");
            bossesData.forEach(b => {
              stmt.run(b.cell, b.name, b.hp, b.hp, b.dmg, b.weakness, b.reward);
            });
            stmt.finalize();
          }
        });
      });

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
        db.run(`UPDATE cells SET type = 'boss' WHERE cell_number IN (30, 60, 90, 120, 150, 180, 210, 240, 270, 299)`, () => {});
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
                if (i % 30 === 0) {
                  type = 'boss';
                } else if (i % 17 === 0) {
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
