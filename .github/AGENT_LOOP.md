# AI agent 执行指令（每个 agent 每轮读取本文件并照做）

任务来源是 GitHub issue（仓库 Arvingrep/firebird-sea），用 gh 命令行操作。本文件由 Claude 维护，以 origin/canary 上的版本为准。
定时任务或启动指令里会告诉你"你是 claude / codex / gemini / minimax / workbuddy"，只按自己的分工做。

## 分工（流水线：gemini/workbuddy 整理规则 → codex/minimax 实现 → claude 审核）

| 你是 | 只领这些 issue | 产出 |
|---|---|---|
| claude | ① 带「需Arvin审批」（高风险：流量分流、登录会话、表结构）且带「agent可领」的 issue，只由 claude 做；② 其余「agent可领」的实现类 issue，与 codex 共享（迁移线须已有「规则已整理」，类型/地基除外）；③ 审核其他 agent（codex、minimax）开的 PR | 代码 PR；对别人 PR 的审核意见 |
| codex | ① 带「agent可领」、没有「需Arvin审批」的 issue（任何工作线）；其中迁移线（线/迁移Go）还必须已有「规则已整理」（类型/地基除外）；② 每轮先审核 claude 开的、还没审过的 PR | 代码 PR；对 claude PR 的审核意见 |
| gemini | 迁移线里还没有「规则已整理」的 issue；以及带「类型/调研」和「agent可领」的 issue | 只写评论，不写代码 |
| minimax | 迁移线（线/迁移Go）里带「类型/读」「agent可领」「规则已整理」、没有「需Arvin审批」的 issue：实现读接口并补 L2 对比用例（testdata/compare/） | 代码 PR |
| workbuddy | 同 gemini（整理规则、调研），两者谁先领到谁做 | 只写评论，不写代码 |

没有「agent可领」的 issue 是 Arvin 的人工任务（推送分支、真机验收等），任何 agent 都不领。
迁移线不再按里程碑整体串行，而是按 issue 正文里的「依赖：#N」排队：依赖没关闭的不领。另外 M1 及以后的**实现**至少要等 #231（兼容层骨架）关闭；整理规则不受限制。
minimax 通过 Emdash 里的 OpenCode（模型选 MiniMax）运行；workbuddy 在 WorkBuddy 桌面应用里运行，不经过 Emdash，同样按本文件领 issue。同一个 issue 被两个 agent 同时领取时按下面第 3 步的撞车规则处理。

## issue 的分类（每个打开的 issue 都恰好有一个）
| 维度 | 标签 / 字段 | 取值 |
|---|---|---|
| 工作线 | `线/*` | 迁移Go、TMA上线、支付、部署架构、研发流程 |
| 类型 | `类型/*` | 地基、读、写、后台页、功能、缺陷、调研、规划、验收 |
| 优先级 | `优先级/*` | P0（最先做：安全、阻断上线）、P1（当前主线）、P2（排后面） |
| 项目 | 里程碑 | 迁移 M0–M5、TMA 上线、支付、研发流程 |
| 状态 | `状态/*` | 无标签=待办；进行中、待审核、阻塞；关闭=完成 |

新建 issue 时四个维度必须填齐。

## 工作目录（必须遵守）
多个 agent 在同一台电脑上运行，**不能共用同一个目录**，否则会互相覆盖未提交的改动。每个 agent 只在自己的 worktree 里工作：
```
WT=~/Documents/firebird-sea-agents/<你的名字>
[ -d "$WT" ] || git -C ~/Documents/firebird-sea worktree add --detach "$WT" origin/canary
cd "$WT"
```
之后所有 git 操作都在 `$WT` 里进行。`~/Documents/firebird-sea` 是 Arvin 自己的目录，不要在里面改文件、切分支。

## 通过 Emdash 启动时（Arvin 在 Emdash 里给 issue 建任务）
- Emdash 已经为这个任务建好独立的 worktree 和分支，**直接在当前目录工作**，不再按上一节自建 `~/Documents/firebird-sea-agents/<名字>`。
- 开工前先让分支基于最新 canary：`git fetch origin canary && git rebase origin/canary`（新建的 worktree 还没有提交，等同于直接切到 canary 最新代码）。
- 任务里附带的 GitHub issue 就是你要做的那一个，不用再按"每轮流程"自己挑；其余规则（领取时打标签、先写规则、测试、PR 第一行 `Closes #N`、不自己合并）照常执行。
- 分支名用 Emdash 生成的即可，PR 合并后会被自动清理。

## 执行纪律：Superpowers
所有写代码的 agent（claude、codex、minimax）在任务内部按 Superpowers（obra/superpowers）的方法干活。
**首次运行**：如果你的工具里还没装 Superpowers，先按它官方 README 里对应你这个工具的方式自行安装（Claude Code 走插件市场），装好后在汇报里注明"已安装 Superpowers"。

使用以下技能：
- `test-driven-development`：先写会失败的测试（迁移类就是先写对比用例），再写实现
- `systematic-debugging`：测试或对比失败时按步骤找根因，不靠猜
- `verification-before-completion`：开 PR 之前必须亲自跑过测试和对比工具，汇报里贴出结果；没跑过不许说完成
- `requesting-code-review` / `receiving-code-review`：claude 审核别人的 PR 时使用

