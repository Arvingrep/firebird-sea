# Agent 作业手册（AGENT PIPELINE）

> **这是本仓库所有 AI Agent 的唯一入口。** 动手前读完这一页，你就不需要再去翻别的规范。
> 版本：v1.2 · 2026-11-05 · 与 `RULES.md` §5.4、`gates.sh` 第 0 项保持一致。
> 规则表的**机器可读真相源**已独立成 `docs/agent/rules.yaml`（本文表格是给人读的叙述版）。
> 两者不一致时以 `rules.yaml` 为准，并用 `make rules` 检查——它会告诉你哪条规则缺执行点、
> 哪项门禁没有规则背书、哪个出处锚点已经指不到东西。
> 修订：补 P-01b owner 通道（2026-11-05 生效）；全部门禁引用改「检查项名」，代码引用改 `文件#签名`——行号是位置坐标，文件一改就静默失效，签名是内容坐标。
> 上一版（草案 v0.1）已作废，其「控制器 / 10 状态机 / 定时接单」设计**不予采纳**，原因见 §7。

---

## 0. 三十秒版

1. **有 TAPD 单才动手**。没单的改动不接。
2. **分支必须 `agent/{TAPD-ID}-{slug}`**，PR 目标 **`canary`**，不进 `main`。
3. **一个 PR 只动一个区**（§3 分区表），跨区就拆。
4. **提交前跑三条**：`repo-hygiene.sh` + `gates.sh` + `verify-task.sh`（或 `make verify`）。
5. **受保护路径不许碰**：`.github/`、`scripts/agent/`、`.agents/`。
6. **过程产物落 `.agent-runs/`**，命名照 §5，不要自创。
7. **不要请示已被本手册覆盖的事**。只有四类能升级 owner（§8）。
8. **不确定就选最保守方案并在 PR 里写明**。停下来问是最差的选项。

---

## 1. 规则优先级（冲突时按这个判）

本仓库的规则分散在六个文件里，历史上由不同 Agent 写成，存在互相矛盾。**冲突时按下列顺序取最高者**：

| 优先级 | 文件 | 管什么 | 谁能改 |
|---|---|---|---|
| 1（最高） | 本文 §2 的「机器门禁」条目 | 会 FAIL 的硬约束 | owner |
| 2 | `docs/REPO-CONVENTIONS.md` | 目录职责、分区、入库红线 | PR + 人工确认 |
| 3 | `.agents/RULES.md` | 工程铁律、GitOps、自主权 | owner |
| 4 | `automation/n8n/REGISTRY.md` | n8n 工作流登记 | 自动化 Agent |
| 5 | `docs/internal/RELEASE_FLOW.md` | 分支、镜像 tag、ArgoCD | 运维 Agent |
| 6 | 本文其余章节 | 流程与产物约定 | 队长 |

**判定方法**：先看会不会让 `gates.sh` / `verify-task.sh` / CI 变红。会红的，那条说了算。不会红的，按上表。
**已知过时条目**见 §7，不要按它们执行。

---

## 2. 强制规则清单

> 记号：**🤖** = 机器自动拦（你违反就会红）；**👤** = 人工 Review 守；**📄** = 仅约定（没人拦，靠你自觉）。
>
> **本节表格不是真相源。** 真相源是 `docs/agent/rules.yaml`——那里的每条 hard 规则都带两个可校验锚点
> （`enforce: 文件#检查项名`、`test: 文件#用例名`），`make rules` 会核对它们是否真的存在。
> 在下表加一行而不改 `rules.yaml`，等于加了一条没人证明的规则：`make rules` 会报「门禁项无背书」。

### 2.1 分支与 PR

