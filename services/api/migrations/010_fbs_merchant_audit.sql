-- 商家绑定审计 + 三维度限频计数底账（镜像 007_fbs_bind_audit.sql）。
--
-- 为什么不复用 fbs_bind_audit：那张表的列名是 courier_id，商家写 0 会让
-- docs/internal/RIDER_TG_HOOKS.md 里「该表只记骑手绑定」的口径失真，按手机号排查时
-- 两类行也混在一起。独立一张表，结构与索引一一对应，限频函数只换表名。
--
-- 写入方：PHP 网关 merchant_bind（webroot/api/fbs/index.php）。
-- result 取值：success / conflict_tg / conflict_merchant / not_found / no_shop
--   / ambiguous / rate_limited / error（共 8 类；conflict_merchant=该会员已被别的 TG 绑定，
--   no_shop=会员没有任何可管理店铺，ambiguous=同一手机号命中多个会员，error=并发双插撞唯一键）。
-- 审计写失败与计数读失败一律 fail-closed：网关 503 AUDIT_UNAVAILABLE + error_log。
--
-- 全部 IF NOT EXISTS，可重复执行。

CREATE TABLE IF NOT EXISTS fbs_merchant_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tg_user_id VARCHAR(32) NOT NULL,
  member_id BIGINT NOT NULL DEFAULT 0,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  result VARCHAR(24) NOT NULL,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fbs_merchant_audit_created (created_at),
  KEY idx_fbs_merchant_audit_tg (tg_user_id, created_at),
  KEY idx_fbs_merchant_audit_phone (phone, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
