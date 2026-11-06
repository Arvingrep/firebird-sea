'use strict';
/**
 * 邮件中继认证测试
 *
 * 守护的核心不变量：**没有配置密码时绝不能放行任何登录**。
 * 历史缺陷（2026-10-27 审计 P0-3）：`pass === VALID_PASS || !VALID_PASS`
 * 使得 SMTP_PASS 缺失时任意密码都能认证成功，等同于开放中继。
 *
 * 运行：node --test deploy/mail-relay/test/auth.test.js
 */
const { test } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const SERVER = path.resolve(__dirname, '..', 'server.js');
const USER = 'firebird';

/** 起一个进程，等端口就绪；返回 { proc, port } */
function startServer(env, port) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [SERVER], {
      env: { ...process.env, SMTP_PORT_PLAIN: String(port), SMTP_PORT_SSL: '0', SMTP_PORT_FALLBACK: '0', ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    const timer = setTimeout(() => reject(new Error('启动超时: ' + out)), 6000);
    proc.stdout.on('data', (d) => {
      out += d.toString();
      if (out.includes('587') || out.includes(String(port))) {
        clearTimeout(timer);
        resolve({ proc, port });
      }
    });
    proc.stderr.on('data', (d) => { out += d.toString(); });
    proc.on('exit', (code) => {
      clearTimeout(timer);
      reject(Object.assign(new Error(`进程退出 code=${code}`), { exitCode: code, output: out }));
    });
  });
}

/**
 * 走一次 SASL LOGIN，返回服务器最终状态码。
 * SMTP 响应行形如 `250-foo`（续行）与 `250 bar`（末行），且可能跨 TCP 包到达，
 * 因此按行缓冲、只认「三位码 + 空格」的末行，避免多行响应错位。
 */
function authLogin(port, user, pass) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection({ host: '127.0.0.1', port }, () => {});
    sock.setEncoding('utf8');
    let buf = '';
    let step = 0;               // 0 待发 EHLO / 1 待发 AUTH / 2 待发 user / 3 待发 pass / 4 待结果
    const timer = setTimeout(() => { sock.destroy(); reject(new Error('认证超时')); }, 5000);

    const send = (line) => sock.write(line + '\r\n');

    sock.on('data', (chunk) => {
      buf += String(chunk);
      let idx;
      while ((idx = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const m = /^(\d{3})([ -])(.*)$/.exec(line);
        if (!m) continue;              // 非响应行（如空白续行），忽略
        if (m[2] === '-') continue;    // 续行，等末行

        const code = Number(m[1]);
        if (step === 0 && code === 250) { send('AUTH LOGIN'); step = 1; }
        else if (step === 1 && code === 334) { send(Buffer.from(user).toString('base64')); step = 2; }
        else if (step === 2 && code === 334) { send(Buffer.from(pass).toString('base64')); step = 3; }
        else if (step === 3) {
          clearTimeout(timer);
          sock.destroy();
          return resolve(code);
        }
      }
    });
    sock.on('error', (e) => { clearTimeout(timer); reject(e); });
    sock.on('close', () => {
      clearTimeout(timer);
      reject(new Error(`连接提前关闭，卡在 step=${step}`));
    });
    send('EHLO test');
  });
}

test('未设置 SMTP_PASS 时进程拒绝启动（fail-closed）', async () => {
  await assert.rejects(
    () => startServer({ SMTP_PASS: '' }, 15871),
    (err) => {
      assert.strictEqual(err.exitCode, 1, '应以退出码 1 结束');
      assert.match(err.output, /FATAL: SMTP_PASS/, '应打印 FATAL 提示');
      return true;
    }
  );
});

test('密码正确 → 235 认证通过', async () => {
  const { proc } = await startServer({ SMTP_PASS: 's3cret-pass' }, 15872);
  try {
    assert.strictEqual(await authLogin(15872, USER, 's3cret-pass'), 235);
  } finally { proc.kill('SIGKILL'); }
});

test('密码错误 → 535 拒绝', async () => {
  const { proc } = await startServer({ SMTP_PASS: 's3cret-pass' }, 15873);
  try {
    assert.strictEqual(await authLogin(15873, USER, 'wrong-pass'), 535);
  } finally { proc.kill('SIGKILL'); }
});

test('空密码 → 535 拒绝（回归：原 fail-open 漏洞）', async () => {
  const { proc } = await startServer({ SMTP_PASS: 's3cret-pass' }, 15874);
  try {
    assert.strictEqual(await authLogin(15874, USER, ''), 535);
  } finally { proc.kill('SIGKILL'); }
});

test('未知用户 + 正确密码 → 535 拒绝', async () => {
  const { proc } = await startServer({ SMTP_PASS: 's3cret-pass' }, 15875);
  try {
    assert.strictEqual(await authLogin(15875, 'intruder', 's3cret-pass'), 535);
  } finally { proc.kill('SIGKILL'); }
});
