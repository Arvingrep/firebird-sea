# 商家 Telegram 免密入口 · PHP 侧挂点与网关动作（方案 A）

> 生效日期：2026-11-10。裁决与事实依据：`.agent-runs/2026-11-10/task-001/brief-merchant.md`
> + `investigation-report-bridge.md` + `investigation-report-merchant.md`。
> 对应实现：`webroot/api/fbs/index.php`（网关动作）、`webroot/tg/entry.php`（落地页 role 分支）、
> `services/api/src/merchantRoute.js` + `tgLogin.js`（Node 侧）、`services/tg-bot/src/server.js`（入口）。
> 上线前的数据准备见 `docs/internal/MERCHANT_TG_ONBOARD.md`（生产 `waimai_shop_manager` 当前为空，
> 不补数据则所有绑定都会 404 MERCHANT_NO_SHOP）。

## 一、身份模型（与骑手的三个实质差异）

```
Telegram 用户 (tg_user_id)
   │  绑定：手机号匹配 member.phone（0/63/+63 三写法，两侧归一）
   ▼
火鸟会员 member.id ──(waimai_shop_manager.userid)──► waimai_shop (1..N)
   └─ 登录态：HN_login_user + HN_userid（+ HN_tg 标记），与顾客同一枚 cookie
```

| 维度 | 骑手 | 商家 |
|---|---|---|
| 身份表 | `waimai_courier`（自有账号） | `huoniao_member`（会员即商家） |
| cookie | `courier`（无前缀数字，7 天） | `HN_login_user`（与顾客同一枚，默认 100h） |
| 会话签发 | `/ql.html?token=` 一次性令牌 | 直接签会员 cookie（复用 `fbs_bridge_build_session_cookies`） |
| 映射表 | `fbs_courier_map` | `fbs_merchant_map`（**不带 shop_id**，一人多店由 /wmsj 页面切换） |
| 审计底账 | `fbs_bind_audit`（列名 courier_id） | `fbs_merchant_audit`（列名 member_id，不复用骑手表） |
| 归属校验 | `quit<>1 AND status=1` | `waimai_shop_manager` 有行且 `waimai_shop.del=0`（`status=0` 休息不拦） |

## 二、网关动作（POST /api/fbs/index.php，HMAC 头同骑手）

| 动作 | 入参 | 成功 data | 窗口 | 说明 |
|---|---|---|---|---|
| `merchant_bind` | `tg_user_id`, `phone`, `ip` | `{member_id, shop_ids, idempotent?}` | 宽窗 ±300s | 见「三、绑定规则」；不签任何凭证 |
| `merchant_session` | `tg_user_id`, `init_data_hash` | `{member_id, shop_ids, redirect:'/wmsj/', set_cookies}` | **紧窗 ±15s** | 只读解析既有会员 → 签会员 cookie；未绑定 404 `MERCHANT_NOT_BOUND` |

- `merchant_session` 并入紧窗档（返回活凭证），重放记账在动作内按 `init_data_hash` 走
  `fbs_gateway_replay_guard`（5 次/2h，同 `issue_session`），**不走** (body,ts) 一次性账本。
- `merchant_session` 的 cookie 全部复用现成件：`fbs_gateway_load_site_config`（fail-closed）→
  `fbs_gateway_replay_guard` → 刷 online → `fbs_bridge_build_session_cookies` →
  `fbs_gateway_marker_cookies`（补 `HN_tg`，否则 nginx 不给 /wmsj 注入 SDK+shim）。
  **一行 cookie 逻辑都没有新写。**

### merchant_session 与 issue_session 的唯一实质差异

会员解析换成了只读的 `fbs_gateway_lookup_merchant_member()`（查 `fbs_merchant_map` → member 行 →
复用 `fbs_gateway_member_guard` 的 state/is_cancellation 门禁）。绝不能用 `fbs_gateway_resolve_member`：
它会在 `username=tg_<id>` 不存在时**自动建空会员**，商家拿到「有 cookie 无店铺」，/wmsj 立刻弹
「您没有外卖店铺权限」。绑定行存在但会员行已消失（会员被删）属陈旧绑定：404 `MERCHANT_NOT_BOUND` +
error_log，**不自动清理映射行**（绝不静默顶替同样适用于清理）。

## 三、绑定规则（merchant_bind，与骑手 B1 完全同构）

1. **三维限频**（底账 `fbs_merchant_audit`，被拒请求不计入）：tg 5 次/60s、phone 3 次/300s、
   ip 20 次/300s。审计写失败 / 计数读失败一律 fail-closed 503 `AUDIT_UNAVAILABLE`。
2. **查人**：按归一后手机号查 `member`，库内 phone 先剥分隔符、入参展开 `0/63/+63` 三写法
   （与 rider_bind 同款 `REPLACE` 链）；`mtype IN (1,2)`（0=系统管理员、3=城市管理员不可绑）。
   0 行 → 404 `MERCHANT_NOT_FOUND`；>1 行 → 409 `MERCHANT_AMBIGUOUS`（`member.phone`
   **没有唯一索引**，绝不猜）。state/is_cancellation 走统一 `fbs_gateway_member_guard`。
3. **归属校验**：`waimai_shop_manager.userid = member.id` JOIN `waimai_shop` 且 `del=0`。
   0 家 → 404 `MERCHANT_NO_SHOP`。**只认 manager 表，不读 `waimai_shop.userid`**（脏列：
   canary 三行全是 1，全仓无业务读取）。`status=0` 是「店铺休息」，不拦。
4. **冲突检查**（绝不静默顶替）：同对 (TG, 会员) 幂等成功只刷 phone；本 TG 已绑别的会员 →
   409 `TG_ALREADY_BOUND`；该会员已被别的 TG 绑定 → 409 `MERCHANT_ALREADY_BOUND`。
