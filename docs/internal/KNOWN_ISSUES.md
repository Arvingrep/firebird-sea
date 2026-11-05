# KNOWN_ISSUES · 已知问题台账

> 只记「已确认存在、当前决定不修」的问题。
> 每条必须写清：现象 → 根因 → 为什么现在可接受 → 将来怎么修（优先级） → 什么条件下必须重修。
> 新条目按 KI-序号 递增，不要删除历史条目，结案改成「已修复（commit）」并保留原文。

---

## KI-001 · 登录防重放计数在多个副本之间不共享

**状态**：接受风险，暂不修复（2026-11-05，裁决人 team-lead，复核人 Vic）

**现象**

`/api/fbs` 的登录网关用「同一份 initData 的 sha256」做键，在文件里累计使用次数，
超过阈值返回 `429 REPLAY_LIMITED`。计数落在 PHP 容器内的文件系统上：

- 默认路径 `webroot/data/cache/fbs_bridge/`（`bridge.php:203`）
- Helm chart 里 `data/` 是 `emptyDir`（`deploy/helm/firebird-site/templates/_helpers.tpl:215`）
- 而 `replicaCount: 2`（同一份 values）

后果：**每个 Pod 各算各的**，实际额度 = 5 × 2 = 10 次；Pod 重建后计数清零，
额度恢复成 5 次。日志里两个 Pod 各自打 `[fbs_gateway] replay limited: count=6`，
从单个 Pod 的视角看行为完全正常，容易被误判为「已经生效」。

**根因**

计数存储是「单机本地文件 + `emptyDir`」，天然不具备跨副本语义。

**为什么现在可以接受**

1. **威胁模型没有变化**。能拿到 initData 的人本来就能签发登录 Cookie；
   5 次和 10 次的差别不构成质变，防重放在这里是「降低重放收益」而不是「阻断重放」。
2. **重启清零 ≠ 无限**。每次重建只是恢复成 5 次，不是「清零后可无限续」，
   最坏情况仍被 `FBS_BRIDGE_REPLAY_TTL`（7200s）的窗口约束。
3. **三条修法都比问题重**：
   - Redis 计数：要先确认 PHP 镜像装了 redis 扩展（没装就要改基础镜像，全线风险）；
   - `data/` 换 PVC：2 副本下要处理 `ReadWriteOnce` 的访问模式，改错比不改更糟；
   - `replicaCount: 1`：滚动发布会变成停机，为一个辅助防护搭上可用性，不划算。

**若将来要修，优先级**

`Redis 计数` > `PVC` > `单副本`

**什么条件下必须重修**

- 主站要上 4 个以上副本（额度随副本数线性放大，`5 × N` 开始失去意义）；
- 有用户或运营反馈「同一笔单被重复提交」；
- 防重放从「辅助」升级为「准入条件」（例如把 `REPLAY_LIMITED` 纳入风控/审计口径）。

---

### 附带确认：计数文件是惰性过期，没有定时 GC

`fbs_bridge_replay_check()`（`webroot/api/fbs/bridge.php:198-245`）只做「读 → 过期则从 0 重算 → 写回」，
**不会删除任何文件**；过期时间写在文件内容里（`"<count> <expiry>"`），不是靠 mtime。

因此：

- 每成功登录一次（一份新的 initData）就会在 `data/cache/fbs_bridge/` 留下一个
  `<sha256>.cnt`，约 64 字节文件名 + 20 字节内容，占一个 4KB 块；
- 这些文件**不会自己消失**。`emptyDir` 只在 Pod 重建时清空；Pod 长期不重启
  （正常情况就是不重启）时目录会一直增长。按每天 100 次登录估算，一年约
  3.6 万个文件 / 约 145MB —— 不会立刻打满磁盘，但属于「半年后磁盘莫名满了」的典型来源。

**运维提示（两条，任选其一）**

```bash
# 1) 定期清理：只删 mtime 超过 TTL 的，正在计数的窗口不受影响
#    TTL = 7200s = 120min，留 30min 余量
find /var/www/html/webroot/data/cache/fbs_bridge -name '*.cnt' -mmin +150 -delete

# 2) 至少做目录体积监控
du -sh /var/www/html/webroot/data/cache/fbs_bridge
```

> 注意：**不能**按文件名或「全部删除」清理 —— 删掉未过期的文件等于把该 initData
> 的额度清零，会静默放宽防重放。清理条件必须基于时间。
