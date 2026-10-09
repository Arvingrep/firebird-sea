.PHONY: bmad-next local-accept gates agent-dev agent-qa agent-runner help setup up down restart logs ps clean download-package extract-package dispatch verify backlog accept bmad-spec test-coins sync-gh bmad-ui clean-bloat dev-check release tg-bot test-tg test-k8s hermes test-mcp

help:
	@echo "=========================================================="
	@echo "🔥 火鸟模式东南亚（菲律宾）一人 AI 团队基地操作指令"
	@echo "=========================================================="
	@echo "  make agent-runner     - 🤖 注册本机自托管 runner（多 Agent 流水线，见 docs/internal/AGENT_PIPELINE.md）"
	@echo "  make agent-dev        - Dev Agent 施工 GitHub Issue (例: make agent-dev ISSUE=12)"
	@echo "  make agent-qa         - 独立 QA Agent 验收 PR (例: make agent-qa PR=34)"
	@echo "  make gates            - 当前分支对 origin/main 跑确定性门禁"
	@echo "  make hermes           - 🏛️  启动 Agent 2 (Hermes) 执行全链路独立红队总验收"
	@echo "  make test-mcp         - ⚡ 验证 n8n MCP Server 协议及 4 核心工作流端到端状态"
	@echo "  make setup            - 初始化基地目录与环境检查"
	@echo "  make up               - 启动 LEMP + Redis + n8n + TG-Bot 容器集群"
	@echo "  make down             - 停止容器集群"
	@echo "  make logs             - 查看所有容器实时日志"
	@echo "  make dispatch         - [分工1] 需求/语音脱水提炼为标准 Spec 并自动派单"
	@echo "  make dev-check        - [分工2] 编码施工防臃肿门禁 (Zero-Dep & 代码脱水)"
	@echo "  make verify           - 运行一人团队代码与 Docs-as-Code 校验卡点"
	@echo "  make accept           - [分工3] 启动独立验收智能体 (Agent 2) 验收 (例: make accept TASK=TASK-001)"
	@echo "  make release          - [分工4] 经独立验收通过后一键发布至 GKE 并自动归档 (例: make release TASK=TASK-001 SITE=manila)"
	@echo "  make tg-bot           - 本地启动 Telegram 前哨调度服务 (端口 3001)"
	@echo "  make test-tg          - 测试 Telegram 前哨服务 Webhook 与卡片接口"
	@echo "  make test-k8s         - 测试 GKE Helm Chart 语法与多站点模板渲染"
	@echo "  make clean-bloat      - 执行工程体系脱水剪枝，清理临时备份、大日志与悬挂镜像"
	@echo "  make test-coins       - 测试 Coins.ph 官方行情深度与 HMAC-SHA256 鉴权引擎"
	@echo "  make sync-gh          - 同步本地任务至 GitHub Project & BMAD UI 数据源"
	@echo "  make bmad-ui          - 启动/查看本地 BMAD 可视化看板"
	@echo "  make backlog          - 查看当前任务看板状态"
	@echo "  make download-package - 执行第 1 步：从官方源下载旗舰版安装包"
	@echo "  make extract-package  - 解压源码至 webroot 并注入商业授权证书"
	@echo "=========================================================="

setup:
	@chmod +x scripts/setup-base.sh
	@./scripts/setup-base.sh

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

dispatch:
	@node scripts/dispatch-task.js "$(PROMPT)" $(MODULE) $(PRIORITY)

bmad-spec:
	@node scripts/bmad-spec-gen.js $(EPIC) "$(TITLE)"

verify:
	@chmod +x scripts/verify-task.sh
	@./scripts/verify-task.sh

accept:
	@bash scripts/acceptance-runner.sh $(TASK)

gates:
	@bash scripts/agent/gates.sh origin/main

local-accept:
	@bash scripts/local-accept.sh

agent-dev:
	@bash scripts/agent/dev.sh $(ISSUE)

agent-qa:
	@bash scripts/agent/qa.sh $(PR)

agent-runner:
	@bash scripts/agent/setup-runner.sh

test-coins:
	@node scripts/test-coins-ph.js

sync-gh:
	@node scripts/github-sync.js

bmad-ui: sync-gh
	@open apps/bmad-dashboard/index.html 2>/dev/null || echo "请在浏览器打开: apps/bmad-dashboard/index.html"

backlog:
	@cat .agents/tasks/BACKLOG.md

download-package:
	@mkdir -p downloads
	@echo "📥 正在从酷曼云官方对象存储下载旗舰版初始安装包 (~270MB)..."
	@curl -L --progress-bar -o downloads/huoniao_install.zip "https://obs.kumanyun.com/package_system/火鸟门户初始化安装包.zip?v=2026012904"
	@echo "✅ 下载完成：downloads/huoniao_install.zip"

extract-package:
	@echo "📦 正在解压至 webroot/ 目录..."
	@unzip -q -o downloads/huoniao_install.zip -d webroot/
	@echo "🔑 正在注入官方商业授权证书 (huoniao.php)..."
	@cp -f license/huoniao.php webroot/include/huoniao.php 2>/dev/null || cp -f license/huoniao.php webroot/huoniao.php
	@echo "🎉 源码已解压就绪，授权文件已自动放置完成！"

dev-check:
	@chmod +x scripts/dev-check.sh
	@./scripts/dev-check.sh

release:
	@chmod +x scripts/deploy-release.sh
	@./scripts/deploy-release.sh $(TASK) $(SITE)

clean-bloat:
	@chmod +x scripts/clean-bloat.sh
	@./scripts/clean-bloat.sh

tg-bot:
	@node services/tg-bot/src/server.js

test-tg:
	@node services/tg-bot/src/test.js

test-k8s:
	@chmod +x scripts/test-helm.sh
	@./scripts/test-helm.sh

hermes:
	@chmod +x scripts/hermes-accept.sh
	@./scripts/hermes-accept.sh

test-mcp:
	@chmod +x scripts/mcp-acceptance-test.js
	@node scripts/mcp-acceptance-test.js

bmad-next: ## BMAD：预览下一个可开工 Story 的 Issue（dry-run，不建单）
	@node scripts/bmad/story-to-issue.js $(ARGS)
