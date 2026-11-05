# docs/api · 接口契约

本目录有两套**互不相干**的接口契约，动手前先确认改的是哪一套。

| 文件 | 覆盖范围 | 机器校验 |
|---|---|---|
| `openapi.yaml` | `services/api`（Node，`/tg-api/*`）全部路由 | ✅ `node scripts/api-contract-check.js` 双向比对，CI 门禁第 10 项 |
| `openapi-waimai-article.yaml` | `webroot/api/handlers/{waimai,article}.class.php` 的 **145 个 PHP 接口**（外卖 100 / 资讯 45） | ✅ `node scripts/api-contract-check-php.js` 双向比对，CI 门禁第 10 项 |
| `swagger.html` | 上一份的浏览器版（Swagger UI，规范内嵌，离线可用） | **未入库**（1.6 MB vendor bundle，待 CDN 方案） |
| `swagger-ui/` | Swagger UI 本地资源（1.6 MB 第三方 bundle） | **未入库**（1.6 MB vendor bundle，待 CDN 方案） |

## 两份契约的判据（2026-11-05 起由门禁强制）

两份都做**双向集合比对**，不是「改了文件就得改文档」：

```
代码有、文档缺  → 接口没文档，调用方不知道它存在
文档有、代码没有 → 文档描述了不存在的接口，调用方照着写才发现
```

所以**修 bug 但不动接口签名时不需要动文档**——判据是接口集合有没有变化，不是碰没碰文件。这条很重要：如果按「碰了 handler 就必须改文档」判，日常修复会被无理由拦下，人就会开始用 `chore/` 前缀绕过整条门禁。

尚未纳管的 service（当前 30 个 / 1511 个接口）登记在 `.agents/api-contract-debt.txt`，每条带到期日：未登记即 FAIL，到期未补即 FAIL。补法照抄 `openapi-waimai-article.yaml` 的写法（每个 operation 带 `x-real-request` 标注真实入口 URL）。

## 为什么这份契约以前没有锁

`openapi-waimai-article.yaml` 描述了 145 个接口，但**它此前根本没被提交进仓库**（只存在于本地工作区），README 里也写着「❌ 纯文档，靠 Review」。结果是：文档与代码靠人肉同步，而 docs-as-code 门禁只要求「改了代码就动 docs/」，动哪一篇不管——在 `waimai.class.php` 里加一个 `public function` 就是一条新接口，随手往别的文档写一行，门禁照样绿。

现在 YAML 入库、由门禁第 10 项做双向校验。**当前实测：145 个接口与代码完全一致（0 差异）**。这条可以自己复核：

```bash
node scripts/api-contract-check-php.js          # 一致则退出码 0
node scripts/api-contract-check-php.js --print  # 只打印从代码提取到的接口
```

## 打开 PHP 接口文档

`swagger.html` 与 `swagger-ui/` **尚未入库**：那是 1.6 MB 的第三方压缩 bundle，直接提交会触发门禁「无调试残留」（此前 PR #190 正是因此被打回，判得对）。展示层改用 CDN + SRI 引用的方案单独做；规范本体（YAML）已入库，可先用编辑器或任意 OpenAPI 工具打开。

## PHP 接口怎么调

全部走一个入口，`action` 就是 class 里的 public 方法名：

```
GET /include/ajax.php?service=waimai&action=shopList&page=1&pageSize=20
```

响应信封 `{ state, info }`：**100 成功 / 101 失败提示 / 102 无数据**。
业务代码里写的 `state: 200` 会被 `handlers::getHandle()` 归并成 101，调用方永远收不到 200。

## 什么时候更新

给 `waimai.class.php` / `article.class.php` 新增、改名、删除 public 方法时，同一 PR 内同步 `openapi-waimai-article.yaml`。
分发实现在 `webroot/include/ajax.php`（`{service}.class.php` 动态加载）与 `handlers::getHandle()`；
节点侧的路由前缀与配置自检见 [`docs/internal/API_ROUTING_AND_CONFIG.md`](../internal/API_ROUTING_AND_CONFIG.md)。
