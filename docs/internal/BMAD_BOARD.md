# BMAD Delivery Board(Project #3)全链路

> 2026-10-10 落地。方案背景见 Hermes 调研稿 project-board-plan-hermes.md;6 项决定已由 Arvin 确认:
> 本机 gh 补 project scope / 30 个真实 Issue / 派发入口 bmad:approved 标签 / 分级沿用 TIERS 草稿 /
> #17 重新打开复用 / PR merged → 🚀 待发布(非 done)。

## 1. 全链路

```
epics.md + sprint-status.yaml(origin/main,30 Story)
   │ scripts/bmad/project-sync.js(默认 dry-run,--apply 才写;幂等键 <!-- bmad-story: KEY -->)
   ▼
GitHub Issue ×30(标签 bmad:story,不带 agent:dev → 不触发任何流水线)
   │ 同脚本 item-add + item-edit
   ▼
Project #3 条目 + 字段:BMAD Stage / Epic / Story ID / 分级 (Tier) / 依赖 / 可开工 (Ready) / 阻塞原因
   │ Arvin 在面板挑选 → 给 Issue 打 bmad:approved(唯一人工派发动作)
   ▼
bmad-approve.yml(issues:labeled)→ scripts/bmad/approve-check.js 校验:
   owner 本人加的标签?无在途 agent:dev?依赖满足?AGENT_AUTO_MERGE=0?
   human 级有 bmad:human-ack?无 bmad:halt?线上首页非 5xx?
   ├─ 通过 → 补 agent:dev + 评论 → 现有 agent-dev.yml 接管(Dev Agent 开工)
   └─ 不通过 → 评论原因 + 移除 bmad:approved(可改好后重打)
   ▼
PR 流转:PR opened → 🛡️ 独立验收;PR merged → 🚀 待发布上线(改动见 patches/bmad-board/);
Arvin 确认上线后 close Issue(或 workflow_dispatch 设 done)→ ✅ 已上线闭环
```

## 2. 标签含义

| 标签 | 谁打 | 含义 |
|---|---|---|
| `bmad:story` | project-sync.js | 已建档,只上板,不触发流水线 |
| `bmad:approved` | **仅 Arvin** | 批准开工;触发 bmad-approve 校验(他人添加被忽略) |
| `bmad:human-ack` | 仅 Arvin | human 级 Story 的二次确认,与 approved 同时在才放行 |
| `agent:dev` | bmad-approve(校验后) | 已派发,agent-dev.yml 在途;全局同时 ≤1 |
| `bmad:halt` | Arvin | 全局熔断:任何 open Issue 带它,一切派发拒绝 |
| `bmad:void` | Arvin | 作废 Issue:幂等键让位,project-sync 会视同不存在而重建 |
| `agent:qa` / `qa:accepted` / `qa:rejected` | QA 流水线 | 既有含义不变;映射见下 |

## 3. 状态映射(stageOf,方案 c)

基线 sprint-status:backlog/ready-for-dev→📋;in-progress→🚧;review→🛡️;done→✅。
覆盖(从高到低):Issue closed→✅;qa:accepted→🚀;agent:qa→🛡️;agent:dev(open)→🚧。
可开工(Ready)=Yes 仅当:依赖全部 review/done 且 Stage=📋。阻塞原因字段写未满足的依赖。
PR:opened→🛡️;merged→🚀(需 Arvin 提交 patches 里的 stage-mapping 改动)。

## 4. Arvin 的唯一日常动作

面板看 `可开工 (Ready)=Yes` 的条目 → 打开 Issue → 打 `bmad:approved`(human 级再加 `bmad:human-ack`)。其余全自动。

## 5. 熔断与回滚

- **全局熔断**:给任意 open Issue 打 `bmad:halt`(建议专用置顶 Issue);解除即恢复。
- **误建 Issue**:`gh issue close N` + 打 `bmad:void`(不删除,保审计);重跑 `--apply` 会按需重建。
- **误上板条目**:`gh project item-archive 3 --owner Arvingrep --id <item-id>`(可逆,不用 delete)。
- **字段写错**:直接重跑 `--apply`(声明式,全量对账收敛)。
- **误派发**:移除 `agent:dev` 标签并关闭对应 run;AGENT_AUTO_MERGE=0 下无自动合并风险。

## 6. 首次启用 5 步(按顺序)

1. 本机 gh 补 scope(浏览器授权):`gh auth refresh -s project`(含写;只读板用 read:project)。
2. Arvin 本人提交两处受保护文件(agent 不能动 .github/):
   拷贝 `docs/internal/patches/bmad-board/bmad-approve.yml` → `.github/workflows/bmad-approve.yml`;
   按 `bmad-project-sync.stage-mapping.patch` 改 `bmad-project-sync.yml`(merged→ready-to-release);
   并在仓库 Variables 配 `BMAD_HOMEPAGE_URL`(线上首页 URL,健康检查用)。
3. 干跑核对:`node scripts/bmad/project-sync.js`(默认 dry-run,输出 30 行计划 JSON;应见新建 29、复用 #17)。
4. 正式执行:`node scripts/bmad/project-sync.js --apply`(自动建缺失标签与字段、建 29 Issue、reopen #17、上板、写字段)。
5. 验证:面板出现 30 条、字段齐全;挑一个 Ready=Yes 的 Story 打 `bmad:approved` 走通一单。

## 7. 实现文件

- `scripts/bmad/project-sync.js`:建档/上板/字段,纯函数 planSync/stageOf + 可注入 gh 的 applyPlan。
- `scripts/bmad/approve-check.js`:派发校验,纯函数 evaluateApprove + CLI(workflow 调用)。
- `scripts/bmad/project-sync.test.js`:node:test 用例(计划、幂等、分级依赖、映射、approve 校验)。
- `scripts/bmad/story-to-issue.js`:小改——renderIssue 支持 labels 覆盖、导出 depsOf;原行为与测试不变。
- `docs/internal/patches/bmad-board/`:两份受保护文件草案,由 Arvin 本人提交。
