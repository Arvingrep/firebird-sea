---
name: 迁移一个 action 到 Go
about: 把火鸟 ajax.php 的一个 service.action 迁到 Go
title: "[Mx] service.action"
# 填写完 PHP 源码位置等信息后，再手动加「agent可领」「类型/*」「优先级/*」和里程碑；空模板不要加「agent可领」。
labels: ["线/迁移Go"]
---

总方案与"完成"的定义见 #298。

迁移 `service=<service>&action=<action>` 到 Go。

| 项 | 内容 |
|---|---|
| PHP 源码 | `webroot/api/handlers/<service>.class.php` 第 X–Y 行 |
| 读 / 写 | |
| 涉及资金表 | |
| 需要登录 | |
| 用到的表 | |

### 做法
1. 先读 PHP 源码，在本 issue 评论里列出业务规则。规则不清楚的地方写成问题，加「状态/阻塞」标签等 Arvin 回答，不要自己补设定。
2. 在 `services/api-go/internal/ajax/<service>` 里实现。
3. 写对比用例 `services/api-go/testdata/compare/<service>.<action>.json`。

### 验收
- [ ] L1：`go test` 覆盖正常、空结果、参数错误，CI `go-test` 通过
- [ ] L2：对比工具在 canary 上零差异（写操作只做 L1）
- [ ] PR 描述写 `Closes #<本 issue 编号>`
- [ ] 合并后加进 canary 的 `go.actions` 白名单，真机验证
