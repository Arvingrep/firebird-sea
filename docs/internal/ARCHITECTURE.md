# 火鸟模式东南亚（菲律宾）一人 AI 团队架构与基建说明

---

## 1. 架构总览

本系统旨在以**一人 AI 团队（Solo AI Builder）**的极简模式，落地基于火鸟门户系统的东南亚（菲律宾马尼拉/卡加延等）本地化外卖、跑腿、租房、招聘及 USDT 结算闭环。

```mermaid
flowchart TD
    User([你 / 独立总指挥]) -->|1. 手机 TG 发送语音 / 碎碎念| TGBot[个人指挥 Bot]
    TGBot -->|2. Webhook 触发| N8N[n8n 自动化枢纽 + LLM 语义解构]
    N8N -->|3. 生成规范 Spec 派入队列| Backlog[本地 .agents/tasks/ 或 Linear]
    Backlog -->|4. 自动分发 & 编码执行| Agent[AI Coding Agent / Antigravity]
    Agent -->|5. 运行自检 & 同步更新 Docs| Verification[运行测试 & Docs 卡点检查]
    Verification -->|6. 自动 Commit / PR 部署 Preview| CI[Git 提交 & Docker 环境热重载]
    CI -->|7. 结果卡片回传| TGBot
    TGBot -->|8. 发送结果卡片 [通过 / 需调整]| User
```

---

## 2. 关键基建模块

### 2.1 任务提炼与派发引擎 (`scripts/dispatch-task.js`)
* **作用**：将非结构化的语音转录、碎片想法一键转化为符合 `.agents/TASK_SPEC_TEMPLATE.md` 规范的 Markdown 任务，并自动更新 `.agents/tasks/BACKLOG.md` 以及自动开出对应 Git 分支。
* **调用方式**：
  ```bash
  make dispatch PROMPT="外卖结算页加上 USDT 支付" MODULE=WAIMAI PRIORITY=HIGH
  ```

### 2.2 质量与文档强制卡点 (`scripts/verify-task.sh`)
* **作用**：贯彻 **Docs as Code** 原则。每当业务代码被修改时，必须在同一变更中同步更新 `/docs/` 目录；同时检查官方商业授权证书 `license/huoniao.php` 的存在性与 PHP 核心语法。
* **调用方式**：
  ```bash
  make verify
  ```

### 2.3 容器化运行环境 (`docker-compose.yml`)
* **服务列表**：
  * `nginx` (端口 `8080`，内置伪静态 Rewrite 规则)
  * `php` (PHP 7.4-FPM + mysqli + gd + redis)
  * `mysql` (MariaDB 10.5，兼容火鸟数据库结构)
  * `redis` (Redis 7)
  * `n8n` (端口 `5678`，工作流引擎)

---

## 3. 授权与环境凭据
* 授权域名：`fh580.net`
* 授权证书：`license/huoniao.php`
* Access Key ID：`4002d3f2a59c4b61`
