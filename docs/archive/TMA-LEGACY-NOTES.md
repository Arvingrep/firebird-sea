# TMA 旧前端归档说明（2026-11-04）

`apps/tma`（Telegram Mini App，Vue 3 + Vite，50 文件 / 8191 行 / 10 页面 / 11 测试文件 135 用例）
连同两份前端文档（`docs/internal/TMA_UI.md`、`docs/internal/TMA_PR_DESCRIPTION.md`）已于 2026-11-04
从仓库删除，快照存于同目录的 `tma-legacy-2026-11-04.tar.gz`。

归档原因：旧前端是在没有 PRD、没有设计规范的情况下累积的；新前端按「文档先行」从零重建
（见 `docs/prd/README.md`）。**后端登录桥与白名单代理不受影响**，见 `docs/internal/TMA_LOGIN_BRIDGE.md`。

## 1. 如何取回

```bash
# 从归档快照取回（推荐，一次性还原整棵目录）
tar -xzf docs/archive/tma-legacy-2026-11-04.tar.gz   # 在仓库根执行，还原 apps/tma/ 与两份文档

# 或从 git 历史取回单个文件（删除提交之前的历史均可）
git log --oneline --all -- apps/tma | head -5        # 找删除前的提交
git show <commit>:apps/tma/src/lib/checkout.js > /tmp/checkout.js
```

快照打包时排除了 `node_modules`、`dist`、`.DS_Store`；还原后需 `cd apps/tma && npm install`。

## 2. 值得抄的文件 / 函数（新前端重写时的参考索引）

> 以下条目均带归档前 `TMA_UI.md` 的行号，可在 tarball 内 `docs/internal/TMA_UI.md` 对照。

| 内容 | TMA_UI.md 行 | 为什么值得留 |
|---|---|---|
| `lib/geo.js` 能力清单（单点校验、haversine、轨迹解析合并 <8m 重复点/上限 500、`simplify`、等比投影按 `cos(纬度)` 压缩、`formatDistance`、`navUrl`） | `:637` | 骑手端轨迹展示要从零重写，这段是纯函数无依赖，可直接移植 |
| `lib/delivery.js` 订单→视图模型（三个标记投影坐标、折线、全程/剩余距离、是否该轮询） | `:638` | 同上 |
| `components/DeliveryMap.vue`：SVG 里**不放文字**（i18n 长度会溢出），标注放底部图例 | `:639` | 踩过的坑，重画时会再踩 |
| `lib/backButton.js` 的 `resolveBackTarget`：后退目标由纯函数算，不在组件里各写一套；深度=0 时 replace 到父级 | `:681-690` | TG WebView 返回键的坑 |
| `fbClient.unwrap()` 把 `state 101/200` + 空态文案归一成 `null`；`listRows()` 处理裸数组/`{list}`/null 三态 | `:162`、`:224`、`:510`、`:630` | PHP 上游响应形状不稳定，新前端必须同样兜底 |
| `lib/checkout.js` 不传 `paytype`（上游 `(int)$this->param['paytype']` 会变成 0）；`ORDER_STATE` 映射；`cancelReason()` | `:261`、`:345`、`:663` | 资金路径，写错就是错价 |
| `lib/startParam.js` 白名单机制 + `^addr_([0-9a-f]{32})$` 必须与后端 `TOKEN_RE` 同形 | `:147` | 与 `services/api/src/addrShareRoute.js` 的深链耦合点 |
| `lib/searchHistory.js` 键 `fbsearch:v1`、最多 8 条 | `:534` | 本地搜索历史的既有约定 |
| Google Maps Key 构建期注入、缺 key 静默降级为纯手输 | `:40`、`:173` | 决定新前端要不要保留 `GOOGLE_MAPS_API_KEY`（当前 secret 保留、无消费方） |

## 3. 踩过的坑（重写时必读）

1. **`paytype` 不能传**：`lib/checkout.js` 不传 `paytype`，上游 `(int)$this->param['paytype']` 会把它变成 0；前端只提交 `shop`、`address`、`order_content`、`preset`、`peitype`、`note`，金额一律由后端重算。
2. **PHP 上游响应三态**：`fbClient.unwrap()` 必须把 `state 101/200` 与空态文案归一成 `null`；列表接口要兜裸数组 / `{list}` / null 三种形状。
3. **SVG 地图不放文字**：i18n 后文本长度溢出，标注放底部图例。
4. **`startParam` 白名单要与后端同形**：`^addr_([0-9a-f]{32})$` 必须与 `services/api/src/addrShareRoute.js` 的 `TOKEN_RE` 保持一致，否则深链静默失效。
5. **`urlencoded` 必须挂**：TG WebView 内 `fbClient.post` 走 `application/x-www-form-urlencoded`，api 侧只挂 `express.json()` 时写接口 body 恒为 `{}`（2026-10-26 canary 实测，见 `services/api/src/server.js` 相关注释）。

## 4. 已知断链（归档后仍存在，待新前端回 `/tma` 后自愈）

- **地址分享链接会 404**：`POST /tg-api/addr/share` 仍返回 `url: https://t.me/fbird_men_bot?startapp=addr_<token>`（`services/api/src/addrShareRoute.js`），点开经 BotFather Main Mini App 落到 `https://canary.fbird.men/tma/` → 404（`server.js` 的 `existsSync` 守卫跳过挂载，`TMA_STATIC_DIR` 不再注入）。代码有意保留不动（后端协议不变）；新前端复用 `/tma` 静态托管段上线后即自愈。
- **BotFather Main Mini App 入口**：`t.me/fbird_men_bot/fbirdcanary` 的 Mini App URL 指向 `/tma/`（配置在 BotFather，不在仓库），归档期间点进去同样是 404。

## 5. `GOOGLE_MAPS_API_KEY`（遗留）

该 secret 原通过 `ci-gke.yml` 的 `--build-arg VITE_GOOGLE_MAPS_API_KEY` 注入前端（Google Places 地址联想）。
前端归档后**当前无消费方**，secret 暂保留；新前端若用 Google Places 可直接复用，不用则可清。

## 6. 复活后的部署路径（供新前端参考）

`Dockerfile.api` 的 `tma-build` stage 已删除；`services/api/src/server.js` 的 `/tma` 静态托管段**保留**
（`TMA_STATIC_DIR` 注入且目录存在时才挂载，CSP/nosniff/no-referrer 一并带好）。新前端上线时：

1. 恢复（或新建）构建 stage，产物复制进镜像并 `ENV TMA_STATIC_DIR=/app/tma`；
2. `values-canary.yaml` 的 `tma.enabled` 已为 `true`（路由与后端 env 由同一开关守着，**不要关**，见
   `deployment-api.yaml` 的 env 块）；
3. git 历史里 `b73994c7`（删除前最后一个 TMA 提交）可完整还原旧工程。
