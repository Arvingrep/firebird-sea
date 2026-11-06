# Canary 线上验收（部署后逐项核对）· Telegram Mini App 套用火鸟 H5

> 2026-11-05 · 团队 crew-tg-tma · 分支 `feat/tg-tma`
> 用法：在 canary 上按顺序做，每步记录"过/不过 + 现象"。不过的记在最后一节。
> 2026-11-06 线上验收后补 §八（判据修正）与 §九（实测基线）。本文只管**部署后的线上核对**；
> 本机 docker + `make local-accept` 的同构自测见 `LOCAL_ACCEPT.md`，两者读者与触发时机不同，不要混。

## 零、上线前必须由 ops 完成的四件事（不完成，后面全部验不了）

| # | 事项 | 怎么确认 | 不做会怎样 |
|---|---|---|---|
| 0.1 | `firebird-api-secret` 补 key `FBS_GATEWAY_SECRET`（两侧同值） | `kubectl get secret firebird-api-secret -o jsonpath='{.data.FBS_GATEWAY_SECRET}'` 有输出 | PHP 侧一律 503 `GATEWAY_SECRET_NOT_CONFIGURED`，登录服务"未正确配置" |
| 0.2 | **二者满足其一**：① `webroot/data/cache/config.php` 存在且定义 `$cfg_cookieDomain`；**或** ② php-fpm env `FBS_GATEWAY_COOKIE_DOMAIN` 非空（canary 由 values 的 `gateway.cookieDomain` 注入，值与 `tma.bridge.cookieDomain` 相同） | ① `ls -l` + 文件里出现 `$cfg_cookieDomain`；② `kubectl exec <pod> -c php-fpm -- printenv FBS_GATEWAY_COOKIE_DOMAIN` | 两级都拿不到才 500 `CONFIG_MISSING`（fail-closed，刻意为之）<br>**为什么不能只验 ①**：canary 是 baked 模式，`data/` 挂 emptyDir（Pod 重建即清空）；且新版火鸟已移除 cookieDomain 自定义（`siteConfig.inc.php` 无此变量，`common.inc.php:84` 注释"新版本不支持cookie作用域自定义"），缓存里永远不会有它 —— 只认缓存的写法在 canary 上必然 500 |
| 0.3 | `webroot/data/cache/fbs_bridge/` 存在且 php-fpm 可写 | `ls -ld`，属主与 php-fpm 运行用户一致；`sudo -u <fpm用户> touch` 试一次 | 防重放**静默关闭**（fail-open 无告警），`replay_limit_exceeded` 分支永不触发，看起来一切正常 |
| 0.4 | `tgBot.enabled` 只在 canary 打开，且确认**没有别的实例**在轮询同一 token | `kubectl get deploy -A \| grep tg-bot` 只有 canary 一个；本机 `docker-compose` 已停 | 两个 poller 抢 `getUpdates` → Telegram 409，机器人**随机不响应**（不是全挂，最难查） |
| 0.5 | canary 的**默认首页**必须是 `siteConfig` 或白名单内的模块，且不能是「数字型自定义模块」 | 查 `webroot/data/cache/config.php` 的 `$cfg_defaultindex` | 默认首页若指向被拦模块，首页会被白名单 302 走；若是数字型（把商家模块设为首页），会变成 302 → 再解析 → 404，**整站打不开**。这是白名单唯一能打不开站的组合 |
| 0.6 | 镜像里**不包含** `webroot/install/` 目录（`/install/index.php` 的自锁判的是 common.inc.php 是否存在，永远锁不上，见 KNOWN_ISSUES KI-002） | 进容器 `ls webroot/install` 应不存在；或公网直接访问 `/install/index.php` 应 404 | 任何人都可能把站点重装一遍 |
| 0.7 | nginx 启动日志里**没有** `duplicate MIME type "text/html"`（configLock 的 `sub_filter_types` 已去掉冗余项） | `kubectl logs <nginx-pod> \| grep -i duplicate` 应为空 | 只是告警不是错误，出现说明渲染的还是旧配置 |
| 0.8 | BotFather 的**菜单按钮** URL 已从旧的 `https://canary.fbird.men/tma/` 改成 `https://canary.fbird.men/tg/entry.php?role=customer`（`/setmenubutton` → 选 bot → 改 URL；名称与按钮文字不动，否则 Direct Link `t.me/fbird_men_bot/fbirdcanary` 会变） | BotFather 里查一遍；或点 `https://t.me/fbird_men_bot/fbirdcanary` 看进的是不是新首页 | 菜单按钮和 Direct Link 仍然打开**旧的 Vue 应用**（验收通过后要删的那套），代码全对也过不了验收第 1 条 |

