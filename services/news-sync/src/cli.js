/**
 * 单轮运行入口:stdin 读入 JSON 数组 [{title,url,summary}],
 * 发布到门户 NEWS_PORTAL_PUBLISH_URL,失败经 Telegram 告警运营者。
 */
const fs = require('node:fs');
const { runSync } = require('./sync');

const SEEN_FILE = process.env.NEWS_SYNC_SEEN_FILE || './news-seen.json';

function fileStore(file) {
  let set;
  try {
    set = new Set(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    set = new Set();
  }
  return {
    has: k => set.has(k),
    add: k => {
      set.add(k);
      fs.writeFileSync(file, JSON.stringify([...set]));
    }
  };
}

async function publish(item) {
  const res = await fetch(process.env.NEWS_PORTAL_PUBLISH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEWS_PORTAL_TOKEN || ''}`
    },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error(`portal HTTP ${res.status}`);
}

async function alert(text) {
  const res = await fetch(`https://api.telegram.org/bot${process.env.NEWS_ALERT_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.NEWS_ALERT_CHAT_ID, text })
  });
  if (!res.ok) throw new Error(`alert HTTP ${res.status}`);
}

async function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const stats = await runSync(Array.isArray(input) ? input : [], { seen: fileStore(SEEN_FILE), publish, alert });
  process.stdout.write(`${JSON.stringify(stats)}\n`);
  if (stats.failed) process.exitCode = 1;
}

main().catch(err => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
