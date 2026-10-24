// Telegram WebApp 适配：ready/expand、主题（含暗色）、initData 与 start_param。
// 非 Telegram 环境（浏览器直接打开）下返回空 initData，登录流会提示重新从 Telegram 打开。
const tg = () => window.Telegram?.WebApp;

export function initTelegram(): void {
  const app = tg();
  if (!app) return;
  app.ready();
  app.expand();
  applyTheme();
  app.onEvent('themeChanged', applyTheme);
}

export function applyTheme(): void {
  const app = tg();
  const root = document.documentElement;
  const p = app?.themeParams || {};
  const set = (name: string, v?: string) => { if (v) root.style.setProperty(name, v); };
  set('--tg-bg', p.bg_color);
  set('--tg-text', p.text_color);
  set('--tg-hint', p.hint_color);
  set('--tg-button', p.button_color);
  set('--tg-button-text', p.button_text_color);
  set('--tg-secondary-bg', p.secondary_bg_color);
  root.classList.toggle('van-theme-dark', app?.colorScheme === 'dark');
}

export const getInitData = (): string => tg()?.initData || '';
export const getStartParam = (): string | undefined => tg()?.initDataUnsafe?.start_param;
// 个人中心展示用：头像/昵称来自 Telegram 用户资料（只读，不参与鉴权）
export const getTgUser = (): { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string } | undefined =>
  tg()?.initDataUnsafe?.user as never;
export const openExternal = (url: string): void => {
  const app = tg();
  if (app) app.openLink(url);
  else window.open(url, '_blank', 'noopener');
};
