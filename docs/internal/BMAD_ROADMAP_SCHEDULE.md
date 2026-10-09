# BMAD 需求全景与一人 AI 团队排期计划 (Roadmap & Schedule)

> 本排期采用 **BMAD (Business-Model-Agent-Delivery)** 架构，由 **Dev Agent 编码** 与 **Acceptance Agent 独立验收** 双轨驱动。

---

## 一、 核心阶段里程碑 (Milestones)

```mermaid
gantt
    title 火鸟东南亚一人 AI 团队：BMAD 排期路线图
    dateFormat  YYYY-MM-DD
    section M1: 支付与免密底座
    USDT (TRC-20) 支付插件开发 (Dev)      :m1_1, 2026-10-09, 3d
    独立红队与资金对账验收 (Acceptance)  :m1_2, after m1_1, 1d
    Telegram Mini App 免密登录桥接 (Dev) :m1_3, after m1_2, 2d
    section M2: 本地化与总代分站
    PHP 比索双币 & 语言包适配            :m2_1, after m1_3, 2d
    马尼拉大都会总代数据与权限隔离       :m2_2, after m2_1, 2d
    分站隔离与多域名路由验收 (Acceptance):m2_3, after m2_2, 1d
    section M3: 最小 Demo 站 GKE 交付
    Helm Chart 编排与 Ingress 配置       :m3_1, after m2_3, 2d
    GKE Demo 站上线与压测验收            :m3_2, after m3_1, 1d
    多站点复制自动化验证 (Manila / Cebu) :m3_3, after m3_2, 1d
    section M4: 试运营闭环
    马尼拉华人社区灰度测试与监控报警接入  :m4_1, after m3_3, 5d
```

---

## 二、 Epic 与 Task 规格矩阵

| 阶段 | Epic 编号 | 核心特性 (Feature) | Dev Agent 任务 | Acceptance Agent 验收标准 | 预计工期 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M1** | `EPIC-PAY` | **火鸟原生 USDT 支付插件** | 在 `api/payment/usdt/` 编写标准插件，集成动态尾数与 TronGrid 监听器 | 模拟 10 笔链上充值、超时取消、尾数碰撞压力测试全部通过 | 3 天 |
| **M1** | `EPIC-AUTH` | **Telegram Mini App 免密桥接** | 校验 `initData` 签名并自动映射登录火鸟账号 | 伪造篡改 Hash 拦截率 100%，正常用户 1 秒免密进入 | 2 天 |
| **M2** | `EPIC-LOC` | **菲律宾本地化 (PHP/+63/双语)** | 注入 ₱ 比索符号、Twilio 短信与 en-US 语言字典 | 手机号短信下发成功，界面货币准确无误 | 2 天 |
| **M2** | `EPIC-AGENT`| **总代理与城市分站隔离** | 配置 `site_city`，绑定独立域名，验证 SQL 数据隔离 | 分站总代登录无法查阅其他分站订单与商家资金 | 3 天 |
| **M3** | `EPIC-GKE` | **GKE 最小 Demo 站与无限复制** | 编写 Helm Chart，打通 GitHub Actions 自动部署 | 执行 `helm upgrade -f values-manila.yaml` 30 秒拉起新站点 | 3 天 |
| **M4** | `EPIC-OPS` | **监控与自动化运维** | n8n 连通 Telegram，Sentry 报错经 AI 一句话定位 | 发生 500 错误 3 秒内在个人 TG 收到精准代码定位卡片 | 2 天 |

---

## 三、 BMAD 敏捷交付契约

1. **每个 Story 必须产出两份证据**：
   - Dev Agent 提交的 Git 代码变更与 Docs 变更。
   - Acceptance Agent 独立执行 `scripts/agent/qa.sh`（PR）/ `scripts/acceptance-runner.sh <TASK-ID>`（本地） 签发的验收报告。
2. **不允许跨越里程碑交付**：M1 的资金与鉴权底座必须获 Acceptance Agent 绿标签发，方可进入 M2 的总代理分站业务层。
