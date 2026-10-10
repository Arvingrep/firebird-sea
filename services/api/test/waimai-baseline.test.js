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
  assert.ok(has(/^webroot\/templates\/waimai\//), 'templates/waimai 前台模板');
  assert.ok(has(/^webroot\/admin\/templates\/waimai\//), 'admin 模板');
  assert.ok(has(/^webroot\/admin\/waimai/), 'admin/waimai');
  assert.ok(has(/^webroot\/wmsj\//), 'wmsj 商家后台');
  assert.ok(has(/^webroot\/api\/handlers\/waimai\.class\.php$/), 'api handler');
  assert.ok(has(/^webroot\/api\/handlers\/waimai\.controller\.php$/), 'api controller');
  assert.ok(has(/^webroot\/static\/js\/admin\/waimai/) || has(/^webroot\/templates\/waimai\/touch\//), '静态与移动端资源');
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
  const sensitiveVars = [
    'custom_OSSKeyID', 'custom_OSSKeySecret', 'custom_QINIUAccessKey', 'custom_QINIUSecretKey',
    'custom_OBSKeyID', 'custom_OBSKeySecret', 'custom_COSSecretid', 'custom_COSSecretkey',
    'customPartnerId', 'customPrintKey', 'customClientId', 'customClient_secret',
    'customPrint_user', 'customPrint_ukey'
  ];
  const bad = [];
  const lines = fs.readFileSync(path.join(dir, 'waimai.inc.php.example'), 'utf8').split('\n');
  for (const line of lines) {
    for (const v of sensitiveVars) {
      const m = line.match(new RegExp(`^\\$${v}\\s*=\\s*['"](.*)['"];`));
      if (m && m[1].trim() !== '') bad.push(`${v}=${m[1]}`);
    }
  }
  assert.deepStrictEqual(bad, [], '.example 含非空敏感密钥项');
});

test('AC2 增量行数门禁失败的处理已记录为运营者决定事项', () => {
  const doc = fs.readFileSync(path.join(root, 'docs/internal/WAIMAI_PLUGIN_SPEC.md'), 'utf8');
  assert.match(doc, /原样入库基线/);
  assert.match(doc, /运营者决定/);
  assert.match(doc, /人工审核 PR 或豁免/);
  assert.match(doc, /不绕过门禁/);
});

test('AC1 本分支相对 origin/main 的改动仅限选定白名单且不含授权、缓存、数据与真实配置', () => {
  let changed = [];
  try {
    changed = execFileSync('git', ['diff', '--name-only', 'origin/main...HEAD'], { cwd: root, encoding: 'utf8' })
      .split('\n').filter(Boolean);
  } catch (e) {
    try {
      changed = execFileSync('git', ['diff', '--name-only', 'HEAD~1...HEAD'], { cwd: root, encoding: 'utf8' })
        .split('\n').filter(Boolean);
    } catch (err) {
      assert.fail('无法取得基准 git diff 引用，拒绝静默通过');
    }
  }
  const allowedWhitelist = [
    /^\.gitignore$/,
    /^docs\/internal\/WAIMAI_PLUGIN_SPEC\.md$/,
    /^services\/api\/package\.json$/,
    /^services\/api\/test\/waimai-baseline\.test\.js$/,
    /^webroot\/include\/config\/waimai\.inc\.php$/,
    /^webroot\/include\/config\/waimai\.inc\.php\.example$/
  ];
  const invalidFiles = changed.filter((f) => !allowedWhitelist.some((re) => re.test(f)));
  assert.deepStrictEqual(invalidFiles, [], '改动文件超出 Story 1.1 选定白名单范围');

  const bad = changed.filter((f) => /^webroot\/data\//.test(f) || /^webroot\/templates_c\//.test(f)
    || /licen[cs]e|\.lic$/i.test(f) || (/^webroot\/include\/config\/waimai\.inc\.php$/.test(f) && fs.existsSync(path.join(root, f))));
  assert.deepStrictEqual(bad, [], '改动含禁入路径');
});