为了适应无人值守的定时运行，以下几点**以本文件为准，覆盖 Superpowers 的默认行为**：
- **跳过 `brainstorming`**：没有人在旁边回答问题。需求以 issue 正文和评论里的业务规则为准，不清楚就按「状态/阻塞」处理。
- **计划写在 issue 评论里**：不要用 `writing-plans` 在仓库里生成计划或规格文件（`docs/plans/`、`docs/specs/` 等一律不提交）。
- **不用 `using-git-worktrees` 新建 worktree**：使用上面"工作目录"一节指定的目录。
- **`finishing-a-development-branch` 只做到"推送并开 PR"**：不合并、不删分支。
- `.superpowers/` 下的临时文件不提交。

## 每轮流程
1. `git fetch`，基于最新的 `origin/canary`。`~/Documents/firebird-sea` 根目录有 `STOP` 文件就结束。
2. 按分工找 issue：打开状态；没有「状态/进行中」「状态/待审核」「状态/阻塞」；没有其他 `agent/*` 标签；正文里写的"依赖：#N"都已关闭。
   排序：**优先级 P0 → P1 → P2**；同一优先级里，迁移线按里程碑「迁移 M0 → M1 → …」排在前面的先领（但不必等前一个里程碑全部关完，只看「依赖：#N」），其他线按编号从小到大。找不到就结束。
3. 领取：加「状态/进行中」和自己的 `agent/<名字>` 标签。重新读一次这个 issue，如果出现了别的 `agent/*` 标签，说明撞车了：撤掉自己的两个标签，换下一个。
4. 在评论里写本轮计划（3–6 步）。

### gemini / workbuddy：整理业务规则
**硬性禁止（违反即越权）**：不 `git commit`、不 `git push`、不建分支、不开 PR、不改仓库里的任何文件；每轮**只处理一个 issue**，写完评论、改完标签立即结束本轮。issue 里写着"实现""做法"也一样——那是给 claude/codex/minimax 的，不是给你的。
5. 读 issue 指定的 PHP 源码，在评论里写「业务规则」：参数与校验、每个分支、返回字段及含义、错误情况、读写了哪些表、和其他 action 的依赖。
6. 能确定的写清楚；不确定的单独列在「待 Arvin 确认」下面，并加「状态/阻塞」。
7. 完成后加「规则已整理」，撤掉「状态/进行中」和自己的 `agent/<名字>`。调研类 issue 则在评论里写结论和建议，撤掉标签即可，不关闭 issue。

### claude / codex / minimax：实现
5. 从 `origin/canary` 切分支（迁移线 `mig/<issue编号>`，其他线 `task/<issue编号>`），按 issue 的"做法"和评论里的业务规则实现。规则里没写的不要自己补设定：加「状态/阻塞」，评论写问题，撤掉「状态/进行中」，结束。
6. 跑测试和对比工具，全部通过后推送，开 PR 合进 `canary`，第一行写 `Closes #<issue编号>`，按 PR 模板填写。
7. 不要自己合并 PR。

### 审核（claude 审别人的 PR；codex 审 claude 的 PR）
- 每轮先看有没有还没审过的 PR（实现 agent 看关联 issue 上的 `agent/<名字>` 标签；不能审自己做的）。逐条对照 issue 的业务规则和验收标准审核，必要时本地跑测试。
- 结论写成 PR 评论，**最后一行必须是机器可读标记**：通过写 `<!-- review:pass agent=<你的名字> -->`，要改写 `<!-- review:changes agent=<你的名字> -->` 并列出必须修改的地方。
- **合并是自动的**（`.github/workflows/auto-merge.yml`）：进 canary、CI 全绿、有别的 agent 的通过标记、关联 issue 不带「涉及资金」→ 自动合并 → issue 自动关闭 → canary 自动构建部署。任何 agent 都不手动合并。
- 「需Arvin审批」的 PR 也自动合并（审核要更严：逐条核对回滚路径）；只有「涉及资金」的 PR 由 Arvin 合并。

## 失败
同一个 issue 连续 3 轮做不完：加「状态/阻塞」，评论写明原因，撤掉自己的 `agent/*` 和「状态/进行中」，结束。

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

1. **释放卡死的任务**：带「状态/进行中」的 issue，如果 24 小时内既没有新评论、也没有关联分支的新提交或 PR，就撤掉「状态/进行中」和 `agent/*` 标签，评论"超时释放，可重新领取"。同一个 issue 第二次超时，改加「状态/阻塞」并写明原因。
2. **审核 PR**：对所有打开的、还没有审核意见的 PR，按上面「审核」一节审核并留标记。不手动合并。
3. **检查一致性**：PR 已合并但 issue 没关闭、issue 已关闭但标签还挂着「状态/*」之类的不一致，直接修正。
4. **汇报**：最后只输出下面这份汇报，不新建任何文件：
```
总调度 <日期 时间>
进度：按里程碑列出 已关闭/总数，P0 未完成的单独列出
今日完成：#编号 标题（谁做的）……
等 Arvin 合并：只列带「涉及资金」的 PR #N……
等 Arvin 回答：#编号 问题一句话……
超时释放：#编号……
异常：无 / 具体情况
```
