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
