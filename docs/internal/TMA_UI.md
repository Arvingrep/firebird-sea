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

### 第 3 轮整改（2026-10-26）

- **[major]** `.pac-container`（联想下拉）默认 z-index 1000 < van-popup 2000+，会被弹窗盖住——已加全局 `.pac-container{z-index:3000!important}`。（QA 自评"凭了解判断、未渲染验证"——本轮实测间接证实：Vant 默认 z-index 确实 2000+，规则为防御性修复，真机待用户验收。）
- **[minor]** 坐标一致性监听改为弹窗 `@opened` 时**无条件挂载**，不再依赖 Maps 脚本加载成功。
- **[minor]** 重建 Autocomplete 前 `clearInstanceListeners` + 移除残留 `.pac-container` DOM，防多次开关累积。
- **[minor·实测裁决]** `x-image-process` 参数当前被 GCS 忽略：`w_4096` / `w_160` / 不带参数三种请求字节数**完全一致**（874KB 原图）。上游 pics 自带该参数说明处理代理在规划中——缩略参数保留（代理接入即生效），现状由 56px 显示尺寸 + `loading=lazy` + `@error` 兜底，文档不再声称"GCS 支持"。

### 第 4 轮（接口实测发现，2026-10-26）

- 上游 `waimai.class.php:2109` **强制要求 lng/lat**（「请选择地图坐标！」）——地址不带坐标根本存不进去。这就是地址必须做地图选点的根本原因（老 touch 版同为地图选点）。前端保存前校验坐标，缺失时引导用户点选联想候选；无 key 降级场景给出明确提示。签名 initData 实测：无坐标保存被上游拒 → 与前端新校验行为闭环。

### 站点配置层（PR #151，2026-10-26）

- 上游保存地址前的 Geocoding 反查分站用 `$cfg_map_google`（`webroot/include/config/siteConfig.inc.php`）——原为空串导致保存回「You must use an API key」。现改 `getenv('GOOGLE_MAPS_API_KEY')`，经 `_helpers.tpl` 公共 env 注入（secret `firebird-storage-secret/google-maps-api-key`，optional：未配置时维持空串、行为同前）。
- **⚠️ FPM getenv() 陷阱（PR #152 后实测发现并修复，PR #153 entrypoint 注入兜底）**：Deployment env / secret / 镜像内文件全部正确、`clear_env = no` 已配，但线上仍报缺 key。容器内探针（经 nginx→fpm 真实链路）证实：`$_SERVER['GOOGLE_MAPS_API_KEY']` 有值，而 `getenv('GOOGLE_MAPS_API_KEY')` 为空——**FPM SAPI 下 `getenv()` 只查 FastCGI 请求参数表，不读进程 environ**（`clear_env=no` 保留的进程变量只进 `$_SERVER`）。修复：`entrypoint-web.sh` 启动时用 sed 把 env 值直接写入 `siteConfig.inc.php` 的 `$cfg_map_google`（与 GCS_KEY/RESEND_KEY 同模式），不再依赖 PHP getenv。教训：容器内 `kubectl exec env` 验证 ≠ FPM worker 视角，env 注入类修复必须经真实 web 请求探针终验。
- **额外发现的空 secret**：`firebird-storage-secret` 的 `google-maps-api-key` 曾被 patch 成空值（PR #152 后容器 env_len=0 的真因），已从老站配置缓存取回站点 key 重新注入；线上 DB siteConfig 的 `map_key`/`map_server_key` 均为空，站点 Google key 目前只靠该 secret 供给。
- **🔒 当前唯一阻塞：Google Billing（owner 操作）**：key 注入链路已全通，保存地址时 Geocoding 真实发出，Google 回「You must enable Billing on the Google Cloud Project」。上游 `operAddress` 强制 geocoding（失败直接拒绝保存），无绕过参数。需在 Google Cloud Console 为该项目开启结算（Geocoding 有免费月额度，开结算不等于必付费），或换用已开结算项目的 key。
- **Geocoding 用的是服务端 key，与前端联想 key 可为同一个**，但 Google 侧限制策略不同：前端 key 加 HTTP referrer 限制，服务端 key 加 IP 限制（GKE 出口 NAT IP）并仅启用 Geocoding API。

### 视觉升级二轮：参照老 H5（touch/skin2）设计语言（2026-10-26）

用户反馈 TMA 页面「太简单很丑」，要求参照老 H5 外卖模板。提取 touch/skin2 的设计要点并移植（保持 TG 暗色适配）：

- **品牌渐变 CTA**：主按钮统一样式（135° 红橙渐变 + 投影）；价格/金额新增 `--fbs-price` 红色强调令牌（暗色提亮一档）。
- **首页**：新增品牌渐变 hero 横幅（饿了就点 / 美食外卖·檀香山 / 华人商家·准时送达）；商家卡升级——92px 大图、品类 chip + 营业状态徽标、起送/配送费红色强调、右侧「进店」箭头。
- **购物车**：卡片头部（标题 + 件数），价格大号红字，合计行浅底强调。
- **订单**：状态改为圆角 chip（进行中品牌色/完成绿/取消灰），金额红色加粗。
- **地址卡**：左侧 📍 图标底座 + 默认地址描边标签。
- **i18n**：`t()` 支持 `{n}` 插值；新增 home.hero*、cart.countN、address.defaultTag（中英）。
- 纯展示层改动，数据接口不变；三件套验证通过（tsc/32 单测/build）。
