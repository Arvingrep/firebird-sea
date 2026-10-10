# 可写状态持久化（AD-17）

Story 1.6：Pod 是可随时重建的，凡运行期写入的状态必须落在持久化介质上。

| 状态 | 位置 | 介质 | 配置 |
|---|---|---|---|
| 商家上传图片/附件 | `/var/www/html/uploads` | 独立 PVC `firebird-uploads-<siteId>`（php-fpm 读写，nginx 只读挂载） | `values.yaml` → `uploads.*` |
| 站点配置 `include/config` | `/var/www/html/include/config` | PVC `firebird-config-<siteId>` | `persistence.*` |
| PHP 会话 | Redis | `session.save_handler=redis` | 环境变量 `REDIS_HOST` / `REDIS_PORT`（来自 `redis.*`） |
| 模板缓存/编译目录 `data/cache`、`data/templates_c` | `/var/www/html/data` | `emptyDir`（`webroot-shared`），重建即清空，可再生 | — |
| 日志 | stdout / stderr | PHP `error_log=/proc/self/fd/2`，php-fpm `catch_workers_output=yes`；nginx 官方镜像日志本就走标准输出 | `Dockerfile.base` |

## 说明
- 会话：入口脚本 `entrypoint-web.sh` 在 `REDIS_HOST` 非空且 PHP 已加载 `redis` 扩展时写入 `zz-session-redis.ini`；`Dockerfile.base` 通过 `pecl install redis` 加入扩展（需重建 firebird-base 镜像后生效，未重建时自动回退为文件会话）。
- 会话回退：入口脚本先用 `Redis::connect`（2s 超时）探活，不可达则保持文件会话并向 stderr 告警；`save_path` 带 `timeout=2`、`prefix=PHPREDIS_SESSION_<SITE_ID>:` 隔离站点，设置了 `REDIS_PASSWORD` 时追加 `auth`。
- `uploads.accessMode` 默认 `ReadWriteOnce`：模板在 RWO 时自动把 Deployment 改为 `Recreate`（避免新 Pod 跨节点挂载失败卡死发布）并不渲染 HPA（单副本）；manila/cebu/canary 均显式声明 `uploads`。要多副本/滚动发布，改 RWX 存储类并设 `accessMode: ReadWriteMany`，或改用对象存储（火鸟后台已有远程附件配置，`GCS_KEY_*`）。
- AC3 日志仅部分满足：PHP/php-fpm/nginx 日志走标准输出；火鸟 `data/log` 下的业务日志仍写本地文件（可再生数据，位于 emptyDir），转发到 stdout 另行立项。

## PHP → Pod 改造（P0 / P2）
**P0 — 配置与可用性**
- 配置同步：init 执行随 chart 发布的 `files/init-webroot.sh`（经 ConfigMap 注入，与镜像版本解耦）。对镜像出厂 `include/config` 里每个文件做三方比较，基线记在 PVC 的 `.image-baseline`：PVC 缺失 → 补入；后台没改过 → 跟随镜像更新；后台改过（或旧 PVC 无基线）→ 保留，镜像版本另存 `<file>.image-new` 并在日志告警，人工合并。比较时忽略 entrypoint 按环境变量注入的 `cfg_basehost / OBSKey* / mailPass`。`*.inc.php.example` 缺真实文件时自动生成。仅在 `persistence.enabled=true` 时有意义（当前三站均为 false，配置在容器层，随镜像走）。行为测试：`files/init-webroot.test.sh`。
- 深度就绪：`webroot/healthz.php`（不引导框架：配置文件齐全 + `DB_HOST` 可连），nginx 暴露 `/healthz.php`。`probes.deepReadiness: true` 时 nginx readinessProbe 走它；liveness 仍是静态 `/healthz`。默认 `false`——运行镜像不含该文件时新 Pod 会永远 NotReady。
- 发布冒烟：`job-smoke-test.yaml` 为 ArgoCD PostSync（wave 0），带站点 Host 头请求 `smokeTest.paths`，2xx/3xx 通过；上线通知 Job 为 wave 1，冒烟失败不会发出「已上线」。

