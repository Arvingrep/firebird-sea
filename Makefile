.PHONY: help setup up down restart logs ps clean download-package extract-package dispatch verify backlog accept bmad-spec

help:
	@echo "=========================================================="
	@echo "🔥 火鸟模式东南亚（菲律宾）一人 AI 团队基地操作指令"
	@echo "=========================================================="
	@echo "  make setup            - 初始化基地目录与环境检查"
	@echo "  make up               - 启动 LEMP + Redis + n8n 容器集群"
	@echo "  make down             - 停止容器集群"
	@echo "  make logs             - 查看所有容器实时日志"
	@echo "  make dispatch         - 需求/语音转标准 Spec 并自动拉分支"
	@echo "  make bmad-spec        - 生成 BMAD 标准故事规范 (例: make bmad-spec EPIC=EPIC-PAY TITLE='USDT支付')"
	@echo "  make verify           - 运行一人团队代码与 Docs-as-Code 校验卡点"
	@echo "  make accept           - 启动独立验收智能体 (Agent 2) 进行红队质检验收 (例: make accept TASK=TASK-001)"
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
	@chmod +x scripts/agent-accept.sh
	@./scripts/agent-accept.sh $(TASK)

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
