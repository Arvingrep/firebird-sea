# BMAD Method v6.12 — firebird-sea Setup

Installed: 2026-10-15
Version: bmad-method@6.12.2 (BMad Core + BMad Method modules)
Tool integration: Claude Code (29 skills → `.claude/skills/`)

## Installation

```bash
npx bmad-method install \
  --modules bmm \
  --tools claude-code \
  --user-name "Arvin" \
  --communication-language English \
  --document-output-language English \
  --output-folder _bmad-output \
  --yes
```

Prerequisites: Node.js 20.12+ (v26.8.1 ✓), Python 3.10+ (3.12.14 ✓), uv (0.12.23 ✓)

## Directory Layout

| Path | Purpose |
|------|---------|
| `_bmad/` | BMAD framework core (36 files) — scripts, config, module data |
| `_bmad/config.toml` | Installer-managed config (read-only) |
| `_bmad/config.user.toml` | Personal install answers (read-only, regenerated) |
| `_bmad/custom/config.toml` | Team overrides (committed) |
| `_bmad/custom/config.user.toml` | Personal overrides (gitignored) |
| `_bmad/scripts/` | Python helpers: render_skill, resolve_config, memlog |
| `_bmad/render/` | Rendered skill snapshots (gitignored) |
| `.claude/skills/` | 29 Claude Code skill integrations (214 files) |
| `_bmad-output/planning-artifacts/` | Phase 1-3 outputs (briefs, PRDs, architecture, epics) |
| `_bmad-output/implementation-artifacts/` | Phase 4 outputs (sprint status, retros) |

## Installed Skills (29)

### Core Module
| Skill | Code | Purpose |
|-------|------|---------|
| bmad-help | BH | Analyze state, recommend next skill |
| bmad-advanced-elicitation | AE | Push drafts deeper (pre-mortem, red team, socratic) |
| bmad-brainstorming | BSP | Guided ideation session |
| bmad-customize | BC | Override agent/workflow behavior |
| bmad-deep-recon | RS | Research to support decisions |
| bmad-forge-idea | FI | Pressure-test a half-formed idea |
| bmad-party-mode | PM | Multi-agent roundtable discussions |
| bmad-review | RV | Review diffs, PRDs, specs, prose with lenses |

### BMad Method Module (BMM)

#### Agents
| Agent | Name | Role |
|-------|------|------|
| bmad-agent-analyst | Mary 📊 | Business Analyst |
| bmad-agent-pm | John 📋 | Product Manager |
| bmad-agent-ux-designer | Sally 🎨 | UX Designer |
| bmad-agent-architect | Winston 🏗️ | System Architect |
| bmad-agent-dev | Amelia 💻 | Senior Software Engineer |

#### Planning Skills (Phase 1-3)
| Skill | Code | Phase | Purpose |
|-------|------|-------|---------|
| bmad-product-brief | CB | 1-plan | Capture product idea in a brief |
| bmad-prfaq | WB | 1-plan | Amazon Working Backwards challenge |
| bmad-prd | PRD | 2-planning | Create/edit/validate PRD |
| bmad-ux | CU | 2-planning | UX design + experience docs |
| bmad-spec | SPC | anytime | Distill inputs into SPEC.md |
| bmad-project-context | PC | anytime | Setup/refresh AGENTS.md |
| bmad-architecture | CA | plan | Architecture decisions document |
| bmad-create-epics-and-stories | CE | plan | Break PRD into epics/stories |
| bmad-sprint-planning | SP/SS | plan | Readiness check + sprint status file |

#### Ship Skills (Phase 4)
| Skill | Code | Phase | Purpose |
|-------|------|-------|---------|
| bmad-build | BD | ship | Clarify → plan → implement → review → present |
| bmad-build-auto | — | ship | Unattended dev loop iteration |
| bmad-code-review | CR | ship | Parallel multi-reviewer code review |
| bmad-correct-course | CC | anytime | Assess mid-sprint change impact |
| bmad-qa-generate-e2e-tests | QA | ship | Generate API/E2E tests |
| bmad-walkthrough | WT | ship | Guided human review of changes |
| bmad-retrospective | ER | ship | Epic retrospective with findings |

## Mapping to Arvino Workflow

The existing firebird-sea workflow uses `.agents/tasks/` for task tracking and `_bmad-output/` for artifacts. Here's how BMAD phases map:

| Arvino Step | BMAD Skill(s) | Output Location |
|-------------|---------------|-----------------|
| **Idea / Brief** | `bmad-product-brief` (CB) or `bmad-prfaq` (WB) | `_bmad-output/planning-artifacts/briefs/` |
| **PRD Creation** | `bmad-prd` (PRD) | `_bmad-output/planning-artifacts/prds/` |
| **UX Design** | `bmad-ux` (CU) | `_bmad-output/planning-artifacts/` |
| **Architecture** | `bmad-architecture` (CA) | `_bmad-output/planning-artifacts/architecture/` |
| **Epic/Story Breakdown** | `bmad-create-epics-and-stories` (CE) | `_bmad-output/planning-artifacts/epics.md` |
| **Sprint Planning** | `bmad-sprint-planning` (SP) | `_bmad-output/implementation-artifacts/sprint-status.yaml` |
| **Task Implementation** | `bmad-build` (BD) | Working code, reviewed |
| **Code Review** | `bmad-code-review` (CR) | Findings report |
| **QA / E2E Tests** | `bmad-qa-generate-e2e-tests` (QA) | `_bmad-output/implementation-artifacts/` |
| **Retrospective** | `bmad-retrospective` (ER) | `_bmad-output/implementation-artifacts/` |
| **Research / Spike** | `bmad-deep-recon` (RS) | `_bmad-output/planning-artifacts/research/` |
| **Agent Instructions** | `bmad-project-context` (PC) | `AGENTS.md` managed block |

### Quick-start Commands

```
bmad-help          → "What should I do next?"
bmad-build         → Implement a story/feature
bmad-sprint-planning status → Check sprint progress
bmad-code-review   → Review current changes
bmad-correct-course → Handle mid-sprint scope change
```

## Verification

- ✅ `bmad-build` renders workflow via `uv run render_skill.py` — produces actionable workflow.md
- ✅ `bmad-help` reads `_bmad/_config/bmad-help.csv` catalog — 29 skills indexed
- ✅ `resolve_config.py` merges layered TOML config — user_name="Arvin" resolved correctly
- ✅ All 5 BMM agents configured (Mary, John, Sally, Winston, Amelia)
