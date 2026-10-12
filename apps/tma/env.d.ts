declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { start_param?: string; user?: { language_code?: string } };
  themeParams: Record<string, string | undefined>;
  colorScheme: 'light' | 'dark';
  ready(): void;
  expand(): void;
  onEvent(event: string, cb: () => void): void;
  openLink(url: string): void;
}
interface Window { Telegram?: { WebApp?: TelegramWebApp } }
