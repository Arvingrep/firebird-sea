# KNOWN_ISSUES · 已知问题台账

> 只记「已确认存在、当前决定不修」的问题。
> 每条必须写清：现象 → 根因 → 为什么现在可接受 → 将来怎么修（优先级） → 什么条件下必须重修。
> 新条目按 KI-序号 递增，不要删除历史条目，结案改成「已修复（commit）」并保留原文。

---

## KI-001 · 登录防重放计数在多个副本之间不共享

**状态**：接受风险，暂不修复（2026-11-05，裁决人 team-lead，复核人 Vic）

**现象**

`/api/fbs` 的登录网关用「同一份 initData 的 sha256」做键，在文件里累计使用次数，
超过阈值返回 `429 REPLAY_LIMITED`。计数落在 PHP 容器内的文件系统上：

- 默认路径 `webroot/data/cache/fbs_bridge/`（`bridge.php:203`）
- Helm chart 里 `data/` 是 `emptyDir`（`deploy/helm/firebird-site/templates/_helpers.tpl:215`）
- 而 `replicaCount: 2`（同一份 values）

后果：**每个 Pod 各算各的**，实际额度 = 5 × 2 = 10 次；Pod 重建后计数清零，
额度恢复成 5 次。日志里两个 Pod 各自打 `[fbs_gateway] replay limited: count=6`，
从单个 Pod 的视角看行为完全正常，容易被误判为「已经生效」。

**根因**

计数存储是「单机本地文件 + `emptyDir`」，天然不具备跨副本语义。

**为什么现在可以接受**

1. **威胁模型没有变化**。能拿到 initData 的人本来就能签发登录 Cookie；
   5 次和 10 次的差别不构成质变，防重放在这里是「降低重放收益」而不是「阻断重放」。
2. **重启清零 ≠ 无限**。每次重建只是恢复成 5 次，不是「清零后可无限续」，
   最坏情况仍被 `FBS_BRIDGE_REPLAY_TTL`（7200s）的窗口约束。
3. **三条修法都比问题重**：
   - Redis 计数：要先确认 PHP 镜像装了 redis 扩展（没装就要改基础镜像，全线风险）；
   - `data/` 换 PVC：2 副本下要处理 `ReadWriteOnce` 的访问模式，改错比不改更糟；
   - `replicaCount: 1`：滚动发布会变成停机，为一个辅助防护搭上可用性，不划算。

**若将来要修，优先级**

`Redis 计数` > `PVC` > `单副本`

**什么条件下必须重修**

- 主站要上 4 个以上副本（额度随副本数线性放大，`5 × N` 开始失去意义）；
- 有用户或运营反馈「同一笔单被重复提交」；
- 防重放从「辅助」升级为「准入条件」（例如把 `REPLAY_LIMITED` 纳入风控/审计口径）。

---

### 附带确认：计数文件是惰性过期，没有定时 GC

`fbs_bridge_replay_check()`（`webroot/api/fbs/bridge.php:198-245`）只做「读 → 过期则从 0 重算 → 写回」，
**不会删除任何文件**；过期时间写在文件内容里（`"<count> <expiry>"`），不是靠 mtime。

因此：

- 每成功登录一次（一份新的 initData）就会在 `data/cache/fbs_bridge/` 留下一个
  `<sha256>.cnt`，约 64 字节文件名 + 20 字节内容，占一个 4KB 块；
- 这些文件**不会自己消失**。`emptyDir` 只在 Pod 重建时清空；Pod 长期不重启
  （正常情况就是不重启）时目录会一直增长。按每天 100 次登录估算，一年约
  3.6 万个文件 / 约 145MB —— 不会立刻打满磁盘，但属于「半年后磁盘莫名满了」的典型来源。

**运维提示（两条，任选其一）**

```bash
# 1) 定期清理：只删 mtime 超过 TTL 的，正在计数的窗口不受影响
#    TTL = 7200s = 120min，留 30min 余量
find /var/www/html/webroot/data/cache/fbs_bridge -name '*.cnt' -mmin +150 -delete

# 2) 至少做目录体积监控
du -sh /var/www/html/webroot/data/cache/fbs_bridge
```

