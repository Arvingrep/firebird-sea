'use strict';
// T2.3：Telegram 用户 → 火鸟会员映射。映射只由服务端写入 fbs_member_map（AD-5/AD-8）。
// conn：带 query(sql) 的对象（见 migrate.cliConn）；gateway：{ memberFindOrCreate(params) }。

const isTgId = (v) => Number.isSafeInteger(v) && v > 0;
const sqlStr = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
const firstInt = (out) => {
  const n = parseInt(String(out || '').split('\n')[0].trim(), 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

function createMemberMap({ conn, gateway }) {
  async function lookup(tgId) {
    return firstInt(await conn.query(`SELECT member_id FROM fbs_member_map WHERE tg_user_id = '${tgId}' LIMIT 1`));
  }

  async function audit(tgId, action, target, detail = '') {
    await conn.query(
      `INSERT INTO fbs_audit (actor_role, actor_id, action, target, detail) VALUES ('customer', '${tgId}', ${sqlStr(action)}, ${sqlStr(target)}, ${sqlStr(detail)})`
    );
  }

  // 返回 { memberId, created }。幂等：网关按 tg_<id> 查找或创建，映射表唯一约束兜底并发。
  async function findOrCreate(tgId) {
    if (!isTgId(tgId)) throw new Error('invalid tg id');
    const existing = await lookup(tgId);
    if (existing) return { memberId: existing, created: false };

    const res = await gateway.memberFindOrCreate({ tg_id: String(tgId) });
    const memberId = res && res.state === 100 && res.info && Number(res.info.member_id);
    if (!Number.isSafeInteger(memberId) || memberId <= 0) throw new Error('gateway member_find_or_create failed');

    await conn.query(`INSERT IGNORE INTO fbs_member_map (tg_user_id, member_id) VALUES ('${tgId}', ${memberId})`);
    const resolved = (await lookup(tgId)) || memberId;
    const created = Boolean(res.info.created);
    await audit(tgId, created ? 'member_create' : 'member_map', `member:${resolved}`);
    return { memberId: resolved, created };
  }

  return { findOrCreate, audit, lookup };
}

module.exports = { createMemberMap, sqlStr };
