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

### 地址保存失败的真实根因：接口直连缺默认分站（2026-10-26 修）

Google key 打通后保存地址仍回「保存失败！」，从 PHP 的 SQL 错误日志（`log/errorsql/<date>.log`）抓到铁证：

```
INSERT INTO `huoniao_waimai_address` (...) VALUES ('7', '', 'E2E验证', ...)
MSG: SQLSTATE[HY000]: General error: 1366 Incorrect integer value: '' for column 'cityid'
```

- **成因**：`waimai::operAddress` 在 Geocoding 反查不到分站时会兜底 `$siteCityInfo['cityid']`；而 `$siteCityInfo` 只在 `index.php`（网页入口）里赋值，`include/ajax.php` 仅当带 `siteCityInfo` cookie 或 `cityid` 参数时才解析。TMA/App 直连接口两者都没有 → `$siteCityInfo` 为空 → `cityid` 写成空串 → 严格模式 MySQL 直接 1366 报错。
- **修复**：`include/ajax.php` 在原有解析后补默认分站兜底（`empty($siteCityInfo)` 时 `checkDefaultCity()`，按需 include `siteConfig.class.php`）。行为等价网页端首次访问落到默认分站；不改动任何业务 SQL。
- **验证**：签名 initData 端到端 —— 登录 200 → 保存地址 200（`cityid=10000` 马尼拉）→ 回读命中 → 删除成功，PASS。
- **排障方法沉淀**：接口返回「保存失败！」这类笼统文案时，先读 `log/errorsql/<date>.log`（dsql 会把失败 SQL + PDO 错误 + 调用栈全部落盘），比逐层猜参数快一个数量级。

### Google Maps key 换到自控项目（2026-10-26）

- 原 key 继承自老站配置缓存，所属 GCP 项目不可控且未开结算 → `REQUEST_DENIED: You must enable Billing`。
- 现统一改到自有项目 `fh580-70533`（已开结算「随用随付」），用 gcloud 启用 API 并新建受限 key：
  - 启用：`geocoding-backend.googleapis.com`、`maps-backend.googleapis.com`（Maps JavaScript API）；`places-backend.googleapis.com` 原已启用。
  - key：`firebird-tma-maps`，仅允许上述三个 API（无 referrer/IP 限制）；同时写入 k8s secret `firebird-storage-secret/google-maps-api-key` 与 GitHub secret `GOOGLE_MAPS_API_KEY`。
  - 失效/轮换：`gcloud services api-keys list --project fh580-70533` 找到 key → 新建并重复上面两步写入即可；前端 key 是构建期注入，必须重新构建镜像。

### 地址表单重做：收货人 = Telegram 身份 + 补充项 + 分享链接（2026-10-26）

用户反馈「为什么要写联系人、写电话？联系人就是 Telegram 的，通话就用 Telegram 通话」，并指出地址缺补充项、需要分享链接。重做要点：

**1. 不再让用户手填联系人**
- 收货人取自 `Telegram.WebApp.initDataUnsafe.user`（`getTgUser()`），表单里以只读身份卡展示（头像 + 昵称 + `@username` + 「通过 Telegram 联系」）。
- 上游 `waimai::operAddress` 仍强制 `person` 非空，值由 TG 资料自动生成（`first_name last_name`），不再要求用户输入。

**2. 电话默认走 Telegram**
- 未填手机号时 `tel` 写入 `@username`（表字段 varchar(100)，足够）；没有 username 时退化为 `tg:<tg_id>`。
- 保留「备用手机号（可选）」——骑手/商家需要直接拨打时使用，填写才校验格式；不填也能保存。
- 地址卡按 tel 形态展示：纯数字显示 📞，Telegram 标识显示 💬 通过 Telegram 联系。

**3. 地址补充项（上游表无独立字段，用既有两字段分层承载）**
- `street` = 主地址（Google 联想结果）；`address` = `主地址，门牌/楼层/单元；给骑手的说明`。
- 编辑时按「address 是否以 street 开头」反解补充项（`splitExtra`），回填到输入框，避免二次编辑出现重复文本。
- 上游下单读取两字段时均能拿到可读地址（street 是主地址，address 是完整地址）。

**4. areaCode 修正**
- 上游 `areaCode` 缺省写死 86（中国）。TMA 原先未传 → 全部地址区号被记为 86。现按本站实际地区传 `1`（美国）。