> 注意：**不能**按文件名或「全部删除」清理 —— 删掉未过期的文件等于把该 initData
> 的额度清零，会静默放宽防重放。清理条件必须基于时间。

---

## KI-002 · /install/index.php 可访问且没有任何自锁

**状态**：接受风险，暂不修复（2026-11-06，复核人 Vic 判定为既有高危，与 TG 线无关）

**现象**

`webroot/install/index.php` 对公网可访问，且**完全没有安装锁**。
（此前的记录写成"自锁判 `common.inc.php` 存在但永远锁不上"，措辞有误：`common.inc.php`
是站点核心引导文件，无论装没装都在，所以那段判断根本不可能起到锁的作用 —— 实质状态是"无锁"。）

**为什么现在可以接受**

TG 需求线明确「不改火鸟既有代码、既有问题只出清单不修」。且它不是本次改动引入的。

**上线前必须人工确认的一条**

镜像里是否还带着 `webroot/install/`。若带着，任何人都可能重装站点。

```bash
# 在 php 容器里执行，应返回 "no install dir"
docker exec <php-pod> sh -c '[ -d /var/www/html/webroot/install ] && echo "install dir EXISTS" || echo "no install dir"'
# 或从公网直接访问，应 404
curl -s -o /dev/null -w '%{http_code}\n' https://<站点域名>/install/index.php
```

**将来怎么修（优先级）**

镜像里直接删掉 `webroot/install/` > 安装完成后写死一个 lock 文件 > 加登录校验

---

## KI-003 · index.php:1423 在特定路径下会渲染商家登录表单

**状态**：**已关闭（`423f69e3` 后前提失效）** — 2026-11-06，复核人 Vic

**关闭理由**

本条担心的是「白名单放行 `member` 后，`:1423` 的模板切换分支会让非商家看到商家登录表单」。
`423f69e3` 之后 `business` 已放行、`/wmsj/login.php` 本身就是正式的商家登录入口，
`:1423` 渲染的是同一套表单、同一套鉴权，**不再构成新增泄漏面**。
原文保留在下面，仅作记录。

---

**（原文，2026-11-06 记录时）**

**现象**

`index.php:1423`：`$templates == 'login.html'` 且路径含 `wmsj` 时，模板目录切到
`/wmsj/templates/touch/`。若此时 `$service` 解析成 `member`（在白名单内，放行），
会渲染出**商家登录表单**——商家数据页本身仍受守卫约束，泄漏面只有一个表单。

注意：这条与 KI-002 不同，**不是既有问题**，是这轮引入白名单后才出现的可达性变化，
只是尚未在真机上确认能不能真的走到。

**为什么当时可以接受**

需要「会员子域 + 特定路径」的组合才触发，真机上是否可达尚未确认；且 wmsj 登录页
本身有自己的账号鉴权，不构成越权。

**怎么验（可执行，不是"看一眼"）**

```bash
# 1) 确认模板切换分支存在且条件是什么
sed -n '1415,1430p' webroot/index.php

# 2) 用会员子域 + login.html 路径请求，看返回体里有没有商家登录表单的特征串
#    （特征串取 wmsj/templates/touch/login.html 里的表单 action 或唯一 class）
curl -s "https://<会员子域>/?service=member&template=login.html&do=wmsj" | grep -c '<商家登录表单的特征串>'
```

**什么条件下必须重修**

真机/curl 确认该路径可达且能提交登录 → 必须把 wmsj 路径特征纳入守卫，
或改掉 `:1423` 的模板选择条件。

---

## KI-004 · 首页模板有硬编码的模块入口，模块停用后仍会渲染

**状态**：接受（2026-11-06，复核人 Vic 发现，裁决人 team-lead）

**现象**

首页模板 `webroot/templates/siteConfig/touch/skin5/index.html` 里有**不经过
`siteModule()` 循环、无条件渲染**的模块入口：

| 位置 | 指向 | 现状 |
|---|---|---|
| `:157`（busLi 卡片）、`:372`（bus_a 快捷键） | `{#$business_channelDomain#}` | `423f69e3` 放行 business 后**已正常** |
| `:440-461` | `house` 模块（楼盘/二手房/租房…） | **仍然断着**：模块停用后入口照旧显示，点了 302 回首页 —— 用户观感是"点了没反应" |

