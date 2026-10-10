#!/usr/bin/env bash
# Story 6.3 本地真实环境替身完整一轮(可复现,零外部依赖,仅需 bash/node/curl):
#   采集(TASK-016 同款 RSS 数据面) → 适配层 → 去重 → 发布 → 第二轮零发布 → 预置门户故障 → 有界重试 → Telegram 告警
# 用法: bash services/news-sync/e2e-local.sh <workdir> [port]
# 替身实现随仓库提供: services/news-sync/e2e/mock-portal.js(重置: POST /reset 或重启进程)
# 产出(无任何密钥): <workdir>/{items,round1,round2,fail-round,mock-state}.json 与 full-run.log
set -euo pipefail
OUT="$(mkdir -p "${1:?usage: e2e-local.sh <workdir> [port]}" && cd "$1" && pwd)"
PORT="${2:-18180}"
cd "$(dirname "${BASH_SOURCE[0]}")"
exec > >(tee "$OUT/full-run.log") 2>&1

node e2e/mock-portal.js "$PORT" & MOCK_PID=$!
trap 'kill "$MOCK_PID" 2>/dev/null || true' EXIT
MOCK="http://127.0.0.1:$PORT"
for i in $(seq 1 50); do curl -fsS "$MOCK/health" >/dev/null 2>&1 && break; sleep 0.1; done
curl -fsS -X POST "$MOCK/reset" >/dev/null

export NEWS_PORTAL_PUBLISH_URL="$MOCK/portal/publish"
export NEWS_PORTAL_TOKEN="local-e2e-dummy"
export NEWS_ALERT_API_BASE="$MOCK"
export NEWS_ALERT_BOT_TOKEN="mock"
export NEWS_ALERT_CHAT_ID="1"
export NEWS_SYNC_SEEN_FILE="$OUT/news-seen.json"
rm -f "$NEWS_SYNC_SEEN_FILE"

echo "== 采集(RSS 适配层 src/feed.js) =="
curl -fsS "$MOCK/rss.xml" | node src/feed.js | tee "$OUT/items.json"

echo "== 第 1 轮:应发布 published>=1 =="
node src/cli.js < "$OUT/items.json" | tee "$OUT/round1.json"

echo "== 第 2 轮:同输入应 published=0、duplicates>=1 =="
node src/cli.js < "$OUT/items.json" | tee "$OUT/round2.json"

echo "== 失败轮:门户预置连续失败,新条目应 failed=1 且触发告警 =="
curl -fsS -X POST "$MOCK/portal/fail-next" -H 'Content-Type: application/json' -d '{"count":5}' >/dev/null
echo '[{"title":"failure drill","url":"https://example.test/news/failure-drill","summary":"演练"}]' > "$OUT/fail-item.json"
node src/cli.js < "$OUT/fail-item.json" > "$OUT/fail-round.json" && { echo "期望非零退出"; exit 1; } || true
cat "$OUT/fail-round.json"

curl -fsS "$MOCK/state" > "$OUT/mock-state.json"
node -e '
const fs=require("fs"),d=p=>JSON.parse(fs.readFileSync(p));
const r1=d(process.argv[1]),r2=d(process.argv[2]),fr=d(process.argv[3]),st=d(process.argv[4]);
const ok=(c,m)=>{if(!c){console.error("FAIL: "+m);process.exit(1)}console.log("OK: "+m)};
ok(r1.published>=1&&r1.failed===0,"第1轮发布 "+r1.published+" 条且无失败");
ok(r2.published===0&&r2.duplicates>=1,"第2轮 0 发布、"+r2.duplicates+" 条去重");
ok(fr.failed===1,"失败轮 failed=1(重试耗尽后计失败)");
ok(st.portal.length===r1.published,"门户实收 "+st.portal.length+" 条 = 第1轮发布数(无重复落库)");
ok(st.portalAttempts===r1.published+3,"门户请求数 "+st.portalAttempts+" = 第1轮发布数 + 失败轮 3 次有界重试(第2轮未触达门户)");
ok(st.tg.length>=1,"运营者告警已送达 mock Telegram("+st.tg.length+" 条)");
' "$OUT/round1.json" "$OUT/round2.json" "$OUT/fail-round.json" "$OUT/mock-state.json"
echo "== E2E PASS,证据目录: $OUT =="