5. **写入**：`INSERT INTO fbs_merchant_map(tg_user_id, member_id, phone)`；并发双插撞唯一键
   落审计 `result=error` 并 500 `BIND_FAILED`。

### 错误码表（Node 侧透传成落地页/JSON 文案）

| HTTP | `error.code` | 含义 |
|---|---|---|
| 400 | `MISSING_PARAM` | tg_user_id / phone 非法 |
| 403 | `MEMBER_DISABLED` / `MEMBER_CANCELLED` | 会员停用 / 已申请注销（审计归并到 not_found） |
| 404 | `MERCHANT_NOT_FOUND` | 手机号未匹配商家会员 |
| 404 | `MERCHANT_NO_SHOP` | 会员没有任何 del=0 的可管理店铺（绑定与会话都校验） |
| 404 | `MERCHANT_NOT_BOUND` | merchant_session：该 TG 还没绑商家 |
| 409 | `MERCHANT_AMBIGUOUS` | 同一手机号命中多个会员（数据问题，运营按手机号排查） |
| 409 | `MERCHANT_ALREADY_BOUND` / `TG_ALREADY_BOUND` | 绑定冲突（原绑定不动） |
| 429 | `BIND_RATE_LIMITED` | 三维度限频命中 |
| 500 | `BIND_FAILED` | 写库失败（含并发双插撞唯一键） |
| 503 | `AUDIT_UNAVAILABLE` | 审计/限频底账不可用，fail-closed 拒绝 |
| 429 | `REPLAY_LIMITED` | merchant_session 同一 initData 2h 内换签超过 5 次 |

## 四、Node 侧端点（/tg-api，验签与透传都在这层）

| 端点 | 说明 |
|---|---|
| `GET /tg-api/merchant/bind` | 绑定落地页（手机号表单 + initData 隐藏域，CSP/nonce 同骑手） |
| `POST /tg-api/merchant/bind` | 验签 → 归一 → `merchant_bind` → `merchant_session` → Set-Cookie + `302 /wmsj/`。Node 侧限频 10 次/分钟/IP（`TMA_MERCHANT_MAX`） |
| `POST /tg-api/merchant/session` | JSON `{initData}`；已绑定返回 Set-Cookie + `{bound:true, member_id, shop_ids, redirect}`，未绑定返回 `{bound:false}`（不是错误） |
| `POST /tg-api/auth/telegram-web` (`role=merchant`) | 顾客桥的 merchant 分支：已绑定商家一键进 /wmsj/；未绑定 404 `MERCHANT_NOT_BOUND`，entry.php 会无缝跳绑定页 |

契约清单见 `docs/api/openapi.yaml`（`/tg-api/merchant/*`）。`role` 白名单只有 `customer|merchant`，
其余（含 `courier`）一律 501——骑手有自己的落地页链路，不走这个端点。

### 铁律（实现/评审对照用）

- **绝不写 `fbs_member_map`**：那是收银台归属校验的唯一依据（`payOrderRead.js`）。商家写它会
  把该 TG 的顾客下单归属永久改掉。Node 侧 merchant 分支全程零 SQL，`member_map_synced` 恒 false。
- **绝不建号**：商家身份必须解析到既有会员；任何 find_or_create 路径都会产出空号。
- **cookie 原样透传**：值/属性只由 PHP 生成（bridge.php），Node 不增删改。
- **redirect 净化**：网关给的 `redirect` 过 `safeRedirect()`（只收站内绝对路径），默认 `/wmsj/`。
- **entry.php merchant 分支跳过 `/api/login.php?action=back`**：那一步按 `username=tg_<id>`
  重签 cookie，会把商家会话覆盖成顾客空号（本需求第一号陷阱，日志两边都是 200）。
- **手机号归一两侧同步**：Node `normalizePhone`（riderRoute 唯一实现，merchant 复用）⇄
  PHP `fbs_normalize_phone`；改一侧必须同步另一侧，`php-*-bind.test.js` 有逐字节矩阵钉住。

## 五、入口接线（bot / entry.php）

- bot：`/start` 按钮行「🏪 商家后台」+ `/merchant` 命令 → `${TG_APP_BASE_URL}/tg/entry.php?role=merchant`
  （必须 https）。web_app 按钮只在私聊合法。
- entry.php：role 白名单 `customer|merchant`；merchant 分支成功后直接 `location.replace(redirect)`；
  收到 404 `MERCHANT_NOT_BOUND` 时无缝 `location.replace('/tg-api/merchant/bind')`（同一 WebView
  内 initData 仍可用），首次绑定因此不需要用户找命令。
- 绑定成功但换会话失败：Node 返回 502 `MERCHANT_SESSION_FAILED`，文案明确「绑定已生效」，
  避免诱导换号重绑（重绑会撞 TG_ALREADY_BOUND / 限频）。

## 六、验收探针（Vic 用）

1. `role=merchant` 不再 501；已绑定商家 200 + redirect=`/wmsj/`，未绑定 404 后页面自动跳绑定页。
2. **cookie 覆盖回归**：登录后 `HN_login_user` 解出的 member_id = 商家会员（不是 `tg_<id>`）；
   entry.php 商家分支没有触发 `/api/login.php?action=back`。
3. `/wmsj/` 首屏不弹「您没有外卖店铺权限」（前提：`waimai_shop_manager` 已补数据）。
4. `fbs_member_map` 无新增行；`fbs_merchant_map` 幂等/冲突语义正确（同对刷 phone、换绑 409）。
5. `fbs_merchant_audit` 每次尝试一行，result 与实际一致；被限频请求 result=rate_limited 且不计入额度。
6. `api-contract-check` 过；`npm test` 全绿（php 组需 docker）；Go 镜像未实现（见遗留项）。