| ID | 规则 | 执行 | 依据 |
|---|---|---|---|
| B-01 | 开发分支从中切出，命名 `agent/{TAPD-ID}-{slug}`；人类用 `feat/` `fix/` `chore/` | 📄 | 本文 |
| B-02 | **PR 目标分支是 `canary`**，不是 `main`。`canary` 验收通过后才开 `canary→main` 晋升 PR | 👤 | RULES §5.2 |
| B-03 | hotfix 可直接进 `main`，但合并后**必须回灌 canary** | 👤 | RULES §5.2 |
| B-04 | PR 标题 `type(scope): 描述 (TAPD-{ID})`，type ∈ feat/fix/chore/docs/refactor/release | 📄 | REPO-CONVENTIONS §2.3 |
| B-05 | 一个 PR 只动一个区（分区见 §3）。跨区 = 拆 PR，描述里写依赖顺序 | 👤 **（待机器化，见 §7-M10）** | REPO-CONVENTIONS §5.1 |
| B-06 | **单 PR 增量 ≤ 1200 行**（`docs/`、`.agents/`、`package-lock.json` 不计）。`canary→main` 晋升 PR 豁免 | 🤖 | `「增量 ≤ 1200 行」第 2 项` |
| B-07 | 单次提交建议 ≤ 200 行 | 📄 | RULES §4.2 |
| B-08 | **分支前缀决定是否触发 Agent 门禁**：只有 `agent/` `arvino/` `feature/` `owner/` 会跑 QA Agent 并锁受保护路径。用 `chore/` `fix/` `feat/` 则不会。**`owner/` 前缀只给 owner 用**：agent 借它取通道要同时满足 P-01b 的两个信号并留下标签记录，属越权留痕，不是许可 | 🤖 | `ci-verify.yml` 分支白名单（gates job 与 agent-qa job 各一处） |

> ⚠️ **B-08 是真实口子，不是许可**（见 §7-M05）。注意 `feat/` 和 `feature/` 只差两个字母，**但只有 `feature/` 在名单里**；`RELEASE_FLOW.md` 推荐的恰恰是不触发的 `feat/`。用 `chore/` 或 `feat/` 开 PR 可以改 `.github/` 而不被拦——**不要利用它**，Agent 一律用 `agent/` 前缀（B-01）。

### 2.2 受保护路径

| ID | 规则 | 执行 |
|---|---|---|
| P-01 | `.github/`、`scripts/agent/`、`scripts/acceptance/`、`.agents/` **只能 owner 改**，Agent 分支触碰即 FAIL；`owner/` 前缀分支走 P-01b 通道 | 🤖 `「受保护路径未改动」第 0 项` |
| P-01b | **owner 通道（2026-11-05 生效）**：分支前缀 `owner/` **且** PR 带 `owner-approved` 标签，两个信号同时成立 → 门禁记 `⚠️ WARN` 放行；缺任一个仍 FAIL。**操作顺序：先打标签再 push**（`pull_request` 事件不含 `labeled`，事后补标签不会复跑，只能再 push 或重开 PR） | 🤖 同上 |
| P-01c | **这条通道只是流程标记，不是安全边界**：agent 用的 `AGENT_GH_TOKEN` 与 owner 是同一个账号，能建 `owner/*` 分支、能自己打标签。它买到的是「留痕可追责」，不是「防越权」。真正的隔离只能靠 GitHub Environment required reviewers 或凭证分离（跟踪项 #192） | 👤 |
| P-01d | 0b「护栏未削弱」：统计 base 与本次 diff 里硬门禁条数的变化，减少即记 `⚠️ WARN`；**2026-11-19 起转 `❌ FAIL`**。拆一条门禁也算削弱——这条专门防「PR 里顺手把拦路的检查删了」 | 🤖 `「护栏未削弱」第 0b 项` |
| P-02 | 重命名会被拆成「删除源 + 新增目标」（`--no-renames`），把受保护文件挪走同样算违规 | 🤖 |
| P-03 | 改这些路径时不要想绕过：`gates.sh` 用 `main` 上的版本执行，改 PR 里的门禁本身无效 | 🤖 `qa.sh#GATE_REPO_DIR` |

### 2.3 依赖

| ID | 规则 | 执行 |
|---|---|---|
| D-01 | **新增 npm/composer 依赖必须先在 `base` 分支登记**到 `.agents/approved-deps.txt`。同一个 PR 里自己登记**无效**（门禁读的是 base 分支上的文件） | 🤖 `「Zero-Dep」第 5 项` |
| D-02 | 登记格式 `<包名> <版本串>`，版本串须与 `package.json` **完全一致**（`^4.21.2` 和 `4.21.2` 是两回事） | 🤖 |
| D-03 | 版本变化需重新登记一行 | 🤖 |
| D-04 | 只有 owner 能改 `approved-deps.txt`；Agent 分支的改动会被丢弃 | 👤 |
| D-05 | 优先用原生能力（`node:crypto` / `node:https` / PHP 内置）。不要为 10 行逻辑引一个包 | 📄 |

> 新增依赖的正确姿势：**两个 PR**。先提「只改 approved-deps.txt」的 PR 给 owner 合，再提使用它的 PR。

