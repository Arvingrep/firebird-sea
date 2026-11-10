# 员工 Telegram 绑定 · 邀请链接 + 免密进工作台（方案 B：纯 PHP，零 Node/Go 改动）

> 生效日期：2026-11-10。任务书与裁决依据：`.agent-runs/2026-11-10/task-002/brief-staff.md`。
> 对应实现：`webroot/include/fbs_staff_invite.func.php`（邀请 token）、
> `webroot/api/fbs/index.php`（网关动作 `staff_bind`）、`webroot/tg/staff.php`（免密落地页）、
> `webroot/api/handlers/member.controller.php`（后台 `staffInvite`）、
> `services/tg-bot/src/server.js`（`/staff` 与 contact 一键加入）、
> `services/api/migrations/011/012`（底账表）。

## 一、身份模型（与骑手/商家的关键差异）

```
Telegram 用户 (tg_user_id)
   │  绑定：手机号匹配 member.phone（fbs_normalize_phone 两侧归一）+ 邀请 token 定店
   ▼
火鸟会员 member.id ──(huoniao_staff.uid→sid)──► business_list（员工体系的店，≠ 外卖 waimai_shop）
   └─ 登录态：HN_login_user + HN_userid（fbs_bridge_build_session_cookies，与顾客/商家同一枚 cookie）
```

| 维度 | 骑手 | 商家 | **员工（本方案）** |
|---|---|---|---|
| 身份表 | `waimai_courier` | `huoniao_member` | `huoniao_member` + `huoniao_staff(uid,sid)` |
| 定店依据 | 无（平台骑手） | `waimai_shop_manager` | **邀请 token 携带 sid**（后台/手机号都定不了店） |
| 映射表 | `fbs_courier_map` | `fbs_merchant_map` | `fbs_staff_map`（含 staff_id/sid/phone） |
| 审计底账 | `fbs_bind_audit` | `fbs_merchant_audit` | `fbs_staff_audit`（多一列 sid） |
| 落地页 | `/ql.html?token=` | `/tg/entry.php?role=merchant`（Node 中转） | **`/tg/staff.php`（纯 PHP 进程内）** |
| 免密来源 | 一次性令牌 | 网关签发（Node 验 initData） | 落地页自验 initData（bridge.php 函数） |

**为什么员工不走 Node/Go**：商家链路有「输手机号」表单页，且 entry.php 不能 include
`common.inc.php`（swoole_loader + PHP 7.4 强耦合），所以验签落在 Node。员工的手机号来自
Telegram `request_contact`（bot 侧拿到后经网关写入），落地页没有表单——
`webroot/api/fbs/bridge.php` 是自包含纯函数库（验签/查库/签 Cookie/防重放全在），
`staff.php` 直接 `require` 它进程内完成全链路，引擎无关。

## 二、邀请 token（`fbs_staff_invite.func.php`，纯函数零依赖）

```
payload = "v1_" + sid + "_" + exp          # exp = unix 秒，ttl 默认 86400（24h）
hmac    = substr(hash_hmac('sha256', payload, $fb_bridge_token), 0, 32)
token   = payload + "_" + hmac             # 47 字符；staff_ 前缀 + token ≤ 64 字节
深链    = https://t.me/<botUsername>?start=staff_<token>
```

- 密钥 `$fb_bridge_token` 来自 `include/config/fbird.inc.php`（与骑手桥、网关同一份，不新造密钥）
- 校验 `hash_equals` 常量时间；`exp < now` 才算过期（**exp==now 仍有效**，bot 预检同口径）
- 签名/格式/过期一律返回 `false`/`''`，不抛异常；本文件禁止 require bridge.php（防双向依赖）
- **改 sid 等于换签名**：员工不可能靠改深链参数绑到别家店

## 三、网关动作 `staff_bind`（宽窗 ±300s，不签任何凭证）

| 入参 | 出参/错误 |
|---|---|
| `tg_user_id`, `phone`, `ip`, `token` | 200 `{staff_id, sid, title, idempotent?}`；403 `STAFF_INVITE_INVALID`/`STAFF_IS_BUSINESS`/`MEMBER_DISABLED`；404 `STAFF_SHOP_NOT_FOUND`/`STAFF_NOT_FOUND`；409 `STAFF_ALREADY_BOUND`/`STAFF_AMBIGUOUS`；429 `BIND_RATE_LIMITED`；503 `AUDIT_UNAVAILABLE`；500 `BIND_FAILED` |

