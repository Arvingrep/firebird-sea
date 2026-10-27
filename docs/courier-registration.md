# 骑手注册通道（菲律宾站）

> 背景：站内 SMS 通道未接入，`courierReg()` 原手机验证码流程（归属地黑白名单 + 短信验证码）形同死路。
> 2026-10-27 新增两条注册通道：**邮件验证码注册** 与 **Telegram 注册**。原手机流程保留未动。

## 通道一：邮件验证码注册（HTTP API）

入口：`include/ajax.php?service=waimai&action=...`

### 1. 发送验证码 `courierSendEmailCode`

| 参数 | 说明 |
|---|---|
| `email` | 注册邮箱（即登录用户名） |

- 发送域名 `noreply@fbird.men`（Resend SMTP，465 SSL）
- 频控：同邮箱 60 秒内只发一次（查 `site_messagelog` type=email lei=courier_reg）
- 已注册邮箱直接拒绝，验证码 6 位数字

### 2. 提交注册 `courierReg`（`regtype=email`）

| 参数 | 说明 |
|---|---|
| `regtype` | 必须为 `email` |
| `email` | 注册邮箱（登录用户名） |
| `username` | 姓名（≤10 字符） |
| `password` | 登录密码（≥6 位，库内明文存储——与全站骑手体系一致） |
| `vertcode` | 邮件验证码（10 分钟内有效，一次性，用后销毁） |
| `cityid` | 城市（现网店铺均为 `10000`） |
| `phone` | 选填，用于查重 |

成功返回 `{state:100, did:<骑手id>}`；注册后 `status=1`（免审核，管理员可在后台驳回）。

## 通道二：Telegram 注册（n8n 调度桥）

骑手在 Telegram 私聊机器人发：

```
/reg 姓名 密码 [手机号]
```

链路：n8n Webhook → `courierRegTg`（`include/ajax.php?service=waimai&action=courierRegTg`）→ 成功后自动把聊天绑定到新骑手账号，立即可接单。

- 身份信任模型：Telegram 消息本身即身份验证（bot 收到消息 = chatid 真实）；PHP 侧以**服务间 token** 防公网滥用
- token 存于 `webroot/include/config/fbird.inc.php`（`$fb_bridge_token`，与部署环境 `EVENT_TOKEN` 同源；该文件不属于后台站点配置体系，不会被同步覆盖）
- n8n 侧 token 注入在工作流 staticData `config.eventToken`
- 幂等：同一 Telegram 重复 `/reg` 直接返回已有骑手 id；用户名规则 `tg<chatid数字>`

## 治理口径

- 邮箱/TG 注册均**自动过审**（status=1）；后台「配送员管理」仍可查看、停用、删除
- 后台列表为空 ≠ 故障：新站骑手只可能来自这两条通道或后台手动添加
- 抢单池按骑手 `cityid` 匹配订单城市；注册时城市选错会导致抢单池永远为空（现网统一 `10000`）
