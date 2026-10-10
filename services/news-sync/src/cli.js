/**
 * 单轮运行入口:stdin 读入 JSON 数组 [{title,url,summary}],
 * 发布到门户 NEWS_PORTAL_PUBLISH_URL,失败经 Telegram 告警运营者。
 * 输入解析 / 去重文件初始化等整轮失败同样告警,并以非零码退出。
 */
const fs = require('node:fs');
const { runSync, withRetry } = require('./sync');
const { fileStore, makePublisher, makeAlerter } = require('./io');

async function main({ env = process.env, readInput = () => fs.readFileSync(0, 'utf8'), fetchImpl = fetch, retry } = {}) {
  const alert = makeAlerter({ botToken: env.NEWS_ALERT_BOT_TOKEN, chatId: env.NEWS_ALERT_CHAT_ID, fetchImpl });
  try {
    const input = JSON.parse(readInput());
    if (!Array.isArray(input)) throw new Error('input must be a JSON array of news items');
    return await runSync(input, {
      seen: fileStore(env.NEWS_SYNC_SEEN_FILE || './news-seen.json'),
      publish: makePublisher({ url: env.NEWS_PORTAL_PUBLISH_URL, token: env.NEWS_PORTAL_TOKEN, fetchImpl }),
      alert,
      retry
    });
  } catch (err) {
    try {
      await withRetry(() => alert(`[news-sync] 本轮失败: ${err.message}`), retry);
    } catch {
      // 告警本身失败:仍以原始错误抛出,顶层写 stderr 并非零退出
    }
    throw err;
  }
}

if (require.main === module) {
  main().then(
    stats => {
      process.stdout.write(`${JSON.stringify(stats)}\n`);
      if (stats.failed || stats.alertFailed) process.exitCode = 1;
    },
    err => {
      process.stderr.write(`${err.message}\n`);
      process.exit(1);
    }
  );
}

module.exports = { main };
