# PR 描述草稿：TMA 登录桥接 + 白名单代理 + 外卖/资讯前端

> 审核标准：按资金路径。下面第一段为白名单 diff，请先审这一段。

## 1. 白名单 diff（`services/api/src/fbProxy.js` · `WHITELIST`）

新增 7 个 waimai 会员级接口（匿名只读的 7 个展示类接口不变）。全部：仅登录会员（Bearer 令牌）、必须声明参数白名单、凭证由服务端注入、客户端 Cookie 与身份参数不转发。

| 接口 | 参数白名单（其余一律丢弃） | 护栏 |
|---|---|---|
| `waimai:getMemberAddress` | cityid, gettype, lat, lng, shopid | 按会话会员过滤；`id`/`userid`/`uid` 不透传 |
| `waimai:operAddress` | id, address, addressname, areaCode, default, lat, lng, mobile, people, person, street, tel | 编辑带 `id` 时先用同一凭证做归属预检，失败 404 且不转发写操作 |
| `waimai:delAddress` | id | 归属预检，失败 404 |
| `waimai:deal` | shop, address, paytype, order_content, preset, note, peitype, phone, desk, lng, lat, selftime, orderTime | 强制 `Idempotency-Key`；占位入共享库；**不透传** quanid、quantype、openlevel、level、usePinput、tprice、peerpay；失败 404 |
| `waimai:order` | page, pageSize, state, iscomment | `userid`/`store`/`courierset` 不透传 |
| `waimai:orderDetail` | id | 失败映射 404，不返回上游 body；骑手旁路由「不转发 Cookie」封死（有防回归测试） |
| `waimai:cancelOrder` | id | 失败映射 404 |

明确排除：`article:orderDetail`（无登录校验）、`getAddressDetail`（仅内部预检调用，不对外）、`pay`/`paySuccess` 等支付类。

## 2. 验收条件与对应测试

| 条件 | 测试 |
|---|---|
| 每个接口至少一条归属校验对抗测试（A 携带 B 的 ID → 403/404，不返回数据、不产生写入） | `services/api/test/fb-proxy-ownership.test.js`：orderDetail、cancelOrder、delAddress、operAddress、getMemberAddress、order、deal 各 1 条 |
| orderDetail 骑手旁路：不转发 Cookie 时匿名拿不到数据 | 同文件「orderDetail 骑手旁路」+「防回归：源码不得读取或转发客户端 Cookie」 |
| 上游 handler 归属过滤的事实依据 | 同文件「上游 handler 源码：7 个接口均按会话会员 uid 做归属过滤」 |
| `deal` 强制幂等键、同键不重复下单、失败不占位 | `fb-proxy.test.js`、`shared-state.test.js` |
| 前端不提交金额/优惠/积分字段，地址为空被拦截 | `apps/tma/test/checkout.test.mjs` |

## 3. 晋升门槛（不得跳过）

- canary 真机（Telegram 内打开 `t.me/fbird_men_bot/fbirdcanary`）走通：**下单 → 取消 → 地址新增/编辑/删除** 全链路，附记录后才可提晋升 PR。
- Helm / Traefik / 密钥引用走独立 PR，`tma.enabled` 默认 `false`，密钥只引用 secretName，revert 即回滚。

## 4. 其他变更摘要
- T2.1–T2.4 登录桥接（验签、令牌、`issue_session` 网关、前端登录流）；迁移 `002_tma_shared_state.sql`。
- `apps/tma` 前端（Vue 3 + Vant 4）：商家、菜单、购物车、下单、地址、订单；资讯列表与详情。
- 文档：`docs/internal/TMA_LOGIN_BRIDGE.md`。
