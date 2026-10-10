const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { validateTelegramInitData } = require('../src/telegramAuth');

const BOT_TOKEN = 'test-bot-token-not-a-secret';

function sign(fields, token = BOT_TOKEN) {
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}

const nowSec = () => Math.floor(Date.now() / 1000);

test('合法签名通过并解析 user', () => {
  const user = JSON.stringify({ id: 42, first_name: 'A' });
  const r = validateTelegramInitData(sign({ auth_date: String(nowSec()), user }), BOT_TOKEN);
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.user.id, 42);
});

test('缺失 initData / hash 被拒绝', () => {
  assert.strictEqual(validateTelegramInitData('', BOT_TOKEN).valid, false);
  assert.strictEqual(validateTelegramInitData('auth_date=1', BOT_TOKEN).valid, false);
});

test('篡改字段或错误 Bot Token 被拒绝', () => {
  const good = sign({ auth_date: String(nowSec()), query_id: 'q1' });
  const tampered = good.replace('q1', 'q2');
  assert.strictEqual(validateTelegramInitData(tampered, BOT_TOKEN).valid, false);
  assert.strictEqual(validateTelegramInitData(good, 'other-token').valid, false);
});

test('超过 24 小时的 initData 视为过期', () => {
  const old = String(nowSec() - 86401);
  const r = validateTelegramInitData(sign({ auth_date: old }), BOT_TOKEN);
  assert.strictEqual(r.valid, false);
  assert.match(r.error, /expired/);
});
