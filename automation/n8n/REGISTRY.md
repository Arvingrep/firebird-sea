# n8n 工作流登记表

> **这是 n8n 工作流的唯一真相源（Single Source of Truth）。**
> 实例上新增 / 停用 / 删除任何工作流，必须同步更新本表，否则视为未完成。
> 最后核对：2026-10-27（数据来自 `GET /api/v1/workflows` 实测，不是推测）

实例地址：`https://n8n.k8shome.com`

---

## 一、在跑（ACTIVE）4 个

| 工作流 | 实例 ID | 仓库文件 | 用途 | 业务归属 |
|---|---|---|---|---|
| 配送调度与骑手 TG 桥（抢单/取货/送达） | `jXiwVn3ns2ZOa5CL` | `tg_dispatch_courier_flow.json` | 外卖派单主链：扫单 → 推抢单卡 → 骑手动作 → 派单通知 | **外卖（核心）** |
| 一人AI团队：多Agent流水线事件推送TG | `xddf8KtZ63A4dQDK` | `agent_pipeline_events_to_tg.json` | CI 构建 / ArgoCD 上线事件推 TG | **运维（核心）** |
| Arvino Relay: Gitea Webhook | `HTylK5frUEKLfj2F` | 无（外部产品线，未纳入本仓） | Arvino 项目 Gitea 事件中继 | 非本项目 |
| Arvino Relay: Nightingale Alert Webhook | `qq9QsipIlq1vcQtO` | 无（外部产品线，未纳入本仓） | Arvino 项目告警中继 | 非本项目 |

## 二、已停用（idle）4 个

2026-10-27 停用，原因均为**目标系统已不存在**。备份在 `docs/archive/n8n-retired-2026-10-27/`，
恢复方式：导入该 JSON 后重新 Activate。

| 工作流 | 实例 ID | 停用原因 |
|---|---|---|
| 一人AI团队：TG语音随笔转GitHub-Issue与Project看板 | `WkFtg2gh00000002` | GitHub Project 回写链路已随 BMAD 体系下线，Project 看板不再维护 |
| 一人AI团队：USDT入账与对账超时告警 | `WkFtg2gh00000003` | 零流量；且「非 PAID 一律判超时」是假逻辑，对账侧从未实现 |
| 一人AI团队：Sentry异常告警经AI根因提炼推送TG | `WkFtg2gh00000004` | 仓库内无任何 Sentry SDK 接入，永远不会有事件进来 |
| 一人AI团队：TG语音与随笔自动提炼TaskSpec | `WkFtg2gh00000005` | 目标端 Linear 从未采用 |

另有 `knpmDfxsqpyUCljm`（Arvino Relay: Plane Webhook）本就 idle，属外部产品线，未纳入本仓。

## 三、未部署（仓库有源码，实例上没有）

| 仓库文件 | 用途 | 缺什么 |
|---|---|---|
| `news_sync_schedule.json` | 资讯模块定时供料（抓取 → AI 去重 → 发布） | **从未导入实例**。资讯模块目前没有自动供料链 |

> ⚠️ 这一条直接影响「资讯模块」上线。要跑通资讯，必须先把此工作流导入实例并激活，
> 同时确认 `services/news-sync` 的运行时依赖可用（它当前依赖 n8n 容器内的挂载路径，不在 GitOps 里）。

---

## 维护规则

1. **新增工作流**：先在实例建好 → 导出 JSON 进 `automation/n8n/workflows/` → 在本表登记一行
2. **停用工作流**：导出 JSON 到 `docs/archive/n8n-retired-<日期>/` → 从「在跑」移到「已停用」并写原因
3. **删除工作流**：只有在确认无任何外部调用方（webhook / 定时）后才允许，且必须留备份
4. **命名**：仓库文件名用 `snake_case.json`，实例显示名可用中文；两者对应关系只在本表维护

## 已知风险（未修复，勿踩）

- 派单链 8 个 HTTP 节点硬编码 `canary.fbird.men` → 生产订单进不了抢单池（P0）
- `fb-courier-bridge` webhook 无 authentication → 可伪造骑手绑定（P0）
- 工作流 staticData 里 token 为空串 + `n8nac-config` 开了 `requireSyncBack` → 一次 push 可覆盖线上 token（P0）