## 一、先抓基准（只做一次，5 分钟）

在 canary 上用**手机浏览器**（不是 Telegram）正常登录火鸟会员，开发者工具里把响应头抄下来：

```
HN_login_user = <原样>
HN_userid     = <原样>
Path / Domain / Expires / HttpOnly / Secure / SameSite 全部记下
```

**这一步是整份清单的地基**：它是"免密登录就是登录"的唯一证据。安全的那份代码只能对着源码比，对不了真实响应。

预期：Telegram 登录后写出的 `HN_login_user` / `HN_userid` 与此**逐字段一致**（值不必相同，但编码形态、Path、Domain 的两份、SameSite 分支必须一致）。

## 二、本阶段可验的 4 条（第 1、6、7 条 + 第 3 条的下单回归）

### A1 · 免密登录（验收第 1 条）

1. Telegram 找 bot，点 `/start` 里的「🛒 打开商店」按钮
2. 预期：直接进 H5 首页，**无任何登录页/输入框**，头像/余额等已是登录态
3. 不过时看：落地页是否停在"请关闭本页面，在 Telegram 中重新打开" → 说明 `/tg-api/auth/telegram-web` 失败，取错误码（`INVALID_SIGNATURE` / `MEMBER_DISABLED` / `GATEWAY_UNAVAILABLE` / `CONFIG_MISSING`）
4. **不要点"重试"**（落地页已经故意不给这个按钮）：同一份 initData 每提交一次都扣一次重放额度，5 次内会被锁 2 小时。**关闭页面重开**才能拿到新 initData

### A2 · 无重复顶栏与返回键（验收第 6 条）

1. 依次进：外卖首页 → 外卖列表 → 商品详情 → 购物车 → 下单页
2. 预期：**看不到火鸟自带的顶栏**（没有第二排返回箭头/标题栏）；Telegram 左上角返回键始终只有它一个
   （用命令行验证注入时**必须带 `Cookie: HN_tg=1`**，否则 0 次是正常的——见 §8.1）
3. 首页时返回键**消失**（由 Telegram 关闭 Mini App）；进到二级页返回键**出现**，点它逐级回退
4. 对外链（商家电话 `tel:`、地图、站外链接）点一次：应在系统浏览器/地图 App 打开，且**能回到 Mini App**
5. 上下滑动列表页：**不应误关** Mini App
6. 不同模块的顶栏颜色应随模块变（外卖红、旅游黄、骑手青），且**不跟随 Telegram 深色主题**

### A3 · 登录态保持与退出（验收第 7 条）

1. 关掉 Mini App 再打开 → 仍是登录态，不重新登录
2. 在 H5 里点"退出登录" → 清 cookie
3. 再关掉重开 → 自动重新免密登录（不要求输入任何东西）

### A4 · 下单回归（验收第 3 条的前提）

本阶段不新增下单逻辑，但要确认**没被破坏**：
1. 外卖：浏览 → 加购 → 下单到支付页（**不必真付**）
2. 跑腿：`addressPaotui` → `paotui-buy` 走一遍到下单页
3. 预期：与手机浏览器里的行为一致，无白屏、无 JS 报错
4. 重点看：下完单后**收银台能正常打开**（这条是 `fbs_member_map` 的端到端验证——之前有过"能登录但下单 403"的缺陷）

## 三、只能人眼确认的 8 条（shim 里标了 `pendingConfirm`）

**高风险 3 条**（骑手端，数值是算术推导，必须眼看）：

