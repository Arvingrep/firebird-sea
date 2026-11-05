# docs/api · 接口契约

本目录有两套**互不相干**的接口契约，动手前先确认改的是哪一套。

| 文件 | 覆盖范围 | 机器校验 |
|---|---|---|
| `openapi.yaml` | `services/api`（Node，`/tg-api/*`）全部路由 | ✅ `node scripts/api-contract-check.js` 双向比对，CI 门禁第 10 项 |
| `openapi-waimai-article.yaml` | `webroot/api/handlers/{waimai,article}.class.php` 的 **143 个 PHP 接口**（外卖 100 / 资讯 43） | ❌ 纯文档，靠 Review |
| `swagger.html` | 上一份的浏览器版（Swagger UI，规范内嵌，离线可用） | — |
| `swagger-ui/` | Swagger UI 本地资源，无外网依赖 | — |

## 打开 PHP 接口文档

直接双击 `swagger.html` 即可（走内嵌快照）。要看最新 YAML 时用 HTTP 打开：

```bash
python3 -m http.server 8080        # 仓库根目录
open http://localhost:8080/docs/api/swagger.html
```

## PHP 接口怎么调

全部走一个入口，`action` 就是 class 里的 public 方法名：

```
GET /include/ajax.php?service=waimai&action=shopList&page=1&pageSize=20
```

响应信封 `{ state, info }`：**100 成功 / 101 失败提示 / 102 无数据**。
业务代码里写的 `state: 200` 会被 `handlers::getHandle()` 归并成 101，调用方永远收不到 200。

## 什么时候更新

给 `waimai.class.php` / `article.class.php` 新增、改名、删除 public 方法时。
细节见 [`docs/internal/API_ROUTING_AND_CONFIG.md`](../internal/API_ROUTING_AND_CONFIG.md)「PHP 站点接口文档」一节。
