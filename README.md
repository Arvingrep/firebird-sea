# firebird-sea

> 目录结构见 [docs/internal/REPO_MAP.md](docs/internal/REPO_MAP.md)：哪些是第三方源码、哪些是我们自己的、线上与本地环境怎么分。

## 运维常用命令

| 命令 | 用途 |
| --- | --- |
| `kubectl --context mac-mini-orbstack -n argocd get imageupdater firebird-manila` | 查看 ArgoCD Image Updater 对 firebird-manila 的镜像更新状态 |
| `argocd app history firebird-manila` | 查看 firebird-manila 应用的部署历史，用于确认版本或回滚 |
