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

## 地址选择与购物车图片（2026-10-26 追加）

- **地址联想**：`Addresses.vue` 动态加载 Google Maps JS（`libraries=places`，`language=zh-CN&region=PH`），输入详细地址时给出联想候选，选中自动回填 `formatted_address` 与 `lat/lng`（上游 `operAddress` 白名单本来就收 `lat/lng`）。Key 经 `VITE_GOOGLE_MAPS_API_KEY` 构建期注入（CI secret `GOOGLE_MAPS_API_KEY` → `Dockerfile.api` ARG）；**key 缺失或脚本加载失败时静默降级为纯手输，不阻塞主流程**。CSP 已放行 `maps.googleapis.com` / `maps.gstatic.com`。
- **登录失效文案**：任何 catch 到含 "reopen" 的错误一律显示 `auth.reopen`（中英双语），不再裸抛英文串。
- **购物车缩略图**：上游 `waimai:food` 的 `pics[0]` 经 GCS `x-image-process` 缩到 160×160（`lib/cart.js` add 时裁剪查询参数后拼接），无图显示占位 emoji；`img-src https:` CSP 已允许。

## 部署链路配套（同批修复）

- `Dockerfile.api` 现在打包 `services/api/migrations/` 并在容器启动时先执行 `node src/migrate.js`（幂等：`fbs_migrations` 记账 + DDL `IF NOT EXISTS`）。**新环境缺表导致登录 502 的缺陷（2026-10-26 canary 实测）由此根治**。
- `server.js` 已挂 `express.urlencoded({extended:true})`——TMA 前端 `fbClient.post` 全部走表单编码，缺它则所有写接口 body 为空。

## QA 反馈整改（PR #147 第 1 轮，2026-10-26）

- **[blocker]** `Orders.vue` 孤立 `}` 语法错——**教训：`tsc --noEmit` 不检查 .vue 文件**，`.vue` 的语法错误只有 `npm run build`（vite/esbuild）能抓到。TMA 改动的本地验证必须三件套全跑：`tsc + npm test + npm run build`。
- **[minor]** Maps key 构建期注入前端包（浏览器端 key 本就公开可见），**必须在 Google Cloud Console 给该 key 加 HTTP referrer 限制（只允许 canary.fbird.men / fbird.men）并仅启用 Maps JavaScript API + Places API**，防止盗用计费。
- **[minor]** 用户联想选中后手动改写地址时清空 lat/lng；弹窗每次打开重建 Autocomplete 绑定。
- **[minor]** 迁移并发：`migrate.js` 为幂等设计（DDL `IF NOT EXISTS` + `fbs_migrations` 记账），多副本滚动时并发执行安全；如未来引入非幂等迁移，需加 DB 锁或改 Helm pre-install hook（当前权衡：启动自动迁移优于人工步骤）。

### 第 2 轮整改（QA 抓到假实现，2026-10-26）

- **[blocker] 地址联想是假实现**：`addrInput` ref 从未绑定模板，且 van-field 的 ref 是组件实例不是原生 input——联想从未生效。已改为**弹窗容器 ref + `@opened` 事件 + `querySelector` 取第 3 个原生 `<input>`**（van-popup 内容动画期间 `nextTick` 取不到，必须用 `@opened`）。
- **[major] 文档宣称的 CI 注入当时不存在**：Maps key 的 build-arg 在受保护路径上，拆出的 chore PR #148 **先于本 PR 合入 canary**，文档现已与事实一致。依赖顺序：#148（CI 注入）→ #147（消费 key）。
- **[minor]** `Dockerfile.api` 迁移失败改为退避重试 3 次（间隔 5s）才退出，避免 DB 瞬时抖动引发容器循环重启。
- **[minor]** 缩略图派生提为 `toThumb()`：仅接受 https 绝对地址，非法输入一律 null；新增 3 例单测（有图/无图/落车行），`<img @error>` 隐藏失败图。
- **验证盲区再确认**：`.vue` 语法只有 `npm run build` 能抓；假实现（ref 未绑定）只有真实渲染才暴露——门禁的语法检查覆盖不了这两类，QA 的对抗审查是必要层。
