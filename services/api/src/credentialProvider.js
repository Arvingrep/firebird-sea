'use strict';
// T3.2：为已登录会员向火鸟网关换取会话凭证（Cookie 头）。凭证只在服务端内存短暂缓存，不落盘、不写日志。
function createCredentialProvider({ gateway, cacheSeconds = 120, now = () => Date.now() }) {
  const cache = new Map(); // memberId -> { cookie, until }
  const inflight = new Map();

  return async function provide(memberId) {
    const t = now();
    const hit = cache.get(memberId);
    if (hit && hit.until > t) return hit.cookie;
    if (inflight.has(memberId)) return inflight.get(memberId);
    const p = (async () => {
      const res = await gateway.issueSession({ member_id: String(memberId) });
      const info = res && res.state === 100 && res.info;
      if (!info || !/^[A-Za-z0-9_]+$/.test(info.cookie_name || '') || !/^[A-Za-z0-9+/=]+$/.test(info.cookie_value || '')) {
        throw new Error('issue_session failed');
      }
      const ttl = Math.min(Number(info.ttl) || cacheSeconds, cacheSeconds);
      const cookie = `${info.cookie_name}=${info.cookie_value}`;
      cache.set(memberId, { cookie, until: now() + ttl * 1000 });
      if (cache.size > 2000) for (const [k, v] of cache) if (v.until <= now()) cache.delete(k);
      return cookie;
    })().finally(() => inflight.delete(memberId));
    inflight.set(memberId, p);
    return p;
  };
}

module.exports = { createCredentialProvider };