### 2.4 文档同步

| ID | 规则 | 执行 |
|---|---|---|
| C-01 | 改了 `*.php/js/ts/vue/sql`（且不在 `scripts/`、`.github/`、`automation/` 下）→ **必须同 PR 改 `docs/`** | 🤖 `「Docs-as-Code」第 3 项` |
| C-02 | 改 `services/api/src/{server,fbProxy,*Route}.js` → **必须带** `services/api/test/` 测试 + `docs/api/openapi.yaml` 更新，且契约双向一致 | 🤖 `「API 契约同步」第 10 项` |
| C-03 | 改 `webroot/api/handlers/*.class.php` 的 public 方法 → 更新 `docs/api/openapi-waimai-article.yaml` | 👤（无机器校验） |
| C-04 | 改 n8n 工作流 → 更新 `automation/n8n/REGISTRY.md` | 👤 |
| C-05 | 改 `deploy/helm/**` → `helm lint` + 所有 `values-*.yaml` 渲染通过 | 🤖 `「Helm 多站点渲染」` |
| C-06 | **动了 Dockerfile 或删/改任何被它引用的目录** → 全仓 Dockerfile 的 `COPY` 源路径必须存在，`COPY --from=` 必须指向已定义的构建阶段 | 🤖 `「Dockerfile 引用路径存在」第 12 项` |

> ⚠️ C-01 的坑：`deploy/**/*.js` 也被算作「业务代码」（`deploy/` 不在排除列表里）。改部署侧 JS 同样要带 `docs/`。
>
> ⚠️ C-06 的来历（#189）：删掉 `apps/tma`，`deploy/docker/Dockerfile.api` 仍 `COPY apps/tma/ ./`。
> 当时门禁 **14 项全绿**、CI **4 个 job 全绿**，唯一的拦截来自 QA 人工读 diff。
> 原因很朴素：门禁只校验「diff 里的规范问题」，从不校验「引用的东西还在不在」。
> 这类断引用的报错发生在 `docker build`，也就是**合并之后**——发现得最晚、回溯最贵（报错指着 COPY 行，不指着是谁删了目录）。

### 2.5 安全

| ID | 规则 | 执行 |
|---|---|---|
| S-01 | 严禁私钥、助记词、`TRONGRID_API_KEY` 明文、TG bot token 入仓（增量 **和** 全仓都扫） | 🤖 `「无密钥泄漏（增量）」+「无密钥入库（全仓）」第 6 项` |
| S-02 | 存量泄漏登记在 `.agents/secret-scan-allow.txt`，格式 `<路径> <到期日> <原因>`。**到期即 FAIL**，日期解析失败按已过期处理 | 🤖 |
| S-03 | Secret 由 owner 一次性创建，Agent **不创建、不读取其值** | 👤 |
| S-04 | 前端与 TMA 代码绝不出现助记词、私钥、有资金权限的 Key | 👤 |
| S-05 | 推送前脱敏：`qa.sh` 的 `redact()` 会自动处理 GitHub token / Bearer / PEM / TG token | 🤖 `lib.sh#redact` |

### 2.6 代码质量

| ID | 规则 | 执行 |
|---|---|---|
| Q-01 | 无 `.bak` / `.tmp` / `.orig` / `test_*.php` | 🤖 `「无垃圾文件」第 4 项` |
| Q-02 | 无 `var_dump` / `print_r` / `console.log` / `debugger`（`scripts/`、`deploy/` 豁免） | 🤖 `「无调试残留」` |
| Q-03 | 改动文件语法必须过：php / js / sh / json | 🤖 `「改动文件语法」` |
| Q-04 | 非空交付（相对 base 必须真有改动） | 🤖 `「非空交付」第 1 项` |
| Q-05 | API 响应统一 `{ success, data?, error?: {code, message} }` | 👤 |
| Q-06 | 受保护接口必须校验 Telegram `initData` 的 HMAC-SHA256，失败返回 401 | 👤 |
| Q-07 | 金额必须显式区分 `PHP`（2 位小数）与 `USDT`（≤6 位小数） | 👤 |

### 2.7 仓库卫生

