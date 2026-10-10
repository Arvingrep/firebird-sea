# AI 新闻同步到门户 (Story 6.3)

服务:`services/news-sync`(零依赖,Node 内置 `fetch`/`crypto`/`fs`)。

流程:采集结果(JSON 数组 `[{title,url,summary}]`)经 stdin 进入 `src/cli.js` → 清洗 → 按 URL SHA-256 去重 → 发布到门户 → 失败重试(3 次,线性退避)→ 仍失败则 Telegram 告警运营者,且不记入已见集合,下一轮自动重试。

AD-11:AI 输出为不可信输入,仅保留纯文本标题/摘要和 `https` 链接,丢弃其它字段(含价格)。

## 门户契约与可靠性

- 发布请求:`POST NEWS_PORTAL_PUBLISH_URL`,头 `Idempotency-Key: <sha256(url)>`,body 含 `title/url/summary/dedupeKey`。门户须以 `dedupeKey` 幂等入库;响应须为 HTTP 2xx 且 JSON `{ "success": true }`,否则(含 HTTP 200 + `success:false`)视为失败,重试并告警,不记入已见集合。此契约为本服务假定,需与火鸟新闻入库端点对齐。
- 去重文件 tmp + rename 原子写;文件不存在视为空,损坏/无权限则整轮报错退出(不会误当空集合重复发布)。
- 门户成功但去重文件写入失败:计为已发布,并在告警中提示;下轮同一幂等键重发,由门户去重。
- 告警按行切分为 ≤4000 字符多条发送,整体有界重试(3 次);仍失败则 `alertFailed=true`、进程退出码 1。失败项未入已见集合,下轮会再次告警。

## 环境变量

| 变量 | 说明 |
| :--- | :--- |
| `NEWS_PORTAL_PUBLISH_URL` | 门户发布接口(POST JSON) |
| `NEWS_PORTAL_TOKEN` | 门户发布接口 Bearer Token(仅运行环境注入) |
| `NEWS_ALERT_BOT_TOKEN` / `NEWS_ALERT_CHAT_ID` | 失败告警的 Telegram Bot 与运营者 Chat |
| `NEWS_SYNC_SEEN_FILE` | 已发布去重集合文件,默认 `./news-seen.json` |

## 健壮性

- 发布与告警请求各带 15s 截止时间(`AbortSignal.timeout`,覆盖响应体读取),超时计入有界重试。
- 输入非 JSON 数组、去重文件损坏等整轮失败同样经 Telegram 告警并以非零码退出(`src/cli.js` 导出 `main` 便于测试)。

## 测试

`cd services/news-sync && npm test`(`src/sync.test.js`、`src/io.test.js`、`src/cli.test.js`:去重 / 重试 / 告警 / 输入清洗 / 门户业务失败 / 文件持久化 / 告警分条与重试)。

## 待人工(受保护路径)

- `scripts/verify-task.sh` 目前只跑 `services/api`,需 Arvin 在受保护入口加入 `services/news-sync` 的 `npm test`(`node --test src/`)。
- Zero-Dep 门禁把 package.json 的 `"version"` 误判为依赖;本次已移除该字段并标记 `private`。

## 待人工

- 门户发布接口(火鸟新闻入库端点)需 Arvin 确认后配置;"真实环境运行一轮"需部署后手动验证。
- n8n 调度接入(`automation/n8n/workflows`)未包含,建议后续拆分。
