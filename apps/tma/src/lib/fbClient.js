// T4.1：火鸟 API 统一客户端。所有请求走 /tg-api/fb/:service/:action 白名单代理。
// - 统一处理火鸟 state != 100；写操作自动带 Idempotency-Key；鉴权层经注入的 request 接口化。
// - 不假设支付方式，订单/金额字段原样透传，便于后期接入 USDT 收银台。
export class FbError extends Error {
  constructor(code, message, state) {
    super(message);
    this.code = code;
    this.state = state;
  }
}

const newKey = () => {
  const c = globalThis.crypto;
  if (c && c.randomUUID) return c.randomUUID().replace(/-/g, '');
  return `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
};

// 火鸟「空数据」文案（多语言站点下仍以中文原文返回；只匹配空态语义，避免吞掉真实错误）
const EMPTY_RE = /暂无数据|没有数据|暂无内容|暂无信息/;

// authClient：{ request(path, init) → Response }，来自 createAuthClient；anonymous 为无需令牌的 fetch
export function createFbClient({ authClient, anonymousFetch, baseUrl = '/tg-api/fb', platform = 'tma' }) {
  function buildPath(service, action, params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params || {})) {
      if (v === undefined || v === null) continue;
      qs.append(k, String(v));
    }
    qs.set('platform_name', platform);
    return `/${service}/${action}?${qs.toString()}`;
  }

  async function unwrap(res) {
    if (res.status === 429) throw new FbError('RATE_LIMITED', 'Too many requests', 429);
    if (res.status === 403) throw new FbError('NOT_ALLOWED', 'Not allowed', 403);
    if (res.status === 409) throw new FbError('IN_PROGRESS', 'Request in progress', 409);
    let json;
    try { json = await res.json(); } catch (e) { throw new FbError('BAD_RESPONSE', 'Invalid response', res.status); }
    if (!res.ok) throw new FbError(json?.error?.code || 'HTTP_ERROR', json?.error?.message || `HTTP ${res.status}`, res.status);
    if (json.state !== 100) {
      // 火鸟列表接口惯例：空数据是 handler 返回 state=200 + "暂无数据"，网关 handlers::getHandle
      // 会把它归一成外层 state=101（与真实错误同状态码，只能靠文案区分）。
      // 空态返回 null，交由调用方的 Array.isArray / info?.list 兜底渲染 van-empty。
      const msg = typeof json.info === 'string' ? json.info : '';
      if ((json.state === 101 || json.state === 200) && EMPTY_RE.test(msg)) return null;
      throw new FbError('UPSTREAM_STATE', String(json.info || 'Request failed'), json.state);
    }
    return json.info;
  }

  // 读：anonymous=true 走匿名 fetch（浏览类接口），否则带令牌
  async function get(service, action, params, { anonymous = false } = {}) {
    const path = buildPath(service, action, params);
    const res = anonymous
      ? await anonymousFetch(`${baseUrl}${path}`)
      : await authClient.request(`${baseUrl.replace(/^\/tg-api/, '')}${path}`);
    return unwrap(res);
  }

  // 写：POST，x-www-form-urlencoded；幂等键可由调用方传入以支持重试复用
  async function post(service, action, body, { idempotencyKey } = {}) {
    const key = idempotencyKey || newKey();
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(body || {})) if (v !== undefined && v !== null) form.append(k, String(v));
    const res = await authClient.request(`${baseUrl.replace(/^\/tg-api/, '')}/${service}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': key },
      body: form.toString(),
    });
    return unwrap(res);
  }

  return { get, post, newKey };
}