**5. 分享地址（代下单）**
- 新表 `fbs_addr_share`（migration `003_addr_share.sql`）：`token CHAR(32) PK / uid / payload(JSON 快照) / created_at / expires_at`，7 天过期，过期即不可读。
- `POST /tg-api/addr/share`（需 Bearer 令牌）：客户端上传**位置**（`street`/`address`/`lat`/`lng`/`areaCode`，**不含姓名与电话**）→ 返回 `{ token, url }`；`url = https://t.me/<bot>?startapp=addr_<token>`，bot 用户名由服务端调 `getMe` 缓存获取（未就绪时 `url=null`，前端降级为纯文本分享）。
  - 限流：`TMA_SHARE_MAX`，默认 **10 次/分**（按 IP，`createLimiter`）。
  - 每个会员最多保留 **20 条**有效分享（新分享写入后按 `created_at DESC, token DESC` 裁掉更早的），避免公开接口长期堆积个人信息。
  - 过期清理按进程节流 `PURGE_INTERVAL_SECONDS = 600`（每 10 分钟一次），失败不阻断创建——避免每次分享多起一个 mariadb 子进程。
- `GET /tg-api/addr/shared/:token`（公开，凭 token）：仅返回位置快照，不含 uid；token 非法格式直接 404 且不触库。
  - 限流：`TMA_SHARE_READ_MAX`，默认 **60 次/分**（按 IP）。
  - **隐私取舍**：分享只传「位置」，收货人与联系电话由**接收方用自己的 Telegram 身份**生成（不采信分享方上传的内容）；token 为 32 位随机 hex（不可枚举）、7 天过期、单会员 20 条上限。若后续要更严，可改为「首次领取后失效」。
- **深链路由（QA 第 2 轮 major）**：`startapp` 参数必须进 `apps/tma/src/lib/startParam.js` 白名单才会被路由。曾因只认 `shop_<id>` 导致接收方落在首页、地址页根本没挂载，分享整条链路失效。现白名单含 `^addr_([0-9a-f]{32})$` → `{ name: 'addresses', query: { share: <token> } }`，地址页优先读 `route.query.share`，`start_param` 仅作兜底（直接落在本页时）。
- 接收方确认后调 `operAddress` 存为自己的地址（同一条链接只询问一次，`sessionStorage` 去重）。
- **前置条件**：bot 需在 BotFather 配置 Main Mini App，`t.me/<bot>?startapp=` 才能直接拉起小程序；否则链接只会打开 bot 聊天（此时仍可把地址文本发给对方手工录入）。当前 bot：`@fbird_men_bot`。
- **⚠️ cliConn 的 `-N -B` 转义陷阱（QA 第 1 轮 major）**：`services/api/src/migrate.js` 的 `cliConn` 用 `mariadb -N -B` 批处理模式，**输出里的反斜杠会被再次转义**。`payload` 是 JSON，地址里只要有 `"`（如 `5'10"`）或 `\`，直接 `SELECT payload` 读回就会变成 `\"` / `\\`，`JSON.parse` 失败或内容变形。故读取统一走 `SELECT HEX(payload)`，Node 端 `Buffer.from(hex,'hex')` 还原。**任何经 cliConn 存取自由文本（JSON/HTML/含引号的串）都必须走 HEX 或 base64，不能直接查原始列。**
- 单测：`services/api/test/addr-share-route.test.js`（12 例：鉴权/入参裁剪/换行清理/反斜杠转义/每 uid 上限/HEX 往返含 `"` `\`/非法 token/过期/损坏/限流/降级）。

### 可观测性与分享兜底（2026-10-26 收尾）

- **登录异常必须留日志**：`server.js` 的 `/auth/telegram` catch 原先静默返回 `502 LOGIN_FAILED`，线上排查时日志全空，只能进容器逐层复现。现补一行 `console.error`，**只打错误消息、不打 initData**（initData 是可复用凭证，进日志等于二次泄漏）。
- **分享文本带完整地址**：`t.me/share/url` 的 text 由「主地址」改为「主地址，门牌/楼层/单元」，深链在对方客户端打不开时仍可照着文本手工录入。

## 火鸟「空数据」惯例 → TMA 空态处理（2026-10-26）

- 上游列表接口（article::alist / waimai::order 等）空数据在 handler 层是 `state=200, info:"暂无数据！"`；
  网关 `handlers::getHandle`（api/handlers/handlers.class.php:68）把 200/101 统一归一成**外层 `state=101`**，与真实错误同状态码，只能靠文案区分。
- fbClient.unwrap 对 `state 101/200` + 空态文案（暂无数据/没有数据/暂无内容/暂无信息）返回 null，其余 101 仍抛错；
  调用方均以 `Array.isArray(x) ? x : []` / `info?.list` 兜底 → 页面渲染 van-empty。
- **教训**：判断上游契约必须打真实接口（`/tg-api/fb/article/alist?typeid=2` → state 101），不要只读 handler 源码里的 return。
- 修复动机：资讯页 国际新闻/本地新闻/华人动态 三分类在 canary 库文章数为 0，此前整页显示「加载失败，请重试」，误导为服务故障。线上分类数据（2026-10-26 查证）：综合资讯 6 篇，其余 0 篇。
- 资讯页首屏：三个分类长期为 0 篇（本地新闻/国际新闻/华人动态），默认分类为空导致一进页面就是空白 →
  News.vue 首次加载后若当前分类为空，用 `pageSize=1` 依次探测其它分类并自动切到第一个有文章的分类（只做一次，探测失败静默跳过）；
  用户手动点空分类时不干预，正常显示「暂无资讯」。

## 地址保存改为「服务端按地址反查坐标」（2026-10-26 线上事故修复）

- **事故**：新版地址表单只让用户填地址，坐标依赖前端 Google Places 选中联想项；而 canary 线上包的
  `VITE_GOOGLE_MAPS_API_KEY` 未生效（打 bundle 验证：无 `AIzaSy`、无 `maps.googleapis.com`，Maps 代码被摇树删掉），
  于是 `lat/lng` 永远为空 → `save()` 直接 return → **地址一条都存不了**（用户侧表现为「连地址保全都搞不定」）。
- **修复（前端）**：`Addresses.vue::save` 删除「无坐标就拦截」的硬校验；坐标交给服务端。
- **修复（后端）**：`waimai::operAddress` 在 lng/lat 为空时调用新增私有方法 `geocodeAddressByText()`：
  Google Geocoding（服务端 key `$cfg_map_google`，pod 内实测 `status=OK`），查询串带上分站城市名
  `$siteCityInfo['name']`，避免只写街道名被解析到别的国家。
- **精度门槛（QA 打回后收紧）**：只接受 `status=OK` 且 `location_type != APPROXIMATE`、`partial_match` 为假的结果；
  **解析失败直接报错让用户补全，不做「分站中心点」兜底**——错坐标会污染配送范围、距离运费与骑手导航，比存不下更糟。
  失败只 `error_log` 记 status/error_message（不含 key 与完整 URL）。
- **契约**：TMA 写地址只保证 `person/tel/street/address/areaCode`；`lat/lng` 为可选，缺失由服务端解析。
- **教训**：前端能用 ≠ 线上能用。凡是「构建期注入的 key」，必须对**线上 bundle** 做一次实际存在性校验
  （grep `AIzaSy` / SDK URL），不能只信 CI 里的 `--build-arg`。
- **反查只用主地址**（E2E 发现）：查询串曾拼上 `address`（含补充项），Google 对
  「Robinsons Place Manila，Level 3 near cinema」返回 `partial_match=true` → 被精度门槛拒绝 → 仍存不下。
  现改为「`street` + 分站城市名」→ 失败再试 `street` 单串；补充项/备注只影响展示，不参与 geocode。

## 视觉系统 v2（上）：设计令牌 + 应用外壳 + 首页（2026-10-26）

- **设计令牌重写**（style.css）：暖米底 `#F7F6F4`、大圆角（14/18/22/28）、双层柔和阴影、
  品牌渐变 `#FF9A4A→#EE3C08`、价格红 `--price`、金星级 `--gold`；暗色主题只换表面并提亮一档。
