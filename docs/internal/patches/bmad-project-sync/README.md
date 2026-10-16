# bmad-project-sync.yml 补丁草案（owner 手动应用）

本目录的 `bmad-project-sync.yml` 是 `.github/workflows/bmad-project-sync.yml` 的完整替换草案，
修复独立 QA 对 PR #122 裁决的 Major 2/4/5（deploy-success 闭环不可达等），
含 `find_pr_by_sha()` 三级 PR 定位策略（search SHA → "Merge pull request #N" → "(#N)"）。

受保护路径约束：`.github/**` 只能由 Arvin 本人以 owner 分支提交，agent 分支触碰会被确定性门禁拒绝。

## 应用步骤（Arvin 执行）

```bash
cd ~/Documents/firebird-sea
git worktree add /tmp/fb-owner -b owner/bmad-project-sync-fix origin/main
cp docs/internal/patches/bmad-project-sync/bmad-project-sync.yml \
   /tmp/fb-owner/.github/workflows/bmad-project-sync.yml
cd /tmp/fb-owner
git add .github/workflows/bmad-project-sync.yml
git commit -m "fix(ci): bmad-project-sync deploy-success 闭环修复（QA Major 2/4/5）"
git push -u origin owner/bmad-project-sync-fix
# 开 PR，base=main，由 Arvin 本人合并
```

## 说明

- 仓库名已全部参数化为 `$GITHUB_REPOSITORY`，无硬编码域名/仓库。
- **应用后必须在同一 owner PR 内删除本目录**（`git rm -r docs/internal/patches/bmad-project-sync/`），
  避免草案变成僵尸文件；负责人 Arvin，跟踪 issue 由开 owner PR 时关联本拆分 PR。

## 2026-10-16 更新（随 PR #132 拆分）

- 草案更新为 PR #132 的 workflow 版本：新增 `update_linked_issue_stage()`（PR 合并/关闭时同步联动 Issue 的 BMAD Stage）、deploy-success 直接 issue 引用兜底。
- 修正 QA r1 指出的兜底缺陷：原 `grep -oE "#[0-9]+"` 会把 squash 提交标题里的 PR 号 `(#N)` 误认成 Issue 号，已改为仅匹配 `Closes/Fixes/Resolves #N`。