| ID | 规则 | 执行 |
|---|---|---|
| H-01 | 严禁同步冲突副本（`xxx 2.md`、`xxx (1).py`、`conflicted copy`） | 🤖 `repo-hygiene.sh` |
| H-02 | `.agent-runs/`、`backup_configs/`、`node_modules/`、`downloads/`、`.n8nac/` 不入库 | 🤖 |
| H-03 | 新增文件 > 5MB 拦（存量火鸟资产豁免） | 🤖 |
| H-04 | **禁止在仓库根目录新增文件**。根目录只允许 README / Makefile / docker-compose / AGENTS.md / package.json / .gitignore / .env.example | 👤 |
| H-05 | 禁止重建已下线目录：BMAD 体系、`services/tg-bot`、`scripts/acceptance/`、`agent/{dev,story}.sh`、自建 agent 派单。注：`scripts/acceptance/` 虽已下线，仍在 P-01 受保护路径清单内——**下线的是它的内容，不是它的保护** | 👤 |

### 2.8 运维（GitOps）

| ID | 规则 | 执行 |
|---|---|---|
| O-01 | **集群期望状态 = Git**。改副本/资源/探针/环境变量/Ingress/CronJob/镜像 tag 一律走 PR | 👤 |
| O-02 | `kubectl` / ArgoCD 工具**只读**（get/describe/logs/events/top）。写操作仅 owner 应急 | 👤 |
| O-03 | 手改会被 `selfHeal` 抹掉，不要依赖 | 🤖 ArgoCD |
| O-04 | 「需要重启 Pod」通常说明镜像 tag 用了可变 tag，去改 Git，不要 `rollout restart` | 📄 |
| O-05 | **canary 构建绝不推 40 位 SHA tag**（Image Updater 追 SHA，会把未验收镜像滚进生产）；`values-canary.yaml` 的 `image.tag` 不得改回 `latest` | 👤 |
| O-06 | 回滚方式必须是「revert 这个 PR」。不是 → 设计有问题 | 📄 |

### 2.9 线上任务与验收

| ID | 规则 | 执行 |
|---|---|---|
| T-01 | GitHub 上的 Agent 状态由 label 表达：`agent:dev` → `agent:qa` → `qa:accepted` / `qa:rejected` / `agent:blocked` | 🤖 `lib.sh#ensure_labels` |
| T-02 | 返工上限 `AGENT_MAX_ATTEMPTS`，默认 3。超限打 `agent:blocked`，**停止自动返工，等人** | 🤖 `lib.sh#AGENT_MAX_ATTEMPTS` |
| T-03 | QA Agent 的脚本与规则**一律取自 base 分支**，不信 PR 里的版本 | 🤖 `lib.sh#self_copy`（base 副本） |
| T-04 | 拒绝 fork PR（自托管 runner 安全边界） | 🤖 `qa.sh#isCrossRepository` |
| T-05 | QA 输出解析失败 → fail-closed 判 REJECTED | 🤖 `qa.sh#fail-closed` |
| T-06 | `AGENT_AUTO_MERGE` 默认 `0`：QA 通过也**等人工合并**。要自动合并须 owner 在仓库 Variables 显式设 1 | 🤖 |

---

## 3. 分区（一个 Agent 一次只占一个区）

| 区 | 路径 | 可并行前提 |
|---|---|---|
| A 站点 | `webroot/**` | 独立 |
| B PHP 后端 | `webroot/api/**`、`webroot/include/config/**` | 独立 |
| C 自动化 | `automation/n8n/**` | 独立；同一工作流同一时间只能一个 Agent 改 |
| D 服务 | `services/**` | 同服务内串行，跨服务并行 |
| E 部署 | `deploy/**`、`.github/**` | **全局串行锁** |
| F 文档 | `docs/**` | 独立 |
| G 脚本 | `scripts/**` | 独立；改动须跑 `test-gates.sh` |

**字母定义以 `docs/REPO-CONVENTIONS.md` §5 为准**，本表只是转写。判定时**更具体的分区优先**：`webroot/api/**` 同时命中 A 和 B，算 **B**。

> **A 区的历史遗留**：`apps/tma/` 已于 2026-11-04 归档（`docs/archive/tma-legacy-2026-11-04.tar.gz`），**不再是一个区**。要重做前端，按 `webroot/` 或新建 `apps/<name>/` 走，先提方案给 owner。

**分区与 TAPD「边界」字段一一对应**：开单时必须写明本单占哪个区，未写明的单不接。

---

## 4. 任务流转（唯一认可的路径）

