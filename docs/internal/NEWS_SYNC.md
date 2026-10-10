# AI 新闻同步到门户 (Story 6.3)

服务:`services/news-sync`(零依赖,Node 内置 `fetch`/`crypto`/`fs`)。

流程:采集结果(JSON 数组 `[{title,url,summary}]`)经 stdin 进入 `src/cli.js` → 清洗 → 按 URL SHA-256 去重 → 发布到门户 → 失败重试(3 次,线性退避)→ 仍失败则 Telegram 告警运营者,且不记入已见集合,下一轮自动重试。

AD-11:AI 输出为不可信输入,仅保留纯文本标题/摘要和 `https` 链接,丢弃其它字段(含价格)。

## 门户契约与可靠性

- **真实火鸟契约(Cookie 登录,`src/portal.js`,凭据齐备时自动启用)**:
  1. 登录 `POST <origin>/loginCheck.html`(表单 `username/password/platform=app`,ajax.php 的 member 服务无 loginCheck,实测返回 action no found),成功 `{state:100}`;鉴权 Cookie 须整罐保存(`PHPSESSID` + `HN_userid/HN_login_user` 等,仅 PHPSESSID 会被判登录超时)。
  2. 发布 `POST <origin>/include/ajax.php?service=article&action=put`(表单 `cityid/typeid/mold=0/title/body/sourceurl`,body 内嵌 `<!-- dedupe:<key> -->`)。经 handlers 包装:成功 `{state:100,info:{aid,...}}`;业务失败/未登录统一 `{state:101,info:...}`,info 含「登录超时」或返回 HTML 登录页 → 自动重新登录一次再发,仍失败抛错走告警;其它 `state!=100`(如「您还没有入驻自媒体」「申请正在审核中」、入库错)为业务失败,不重登(同源:`webroot/api/handlers/{handlers,article}.class.php`、`member.controller.php`)。
  3. 下架 `action=del`(软删 `del=1`,仅作者本人,`state:100`),复验清理用(`publish.remove(id)`)。
  - 发布账号须为门户会员且已入驻自媒体(`#@__article_selfmedia` state=1),否则 put 被拒。
  - 凭据只从运行环境(env 文件)读入,任何日志/错误信息不输出凭据与 Cookie 值。
- 旧 Bearer 契约(`src/io.js makePublisher`,未配 USER/PASS 时回退):`POST NEWS_PORTAL_PUBLISH_URL`,头 `Idempotency-Key`,响应须 HTTP 2xx 且 `{ "success": true }`。门户无 Bearer 端点,此路径仅供 mock/演练。
- 去重文件 tmp + rename 原子写;文件不存在视为空,损坏/无权限则整轮报错退出(不会误当空集合重复发布)。
- 门户成功但去重文件写入失败:计为已发布,并在告警中提示;下轮同一幂等键重发,由门户去重。
- 告警按行切分为 ≤4000 字符多条发送,整体有界重试(3 次);仍失败则 `alertFailed=true`、进程退出码 1。失败项未入已见集合,下轮会再次告警。

## 环境变量

| 变量 | 说明 |
| :--- | :--- |
| `NEWS_PORTAL_PUBLISH_URL` | 门户发布接口;Cookie 适配取其 origin 拼 ajax 路径 |
| `NEWS_PORTAL_USER` / `NEWS_PORTAL_PASS` | 门户会员账号(仅运行环境注入);配置后启用 Cookie 登录适配 |
| `NEWS_PORTAL_CITYID` / `NEWS_PORTAL_TYPEID` | 发布城市/栏目 ID,默认均为 1 |
| `NEWS_PORTAL_TOKEN` | 旧 Bearer 契约 Token(仅 mock/演练) |
| `NEWS_SYNC_MAX_PER_RUN` | 单轮最多处理条数(n8n 定时限量),未设则不限 |
| `NEWS_ALERT_BOT_TOKEN` / `NEWS_ALERT_CHAT_ID` | 失败告警的 Telegram Bot 与运营者 Chat |
| `NEWS_ALERT_API_BASE` | 告警 API 基址,默认 `https://api.telegram.org`;本地验收指向 mock |
| `NEWS_SYNC_SEEN_FILE` | 已发布去重集合文件,默认 `./news-seen.json` |

## 健壮性

- 发布与告警请求各带 15s 截止时间(`AbortSignal.timeout`,覆盖响应体读取),超时计入有界重试。
- 输入非 JSON 数组、去重文件损坏等整轮失败同样经 Telegram 告警并以非零码退出(`src/cli.js` 导出 `main` 便于测试)。

## 测试

`cd services/news-sync && npm test`(`src/sync.test.js`、`src/io.test.js`、`src/cli.test.js`、`src/feed.test.js`:去重 / 重试 / 告警 / 输入清洗 / 门户业务失败 / 文件持久化 / 告警分条与重试 / RSS 适配)。`scripts/verify-task.sh` 已纳入本服务单测。

## TASK-016 适配层与本地真实环境验收

- `src/feed.js`:把 TASK-016(n8n 新闻工作流)RSS 源适配为 `[{title,url,summary}]`,可作 CLI 管道使用;非 RSS/截断输入抛错并非零退出(配合 `set -o pipefail` 或调度方失败告警,采集故障不被当作空轮成功掩盖)。
- 同源数据面已 vendoring 入仓:`fixtures/`(n8n-news-mock 原样 RSS、TASK-016 → 火鸟门户真实输出契约样本、派生故障演练 RSS;来源命令与 sha256 见 `fixtures/README.md`)。`e2e/mock-portal.js` 不再硬编码数据,原样回放这些 fixture,并提供门户幂等/故障注入与 Telegram 替身;状态重置 `POST /reset` 或重启进程。
- 一键复现:`bash services/news-sync/e2e-local.sh <workdir> [port]`(默认端口 18180,自行拉起/销毁 mock):采集→适配→去重→发布→同输入第二轮零发布→预置门户故障(演练条目同样经采集适配链路进入)→3 次有界重试→Telegram 告警,断言在脚本内;`scripts/verify-task.sh` 已将其接入 CI 必跑。
- 2026-10-10 运行证据(无密钥):`docs/internal/evidence/story-6.3/`(含完整日志 `full-run.txt`)。逐条对应:采集→`feed.test.js` + `full-run.txt`/`items.json`;去重与第二轮零发布→`sync.test.js`/`cli.test.js` + `round1.json`/`round2.json`;有界重试→`sync.test.js` + `mock-state.json` 的 `portalAttempts`(=第 1 轮发布数 + 失败轮 3 次重试);失败告警→`io.test.js` + `mock-state.json` 的 `tg`(本轮 Telegram 收件)。
- 状态如实说明:完整链路证据基于仓库内 vendored 的 n8n-news-mock 同源 fixture(TASK-016 验收数据面原样,见 `fixtures/README.md`);与真实火鸟门户端点的对接复验,待 Arvin 提供端点/凭据后进行(见「待人工」)。

## 待人工

- n8n 调度接入(`automation/n8n/workflows`)未包含,见 Issue #55(TASK-016 → news-sync 定时限量同步)。
