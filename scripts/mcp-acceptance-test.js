#!/usr/bin/env node
/**
 * ==============================================================================
 * 🔥 n8n MCP Server 协议验证与 4 核心工作流验收自动化测试套件
 * 服务端点: https://n8n.k8shome.com/mcp-server/http
 * 鉴权协议: Model Context Protocol (Streamable HTTP / SSE) Bearer Token
 * ==============================================================================
 */

const https = require('https');

const MCP_ENDPOINT = 'https://n8n.k8shome.com/mcp-server/http';
const MCP_API_KEY = process.env.N8N_MCP_API_KEY;
if (!MCP_API_KEY) {
  console.error('[mcp-acceptance-test] 缺少环境变量 N8N_MCP_API_KEY。');
  process.exit(1);
}

const EXPECTED_WORKFLOWS = [
  { id: 'WkFtg2gh00000002', name: '一人AI团队：TG语音随笔转GitHub-Issue与Project看板' },
  { id: 'WkFtg2gh00000003', name: '一人AI团队：USDT入账与对账超时告警' },
  { id: 'WkFtg2gh00000004', name: '一人AI团队：Sentry异常告警经AI根因提炼推送TG' },
  { id: 'WkFtg2gh00000005', name: '一人AI团队：TG语音与随笔自动提炼TaskSpec' }
];

let requestIdCounter = 1;

function callMcp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = requestIdCounter++;
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params
    });

    const url = new URL(MCP_ENDPOINT);
    const options = {
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
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let buffer = '';

      res.on('data', (chunk) => {
        buffer += chunk.toString();
        // 尝试从累积的 buffer 中解析出 data: 后的完整 JSON
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJson = line.substring(6).trim();
            if (rawJson.startsWith('{') && rawJson.endsWith('}')) {
              try {
                const parsed = JSON.parse(rawJson);
                req.destroy();
                return resolve(parsed);
              } catch (e) {
                // JSON 尚不完整，继续等待下一个 chunk
              }
            }
          }
        }
      });

      res.on('end', () => {
        // 如果连接正常结束但未在 on('data') 中触发
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              return resolve(JSON.parse(line.substring(6).trim()));
            } catch (e) {}
          }
        }
        try {
          resolve(JSON.parse(buffer));
        } catch (e) {
          resolve({ raw: buffer });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.write(payload);
    req.end();
  });
}

