#!/usr/bin/env bash
# 在本机注册 GitHub Actions 自托管 runner（标签 firebird-agent），供 Dev/QA Agent 使用。
# 前置：已登录 claude / codex CLI（runner 以当前用户身份运行，复用其登录态与额度）。
# 用法：scripts/agent/setup-runner.sh            （幂等；已安装则只做检查）
# 卸载：cd ~/actions-runner-firebird && ./svc.sh uninstall && ./config.sh remove --token <token>

set -euo pipefail
REPO="Arvingrep/firebird-sea"
DIR="${RUNNER_DIR:-$HOME/actions-runner-firebird}"
LABELS="firebird-agent"

need() { command -v "$1" >/dev/null 2>&1; }
need brew || { echo "❌ 需要 Homebrew"; exit 1; }
need gh   || brew install gh
need jq   || brew install jq
gh auth status >/dev/null 2>&1 || gh auth login -h github.com -s repo,workflow
for c in claude codex node git; do need "$c" || { echo "❌ 缺少 $c"; exit 1; }; done

if [ -f "$DIR/.runner" ]; then
  echo "ℹ️ runner 已注册于 $DIR"; (cd "$DIR" && ./svc.sh status) || true; exit 0
fi

case "$(uname -m)" in arm64) ARCH=osx-arm64 ;; x86_64) ARCH=osx-x64 ;; *) echo "❌ 不支持的架构"; exit 1 ;; esac
VER="$(gh api repos/actions/runner/releases/latest -q .tag_name | sed 's/^v//')"
mkdir -p "$DIR" && cd "$DIR"
curl -fsSL -o runner.tgz "https://github.com/actions/runner/releases/download/v${VER}/actions-runner-${ARCH}-${VER}.tar.gz"
tar xzf runner.tgz && rm runner.tgz

TOKEN="$(gh api -X POST "repos/${REPO}/actions/runners/registration-token" -q .token)"
./config.sh --unattended --url "https://github.com/${REPO}" --token "$TOKEN" \
  --name "$(scutil --get LocalHostName 2>/dev/null || hostname)-firebird" \
  --labels "$LABELS" --work _work --replace

# launchd 服务环境里 PATH 很短：显式写入 claude/codex/gh/node 所在目录
{
  echo "PATH=$(dirname "$(command -v claude)"):$(dirname "$(command -v codex)"):$(dirname "$(command -v gh)"):$(dirname "$(command -v node)"):/usr/bin:/bin:/usr/sbin:/sbin"
  echo "HOME=$HOME"
} >> .env
./svc.sh install && ./svc.sh start

cat <<MSG
✅ runner 已注册并以 launchd 服务运行（标签: ${LABELS}）。
下一步（仓库 Settings → Secrets and variables → Actions）：
  secret  AGENT_GH_TOKEN            fine-grained PAT：本仓库 Contents/Issues/Pull requests = Read & Write
  var     N8N_AGENT_EVENT_WEBHOOK   https://n8n.k8shome.com/webhook/firebird-agent-event
  var     (可选) DEV_AGENT_CMD / QA_AGENT_CMD / AGENT_AUTO_MERGE=0 / AGENT_MAX_ATTEMPTS
MSG