- **错误码语义（2026-11-10 裁决后定稿）**：
  - `STAFF_ALREADY_BOUND`＝「这个员工已经加入了别的店」，覆盖三种触发：tg 已绑别店、
    会员已有 staff 行指向别店（含微信扫码通道先绑）、member 被**别的 tg** 占用
  - `STAFF_AMBIGUOUS`＝**唯一语义**：同手机号命中多个会员账号（引导联系客服/商家）
- 检查顺序：验 token（**先算签再查库**，非法 token 零 DB 查询）→ 查店 → 归一手机号 → 查会员
  → **map 底账**（tg/member 占用）→ **huoniao_staff 现有行** → 限频 → 写入 → 审计
- **写入是事务**：`huoniao_staff` INSERT + `fbs_staff_map` INSERT 包在同一
  `beginTransaction`/`commit`，撞 `uk_fbs_staff_map_member` 回滚后 409——
  否则并发双插会留下孤儿 staff 行，把该会员永久锁死成 AMBIGUOUS（真库实测复现过，已修）
- 幂等：同店重复绑 200，只 UPDATE phone，不插第二行；幂等请求的 'success' 审计行**会计入**
  后续限频额度（防的是暴力探测，不是正常重试——函数头注释已写明）
- 限频三维（底账 `fbs_staff_audit`）：tg 5 次/60s、phone 3 次/300s、ip 20 次/300s，
  `rate_limited` 行不占额度；bot 侧 `ip=tg_user_id`（空串会让限频按 Pod IP 塌缩成一个桶）
- fail-closed：审计写失败/计数读失败一律 503 `AUDIT_UNAVAILABLE`，且**无任何业务写入**
  （真库 `DROP TABLE` 实测 staff/map 均 0→0）
- 3 处注册齐全：白名单、**不在紧窗 in_array**（±300s）、显式 return 在 `issue_session`
  兜底之前——漏最后一支会兜底成 issue_session 按 `tg_<id>` 自动建号

## 四、落地页 `/tg/staff.php`（GET=壳 / POST=接口）

- `require bridge.php` 前先 `define('FBS_BRIDGE_TEST', true)` 跳过 bridge 末尾的顾客 HTTP 入口
  （bridge.php:910 既有机制）；**不 include `common.inc.php`**
- POST 链路：`parse_init_data` → `verify_signature(bot_token)` → `check_freshness`（3600s，
  与 `tgLogin.js` LOGIN_MAX_AGE_SECONDS 一致）→ `replay_check`（超限 429）→ `fbs_staff_map`
  查行 → 按 `staff_id` 复核 `huoniao_staff` 行仍在且 sid 未变（商家删行即失效）→ 取 member
  （state!=1 → `MEMBER_DISABLED` 且**零 Set-Cookie**）→ `fbs_bridge_site_config_strict()` →
  `fbs_bridge_build_session_cookies` 逐条 Set-Cookie → 302 `member?action=workPlatform`
- **cookieDomain 必须走 strict 版**（`fbs_bridge_site_config_strict`，bridge.php 纯新增）：
  cache `$cfg_cookieDomain` → env `FBS_GATEWAY_COOKIE_DOMAIN` → 都没有则 500 `CONFIG_MISSING`
  **绝不签发**。不能用 bridge 原版 `fbs_bridge_load_site_config`——它静默回落 host-only，
  在 canary baked 模式（data/ 挂 emptyDir、新版火鸟缓存里永远没有 cookieDomain）下
  会「签发成功但一进工作台就被踢回登录页」，且与网关双 Cookie 打架（真值比对实测）
- 域名列表与 merchant_session 天然同款同序（domain + www.domain 双份都来自
  `fbs_bridge_build_session_cookies` 本体）；平价有测试钉死（`staff-landing.test.js`）
- 表前缀从 `dbinfo['prefix']` 取并过 `[A-Za-z0-9_]` 正则再拼表名；`fbs_staff_map` 不带前缀
- 无重试按钮（同一份 initData 每提交扣一次重放额度，5 次锁 2h）；无表单、无 GET 参数、
  initData 不进 URL/日志/localStorage

