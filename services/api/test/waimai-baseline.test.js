// Story 1.1 外卖模块原样入库：基线文件齐全、不含授权/缓存/数据目录、配置提供 .example 且无真实密钥
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '../../..');
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n');
const has = (re) => tracked.some((f) => re.test(f));

test('AC1 外卖相关路径均已入库', () => {
  assert.ok(has(/^webroot\/admin\/templates\/waimai\//), 'admin 模板');
  assert.ok(has(/^webroot\/admin\/waimai/), 'admin/waimai');
  assert.ok(has(/^webroot\/wmsj\//), 'wmsj');
  assert.ok(has(/^webroot\/api\/handlers\/waimai\.class\.php$/), 'api handler');
  assert.ok(has(/^webroot\/api\/handlers\/waimai\.controller\.php$/), 'api controller');
});

test('AC1 不含缓存、数据库连接配置与备份文件', () => {
  assert.ok(!has(/^webroot\/data\/(cache|templates_c)\//));
  assert.ok(!has(/^webroot\/templates_c\//));
  assert.ok(!has(/^webroot\/include\/dbinfo\.inc\.php$/));
  assert.ok(!has(/\.(bak|orig)$/));
});

test('AC1 waimai.inc.php 提供 .example 且不含真实密钥', () => {
  const dir = path.join(root, 'webroot/include/config');
  assert.ok(has(/^webroot\/include\/config\/waimai\.inc\.php\.example$/), '.example 未入库');
  assert.ok(!has(/^webroot\/include\/config\/waimai\.inc\.php$/), '真实配置不得入库');
  const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  assert.match(ignore, /^webroot\/include\/config\/waimai\.inc\.php$/m, '真实配置须在 .gitignore');
  const bad = fs.readFileSync(path.join(dir, 'waimai.inc.php.example'), 'utf8').split('\n')
    .filter((l) => /(secret|key|token|passw|pwd)[^=]*=\s*(['"])[^'"]+\2/i.test(l) && !/Seo|Keyword/i.test(l));
  assert.deepStrictEqual(bad, [], '.example 含非空密钥项');
});

test('AC2 增量行数门禁失败的处理已记录为运营者决定事项', () => {
  const doc = fs.readFileSync(path.join(root, 'docs/internal/WAIMAI_PLUGIN_SPEC.md'), 'utf8');
  assert.match(doc, /原样入库基线/);
  assert.match(doc, /运营者决定/);
});
