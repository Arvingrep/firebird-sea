# 模块域名/子目录配置不全 — 分诊结论（canary + demo）

> 2026-10-10 验收矩阵见 issue。本文只记录定位结论与处置清单，不含代码修复。

## 结论
- **非 Git 可修缺陷，主因是运行期数据**：模块入口域名/路径存于数据库表 `site_module`（`domainRules` / `catalogRules` 字段），
  由后台「系统-模块域名管理」维护；核心引擎为加密扩展（`webroot/huoniao.so`），仓库内无可改的路由代码。
- `configVars` / `configLock` 仅覆盖 `include/config/*.inc.php`，**不覆盖 DB 表**，所以 Git 发布不会修正这些值。
- canary 与 demo 共用同一站点（`values-canary.yaml` 的 ingress hosts 同时含 canary/demo），同库同配置，故行为一致。
- ingress 仅有 `canary(-admin).fbird.men` 与 `demo(-admin).fbird.men`：**任何改为「子域名」的模块都需要新增 DNS + 证书 + ingress host**，
  当前一个都没有，所以只填域名不够。

## 推荐处置（最小代价）
1. 后台把「资讯/分类信息/商城/装修/报刊/招聘/建站」等 **类型改为子目录并填路径**（如 `news`、`shop`），而非子域名；无需 DNS/证书/ingress 变更。
2. 「商家中心」子目录路径补填（如 `supplier`/`b`），登录后复测 `/supplier/job`。
3. 不打算上线的模块（baokan/jianzhan/fenlei/zhuang/zhaopin）在后台停用并隐藏入口。
4. `/shop` 500：需 canary 应用日志（php-fpm error log / 渲染中途抛错），先确认是否缺表或缺 `shop` 模块安装数据；待日志再定。
5. canary 验收通过后，同步 demo（同库则自动）与生产（manila/cebu 各自库需分别配置）。
6. 后续防回退：把 `site_module` 的期望值导出为 SQL 并纳入 `docs/internal/DB_MIGRATIONS.md` 流程。

## 待人工/运维
- 登录后台与 k8s 日志的权限不在本任务内：需运维读取 `/shop` 500 日志并在后台改配置。
