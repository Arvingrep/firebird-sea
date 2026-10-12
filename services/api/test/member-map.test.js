const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { createMemberMap } = require('../src/memberMap');

// 伪 conn：模拟 fbs_member_map（tg_user_id 主键 + member_id 唯一）与 fbs_audit
function fakeConn() {
  const map = new Map();
  const audit = [];
  return {
    map, audit,
    async query(sql) {
      let m;
      if ((m = /SELECT member_id FROM fbs_member_map WHERE tg_user_id = '(\d+)'/.exec(sql))) {
        return map.has(m[1]) ? `${map.get(m[1])}\n` : '';
      }
      if ((m = /INSERT IGNORE INTO fbs_member_map \(tg_user_id, member_id\) VALUES \('(\d+)', (\d+)\)/.exec(sql))) {
        const used = [...map.values()].includes(Number(m[2]));
        if (!map.has(m[1]) && !used) map.set(m[1], Number(m[2]));
        return '';
      }
      if (/INSERT INTO fbs_audit/.test(sql)) { audit.push(sql); return ''; }
      throw new Error(`unexpected sql: ${sql}`);
    },
  };
}

test('首次登录创建会员并写映射与审计', async () => {
  const conn = fakeConn();
  let calls = 0;
  const gateway = { async memberFindOrCreate(p) { calls += 1; assert.strictEqual(p.tg_id, '42'); return { state: 100, info: { member_id: 9, created: true } }; } };
  const mm = createMemberMap({ conn, gateway });
  const r = await mm.findOrCreate(42);
  assert.deepStrictEqual(r, { memberId: 9, created: true });
  assert.strictEqual(conn.map.get('42'), 9);
  assert.strictEqual(calls, 1);
  assert.ok(conn.audit.some((s) => s.includes('member_create')));
});

test('已有映射再次登录不调用网关、不创建第二个会员', async () => {
  const conn = fakeConn();
  conn.map.set('42', 9);
  const gateway = { async memberFindOrCreate() { throw new Error('should not be called'); } };
  const r = await createMemberMap({ conn, gateway }).findOrCreate(42);
  assert.deepStrictEqual(r, { memberId: 9, created: false });
});

test('并发重复登录：唯一约束兜底，只产生一条映射且返回同一会员', async () => {
  const conn = fakeConn();
  const gateway = { async memberFindOrCreate() { return { state: 100, info: { member_id: 9, created: true } }; } };
  const mm = createMemberMap({ conn, gateway });
  const [a, b] = await Promise.all([mm.findOrCreate(42), mm.findOrCreate(42)]);
  assert.strictEqual(a.memberId, 9);
  assert.strictEqual(b.memberId, 9);
  assert.strictEqual(conn.map.size, 1);
});

test('网关失败或返回非法数据时抛错且不写映射', async () => {
  const conn = fakeConn();
  const bad = { async memberFindOrCreate() { return { state: 500, info: 'create failed' }; } };
  await assert.rejects(() => createMemberMap({ conn, gateway: bad }).findOrCreate(42));
  assert.strictEqual(conn.map.size, 0);
});

test('非法 tg id 被拒绝（防 SQL 拼接）', async () => {
  const mm = createMemberMap({ conn: fakeConn(), gateway: {} });
  for (const bad of ["1' OR '1'='1", -1, 0, 1.5, NaN, null, undefined]) {
    await assert.rejects(() => mm.findOrCreate(bad));
  }
});

test('PHP 网关：先验签再加载火鸟、仅动作白名单、不改核心', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../../webroot/api/fbs/index.php'), 'utf8');
  assert.ok(src.indexOf('hash_equals') < src.indexOf("require_once dirname(__FILE__) . '/../../include/common.inc.php'"));
  assert.match(src, /hash_hmac\('sha256'/);
  assert.match(src, /abs\(time\(\) - \(int\)\$ts\) > \$window/);
  assert.match(src, /\$window = \(\$action === 'issue_session'\) \? 15 : 60;/);
  assert.match(src, /\$action !== 'member_find_or_create' && \$action !== 'issue_session'/);
  assert.match(src, /preg_match\('\/\^\[1-9\]\[0-9\]\{0,18\}\$\/', \$tgId\)/);
  assert.doesNotMatch(src, /\$_(GET|POST|REQUEST)\['(nickname|username|password)'\]/);
});
