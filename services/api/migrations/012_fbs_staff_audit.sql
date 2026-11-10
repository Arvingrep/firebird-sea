-- 员工绑定审计 + 三维度限频计数底账（镜像 010_fbs_merchant_audit.sql，多一列 sid）。
--
-- 为什么不复用 fbs_merchant_audit：那张表的 sid 语义是外卖店铺（waimai_shop.id），
-- 员工的 sid 是 business_list.id，两套 id 混在一张底账里按店铺排查时会互相污染；
-- 且商家版 result 取值域（conflict_tg / conflict_merchant / no_shop）不含员工场景。
-- 独立一张表，索引结构与商家版一一对应，另加 idx_fbs_staff_audit_ip（与骑手版对齐）。
--
-- 写入方：PHP 网关 staff_bind（webroot/api/fbs/index.php）。
-- result 取值：success / invalid_token / no_shop / not_found / is_business
--   / already_bound / ambiguous / rate_limited / error（共 9 类；
--   invalid_token=邀请 token 签名/过期（token 校验在 DB 连接之前，正常路径不会落到审计），
--   no_shop=sid 在 business_list 不存在或已删，is_business=命中会员是商家本人（userType=2），
--   already_bound=该 TG 或该会员已绑到别的店，ambiguous=同号命中多个会员 / 员工行指向别店，
--   error=并发双插撞唯一键等终态失败）。
-- 审计写失败与计数读失败一律 fail-closed：网关 503 AUDIT_UNAVAILABLE + error_log。
--
-- 全部 IF NOT EXISTS，可重复执行。

CREATE TABLE IF NOT EXISTS fbs_staff_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tg_user_id VARCHAR(32) NOT NULL,
  member_id  BIGINT NOT NULL DEFAULT 0,
  sid        BIGINT NOT NULL DEFAULT 0,
  phone      VARCHAR(32) NOT NULL DEFAULT '',
  result     VARCHAR(24) NOT NULL,
  ip         VARCHAR(64) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fbs_staff_audit_created (created_at),
  KEY idx_fbs_staff_audit_tg (tg_user_id, created_at),
  KEY idx_fbs_staff_audit_phone (phone, created_at),
  KEY idx_fbs_staff_audit_ip (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
