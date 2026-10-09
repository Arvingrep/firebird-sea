# firebird-sea

> 目录结构见 [docs/internal/REPO_MAP.md](docs/internal/REPO_MAP.md)：哪些是第三方源码、哪些是我们自己的、线上与本地环境怎么分。

## 多 Agent 流水线运维

| 命令 | 用途 |
| --- | --- |
| `make agent-dev ISSUE=<n>` | 针对 GitHub Issue `<n>` 启动 Dev Agent 实现需求并提交 PR |
| `GATES_JOB_RESULT=success make agent-qa PR=<n>` | 在 CI 门禁通过后，对 PR `<n>` 运行 QA Agent 验收 |
| `make gates` | 本地检查当前分支相对 `origin/main` 的确定性门禁，完整检查（含 `scripts/test-helm.sh`）以 CI 为准 |
| `kubectl --context mac-mini-orbstack -n argocd get imageupdater firebird-manila` | 查看 ArgoCD Image Updater 对 firebird-manila 的镜像更新状态 |
| `argocd app history firebird-manila` | 查看 firebird-manila 应用的部署历史，用于确认版本或回滚 |

完整说明见 [docs/internal/AGENT_PIPELINE.md](docs/internal/AGENT_PIPELINE.md)。
