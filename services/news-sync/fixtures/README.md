# fixtures:TASK-016 / n8n-news-mock 同源数据面样本(vendored,无任何凭据)

本目录把本地验收环境 **n8n-news-mock**(TASK-016「火鸟门户新闻工作流-Notion集成版」
的确定性验收数据面,实现挂载于容器 `n8n-news-mock`,与 n8n 实例 `n8n-news-ops`
同属 `~/Documents/n8n-automation-workspace/deploy-local`)的输出原样 vendoring 入仓,
使 e2e 与单测可在仓库内核对「同一数据面」,无需外部服务。

| 文件 | 来源与取得命令 | sha256 |
| :--- | :--- | :--- |
| `n8n-news-mock-rss.xml` | `curl -fsS http://localhost:18080/rss.xml`(n8n-news-mock 容器,2026-10-10 原样保存) | `0a67f9e4abc21eac88f731c323e3009a11c8a7f3fcdf23a0f549d8bf8beb3901` |
| `task-016-portal-sample.json` | TASK-016 完整流程验收时 n8n-news-mock 实收的火鸟发布请求/响应与告警样本,取自 `deploy-local/evidence/mock-state.json`(urlencoded form 已解码,无凭据) | `a95c8ea484dfa87d855712f1f09d474555b9d6b1d650572854aeba251b59f1fd` |
| `n8n-news-mock-rss-drill.xml` | **派生 fixture**:在上述同源 RSS 末尾追加一条结构一致的故障演练条目(failure-drill),用于失败重试/告警演练;演练条目经同一 `src/feed.js` 适配链路进入同步 | `9d19acd9b10ee289da707d2d3b0f6eae926f5004afce7507ced70bf5c8c7acaf` |

用途:
- `e2e/mock-portal.js` 的 `GET /rss.xml` 直接回放 `n8n-news-mock-rss.xml`(`?drill=1` 回放 drill 变体),不再硬编码条目;
- `src/feed.test.js` 直接读取 `n8n-news-mock-rss.xml` 断言适配结果;
- `task-016-portal-sample.json` 记录 TASK-016 → 火鸟门户的实际输出契约(`service=article&action=put&title=...&body=...` 表单与 `{state:100,info:<id>}` 响应),供真实门户适配时核对。

真实火鸟门户(demo.fbird.men)发布端点与凭据到位后,按 `docs/internal/NEWS_SYNC.md`「待人工」复验。
