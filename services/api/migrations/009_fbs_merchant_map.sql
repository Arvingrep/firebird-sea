-- 商家 Telegram 免密入口：Telegram 用户 ↔ 火鸟会员（商家账号）映射。
--
-- 结构照抄 004_fbs_courier_map.sql，改两处语义：
--   ① courier_id → member_id（商家身份就是火鸟会员，见 docs/internal/MERCHANT_TG_HOOKS.md）；
--   ② **不带 shop_id**：一个会员可管多家店（waimai_shop_manager 一人多行是常态），
--      店铺由 /wmsj 页面按 manager 列表自选，会话 cookie 里不放 shop。
--
-- 写入方只有 PHP 网关 merchant_bind（webroot/api/fbs/index.php，HMAC 鉴权后重绑写法），
-- 且冲突语义与骑手 B1 完全同构（同对幂等只刷 phone；TG 已绑别人 409；member 已被绑 409）。
--
-- ⚠ 绝不与 fbs_member_map 混用：那张表是收银台归属校验的唯一依据
--   （services/api/src/payOrderRead.js），商家分支往里写会把该 TG 的顾客下单归属永久改掉。
--
-- 全部 IF NOT EXISTS，可重复执行。

CREATE TABLE IF NOT EXISTS fbs_merchant_map (
  tg_user_id VARCHAR(32) NOT NULL PRIMARY KEY,
  member_id BIGINT NOT NULL,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fbs_merchant_map_member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
