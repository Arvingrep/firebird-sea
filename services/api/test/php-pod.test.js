'use strict';

// PHP → Pod 改造 P0/P2 的静态断言：配置补齐、深度就绪、PostSync 冒烟、nginx 静态镜像
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const chart = 'deploy/helm/firebird-site';
const deployment = read(`${chart}/templates/deployment.yaml`);
const nginxConf = read(`${chart}/templates/configmap.yaml`);
const smoke = read(`${chart}/templates/job-smoke-test.yaml`);
const notify = read(`${chart}/templates/job-notify-deployed.yaml`);
const values = read(`${chart}/values.yaml`);
const initScript = read(`${chart}/files/init-webroot.sh`);
const ci = read('.github/workflows/ci-gke.yml');

// P0-1: 配置三方同步（新增 + 未改动的跟随镜像 + 改过的保留并另存），脚本经 ConfigMap 注入、与镜像版本解耦
test('P0: init script syncs config three-way and is shipped via ConfigMap, not the image', () => {
  assert.match(initScript, /\.image-baseline/);
  assert.match(initScript, /\.image-new/);
  assert.match(initScript, /for ex in "\$dst"\/\*\.inc\.php\.example/);
  assert.match(initScript, /basehost\|OBSKeyID\|OBSKeySecret\|mailPass/, '忽略 entrypoint 注入行');
  assert.match(read(`${chart}/templates/configmap-init.yaml`), /\.Files\.Get "files\/init-webroot\.sh"/);
  assert.match(deployment, /command: \["sh", "\/scripts\/init-webroot\.sh"\]/);
  assert.match(deployment, /checksum\/init-scripts/);
  assert.doesNotMatch(deployment, /首次挂载 PVC/, '不应再依赖"首次挂载"才播种');
});

test('P0: init script behavior (docker alpine/busybox, skipped when docker is unavailable)', (t) => {
  const { spawnSync } = require('node:child_process');
  if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) return t.skip('docker 不可用');
  const dir = path.join(ROOT, chart, 'files');
  const r = spawnSync('docker', ['run', '--rm', '-v', `${dir}:/f:ro`, 'alpine:3.20', 'sh', '/f/init-webroot.test.sh'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

// P0-2: healthz.php 存在且检查配置文件 + DB，并由 nginx 暴露、探针可切换
test('P0: deep readiness endpoint exists and is wired through nginx and an opt-in probe', () => {
  assert.ok(exists('webroot/healthz.php'));
  const hz = read('webroot/healthz.php');
  assert.match(hz, /\*\.inc\.php\.example/);
  assert.match(hz, /http_response_code\(503\)/);
  assert.match(hz, /getenv\('DB_HOST'\)/);
  assert.match(nginxConf, /location = \/healthz\.php/);
  assert.match(deployment, /path: \/healthz\.php/);
  assert.match(deployment, /\$deep := and \.Values\.probes \.Values\.probes\.deepReadiness/);
  // liveness 不能走深度检查，否则 DB 抖动会把 nginx 重启成风暴
  const liveness = deployment.match(/livenessProbe:\s*\n(?:\s*#.*\n)?\s*httpGet:\s*\n\s*path: (\S+)/g) || [];
  assert.ok(liveness.some((b) => /path: \/healthz$/.test(b)), 'nginx liveness 仍是 /healthz');
  assert.match(values, /^probes:\s*\n(?:\s*#.*\n)*\s+deepReadiness: false/m, '默认关闭，避免新 chart + 旧镜像卡死发布');
});

// P0-3: PostSync 冒烟先于上线通知
test('P0: PostSync smoke job runs before the deployed notification', () => {
  assert.match(smoke, /argocd\.argoproj\.io\/hook: PostSync/);
  assert.match(smoke, /sync-wave: "0"/);
  assert.match(smoke, /2\?\?\|3\?\?\)/, '2xx/3xx 视为通过');
  assert.match(notify, /sync-wave: "1"/);
  assert.match(values, /^smokeTest:\s*\n\s+enabled: true/m);
});

// P2: baked 模式不整站复制，nginx 用同 tag 静态镜像
test('P2: baked mode shares only data/, and nginx image follows image.tag', () => {
  assert.match(deployment, /\$baked := eq \(\.Values\.webroot\.mode \| default "copy"\) "baked"/);
  assert.match(deployment, /\{\{ \.Values\.webroot\.nginxImage\.repository \}\}:\{\{ \.Values\.image\.tag \}\}/);
  assert.match(deployment, /name: data-shared\s*\n\s+mountPath: \/var\/www\/html\/data\s*\n\s+readOnly: true/, 'nginx 只读挂 data');
  assert.match(values, /^webroot:\s*\n\s+mode: copy/m, '默认 copy：合并 chart 不改变线上拓扑');
  assert.match(read(`${chart}/values-canary.yaml`), /^webroot:\s*\n\s+mode: baked/m, 'canary 先行');
});

test('P2: nginx image strips PHP source/licence and CI pushes it before the php image', () => {
  const df = read('deploy/docker/Dockerfile.nginx');
  assert.match(df, /truncate -s 0/);
  assert.match(df, /rm -rf include\/config/);
  assert.match(df, /rm -f huoniao huoniao\.dll huoniao\.so/);
  const nginxAt = ci.indexOf('Dockerfile.nginx');
  const phpAt = ci.indexOf('-f deploy/docker/Dockerfile.web');
  assert.ok(nginxAt > 0 && phpAt > 0 && nginxAt < phpAt, 'nginx 镜像必须先于 firebird-php 推送');
});

// 调查结论落地：基础镜像 tag 一致且递增（CI 只在 tag 不存在时构建，旧 tag 缺 redis 扩展）
test('base image tag is bumped and consistent across Dockerfile.web and CI', () => {
  const web = read('deploy/docker/Dockerfile.web').match(/firebird-base:(\S+)/)[1];
  const ciTag = ci.match(/containers\/firebird-base:([^"\s]+)"/)[1];
  assert.equal(web, ciTag);
  assert.notEqual(web, '7.4', '旧 7.4 早于 redis 扩展，不会被重建');
  assert.match(read('deploy/docker/entrypoint-web.sh'), /缺少 redis 扩展/, '缺扩展时不再静默回退');
});

test('HPA is opt-in and session files are kept out of the image', () => {
  assert.match(read(`${chart}/templates/hpa.yaml`), /\(\.Values\.autoscaling\)\.enabled/);
  assert.match(values, /^autoscaling:\s*\n\s+enabled: false/m);
  assert.match(read('.dockerignore'), /webroot\/data\/sessions\/\*/);
});
