const net = require('net');
const tls = require('tls');
const https = require('https');
const crypto = require('crypto');

const SMTP_PORT_PLAIN = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_PORT_SSL = parseInt(process.env.SMTP_SSL_PORT || '465', 10);
const VALID_USERS = (process.env.SMTP_USERS || 'firebird,noreply@fbird.men').split(',');
const VALID_PASS = process.env.SMTP_PASS || 'FbirdMail2026!';
const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';

console.log('🚀 [Firebird Mail] 启动自建云原生邮件服务...');
console.log(`   监听端口: ${SMTP_PORT_PLAIN} (Plain/STARTTLS), ${SMTP_PORT_SSL} (SSL)`);
console.log(`   认证用户: ${VALID_USERS.join(', ')}`);

function handleClient(socket, isTls = false) {
  let state = 'INIT'; // INIT -> EHLO -> AUTH_LOGIN_USER -> AUTH_LOGIN_PASS -> AUTHED -> MAIL -> RCPT -> DATA
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
    lineBuffer = lines.pop(); // 保留未完成的一行

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line && state !== 'DATA') continue;

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
        socket.write('334 VXNlcm5hbWU6\r\n'); // "Username:" in base64
      } else if (state === 'AUTH_LOGIN_USER') {
        authUser = Buffer.from(line, 'base64').toString('utf8').trim();
        state = 'AUTH_LOGIN_PASS';
        socket.write('334 UGFzc3dvcmQ6\r\n'); // "Password:" in base64
      } else if (state === 'AUTH_LOGIN_PASS') {
        const pass = Buffer.from(line, 'base64').toString('utf8').trim();
        const userMatched = VALID_USERS.some(u => u.toLowerCase() === authUser.toLowerCase());
        if (userMatched && (pass === VALID_PASS || !VALID_PASS)) {
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
          if (userMatched && (pass === VALID_PASS || !VALID_PASS)) {
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

  socket.on('error', (err) => {
    // 客户端关闭连接
  });
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

  console.log(`\n📧 [新邮件到达] 来自: ${from} -> 收件人: ${toList.join(', ')}`);
  console.log(`   主题: ${subject}`);

  // 尝试提取验证码
  const codeMatch = rawContent.match(/(?:验证码|code|Code)[^\d]{0,10}(\d{4,8})/);
  if (codeMatch) {
    console.log(`   🎯 提取到验证码: [${codeMatch[1]}]`);
  }

  // 转发至 Telegram
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

// 启动 Plain 端口 (587 & 25)
const plainServer = net.createServer((socket) => handleClient(socket, false));
plainServer.listen(SMTP_PORT_PLAIN, '0.0.0.0', () => {
  console.log(`✅ SMTP Plain 服务就绪: 0.0.0.0:${SMTP_PORT_PLAIN}`);
});

// 生成自签名证书供 465 SSL 使用
try {
  const certForge = require('crypto');
  // 如果有自签名证书环境
} catch(e) {}
