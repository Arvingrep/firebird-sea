-- T6 骑手绑定：Telegram 用户 ↔ 火鸟骑手映射（fbs_member_map 的骑手侧对应物）。
-- 写入方：PHP 网关 rider_bind 动作（webroot/api/fbs/index.php，HMAC 鉴权后重绑写法）；
--         Node 侧只读（查绑定换工作台 URL / 发派单通知）。全部 IF NOT EXISTS，可重复执行。

CREATE TABLE IF NOT EXISTS fbs_courier_map (
  tg_user_id VARCHAR(32) NOT NULL PRIMARY KEY,
  courier_id BIGINT NOT NULL,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fbs_courier_map_courier (courier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
