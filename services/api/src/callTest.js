// Call test 语音呼叫：失败/超时自动原生重试（最多 2 次，间隔硬编码 3s），零依赖
const RETRY_MAX = 2;
const RETRY_DELAY_MS = 3000;
const TIMEOUT_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function attemptCall(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`Call test upstream [${res.status}]`);
}

// 任一次成功即通过；全部失败记录终态异常日志并返回 passed=false
async function runCallTest(url, payload = {}, { delayMs = RETRY_DELAY_MS, logger = console } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= RETRY_MAX + 1; attempt++) {
    try {
      await attemptCall(url, payload);
      return { passed: true, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt <= RETRY_MAX) await sleep(delayMs);
    }
  }
  const attempts = RETRY_MAX + 1;
  logger.error(`[call-test] FINAL FAILURE after ${attempts} attempts: ${lastError.message}`);
  return { passed: false, attempts, error: lastError.message };
}

module.exports = { runCallTest, RETRY_MAX, RETRY_DELAY_MS };