- **自绘组件**：AppIcon 内联 SVG 图标库（stroke 跟随 currentColor，不依赖字体——线上 webview
  出现过字体加载失败变空方块）；自绘底部 tabbar（毛玻璃 + 激活品牌 pill + 购物车角标）。
- **首页重做**：渐变头部（定位 + 按时段问候 + 语言切换）→ 白色悬浮搜索框（本地过滤商家/菜品）→
  三枚服务亮点 → 品类 pills（取自商家 typename）→ 排序 pills（评分/销量/起送，客户端排序）→
  图片优先商家卡（16:9 封面 + 营业中/送达时长玻璃角标 + 封面店名叠字 + ★评分/月售/起送/配送费 + 优惠 tag）。
- **配套接口**：`waimai::shopList` 本 PR 已透出 `star`、`sale`（SQL 本就查出，仅补两行输出；
  star 以 `round(...,1)` 归一，sale 强转 int）。
- **过渡策略**：门禁限制单 PR 增量 ≤1200 行，本次先上设计系统 + 外壳 + 首页；旧页面类
  （fbs-card/order-card/cart-line 等）以「兼容类 + 令牌别名」临时保留，其余页面重构在系列下一个 PR。
- **截图验收**：vite build → 预览目录注入 mock fetch（固定数据 + 假 Telegram WebApp）→
  puppeteer-core 以 390×844@2x 截图检查。注意 macOS headless `--window-size` 实际最小视口约 470px，
  CLI 截图不可信，必须用 CDP 设备模拟。

## 视觉系统 v2（下）：全页面收尾（2026-10-26）

- **全页面迁移到 v2 类**：Shop/Cart/Checkout/Orders/Profile/News/NewsDetail/OrderDetail/Addresses
  全部重写为 v2 设计语言（店铺 sheet + 菜品行步进器 + 深色悬浮结算条 + 账单卡 + 订单 chip +
  me-hero 渐变头 + 资讯卡 + 地址自绘开关/操作面板）。