```
TAPD(open)  ──需求录入────────────────────────────────────┐
   │  必填：目标 / 验收标准（可被命令或截图判定）/ 分区 / 风险
   ▼
TAPD(progressing)  ──认领，建 run 目录 + meta.json───────┐
   │
   ├─▶ 调查（只读）→ investigation-report.md
   ├─▶ 实现 → 开 agent/{ID}-{slug} 分支 → PR(canary) → implementer-report.md
   ├─▶ 审查 → review-report.md（自审或独立 Agent）
   ├─▶ 验证 → test-report.md + verification-report.md（PASS/FAIL + 证据）
   │         FAIL ─▶ 回实现，≤2 轮；超限 ─▶ blocked-report.md，等人
   └─▶ merge（人工）→ ArgoCD 同步 → final-summary.md → TAPD(done)
```

**TAPD 只存粗粒度状态**（open / progressing / done），七个细粒度阶段写在 `meta.json` 里（§5）。不要在 TAPD 里造 `ready/claimed/investigating` 这类自定义状态 —— TAPD 装不下，控制器也读不到。

### 4.1 谁来接单

**没有常驻调度器。** 接单由人发起一次会话，Agent 读 TAPD 队列后认领。理由见 §7-M1。

- 认领条件：TAPD 状态 `open` 或 `progressing` + owner 是 AI 小队 + 边界字段齐全
- 一次只认领一个单、一个区
- 认领动作 = 写 `TAPD(progressing)` + 建 run 目录，**两步都做才算认领**

### 4.2 n8n 在链路上的位置

| 事件 | 去向 |
|---|---|
| CI 构建 / ArgoCD 上线 | `agent_pipeline_events_to_tg.json` → TG（**只下行，不回写 TAPD**） |
| QA 打回 / 合并 / blocked | `scripts/agent/lib.sh: notify()` → 同上 webhook |

**要回写 TAPD 是新增能力，不是现状。** 动手前先解 `REGISTRY.md` 的三条 P0（§7-M12）。

### 4.3 第 9 个终态：waiting（挂起态）

任务在等待外部输入（等真人验收 / 等 owner 决策 / 等另一个 Agent 让出资源）时**必须转 waiting，不允许悬置**——历史上 5 个烂尾任务全部死于此。转 waiting 时在 plan.md 里写明两行：

- **等待对象**：谁 / 什么事件（例：等 owner 对方案三选一拍板；等真机验收）
- **恢复条件**：满足什么即继续（例：owner 在 plan.md 回填结论；TAPD 连接恢复后执行）

---

## 5. 过程产物：`.agent-runs/`

**目录结构（唯一合法形式）**

```
.agent-runs/{YYYY-MM-DD}/{TAPD-ID}-{slug}/
├── meta.json                    # 可选，见下
├── plan.md
├── investigation-report.md
├── implementer-report.md
├── review-report.md
├── test-report.md
├── verification-report.md
└── final-summary.md | blocked-report.md
```

**文件名照抄，不要自创**（历史上出现过 `implementation-report.md` / `verification.md` 两种写法，已废弃）。

**`meta.json` 参考字段**（可选，不再强制）

```json
{
  "tapd_id": "1000123",
  "tapd_workspace": "<workspace_id>",
  "partition": "A",
  "branch": "agent/1000123-fix-login",
  "pr": 188,
  "status": "implementing",
  "started_at": "2026-11-04T14:00:00+08:00"
}
```

`meta.json` 与 `{TAPD-ID}-{slug}` 目录命名规则均**降为可选**，不再强制——现存 8 个 run 目录全部是 `task-NNN` 编号、0 个 meta.json，规范必须与现状一致而不是相反。新建 run 目录沿用 `task-NNN` 编号即可；补写 meta.json 仍是推荐的追溯增强。

**`final-summary.md` 固定五段**：`FINAL STATUS` / `CHANGED_FILES` / `VERIFICATION` / `REPORTS` / `KNOWN_ISSUES`。

**会话收口强制**：任何 Agent 会话结束前，无论进展到哪一步，必须写终态文件（哪怕只有几行）——已完成/部分完成写 `final-summary.md`（注明剩余事项），被阻塞写 `blocked-report.md`（阻塞原因 + 恢复条件）；同时**同步更新 plan.md 的状态字段**。不写收口文件的会话一律视为烂尾。

> `.agent-runs/` 在 `.gitignore` 里，**过程文档不上库**。需要沉淀的结论升格到 `docs/internal/`，升格后再提交。

---

## 6. 提交前自检（照抄执行）