**为什么现在可以接受**

1. 需求文档要求「不改火鸟页面样式」，删这几行属于改模板；
2. 只影响**首页观感**，不构成功能缺陷，也不影响验收第 2 条的功能面
   （URL 确实打不开）；
3. 是否命中取决于 canary 用的是哪个 skin —— 若不用 `skin5`，本条不成立。

**上线前要看一眼**

canary 首页若用 `skin5`，确认 `:440-461` 这几处楼盘入口是否显示。
显示的话，验收第 2 条「其它模块不可见」在**字面**上不成立，需产品决定：
删模板行（超出本次授权）还是接受观感（记为已知差异）。

**将来怎么修（优先级）**

模板条件渲染（`{#if $house_state#}`）> 删掉硬编码块 > 后台把该模块的入口文案置空

---

## KI-005 · canary 旧 Node 登录链与本仓库 PHP 网关契约断链（四层不一致）

**状态**：临时关闭（2026-11-06，复核人 Vic 发现 FAIL，独立核实 实现工程师 Max，裁决人 team-lead）

**现象**

合并 canary 后，canary 侧 Node 登录链（`memberMap.js` / `credentialProvider.js` /
`bridgeRoute.js` / `fbProxy.js`）仍按旧网关契约调用合并树里的**我方 PHP 网关**
（`webroot/api/fbs/index.php`）。两侧测试都用桩网关、没有跨 Node↔PHP 接缝的用例，
所以合并时两侧各自全绿、接缝处必然失败：

| 层 | 旧 Node 侧 | 我方网关（合并树实际） | 结果 |
|---|---|---|---|
| 1 键名 | `{"tg_id": ...}` / `{"member_id": ...}` | `{"tg_user_id": ...}` / `{"tg_user_id": ..., "init_data_hash": ...}` | 400 `MISSING_PARAM` |
| 2 响应包裹 | `{state, info}`，判 `state === 100`（`memberMap.js:31`、`credentialProvider.js:14`） | `{success, data}`，`data.set_cookies[]` | 判定恒假 |
| 3 错误语义 | 失败=业务对象；`gatewayClient` 非 2xx 直接 reject | 非 2xx + `{success:false,error:{code,message}}` | 旧链把异常吞成无信息量 throw |
| 4 缺 `ttl` | `credentialProvider.js:18` 读 `info.ttl` | 只回 `set_cookies[]`，无 `ttl` | 静默退化 `cacheSeconds=120`，缓存在与火鸟会话无关的周期上 |

**层 2+3 的合并效果**：`memberMap.js:33` 只抛 `new Error('gateway member_find_or_create failed')`，
上层打日志只剩这一句 → 线上表现为 **502 + 一句无信息量错误**，排查必须逐层复现。
**层 1 与层 2 是两套独立的不兼容**：只改键名仍然 100% 失败（响应还是 `{success,data}`），
只改响应解析也 100% 失败（入参还被网关拒绝）。

**身份其实不缺（纠正一条误判）**

`tmaToken.js:22` 的 payload 已含 `sub: String(tgId)` 与 `mid`，`fbProxy` 侧可直接用
`claims.sub` 当 `tg_user_id`。真正缺的只有 `init_data_hash`（旧链从来没拿过它，
浏览器端 initData 在 `bridgeRoute` 就消费掉了）。

**限频约束（它决定了收敛路径，不是可选优化）**

网关对**同一份 initData** 限 5 次 / 7200s（`webroot/api/fbs/index.php:327-343` 的
`fbs_gateway_replay_guard`，阈值在 `bridge.php:76/79`），第 6 次 429 `REPLAY_LIMITED`。
`fbProxy` 是**每请求**换凭证（`fbProxy.js:192`，缓存仅 120s），即每份 initData 只能撑
5×120s 就会被自己的防重放打死。因此收敛时**必须**在登录那一刻缓存 `set_cookies`、
`fbProxy` 只读缓存；缓存策略还要同时回答：

