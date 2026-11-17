-- 修复轮 2 · m1：去重表补 created_at 索引。
-- 写入方每投递成功都会顺手跑 `DELETE FROM fbs_dispatch_dedup WHERE created_at < NOW() - INTERVAL 1 DAY`
-- 做 TTL 清理；没有索引时这是一次全表扫（表会随每天派单量线性增长），高频派单站点上是实打实的
-- 慢查询来源。courier_id 的 DEFAULT 0 已由 006 提供（不改历史迁移），此处只补索引。
-- 迁移机制保证每个文件只执行一次，故不追求语句级幂等。
ALTER TABLE fbs_dispatch_dedup ADD KEY idx_fbs_dispatch_dedup_created (created_at);
