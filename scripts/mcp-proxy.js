#!/usr/bin/env node
/**
 * ==============================================================================
 * 🔥 n8n MCP Server 本地 Stdio ➔ 远端 Streamable HTTP 协议双向桥接器
 * 目标端点: https://n8n.k8shome.com/mcp-server/http
 * 适用于: Antigravity IDE, Claude Desktop, Cursor, VSCode Roo Code 等 Stdio 客户端
 * ==============================================================================
 */

const https = require('https');
const readline = require('readline');

const MCP_ENDPOINT = process.env.N8N_MCP_ENDPOINT || 'https://n8n.k8shome.com/mcp-server/http';
const MCP_API_KEY = process.env.N8N_MCP_API_KEY;
if (!MCP_API_KEY) {
  console.error('[mcp-proxy] 缺少环境变量 N8N_MCP_API_KEY。请在未被 git 跟踪的本地文件中提供（参考 mcp_config.example.json），不要写回仓库。');
  process.exit(1);
}

const url = new URL(MCP_ENDPOINT);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const payload = JSON.stringify(JSON.parse(trimmed));
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MCP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000
    }, (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        for (const l of lines) {
          if (l.startsWith('data: ')) {
            const rawJson = l.substring(6).trim();
            if (rawJson.startsWith('{') && rawJson.endsWith('}')) {
              try {
                JSON.parse(rawJson);
                process.stdout.write(rawJson + '\n');
                req.destroy();
                return;
              } catch (e) {}
            }
          }
        }
      });

      res.on('end', () => {
        if (buffer && !res.destroyed) {
          const lines = buffer.split('\n');
          for (const l of lines) {
            if (l.startsWith('data: ')) {
              process.stdout.write(l.substring(6).trim() + '\n');
              return;
            }
          }
          process.stdout.write(buffer.trim() + '\n');
        }
      });
    });

    req.on('error', (err) => {
      process.stderr.write(`[n8n-mcp-bridge] error: ${err.message}\n`);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    process.stderr.write(`[n8n-mcp-bridge] invalid json input: ${err.message}\n`);
  }
});
