const net = require('net');
const tls = require('tls');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const SMTP_PORT_PLAIN = Number(process.env.SMTP_PORT_PLAIN || 587);
const SMTP_PORT_SSL = Number(process.env.SMTP_PORT_SSL || 465);
const SMTP_PORT_FALLBACK = Number(process.env.SMTP_PORT_FALLBACK || 25);
const TLS_KEY_PATH = process.env.TLS_KEY_PATH || '/app/key.pem';
const TLS_CERT_PATH = process.env.TLS_CERT_PATH || '/app/cert.pem';
const VALID_USERS = (process.env.SMTP_USERS || 'firebird,noreply@fbird.men,admin').split(',');
const VALID_PASS = process.env.SMTP_PASS || '';
const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

// ── fail-closed 硬门禁 ────────────────────────────────────────────────
// 历史缺陷：原实现为 `pass === VALID_PASS || !VALID_PASS`，一旦 SMTP_PASS
// 未注入，任何密码都能通过认证，等同于开放中继。此处改为拒绝启动。
if (!VALID_PASS) {
  console.error('FATAL: SMTP_PASS 未设置，拒绝启动（fail-closed，防止空密码放行）');
  process.exit(1);
}

// 定长比较，避免按字节早退泄漏密码长度/内容
function passMatches(candidate) {
  const a = Buffer.from(String(candidate == null ? '' : candidate), 'utf8');
  const b = Buffer.from(VALID_PASS, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

console.log('🚀 [Firebird Mail Relay] 启动自建邮件服务...');
console.log(`   认证用户: ${VALID_USERS.join(', ')}`);

function handleClient(socket, isTls) {
  let state = 'INIT';
  let mailFrom = '';
  let rcptTo = [];
  let dataBuffer = '';
  let authUser = '';

  socket.setEncoding('utf8');
  socket.write('220 firebird-mail.default.svc.cluster.local ESMTP Firebird-Mail Server ready\r\n');

  let lineBuffer = '';

  socket.on('data', (chunk) => {
    lineBuffer += chunk;
    let lines = lineBuffer.split('\r\n');
    lineBuffer = lines.pop();

    for (const rawLine of lines) {
      const line = rawLine.trim();
      // 空行在 DATA 段是正文，在认证段是「空用户名/空密码」——后者必须交给
      // 校验逻辑明确回 535，否则客户端会一直等不到响应而挂住。
      if (!line && state !== 'DATA'
          && state !== 'AUTH_LOGIN_USER' && state !== 'AUTH_LOGIN_PASS') continue;

      if (state === 'DATA') {
        if (rawLine === '.') {
          state = 'AUTHED';
          processMail(mailFrom, rcptTo, dataBuffer);
          dataBuffer = '';
          socket.write('250 2.0.0 Ok: queued as ' + crypto.randomUUID() + '\r\n');
        } else {
          dataBuffer += rawLine + '\n';
        }
        continue;
      }

      const upper = line.toUpperCase();

      if (upper.startsWith('EHLO') || upper.startsWith('HELO')) {
        state = 'HELO';
        socket.write('250-firebird-mail.default.svc.cluster.local\r\n' +
                     '250-PIPELINING\r\n' +
                     '250-SIZE 10485760\r\n' +
                     '250-AUTH LOGIN PLAIN\r\n' +
                     '250 8BITMIME\r\n');
      } else if (upper === 'AUTH LOGIN') {
        state = 'AUTH_LOGIN_USER';
        socket.write('334 VXNlcm5hbWU6\r\n');
      } else if (state === 'AUTH_LOGIN_USER') {
        authUser = Buffer.from(line, 'base64').toString('utf8').trim();
        state = 'AUTH_LOGIN_PASS';
        socket.write('334 UGFzc3dvcmQ6\r\n');
      } else if (state === 'AUTH_LOGIN_PASS') {
        const pass = Buffer.from(line, 'base64').toString('utf8').trim();
        const userMatched = VALID_USERS.some(u => u.toLowerCase() === authUser.toLowerCase());
        if (userMatched && passMatches(pass)) {
          state = 'AUTHED';
          socket.write('235 2.7.0 Authentication successful\r\n');
        } else {
          socket.write('535 5.7.8 Authentication credentials invalid\r\n');
          state = 'HELO';
        }
      } else if (upper.startsWith('AUTH PLAIN')) {
        let authData = line.substring(10).trim();
        if (authData) {
          const decoded = Buffer.from(authData, 'base64').toString('utf8');
          const parts = decoded.split('\0');
          const user = parts[1] || parts[0];
          const pass = parts[2] || parts[1];
          const userMatched = VALID_USERS.some(u => u.toLowerCase() === user.toLowerCase());
          if (userMatched && passMatches(pass)) {
            state = 'AUTHED';
            socket.write('235 2.7.0 Authentication successful\r\n');
          } else {
            socket.write('535 5.7.8 Authentication credentials invalid\r\n');
          }
        }
      } else if (upper.startsWith('MAIL FROM:')) {
        mailFrom = line.substring(10).trim().replace(/[<>]/g, '');
        rcptTo = [];
        socket.write('250 2.1.0 Ok\r\n');
      } else if (upper.startsWith('RCPT TO:')) {
        rcptTo.push(line.substring(8).trim().replace(/[<>]/g, ''));
        socket.write('250 2.1.5 Ok\r\n');
      } else if (upper === 'DATA') {
        state = 'DATA';
        dataBuffer = '';
        socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
      } else if (upper === 'RSET') {
        state = 'AUTHED';
        mailFrom = '';
        rcptTo = [];
        dataBuffer = '';
        socket.write('250 2.0.0 Ok\r\n');
      } else if (upper === 'NOOP') {
        socket.write('250 2.0.0 Ok\r\n');
      } else if (upper === 'QUIT') {
        socket.write('221 2.0.0 Bye\r\n');
        socket.end();
      } else {
        socket.write('500 5.5.1 Command unrecognized\r\n');
      }
    }
  });

  socket.on('error', () => {});
}

function processMail(from, toList, rawContent) {
  let subject = '';
  const lines = rawContent.split('\n');
  for (const l of lines) {
    if (l.toLowerCase().startsWith('subject:')) {
      subject = l.substring(8).trim();
      break;
    }
  }

  console.log(`\n📧 [新邮件成功接收] 发件人: ${from} | 收件人: ${toList.join(', ')} | 主题: ${subject}`);

  const codeMatch = rawContent.match(/(?:验证码|code|Code)[^\d]{0,10}(\d{4,8})/);
  if (codeMatch) {
    console.log(`   🎯 [验证码提取] ${codeMatch[1]}`);
  }

  if (TG_BOT_TOKEN && TG_CHAT_ID) {
    const text = `📬 *【火鸟系统邮件到达】*\n\n*收件人:* \`${toList.join(', ')}\`\n*发信人:* \`${from}\`\n*主题:* ${escapeMd(subject)}\n${codeMatch ? `\n🔥 *提取验证码:* \`${codeMatch[1]}\`\n` : ''}\n_自建邮件中继处理完成 (250 OK)_`;
    sendTelegram(text);
  }
}

function escapeMd(t) {
  return (t || '').replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1');
}

function sendTelegram(text) {
  const payload = JSON.stringify({
    chat_id: TG_CHAT_ID,
    text: text,
    parse_mode: 'Markdown'
  });
  const req = https.request({
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TG_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  });
  req.on('error', () => {});
  req.write(payload);
  req.end();
}

// 单个端口失败不应拖垮其余端口
const onListenErr = (label) => (err) => {
  console.error(`⚠️  ${label} 监听失败: ${err.message}`);
};

// 1. 监听 587 (Plain text)
const plainServer587 = net.createServer((socket) => handleClient(socket, false));
plainServer587.on('error', onListenErr('587'));
plainServer587.listen(SMTP_PORT_PLAIN, '0.0.0.0', () => {
  console.log(`✅ SMTP Plain 服务就绪: 0.0.0.0:${SMTP_PORT_PLAIN}`);
});

// 2. 监听 25 (Fallback)
const plainServer25 = net.createServer((socket) => handleClient(socket, false));
plainServer25.on('error', onListenErr('25'));
plainServer25.listen(SMTP_PORT_FALLBACK, '0.0.0.0', () => {
  console.log(`✅ SMTP Fallback 服务就绪: 0.0.0.0:${SMTP_PORT_FALLBACK}`);
});

// 3. 监听 465 (SSL)
try {
  const sslOptions = {
    key: fs.readFileSync(TLS_KEY_PATH),
    cert: fs.readFileSync(TLS_CERT_PATH)
  };
  const sslServer = tls.createServer(sslOptions, (socket) => handleClient(socket, true));
  sslServer.listen(SMTP_PORT_SSL, '0.0.0.0', () => {
    console.log(`✅ SMTP SSL 服务就绪: 0.0.0.0:${SMTP_PORT_SSL}`);
  });
} catch(err) {
  console.error('SSL 启动提示:', err.message);
}
