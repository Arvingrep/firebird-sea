# AI agent 执行指令（每个 agent 每轮读取本文件并照做）

任务来源是 GitHub issue（仓库 Arvingrep/firebird-sea），用 gh 命令行操作。本文件由 Claude 维护，以 origin/canary 上的版本为准。
定时任务里会告诉你"你是 claude / codex / gemini"，只按自己的分工做。

## 分工（流水线：gemini 整理规则 → codex 实现 → claude 审核）

| 你是 | 只领这些 issue | 产出 |
|---|---|---|
| claude | ① 里程碑 M0 地基的全部 issue（M0 只由 claude 做，按编号顺序）；② 带「需Arvin审批」的迁移 issue（需已有「规则已整理」）；③ 审核其他 agent 开的 PR | 代码 PR；对别人 PR 的审核意见 |
| codex | 带「线/迁移Go」「agent可领」「规则已整理」，且没有「需Arvin审批」的 issue | 代码 PR |
| gemini | 带「线/迁移Go」但还没有「规则已整理」的迁移 issue；以及带「类型/调研」的 issue | 只写评论，不写代码 |

M0 没全部关闭之前，codex 不领任何任务；gemini 可以先整理 M1 的规则。

## 工作目录（必须遵守）
多个 agent 在同一台电脑上运行，**不能共用同一个目录**，否则会互相覆盖未提交的改动。每个 agent 只在自己的 worktree 里工作：
```
WT=~/Documents/firebird-sea-agents/<你的名字>
[ -d "$WT" ] || git -C ~/Documents/firebird-sea worktree add --detach "$WT" origin/canary
cd "$WT"
```
之后所有 git 操作都在 `$WT` 里进行。`~/Documents/firebird-sea` 是 Arvin 自己的目录，不要在里面改文件、切分支。

## 执行纪律：Superpowers
所有写代码的 agent（claude、codex）在任务内部按 Superpowers（obra/superpowers）的方法干活。
**首次运行**：如果你的工具里还没装 Superpowers，先按它官方 README 里对应你这个工具的方式自行安装（Claude Code 走插件市场），装好后在汇报里注明"已安装 Superpowers"。

使用以下技能：
- `test-driven-development`：先写会失败的测试（迁移类就是先写对比用例），再写实现
- `systematic-debugging`：测试或对比失败时按步骤找根因，不靠猜
- `verification-before-completion`：开 PR 之前必须亲自跑过测试和对比工具，汇报里贴出结果；没跑过不许说完成
- `requesting-code-review` / `receiving-code-review`：claude 审核别人的 PR 时使用

为了适应无人值守的定时运行，以下几点**以本文件为准，覆盖 Superpowers 的默认行为**：
- **跳过 `brainstorming`**：没有人在旁边回答问题。需求以 issue 正文和评论里的业务规则为准，不清楚就按"阻塞"处理。
- **计划写在 issue 评论里**：不要用 `writing-plans` 在仓库里生成计划或规格文件（`docs/plans/`、`docs/specs/` 等一律不提交）。
- **不用 `using-git-worktrees` 新建 worktree**：使用上面"工作目录"一节指定的目录。
- **`finishing-a-development-branch` 只做到"推送并开 PR"**：不合并、不删分支。
- `.superpowers/` 下的临时文件不提交。

## 每轮流程
1. `git fetch`，基于最新的 `origin/canary`。`~/Documents/firebird-sea` 根目录有 `STOP` 文件就结束。
2. 按分工找 issue：打开状态；没有「状态/进行中」「状态/待审核」「阻塞」；没有其他 `agent/*` 标签；里程碑按 M0 → M1 → … 顺序，同一里程碑取编号最小的。找不到就结束。
3. 领取：加「状态/进行中」和自己的 `agent/<名字>` 标签。重新读一次这个 issue，如果出现了别的 `agent/*` 标签，说明撞车了：撤掉自己的两个标签，换下一个。
4. 在评论里写本轮计划（3–6 步）。

### gemini：整理业务规则
5. 读 issue 指定的 PHP 源码，在评论里写「业务规则」：参数与校验、每个分支、返回字段及含义、错误情况、读写了哪些表、和其他 action 的依赖。
6. 能确定的写清楚；不确定的单独列在「待 Arvin 确认」下面，并加「阻塞」。
7. 完成后加「规则已整理」，撤掉「状态/进行中」和 `agent/gemini`。调研类 issue 则在评论里写结论和建议，撤掉标签即可，不关闭 issue。

### claude / codex：实现
5. 从 `origin/canary` 切分支 `mig/<issue编号>`，按 issue 的"做法"和评论里的业务规则实现。规则里没写的不要自己补设定：加「阻塞」，评论写问题，撤掉「状态/进行中」，结束。
6. 跑测试和对比工具，全部通过后推送，开 PR 合进 `canary`，第一行写 `Closes #<issue编号>`，按 PR 模板填写。
7. 不要自己合并 PR。

### claude：审核
- 每轮先看有没有其他 agent 开的、还没审过的 PR。逐条对照 issue 的业务规则和验收标准审核，在 PR 上留评论：通过，或者列出必须修改的地方。
- 不合并 PR，合并由 Arvin 决定。

## 失败
同一个 issue 连续 3 轮做不完：加「阻塞」，评论写明原因，撤掉自己的 `agent/*` 和「状态/进行中」，结束。

## 结束时只汇报 4 行
```
你是：<名字>  issue：#编号 标题
结果：已开 PR #N / 规则已整理 / 已审 PR #N / 阻塞（原因） / 无可领任务
下一个：#编号
需要 Arvin：无 / 具体事项
```

## 规矩
- 只写业务代码和测试，不新建报告、规则、流程文档。
- 不改 issue 范围以外的文件。
- `git add` 只加具体文件路径，不用 `-A`。

## 总调度（每天定时运行一次或两次，由 Claude 在云端执行，不写业务代码）
各 agent 只管自己领的任务，状态都落在 GitHub 上；总调度负责把整体收拢，并把需要 Arvin 的事集中成一份汇报。

1. **释放卡死的任务**：带「状态/进行中」的 issue，如果 24 小时内既没有新评论、也没有关联分支的新提交或 PR，就撤掉「状态/进行中」和 `agent/*` 标签，评论"超时释放，可重新领取"。同一个 issue 第二次超时，改加「阻塞」并写明原因。
2. **审核 PR**：对所有打开的、还没有审核意见的 PR，按 issue 的业务规则和验收标准审核，在 PR 上评论"通过"或列出必须修改的地方。不合并。
3. **检查一致性**：PR 已合并但 issue 没关闭、issue 已关闭但标签还挂着「状态/*」之类的不一致，直接修正。
4. **汇报**：最后只输出下面这份汇报，不新建任何文件：
```
总调度 <日期 时间>
进度：M0 x/6，M1 x/26，……（已关闭/总数）
今日完成：#编号 标题（谁做的）……
等 Arvin 合并：PR #N（审核通过、CI 通过，需审批的标出）……
等 Arvin 回答：#编号 问题一句话……
超时释放：#编号……
异常：无 / 具体情况
```
