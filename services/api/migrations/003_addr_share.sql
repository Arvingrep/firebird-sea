-- 地址分享（代下单）：记录一次性 token → 地址快照。可重复执行。
-- 快照而非引用 huoniao_waimai_address.id：源地址被改写/删除后，已发出的分享链接仍可用到过期为止。
CREATE TABLE IF NOT EXISTS fbs_addr_share (
  token CHAR(32) NOT NULL PRIMARY KEY,
  uid BIGINT NOT NULL DEFAULT 0,
  payload TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  KEY idx_fbs_addr_share_exp (expires_at),
  KEY idx_fbs_addr_share_uid (uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