- **隐藏 bug 顺手修**：Addresses 的 `van-switch`/`van-action-sheet` 此前从未在 main.ts 注册
  （「设为默认地址」开关实际不渲染），本次以自绘 `.switch`/`.act-sheet` 替换，不再依赖注册。
- **main.ts 缩减**：Vant 只注册 `Loading/Field/Popup`；主包 197kB→155kB（gzip 76→62kB）。
- **兼容层清理**：删除 style.css 中「过渡别名 + 旧页面兼容类」（-208 行），全 app 统一 v2 令牌。
- **地址页保留**：Places 联想 / 分享深链（share token）逻辑不动，仅重排版式；region 仍为 PH。
- **验收**：tsc ✅ / npm test 35/35 ✅ / vite build ✅；页面代码与此前 v2 分支截图验收版本一致。

## 地址列表读不出（2026-10-26 线上事故）

- **症状**：保存地址成功（库里有行，uid/cityid/坐标齐全），但地址页/结账页/我的-统计全部显示无地址。
- **根因**：火鸟 handler 返回形状不统一——`getMemberAddress` 直接 `return $list`（老 H5 读
  `data.info` 即数组），而 TMA 三个页面都在读 `info?.list`，永远 undefined。对照
  `webroot/templates/waimai/touch/skin2/js/addressPaotui.js:174`（`var list = data.info`）实锤。
- **修复**：fbClient 导出 `listRows(info)`（裸数组 / `{list}` / null 三态归一），Addresses /
  Checkout / Profile 三处统一改用；EMPTY_RE 补「暂未添加」空态文案。
- **教训**：接火鸟老接口前先对照 touch 模板的老 JS 确认 info 形状，不要假设都是 `{list}` 包装。

## 事故：下单后看不到订单（2026-10-26）—— 两个独立根因

用户报「下单后没有看到订单」。排查后发现**两个互相独立的缺陷**，必须都修才算闭环。

### 根因 1（数据层，静默）：`waimai_order_all` 合并表 UNION 成员列表为空

`huoniao_waimai_order_all` 是 MySQL `MRG_MyISAM` 合并表，但 DDL 里没有 `UNION=` 子句
（物理上 `.MRG` 文件 0 字节，对照 `public_comment_all` 是 43 字节）。合并表本身不存数据，
成员列表为空 ⇒ **所有 `SELECT ... FROM waimai_order_all` 恒返回 0 行**，且 SQL 不报错、
接口照样返回 `state=100` + 空列表 —— 故障完全静默。

- **排除项**（逐条验证过）：下单落库正常（基础表有真实订单）、接口形状 `{pageInfo,list}`
  与 H5 老框架一致、SQL WHERE 无误、前端读法正确。**H5 老框架同样读不到订单** —— 证明
  与 TMA 前端无关，是老框架一直存在的故障被 TMA 暴露出来。
- **缺陷来源**：上游 hawaiihub 导出的 `hn_waimai_order_all` 本身就缺 `INSERT_METHOD/UNION`，
  经 `scripts/extract_waimai_tables.py` 原样灌进 canary 与生产两库。
- **爆炸半径**：`waimai.class.php` 内 55 处引用、全仓 42 个 PHP 文件 —— 订单列表、取消订单、
  支付回调写订单状态（`miniReturnPay.php`）、商家后台/打印（`common.func.php`）、
  3 个订单 cron 全部静默失效。
- **修复**（已在 canary + 生产各执行一次）：
  ```sql
  DROP TABLE IF EXISTS `huoniao_waimai_order_all`;
  CREATE TABLE `huoniao_waimai_order_all` LIKE `huoniao_waimai_order`;
  ALTER TABLE `huoniao_waimai_order_all` ENGINE=MRG_MyISAM;
  ALTER TABLE `huoniao_waimai_order_all` UNION=(`huoniao_waimai_order`);
  ```
  三个要点：① `ENGINE=` 与 `UNION=` **必须拆成两条 ALTER**（`UNION=` 只对已是 MRG 的表生效）；
  ② 必须 `CREATE TABLE ... LIKE` 重建，不能原地加 UNION —— 旧合并表 `fids` 列 collation 是
  `utf8mb4_0900_ai_ci`，基础表是 `utf8mb3_general_ci`，MRG 要求成员列定义一致会被拒；
  ③ LIKE 会连列定义与 29 个索引一并复制。

### 根因 2（代码层）：货到付款只做了 UI，`paytype` 没传

`lib/checkout.js` 的 `buildDealParams` 不传 `paytype`，上游 `$paytype = (int)$this->param['paytype']`
取到 **0**，被当成「在线支付」：

