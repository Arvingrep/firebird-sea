.PHONY: local-accept help setup up down restart logs ps clean download-package extract-package test-coins clean-bloat dev-check test-k8s


help:
	@echo "=========================================================="
	@echo "🔥 火鸟模式东南亚（菲律宾）一人 AI 团队基地操作指令"
	@echo "=========================================================="
	@echo "  make setup            - 初始化基地目录与环境检查"
	@echo "  make up               - 启动 LEMP + Redis + n8n 容器集群"
	@echo "  make down             - 停止容器集群"
	@echo "  make logs             - 查看所有容器实时日志"
	@echo "  make dev-check        - [分工2] 编码施工防臃肿门禁 (Zero-Dep & 代码脱水)"
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

local-accept:
	@bash scripts/local-accept.sh

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