- `ttl` 由 **Node 侧配置**给出（网关不返回，不能靠猜）；
- 火鸟后台改密码/踢人后，旧 cookie 的失效窗口有多大——建议 TTL ≤ 后台在线时长，
  并在上游返回 401 时主动失效缓存条目。

**影响范围**

- 仅 canary 的孤儿 Node 链 `/tg-api/auth/telegram`（`server.js:127`）、
  `/tg-api/auth/bridge`（`server.js:435-436`）：全仓零调用方（旧 Vue TMA 应用已归档）。
- **不受影响**：我方 `entry.php → /tg-api/auth/telegram-web`（`tgLogin.js`，按我方契约
  直连网关，读 `data.set_cookies[]`）；PHP 直连入口 `bridge.php` 同样走我方契约。

**临时措施（本轮）**

`deploy/helm/firebird-site/values-canary.yaml` 置 `tma.enabled: false`：
`TMA_ENV` / `TMA_BRIDGE_*` / `FB_UPSTREAM_URL` 不再注入，`buildAuth()`（`server.js:98-101`）
因缺 `TMA_ENV` 返回 `null`，两条路由降级为 **503 AUTH_NOT_CONFIGURED**（fail-closed，不是 502）。
一行值可回退，`bridge` 其余字段原样保留。

**验收口径（状态码，实测）**

- `/tg-api/fb/*` 在 `tma.enabled=false` 下是 **404，不是 503**：`FB_UPSTREAM_URL` 缺失使
  `server.js:157` 的 `if (fbUpstream)` 整块不执行，路由根本没挂载（404 比 503 更严格，但语义不同）。
- `/tg-api/auth/telegram-web` 缺网关配置时是 **500 `GATEWAY_SECRET_NOT_CONFIGURED`，不是 503**：
  `tgLogin.js:150-154` 把静态配置错映射为 500，口径见 `LOGIN_STATUS_BY_CODE`（`tgLogin.js:45`
  「静态配置错，重试无用」）。注意这与瞬态的 `DB_UNAVAILABLE → 503`（`tgLogin.js:52-54`）刻意不同。
- 真正的 503 只有两条：`/tg-api/auth/telegram`（`AUTH_NOT_CONFIGURED`）、
  `/tg-api/auth/bridge` 的 GET 与 POST（`BRIDGE_NOT_CONFIGURED`）。


**已知副作用（实测渲染；`29334cf7` 已修，此处保留修复前口径备查）**

chart 的 `{{- if .Values.tma.enabled }}` 守卫（修复前的 `deployment-api.yaml:37-81`）**不只包 TMA 变量**，
还包着 `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`、`TRUST_PROXY_HOPS`、`CORS_ORIGINS`
以及 `TMA_TOKEN_SECRET` 引用。关闭本开关后 api 容器会一并失去这 8 项：
`/checkout`（`server.js:283` 的 `cliConn()` 依赖 `DB_HOST`）不可用、限流因缺
`TRUST_PROXY_HOPS` 退化为「入口 IP 一份额度」、跨域头缺失；`tgLogin` 的 member_map 落库
降级为 `member_map_synced:false`（`tgLogin.js:220-234` 有 try/catch，不阻断登录）。
**部署本值前必须**先把非 TMA 专属变量移出该守卫（只留 `TMA_ENV`/`FB_UPSTREAM_URL`/
`TMA_BRIDGE_*`/重复的 `FBS_GATEWAY_URL` 在守卫内）。该前置条件已由 `29334cf7` 完成。

> 计数修正（`29334cf7` 的 commit message 写「新增 9 个 env」，实测 **8**）：
> `FBS_GATEWAY_SECRET` 在旧模板里本来就有**无条件渲染**的专属条目（守卫外 `:91`），
> 守卫内那份被同名覆盖、从未生效，所以它不属于「新增」。新增集合准确为
> `CORS_ORIGINS DB_HOST DB_NAME DB_PASSWORD DB_PORT DB_USER TMA_TOKEN_SECRET TRUST_PROXY_HOPS`。
> `505dec92` 已把 api 侧两条同名 env（`FBS_GATEWAY_SECRET`、`FBS_GATEWAY_URL`）与
> php-fpm 侧同名 `FBS_GATEWAY_SECRET` 去重，渲染零行为变化。


