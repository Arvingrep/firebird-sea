-- T7 派单 TG 通知去重：语义等同 Redis SET NX EX 86400（key=tg:dispatch:<event>:<order_id>，TTL 1 天）。
-- 说明：Node api 容器未注入 REDIS_*（deployment-api.yaml 无该变量）且本任务禁新增 npm 依赖 /
-- 部署清单改动，故用既有 fbs_ 表体系实现同等 TTL 语义：行存在 = 已发过；过期行由写入方顺手清理。
-- 勿改用 waimai_order.courier_pushed 字段——它被 App 推送（sendapppush）占用。
-- 全部 IF NOT EXISTS，可重复执行。

CREATE TABLE IF NOT EXISTS fbs_dispatch_dedup (
  event VARCHAR(16) NOT NULL,
  order_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (event, order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
