# W1 收尾与静态验收报告

> 智能体：W1 收尾与静态验收（仅配置/校验/文档，未碰业务代码，未 git commit）
> 仓库：/Users/arvin/Documents/firebird-sea ｜ 日期：2026-10-22

---

## 一、本次智能体实际改动（最小、可回退）

1. **configLock 开启** — `deploy/helm/firebird-site/values.yaml`
   - `configLock.enabled: false` → `true`，并同步修正该块注释（标注"已开启 + 上线前先完成会员折扣特权置 10"）。
   - 机制本就接好，无需臆造字段：`values.configLock.enabled` → `_helpers.tpl:41-46` 渲染 `CONFIG_LOCK=1` / `CONFIG_LOCK_WRITABLE` 环境变量 → `entrypoint-web.sh:132` 把 `include/config` 与 `dbinfo.inc.php` 置为 root 只读。开启后后台 48 个保存入口会失败，nginx 替换为"该配置由 Git 管理变更并发布"。
   - 已用 `helm template` 验证渲染未破坏（见第三节）。
2. **新增文档** — `deploy/sql/BACKFILL-RUNBOOK.md`（backfill 执行 runbook，含快照/预演/执行/4 校验/回滚）。

---

## 二、背景已确认事实（非本次改动，静态核验证据）

| 项 | 证据 | 结论 |
|---|---|---|
| nginx 拦 `/install/` | `configmap.yaml:75` `location ^~ /install/ { return 404; }`（`^~` 前缀防落入 php 正则） | ✓ |
| .dockerignore 排除 waimai 真实配置 | `.dockerignore:40` `webroot/include/config/waimai.inc.php` | ✓ |
| entrypoint `clearingswitch=1` 启动断言 | `entrypoint-web.sh:85-99`（非 1 → `exit 1` 拒绝启动） | ✓ |
| docker-compose 7 个 service `platform: linux/amd64` | 7 处声明；`docker compose config` 通过 | ✓ |
| values configVars 含 `customClearingswitch:1` 与 3/0/0 费率 | `values.yaml:66-71` | ✓ |
| 1534 个 `* 2.*` 副本已删 | live 树 ` 2.` 残留 = **0**；备份 tar `stale-copies-backup-2026-10-22.tar.gz` 存留这些 stale 副本 | ✓ |
| siteConfig 删除 withdraw 提现入口 | live `include/config/siteConfig.inc.php` 无 `withdraw`/`提现`（与背景一致） | ⚠ 见注 |

> ⚠ siteConfig 注：备份 tar 为 **stale-copies（删除的副本）** 而非改动前实时快照，无法据此反证"删除动作"，但 live 当前态符合预期。withdraw 入口也可能位于其他文件（后台菜单/template），建议业务侧二次确认。

---

## 三、全仓静态校验结果

| 校验项 | 命令 | 结果 |
|---|---|---|
| Helm 渲染 | `helm template firebird-site deploy/helm/firebird-site` | **PASS**（exit 0；渲染输出含 `CONFIG_LOCK`、`customClearingswitch 1`、`location ^~ /install/` 及 configLock 开启后的 `/admin/` sub_filter 块） |
| 编排合法性 | `docker compose config` | **PASS**（exit 0；仅 `version` 字段过时警告，无害，建议后续删除） |
| Node 语法 | `node --check services/api/src/*.js`（14 个文件） | **PASS**（全部 OK） |
| PHP lint — index.php | `php -l webroot/api/fbs/index.php` | **SKIP**（本机无 php 二进制） |
| PHP lint — waimai.class.php | `php -l webroot/api/handlers/waimai.class.php` | **SKIP**（本机无 php 二进制；文件 648KB，仅 lint 不跑） |
| Node 测试 | `cd services/api && npm test` | **SKIP**（无 test 脚本；以 `node --check` 替代） |

> 注：本机 `grep` 对 `\|` 交替模式偶发静默漏报，关键结论均以 Read 直接读文件 / `helm template` / `docker compose config` 渲染输出为准，未凭空采信。

---

## 四、上线 Runbook 要点（`deploy/sql/BACKFILL-RUNBOOK.md`）

脚本 `backfill-waimai-fencheng.sql` **唯一实际写操作**是 `UPDATE huoniao_waimai_shop SET fencheng_*`（仅费率列）；`is_vipdiscount`/`ptprofit` 仅只读 SELECT + 注释 UPDATE（需业务确认）；`privilege` 序列化字段**不**用 SQL 改（走后台/PHP）。符合"只 UPDATE 费率/特权字段、可回滚"纪律。

执行四步：
1. **快照**：`mysqldump --single-transaction` 全量 + 单表 `huoniao_waimai_shop` 落盘（回滚唯一依据）。
2. **预演**：只读副本跑 SELECT 取分布、预估受影响行数（= 店铺总数）、预览 ptprofit/is_vipdiscount 非零风险行；**副本上不写**。
3. **生产执行**：低峰 `mysql < /tmp/backfill.sql`；表前缀非 `huoniao_` 须先 `sed` 替换。
4. **4 条校验**：
   - ① privilege 仍可反序列化且 `waimai=10`（PHP 烟测脚本）；
   - ② 店铺 `fencheng` 全为 3/0/0（SQL，期望 0 行）；
   - ③ `is_vipdiscount`/`ptprofit`/`open_additional` 归零（SQL，期望 0 行；非零先业务确认再单独 UPDATE）；
   - ④ PHP `unserialize` 全表序列化列健康烟测。
5. **三处一致人工验证**（新测试店 → 下一单 → 结算明细 `ptyd=商品额×3%`）。
6. **回滚** = `source` 前述快照。

> ⚠ 禁止对 `*_all` 合并表写操作（MRG_MYISAM + INSERT_METHOD=LAST，写入静默落最后分表）。

---

## 五、上线前必须由人完成的动作清单

1. **DB 快照 + backfill 执行**：按 runbook 在目标环境执行（本环境无 DB 访问，未执行）。
2. **会员折扣特权置 10**：⚠ configLock 已开 → 后台无法改配置，须走 Git/configVars 或临时解锁后改，再用校验 ① 确认 `waimai=10`。
3. **本地 `docker compose up` 冒烟**：`compose config` 已过，需实跑验证站点/支付链路可用。
4. **fbs 建号验证**：Telegram Mini App 登录桥接（TMA_TOKEN_SECRET / FBS_GATEWAY_SECRET ≥16 字符已配）。
5. **configLock 实际生效确认**：生产 Pod 内 `ls -l include/config` 应为 root 所有、www-data 不可写；后台保存配置应报"该配置由 Git 管理变更并发布"。
6. **PayMongo BSP 合规**：若启用线上支付，确认 BSP 注册/合规状态（超出本智能体范围）。

---

## 六、变更文件清单（本次）

- `deploy/helm/firebird-site/values.yaml`（configLock.enabled → true）
- `deploy/sql/BACKFILL-RUNBOOK.md`（新增）
- `deploy/W1-ACCEPTANCE-REPORT.md`（本报告）
