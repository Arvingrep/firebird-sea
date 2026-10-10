/**
 * 火鸟门户 Cookie 发布适配:登录(loginCheck) -> PHPSESSID -> 发布(article/put)。
 * 契约同源于 webroot:登录成功 {state:100};put 成功返回 {aid,...}(无 state)或 {state:100};
 * 未登录/过期 state:200|101 + "登录超时",或直接返回 HTML 登录页 -> 自动重新登录一次。
 * 凭据只经参数传入(调用方从 env 文件读),本模块不打印任何凭据/Cookie 值。
 */
const TIMEOUT_MS = 15000;

const EXPIRED_RE = /登录超时|登陆超时|重新登录|重新登陆/;

function parseSessionCookie(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get && res.headers.get('set-cookie')].filter(Boolean);
  const pairs = raw.map(c => String(c).split(';')[0].trim()).filter(c => c.startsWith('PHPSESSID='));
  return pairs.length ? pairs[pairs.length - 1] : null;
}

/** 响应归类:ok(带 aid)/ authExpired / error(message) */
function classifyPutResponse(body, text) {
  if (!body) {
    return /<html|<form|<!doctype/i.test(String(text)) ? { authExpired: true } : { error: 'portal returned non-JSON body' };
  }
  const aid = Number(body.aid);
  if (body.state === 100 || Number.isFinite(aid)) return { ok: true, aid: Number.isFinite(aid) ? aid : undefined };
  if ((body.state === 101 || body.state === 200) && EXPIRED_RE.test(String(body.info || ''))) return { authExpired: true };
  return { error: `portal rejected: state=${body.state} ${String(body.info || '').slice(0, 120)}` };
}

function makeCookiePublisher({ baseUrl, user, pass, cityid, typeid, fetchImpl = fetch, timeoutMs = TIMEOUT_MS }) {
  if (!baseUrl || !user || !pass) throw new Error('portal cookie publisher: baseUrl/user/pass required');
  let cookie = null;

  async function post(pathAndQuery, form, withCookie) {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (withCookie && cookie) headers.Cookie = cookie;
    const res = await fetchImpl(new URL(pathAndQuery, baseUrl).toString(), {
      method: 'POST',
      signal: AbortSignal.timeout(timeoutMs),
      headers,
      body: new URLSearchParams(form).toString()
    });
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      /* 非 JSON(如 HTML 登录页)由调用方归类 */
    }
    return { res, body, text };
  }

  async function login() {
    const { res, body } = await post('/include/ajax.php?service=member&action=loginCheck', {
      username: user, password: pass, platform: 'app'
    });
    if (!res.ok) throw new Error(`portal login HTTP ${res.status}`);
    if (!body || body.state !== 100) throw new Error(`portal login rejected: state=${body && body.state}`);
    const c = parseSessionCookie(res);
    if (!c) throw new Error('portal login: no session cookie in response');
    cookie = c;
  }

  async function putOnce(item, key) {
    const summary = item.summary || item.title;
    const { res, body, text } = await post('/include/ajax.php?service=article&action=put', {
      cityid, typeid, mold: 0, title: item.title,
      body: `<p>${summary}</p><p>来源:<a href="${item.url}">${item.url}</a></p><!-- dedupe:${key} -->`,
      sourceurl: item.url
    }, true);
    if (!res.ok) throw new Error(`portal HTTP ${res.status}`);
    return classifyPutResponse(body, text);
  }

  async function call(fn) {
    if (!cookie) await login();
    let r = await fn();
    if (r.authExpired) {
      cookie = null;
      await login(); // 重登仍失败则此处抛错,由上层按失败告警
      r = await fn();
      if (r.authExpired) throw new Error('portal session expired after re-login');
    }
    if (r.error) throw new Error(r.error);
    return r;
  }

  const publish = async (item, key) => (await call(() => putOnce(item, key))).aid;
  publish.login = login;
  /** 下架(门户软删,仅作者本人):复验清理用 */
  publish.remove = async id =>
    call(async () => {
      const { res, body, text } = await post('/include/ajax.php?service=article&action=del', { id }, true);
      if (!res.ok) throw new Error(`portal HTTP ${res.status}`);
      if (body && body.state === 100) return { ok: true };
      return classifyPutResponse(body, text);
    });
  return publish;
}

module.exports = { makeCookiePublisher, classifyPutResponse, parseSessionCookie };
