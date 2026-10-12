# TMA 登录桥接（Epic T2，方案 P）

依据：`_bmad-output/planning-artifacts/epics-tma-frontend.md` T2.1–T2.4；Spike 结论见 briefs/brief-tma-frontend-2026-10-12/spike-report.md（P 已在 canary 证实）。

## 流程
TMA → `POST /tg-api/auth/telegram {initData}` → Node 验签 → 限频/防重放 → 网关（`webroot/api/fbs/index.php`）按 `tg_<id>` 查找或创建火鸟会员 → Node 写 `fbs_member_map` → 签发短期令牌。浏览器不接触火鸟 Cookie。

## 接口
| 路径 | 说明 |
|---|---|
| `POST /tg-api/auth/telegram` | 体 `{initData}`；成功 `{success, data:{token, expiresAt, memberId}}`；401 验签失败/过期；429 限频或同一 initData 重放超限；503 未配置 |
| `POST /tg-api/auth/logout` | 头 `Authorization: Bearer <token>`；吊销令牌 |

错误体：`{success:false, error:{code, message}}`。

## 验签规则（T2.1）
- HMAC-SHA256，常量时间比较；`auth_date` 超过 1 小时拒绝，未来超过 60 秒拒绝；必须有 `user.id`。
- **`signature` 字段参与 HMAC 数据串，不得剔除**（官方规范：HMAC 仅排除 `hash`；Ed25519 第三方验签才排除 hash 与 signature）。此处更正了 brief 安全要点第 1 条中"剥离 signature"的表述，该表述会令真实登录失败。

## 令牌（T2.2）
- 格式 `base64url(payload).base64url(HMAC-SHA256)`；payload：`sub`(tg_id)、`mid`(会员 id)、`env`、`iat`、`exp`、`jti`。
- 默认 TTL 900 秒（`TMA_TOKEN_TTL`）；`env` 与服务的 `TMA_ENV` 不一致即拒绝（canary 令牌不能用于 prod）。
- 吊销与限频状态在进程内，仅支持单副本（AD-18）；多副本前须改为共享存储。

## 环境变量（新增，仅服务端）
| 变量 | 服务 | 说明 |
|---|---|---|
| `TMA_TOKEN_SECRET` | api | 令牌签名密钥，≥16 字符 |
| `TMA_ENV` | api | `canary` 或 `prod` |
| `TMA_TOKEN_TTL` | api | 可选，秒 |
| `TMA_LOGIN_MAX` / `TMA_REPLAY_MAX` | api | 可选，登录限频（每 tg_id 每分钟）/ 同一 initData 每小时次数 |
| `FBS_GATEWAY_URL` | api | 例：`http://firebird-<site>/api/fbs/index.php`（集群内 ClusterIP） |
| `FBS_GATEWAY_SECRET` | api、php | 网关 HMAC 密钥，两侧一致，≥16 字符 |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | api | 映射与审计写库（经 mariadb 命令行客户端，与 `migrate.js` 相同） |

任一必需变量缺失时 `/auth/telegram` 返回 503，不影响其他路由。

## 网关（T2.3）
`POST /api/fbs/index.php?action=member_find_or_create`，头 `X-Fbs-Timestamp`、`X-Fbs-Signature`（见 GATEWAY_SPIKE.md）。先验签（时间偏差 ≤60 秒、`hash_equals`）再加载火鸟；幂等：`username = tg_<id>`；昵称固定 `TG_<id>`，不信任外部文本；会员 `regfrom='telegram'`；随机密码不外泄。外部访问 `/api/fbs` 由 Traefik 返回 403（AD-19）。

## 数据
`fbs_member_map(tg_user_id PK, member_id UNIQUE)`（已有迁移 001）；审计写 `fbs_audit`：`login`、`member_create`、`member_map`、`login_rate_limited`、`login_replay_limited`。

## 未包含（待排期）
- Helm 对上述环境变量与密钥的注入、api 镜像内 mariadb 客户端、PHP 容器的 `FBS_GATEWAY_SECRET`：涉及密钥与部署，需 Arvin 确认后再改。
- T2.4 前端登录流：随 apps/tma 脚手架（T4.1）落地，契约见 `apps/tma/src/auth.js`。