**P2 — 去掉整站 `cp -a`**
- `webroot.mode: copy`（默认，旧行为）：init 把整站（~1.1GB / 3.4 万文件）复制进 emptyDir。
- `webroot.mode: baked`：代码直接来自镜像；nginx 用同 tag 的 `firebird-nginx` 静态镜像（`Dockerfile.nginx`：PHP 源码清空为 0 字节占位，剔除 `include/config`、授权文件、`.so`）；仅 `data/` 用 emptyDir 在 php-fpm（读写）与 nginx（只读）间共享，init 只播种约 15MB。
- CI 先推 `firebird-nginx:<sha>`，后推 `firebird-php:<sha>`：Image Updater 只盯 php tag，发现时同 tag 的 nginx 镜像必须已存在。
- 切换顺序：canary（已开）→ 验证 → manila → cebu。每站切换前确认 `firebird-nginx:<该站当前 image.tag>` 已在 GAR。
- 未做：`readOnlyRootFilesystem`。静态审计只能覆盖字面量路径（`log/`、`include/data`、`include/config`、`data/`、`upload*`），动态拼接的写路径无法穷举，需用真实流量审计后再收紧。

## 线上调查结论（2026-10-10，kubectl 实测）
| 项 | 结论 |
|---|---|
| uploads PVC | canary：0 文件；manila：0MiB / 11 inodes（均为空，且 PVC 创建不足 2 小时）。无历史文件需迁移 → 三站已 `uploads.enabled: false` |
| 附件存储配置 | `cfg_ftpType=3`、`cfg_OBSBucket=fbird-sea-uploads`（GCS）；`GCS_KEY_ID/SECRET`、`RESEND_KEY` 已注入（canary 实测；manila 同 Secret、同命名空间，exec 被权限策略拦截，未直接验证） |
| 会话 | canary `session.save_handler=files`，`redis` 扩展 **缺失**。根因：CI 只在 `firebird-base:7.4` 不存在时构建，该 tag 早于 redis 加入，从未重建。已改为 `7.4-r2`；上线后会话切到 Redis，**所有人需重新登录一次** |
| 运行期写路径（canary，~100 分钟真实流量） | `data/cache`、顶层 `templates_c/{compiled,admin}`、`log/`、`templates/` 少量文件。**未写** `include/config`、`uploads`，也没有浏览器可直接访问的生成物 → baked 模式（nginx 只共享 `data/`）成立 |
| init 复制耗时 | 实测 `cp -a` 约 9 秒，webroot 811MB / 3.7 万 inodes；Pod 从调度到 Ready 约 70 秒。P2 收益是省这 9 秒和每 Pod 811MB 临时盘，不是数量级的提速 |
| 镜像里的垃圾 | `webroot/data/sessions` 有 2800 个已提交的 `sess_*` 文件，随镜像发布。已加入 `.dockerignore` / `.gitignore`；仓库内需另行 `git rm -r --cached webroot/data/sessions` |
| 其它 | PDB `minAvailable:1` + 单副本 = 节点排空无法驱逐该 Pod；HPA 现为显式开关 `autoscaling.enabled`（默认 false），多副本前提是 Redis 会话 + 后台配置有唯一来源 |

## 多副本就绪：缓存 / 配置 / 拓扑（①–⑤）
**④ 后台配置的真源是 PHP 文件，不是数据库。** `admin/waimai/waimaiFenchengConfig.php`、`waimaiConfig.php`、`siteConfig.php` 等均用 `fopen("w")` 整文件重写 `include/config/*.inc.php`，没有 DB 副本。后台保存 = 改本 Pod 容器层里的文件。所以"多副本 + 后台可改"只有三条路：共享文件系统（RWX）、配置回写 ConfigMap 的 sidecar、或把关键键交给 Git。本期选最后一条（③），其余见"未解决"。

