/**
 * 单轮运行入口:stdin 读入 JSON 数组 [{title,url,summary}],
 * 发布到门户 NEWS_PORTAL_PUBLISH_URL,失败经 Telegram 告警运营者。
 * 输入解析 / 去重文件初始化等整轮失败同样告警,并以非零码退出。
 */
const fs = require('node:fs');
const { runSync, withRetry } = require('./sync');
const { fileStore, makePublisher, makeAlerter } = require('./io');
const { makeCookiePublisher } = require('./portal');

/** 凭据齐备走门户 Cookie 登录适配(真实火鸟契约),否则回退 Bearer 契约 */
function pickPublisher(env, fetchImpl) {
  if (env.NEWS_PORTAL_USER && env.NEWS_PORTAL_PASS) {
    return makeCookiePublisher({
      baseUrl: new URL(env.NEWS_PORTAL_PUBLISH_URL).origin,
      user: env.NEWS_PORTAL_USER,
      pass: env.NEWS_PORTAL_PASS,
      cityid: env.NEWS_PORTAL_CITYID || 1,
      typeid: env.NEWS_PORTAL_TYPEID || 1,
      fetchImpl
    });
  }
  return makePublisher({ url: env.NEWS_PORTAL_PUBLISH_URL, token: env.NEWS_PORTAL_TOKEN, fetchImpl });
}

async function main({ env = process.env, readInput = () => fs.readFileSync(0, 'utf8'), fetchImpl = fetch, retry } = {}) {
  const alert = makeAlerter({ botToken: env.NEWS_ALERT_BOT_TOKEN, chatId: env.NEWS_ALERT_CHAT_ID, fetchImpl, apiBase: env.NEWS_ALERT_API_BASE || undefined });
  try {
    const input = JSON.parse(readInput());
    if (!Array.isArray(input)) throw new Error('input must be a JSON array of news items');
    const max = Number(env.NEWS_SYNC_MAX_PER_RUN);
    return await runSync(Number.isFinite(max) && max > 0 ? input.slice(0, max) : input, {
      seen: fileStore(env.NEWS_SYNC_SEEN_FILE || './news-seen.json'),
      publish: pickPublisher(env, fetchImpl),
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
