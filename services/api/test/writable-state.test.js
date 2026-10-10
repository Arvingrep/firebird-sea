'use strict';

// Story 1.6 可写状态持久化（AD-17）：Helm / 镜像 / 入口脚本的静态断言
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const deployment = read('deploy/helm/firebird-site/templates/deployment.yaml');
const pvc = read('deploy/helm/firebird-site/templates/pvc.yaml');
const values = read('deploy/helm/firebird-site/values.yaml');
const entrypoint = read('deploy/docker/entrypoint-web.sh');
const baseImage = read('deploy/docker/Dockerfile.base');

// AC1: 上传文件在 PVC 上，PHP Pod 重建后仍可访问
test('AC1: uploads live on a PVC mounted into php-fpm and nginx', () => {
  assert.match(pvc, /kind: PersistentVolumeClaim[\s\S]*firebird-uploads-\{\{ \.Values\.siteId \}\}/);
  assert.match(deployment, /claimName: firebird-uploads-\{\{ \.Values\.siteId \}\}/);
  const mounts = deployment.match(/mountPath: \/var\/www\/html\/uploads/g) || [];
  assert.equal(mounts.length, 2, 'php-fpm 与 nginx 都应挂载 /var/www/html/uploads');
  assert.match(values, /^uploads:\s*\n\s+enabled: true/m);
});

// AC1: RWO 卷不得配 RollingUpdate / HPA，且各站点显式声明 uploads
test('AC1: RWO uploads force Recreate, skip HPA, and sites declare uploads', () => {
  assert.match(deployment, /type: Recreate/);
  assert.match(deployment, /eq \(\.Values\.uploads\.accessMode/);
  assert.match(read('deploy/helm/firebird-site/templates/hpa.yaml'), /\.Values\.uploads\.accessMode/);
  // 站点显式声明 uploads（不依赖默认值）；2026-10-10 核查后三站均已去 PVC，附件走 GCS
  for (const site of ['manila', 'cebu', 'canary']) {
    assert.match(read(`deploy/helm/firebird-site/values-${site}.yaml`), /^uploads:\s*\n\s+enabled: (true|false)/m, site);
  }
});

// AC2: 会话存 Redis，Pod 重启不丢
test('AC2: PHP sessions are stored in Redis', () => {
  assert.match(deployment, /name: REDIS_HOST/);
  assert.match(deployment, /name: REDIS_PORT/);
  assert.match(entrypoint, /session\.save_handler = redis/);
  assert.match(entrypoint, /tcp:\/\/\$\{REDIS_HOST\}:\$\{REDIS_PORT:-6379\}\?timeout=2&prefix=PHPREDIS_SESSION_/);
  assert.match(entrypoint, /->connect\(/, '写 ini 前先探活 Redis');
  assert.match(entrypoint, /回退为文件存储/);
  assert.match(baseImage, /pecl install redis/);
  assert.match(baseImage, /docker-php-ext-enable redis/);
});

// AC3: 缓存留在 emptyDir，日志走标准输出
test('AC3: cache stays in emptyDir and logs go to stdout/stderr', () => {
  // copy 模式共享整站 emptyDir；baked 模式只共享 data/ 的 emptyDir —— 两者都是 emptyDir，绝不是 PVC
  assert.match(deployment, /- name: webroot-shared\n\s+emptyDir: \{\}/);
  assert.match(deployment, /- name: data-shared\n\s+emptyDir: \{\}/);
  assert.doesNotMatch(deployment, /claimName: firebird-data/, 'data/ 缓存目录不得挂 PVC');
  assert.match(baseImage, /error_log = \/proc\/self\/fd\/2/);
  assert.match(baseImage, /catch_workers_output = yes/);
});