1. `waimai.class.php:3525` 的 `if ($paytype == 1)`（货到付款）不成立
2. 落到 `:3827` 的 `createPayForm` 在线支付分支
3. 订单 INSERT 时 state 硬编码为 `'0'`（`:3625`）
4. 30 分钟后 `include/cron/waimai_updateOrderState.php` 把 `state=0` 改为 `state=6`「订单超时未支付」

**用户看到的就是：下单成功 → 半小时后订单变成已取消。**

- **修复（服务端收口）**：TMA 没有收银台（H5 靠下单后跳收银台、由用户点确认触发 `pay()`），
  所以在 `services/api/src/fbProxy.js` 里，`deal` 返回 `delivery|<ordernum>` 时紧接着用同一
  会员凭证调用 `pay(paytype=delivery)`，由 `pay() → paySuccess()` 把 state 推到 2。
  - 安全性：`pay()` 的订单查询限定 `uid = <当前会员> AND state = 0`（`:3952`），且 ordernum
    取自本次 deal 返回值，只会作用于刚创建的那笔订单；`waimai:pay` **不进**对外白名单。
  - 坑：`pay()` 在 `paytype=delivery && !isMobile()` 时 `header('location')` 后 `die`（`:4240`），
    所以服务端调用必须带移动端 UA，否则拿不到 JSON。
  - 收口失败不阻塞下单（订单已创建），但记 `cod_settle_failed` 告警。
- **前端**：`buildDealParams` 显式传 `paytype`；`parseDealResult` 按
  `delivery|` / `ok|` / `peerpay|` / 纯订单号 / 在线表单 五种形态分流，避免把
  `"delivery|xxx"` 整个当订单号显示。
- **兜底**：`waimai_updateOrderState.php` 的超时规则加 `AND paytype != '1'` —— 货到付款没有
  「未支付超时」语义，即使收口失败也不该被取消（宁可停在待付款，也不能凭空消失）。

### 防复发

- `scripts/fix-waimai-merge-table.sh`：可审计修复脚本（`--dry-run`、执行后自动双重验证）
- `webroot/include/cron/waimai_checkMergeTable.php`：每 30 分钟扫描全库 `MRG_MyISAM` 表，
  缺 `UNION=` 则调 `SubTableAsync::run()` 自愈（与 `dsql.class.php` 自愈分支同一路径）
- `scripts/extract_waimai_tables.py`：抽取阶段给缺 UNION 的合并表定义自动补齐，堵住源头
- `fbProxy.js`：`waimai:order` 返回 `totalCount=0` 时按会员每小时采样告警一次
  （与「新用户确实没订单」无法区分，故只采样留痕、不阻断）

### 教训

1. **静默空集比报错危险得多**：`state=100` + 空列表看起来完全正常，日志一声不吭，能瞒几个月。
   接上游接口时，「查到了但 0 条」和「查询路径本身坏了」必须能区分。
2. **改数据层前先在同类表上演练**：修生产前先在 canary 用临时表名跑一遍 DDL，验证列定义、
   索引数、collation、数据可见性，再动真表。
3. **前端「看起来对」不等于「参数传对了」**：UI 写「货到付款」但参数没传，是最难发现的一类 bug
   —— 界面对、接口不报错、状态悄悄错。

## 订单模块对齐 H5（2026-10-26）

参照 H5 老框架 `webroot/templates/member/touch/` 补齐订单列表与详情。**接口零改动** —— 依赖的
handler/action 与参数均已在 `services/api/src/fbProxy.js` 白名单内。

### 订单列表分组 Tab（`pages/Orders.vue`）

对齐 `js/order-waimai.js:46-59`，三组：

| Tab | 请求参数 | 计数来源 |
|---|---|---|
| 全部 | `{page,pageSize}` | `pageInfo.totalCount` |
| 待付款 | `{page,pageSize,state:'0'}` | `pageInfo.state0` |
| 待评价 | `{page,pageSize,state:'1',iscomment:'0'}` | `pageInfo.noiscomment` |

**`pageInfo` 计数字段的约定（关键，别用错）：**

`waimai::order()` 是**先算各项计数、再追加 `state` 过滤**（`waimai.class.php:5919-5943`）。因此：

- `state0` / `state1` / `state2` / `state3` / `noiscomment` / `yesiscomment` **始终是全量值**，
  不随当前请求的 `state` 参数变化 —— 可以放心用于 Tab 角标
- `totalCount` **会随 `state` 参数变化**（只统计当前筛选结果）—— 所以前端只在「全部」Tab 下
  用它更新 `counts.all`，否则切到「待付款」后「全部」的角标会缩水成待付款数

`waimai:order` 白名单参数：`page` / `pageSize` / `state` / `iscomment`。

### 订单详情（`pages/OrderDetail.vue`）