| # | 做了什么 | 位置 |
|---|---|---|
| ① | `cache-sweeper` sidecar：按 mtime（默认 5 分钟，每 60 秒）清扫 `data/cache/file_data`。`FileDataCache` 缓存配置类表的 SQL 结果、TTL=0 永不过期，且全仓库没有清理路径（后台"清除缓存"只删 `data/cache/*.json`），原先只靠重启 Pod 清空 | `fileCache.sweeper.*`、`_helpers.tpl` |
| ② | `memoryCache.redis.enabled`：entrypoint 按环境变量声明式把 `$cfg_memory` 写进 `dbinfo.inc.php`（与后台"站点缓存"页同格式）。原先后台保存的值写进该文件，而 entrypoint 每次启动都重写它 → 必丢。注意它只覆盖 `$HN_memory`（多语言包等），**不覆盖** `FileDataCache` | `memoryCache.redis.*`、`entrypoint-web.sh` |
| ③ | `configVars`：`{<file>.inc.php: {<var>: <value>}}` → ConfigMap → entrypoint 在 `.example` 兜底之后用 `apply-config-vars.php` 施加（原位替换保留 CRLF，缺失则追加；文件名与变量名白名单）。当前仅固定 `waimai.inc.php` 的 `custom_fencheng_*`，取出厂值，不改线上行为 | `configVars`、`configmap-vars.yaml` |
| ③+ | `configBackup`：PostSync（wave 2）把当时生效的 ConfigMap 内容连同镜像 tag、时间戳上传到 GCS：`gs://<bucket>/<prefix>/<site>/<UTC时间>-<image.tag>/<configmap>/<file>`。`bucket` 默认空 = 不渲染。**必须是私有桶**（uploads 桶公开读）；凭据复用 `firebird-storage-secret` 的 HMAC key，走 S3 兼容 API（`curl --aws-sigv4`） | `configBackup.*`、`job-config-backup.yaml` |
| ⑤ | `split.enabled`：nginx 与 php-fpm 拆成两个 Deployment，nginx 经 `firebird-php-<site>:9000`（FastCGI）直连 php。模板强制：`webroot.mode=baked` 且 uploads 不为 RWO。php Pod 刻意不带 `app=firebird-site` 标签，否则站点 Service 会把 HTTP 流量打进 :9000 | `split.*`、`deployment-split.yaml`、`service-php.yaml` |

**拆分不解决缓存与配置一致性**：二者是 php 进程的本地状态，与 nginx 是否同 Pod 无关；由 ①（陈旧有界）与 ③（声明式）处理。

### GitOps 配置锁（`configLock`，后台配置只读）
目标：**配置真源只在 Git，后台页面不能改，要改找管理员走变更。**

- **真源**：镜像里的 `include/config/*.inc.php`（来自本仓库）+ `configVars`（键级覆盖）+ `configOverrides`（整文件覆盖）。发布时 ConfigMap 内容备份到 GCS（`configBackup`）。
- **强制**：`CONFIG_LOCK=1` 时 entrypoint 在所有配置生成/注入之后，把 `include/config/*` 与 `dbinfo.inc.php` 置为 `root:root 0644`，目录 `0755`。php-fpm 以 www-data 运行，无法写入、重命名、新建。`configLock.writable` 里的文件名例外。
- **提示**：后台 48 个"保存配置"入口（30 个模块 `*Config.php` + 18 个站点级）写失败时统一输出 `写入文件 … 失败，请检查权限！`（`json_encode`，非 ASCII 被转义为 `\uXXXX`）。nginx 只在 `/admin/` 的 PHP 响应上用 `sub_filter` 把它替换为"该配置由 Git 管理变更并发布。"，原文与转义两种形态都处理；成功响应不受影响。已用真实 nginx 验证。
- **变更流程**：改 `values*.yaml` 的 `configVars` / `configOverrides`（或仓库里的配置文件）→ PR → CI → ArgoCD 同步 → 所有副本一致，且 GCS 留有当次生效内容。
- **只读之外的坑**：`admin/siteConfig/elasticSearch.php` 写失败时不报错（厂商代码），页面会显示成功但并未保存；`/admin/` 之外的入口（若有）会看到原始的"请检查权限"提示。
- **回滚**：`configLock.enabled: false` 并发布即可恢复可写。
- 不在锁内的写入：`data/cache`、`templates_c`、`log` 等运行期可再生目录。

