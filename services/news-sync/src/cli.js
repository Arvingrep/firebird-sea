/**
 * 单轮运行入口:stdin 读入 JSON 数组 [{title,url,summary}],
 * 发布到门户 NEWS_PORTAL_PUBLISH_URL,失败经 Telegram 告警运营者。
 */
const fs = require('node:fs');
const { runSync } = require('./sync');
const { fileStore, makePublisher, makeAlerter } = require('./io');

async function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const env = process.env;
  const stats = await runSync(Array.isArray(input) ? input : [], {
    seen: fileStore(env.NEWS_SYNC_SEEN_FILE || './news-seen.json'),
    publish: makePublisher({ url: env.NEWS_PORTAL_PUBLISH_URL, token: env.NEWS_PORTAL_TOKEN }),
    alert: makeAlerter({ botToken: env.NEWS_ALERT_BOT_TOKEN, chatId: env.NEWS_ALERT_CHAT_ID })
  });
  process.stdout.write(`${JSON.stringify(stats)}\n`);
  if (stats.failed || stats.alertFailed) process.exitCode = 1;
}

main().catch(err => {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
});
