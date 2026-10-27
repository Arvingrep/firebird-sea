.PHONY: local-accept gates agent-qa help setup up down restart logs ps clean download-package extract-package verify test-coins clean-bloat dev-check test-k8s hygiene

# gates 的对比基线：跟随「目标分支」（PR 要合进去的那条），而不是当前分支自己的上游。
# 用上游 @{u} 是错的：agent/*、chore/* 的上游就是它自己，push 完 git diff @{u}...HEAD 恒空 → 又是假 FAIL。
# 目标分支由 AGENT_BASE_BRANCH 决定（与 lib.sh 同一个变量；默认 main，启用 canary 后设为 canary）；
# 临时想比对别的 ref 用 GATE_BASE 覆盖（命令行 > 同名 env > AGENT_BASE_BRANCH）。
# 注意 1：AGENT_BASE_BRANCH 应填**裸分支名**（canary，不是 origin/canary）；本文件与 lib.sh:14 都自行拼 origin/，
#         lib.sh 已做归一，这里再 `$(patsubst origin/%,%,…)` 一次，裸名与带前缀两种写法都得到 origin/canary。
# 注意 2：本目标**不 fetch**，比的是本地远端跟踪 ref。本地 origin/<分支> 落后于真实远端时，
#         会把别人已合入的改动算进本次增量（可能虚高甚至误判 >1200 行）→ 门禁报错前先 git fetch。
GATE_BASE ?= origin/$(patsubst origin/%,%,$(or $(AGENT_BASE_BRANCH),main))

help:
	@echo "=========================================================="
	@echo "🔥 火鸟模式东南亚（菲律宾）一人 AI 团队基地操作指令"
	@echo "=========================================================="
	@echo "  make agent-qa         - 独立 QA Agent 验收 PR (例: make agent-qa PR=34)"
	@echo "  make gates            - 对目标分支（AGENT_BASE_BRANCH，填裸分支名，默认 origin/main）跑门禁；GATE_BASE 覆盖；本目标不自动 fetch，落后时请先手动 git fetch"
	@echo "  make setup            - 初始化基地目录与环境检查"
	@echo "  make up               - 启动 LEMP + Redis + n8n 容器集群"
	@echo "  make down             - 停止容器集群"
	@echo "  make logs             - 查看所有容器实时日志"
	@echo "  make dev-check        - [分工2] 编码施工防臃肿门禁 (Zero-Dep & 代码脱水)"
	@echo "  make verify           - 运行一人团队代码与 Docs-as-Code 校验卡点"
	@echo "  make hygiene          - 🧹 仓库卫生检查（副本/临时目录/大文件，CI 同款）"
	@echo "  make test-k8s         - 测试 GKE Helm Chart 语法与多站点模板渲染"
	@echo "  make clean-bloat      - 执行工程体系脱水剪枝，清理临时备份、大日志与悬挂镜像"
	@echo "  make test-coins       - 测试 Coins.ph 官方行情深度与 HMAC-SHA256 鉴权引擎"
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

verify:
	@chmod +x scripts/verify-task.sh
	@./scripts/verify-task.sh

gates:
	@bash scripts/agent/gates.sh $(GATE_BASE)

hygiene:
	@bash scripts/repo-hygiene.sh

local-accept:
	@bash scripts/local-accept.sh

agent-qa:
	@bash scripts/agent/qa.sh $(PR)

test-coins:
	@node scripts/test-coins-ph.js

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

clean-bloat:
	@chmod +x scripts/clean-bloat.sh
	@./scripts/clean-bloat.sh

# tg-bot / test-tg 已于 2026-10-27 下线（services/tg-bot 三处全断）。
# 骑手与配送已由 n8n 派单链承担：automation/n8n/workflows/tg_dispatch_courier_flow.json

test-k8s:
	@chmod +x scripts/test-helm.sh
	@./scripts/test-helm.sh
