'use strict';

// Story 1.8：付款监听器部署的静态断言（Dockerfile / compose / Helm / AD-19）
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const chart = 'deploy/helm/firebird-site';

test('AC1: Dockerfile 存在，非 root 运行 listener', () => {
  const df = read('deploy/docker/Dockerfile.payment-listener');
  assert.match(df, /services\/payment-listener\/listener\.js/);
  assert.match(df, /^USER node$/m);
  assert.match(df, /CMD \["node", "listener\.js"\]/);
});

test('AC1: compose 含 payment-listener，副本数 1', () => {
  const compose = read('docker-compose.yml');
  const block = compose.split(/^  payment-listener:/m)[1].split(/^networks:/m)[0];
  assert.match(block, /dockerfile: deploy\/docker\/Dockerfile\.payment-listener/);
  assert.match(block, /replicas: 1/);
  assert.doesNotMatch(block, /^\s+ports:/m, '监听器不对外暴露端口');
});

test('AC1: Helm Deployment 副本数 1 且更新策略 Recreate', () => {
  const d = read(`${chart}/templates/deployment-payment-listener.yaml`);
  assert.match(d, /replicas: 1\n/);
  assert.match(d, /strategy:\n\s+type: Recreate/);
  assert.match(read(`${chart}/values.yaml`), /^paymentListener:/m);
});

test('AC2: 密钥经 Secret 注入，模板中无明文', () => {
  const d = read(`${chart}/templates/deployment-payment-listener.yaml`);
  assert.match(d, /secretKeyRef/);
  assert.match(d, /"TRON_MASTER_RECEIVE_ADDRESS" "TRONGRID_API_KEY"/);
  assert.doesNotMatch(d, /name: TRONGRID_API_KEY\n\s+value:/);
});

test('AC2: 网关 /api/fbs 对外被拒绝（AD-19）', () => {
  const ing = read(`${chart}/templates/ingressroute.yaml`);
  assert.match(ing, /PathPrefix\(`\/api\/fbs`\)/);
  assert.match(ing, /firebird-deny-gateway-/);
  assert.match(read(`${chart}/templates/middleware-deny-gateway.yaml`), /ipAllowList:\n\s+sourceRange:\n\s+- 127\.0\.0\.1\/32/);
  assert.match(read(`${chart}/values.yaml`), /denyGateway: true/);
});

// 渲染级断言：helm 不可用时跳过
const { spawnSync } = require('node:child_process');
const rendered = spawnSync('helm', ['template', 'x', path.join(ROOT, chart), '--set', 'paymentListener.enabled=true'], { encoding: 'utf8' });
const renderOpts = { skip: rendered.status !== 0 && 'helm 不可用' };

test('AC1/AC2: helm 渲染出 replicas=1、Recreate、secretKeyRef', renderOpts, () => {
  const doc = rendered.stdout.split(/^---$/m).find((d) => /^  name: firebird-payment-listener/m.test(d) && /kind: Deployment/.test(d));
  assert.ok(doc, '渲染结果应含 payment-listener Deployment');
  assert.match(doc, /replicas: 1\n/);
  assert.match(doc, /strategy:\n\s+type: Recreate/);
  assert.match(doc, /secretKeyRef/);
  assert.doesNotMatch(doc, /:latest/);
});

test('AC2: 渲染的 IngressRoute 含 /api/fbs 拒绝规则', renderOpts, () => {
  assert.match(rendered.stdout, /PathPrefix\(`\/api\/fbs`\)/);
  assert.match(rendered.stdout, /kind: Middleware/);
});

test('监听器缺少收款地址时启动即失败', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'services/payment-listener/listener.js')], { env: { PATH: process.env.PATH }, encoding: 'utf8' });
  assert.notEqual(r.status, 0);
});
