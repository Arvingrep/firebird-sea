# 一人 AI 团队工程规范 (Agent Rules)

> 本文件是所有参与该仓库编码的 AI Agent（如 Antigravity, Cursor, Claude Code 等）必须严格遵守的准则。

---

## 1. 核心铁律 (Non-Negotiable Rules)

1. **Docs as Code (强制文档同步卡点)**：
   - 只要任何代码提交涉及：① 数据库表结构/Schema 变更；② API 新增或变更；③ 环境变量增删；④ 支付与对账流程调整。
   - **必须在同一变更中同步更新 `/docs/internal` 或 `/docs/user` 下的相应 Markdown 文档**。严禁“只写代码不写文档”。
2. **资金与私钥安全禁区**：
   - 前端代码及 TMA (Telegram Mini App) 绝对不能出现任何助记词、私钥或具有资金转移权限的 API Key。
   - 链上转账监听只使用公开只读 RPC / TronGrid Read-Only Key，冷钱包私钥严禁写入代码库。
3. **极简设计原则 (KISS & DRY)**：
   - 一人团队没有冗余运维人力，优先使用成熟轻量方案（如优先网关模式、Serverless/边缘运行前端）。避免盲目引入复杂的微服务或过度设计。

---

## 2. 代码组织与模块划分

```
firebird-sea/
├── apps/
│   └── tma/                 # Telegram Mini App 前端 (Vue3/React + Vite + TailwindCSS)
├── services/
│   ├── api/                 # 主后端核心服务 (Fastify/Express TypeScript)
│   └── payment-listener/    # USDT 链上交易监听与自动对账独立脚本
├── automation/
│   └── n8n/workflows/       # n8n 工作流模板导出 (JSON)
├── docs/
│   ├── internal/            # 架构、部署、运维与环境配置文档
│   └── user/                # 商家入驻 SOP、骑手端与用户端指南
└── .agents/                 # AI Agent 规则与任务规约
```

---

## 3. 测试与验证标准

- **API 接口**：需具备标准 JSON 响应结构 `{ success: boolean, data?: any, error?: { code: string, message: string } }`。
- **TG 免密鉴权**：凡受保护的接口必须校验 Telegram `initData` 的 HMAC-SHA256 签名，未通过者直接返回 401。
- **双语与双币**：所有业务字段需支持多语言展示（zh / en），金额计算必须显式区分 `PHP`（法币单位，两位小数）与 `USDT`（加密货币，最高 6 位小数）。

---

## 4. 防臃肿代码准则 (Anti-Bloat Code Protocol)

1. **零冗余依赖 (Zero-Dep Rule)**：
   - 严禁擅自引入未批准的第三方重型 npm/composer 包（如仅为做一个 MD5/SHA256 引入大型库）。
   - 优先使用 Node.js 原生 API (`node:crypto`, `node:https`, `node:fs`) 及 PHP 内置标准库。
2. **KISS 原则与增量控制**：
   - 杜绝过度设计（严禁为 10 行逻辑写 5 层抽象类或复杂工厂模式）。
   - 单次提交代码增量原则上不超过 200 行，凡火鸟系统后台已有的配置项，严禁重新写代码造轮子。
3. **零垃圾文件与死代码**：
   - 严禁遗留 `.bak`、`test_*.php`、未引用的僵尸函数或生产环境调试输出（如 `console.log`, `var_dump`）。
   - 任何开发任务完成后，必须通过 Acceptance Agent 审查；验收未通过前禁止合并。

## 5. 分支与发布（Branch & Release）

1. **`main` 是生产**，受保护：只经 PR 变更，禁止强推与删除；必需检查为「🔒 确定性门禁」与「🧪 verify-task」。
2. **功能与 Agent 的 PR 一律以 `canary` 为目标分支**（`AGENT_BASE_BRANCH=canary`），合并后在 canary 环境验收；
   验收通过后才允许开 `canary → main` 的晋升 PR。**严禁**绕过 canary 把未验收改动直接合入 main（hotfix 例外，且合并后必须回灌 canary）。
3. **镜像 tag 纪律**：canary 构建只能推 `canary` / `canary-<sha12>`，**绝不推 40 位 SHA tag**（Image Updater 追 40 位 SHA，会把未验收镜像滚进生产）；`values-canary.yaml` 的 `image.tag` 不得改回 `latest`。
4. 受保护路径（`.github/`、`scripts/agent/`、`scripts/acceptance/`、`.agents/`）只能由 owner 修改；Agent 分支触碰即门禁 FAIL。
5. 详见 `docs/internal/RELEASE_FLOW.md`。
