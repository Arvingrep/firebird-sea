# 模块域名 / 子目录配置

> 背景：canary/demo 上 `/news /shop /zhuang /baokan /jianzhan` 等 404/500，原因是后台「系统-模块域名管理」中模块类型为「子域名」但域名留空，入口链接成死链。

## 方案
- 所有模块统一为「子目录」：`deploy/helm/firebird-site/values.yaml` 的 `configVars.<module>.inc.php.customSubDomain: 2`。
- 子目录路径写入 DB：`php scripts/seed_module_domains.php <host> <db> <user> <pass> [--apply]`
  - 默认 dry-run；只补空、不覆盖已有值；路径被其他模块占用则跳过并提示。
  - `zhaopin`（服务未开通）在 `huoniao_site_module` 置 `state=1`，隐藏入口。
- 执行后在后台「清除缓存」。

## 校验
`scripts/test-module-domains.sh`（静态：values 与脚本路径表一致、dry-run 保护、Helm 渲染）。

## 未覆盖（需人工/运行态验收）
- `/shop` 500 需看应用日志定位，本方案不含修复。
- 登录后复测 `/supplier/job` 等商家中心内页。
- canary 验收通过后再同步 demo/生产。
