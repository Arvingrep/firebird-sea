-- fix_module_domain_aliases.sql
-- 根因修复：将 huoniao_domain 各模块的 domain 更新为 SEO 别名路径，
--          并恢复因历史操作被错误 offline 的模块。
--
-- 背景：seed_module_domains.php「非空即 skip」逻辑导致 domain 别名未从
--   article→article / info→info / renovation→renovation / paper→paper / website→website
-- 更新为对应的 URL 路径别名，PHP index.php 路由用 domain 字段匹配请求路径，
-- 别名不匹配 → count()=0 → 404。
--
-- 执行：kubectl exec -n zxem mysql-... -- mysql -u firebird_user -p<pass> firebird_canary < fix_module_domain_aliases.sql
-- 幂等：UPDATE ... WHERE domain = '<old>' 仅在未修复时生效。

-- 1. 修正模块 domain 别名
UPDATE huoniao_domain SET domain = 'news'     WHERE module = 'article'    AND part = 'config' AND domain = 'article';
UPDATE huoniao_domain SET domain = 'fenlei'   WHERE module = 'info'       AND part = 'config' AND domain = 'info';
UPDATE huoniao_domain SET domain = 'zhuang'   WHERE module = 'renovation' AND part = 'config' AND domain = 'renovation';
UPDATE huoniao_domain SET domain = 'baokan'   WHERE module = 'paper'      AND part = 'config' AND domain = 'paper';
UPDATE huoniao_domain SET domain = 'jianzhan' WHERE module = 'website'    AND part = 'config' AND domain = 'website';
-- shop / job / car / special / quanjing / business 保持与模块名一致，无需改动

-- 2. 恢复冒烟矩阵要求在线的模块（state=1→0）
--    zhaopin 保持 state=1（服务未开通，intentionally offline）
UPDATE huoniao_site_module SET state = 0 WHERE name = 'shop'       AND state = 1;
UPDATE huoniao_site_module SET state = 0 WHERE name = 'renovation' AND state = 1;
UPDATE huoniao_site_module SET state = 0 WHERE name = 'paper'      AND state = 1;
UPDATE huoniao_site_module SET state = 0 WHERE name = 'website'    AND state = 1;

-- 3. 验证（期望 domain 列与别名一致）
SELECT module, domain, part FROM huoniao_domain
WHERE module IN ('article','info','renovation','paper','website','shop','job','car','special','quanjing','business')
  AND part = 'config'
ORDER BY module;

-- 4. 验证模块状态（shop/renovation/paper/website 应为 state=0）
SELECT name, state FROM huoniao_site_module
WHERE name IN ('article','info','renovation','paper','website','shop','job','car','special','quanjing','business','zhaopin')
  AND type = 0
ORDER BY name;