### 未解决 / 已知限制
- **（未开启 `configLock` 时）后台保存的键不会实时同步到其他副本**；开启 `configLock` 后后台不再可改，该问题转化为"变更必须走 Git"。`configVars` 声明的键在每次 Pod 启动时被施加，但后台保存会整文件重写，保存后到下次重启前该 Pod 上的值可能与 Git 不一致；未在 `configVars` 声明的键（站点名称、Logo、SEO 等）仍然是每 Pod 各一份、重启即丢。要真正解决需 RWX 配置卷或"回写 ConfigMap"的 sidecar，本期未做。
- 在此之前多副本下**后台改配置只会落到随机一个 Pod**：建议生产保持单副本（`replicaCount: 1`、`autoscaling.enabled: false`），或只把后台域名 `admin.*` 指向固定 Pod。
- `FileDataCache` 的清扫是"有界陈旧"，不是失效通知：后台改了支付/域名/模块等配置，最多 5 分钟后其他副本才可见。
- 配置备份依赖备份桶的写权限；`failOnError: false` 时失败只打日志。该 S3 兼容签名路径**未在真实 GCS 上验证**（仅验证了脚本与模板渲染）。
- PRD 要求平台抽餐费 18% → 0% 与配送费 89% 的含义确认，仍需业务决策后改 `configVars`，不在本期。

## 测试
`services/api/test/writable-state.test.js`、`services/api/test/php-pod.test.js`（静态断言 Helm 模板、入口脚本与基础镜像；有 docker 时额外跑行为测试：`files/init-webroot.test.sh`、`deploy/docker/entrypoint-web.test.sh`）。

## 计划任务 CronJob（AD-18，Story 1.7）

`deploy/helm/firebird-site/templates/cronjob.yaml` 渲染 `fbs-cron-<site>`：每分钟（`* * * * *`）在与 php-fpm 相同的 PHP 镜像中执行 `php include/cron.php`，环境变量与 php-fpm 容器一致。

- `concurrencyPolicy: Forbid`：上一次未结束则跳过本周期，不并发重叠；`activeDeadlineSeconds: 55` 防止单次运行拖过一个周期；`restartPolicy: Never`、`backoffLimit: 0`（下一分钟自然重试）。
- 容器用 `args`（不写 `command`），保留镜像 ENTRYPOINT：`entrypoint-web.sh` 先生成 `dbinfo.inc.php`、注入 SITE_BASEHOST/GCS/RESEND 等配置，再 `exec php include/cron.php`。
- `persistence.enabled` 时挂载与站点 Pod 同一 `firebird-config-<site>` PVC 到 `include/config`（运营者后台改的运行期配置 cron 同步可见）；RWO 卷通过 podAffinity（app=firebird-site,site=<siteId>，topologyKey hostname）调度到站点 Pod 所在节点。启用 `configOverrides` 时另挂同一只读 ConfigMap。uploads 不挂载（cron 不写附件）。
- `include/cron.php` 随镜像自带：`deploy/docker/Dockerfile.web` 第 12 行 `COPY webroot/ /var/www/html/`，仓库 `webroot/include/cron.php` 存在。
- `startingDeadlineSeconds: 30`、resources requests/limits 已设；imagePullPolicy 取 `image.pullPolicy`（Always 时每分钟拉镜像，节点有缓存层、开销可接受）。
- cron 写到容器内 `log/cron/` 的日志随 Pod 销毁即丢，排障以 Job Pod 的 stdout/`kubectl logs` 为准。
- 运行态 AC（30 分钟未支付订单 → state 6）需人工在集群验收：`kubectl get cronjob,job -l app=firebird-cron` 与订单状态；并手动触发一次确认可执行：`kubectl create job cron-manual-test --from=cronjob/fbs-cron-<site>` 后查退出码与日志。