字段全部按上游 `orderDetail()` 真实返回核实（`waimai.class.php:6152-6381`）：

| 区块 | 依赖字段 |
|---|---|
| 状态头 | `shopname` `state` `ordernum` `qcma`（取餐码）`failed`（失败原因） |
| 商品 | `food[]`（`title` / `count`） |
| 账单 | `priceinfo[]`（`type` / `amount`）、`paytype`（上游已是格式化文案）、`amount` |
| 配送信息 | `person` `tel` `address` `peisongname` `peisongphone` |
| 订单进度 | `pubdate` `paydate` `confirmdate` `peidate` `okdate` |
| 其他 | `note` `preset` `shoptel` |

时间字段是**秒级 unix 时间戳**；`paydate = -1` 表示货到付款（不是真实时间点），前端跳过该节点。
`priceinfo` 第 0 项被上游塞入 `type='pointprice'` 的伪元素，渲染时需跳过。

### 订单状态映射（`lib/checkout.js` 的 `ORDER_STATE`）

| state | key | 中文 | English |
|---|---|---|---|
| 0 | pending | 待付款 | Awaiting payment |
| 1 | done | 已完成 | Completed |
| 2 | paid | 待接单 | Awaiting acceptance |
| 3 | preparing | 备餐中 | Preparing |
| 5 | delivering | 配送中 | Delivering |
| 6 | cancelled | 已取消 | Cancelled |
| 其他 | **unknown** | 处理中 | Processing |

**未收录的状态不猜语义**：历史实现把未知状态兜底成 `pending`（待付款），会误导用户。
现在统一兜底为 `unknown`（处理中），i18n key 为 `state.unknown`。

### 刻意不做的功能

- **确认收货**：H5 有 `sure_btn`，但上游**没有用户侧确认收货的 action**（状态由 cron 与商家后台
  驱动）。做出来就是点了没反应的死按钮，故只提供「联系商家」入口。
- **再来一单**：H5 里该按钮的四处实现**全部被 HTML 注释掉**，实际不存在的功能，不算缺口。

---

## 购物车：持久化与起送价（2026-10-26）

### 为什么改

用户在旧版里踩了两脚坑，两脚都是**下单前的漏斗漏点**：

1. **刷新即丢**：购物车只活在 Pinia 内存里。Telegram 里切出去回条消息、系统回收 WebView，
   回来购物车就空了——而用户往往已经挑了半天菜。
2. **填完地址才知金额不足**：起送价（`storeDetail` 的 `basicprice`）只在店铺页脚显示文案，
   不参与任何校验。用户可以一路点到结算页、选完地址、点提交，才被上游 `deal` 拒掉。

### 落地方式

**纯逻辑层**（`lib/cart.js`，node:test 可直接覆盖，不依赖浏览器）：

| 能力 | 接口 | 说明 |
|---|---|---|
| 持久化 | `createCart({ storage })` | 默认用 `safeStorage()`（探测 `localStorage` 可写），不可用时退化为纯内存 |
| 快照 | `serialize()` / `hydrate(raw)` | 版本号 `v:1`；格式不兼容整体丢弃，绝不半解析 |
| 起送价 | `minOrderCents()` / `shortfallCents()` / `meetsMinimum()` | 差额按"分"算，天然无浮点误差 |
| 结算闸门 | `canPlaceOrder()` | `canCheckout() ∩ meetsMinimum()`；`canCheckout()` 语义保持不变（只管车本身合不合法） |

**店铺元信息是两层结构**（QA 171 轮 1 major 的修复核心）：

| 变量 | 含义 | 生命周期 |
|---|---|---|
| `shopMeta = {id,name,minOrderCents,ts}` | 当前车**绑定**的那家店的起送价 | 车归属变化时跟着换 |
| `seenMeta`（同结构） | **最近一次见到的**店铺（可能是别的店） | `setShopMeta()` 每次都更新，**随快照落盘** |

`seenMeta` 必须落盘：`storage` 事件与 `visibilitychange` 都会触发 `reload()`，只存内存的话
"A 店车 + 逛过 B 店"这条状态过一夜就没了（QA 171 轮 2 major）。

`setShopMeta()` 在车属于别的店时返回 `false` 且**不绑定**，但一定写进 `seenMeta`。等用户确认换店
（`switchShop`）或把车清空再加菜时，`add()` 会调 `bindMeta()`：先看当前 `shopMeta`，再看 `seenMeta`，
命中就把门槛接回来。

没有这一层会出两个静默 bug——两条都是极常见的操作路径，且结果是"门槛变 0 → 直接放行"：

1. 用户在店铺页把最后一份**减到 0 再重新加菜**（`setQty` 会把 `shopId` 置空）；
2. 用户在 B 店确认**换店**加菜（B 店的 `setShopMeta` 在 `load()` 时先于 `switchShop` 执行，被拒绝后没人补写）。

