# 模块域名 / 子目录配置修复手册

## 背景
canary / demo 全站验收发现：资讯、分类信息、商城、装修、报刊、招聘、建站等模块在后台
「系统 → 模块域名管理」为「子域名」类型但域名留空，入口全部死链；商家中心为子目录类型但路径留空；`/shop` 渲染中途 500。

## 配置存放位置（不在 Git）
- 模块域名/子目录：数据库 `domain` 表（后台「模块域名管理」读写），各模块 `include/config/<模块>.inc.php` 的 `$customSubDomain`（当前均为 2）。
- 因此修复**不是改代码**，而是改各站点数据库/后台，并保证 DNS、证书、IngressRoute 齐备。
- canary 开启了 configLock，后台保存会被拒绝；模块域名在 `domain` 表，需运维直接改库或临时关锁。

## 推荐方案：统一改为「子目录」（无需新增 DNS/证书）
`deploy/helm/firebird-site/templates/ingressroute.yaml` 按 Host 匹配全部路径到同一服务，
子目录模式无需任何 ingress 变更。步骤：
1. 后台「模块域名管理」中，把留空的子域名模块改为「子目录」，路径填模块英文识别码（news、shop、zhaopin、baokan、jianzhan、fenlei、zhuang）。
   商家中心同样填路径（如 `supplier`、`b`）。
2. 无法提供服务的模块（例如招聘未开通）：在「模块管理」中关闭并隐藏入口，而不是保留死链。
3. 清缓存（siteClearCache）。
4. 验收：`scripts/module-route-probe.sh canary.fbird.men demo.fbird.men`，期望无 FAIL。
5. 登录商家中心后手测 `/supplier/job` 等内页。
6. canary 通过后，对 demo / 生产重复步骤 1–3。

## 若坚持子域名
每个模块需：DNS 记录、证书（通配或 SAN）、`values-*.yaml` 的 `ingress.hosts` 追加主机，三者缺一即 404。

## /shop 500
canary 的 php-fpm 日志未保留该错误（只有探针日志）。需在复现 `/shop` 时查看 php-fpm 错误日志，
并检查 shop 模块是否已安装（`site_module` 表）、模板与 `shop.inc.php` 配置。待定位后单独修复。
