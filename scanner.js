import fetch from 'node-fetch';
import { runQuery, getQuery, allQuery } from './db.js';

const GUILDS = [
  'eternal-watchers-5fdc5a3d',
  'eternal-keepers-of-knowledge-06969ad9',
  'eternalangelicguardianse-w-da9b9d1b'
];

let ioInstance = null;

export function setIoInstance(io) {
  ioInstance = io;
}

async function fetchAllMembers(guildDir) {
  let members = [];
  let url = `https://api.remanga.org/api/v2/clubs/${guildDir}/members/`;
  
  while (url) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Referer': 'https://remanga.org/'
        }
      });
      if (!res.ok) {
        break;
      }
      const data = await res.json();
      if (data && data.results) {
        members = members.concat(data.results);
      }
      url = data.next || null;
    } catch (err) {
      break;
    }
  }
  return members;
}

export async function runGuildScan() {
  const timestamp = new Date().toISOString();
  
  for (const guildDir of GUILDS) {
    const members = await fetchAllMembers(guildDir);
    if (members.length === 0) {
      continue;
    }

    for (const member of members) {
      const remUserId = member.user?.id;
      const coinsSpent = member.coins_spent || 0;
      
      if (!remUserId) continue;

      try {
        const prevScan = await getQuery(
          'SELECT coins_spent FROM guild_scans WHERE guild_dir = ? AND remanga_user_id = ?',
          [guildDir, remUserId]
        );

        if (prevScan) {
          const diff = coinsSpent - prevScan.coins_spent;
          if (diff > 0) {
            const user = await getQuery(
              'SELECT id, balance, guild_tax_required, guild_tax_paid FROM users WHERE remanga_user_id = ?',
              [remUserId]
            );

            if (user) {
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

              const detailText = `Получено +${diff} монет за вклад в гильдию ${guildDir} (${diff} молний)${taxMsg}`;

              await runQuery(
                'INSERT INTO history (user_id, action, detail, timestamp) VALUES (?, ?, ?, ?)',
                [
                  user.id,
                  'donation',
                  detailText,
                  timestamp
                ]
              );

              if (ioInstance) {
                ioInstance.to(`user_${user.id}`).emit('balance_update', {
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
            }
          }
        }

        await runQuery(
          'INSERT OR REPLACE INTO guild_scans (guild_dir, remanga_user_id, coins_spent, scanned_at) VALUES (?, ?, ?, ?)',
          [guildDir, remUserId, coinsSpent, timestamp]
        );
      } catch (err) {
        
      }
    }
  }
}

export function startGuildScanner(io) {
  setIoInstance(io);
  runGuildScan();
  setInterval(runGuildScan, 5 * 60 * 1000);
}
