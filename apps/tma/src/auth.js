// T2.4：TMA 登录流。令牌只存内存（不写 localStorage、不进 URL）；401 时用 initData 自动换发并重放一次。
// 与框架无关：fetch 与 getInitData 由调用方注入（生产：window.fetch、Telegram.WebApp.initData）。
export function createAuthClient({ fetch, getInitData, baseUrl = '/tg-api' }) {
  let token = null;
  let loginInFlight = null;

  async function login() {
    // 并发请求共享同一次登录，避免重复换发触发服务端重放限制
    if (loginInFlight) return loginInFlight;
    loginInFlight = (async () => {
      const initData = getInitData();
      if (!initData) throw new AuthError('INIT_DATA_MISSING', 'Please reopen the Mini App from Telegram');
      const res = await fetch(`${baseUrl}/auth/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });
      if (res.status === 401) throw new AuthError('INIT_DATA_EXPIRED', 'Please reopen the Mini App');
      const json = await res.json();
      if (!res.ok || !json.success) throw new AuthError(json?.error?.code || 'LOGIN_FAILED', json?.error?.message || 'Login failed');
      token = json.data.token;
      return json.data;
    })().finally(() => { loginInFlight = null; });
    return loginInFlight;
  }

  async function request(path, init = {}, retried = false) {
    if (!token) await login();
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 && !retried) {
      token = null;
      await login();
      return request(path, init, true);
    }
    return res;
  }

  return { login, request, hasToken: () => token !== null };
}

export class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
