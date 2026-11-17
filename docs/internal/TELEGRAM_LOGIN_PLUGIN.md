# Telegram 快捷登录插件（`webroot/api/login/telegram`）

参照 Facebook 快捷登录插件的结构，让「Telegram Mini App 一键登录」出现在火鸟后台的登录方式管理里，可安装、开关、配置。

## 流程
1. Mini App 内打开登录页 → 脚本发现后台已启用 `li.telegram` → 跳 `/api/login.php?type=telegram`（带 `furl`=登录前页面）。
2. 插件 `login()` 输出落地页：读取 Telegram 注入的 `initData`，导航式表单 POST 回 `/api/login.php?action=back&type=telegram`。
3. 插件 `back()`：同源检查（Origin/Referer）→ 复用 `api/fbs/bridge.php` 的验签 / 查建会员（用户名 `tg_<id>`）/ 签发会话 Cookie（进程内调用）→ 302 回 `furl`（仅站内路径）。

不走 Node 登录桥（KI-005），也不经 `/api/fbs` 对外路由（边缘已 deny）。

## 后台配置
1. 后台 → 登录方式管理 → 安装「Telegram快捷登录」。
2. 填 **Bot Token**（BotFather 下发）。它是机密，只存后台配置，不进页面和日志。
3. 启用。登录页「快捷登录」出现 Telegram 图标；在 Mini App 内每个会话会自动登录一次。

## 注意
- 防重放沿用 bridge：同一份 initData 5 次 / 2 小时。
- 退出登录后同一 Telegram 会话不会被自动登回（sessionStorage 标记），可手点图标。
- 其他登录页模板（PC、弹窗登录等）未改；本次只改了触屏 `login.html`。
- 已验证：PHP 7.4 下对真实 MariaDB 走通「验签 → 建会员 → 两个登录 Cookie → 302」；篡改 / 错 token / 过期 / 缺 Origin / 跨站 Origin 均拒绝。未验证：真实 Telegram 客户端内的跳转、后台安装界面、登录后会话在站内是否被各业务页识别。

## 浏览器 / 微信里登录：机器人确认流程（2026-11-07）

在 Telegram 内打开登录页能直接拿到 initData；在微信、Safari 等非 Telegram 环境里拿不到，改走「机器人确认」：

1. 登录页点 Telegram 图标 → 落地页检测无 initData → `act=new` 创建一次性令牌（表 `#@__telegram_login_token`，同 IP 10 分钟最多 20 个，5 分钟有效），返回 `https://t.me/<机器人>?start=login_<令牌>`。
2. 用户点页面上的「打开 Telegram 确认登录」（新标签打开，原页保持轮询，不会被跳走）。
3. 机器人（services/tg-bot）收到 `/start login_<令牌>`，回一条带 `web_app` 的「✅ 确认登录」按钮，指向 `/api/login.php?type=telegram&act=confirm&t=<令牌>`。
4. 确认页在 Telegram 内打开，拿到真实 initData，用户点确认 → `act=confirm_submit`：验签、校验时效，令牌 0→1 并暂存 initData。
5. 原浏览器每 2 秒 `act=poll`；令牌为 1 时一次性消费（1→2）并在本次响应里签发站点会话 Cookie，随后跳回登录前页面。

配置：后台「机器人用户名」选填（默认 `fbird_men_bot`）。机器人侧沿用 `TG_APP_BASE_URL`（必须 https）。

已知风险与取舍：这是「令牌 + 确认」模式，攻击者可发起自己的令牌并诱导受害者点确认。因此确认页和机器人消息都明确写了「只有本人刚刚发起才确认」。令牌 5 分钟有效、一次性、不带任何账号信息。

微信内置浏览器常拦截 `t.me` / `tg://`：页面会提示「点右上角…用浏览器打开」。
