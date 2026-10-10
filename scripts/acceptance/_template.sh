#!/usr/bin/env bash
# story: <N-M> <Story 标题> —— 测试先行验收用例模板（复制为 story-<N>-<M>.sh，见 docs/internal/TEST_FIRST.md）
# 约定：退出 0=绿；1=红；77=缺运行所需工具（SKIP）。只断言「可静态/渲染判定」的 AC，运行态 AC 写在注释里交人工验收。
# 要求：改动前必须为红；只依赖仓库内容与常见 CLI（helm/node/grep/awk），不得访问网络、不得读密钥。
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
command -v helm >/dev/null || { echo "缺 helm"; exit 77; }
FAILS=0; bad() { echo "  ❌ $*"; FAILS=$((FAILS+1)); }
# --- 逐条 AC：ac1() { grep -q '期望内容' path/to/file || bad "AC1 未满足：…"; } ---
[ "$FAILS" = 0 ] && echo "✅ 全部通过" || echo "❌ ${FAILS} 项未满足"
[ "$FAILS" = 0 ]
