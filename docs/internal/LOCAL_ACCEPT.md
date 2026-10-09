# 本地验收（与 GKE 同构）

> 目的：不必每次走到 GKE 才发现问题。`make local-accept` 在本机用和线上相同的构建方式验收一个 git 提交。

## 用法
```bash
make local-accept                 # 验收当前分支的 HEAD
SITE=cebu make local-accept       # 用 cebu 站点的 Helm 值
KEEP=1 make local-accept          # 失败后保留环境排查（工作目录会打印出来）
HUONIAO_SO=/path/huoniao.so make local-accept
```
需要 docker 与 helm。首次构建镜像约几分钟，之后走缓存。

## 它做了什么（与线上同构的部分）
1. `git archive HEAD` 导出已提交内容，**未提交的改动不参与**（线上构建也不应包含它们）。
2. 用 `deploy/docker/Dockerfile.web`、`Dockerfile.api` 构建镜像。
3. nginx 配置由 `helm template` 渲染自站点的 values，与线上同源。
4. php-fpm 与 nginx 共享网络命名空间（`127.0.0.1:9000`），与 Pod 内两个容器一致；另有 api、MariaDB 10.5、Redis。
5. 用 `scripts/init-firebird-db.php` 初始化库。

本地的 `docker-compose.yml` 仍可日常开发用，但它把 `./webroot` 直接挂进容器、PHP 镜像与 nginx 配置也与线上不同，**不能用来验收**。

## 冒烟检查（`scripts/local-accept-checks.sh`）
| 检查 | 抓的问题 |
|---|---|
| 镜像里 `loop.php`、`common.inc.php`、`index.php` 与 git 一致 | 镜像不是从 git 构建、新旧文件混杂 |
| 模板里注册的插件函数都有定义 | 注册了但函数缺失（2026-10-10 canary 500 的类型） |
| `/`、`/index.php`、`ajax.php` 不返回 5xx；有外卖模块时再查 `/waimai/`、`/wmsj/login.php` | 页面渲染崩溃 |
| `/api/payment/notify.php` 由 PHP 处理 | 支付回调被 Node 拦截 |
| api `/health` 为 200，php 日志无致命错误 | 服务起不来 |

反向验证：从正确的 `loop.php` 删掉 `smarty_function_getModuleConfig` 注入本地环境，前两项检查都失败并点出函数名。

## 已知局限
- 本地库是空库加默认数据，**首页走默认模板**，没用到线上才会用到的标签，所以"页面不返回 5xx"在空库上偏弱；兜底靠前两项文件与函数检查。
- 它验证的是代码与镜像，不验证线上数据与配置。
- 外卖模块文件目前只在分支 `feat/multi-agent-pipeline` 上；验收那个分支即可覆盖 `/waimai/`。

## 构建可重现性问题（本工具发现）
`webroot/huoniao.so`（商业加载器）被 `.gitignore` 排除，不在 git 里，但镜像运行必须有它。线上 manila 镜像里的 `huoniao.so` 属主 uid 为 501，指纹 `9f4fdcdd…`，说明线上镜像来自带有该文件的构建机，**无法仅凭 git 重现**。本工具从主工作区（或 `HUONIAO_SO`）取同一份文件；找不到就报错，不会悄悄构建出跑不起来的镜像。长期做法：由 CI 从受控的私有位置取该文件，并在构建后核对指纹。
