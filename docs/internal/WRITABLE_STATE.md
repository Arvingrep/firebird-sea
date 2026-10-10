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

## 测试
`services/api/test/writable-state.test.js`（静态断言 Helm 模板、入口脚本与基础镜像）。