因此 `setQty` / `clear()` **只解绑 `shopId`，不再清 `shopMeta`**。

**门槛有时效**：`minOrderCents()` 在 `now - ts > 30min` 时返回 0（当未知处理）。
商家调低起送价后，用户不该被一份旧快照永久卡住——宁可交给上游 `deal` 兜底拒绝。
`Cart` / `Checkout` 进页面时还会静默拉一次 `storeDetail` 刷新 `basicprice`，本地快照只是兜底。

**未知一律不拦**：起送价缺失、换店后未加载、快照过期，`minOrderCents()` 都是 0。
宁可让上游兜底拒绝，也不要在前端用猜出来的门槛拦住能成立的订单。

### 存储格式（`localStorage['fbcart:v1']`）

```json
{ "v": 1,
  "shopId": "12",
  "shop": { "id": "12", "name": "店名", "minOrderCents": 30000, "ts": 1793023056926 },
  "seen": { "id": "15", "name": "另一家店", "minOrderCents": 15000, "ts": 1793023056900 },
  "lines": [{ "id": "88", "title": "菜名", "priceCents": 1250, "qty": 2, "pic": "https://…" }] }
```

- `ts` 是毫秒时间戳，用于判断门槛新鲜度（缺失按"刚刚"算）
- `seen` 是"最近见到的店铺"，可能不是车上这家
- 空车快照合法：`shopId` 为 `null` 且 `lines` 为 `[]`，此时 `shop` 里留着的门槛会挪进 `seen`

恢复时**逐行校验**：`id` 非空字符串、`title` 是字符串、`priceCents` 为有限非负数、
`qty` 为 `1..99` 的整数、`pic` 必须是 `https://` 开头（其余降级为 `null`）。
坏行丢弃、好行保留。

**一致性守卫**（整份拒收，内存不动）：JSON 损坏 / 版本不符 / 有原始行但一行都解析不出来 /
"有店无菜" / "有菜无店"。`localStorage` 是用户可写域，脏数据既不能让页面白屏，
也不该把用户正在操作的购物车清空。

### UI 落点

| 页面 | 行为 |
|---|---|
| `Shop.vue` | `load()` 成功后写入 `shopMeta`；**每次加购也补写一次**（幂等，用手里这份 `storeDetail`），彻底消除"停留超过 TTL / 换店时被拒"的盲区；悬浮结算条在未达标时按钮禁用，显示"还差 ₱X"，`.sum` 副标题用金色 `--gold` 强调 |
| `Cart.vue` | 进页面静默刷新 `storeDetail`；账单增加「起送价」一行 + 未达标时的 `hint--warn` 提示；结算按钮改用 `canPlaceOrder` |
| `Checkout.vue` | 同样进页面刷新起送价；按钮改 `canPlaceOrder`；`submit()` 前置防御——差额 > 0 时不发请求，直接提示差多少 |
| `style.css` | 新增 `.cartbar .sum span.short`（金色）、`.hint--warn`（品牌色） |

### 多标签页 / 多 WebView

`persist()` 是整份覆盖写，两个实例会互相盖。`stores/cart.ts` 监听 `storage` 事件与
`visibilitychange`（回到前台时）调 `cart.reload()`，返回 `true` 就 `bump()` 重新渲染。

`reload()` 的语义**只有两种**：

| 返回 | 含义 | 内存 |
|---|---|---|
| `true` | 拿到并应用了一份合法快照（**可能是空车**——另一标签页清空了车） | 整体替换 |
| `false` | 没有快照（键不存在）或快照不可信（脏数据 / 版本不符 / 一致性守卫不通过） | **原封不动** |

关键实现约束：`parseSnapshot()` 是纯解析，**先解析到临时结构、成功后才替换内存**。
旧实现在解析前就 `lines.clear(); seenMeta = null`，于是每次前后台切换都会把前一节说的
`seenMeta` 抹掉，"减到 0 再加菜""换店"两条路径上的起送价又变回 0（QA 171 轮 2 major）。

### 刻意不做的

- **不设购物车过期**：菜品下架/改价由上游 `deal` 校验，前端存久了最多是"提交时被拒"，
  比"回来发现车空了"体验好。真要做清理，应该等上游提供菜品状态批量查询。
- **不做跨设备同步**：`waimai` 没有服务端购物车接口，只能本地存。

### 已知取舍

`localStorage` 是**设备级**的，不区分 Telegram 账号。同一台设备换账号登录会看到上一个人的购物车。
可接受的理由：车内容只有菜名与单价，不含个人信息；下单所需的地址走 `getMemberAddress`（按 uid 服务端查），
不会被"继承"。若后续要彻底隔离，应在 `auth` 成功后把 `uid` 拼进存储键（`fbcart:v1:<uid>`），
但这会让"未登录浏览的购物车"在登录后丢失，属于产品决策，暂不做。