| # | 页面 | 看什么 |
|---|---|---|
| R1 | 骑手工作台 `index` / `history` | tab 条是否紧贴顶部、下方不留空、不压住统计卡 |
| R2 | 骑手 `statistics` | `.countBoxMonth` 上方留白是否自然（推导值 1.08rem） |
| R3 | 骑手 `mypocket` / `comment` | 顶部 `.88rem` 清零后有无 1px 级空隙或裁切 |

**低风险 5 条**（一律未动，只需确认"没变丑"）：

| # | 页面 | 说明 |
|---|---|---|
| L1 | 外卖 `search` | 顶栏是 `.search > i.goBack`，未纳入隐藏，确认不为空 |
| L2 | 外卖 `address` | 单行 include 会员侧模板，未盘点 |
| L3 | 旅游 `payreturn` | 无公共顶栏 |
| L4 | 旅游 `visacountry-detail` | 自有 `.topnav` 浮动圆钮，`position:fixed;top:.2rem`（`visacountry-detail.css:29`）。**风险高于同级其余四条**：固定定位会落到 Telegram 顶栏覆盖区里，浮动返回钮可能被压住。兜底是 shim 已注册的原生返回键，用户不会卡死；若遮得难看，再补 `.topnav` 的 `top` 补偿 |
| L5 | 骑手 `detail` | 已按 `.page_detail .headbox` 整条隐藏。完结态露出流内标题栏的问题已修（无头 Chrome 实测 `.orderInfo` 顶距落在 `margin:.3rem` 上，不贴边）；未完结态零布局变化 |
| L6 | 会员子域 + `login.html` 路径 | business 放行后本条已关闭（`/wmsj/login.php` 本就是正式入口，同一套鉴权，无新增泄漏面）。若还想看，确认渲染的是正常商家登录页即可 |
| L7 | 首页 `skin5` 的硬编码模块入口 | `skin5/index.html:440-461` 是**不经过模块表、无条件渲染**的楼盘入口（见 KNOWN_ISSUES KI-004）。模块停用后入口照旧显示，点了 302 回首页，观感是「点了没反应」。若 canary 用 skin5，确认这几处是否可见——可见则验收第 2 条「其它模块不可见」在字面上不成立，需要你决定删模板行还是记为已知差异 |

另外两条只需看一眼：外卖 `list` 首屏筛选条是否贴顶且不压首条商品；旅游 `ticket` 同上。

## 四、本阶段**验不了**的 3 条（别浪费时间去点）

| 验收条目 | 原因 |
|---|---|
| 第 2 条后半「其它模块 URL 直接输入打不开」 | 白名单代码已实现并覆盖**四个独立入口**（`index.php` / `website.php` / `special.php` / `wmsj/` 商家端），开关 `FBS_TG_SERVICE_WHITELIST=0` 可一键退回；但**要等镜像带上这次改动才验得了**。另外前半「首页导航只出现四个入口」靠的是**在 canary 后台手动停用其余模块**——白名单管的是 service 名能不能打开，模块没停用时首页导航照样渲染出其他入口，用户点了会被 302 弹回首页，观感更差 |
| 第 4 条「骑手点『骑手接单』首次绑手机号」 | 属第 4 步，未开工（bot 无 `/rider`、无 `fbs_courier_map`、无 `issue_courier_session`） |
| 第 5 条「派单后 10 秒内收到 bot 消息」 | 属第 5 步，未开工（`sendapppush()` 分支未写） |

## 五、不过时怎么记

每条记三样：**哪个页面 / 看到什么 / 期望什么**。特别是顶栏相关，附一张截图 —— 选择器问题只看文字描述无法判断是"没隐藏"还是"隐藏了但留白没跟上"。

## 六、一条会咬人的版本号约定

`tg-shim.js` 在 nginx 注入串里带 `?v=`，而 `*.js` 有 30 天 `expires`。**下一次只要动了 `tg-shim.js` 的任何行为，必须同时把 `configmap.yaml` 里注入串的 `?v=` 加一**。否则已经进过 Telegram 的用户在 30 天内一直吃浏览器缓存里的旧文件，你在 canary 上怎么试都是新的、用户那边怎么试都是旧的。

