# BMAD 双 Agent 研发生态：独立验收规约 (Acceptance Gate)

> **原则：开发与验收职责分离（Separation of Concerns）**  
> “开发是你，验收也是你，容易陷入自我合理化（Self-Confirmation Bias）”。  
> 本规范定义两个相互独立演进的 Agent 角色与交接契约。

---

## 1. 角色定义与分工

```mermaid
flowchart LR
    subgraph Agent1 [Agent 1: Dev Agent (实现者)]
        A1[读取任务 Spec] --> B1[编码实现]
        B1 --> C1[自测 & 补齐文档]
        C1 --> D1[提交分支 PR]
    end

    subgraph Agent2 [Agent 2: Acceptance Agent (质检红队)]
        D1 --> A2[独立检出变更]
        A2 --> B2[黑盒/白盒功能探针验证]
        B2 --> C2[安全/异常边界穿透测试]
        C2 --> D2[Docs-as-Code 严谨度审查]
        D2 --> E2{判定结果}
        E2 -->|PASS| F2[签发验收报告 & 允许合并]
        E2 -->|REJECT| G2[列出缺陷清单打回重修]
    end
```

### 1.1 Dev Agent（开发智能体）
- **职责**：认领任务 Spec，实现功能代码，同步更新技术文档与环境变量。
- **产出物**：Git Commit、代码变更、功能演示探针。
- **禁区**：不得自行将任务标记为 `DONE`。

### 1.2 Acceptance Agent / QA Agent（独立质检智能体）
- **职责**：作为无情的系统审核员，怀疑一切未经实测的代码，执行：
  1. **自动化探针执行**：运行 `scripts/agent-accept.sh <TASK-ID>`，发起真实 HTTP 请求并校验状态码与响应体。
  2. **边界与资损攻击**：
     - USDT 充值：金额为 0、负数、重放 TxHash、15分钟超时能否防碰撞？
     - 鉴权：伪造 Telegram `initData` 能否被拦截并返回 401？
     - 城市分站：分站 A 的管理员能否越权看到分站 B 的订单？
  3. **文档与代码真伪审查**：文档里的参数说明是否与代码中的变量完全一致？
- **产出物**：`.agents/tasks/reports/<TASK-ID>-ACCEPTANCE.md`，状态为 `ACCEPTED` 或 `REJECTED`。

---

## 2. 验收执行指令

```bash
# 由 Acceptance Agent 执行独立质检验收
./scripts/agent-accept.sh TASK-002
```
若所有攻击与用例全部通过，自动在看板签发绿标并生成验收证据链。
