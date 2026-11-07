---
name: 迁移一个 action 到 Go
about: 把火鸟 ajax.php 的一个 service.action 迁到 Go
title: "[Mx] service.action"
labels: ["线/迁移Go", "agent可领"]
---

迁移 `service=<service>&action=<action>` 到 Go。

| 项 | 内容 |
|---|---|
| PHP 源码 | `webroot/api/handlers/<service>.class.php` 第 X–Y 行 |
| 读 / 写 | |
| 涉及资金表 | |
| 需要登录 | |
| 用到的表 | |

### 做法
1. 先读 PHP 源码，在本 issue 评论里列出业务规则。规则不清楚的地方写成问题，加 `阻塞` 标签等 Arvin 回答，不要自己补设定。
2. 在 `services/firebird-go/internal/modules/<service>` 里实现。
3. 写对比用例 `services/firebird-go/testdata/compare/<service>.<action>.json`。

### 验收
- [ ] 对比工具在 canary 数据上零差异
- [ ] PR 描述写 `Closes #<本 issue 编号>`
- [ ] 合并后加进 canary 的 `go.actions` 白名单，真机验证