当前是 `?v=2`（因为补了骑手订单详情页的标题栏隐藏）。在此之前 `v1` 从未上线过，所以这一次加一不涉及"老用户缓存"问题；但从 `v2` 往后每一次行为改动都必须递增。

## 七、一条已裁决的例外（不再待定）

**`business`（商家端）经产品裁决放行**（2026-11-06）。原因是拦掉之后商家自己的网页后台整体不可用：
会员中心里「全部订单 / 待接单 / 商品管理」PC 8 处 + 移动 4 处跳转全部 302 回首页，
订单角标 AJAX 静默失败，app push 里的订单详情链接也是 302，而这一期商家没有别的接单入口。

因此验收第 2 条要按下面这个口径判，**不要**把它记成缺陷：

| 现象 | 判定 |
|---|---|
| 首页导航只有外卖/跑腿/资讯/旅游四个入口 | 必须成立（靠后台停用其余模块） |
| 直接输入 `?service=shop` / `video` / `house` 等 | 必须 302 回首页 |
| 直接输入 `?service=business` 或访问 `/wmsj/` | **能打开**（已裁决的例外） |
| 顾客、骑手链路 | 零影响（Vic 复核：模板里只有 5 处引用 `/wmsj/`，4 处是商家自己的跳转，1 处是顾客跑腿页引的 CSS，走静态直出不触发守卫） |

已知观感差异：商家端没有做 Telegram 适配，页面里仍会有火鸟自己的顶栏与返回键，与 Telegram 原生返回键并存。
商家端不在本次五块适配范围内，不做处理。

**另一条边界（不需要裁决，只需知道）**：`service=business` 现在是「页面放行、接口也放行」，
但 `include/ajax.php?service=business&action=*` 从一开始就没接守卫——顾客全站搜索、
地图、店铺列表都在调它，拦了这些功能会当场死。

## 八、判据修正（2026-11-06 线上验收暴露，**下次照本节判，别照旧期望**）

这一轮 6 PASS / 0 FAIL / 2 待运维，但验收过程中有 5 处「期望值写错、差点把正常判成
FAIL」。全部是判据问题，不是代码问题。留档，避免下一轮复现。
（8.6 是修复「桌面 TG 落 PC 模板」之后**新增**的判据，8.7 是 2026-11-06 缓存头复核的结论，
两者都不属于上面这 5 处。）

### 8.1 顶栏去重（shim 注入）必须带 `Cookie: HN_tg=1`

`deploy/helm/firebird-site/templates/configmap.yaml:15-18` 的
`map $cookie_HN_tg $fbs_tg_head`，**默认分支就是 `</head>`**：

```
map $cookie_HN_tg $fbs_tg_head {
    default        "</head>";
    "1"            '<script …telegram-web-app.js></script><script …/tg-shim.js?v=2></script></head>';
}
```

无 cookie 时替换串 == 匹配串 ⇒ `sub_filter` 什么都不做，**原样输出**。

- ❌ 错误判据：直接 `curl` 页面数 `tg-shim.js` 出现次数，0 次就判"注入没生效"。
- ✅ 正确断言：带 cookie 时，以下两者**各恰好 1 次**：
  ```bash
  curl -s -H 'Cookie: HN_tg=1' 'https://canary.fbird.men/' \
    | grep -o 'telegram-web-app.js' | wc -l     # 期望 1
  curl -s -H 'Cookie: HN_tg=1' 'https://canary.fbird.men/' \
    | grep -o 'tg-shim.js?v=2'     | wc -l      # 期望 1
  # 反向对照（证明 cookie 是开关，而不是"到处都注入"）：不带 cookie 应各 0 次
  curl -s 'https://canary.fbird.men/' | grep -c 'tg-shim.js'   # 期望 0
  ```
- 前提：cookie 由 PHP 网关登录成功后种下（前缀 `HN_` 是火鸟硬编码），所以先走一次登录再测。

### 8.2 entry 页**没有** CSP，只有 4 个响应头

`webroot/tg/entry.php:12-15` 只发这 4 个：

