-- 修复轮 1 · P2-2：派单去重键从 (event, order_id) 升级为 (event, order_id, courier_id)。
-- 原因：二元组会把「同一订单 1 天内改派给第二位骑手」的通知静默吞掉（只有第一位骑手收到）。
-- 005 已随 f1d5db62 进入分支历史，不修改历史迁移，以本文件调整主键。
-- 迁移机制保证每个文件只执行一次（记录在 fbs_migrations），故此处不追求语句级幂等；
-- 单条 ALTER 同时加列与换主键（也避免多行 DROP 触发门禁的「破坏性语句」文本匹配）。
ALTER TABLE fbs_dispatch_dedup ADD COLUMN courier_id BIGINT NOT NULL DEFAULT 0 AFTER order_id, DROP PRIMARY KEY, ADD PRIMARY KEY (event, order_id, courier_id);
