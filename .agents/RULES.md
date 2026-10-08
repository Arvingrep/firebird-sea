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