```bash
# 0. 三把尺（只读、与 diff 无关、秒级；查的是「仓库自己讲的话前后一致不一致」）
make check-rules          # = spec-lint + check-rings + check-anchors
#   make lint     规范面自洽 9 项
#   make rules    规则真相源：四环齐不齐 + gates.sh 每个检查项有没有规则背书 + src 锚点
#   make anchors  文档里指向执行面的锚点还准不准

# 1. 仓库卫生（新增文件是否合规）
bash scripts/repo-hygiene.sh

# 2. 确定性门禁（15 项检查 + 基线行；检查项清单以 `make rules` 的背书表为准）
bash scripts/agent/gates.sh origin/canary

# 3. 流程自测 + 单测 + DB（CI 必过项，本地慢）
bash scripts/verify-task.sh
# 或：make verify

# 4. 改了 services/api 路由才需要
node scripts/api-contract-check.js

# 5. 改了 scripts/ 或 .github/ 才需要
bash scripts/test-gates.sh
```

**门禁报告出现 `⚠️ SKIP` 不等于 PASS**，那表示本机缺工具（php/helm），以托管 runner 的结果为准。

---

## 7. 已知矛盾与处置（2026-11-04 清理记录）

这一节是给下一个 Agent 的「避坑地图」。看到旧文档写下面这些，**以本节为准**。

| ID | 矛盾 | 现状 | 处置 |
|---|---|---|---|
| M-01 | **两套任务真相源**：GitHub Issue+label（`qa.sh`）vs TAPD story（旧草案） | 代码里在跑 Issue+label，草案要求 TAPD | TAPD 管**需求**，Issue/PR 管**交付**，`.agent-runs` 管**过程**，三者用 TAPD ID 串起来。不要试图统一成一套 |
| M-02 | `qa.sh` 打回后给 issue 打 `agent:dev` 标签，指望 `dev.sh` 返工，但 **`dev.sh` 已于 2026-10-27 下线** | 打回后无人响应，issue 永久卡住 | QA 打回 = **人工接手**。要恢复自动返工必须先重建 `dev.sh` 并解 P-01 冲突 |
| M-03 | `.agents/RULES.md` §4.3 要求「必须通过 Acceptance Agent 审查」，但 Acceptance 体系已整体下线 | 规则指向不存在的组件 | 以 `qa.sh`（独立 QA Agent）为准，Acceptance 条款作废 |
| M-04 | `REPO-CONVENTIONS.md` §2 仍把 `apps/tma/` 列为 A 区、归前端 Agent | 目录已归档（2026-11-04） | **本轮才修**：此前这里写着「已修」，但文件里实际没改（2026-11-05 复核发现）——已删目录职责表那一行、决策树改指归档、分区表改为「A 站点页面 = `webroot/**`」。**「已修」这两个字本身也需要被核对** |
| M-05 | 分支前缀白名单只有 `agent/ arvino/ feature/ owner/`，但 `RELEASE_FLOW.md` 推荐的开发分支是 `feat/*` | **`feat/` 不在名单里，`feature/` 才在**——一个字母之差，决定跑不跑 QA。用 `chore/` `fix/` `feat/` 开 PR 可绕过 QA 和受保护路径锁 | 已知缺陷。**Agent 一律用 `agent/` 前缀**（B-01），不要利用这个口子 |
| M-06 | `.agents/RULES.md` 说增量排除「docs/、.agents/、_bmad-output/」，`gates.sh` 实际排除「docs/、.agents/、package-lock.json」 | `_bmad-output` 已下线，无影响；`package-lock.json` 是新增豁免 | 以 `gates.sh` 为准（B-06） |
| M-07 | 文档引用的 `AGENT_PIPELINE.md` 曾只存在于某台机器的工作区（未入库），且命名大小写不一致 | Linux/CI 断链，macOS 不报错——「本机能打开」不等于仓库里有 | 已入库，**文件名以大写 `AGENT_PIPELINE.md` 为准**，链接一律用大写 |
| M-08 | 旧草案 10 状态机 vs TAPD 3 状态 | TAPD 装不下 7 个中间状态 | **已砍**：TAPD 三态 + `meta.json` 细粒度（§4） |
| M-09 | 旧草案 `.agent-runs/{日期}/task-NNN` 编号按日重置 | 编号跨日重名，与 TAPD 无映射 | **已改**：目录名用 `{TAPD-ID}-{slug}` |
| M-10 | 旧草案「上线前置检查」三项（单区/登记同步/归档完整）无一有机器执行 | 写成「前置检查」会给人虚假安全感 | 降级为**人工 checklist**（B-05 / C-03 / C-04）。单区检查待加进 `gates.sh` |
| M-11 | `package.json` 的 `verify:docs` 指向不存在的 `scripts/verify-docs.js` | `npm run verify:docs` 必挂 | 已知坏引用，别调它。用 `verify-task.sh` |
| M-12 | `REGISTRY.md` 三条 P0 未修（canary 硬编码 / webhook 无鉴权 / `staticData` token 空串 + `requireSyncBack`） | 改 n8n 时一次 push 可能覆盖线上 token | **动 n8n 前先解**，否则不要自动改工作流 |
| M-13 | 旧草案「控制器 + 定时接单」= 复活已下线的施工侧 Agent 派单 | 与 AGENTS.md 红线 4 直接冲突 | **不采纳**：无常驻调度器，接单由人发起（§4.1） |
| M-14 | **删目录不改 Dockerfile**：`apps/tma` 删除后 `Dockerfile.api` 仍 `COPY apps/tma/ ./`，而门禁 14 项、CI 4 个 job 全绿 | 断引用只在 `docker build` 时炸，也就是**合并之后**；报错指着 COPY 行，不指着「是谁删了目录」 | **已修**：新增 C-06 门禁第 12 项，全仓 Dockerfile 的 `COPY` 源路径 + `--from` 阶段一并校验；并补 3 条用例（断路径必红 / 缺阶段必红 / 多阶段 `--from` 不得误伤）。同类隐患：`scripts/verify-task.sh` 里 `if [ -f apps/tma/package.json ]` 的守卫恒为假，静默跳过 —— 见 #200 |

