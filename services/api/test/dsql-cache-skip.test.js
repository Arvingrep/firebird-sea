// AD-20 回归守卫：cache() 的直查分支必须带 $from_cache = true。
//
// 背景（2026-11-06 事故）：dsqlOper() 在 HUONIAOADMIN == '' && from_cache == false 时会回手调用
// cache()；直查分支若漏传第 6 个参数，就变成 cache → dsqlOper → cache 无限递归，
// 每个请求在数十毫秒内吃满内存被 OOMKilled（canary 全站 503，cron 同步 OOM）。
//
// 这里只做源码级断言：不依赖 DB、不需要 PHP 运行时，CI 里秒级拦住同类改动。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '../../..');
const DSQL = path.join(REPO, 'webroot/include/class/dsql.class.php');

function read() {
  return fs.readFileSync(DSQL, 'utf8');
}

test('cache() 直查分支带 from_cache=true，避免 cache ↔ dsqlOper 无限递归', () => {
  const src = read();
  // 截取 skip 分支（从 HN_DSQL_CACHE_SKIP 判断到右花括号）
  const m = src.match(/HN_DSQL_CACHE_SKIP[\s\S]{0,600}?\n\s{12}\}/);
  assert.ok(m, '未找到 HN_DSQL_CACHE_SKIP 分支');
  const branch = m[0];

  const call = branch.match(/return \$this->dsqlOper\(([^)]*)\)/);
  assert.ok(call, 'skip 分支应直接 return $this->dsqlOper(...)');

  const args = call[1].split(',').map((s) => s.trim());
  assert.strictEqual(args.length, 6, `dsqlOper 应传 6 个参数，实际 ${args.length}：${call[1]}`);
  assert.strictEqual(args[5], 'true', '第 6 个参数必须是 true（from_cache），否则无限递归 OOM');
});

test('cache() 直查分支不构造 FileDataCache（打开开关即彻底绕过缓存）', () => {
  const src = read();
  const skipIdx = src.indexOf('HN_DSQL_CACHE_SKIP');
  assert.ok(skipIdx > 0);
  const afterBranch = src.slice(skipIdx, skipIdx + 900);
  const newCacheIdx = afterBranch.indexOf('new FileDataCache()');
  const returnIdx = afterBranch.indexOf('return $this->dsqlOper(');
  assert.ok(returnIdx >= 0 && returnIdx < newCacheIdx, 'return 必须早于 new FileDataCache()，否则开关等于没开');
});
