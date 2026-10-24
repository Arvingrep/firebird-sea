# TMA UI 规范（2026-10 重构）

> 范围：`apps/tma/src`（Vue 3 + Vant 4）。本文档与代码同仓同改：动 UI 结构必须同步更新这里。

## 设计令牌（src/style.css）

- 品牌色 `--fbs-brand: #ff4e2a`（中式外卖红橙），暗色主题下**不反转品牌色**，仅提亮表面色。
- 表面三层：页面底 `--tg-bg`、卡片 `--fbs-card`（圆角 14px + 轻阴影）、描边 `--fbs-line`。
- Vant 通过 CSS 变量对齐（`--van-primary-color` 等），**不要在页面里写死颜色/圆角**，一律引用令牌。
- 明暗主题跟随 Telegram `colorScheme`（`telegram.ts: applyTheme` 挂 `.van-theme-dark`）。

## 图标：禁止使用 Vant 图标字体

线上 Telegram webview 出现过图标字体加载失败 → 所有图标显示为空心方块。
自 `594b37f0` 起 tabbar 图标全部为**内联 SVG**（`stroke: currentColor` 跟随激活色）。
新增图标同样走内联 SVG，不要用 `icon="xxx-o"` 字体属性。

## 「我的」个人中心

- 路由 `/profile`（`Profile.vue`），tabbar 第 5 项。
- 头像/昵称/用户名来自 `getTgUser()`（`telegram.ts`，`initDataUnsafe.user`，只读，不参与鉴权）。
- 非Telegram 环境显示「请从 Telegram 重新打开」。

## i18n

- 默认中文（`lib/i18n.js`）；新增任何 UI 文案必须**同时**补 `zh` 与 `en` 两组 key（两集合 key 数一致性由 `MESSAGE_KEYS`/`EN_KEYS` 消费方保证）。
- 日期格式化固定 `toLocaleDateString('zh-CN')`。

## 验证命令

```bash
cd apps/tma
npx tsc --noEmit   # 类型
npm test           # node --test，29 例
npm run build      # 产物
```