---

## 8. 自主权：什么时候可以不问

**默认：不问，自己做，在 PR 里写清依据。**

只有四类必须升级 owner：

1. 费用变化（新付费服务、配额升级）
2. 架构脊柱 / 系统边界 / 技术栈变更
3. 资金路径、支付、密钥相关
4. 需要放宽本手册或门禁本身

**升级格式**：一句话问题 + 两个可选项 + 你的推荐。不要开放式提问。

**豁免**：即使命中上述四类，只要存在与既有 AD/RULES 一致的选项（不新增依赖、不新增密钥持有者、不推翻既有决定），**直接选它执行**，PR 里记一行「依据 AD-xx / 既有约定自行决策」。

**禁止**：「要不要我开始下一个任务？」「需要我继续吗？」「请确认是否可以」。同一问题重复请示两次按 QA 打回处理。

---

## 9. 这个文件怎么维护

- **改本文需要 PR**，且 `docs/` 区改动，同样过 `gates.sh`（C-01 满足）。
- 新增一条**机器门禁**时，必须同时做三件事：改脚本 → 本文 §2 加一行 → `scripts/test-gates.sh` 加用例。缺一件不算完成。
- 发现新的矛盾，**加到 §7 而不是就地改**：先记录、再统一处置，避免边改边制造新矛盾。
- 本文与 `REPO-CONVENTIONS.md` 冲突时，后者关于「目录职责 / 分区 / 入库红线」的部分优先；其余以本文为准。

---

## 10. 闭环四要素（立法）

一条规范要能落地，必须四环齐全：

1. **产生** —— 写在哪个文档、由谁维护、冲突时以谁为准
2. **执行** —— 机器拦（gates / verify-task / CI）还是谁在什么时机跑
3. **检查** —— 怎么证明被遵守（可复现的证据：脚本输出、报告、PR diff）
4. **收口** —— 终态文件（`final-summary.md` / `blocked-report.md`）+ 状态回写（plan.md / TAPD）

**这四环现在有机器在读**：`docs/agent/rules.yaml` 用 `enforce` / `test` / `src` 三个锚点把
「执行」「检查」「出处」写成可校验的引用，`make rules` 每次核对；缺任何一环就红。
「收口」仍靠 `.agent-runs/` 的终态文件（`spec-lint.sh` S5 只能看到「有没有」，看不到「真不真」）。

**立法**：今后新增任何规范条目必须四环齐全，缺环即机器化（改脚本 → §2 加行 → `test-gates.sh` 加用例）或删除该条目。历史遗留的 📄 纯自觉条目在每次触碰时按此标准改造。
