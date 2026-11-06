-- TMA 登录桥接的跨副本共享状态（Arvin 决定 3=B：api 保持多副本，吊销/幂等/重放计数入库）。可重复执行。

CREATE TABLE IF NOT EXISTS fbs_token_revoked (
  jti VARCHAR(40) NOT NULL PRIMARY KEY,
  exp BIGINT NOT NULL,
  KEY idx_fbs_token_revoked_exp (exp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fbs_idem (
  idem_key VARCHAR(160) NOT NULL PRIMARY KEY,
  state VARCHAR(8) NOT NULL DEFAULT 'pending',
  response MEDIUMTEXT NULL,
  expires_at BIGINT NOT NULL,
  KEY idx_fbs_idem_exp (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fbs_replay (
  hash CHAR(64) NOT NULL PRIMARY KEY,
  cnt INT NOT NULL DEFAULT 1,
  expires_at BIGINT NOT NULL,
  KEY idx_fbs_replay_exp (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
