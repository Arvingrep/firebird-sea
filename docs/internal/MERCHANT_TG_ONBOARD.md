# 商家 Telegram 免密入口 · 上线前运营补数据 SOP

> 日期：2026-11-10。结论来源：`.agent-runs/2026-11-10/task-001/investigation-report-merchant.md`
> （canary / 生产两套库只读实测，附录 A 有可复现查询）。
> 本文档只给**只读校验 SQL 与操作步骤**，不提供任何改生产数据的脚本；
> 数据变更一律由运营在火鸟后台界面完成并留痕。

## 一、为什么必须先补数据

商家免密绑定校验的是「**这个手机号对应的会员**在 `waimai_shop_manager` 里至少有一家未删除的店」。
两套库的现状（2026-11-10 实测）：

| 库 | `waimai_shop` | `waimai_shop_manager` | 结论 |
|---|---|---|---|
| `firebird_canary` | 3 家（全部 del=0/status=1） | 3 行（1 个会员管 3 家店） | 已具备绑定条件 |
| `firebird_manila`（生产） | 3 家（全部 del=0/status=1） | **0 行** | **不补数据则所有绑定必 404 `MERCHANT_NO_SHOP`** |

背景：入驻审核通过的「自动建店 + 自动建 manager」链路当前是坏的
（`admin/business/businessJoin.php:266` 有一句调试 `echo $sql;die;` 卡在中间，
`:379-401` 的建店代码永远不执行）。因此店铺与归属**只能手工维护**。
（该调试残留建议另开一单修复，不属于本需求范围。）

## 二、上线前校验 SQL（只读，直接在库上执行）

### 1. 看有多少会员具备绑定条件

```sql
-- 每个有店铺归属的会员：手机号、状态、可管店铺数（del=0）
SELECT mem.id            AS member_id,
       mem.username,
       mem.phone,
       mem.state,
       mem.is_cancellation,
       mem.mtype,                              -- 只允许 1/2
       COUNT(DISTINCT s.id)      AS shop_cnt,  -- del=0 的可管理店铺数
       GROUP_CONCAT(s.id)        AS shop_ids
  FROM huoniao_waimai_shop_manager sm
  JOIN huoniao_member mem      ON mem.id = sm.userid
  JOIN huoniao_waimai_shop s   ON s.id   = sm.shopid AND s.del = 0
 GROUP BY mem.id, mem.username, mem.phone, mem.state, mem.is_cancellation, mem.mtype
 ORDER BY mem.id;
```

判定：`shop_cnt >= 1` 且 `state=1` 且 `is_cancellation<>1` 且 `mtype IN (1,2)` 且
`phone` 非空 ⇒ 该会员可绑定。`phone` 为空的会员**无法绑定**（手机号是唯一匹配键）。

### 2. 看手机号会不会撞歧义（409 MERCHANT_AMBIGUOUS）

```sql
-- member.phone 没有唯一索引：同一手机号被多个可绑会员使用时，绑定会被拒（这是刻意设计）
SELECT mem.phone, COUNT(*) AS members, GROUP_CONCAT(mem.id) AS member_ids
  FROM huoniao_member mem
 WHERE mem.phone <> ''
   AND mem.mtype IN (1, 2)
   AND mem.state = 1
   AND mem.is_cancellation <> 1
   AND EXISTS (SELECT 1 FROM huoniao_waimai_shop_manager sm
                WHERE sm.userid = mem.id)
 GROUP BY mem.phone
HAVING COUNT(*) > 1;
```

判定：查询结果应为空；非空的手机号需要运营先合并/更正会员资料，否则该号码无法绑定。

### 3. 看哪些店铺没有管理员（归属缺失）

```sql
SELECT s.id, s.shopname, s.status, s.del,
       (SELECT COUNT(*) FROM huoniao_waimai_shop_manager sm
         WHERE sm.shopid = s.id) AS manager_cnt
  FROM huoniao_waimai_shop s
 WHERE s.del = 0
 ORDER BY manager_cnt ASC, s.id;
```

判定：`manager_cnt = 0` 的店，其会员（若有）无法通过归属校验。

### 4. 抽查某条绑定会不会成功（上线前的模拟校验）

```sql
-- 把 :phone 换成商家登记的手机号（0 / 63 / +63 三种写法都试一遍）
SELECT mem.id, mem.state, mem.is_cancellation, mem.mtype,
       (SELECT GROUP_CONCAT(sm.shopid) FROM huoniao_waimai_shop_manager sm
          JOIN huoniao_waimai_shop s ON s.id = sm.shopid AND s.del = 0
         WHERE sm.userid = mem.id) AS shop_ids
  FROM huoniao_member mem
 WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(mem.phone,' ',''),'-',''),'(',''),')',''),'.','')
       IN ('0XXXXXXXXXX', '63XXXXXXXXXX', '+63XXXXXXXXXX')   -- ← 三写法，逐一替换
   AND mem.mtype IN (1, 2);
```

判定：恰好 1 行、且 `shop_ids` 非空 ⇒ 绑定会成功；0 行 = 404 `MERCHANT_NOT_FOUND`；
多行 = 409 `MERCHANT_AMBIGUOUS`；1 行但 `shop_ids` 为 NULL = 404 `MERCHANT_NO_SHOP`。

## 三、补数据的操作步骤（后台界面，不写库）

1. **后台 → 会员管理**：核对目标会员的 `手机号`（`member.phone`）为可用的菲律宾本地号
   （0 开头 10-11 位），`状态` 正常、未注销。手机号空/错的先在这里更正。
2. **后台 → 外卖 → 店铺 → 编辑店铺 → 管理会员**（`admin/waimai/waimaiShopAdd.php:707-718`）：
   在「管理员/管理会员」里按会员**用户名**添加，保存（该处逻辑是先 DELETE 本店 manager 行、
   再按逗号列表 INSERT，保存即完成归属建立）。一个会员可加进多家店——归属粒度是会员，
   多店不影响绑定。
3. 回到第二节第 1、4 条 SQL 复核：`shop_cnt >= 1`、模拟校验恰好 1 行。
4. 通知商家在 Telegram 里对 bot 发送 `/merchant`，用登记的手机号完成绑定并进入 `/wmsj/`。

## 四、常见失败对照

| 现象 | 根因 | 处理 |
|---|---|---|
| 404 `MERCHANT_NOT_FOUND` | 手机号没登记/登记的不是这个号/带分隔符写法库里查不到 | 按第二节 SQL 4 排查；更正 `member.phone` |
| 409 `MERCHANT_AMBIGUOUS` | 同一手机号多个会员在用 | 合并会员或更正手机号（第二节 SQL 2） |
| 404 `MERCHANT_NO_SHOP` | manager 行为空或店铺被删 | 后台补「管理会员」（第三节步骤 2） |
| 409 `TG_ALREADY_BOUND` / `MERCHANT_ALREADY_BOUND` | 该 TG/该会员已被绑定（原绑定不动） | 运营在 `fbs_merchant_map` 里按 `fbs_merchant_audit` 的记录确认后手工处理（当前无自助解绑入口，属已知范围裁剪） |
| 绑定成功但 `/wmsj` 弹「您没有外卖店铺权限」 | 理论不应出现（绑定与会话都校验归属）；若出现，优先查是否走了顾客桥旧缓存 cookie | 让商家退出重进（重新走 /merchant） |
