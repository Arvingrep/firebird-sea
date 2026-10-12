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
  const good = sign({ auth_date: String(nowSec()), query_id: 'q1', user: JSON.stringify({ id: 1 }) });
  const tampered = good.replace('q1', 'q2');
  assert.strictEqual(validateTelegramInitData(tampered, BOT_TOKEN).valid, false);
  assert.strictEqual(validateTelegramInitData(good, 'other-token').valid, false);
});

test('超过 1 小时的 initData 视为过期，1 小时内有效', () => {
  const user = JSON.stringify({ id: 7 });
  const old = String(nowSec() - 3601);
  const r = validateTelegramInitData(sign({ auth_date: old, user }), BOT_TOKEN);
  assert.strictEqual(r.valid, false);
  assert.match(r.error, /expired/);
  const fresh = String(nowSec() - 3000);
  assert.strictEqual(validateTelegramInitData(sign({ auth_date: fresh, user }), BOT_TOKEN).valid, true);
});

test('缺失 auth_date 或 user.id 被拒绝', () => {
  const user = JSON.stringify({ id: 7 });
  assert.strictEqual(validateTelegramInitData(sign({ user }), BOT_TOKEN).valid, false);
  assert.strictEqual(validateTelegramInitData(sign({ auth_date: String(nowSec()) }), BOT_TOKEN).valid, false);
  const badUser = JSON.stringify({ id: 'abc' });
  assert.strictEqual(validateTelegramInitData(sign({ auth_date: String(nowSec()), user: badUser }), BOT_TOKEN).valid, false);
});

test('未来的 auth_date 被拒绝', () => {
  const user = JSON.stringify({ id: 7 });
  const r = validateTelegramInitData(sign({ auth_date: String(nowSec() + 3600), user }), BOT_TOKEN);
  assert.strictEqual(r.valid, false);
});

test('signature 字段参与 HMAC 数据串：带 signature 的合法 initData 通过，篡改 signature 失败', () => {
  const user = JSON.stringify({ id: 7 });
  const fields = { auth_date: String(nowSec()), user, signature: 'AAAA-opaque-signature-value' };
  const good = sign(fields);
  assert.strictEqual(validateTelegramInitData(good, BOT_TOKEN).valid, true);
  const tampered = good.replace('AAAA-opaque-signature-value', 'BBBB-opaque-signature-value');
  assert.strictEqual(validateTelegramInitData(tampered, BOT_TOKEN).valid, false);
});

test('hash 格式非法被拒绝（非 64 位十六进制）', () => {
  const user = JSON.stringify({ id: 7 });
  const q = new URLSearchParams({ auth_date: String(nowSec()), user, hash: 'zz' }).toString();
  assert.strictEqual(validateTelegramInitData(q, BOT_TOKEN).valid, false);
});