async function runAcceptance() {
  console.log('======================================================================');
  console.log('🚀 [MCP 验收] 开始探测 n8n MCP Server 协议及 4 核心工作流...');
  console.log(`📍 端点: ${MCP_ENDPOINT}`);
  console.log('======================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`   ✅ PASS [${total}]: ${message}`);
      passed++;
    } else {
      console.log(`   ❌ FAIL [${total}]: ${message}`);
    }
  }

  // 1. 初始化握手
  console.log('📌 [第 1 阶段: 协议初始化握手]');
  try {
    const initRes = await callMcp('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'hermes-acceptance-runner', version: '2.0.0' }
    });

    assert(initRes && initRes.result, 'MCP JSON-RPC initialize 响应有效');
    assert(initRes.result?.serverInfo?.name === 'n8n MCP Server', `服务端标识正确: ${initRes.result?.serverInfo?.name}`);
    assert(initRes.result?.protocolVersion === '2024-11-05', `协议版本协商正确: ${initRes.result?.protocolVersion}`);
  } catch (e) {
    assert(false, `握手失败: ${e.message}`);
  }

  // 2. 工具列表发现
  console.log('\n📌 [第 2 阶段: MCP 工具注册与发现]');
  let tools = [];
  try {
    const toolsRes = await callMcp('tools/list', {});
    tools = toolsRes.result?.tools || [];
    const toolNames = tools.map(t => t.name);
    console.log(`   🛠️  已发现工具: ${toolNames.join(', ')}`);
    assert(toolNames.includes('search_workflows'), '包含 search_workflows 工具');
    assert(toolNames.includes('get_workflow_details'), '包含 get_workflow_details 工具');
    assert(toolNames.includes('execute_workflow'), '包含 execute_workflow 工具');
  } catch (e) {
    assert(false, `发现工具失败: ${e.message}`);
  }

  // 3. 搜索工作流并验证 4 核心流程全部就绪
  console.log('\n📌 [第 3 阶段: 4 核心工作流注册与活跃度验证]');
  let foundWorkflows = [];
  try {
    const searchRes = await callMcp('tools/call', {
      name: 'search_workflows',
      arguments: { limit: 20 }
    });
    const parsedData = JSON.parse(searchRes.result?.content?.[0]?.text || '{}');
    foundWorkflows = parsedData.data || [];
    console.log(`   📋 线上活跃且对 MCP 可见工作流总数: ${foundWorkflows.length}`);

    for (const expected of EXPECTED_WORKFLOWS) {
      const match = foundWorkflows.find(w => w.id === expected.id);
      if (match) {
        assert(match.active === true, `工作流 [${expected.id}] 在线且状态为 active:true (${match.name})`);
        assert(match.nodes && match.nodes.length > 0, `工作流 [${expected.id}] 节点数就绪: ${match.nodes.length} 个节点`);
      } else {
        assert(false, `未能检索到工作流 [${expected.id}] (${expected.name})`);
      }
    }
  } catch (e) {
    assert(false, `检索工作流失败: ${e.message}`);
  }

  // 4. 工作流详情与 Trigger 验收
  console.log('\n📌 [第 4 阶段: 工作流节点链路与 Trigger 详情验收]');
  for (const wf of EXPECTED_WORKFLOWS) {
    try {
      const detailRes = await callMcp('tools/call', {
        name: 'get_workflow_details',
        arguments: { workflowId: wf.id }
      });
      const parsed = JSON.parse(detailRes.result?.content?.[0]?.text || '{}');
      const workflow = parsed.workflow;
      assert(workflow && workflow.id === wf.id, `工作流详情加载成功: ${wf.name}`);
      assert(workflow.settings?.availableInMCP === true, `工作流 ${wf.id} availableInMCP 标志开启`);
    } catch (e) {
      assert(false, `获取详情失败 [${wf.id}]: ${e.message}`);
    }
  }

  // 5. 执行通路验证 (execute_workflow)
  console.log('\n📌 [第 5 阶段: MCP 执行引擎通路端到端运行验证]');
  try {
    const execRes = await callMcp('tools/call', {
      name: 'execute_workflow',
      arguments: {
        workflowId: 'WkFtg2gh00000003',
        inputs: {
          type: 'webhook',
          webhookData: {
            method: 'POST',
            body: {
              status: 'PAID',
              order_id: 'MCP-ACCEPT-TEST-001',
              amount_usdt: '150.00',
              tx_hash: 'tronscan-mcp-verified-tx',
              service_name: 'Firebird-SEA'
            }
          }
        }
      }
    });
    const parsed = JSON.parse(execRes.result?.content?.[0]?.text || '{}');
    const hasExecutionId = !!parsed.executionId;
    const isSuccessOrHasResult = !!parsed.result;
    assert(hasExecutionId, `MCP 成功触发工作流引擎并生成 Execution ID: ${parsed.executionId}`);
    assert(isSuccessOrHasResult, '工作流节点链路成功消费 Webhook 输入并完成前置计算判断');
  } catch (e) {
    assert(false, `执行通路调用失败: ${e.message}`);
  }

  console.log('\n======================================================================');
  console.log(`📊 验收总结: ${passed}/${total} 项检查全部通过！通过率: ${(passed / total * 100).toFixed(1)}%`);
  if (passed === total) {
    console.log('🏆 验收结论: 【ACCEPTANCE PASSED】n8n MCP Server 与 4 大工作流完全就绪！');
  } else {
    console.log('⚠️ 验收结论: 存在未通过项目，请查阅上方日志。');
  }
  console.log('======================================================================\n');
}

runAcceptance().catch(err => {
  console.error('Fatal error during acceptance:', err);
  process.exit(1);
});
