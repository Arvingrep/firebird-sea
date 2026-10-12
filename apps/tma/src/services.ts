import { createAuthClient } from './auth.js';
import { createFbClient } from './lib/fbClient.js';
import { createI18n } from './lib/i18n.js';
import { getInitData } from './telegram';

// 组合根：令牌只在 authClient 闭包内（内存），fbClient 在其上封装火鸟 API。
export const authClient = createAuthClient({ fetch: (...a: Parameters<typeof fetch>) => fetch(...a), getInitData });
export const fb = createFbClient({
  authClient,
  anonymousFetch: (url: string) => fetch(url, { headers: { Accept: 'application/json' } }),
});
export const i18n = createI18n('zh');