**为什么不选「PHP 兼收 `member_id`」**

那等于给网关开一条「凭 member_id 换会话」的旁路：不需要 initData 验签、也不需要
`init_data_hash`，刚加固的防重放当场失效。旧链是孤儿，没有理由为它放宽生产网关的安全边界。

**将来怎么修（验收后单独任务）**

1. `bridgeRoute.js` / `fbProxy.js` 把 `initData` 与其 `hash` 透传进 `credentialProvider`，
   改走我方契约（`tg_user_id` + `init_data_hash`，读 `data.set_cookies[]`）；
2. **新增「登录时缓存 `set_cookies`、`fbProxy` 只读缓存」这一层**（受上面 5 次/7200s 约束，
   这是唯一可行路径）；按上文回答 `ttl` 来源与踢人失效窗口；
3. **补真实跨接缝测试**：docker 起 `php:8.2-cli` + `php -S` 跑真实 `webroot/api/fbs/index.php`，
   Node 侧用**真实** `gatewayClient.js` 打过去，断言 HMAC 通过、`set_cookies` 回填、429 不会
   在第 5 次之后误伤。禁止两侧继续各自用桩——本 KI 就是这么漏出来的；
4. 改完把 `tma.enabled` 改回 `true` 并真机回归 `/tg-api/auth/bridge`。

**什么条件下必须重修**

- canary 要重新启用旧 TMA 前端；或
- 任何调用方开始调用 `/tg-api/auth/telegram` / `/tg-api/auth/bridge`；或
- 我方网关契约再变（上表四层差异全部要重新对齐）。

---

## KI-006 · `/tg/entry.php` 无 CSP（内容安全策略）头

**状态**：接受（2026-11-06，验收期发现，裁决人 team-lead）——**不阻塞验收的加固项**

**现象**

`webroot/tg/entry.php:12-15` 只发 4 个响应头（`Content-Type` / `Cache-Control: no-store…` /
`X-Content-Type-Options: nosniff` / `Referrer-Policy: no-referrer`），**没有
`Content-Security-Policy`**。全仓 `grep -rniE "content-security-policy|script-src|default-src"`
在 `webroot/tg/`、`webroot/include/`、`deploy/` 零命中（仅 `services/api/src/server.js` 与
`bridgeRoute.js` 有 CSP，那是旧 `/tma` 静态路由与旧登录桥落地页，与本页无关）。

该页会加载 `https://telegram.org/js/telegram-web-app.js`，并把 `initData` POST 到同源接口
`/tg-api/auth/telegram-web`。

**根因**

落地页是刻意最小化的 HTML 壳（不 include 火鸟内核），当时只考虑了"别把整站引导链拉进来"，
安全头按"能跑起来"的最小集给，CSP 没在范围内。

**影响范围与风险等级**

- 当前**页面无用户可控输入**（`role` 参数被白名单成 `customer`），反射型 XSS 无入口；
- 风险来自"以后有人往这页加任何渲染逻辑"——届时没有第二道防线，一次注入就能读走 `initData`
  （等于可重放登录凭证）。属于**低概率、高后果**，因此记为加固项而不是缺陷。
- 不影响登录功能、不影响验收任何一条。

**修法建议（未实施）**

在 `entry.php` 的 `header()` 段加：

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://telegram.org; connect-src 'self'; frame-ancestors https://web.telegram.org
```

- `frame-ancestors` **必须**显式放行 Telegram WebView（`https://web.telegram.org`），
  否则 Mini App 内嵌直接白屏——这是本项最容易踩的坑；
- 若将来引入 Google Maps 等外链，需同步加 `img-src` / `script-src` 白名单，
  否则是"加了 CSP 反而把页面弄坏"；
- 加完必须真机回归一次（TG 内打开 + 登录），不能只 curl 看头。

**什么条件下必须重修**

- `/tg/entry.php` 开始渲染任何用户可控内容（哪怕只是一个昵称）；或
- 该页引入第三方脚本（统计、地图、支付 SDK）；或
- 安全评审要求全站安全头统一。
