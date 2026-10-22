-- =============================================================================
-- 存量店铺费率回填（2026-10-22 决策①②③）
-- =============================================================================
-- 背景：费率是四段快照，不是引用（见项目「决策记录-2026-10-22.md」§三）：
--   values.yaml/configVars（全局）
--     → admin/waimai/waimaiShopAdd.php:177-185   建店/改店时抄一次
--     → huoniao_waimai_shop.fencheng_*            店铺记录
--     → api/handlers/waimai.class.php:4304-4324   付款时抄进订单行
--     → include/common.func.php:14862-14866       结算只读订单快照
-- 因此：改 values.yaml 只影响"之后新建的店铺"。要让 3% 技术服务费对存量店生效，
--       必须回填本表。回填后新订单按新费率；已付款订单按历史快照结算（不可逆，也不应追溯）。
--
-- ⚠ 执行纪律：
--   1. 本脚本涉及收入字段，属不可逆操作 → 必须先跑【第 1 步快照】并把结果落盘留存；
--   2. 在低峰期执行；单条 UPDATE 全表，MyISAM 会锁整表（写入会被阻塞数秒）；
--   3. 执行后必须跑【第 4 步验证】，并按「决策记录」§三 做三处一致验证
--      （新测试店下一单 → 订单行 fencheng_foodprice=3 → 结算明细 ptyd=₱15）；
--   4. 表前缀默认 huoniao_（webroot/include/dbinfo.inc.php:6），与实际环境不一致时全局替换。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 第 1 步：快照当前值（必须先执行并把结果导出存档，回填的依据与回滚参考）
-- -----------------------------------------------------------------------------
SELECT id, shopname, cityid, state,
       fencheng_foodprice, fencheng_delivery, fencheng_dabao, fencheng_addservice,
       fencheng_zsb, fencheng_discount, fencheng_promotion, fencheng_firstdiscount,
       fencheng_quan, fencheng_offline
FROM huoniao_waimai_shop
ORDER BY id;

-- -----------------------------------------------------------------------------
-- 第 2 步：回填（决策值）
--   fencheng_foodprice  = 3   0% 商品抽佣 + 3% 技术服务费（fencheng_foodprice: 3 零开发口径）
--   fencheng_delivery   = 0   商家自配送，配送费 100% 归商家
--   fencheng_dabao      = 0   打包费归商家
--   其余保持 100/0（与 values.yaml 一致）
--   fencheng_offline    = 0   伪生效字段（结算公式 0 引用），置 0 以免误导；真正的
--                             线下/堂食收费策略定了再处理（建议届时先从后台表单移除该字段）
-- -----------------------------------------------------------------------------
UPDATE huoniao_waimai_shop
SET fencheng_foodprice      = 3,
    fencheng_delivery       = 0,
    fencheng_dabao          = 0,
    fencheng_addservice     = 100,
    fencheng_zsb            = 100,
    fencheng_discount       = 0,
    fencheng_promotion      = 0,
    fencheng_firstdiscount  = 0,
    fencheng_quan           = 0,
    fencheng_offline        = 0;

-- -----------------------------------------------------------------------------
-- 第 3 步（二选一，执行前人工确认）：平台的平价/会员相关运营开关兜底
--   这些字段不在 values.yaml 里、且是"平台 100% 承担"的成本源（见决策清单 ⑨⑪）。
--   ⚠ privilege 属 PHP 序列化字段，不能用 SQL REPLACE 改长度前缀 —— 下面的只涉及
--     独立数值列；序列化字段一律走后台或 PHP 脚本。
-- -----------------------------------------------------------------------------
-- 3a. 平台提价 ptprofit（审计盲区：无 Git 留痕、即时生效）—— 确认全站为 0：
SELECT id, shopname, ptprofit FROM huoniao_waimai_shop WHERE ptprofit <> 0;
-- 若有非 0 行，与业务确认后：
-- UPDATE huoniao_waimai_shop SET ptprofit = 0;

-- 3b. 平台出资的"店铺 vip 打折"（waimai.class.php:2524 覆盖会员折扣 → auth_waimai → 平台全额承担）：
SELECT id, shopname, is_vipdiscount, vipdiscount_value
FROM huoniao_waimai_shop
WHERE is_vipdiscount = 1;
-- 若有开启的店（尤其 vipdiscount_value < 9），与业务确认后：
-- UPDATE huoniao_waimai_shop SET is_vipdiscount = 0;

-- -----------------------------------------------------------------------------
-- 第 4 步：验证
-- -----------------------------------------------------------------------------
-- 4a. 全站回填结果与决策值一致（应返回 0 行）：
SELECT id, shopname
FROM huoniao_waimai_shop
WHERE fencheng_foodprice <> 3
   OR fencheng_delivery  <> 0
   OR fencheng_dabao     <> 0;

-- 4b. 三处一致验证（人工流程，见 决策记录 §三）：
--     ① admin 后台新建测试店铺（此时才会从 configVars 抄到 foodprice=3）
--     ② 该店下一单并支付（COD 即可），确认订单行：
--        SELECT ordernum, fencheng_foodprice, fencheng_delivery, fencheng_dabao
--        FROM huoniao_waimai_order_all WHERE sid = <测试店id> ORDER BY id DESC LIMIT 1;
--        期望 fencheng_foodprice=3, delivery=0, dabao=0
--     ③ 商家端订单详情查看结算明细：平台应收 = 商品额 × 3%，配送/打包为 0、全归商家
--        （common.func.php:15396 的 business = zjye - (ptyd+…) 应等于 实付 - 3%×商品额）

-- -----------------------------------------------------------------------------
-- 第 5 步：顺带核查（只读，用于风险台账）
-- -----------------------------------------------------------------------------
-- 5a. 是否有人用过"外卖店铺批量同步"改过费率（日志只记字段名不记值，param 里有目标店）：
-- SELECT id, admin, ip, FROM_UNIXTIME(pubdate) t, param
-- FROM huoniao_sitelog WHERE name = '外卖店铺同步操作' ORDER BY pubdate DESC LIMIT 50;

-- 5b. 单店修改有值级日志（note 是完整 UPDATE 语句）—— 对照费率变更时间线：
-- SELECT id, admin, FROM_UNIXTIME(pubdate) t, note
-- FROM huoniao_sitelog WHERE name LIKE '修改外卖店铺-%' ORDER BY pubdate DESC LIMIT 100;

-- 5c. 费率变更轨迹（订单快照反推；必须排除线下支付单，它们不写费率快照）：
-- SELECT sid, fencheng_foodprice, fencheng_delivery, fencheng_dabao, fencheng_quan,
--        COUNT(*) cnt, FROM_UNIXTIME(MIN(pubdate)) first_seen, FROM_UNIXTIME(MAX(pubdate)) last_seen
-- FROM huoniao_waimai_order_all
-- WHERE state >= 2 AND paytype != 'underpay'
-- GROUP BY sid, fencheng_foodprice, fencheng_delivery, fencheng_dabao, fencheng_quan
-- ORDER BY sid, first_seen;
-- 判读：同一 sid 出现多组费率 = 该店费率变过；空结果只能写"未发现证据"，不能写"从未变更"。
-- ⚠ 禁止对 *_all 合并表执行写操作（MRG_MYISAM + INSERT_METHOD=LAST，写入会静默落到最后一张分表）。