## 五、后台入口 `staffInvite`（商家后台「员工管理」页）

- `member.controller.php` 新增 `elseif ($action == 'staffInvite')`（紧跟 addStaff），
  鉴权照 workPlatform：`$userLogin->getMemberID()` / `getMemberInfo()['userType'] != 2 → FORBIDDEN`
- `SELECT id,title FROM business_list WHERE uid=(int)$userid LIMIT 1`（uid 只来自 session，
  分支内零 `$_GET/$_POST`，不存在跨店越权）→ `fbs_staff_invite_link()` 返回
  `{sid, title, link, token, exp, bot_username}`；函数未就绪 → `NOT_READY` 不 fatal
- 模板（桌面 + touch 两版 business-staff.html）顶部加「Telegram 邀请」卡片：二维码
  （复用页面现成 jquery.qrcode + toUtf8）、只读链接框、复制按钮（clipboard → execCommand →
  prompt 三级兜底）、24h 有效期提示；`NOT_READY`/500/非 JSON 全部降级成
  「在 Telegram 里给机器人发送 /staff 获取邀请链接」，**绝不抛 JS 错误**
- 原有「员工扫码绑定商家」微信二维码通道一行未动，两通道并存

## 六、bot 链路（`services/tg-bot/src/server.js`）

- `/staff <token>` 或 `/start staff_<token>` → 本地形状预检（`v1_<sid>_<exp>_<hex32>`，
  正则与 PHP 逐字符一致）→ 内存 `staffPending`（15 分钟，单副本 Recreate 允许）→
  「邀请已确认」+ 单独一条消息发 `request_contact` 键盘（**reply_markup 二选一，必须拆两条**）
- contact 分支优先级：私聊守卫 → **红线 `msg.from.id === msg.contact.user_id`** → 手机号轻校验
  → **有 pending 走员工分支，无 pending 原样落既有 `cbind:r|m` 二选一（零回归）**；
  pending 过期读时清除并静默回落 cbind（不误报）
- 调 `staff_bind` 入参 `{tg_user_id, phone, ip: tg_user_id, token}`；失败保留 pending 可重试；
  错误码逐条中文文案，code 不透给用户
- 成功回「✅ 已加入 <title>」+ web_app 按钮 `/tg/staff.php`。
  **该条消息必须 `plainText`（不带 parse_mode）**：全局 `parse_mode: 'Markdown'` 下店名里
  一个未配对的 `_`/`*` 会让整条 400——绑定已成功但用户看不到回执（用例 25 用
  `Mala_Hot*Pot` 钉住）。`/staff` 裸发回「缺少邀请码」，不会被当成需求误转 n8n

## 七、已知口径差异（记录，不修）

1. merchant 落地链路多一枚 30 天 `HN_tg` marker cookie（nginx 给 /wmsj 注入 shim 的开关）；
   员工工作台在 `/member` 用不到，staff.php 不发
2. phone/ip 维度限频在 dispatch 路径部分不可达（多数错误在限频检查前短路返回）；
   防刷效果靠噪声审计行占额度，可接受
3. 网关 `fbs_gateway_load_site_config` 与 bridge 的 `fbs_bridge_site_config_strict` 目前是
   两份同逻辑实现（修 cookieDomain 阻断时为避免与事务修复撞 `index.php` 而未做委托重构）；
   平价测试钉住，后续如改 cookieDomain 逻辑须两处同步
4. webhook 网络层失败时 Telegram 重投 contact → 可能二次 `staff_bind`；同店幂等 200 兜底

## 八、上线与验收

- 迁移 011/012 随 API 启动自动执行（`fbs_migrations` 记账），无需人工
- bot 依赖 `FBS_GATEWAY_URL` / `FBS_GATEWAY_SECRET`（contact 一键绑定时已注入，无需新加）
- canary 验收探针：未绑定 tg 调 `staff_bind`（伪造 token）→ 403；`/tg/staff.php` GET → 200 HTML 壳；
  后台员工管理页 → 卡片出二维码与链接 → 扫码进 bot → 分享手机号 → 回「已加入」→
  「进入工作台」→ 工作台出现员工身份
