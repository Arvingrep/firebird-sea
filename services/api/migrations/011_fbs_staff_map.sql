-- 员工 Telegram 绑定：Telegram 用户 ↔ 火鸟员工关系（huoniao_staff）落地映射。
--
-- 结构对齐 brief-staff.md 冻结契约。语义要点：
--   ① tg_user_id 主键：一个 Telegram 账号只能绑一家店（跨店 409 STAFF_ALREADY_BOUND）；
--   ② member_id 唯一键：现有 huoniao_staff(uid) 就是「一人一行」，一个会员不能同时是
--     两家店的员工，撞唯一键按冲突返回（409），绝不静默顶替；
--   ③ staff_id = huoniao_staff.id（自增主键），落地页（webroot/tg/staff.php）校验时用它
--     二次确认员工行仍然存在；
--   ④ sid 是 business_list.id（huoniao_business_list），**与外卖 waimai_shop.id 是两套 id**，
--     绝不与 fbs_merchant_map（waimai_shop 域）混用。
--
-- 写入方只有 PHP 网关 staff_bind（webroot/api/fbs/index.php，HMAC 邀请 token 鉴权后写入）。
--
-- 全部 IF NOT EXISTS，可重复执行。

CREATE TABLE IF NOT EXISTS fbs_staff_map (
  tg_user_id VARCHAR(32) NOT NULL,
  member_id  BIGINT UNSIGNED NOT NULL,
  sid        BIGINT UNSIGNED NOT NULL,
  staff_id   BIGINT UNSIGNED NOT NULL DEFAULT 0,
  phone      VARCHAR(32) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tg_user_id),
  UNIQUE KEY uk_fbs_staff_map_member (member_id),
  KEY idx_fbs_staff_map_sid (sid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