| 响应头 | 值 |
|---|---|
| `Content-Type` | `text/html; charset=utf-8` |
| `Cache-Control` | `no-store, no-cache, must-revalidate` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |

全仓 `grep -rniE "content-security-policy|script-src|default-src"` 在 `webroot/tg/`、
`webroot/include/`、`deploy/` **零命中**（CSP 只存在于 `services/api/src/server.js` 与
`bridgeRoute.js`，那是旧 `/tma` 静态路由与旧登录桥落地页，与本页无关）。

- ❌ 错误判据：断言响应含 `Content-Security-Policy` → 必然 FAIL。
- ✅ 正确断言：上面 4 个头的值逐项比对，**并确认没有第 5 个安全头**（有则说明走错路由/旧镜像）。
- 缺 CSP 已记为 `KNOWN_ISSUES KI-006`（不阻塞验收的加固项）。

### 8.3 api 版本探针必须用 **POST**

`services/api/src/server.js:127` 是 `router.post('/auth/telegram')`。

- ❌ 错误判据：`curl https://canary.fbird.men/tg-api/auth/telegram` → 恒 404，无判别力
  （404 可能来自"路由没挂"也可能来自"GET 不匹配"，两种情况分不开）。
- ✅ 正确断言：
  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' -X POST \
    -H 'Content-Type: application/json' -d '{"initData":"x"}' \
    https://canary.fbird.men/tg-api/auth/telegram      # 期望 503
  ```
  503 + `AUTH_NOT_CONFIGURED` = 新镜像已生效且 `tma.enabled=false` 已生效
  （`buildAuth()` 因缺 `TMA_ENV` 返回 null）。
  **仍 502** = 旧链跑起来了但契约不匹配（入参被网关 400）→ 镜像旧或 values 没跟到。
- 配套 php 版判据（与新镜像强相关）：`/tg/entry.php` 从 **404 变 200**。
  两个同时成立才说明"镜像 + values"都到位；只有 entry 200 而 auth 仍 502 = 只换了镜像。

### 8.4 孤儿端点的期望值（别一律当 503）

| 端点 | 期望 | 原因 |
|---|---|---|
| `/tg-api/fb/*` | **404** | `FB_UPSTREAM_URL` 为空时 `server.js:156` 的整个代理块**不挂载**，不是"挂着但拒绝" |
| `/tg-api/auth/telegram-web` 缺配置 | **500 `GATEWAY_SECRET_NOT_CONFIGURED`** | 路由已挂载，处理器内部判缺失 → 500，不是 503 |
| `/tg-api/auth/telegram`（`tma.enabled=false`） | **503 `AUTH_NOT_CONFIGURED`** | `buildAuth()` 返回 null，路由在、装配不在 |

三者是三种不同的故障语义，混着判会得出相反结论。

### 8.5 env 计数口径：8 个（不是 9）

`deployment-api.yaml` 守卫修正后，values / manila / cebu 三份**生产** values 的 api 容器
新增的是 **8 个**变量名：

```
DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD TRUST_PROXY_HOPS CORS_ORIGINS TMA_TOKEN_SECRET
```

- 第 9 个 `FBS_GATEWAY_SECRET` 在旧模板的 `tma.enabled=true` 分支里**本来就渲染**
  （只是重复了一次），所以它不算"新增变量名"，只算"去掉一次重复"。
- 若按「集合差」口径（旧模板 + `tma.enabled=false` 的渲染 vs 新模板）会得到 9 ——
  两种数都对，但**报数必须带基线**（是"集合差"还是"模板行数差"），否则又是"两边都没错、结论相反"。

### 8.6 桌面版 Telegram 也必须进 H5（2026-11-06 修复，判据两向）

桌面版 Telegram 的 WebView 上报的是**桌面浏览器 UA**，`isMobile()`
（`webroot/include/common.func.php:4292`）原先纯靠 UA 判定 → false →
`webroot/index.php:1027` 的 `$template."_touch.html"` 分支不命中 → TG 用户落到 PC 模板
（`topInfo w1200`）。修复：登录桥（`webroot/api/fbs`）成功后本来就会种
`HN_tg=1`（30 天，域与登录 cookie 同取），`isMobile()` 现在**先认这个 cookie**
（`common.func.php:4293`，守卫 `=== '1'`，只加一行，UA 正则一字未动）。

- ❌ 错误判据（只测正向）：带 `HN_tg=1` 拿到 H5 就判过 —— 掩盖"全站都变 H5"的故障。
- ✅ 正确判据：**四条同时成立**才过（同一桌面 UA 打两次，只差一条 cookie）：

  ```bash
  UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  # TG 用户（登录桥已种 cookie）→ H5
  curl -s -A "$UA" -H 'Cookie: HN_tg=1' https://canary.fbird.men/ | grep -c 'name="viewport"'   # 期望 1
  curl -s -A "$UA" -H 'Cookie: HN_tg=1' https://canary.fbird.men/ | grep -c 'topInfo w1200'      # 期望 0
  # 普通桌面浏览器（无 cookie）→ 仍是 PC
  curl -s -A "$UA"                 https://canary.fbird.men/ | grep -c 'name="viewport"'   # 期望 0
  curl -s -A "$UA"                 https://canary.fbird.men/ | grep -c 'topInfo w1200'      # 期望 1
  ```
  `name="viewport"` 与 `topInfo w1200` 的模板出处：
  `webroot/templates/siteConfig/touch/skin4/index.html` 与
  `webroot/templates/siteConfig/top1.html:80`。
- 顺带一条别再踩的坑：`isMobile()` 的正则**没有 `/i`**、主体已 `strtolower`，所以
  `AppleWebKit`、`Windows\s+Phone`、`Nokia` 等大写词是**死词**。桌面 Chrome 的 UA 里
  明明带 `AppleWebKit`，仍然判 false。别把它"修"成 `/i` —— 那会改变线上全站模板选择；
  本次走的是 cookie 短路，不是改 UA 判定。
- 值守卫：`HN_tg=0` 或任何非 `1` 的值都不触发（`isset` + `=== '1'`），
  所以清 cookie / 覆写成 0 就能回到原判定，线上可随时回退。

**采样纪律：单次 curl 不足以判 FAIL，两向各连续 3 次一致才算过。** 滚动窗口期内旧 Pod
仍在应答，2026-11-06 实测：前 8 次全是 PC 页（66101B），第 9 次才翻转，中间还回跳过一次。

```
with    HN_tg=1  run1/2/3  bytes=48485  viewport=1  w1200=0
without          run1/2/3  bytes=66102  viewport=0  w1200=1
```

bytes 与 viewport / w1200 三个数一起看（单看 bytes 会被压缩差异骗，单看 viewport 分不出
"PC 模板加了 meta" 这种改动）；三次不一致就再等一轮滚动，别急着判回归。

### 8.7 缓存头：静态 30 天是设计，动态页**本来**就没有长缓存（2026-11-06 复核，不改配置）

2026-11-06 有反馈称「HTML 响应头也是 `cache-control: max-age=2592000`」。复核结论：
**canary 上复现不出来**，30 天只挂在静态资源上，而且这是有意为之。仓库里 `expires` 全仓
只有一处 —— `deploy/helm/firebird-site/templates/configmap.yaml:70`：

```nginx
location ~* \.(jpg|jpeg|gif|png|css|js|ico|webp|svg|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}
```

三点必须知道：

- 正则**不含 `html|htm`**，HTML 请求根本不会命中这条 location；server 级没有 `expires`，
  也没有第二处 `add_header Cache-Control`；全仓 `grep -rn 2592000` 零命中。
- HTML/PHP 侧的 `no-store, no-cache, must-revalidate`（外加 `expires: Thu, 19 Nov 1981`）
  是 PHP 会话缓存限制器发的，不是 nginx；`location ~ \.php$` 只做 `sub_filter` 注入，不动缓存头。
- 所以**不要**为了「给 HTML 补 no-cache」再加规则：`add_header` 是追加语义，PHP 已经发过的
  `Cache-Control` 会变成两条；而 `location ~* \.(html|htm)$` 会抢在 `location /` 之前命中
  `/index.html`，把现在靠 `try_files` 落到 index.php 的路径变成 404（真要加必须自带
  `try_files $uri $uri/ /index.php?$args;`）。

2026-11-06 实测（`curl -sS -D - -o /dev/null`，已去 `\r`）：

```
/                               200  text/html      no-store, no-cache, must-revalidate    cf=DYNAMIC
/index.html                     200  text/html      no-store, no-cache, must-revalidate    cf=DYNAMIC
/tg/entry.php                   200  text/html      no-store, no-cache, must-revalidate    cf=DYNAMIC
/static/css/core/touchBase.css  200  text/css       max-age=2592000 public, no-transform    cf=BYPASS
/static/js/tg-shim.js?v=2       200  javascript     max-age=2592000 public, no-transform    cf=BYPASS
```

（`/news/`、`/waimai/`、`/tg/entry` 与上面前三条同值，不重复列。）

**复测甄别三项** —— 再遇到「HTML 有 30 天缓存」，先按这三条排除，别直接改配置：

1. **给 URL 原文**：`curl -sS -D - -o /dev/null '<url>' | tr -d '\r'`，输出必须带
   `cf-cache-status`。`2592000` 与静态 location 是精确对应，若 `content-type` 是
   `text/css` / `javascript`，那就是静态资源命中，不是 HTML。
2. **看 `content-type`**：`text/html` 才可能是动态页；`text/html` + `max-age=2592000`
   在当前 chart 下**产不出来**，出现即说明中间还有一层（Cloudflare Cache Rule / 反代）在改头。
3. **区分 curl 与 devtools**：devtools 的 Size 列若是 `(disk cache)` / `(memory cache)`，
   显示的是**本地旧副本的响应头**，不代表线上现值；`cf-cache-status: DYNAMIC` 才说明没被边缘缓存。

## 九、已实测通过的线上基线（2026-11-06，下次拿它做对照）

比读期望值可靠：下面全部是当天在 canary 上真实跑出来的数字。

| 探针 | 实测结果 | 含义 |
|---|---|---|
| `GET /tg/entry.php?role=customer` | **200 / 4238 bytes** | 新镜像已含落地页 |
| `GET /tg/entry`（nginx 短链 rewrite） | **200** | `location = /tg/entry { rewrite ^ /tg/entry.php last; }` 生效 |
| `GET /api/fbs/index.php` | **403** | 网关要求 POST + HMAC，浏览器直开被拒（预期，不是故障） |
| 带 `Cookie: HN_tg=1` 的首页 | `telegram-web-app.js` = **1**、`tg-shim.js?v=2` = **1** | `sub_filter` 注入生效 |
| 不带 cookie 的首页 | 两者 = **0** | 注入是 cookie 门控，非无条件 |
| 2026-11-06 真机首登 | **500 `CONFIG_MISSING`**（用户点菜单按钮即复现） | 当时网关只认 `data/cache/config.php`；已修：三级取值 cache → `FBS_GATEWAY_COOKIE_DOMAIN` → 500。修后判据见 §0.2 |
| 2026-11-06 桌面版 Telegram 点菜单按钮 | 落到 **PC 模板**（`topInfo w1200`、无 viewport） | `isMobile()` 当时纯 UA 判定，桌面 WebView 上报桌面 UA；本次修复：认 `HN_tg=1` 短路。判据见 §8.6 |
| 2026-11-06 缓存头复核 | `/`、`/index.html`、`/tg/entry.php` 全为 `no-store, no-cache, must-revalidate`；`/static/css/core/touchBase.css` 为 `max-age=2592000 public, no-transform` | 动态页不长缓存、静态 30 天是设计；判据与甄别见 §8.7 |
| 被拦模块（如 `?service=shop`） | **302**，`Location` 带 `from=tg_whitelist` | 白名单守卫生效且可区分来源 |
| `/shop?from=tg_whitelist` | **404** | 防止 302 回首页再解析成 302 的循环（守卫带豁免标记） |

判定方法：**数字一致 = 链路没坏**；不一致再按第一节到第八节逐项定位，不要先怀疑代码。