---

## 首页：服务端搜索、分页与搜索历史（2026-10-26）

### 为什么改

旧版首页只请求 `shopList page=1 pageSize=20`，然后**在前端**做筛选/排序/搜索。三个后果：

1. **只能搜到前 20 家店**——第 21 家起的店再怎么搜都出不来。
2. **搜不到菜品**——前端只匹配 `shopname` / `description` / `typename`，而上游 `keywords` 是会
   `LEFT JOIN waimai_list` 连菜品标题一起搜的。
3. **排序只排当前页**——"销量最好"实际上只是在 20 家里排，不是全量。

### 上游的三个坑（都实测确认过）

**① 带 `keywords` 时 `totalCount` 不可信**

`waimai::shopList` 在有 `keywords` 走的是这段（`waimai.class.php:600` 附近）：

```sql
SELECT count(s.`id`) totalCount FROM `#@__waimai_shop` s
LEFT JOIN `#@__waimai_list` f ON f.`sid` = s.`id` ... GROUP BY s.`id`
```

`GROUP BY` 会把结果拆成多行，而 `$dsql->getOne()` 只取**第一行**——拿到的是"这家店匹配了几道菜"，
不是店铺数。一家店有 3 道菜命中就报 3，用户看到"共 3 家"其实只有 1 家。

**所以"还有没有下一页"一律按本次返回条数判断**（`rows.length >= PAGE_SIZE`），绝不看 `totalCount`；
搜索态下也不展示"共 N 家"，改用已加载条数。

**② 无结果返回的是 `state=200` + `"暂无数据！"`，不是空列表**

`fbClient.unwrap()` 已经用 `EMPTY_RE` 把这类响应归一成 `null`，调用方按空数组处理即可。
不要再在页面里写 `try/catch` 猜错误——那会把"没搜到"显示成"加载失败"。

**③ `orderby` 是可用的服务端排序**

| 值 | 含义 |
|---|---|
| 0 | 默认（下单状态 → 营业状态 → 预定 → 自定义序号） |
| 2 | 销量 |
| 3 | 起送价 |
| 5 | 评分 |
| 1 / 4 / 6 | 距离 / 评论数 / 配送时长（需要 `lng`/`lat` 或不常用，前端未接） |

前端 `SortKey` → `ORDERBY` 映射在 `Home.vue` 顶部；排序必须走服务端，否则只排到当前页。

### 前端结构

| 能力 | 实现 |
|---|---|
| 分页 | `PAGE_SIZE=20`；底部「加载更多」按钮，`hasMore` 由返回条数推导 |
| 搜索 | 输入 350ms 防抖 → `keyword` → `fetchPage(1)`；回车/点历史走 `commitSearch()` |
| 竞态 | `reqToken` 自增，响应回来时 token 不匹配就丢弃（快速改关键词/切分类时必需） |
| 分类 | `waimai:shopType` 取分类列表，过滤掉 `paotui=1`（跑腿不是外卖店），`typeid` 服务端筛选 |
| 排序 | 服务端 `orderby`，`watch([sort, activeCat])` 触发重查 |
| 历史 | `lib/searchHistory.js`，键 `fbsearch:v1`，最多 8 条，只在**回车 / 点历史项**时记录 |

**为什么防抖不记历史**：每次输入都记会把 `鸡` `鸡排` `鸡排饭` 三条半截词塞满历史。
只有用户"确认搜了"（回车）或点了某条历史，才算一次真实意图。

### 搜索历史的存储

```json
["鸡排饭", "奶茶"]
```

纯字符串数组，`normalize()` 会折叠空白、去控制字符、截到 40 字符；空串不记录。
恢复时去重（大小写不敏感）、截到 `limit`。脏数据（非数组 / 含非字符串项）逐项丢弃，
整份不可解析就当空历史——**绝不抛异常**，index 页不能因为这个白屏。

### 白名单变更（`services/api/src/fbProxy.js`）

| 接口 | 变更 | 原因 |
|---|---|---|
| `waimai:shopList` | 新增 `params` 白名单 | 开始透传 `keywords`；同时收口三个注入面 |
| `waimai:shopType` | **新增**（anonymous 只读） | 首页分类列表；返回纯展示字段 |

`shopList` 白名单**刻意排除**三个参数：

- `ids`——上游直接拼进 `AND s.id in ($ids)`，最典型的注入面；
- `lng` / `lat`——拼进 SQL 的数学表达式（`ROUND(6378.138 * 2 * ASIN(...))`），未强转；
- `cityid`——由 `getCityId()` 内部处理，不需要客户端传。

单测锁定了这三条（`fb-proxy.test.js`「shopList 只透传搜索/分页/筛选参数」），
以后想加回来必须改测试，跑不掉。
