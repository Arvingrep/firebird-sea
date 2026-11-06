-- 修复轮 2 · B1 补偿控制：绑定操作审计表（成功与失败都写一行）。
-- 写入方：PHP 网关 rider_bind（webroot/api/fbs/index.php）。该表同时充当
-- PHP 侧「按 tg_user_id / phone / ip 三维度限频」的计数底账（修复轮 3 · N5 加 ip 维度，
-- 见 docs/internal/RIDER_TG_HOOKS.md）。ip 维度复用 created_at 索引，量级下够用。
-- result 取值：success / conflict_tg / conflict_courier / not_found / rate_limited
--   / error（N6 补第 6 类：并发双插撞 fbs_courier_map 唯一键的最终失败，共 5+1 类）。
-- 审计写失败与计数失败一律 fail-closed（N4）：网关 503 AUDIT_UNAVAILABLE + error_log。
-- 全部 IF NOT EXISTS，可重复执行。

CREATE TABLE IF NOT EXISTS fbs_bind_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tg_user_id VARCHAR(32) NOT NULL,
  courier_id BIGINT NOT NULL DEFAULT 0,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  result VARCHAR(24) NOT NULL,
  ip VARCHAR(64) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fbs_bind_audit_created (created_at),
  KEY idx_fbs_bind_audit_tg (tg_user_id, created_at),
  KEY idx_fbs_bind_audit_phone (phone, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
